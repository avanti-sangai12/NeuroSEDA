# ============================================================================
# Prediction Service API
# ============================================================================
# Flask service to handle prediction requests from Chrome extension
# Run: python predictor_service.py
# ============================================================================

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import json
from typing import Dict, List

from predictor_simplified import PredictionSession, NextElementPredictor

app = Flask(__name__)
CORS(app)  # Enable CORS for Chrome extension

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global prediction session
prediction_sessions = {}  # Maps tab_id -> PredictionSession


def get_session(tab_id: str) -> PredictionSession:
    """Get or create prediction session for tab"""
    if tab_id not in prediction_sessions:
        prediction_sessions[tab_id] = PredictionSession()
    return prediction_sessions[tab_id]


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok', 'version': '1.0.0'})


@app.route('/predict/next-element', methods=['POST'])
def predict_next_element():
    """Predict next element to interact with"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['tab_id', 'current_element', 'all_elements', 'page_url']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        tab_id = data['tab_id']
        current_element = data['current_element']
        all_elements = data['all_elements']
        page_url = data['page_url']
        instruction = data.get('instruction')
        top_k = data.get('top_k', 3)
        
        # Get or create session
        session = get_session(tab_id)
        session.update_page(page_url, all_elements)
        
        # Get predictions
        predictions = session.predict(
            current_element,
            instruction=instruction,
            top_k=top_k
        )
        
        # Format response
        formatted_predictions = []
        for pred in predictions:
            formatted_predictions.append({
                'rank': pred['rank'],
                'text': pred['text'],
                'action': pred['action'],
                'confidence': round(pred['confidence'], 1),
                'reason': pred['reason'],
                'bbox': pred['bbox'],
                'element_idx': pred.get('element_idx')
            })
        
        logger.info(f"Predicted {len(formatted_predictions)} next elements for tab {tab_id}")
        
        return jsonify({
            'success': True,
            'predictions': formatted_predictions
        })
    
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/predict/action', methods=['POST'])
def record_action():
    """Record user action for learning"""
    try:
        data = request.get_json()
        
        required = ['tab_id', 'element']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        tab_id = data['tab_id']
        element = data['element']
        action_type = data.get('action_type', 'click')
        
        # Get session and record
        session = get_session(tab_id)
        session.record_action(element, action_type)
        
        logger.info(f"Recorded {action_type} action on '{element.get('text', 'unknown')}' for tab {tab_id}")
        
        return jsonify({
            'success': True,
            'message': f'Action recorded: {action_type}'
        })
    
    except Exception as e:
        logger.error(f"Action recording error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/predict/history/<tab_id>', methods=['GET'])
def get_history(tab_id: str):
    """Get action history for a tab"""
    try:
        session = get_session(tab_id)
        history = session.predictor.get_history_summary()
        
        return jsonify({
            'success': True,
            'history': history,
            'actions_count': len(history.get('actions', [])),
            'sequences_count': len(history.get('sequences', {}))
        })
    
    except Exception as e:
        logger.error(f"History retrieval error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/predict/session/<tab_id>', methods=['DELETE'])
def clear_session(tab_id: str):
    """Clear prediction session for a tab"""
    try:
        if tab_id in prediction_sessions:
            del prediction_sessions[tab_id]
            logger.info(f"Cleared prediction session for tab {tab_id}")
        
        return jsonify({
            'success': True,
            'message': f'Session cleared for tab {tab_id}'
        })
    
    except Exception as e:
        logger.error(f"Session clearing error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/predict/bulk-predict', methods=['POST'])
def bulk_predict():
    """Get predictions for multiple elements at once"""
    try:
        data = request.get_json()
        
        required = ['tab_id', 'elements', 'all_elements', 'page_url']
        for field in required:
            if field not in data:
                return jsonify({'success': False, 'error': f'Missing field: {field}'}), 400
        
        tab_id = data['tab_id']
        elements = data['elements']
        all_elements = data['all_elements']
        page_url = data['page_url']
        instruction = data.get('instruction')
        
        # Get or create session
        session = get_session(tab_id)
        session.update_page(page_url, all_elements)
        
        # Get predictions for each element
        bulk_predictions = {}
        for elem in elements:
            predictions = session.predict(
                elem,
                instruction=instruction,
                top_k=3
            )
            
            elem_idx = elem.get('idx', 'unknown')
            bulk_predictions[str(elem_idx)] = [
                {
                    'rank': pred['rank'],
                    'text': pred['text'],
                    'action': pred['action'],
                    'confidence': round(pred['confidence'], 1),
                    'reason': pred['reason'],
                    'bbox': pred['bbox']
                }
                for pred in predictions
            ]
        
        logger.info(f"Generated bulk predictions for {len(elements)} elements in tab {tab_id}")
        
        return jsonify({
            'success': True,
            'predictions': bulk_predictions
        })
    
    except Exception as e:
        logger.error(f"Bulk prediction error: {str(e)}", exc_info=True)
        return jsonify({'success': False, 'error': str(e)}), 500


if __name__ == '__main__':
    logger.info("🚀 Starting Prediction Service...")
    logger.info("Service will be available at http://localhost:5000")
    logger.info("Endpoints:")
    logger.info("  POST /predict/next-element - Get next element predictions")
    logger.info("  POST /predict/action - Record user action")
    logger.info("  GET /predict/history/<tab_id> - Get action history")
    logger.info("  DELETE /predict/session/<tab_id> - Clear session")
    logger.info("  POST /predict/bulk-predict - Bulk predictions")
    
    app.run(host='localhost', port=5000, debug=False)
