import os
import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel
from dataclasses import dataclass, asdict
import warnings
warnings.filterwarnings('ignore')
os.environ['TRANSFORMERS_OFFLINE'] = '0'  # Allow online access
os.environ['HF_HUB_OFFLINE'] = '0'


# ============================================================================
# Configuration (must match training config)
# ============================================================================

@dataclass
class ElementFocusedConfig:
    encoder_model: str = r"D:\Neuro Final\WebAgent\distilbert-base-uncased"
    hidden_size: int = 768
    fusion_hidden_size: int = 384
    num_fusion_layers: int = 2
    max_task_length: int = 128
    max_content_length: int = 512
    max_page_text_length: int = 256
    num_element_candidates: int = 20
    dropout: float = 0.4
    max_value_length: int = 64
    vocab_size: int = 30522
    freeze_encoders: bool = True

# ============================================================================
# Model Architecture (must match training)
# ============================================================================

class ContrastiveFusion(torch.nn.Module):
    def __init__(self, hidden_size, dropout=0.4):
        super().__init__()
        self.cross_attn = torch.nn.MultiheadAttention(
            hidden_size, num_heads=8, dropout=dropout, batch_first=True
        )
        self.self_attn = torch.nn.MultiheadAttention(
            hidden_size, num_heads=8, dropout=dropout, batch_first=True
        )
        self.norm1 = torch.nn.LayerNorm(hidden_size)
        self.norm2 = torch.nn.LayerNorm(hidden_size)
        self.dropout = torch.nn.Dropout(dropout)
        
        self.ffn = torch.nn.Sequential(
            torch.nn.Linear(hidden_size, hidden_size * 2),
            torch.nn.GELU(),
            torch.nn.Dropout(dropout),
            torch.nn.Linear(hidden_size * 2, hidden_size),
            torch.nn.Dropout(dropout)
        )
        self.norm3 = torch.nn.LayerNorm(hidden_size)

    def forward(self, query, key_value, key_mask=None):
        attn_out, _ = self.cross_attn(query, key_value, key_value, key_padding_mask=key_mask)
        query = self.norm1(query + self.dropout(attn_out))
        
        self_out, _ = self.self_attn(query, query, query)
        query = self.norm2(query + self.dropout(self_out))
        
        ffn_out = self.ffn(query)
        query = self.norm3(query + ffn_out)
        
        return query


class ElementFocusedModel(torch.nn.Module):
    def __init__(self, config: ElementFocusedConfig):
        super().__init__()
        self.config = config

        self.encoder = AutoModel.from_pretrained(config.encoder_model)
        
        if config.freeze_encoders:
            for param in self.encoder.parameters():
                param.requires_grad = False

        self.proj = torch.nn.Sequential(
            torch.nn.Linear(config.hidden_size, config.fusion_hidden_size),
            torch.nn.LayerNorm(config.fusion_hidden_size),
            torch.nn.GELU(),
            torch.nn.Dropout(config.dropout)
        )

        self.fusion_layers = torch.nn.ModuleList([
            ContrastiveFusion(config.fusion_hidden_size, dropout=config.dropout)
            for _ in range(config.num_fusion_layers)
        ])

        self.element_head = torch.nn.Sequential(
            torch.nn.Dropout(config.dropout),
            torch.nn.Linear(config.fusion_hidden_size, 256),
            torch.nn.LayerNorm(256),
            torch.nn.GELU(),
            torch.nn.Dropout(config.dropout * 0.5),
            torch.nn.Linear(256, 128),
            torch.nn.LayerNorm(128),
            torch.nn.GELU(),
            torch.nn.Dropout(config.dropout * 0.3),
            torch.nn.Linear(128, config.num_element_candidates)
        )

        self.value_head = torch.nn.Sequential(
            torch.nn.Dropout(config.dropout),
            torch.nn.Linear(config.fusion_hidden_size, 512),
            torch.nn.LayerNorm(512),
            torch.nn.GELU(),
            torch.nn.Dropout(config.dropout * 0.5),
            torch.nn.Linear(512, config.vocab_size)
        )

        self.ranking_head = torch.nn.Sequential(
            torch.nn.Dropout(config.dropout),
            torch.nn.Linear(config.fusion_hidden_size, 128),
            torch.nn.LayerNorm(128),
            torch.nn.GELU(),
            torch.nn.Dropout(config.dropout * 0.5),
            torch.nn.Linear(128, config.num_element_candidates)
        )

    def forward(self, task_input_ids, task_attention_mask, 
                content_input_ids, content_attention_mask, **kwargs):

        if self.config.freeze_encoders:
            self.encoder.eval()
            with torch.no_grad():
                task_out = self.encoder(task_input_ids, task_attention_mask)
                content_out = self.encoder(content_input_ids, content_attention_mask)
        else:
            task_out = self.encoder(task_input_ids, task_attention_mask)
            content_out = self.encoder(content_input_ids, content_attention_mask)

        task_hidden = self.proj(task_out.last_hidden_state)
        content_hidden = self.proj(content_out.last_hidden_state)

        fused = task_hidden
        content_key_mask = ~content_attention_mask.bool()
        
        for fusion_layer in self.fusion_layers:
            fused = fusion_layer(fused, content_hidden, content_key_mask)

        mask = task_attention_mask.unsqueeze(-1).float()
        pooled = (fused * mask).sum(1) / task_attention_mask.sum(1, keepdim=True).clamp(min=1e-9)

        element_logits = self.element_head(pooled)
        value_logits = self.value_head(pooled)
        ranking_logits = self.ranking_head(pooled)

        return {
            'element_logits': element_logits,
            'value_logits': value_logits,
            'ranking_logits': ranking_logits,
        }

