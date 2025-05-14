from flask import Flask, request, jsonify
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
from predict_from_pdf_knn import predict_from_pdf
from torchvision import transforms
import os
from flask_cors import CORS
import joblib

app = Flask(__name__)
CORS(app)  # Autorise toutes les origines pour le développement

# --- CHARGEMENT DES MODÈLES ---

# Modèle de prédiction patient (joblib)
model_patient = joblib.load('patient_predictor.pkl')

# Modèle Retina (PyTorch)
class RetinaClassifier(nn.Module):
    def __init__(self):
        super(RetinaClassifier, self).__init__()
        self.conv1 = nn.Conv2d(1, 16, 3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.conv2 = nn.Conv2d(16, 32, 3, padding=1)
        self.fc1 = nn.Linear(32 * 7 * 7, 64)
        self.fc2 = nn.Linear(64, 2)

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = x.view(-1, 32 * 7 * 7)
        x = F.relu(self.fc1(x))
        return self.fc2(x)

# Chargement du modèle Retina
model_retina = RetinaClassifier()
model_retina.load_state_dict(torch.load("retina_model_binary.pt", map_location=torch.device('cpu')))
model_retina.eval()

# Transformation image pour Retina
transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=1),
    transforms.Resize((28, 28)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[.5], std=[.5])
])

# --- RÉPERTOIRE UPLOADS ---
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# --- ROUTE : Prédiction sur image ---
@app.route('/predict', methods=['POST'])
def predict_image():
    if 'image' not in request.files:
        return jsonify({"error": "Aucune image reçue."}), 400

    image_file = request.files['image']
    try:
        image = Image.open(image_file).convert('RGB')
        input_tensor = transform(image).unsqueeze(0)

        with torch.no_grad():
            output = model_retina(input_tensor)
            _, prediction = torch.max(output, 1)
            result = "Normal" if prediction.item() == 0 else "Malade"

        return jsonify({"diagnostic": result})

    except Exception as e:
        return jsonify({"error": f"Erreur : {str(e)}"}), 500

# --- ROUTE : Prédiction sur PDF ---
@app.route("/predict-pdf", methods=["POST"])
def predict_pdf():
    if 'pdf' not in request.files:
        return jsonify({"error": "PDF requis"}), 400

    pdf_file = request.files["pdf"]
    if pdf_file.filename == "":
        return jsonify({"error": "Nom de fichier vide."}), 400

    pdf_path = os.path.join(UPLOAD_FOLDER, 'temp.pdf')
    try:
        pdf_file.save(pdf_path)

        if not os.path.exists(pdf_path):
            return jsonify({"error": f"Le fichier {pdf_path} n'a pas pu être trouvé."}), 500

        print(f"Fichier PDF sauvegardé à : {pdf_path}")
        result = predict_from_pdf(pdf_path)
        return jsonify({"diagnostic": result})

    except Exception as e:
        return jsonify({"error": f"Erreur lors de l'analyse du fichier PDF : {str(e)}"}), 500
@app.route('/predict_pation', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        # Handle preflight request
        response = jsonify({"status": "ok"})
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    
    try:
        # Récupération des données envoyées en POST
        args = request.get_json()
        
        # Extraction des symptômes et de l'historique médical
        symptoms = args['symptoms']
        medical_history = args['medicalHistory']
        
        # Préparation de l'entrée pour le modèle
        text_input = symptoms + " " + medical_history
        
        # Prédiction avec le modèle
        prediction = model_patient.predict([text_input])[0]
        
        # Réponse formatée
        response = {
            "gravite": prediction[0],
            "speciality": prediction[1]
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- DÉMARRAGE DU SERVEUR ---
if __name__ == '__main__':
    app.run(port=5000, debug=True)
