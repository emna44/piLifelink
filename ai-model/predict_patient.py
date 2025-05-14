import sys
import json
import joblib

def main():
    try:
        # Charger le modèle
        model = joblib.load("patient_predictor.pkl")

        # Lire les arguments JSON passés en ligne de commande
        args = json.loads(sys.argv[1])
        symptoms = args.get("symptoms", "")
        history = args.get("medicalHistory", "")
        text_input = symptoms + " " + history

        # Prédiction
        prediction = model.predict([text_input])[0]  # suppose que le modèle retourne un tuple (gravite, specialty)

        response = {
            "gravite": prediction[0],
            "speciality": prediction[1]
        }

        print(json.dumps(response))

    except Exception as e:
        # En cas d'erreur, renvoyer un message clair au frontend
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
