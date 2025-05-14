import numpy as np
from sklearn.neighbors import KNeighborsClassifier
import joblib

# Données d'entraînement fictives [Hémoglobine, Plaquettes, Leucocytes, Glycémie]
X = np.array([
    [13.5, 270, 6.2, 95],
    [10.2, 100, 13.1, 180],
    [11.1, 230, 5.9, 100],
    [9.0, 80, 14.2, 200],
    [14.1, 290, 5.6, 85]
])

# étiquettes : 0 = sain, 1 = malade
y = np.array([0, 1, 0, 1, 0])

# Entraînement du modèle
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X, y)

# Sauvegarde
joblib.dump(model, "knn_blood_model.pkl")
print("✅ Modèle sauvegardé dans knn_blood_model.pkl")
