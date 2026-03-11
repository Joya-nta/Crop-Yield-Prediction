import os

import joblib
import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# --- Load Models at Startup ---
# We load them once here so the API is fast
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Paths to your saved models
YIELD_MODEL_PATH = os.path.join(BASE_DIR, 'gradient_boosting_model.pkl')
CROP_MODEL_PATH = os.path.join(BASE_DIR, 'gradient_boosting_classifier.pkl')
MODEL3_PATH = os.path.join(BASE_DIR, 'model3.pkl')
MODEL4_PATH = os.path.join(BASE_DIR, 'model4.pkl')

yield_model = None
crop_model = None
model3 = None
model4 = None

if os.path.exists(YIELD_MODEL_PATH):
    yield_model = joblib.load(YIELD_MODEL_PATH)
    print("Yield Model loaded successfully.")
else:
    print("Warning: Yield Model not found.")

if os.path.exists(CROP_MODEL_PATH):
    crop_model = joblib.load(CROP_MODEL_PATH)
    print("Crop Model loaded successfully.")
else:
    print("Warning: Crop Model not found.")

if os.path.exists(MODEL3_PATH):
    model3 = joblib.load(MODEL3_PATH)
    print("Model3 loaded successfully.")
else:
    print("Warning: Model3 not found.")

if os.path.exists(MODEL4_PATH):
    model4 = joblib.load(MODEL4_PATH)
    print("Model4 loaded successfully.")
else:
    print("Warning: Model4 not found.")


# --- Helper Function: Convert state to district ---
# def convert_state_to_district(data):
#     """
#     Convert 'state' field to 'district' for ML model compatibility.
#     The frontend sends 'state' which contains West Bengal district names.
#     """
#     if 'state' in data:
#         data['district'] = data.pop('state')
#     return data


# --- Endpoint 1: Predict Yield ---
@app.route('/predict-yield', methods=['POST'])
def predict_yield():
    try:
        data = request.get_json()
        
        # Check if location data is provided
        has_location = 'latitude' in data and 'longitude' in data
        
        # Select model based on location availability
        if has_location:
            if not model4:
                return jsonify({'error': 'Model4 (location-based) is not loaded'}), 500
            model = model4
        else:
            if not yield_model:
                return jsonify({'error': 'Yield model is not loaded'}), 500
            model = yield_model
        
        # Convert single dict to DataFrame
        df = pd.DataFrame([data])
        
        # Predict
        prediction = model.predict(df)[0]
        
        return jsonify({
            'status': 'success',
            'predicted_yield': float(prediction),
            'units': 'kg_per_ha'
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


# --- Endpoint 2: Recommend Crop (Top 3) ---
@app.route('/recommend-crop', methods=['POST'])
def recommend_crop():
    try:
        data = request.get_json()
        
        # Check if location data is provided
        has_location = 'latitude' in data and 'longitude' in data
        
        # Select model based on location availability
        if has_location:
            if not model3:
                return jsonify({'error': 'Model3 (location-based) is not loaded'}), 500
            model = model3
        else:
            if not crop_model:
                return jsonify({'error': 'Crop model is not loaded'}), 500
            model = crop_model
        
        df = pd.DataFrame([data])

        # Get Probabilities
        probabilities = model.predict_proba(df)[0]
        class_labels = model.classes_

        # Find Top 3
        top3_indices = np.argsort(probabilities)[-3:][::-1]

        recommendations = []
        for i in top3_indices:
            recommendations.append({
                "crop": class_labels[i],
                "confidence": f"{probabilities[i] * 100:.2f}%"
            })

        return jsonify({
            'status': 'success',
            'recommendations': recommendations
        })

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400


if __name__ == '__main__':
    # Run the API on port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)