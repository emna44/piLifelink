import re
import fitz  # PyMuPDF
import joblib

# Charger le modèle KNN
model = joblib.load("knn_blood_model.pkl")

def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def safe_extract(label, text):
    match = re.search(rf"{label}\s*:\s*(\d+(?:[.,]\d+)?)", text, re.IGNORECASE)
    if not match:
        raise ValueError(f"❌ Donnée manquante ou mal formatée : '{label}' non trouvée dans le fichier PDF.")
    return float(match.group(1).replace(",", "."))

def predict_from_pdf(pdf_path):
    text = extract_text_from_pdf(pdf_path)

    try:
        hgb = safe_extract("Hémoglobine", text)
        plt = safe_extract("Plaquettes", text)
        wbc = safe_extract("Globules blancs", text)
        glu = safe_extract("Glucose", text)

        input_data = [[hgb, plt, wbc, glu]]
        prediction = model.predict(input_data)

        return "Malade" if prediction[0] == 1 else "Normal"
    except Exception as e:
        raise Exception(f"Erreur lors de l'extraction des données du PDF : {e}")
