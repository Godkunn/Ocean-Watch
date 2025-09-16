from flask import Flask, request, jsonify
from flask_cors import CORS
from disaster_nlp import DisasterNLP
import os

app = Flask(__name__)
CORS(app)

nlp_model = DisasterNLP()

try:
    nlp_model.load_model(
        model_path=os.environ.get('NLP_MODEL_PATH', 'disaster_nlp_model.h5'),
        tokenizer_path=os.environ.get('NLP_TOKENIZER_PATH', 'tokenizer.pickle')
    )
    print("NLP model loaded successfully")
except Exception as e:
    print(f"Error loading model: {e}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'model_loaded': nlp_model.is_fitted})

@app.route('/analyze', methods=['POST'])
def analyze_text():
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'No text provided'}), 400
        
        texts = data['text']
        if isinstance(texts, str):
            texts = [texts]
        
        results = nlp_model.predict(texts)
        
        # Simple keyword extraction (for demonstration)
        keywords = []
        for text in texts:
            words = nlp_model.preprocess_text(text).split()
            stopwords = {'the', 'and', 'is', 'in', 'to', 'of', 'a', 'an', 'on', 'at'}
            keywords.append([word for word in words if word not in stopwords and len(word) > 3][:5])
        
        response = {
            'predictions': results['predictions'].tolist(),
            'probabilities': results['probabilities'].tolist(),
            'is_disaster_related': results['is_disaster_related'],
            'keywords': keywords
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=os.environ.get('FLASK_DEBUG', 'False') == 'True')