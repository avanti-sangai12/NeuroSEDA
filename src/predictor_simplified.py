"""
Simplified Next-Element Predictor
Predicts next element based on history, proximity, and context
"""

from typing import List, Dict, Optional, Tuple
from collections import defaultdict, Counter
from datetime import datetime
import re


def normalize_text(text: str) -> str:
    """Normalize text for comparison"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text


class ActionHistory:
    """Track user action sequences"""
    def __init__(self, max_history=50):
        self.actions = []
        self.max_history = max_history
        self.action_sequences = defaultdict(list)
    
    def add_action(self, element_text: str, element_idx: int, bbox: List, action_type: str = 'click'):
        """Record a user action"""
        action = {
            'time': datetime.now().isoformat(),
            'text': element_text,
            'idx': element_idx,
            'bbox': bbox,
            'type': action_type
        }
        self.actions.append(action)
        
        if len(self.actions) > self.max_history:
            self.actions.pop(0)
        
        if len(self.actions) >= 2:
            prev_action = self.actions[-2]
            norm_prev = normalize_text(prev_action['text'])
            self.action_sequences[norm_prev].append(normalize_text(element_text))
    
    def get_likely_next_actions(self, current_element_text: str, top_k: int = 3) -> List[Tuple[str, float]]:
        """Get likely next actions based on history"""
        norm_text = normalize_text(current_element_text)
        
        if norm_text not in self.action_sequences:
            return []
        
        next_actions = self.action_sequences[norm_text]
        counter = Counter(next_actions)
        total = len(next_actions)
        
        results = []
        for action, count in counter.most_common(top_k):
            confidence = (count / total) * 100
            results.append((action, confidence))
        
        return results
    
    def to_dict(self) -> Dict:
        """Serialize for storage"""
        return {
            'actions': self.actions[-10:],
            'sequences': {k: list(Counter(v).most_common(5)) for k, v in self.action_sequences.items()}
        }


class ElementRelationshipAnalyzer:
    """Analyze relationships between elements"""
    
    @staticmethod
    def compute_spatial_proximity(bbox1: List, bbox2: List) -> float:
        """Compute distance between two bounding boxes"""
        x1_1, y1_1, x2_1, y2_1 = bbox1
        x1_2, y1_2, x2_2, y2_2 = bbox2
        
        cx1, cy1 = (x1_1 + x2_1) / 2, (y1_1 + y2_1) / 2
        cx2, cy2 = (x1_2 + x2_2) / 2, (y1_2 + y2_2) / 2
        
        distance = ((cx1 - cx2) ** 2 + (cy1 - cy2) ** 2) ** 0.5
        return distance
    
    @staticmethod
    def find_related_elements(reference_element: Dict, all_elements: List[Dict], max_related: int = 3) -> List[Dict]:
        """Find elements spatially related to reference element"""
        ref_bbox = reference_element.get('bbox', [0, 0, 1, 1])
        
        related = []
        for elem in all_elements:
            if elem.get('idx') == reference_element.get('idx'):
                continue
            
            distance = ElementRelationshipAnalyzer.compute_spatial_proximity(
                ref_bbox, elem.get('bbox', [0, 0, 1, 1])
            )
            
            if distance < 0.3:
                related.append((elem, distance))
        
        related.sort(key=lambda x: x[1])
        return [elem for elem, _ in related[:max_related]]


class NextElementPredictor:
    """Predict next element and action"""
    
    def __init__(self):
        self.history = ActionHistory()
        self.analyzer = ElementRelationshipAnalyzer()
    
    def predict_next_element(
        self,
        current_element: Dict,
        all_elements: List[Dict],
        context_instruction: Optional[str] = None,
        use_history: bool = True,
        use_proximity: bool = True
    ) -> List[Dict]:
        """Predict next element(s) to interact with"""
        
        predictions = []
        scores = defaultdict(lambda: {'confidence': 0, 'reasons': []})
        
        # 1. History-based prediction
        if use_history and current_element.get('text'):
            history_predictions = self.history.get_likely_next_actions(
                current_element['text'], top_k=3
            )
            
            for next_text, confidence in history_predictions:
                for elem in all_elements:
                    if normalize_text(elem.get('text', '')) == next_text:
                        elem_id = id(elem)
                        scores[elem_id]['confidence'] = max(
                            scores[elem_id]['confidence'],
                            confidence * 0.8
                        )
                        scores[elem_id]['reasons'].append(
                            f"History: {confidence:.0f}%"
                        )
                        scores[elem_id]['element'] = elem
                        break
        
        # 2. Proximity-based prediction
        if use_proximity:
            nearby_elements = self.analyzer.find_related_elements(
                current_element, all_elements, max_related=5
            )
            
            for i, elem in enumerate(nearby_elements):
                proximity_score = (1 - (i / len(nearby_elements))) * 60
                
                elem_id = id(elem)
                scores[elem_id]['confidence'] = max(
                    scores[elem_id]['confidence'],
                    proximity_score
                )
                scores[elem_id]['reasons'].append(
                    f"Nearby (rank: {i+1})"
                )
                scores[elem_id]['element'] = elem
        
        # Build final predictions
        for elem_id, score_data in scores.items():
            elem = score_data['element']
            
            predictions.append({
                'element': elem,
                'element_idx': elem.get('idx'),
                'text': elem.get('text', ''),
                'bbox': elem.get('bbox', [0, 0, 1, 1]),
                'action': self._infer_action(elem),
                'confidence': score_data['confidence'],
                'reasons': score_data['reasons'],
                'reason': ' | '.join(score_data['reasons'])
            })
        
        # Sort by confidence
        predictions.sort(key=lambda x: x['confidence'], reverse=True)
        
        # Add ranks
        for i, pred in enumerate(predictions, 1):
            pred['rank'] = i
        
        return predictions[:5]
    
    def _infer_action(self, element: Dict) -> str:
        """Infer appropriate action for element"""
        tag = element.get('tag', '').lower()
        elem_type = element.get('type', '').lower()
        text = element.get('text', '').lower()
        
        if tag in ['input', 'textarea'] or elem_type in ['text', 'password', 'email']:
            return 'input'
        
        if tag in ['button', 'a'] or 'button' in text:
            return 'click'
        
        if tag == 'select' or 'select' in text or 'dropdown' in text:
            return 'select'
        
        if elem_type in ['checkbox', 'radio']:
            return 'toggle'
        
        return 'click'
    
    def record_action(self, element: Dict, action_type: str = 'click'):
        """Record user action for learning"""
        self.history.add_action(
            element.get('text', 'Unknown'),
            element.get('idx', -1),
            element.get('bbox', [0, 0, 1, 1]),
            action_type
        )
    
    def get_history_summary(self) -> Dict:
        """Get action history summary"""
        return self.history.to_dict()


class PredictionSession:
    """Manage prediction sessions across page interactions"""
    
    def __init__(self):
        self.predictor = NextElementPredictor()
        self.current_page_url = None
        self.current_elements = []
    
    def update_page(self, url: str, elements: List[Dict]):
        """Update current page context"""
        self.current_page_url = url
        self.current_elements = elements
    
    def predict(
        self,
        current_element: Dict,
        instruction: Optional[str] = None,
        top_k: int = 3
    ) -> List[Dict]:
        """Get predictions for next action"""
        if not self.current_elements:
            return []
        
        predictions = self.predictor.predict_next_element(
            current_element,
            self.current_elements,
            context_instruction=instruction,
            use_history=True,
            use_proximity=True
        )
        
        return predictions[:top_k]
    
    def record_action(self, element: Dict, action_type: str = 'click'):
        """Record action for learning"""
        self.predictor.record_action(element, action_type)