# ============================================================================
# Load Model from Drive
# ============================================================================

def load_model_from_drive(drive_path=r'D:\Neuro Final\WebAgent\ElementFocused'):
    """Load model and tokenizer"""
    print("🔄 Loading model...")
    
    # Check if model weights exist
    model_path = os.path.join(drive_path, 'element_focused_model.pt')
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at {model_path}")
    
    print(f"✓ Found model at {model_path}")
    
    # Load tokenizer (will download and cache on first run)
    print("📚 Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
    
    # Initialize model
    print("🏗️ Initializing model architecture...")
    config = ElementFocusedConfig()
    # Keep the default encoder_model = "distilbert-base-uncased"
    
    model = ElementFocusedModel(config)
    
    # Load your trained weights
    print("⚙️ Loading model weights...")
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    state_dict = torch.load(model_path, map_location=device, weights_only=True)
    model.load_state_dict(state_dict)
    model.to(device)
    model.eval()
    
    print(f"✅ Model loaded successfully on {device}!")
    
    return model, tokenizer, device, config
# ============================================================================
# Test Functions
# ============================================================================

def create_sample_test_case():
    """Create a sample test case with task and elements"""
    
    # Sample task
    task = "Find and click the search button"
    page_summary = "Google Search Homepage"
    prev_actions = "None"
    
    # Sample interactive elements on the page
    elements = [
        {'idx': 0, 'type': 'input', 'purpose': 'search', 'text': 'Search input field'},
        {'idx': 1, 'type': 'button', 'purpose': 'button', 'text': "I'm Feeling Lucky"},
        {'idx': 2, 'type': 'a', 'purpose': 'link', 'text': 'Gmail'},
        {'idx': 3, 'type': 'a', 'purpose': 'link', 'text': 'Images'},
        {'idx': 4, 'type': 'button', 'purpose': 'button', 'text': 'Sign in'},
    ]
    
    return task, page_summary, prev_actions, elements, 0  # Target is element 1


def prepare_input(task, page_summary, prev_actions, elements, tokenizer, config, device):
    """Prepare input for the model"""
    
    # Format task text
    task_text = f"Task: {task} | Current page: {page_summary} | History: {prev_actions}"
    
    # Format elements
    content_descriptions = []
    for elem in elements[:config.num_element_candidates]:
        desc = f"[{elem['idx']}] {elem['type']} ({elem['purpose']}): {elem['text']}"
        content_descriptions.append(desc)
    
    content_text = " | ".join(content_descriptions)
    
    # Tokenize
    task_encoding = tokenizer(
        task_text,
        max_length=config.max_task_length,
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )
    
    content_encoding = tokenizer(
        content_text,
        max_length=config.max_content_length,
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )
    
    # Move to device
    return {
        'task_input_ids': task_encoding['input_ids'].to(device),
        'task_attention_mask': task_encoding['attention_mask'].to(device),
        'content_input_ids': content_encoding['input_ids'].to(device),
        'content_attention_mask': content_encoding['attention_mask'].to(device),
    }


def test_model(model, tokenizer, device, config):
    """Run inference on sample test case"""
    
    print("\n" + "="*70)
    print("🧪 TESTING MODEL")
    print("="*70)
    
    # Create test case
    task, page_summary, prev_actions, elements, target_idx = create_sample_test_case()
    
    print(f"\n📋 Test Case:")
    print(f"   Task: {task}")
    print(f"   Page: {page_summary}")
    print(f"   Previous actions: {prev_actions}")
    print(f"\n🎯 Target element: [{target_idx}] {elements[target_idx]['text']}")
    
    print(f"\n📝 Available elements:")
    for elem in elements:
        marker = "👉" if elem['idx'] == target_idx else "  "
        print(f"   {marker} [{elem['idx']}] {elem['type']:8} | {elem['purpose']:10} | {elem['text']}")
    
    # Prepare input
    inputs = prepare_input(task, page_summary, prev_actions, elements, tokenizer, config, device)
    
    # Run inference
    print(f"\n🔮 Running inference...")
    with torch.no_grad():
        outputs = model(**inputs)
    
    # Get predictions
    element_logits = outputs['element_logits'][0]  # Remove batch dim
    element_probs = F.softmax(element_logits, dim=0)
    
    # Get top-3 predictions
    top_k = 3
    top_probs, top_indices = torch.topk(element_probs, k=min(top_k, len(elements)))
    
    print(f"\n📊 Model Predictions (Top-{top_k}):")
    print(f"   {'Rank':<6} {'Element':<40} {'Confidence':>12}")
    print(f"   {'-'*60}")
    
    for rank, (prob, idx) in enumerate(zip(top_probs, top_indices), 1):
        idx = idx.item()
        prob = prob.item()
        elem = elements[idx] if idx < len(elements) else {'text': 'N/A'}
        is_correct = "✅" if idx == target_idx else "  "
        print(f"   {rank}. {is_correct} [{idx}] {elem['text'][:30]:<30} {prob*100:>8.2f}%")
    
    # Check accuracy
    predicted_idx = top_indices[0].item()
    is_correct = predicted_idx == target_idx
    is_top3 = target_idx in top_indices.tolist()
    
    print(f"\n{'='*70}")
    print(f"📈 Results:")
    print(f"   Predicted: [{predicted_idx}] {elements[predicted_idx]['text']}")
    print(f"   Target:    [{target_idx}] {elements[target_idx]['text']}")
    print(f"   Top-1 Accuracy: {'✅ CORRECT' if is_correct else '❌ WRONG'}")
    print(f"   Top-3 Accuracy: {'✅ CORRECT' if is_top3 else '❌ WRONG'}")
    print(f"{'='*70}\n")
    
    return is_correct, is_top3


def test_multiple_scenarios(model, tokenizer, device, config):
    """Test on multiple scenarios"""
    
    scenarios = [
        {
            'task': "Search for python tutorials",
            'page': "Search Engine",
            'history': "None",
            'elements': [
                {'idx': 0, 'type': 'input', 'purpose': 'search', 'text': 'Search box'},
                {'idx': 2, 'type': 'a', 'purpose': 'link', 'text': 'Advanced Search'},
            ],
            'target': 0  # Should focus on input first
        },
        {
            'task': "Submit the login form",
            'page': "Login Page",
            'history': "Typed username | Typed password",
            'elements': [
                {'idx': 0, 'type': 'input', 'purpose': 'input', 'text': 'Username'},
                {'idx': 1, 'type': 'input', 'purpose': 'input', 'text': 'Password'},
                {'idx': 2, 'type': 'button', 'purpose': 'submit', 'text': 'Login'},
                {'idx': 3, 'type': 'a', 'purpose': 'link', 'text': 'Forgot password?'},
            ],
            'target': 2  # Submit button
        },
        {
            'task': "Navigate to the homepage",
            'page': "Product Page",
            'history': "Viewed product details",
            'elements': [
                {'idx': 0, 'type': 'a', 'purpose': 'link', 'text': 'Home'},
                {'idx': 1, 'type': 'button', 'purpose': 'button', 'text': 'Add to Cart'},
                {'idx': 2, 'type': 'button', 'purpose': 'button', 'text': 'Buy Now'},
            ],
            'target': 0  # Home link
        }
    ]
    
    print("\n" + "="*70)
    print("🧪 TESTING MULTIPLE SCENARIOS")
    print("="*70)
    
    correct_count = 0
    top3_count = 0
    
    for i, scenario in enumerate(scenarios, 1):
        print(f"\n{'─'*70}")
        print(f"Test {i}/{len(scenarios)}: {scenario['task']}")
        print(f"{'─'*70}")
        
        inputs = prepare_input(
            scenario['task'], 
            scenario['page'], 
            scenario['history'],
            scenario['elements'],
            tokenizer, 
            config, 
            device
        )
        
        with torch.no_grad():
            outputs = model(**inputs)
        
        element_probs = F.softmax(outputs['element_logits'][0], dim=0)
        top_probs, top_indices = torch.topk(element_probs, k=3)
        
        predicted = top_indices[0].item()
        target = scenario['target']
        
        is_correct = predicted == target
        is_top3 = target in top_indices.tolist()
        
        if is_correct:
            correct_count += 1
        if is_top3:
            top3_count += 1
        
        print(f"Target:    [{target}] {scenario['elements'][target]['text']}")
        print(f"Predicted: [{predicted}] {scenario['elements'][predicted]['text']}")
        print(f"Result:    {'✅ CORRECT' if is_correct else '❌ WRONG'} (Top-3: {'✅' if is_top3 else '❌'})")
        print(f"Top 3: {[(idx.item(), f'{prob.item()*100:.1f}%') for idx, prob in zip(top_indices, top_probs)]}")
    
    print(f"\n{'='*70}")
    print(f"📊 OVERALL RESULTS")
    print(f"{'='*70}")
    print(f"Top-1 Accuracy: {correct_count}/{len(scenarios)} ({correct_count/len(scenarios)*100:.1f}%)")
    print(f"Top-3 Accuracy: {top3_count}/{len(scenarios)} ({top3_count/len(scenarios)*100:.1f}%)")
    print(f"{'='*70}\n")


# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    # Load model
    model, tokenizer, device, config = load_model_from_drive()
    
    # Run tests
    test_model(model, tokenizer, device, config)
    test_multiple_scenarios(model, tokenizer, device, config)
    
    print("✨ Testing complete!")