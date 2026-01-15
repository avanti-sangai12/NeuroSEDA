#!/usr/bin/env python3
"""
NeuroSEDA Prediction Service
A simple Flask-based service that provides next-element predictions for web automation.
Run this to enable live prediction analysis in the extension.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import random

app = Flask(__name__)
CORS(app)

# ============================================================================
# CONFIGURATION
# ============================================================================

DEBUG_MODE = True
HOST = 'localhost'
PORT = 5000

# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/health', methods=['GET'])
def health():
    """Check if service is running"""
    return jsonify({
        'status': 'ok',
        'service': 'NeuroSEDA Prediction Service',
        'version': '1.0.0'
    }), 200


# ============================================================================
# PREDICTION ENDPOINTS
# ============================================================================

@app.route('/predict/next-element', methods=['POST', 'OPTIONS'])
def predict_next_element():
    """Predict the next element user will interact with"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        # Extract request data
        tab_id = data.get('tab_id', 'unknown')
        current_element = data.get('current_element', {})
        all_elements = data.get('all_elements', [])
        page_url = data.get('page_url', '')
        instruction = data.get('instruction', '')
        top_k = data.get('top_k', 3)
        
        if DEBUG_MODE:
            print(f"\n[Prediction Service] Received prediction request:")
            print(f"  - Tab ID: {tab_id}")
            print(f"  - URL: {page_url}")
            print(f"  - Elements analyzed: {len(all_elements)}")
            print(f"  - Instruction: {instruction}")
        
        # Generate predictions (demo implementation)
        predictions = generate_predictions(all_elements, page_url, top_k)
        
        response = {
            'predictions': predictions,
            'count': len(predictions),
            'tab_id': tab_id,
            'timestamp': __import__('datetime').datetime.now().isoformat()
        }
        
        if DEBUG_MODE:
            print(f"  - Generated {len(predictions)} predictions")
            for pred in predictions[:3]:
                print(f"    • Rank {pred['rank']}: {pred['text']} ({pred['confidence']}% confidence)")
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"[Prediction Service] Error: {str(e)}")
        return jsonify({
            'error': str(e),
            'predictions': []
        }), 400


@app.route('/predict/action', methods=['POST', 'OPTIONS'])
def record_action():
    """Record user action for learning"""
    
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        data = request.get_json()
        
        tab_id = data.get('tab_id', 'unknown')
        element = data.get('element', {})
        action_type = data.get('action_type', 'unknown')
        
        if DEBUG_MODE:
            print(f"\n[Prediction Service] Recorded action:")
            print(f"  - Tab ID: {tab_id}")
            print(f"  - Action: {action_type}")
            print(f"  - Element: {element.get('tag', 'unknown')} - {element.get('text', '')[:30]}")
        
        return jsonify({
            'success': True,
            'message': 'Action recorded for model training'
        }), 200
        
    except Exception as e:
        print(f"[Prediction Service] Error recording action: {str(e)}")
        return jsonify({
            'error': str(e)
        }), 400


# ============================================================================
# PREDICTION LOGIC
# ============================================================================

def generate_predictions(elements, page_url, top_k=3):
    """
    Generate ranked predictions for next element interaction.
    
    In a real implementation, this would use machine learning to analyze:
    - Element types and positions
    - Common interaction patterns
    - Form flows
    - Page structure
    
    This demo implementation uses heuristics and random scoring.
    """
    
    if not elements:
        return []
    
    # Score elements based on heuristics
    scored_elements = []
    
    for elem in elements:
        score = calculate_element_score(elem, page_url)
        scored_elements.append({
            'element': elem,
            'score': score
        })
    
    # Sort by score
    scored_elements.sort(key=lambda x: x['score'], reverse=True)
    
    # Generate predictions
    predictions = []
    for rank, item in enumerate(scored_elements[:top_k], 1):
        elem = item['element']
        score = item['score']
        
        prediction = {
            'rank': rank,
            'text': elem.get('text', f"{elem.get('tag', 'element').upper()}")[:50],
            'action': elem.get('interactionType', 'click'),
            'confidence': min(99, max(10, int(score * 100))),  # 10-99%
            'reason': generate_reason(elem, rank, score),
            'element_tag': elem.get('tag', ''),
            'element_id': elem.get('id', ''),
            'element_classes': elem.get('classes', '')
        }
        
        predictions.append(prediction)
    
    return predictions


def calculate_element_score(element, page_url):
    """
    Calculate prediction score for an element (0.0 - 1.0).
    
    Factors:
    - Element type (buttons score high)
    - Form fields in order
    - Element visibility and size
    - Common patterns for page type
    """
    
    score = 0.5  # Base score
    
    # Bonus for specific element types
    tag = element.get('tag', '').lower()
    interaction = element.get('interactionType', 'click')
    
    if tag == 'button' or element.get('type') == 'submit':
        score += 0.25  # Buttons are commonly clicked next
    elif tag == 'input' and element.get('type') in ['text', 'email', 'password']:
        score += 0.15  # Form inputs
    elif tag == 'a':
        score += 0.10  # Links
    elif tag == 'textarea':
        score += 0.12
    
    # Bonus for visible, sizeable elements
    position = element.get('position', {})
    if position.get('width', 0) > 50 and position.get('height', 0) > 20:
        score += 0.05
    
    # Add some randomness for variety
    score += random.uniform(-0.05, 0.1)
    
    # Clamp to 0.1 - 0.95
    return max(0.1, min(0.95, score))


def generate_reason(element, rank, score):
    """
    Generate human-readable reasoning for the prediction.
    """
    
    tag = element.get('tag', '').lower()
    interaction = element.get('interactionType', 'click')
    text = element.get('text', '')[:30]
    
    reasons = []
    
    if rank == 1:
        reasons.append("Highest confidence match")
    
    if tag == 'button' or element.get('type') == 'submit':
        reasons.append("Button element - common next interaction")
    elif tag == 'input':
        reasons.append("Form field - natural flow after current element")
    elif tag == 'textarea':
        reasons.append("Text area - often accessed after form start")
    elif tag == 'a':
        reasons.append("Link - navigation target")
    
    if interaction == 'input':
        reasons.append("Requires text input")
    elif interaction == 'toggle':
        reasons.append("Can be toggled on/off")
    elif interaction == 'select':
        reasons.append("Dropdown selection needed")
    
    confidence = int(score * 100)
    if confidence >= 80:
        reasons.append(f"Strong prediction ({confidence}% confidence)")
    elif confidence >= 60:
        reasons.append(f"Good prediction ({confidence}% confidence)")
    else:
        reasons.append(f"Moderate prediction ({confidence}% confidence)")
    
    return " • ".join(reasons)


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# STARTUP
# ============================================================================

if __name__ == '__main__':
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                 NeuroSEDA Prediction Service v1.0                          ║
║                                                                            ║
║  Service running at: http://localhost:5000                                ║
║  CORS enabled for Chrome extension communication                           ║
║                                                                            ║
║  Available endpoints:                                                      ║
║  • GET  /health                  - Service health check                    ║
║  • POST /predict/next-element    - Predict next interaction                ║
║  • POST /predict/action          - Record user action                      ║
║                                                                            ║
║  Open your extension and click "Predictions" tab to test!                 ║
╚════════════════════════════════════════════════════════════════════════════╝
    """)
    
    app.run(
        debug=DEBUG_MODE,
        host=HOST,
        port=PORT,
        use_reloader=False
    )
