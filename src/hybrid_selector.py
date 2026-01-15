# ============================================================================
# Hybrid Element Selector - Rule-Based Only (ML Removed)
# ============================================================================
# High accuracy element selection for web automation using text matching
# ============================================================================

import re
from typing import List, Dict, Tuple, Optional
from fuzzywuzzy import fuzz, process

# ============================================================================
# CONFIGURATION
# ============================================================================

class Config:
    max_elements = 50
    exact_match_threshold = 90  # Fuzzy match score for high confidence
    partial_match_threshold = 70  # Minimum score to consider

config = Config()


# ============================================================================
# TEXT PROCESSING
# ============================================================================

def extract_keywords(instruction: str) -> List[str]:
    """
    Extract meaningful keywords from instruction.
    Remove stop words and common verbs.
    """
    # Common action words to remove
    stop_words = {
        'click', 'press', 'tap', 'select', 'choose', 'open', 'close',
        'the', 'a', 'an', 'on', 'to', 'of', 'in', 'for', 'at', 'by',
        'navigate', 'go', 'view', 'see', 'show', 'display'
    }
    
    # Convert to lowercase and split
    words = instruction.lower().split()
    
    # Remove stop words and short words
    keywords = [w for w in words if w not in stop_words and len(w) > 2]
    
    # Also keep original phrases
    phrases = []
    if len(keywords) >= 2:
        phrases.append(' '.join(keywords[:2]))  # First two keywords as phrase
    
    return keywords + phrases

def normalize_text(text: str) -> str:
    """Normalize text for comparison"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    text = re.sub(r'\s+', ' ', text)  # Normalize whitespace
    return text

# ============================================================================
# RULE-BASED MATCHING
# ============================================================================

def compute_text_match_score(instruction: str, element_text: str) -> float:
    """
    Compute text matching score between instruction and element.
    Returns score 0-100.
    """
    if not element_text or not element_text.strip():
        return 0.0
    
    # Normalize
    inst_norm = normalize_text(instruction)
    elem_norm = normalize_text(element_text)
    
    # Extract keywords
    keywords = extract_keywords(instruction)
    
    scores = []
    
    # 1. Exact substring match (highest priority)
    for kw in keywords:
        if kw in elem_norm:
            scores.append(100)
    
    # 2. Fuzzy match for each keyword
    for kw in keywords:
        ratio = fuzz.partial_ratio(kw, elem_norm)
        scores.append(ratio)
    
    # 3. Full instruction fuzzy match
    full_ratio = fuzz.token_set_ratio(inst_norm, elem_norm)
    scores.append(full_ratio)
    
    # Return best score
    return max(scores) if scores else 0.0

def rule_based_selection(
    instruction: str,
    elements: List[Dict],
    confidence_threshold: float = 90
) -> Tuple[Optional[int], float, str]:
    """
    Select element using rule-based text matching.
    
    Returns:
        (element_index, confidence_score, reason)
        Returns (None, 0, reason) if no confident match
    """
    if not elements:
        return None, 0.0, "No elements provided"
    
    # Score each element
    scores = []
    for i, elem in enumerate(elements):
        text = elem.get('text', '')
        score = compute_text_match_score(instruction, text)
        scores.append((i, score, text))
    
    # Sort by score
    scores.sort(key=lambda x: x[1], reverse=True)
    
    best_idx, best_score, best_text = scores[0]
    
    # Check if confident enough
    if best_score >= confidence_threshold:
        return best_idx, best_score, f"High confidence text match: '{best_text}' (score={best_score:.1f})"
    elif best_score >= config.partial_match_threshold:
        return best_idx, best_score, f"Partial text match: '{best_text}' (score={best_score:.1f})"
    else:
        return None, best_score, f"No confident match (best score={best_score:.1f})"

# ============================================================================
# HYBRID SELECTOR - RULE-BASED ONLY
# ============================================================================

class HybridElementSelector:
    def __init__(self, config):
        self.config = config
        print("✓ Rule-based element selector initialized")
    
    def select(
        self,
        instruction: str,
        elements: List[Dict],
        verbose: bool = True
    ) -> Dict:
        """
        Select best element using rule-based text matching.
        
        Returns:
            {
                'element_idx': int,
                'element': dict,
                'bbox': [x1, y1, x2, y2],
                'method': 'rule_based',
                'confidence': float,
                'reason': str
            }
        """
        if verbose:
            print(f"\n{'='*60}")
            print(f"Instruction: {instruction}")
            print(f"Elements: {len(elements)}")
        
        # Rule-based selection
        rule_idx, rule_score, rule_reason = rule_based_selection(
            instruction, elements, config.exact_match_threshold
        )
        
        if rule_idx is not None:
            result = {
                'element_idx': rule_idx,
                'element': elements[rule_idx],
                'bbox': elements[rule_idx]['bbox'],
                'text': elements[rule_idx]['text'],
                'method': 'rule_based',
                'confidence': rule_score,
                'reason': rule_reason
            }
            
            if verbose:
                print(f"✓ Rule-based selection: Element #{rule_idx}")
                print(f"  Text: {elements[rule_idx]['text']}")
                print(f"  Confidence: {rule_score:.1f}%")
                print(f"  Reason: {rule_reason}")
            
            return result
        
        # Failed
        return {
            'element_idx': None,
            'element': None,
            'bbox': None,
            'text': None,
            'method': 'failed',
            'confidence': 0.0,
            'reason': 'No matching element found'
        }

# ============================================================================
# USAGE EXAMPLE
# ============================================================================

def demo():
    """Demo with real examples"""
    
    # Initialize selector
    print("\n🚀 Initializing Rule-Based Element Selector...")
    selector = HybridElementSelector(config)
    
    # Example 1: Clear text match
    print("\n" + "="*60)
    print("EXAMPLE 1: Simple text match")
    print("="*60)
    
    elements = [
        {'text': 'Home', 'bbox': [0.1, 0.1, 0.2, 0.15]},
        {'text': 'Login', 'bbox': [0.8, 0.1, 0.9, 0.15]},
        {'text': 'Sign Up', 'bbox': [0.7, 0.1, 0.79, 0.15]},
    ]
    
    instruction = "Click the login button"
    result = selector.select(instruction, elements, verbose=True)
    
    # Example 2: Fuzzy match
    print("\n" + "="*60)
    print("EXAMPLE 2: Fuzzy text match")
    print("="*60)
    
    elements = [
        {'text': 'Submit Form', 'bbox': [0.4, 0.8, 0.6, 0.85]},
        {'text': 'Cancel', 'bbox': [0.3, 0.8, 0.39, 0.85]},
        {'text': 'Reset', 'bbox': [0.61, 0.8, 0.7, 0.85]},
    ]
    
    instruction = "Submit the form"
    result = selector.select(instruction, elements, verbose=True)

if __name__ == "__main__":
    demo()
