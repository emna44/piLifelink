# train_model.py
import json
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
import joblib

# Charger les données JSON
with open('patients_data.json', 'r') as f:
    data = json.load(f)

df = pd.DataFrame(data)

X = df['symptoms'] + " " + df['medicalHistory']
y = df[['gravite', 'speciality']]

pipeline = Pipeline([
    ('tfidf', TfidfVectorizer()),
    ('clf', MultiOutputClassifier(RandomForestClassifier()))
])

pipeline.fit(X, y)

# Sauvegarder dans le même dossier que app.py
joblib.dump(pipeline, 'patient_predictor.pkl')
