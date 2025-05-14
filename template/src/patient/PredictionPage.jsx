import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import SpeechToTextInput from "./SpeechToTextInput";
import "./PredictionPage.css";
import { FaArrowLeft } from "react-icons/fa"; // Import de l'icône flèche

const PredictionPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false); // J'ai changé predicting en loading pour correspondre au CSS
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const fetchMedicalHistory = async (id) => {
    try {
      const response = await axios.get(`http://localhost:3001/users/${id}`);
      return response.data.medicalHistory;
    } catch (err) {
      console.error("Erreur récupération historique médical:", err);
      return null;
    }
  };

  const handlePredict = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setPrediction(null);
    setError(null);

    try {
      const medicalHistory = await fetchMedicalHistory(userId);

      if (!medicalHistory) {
        setError("⚠️ Failed to fetch medical history.");
        return;
      }

      const res = await axios.post("http://localhost:5000/predict_pation", {
        symptoms: description,
        medicalHistory,
      });

      console.log("✅ Prediction response:", res.data);

      // Vérification des propriétés de la réponse
      if (res.data && res.data.gravite && res.data.speciality) {
        setPrediction(res.data); // Les données sont correctement structurées
      } else {
        setError("Invalid response from server: Missing 'gravite' or 'speciality'");
      }
    } catch (err) {
      console.error("❌ Prediction failed:", err);
      setError("Failed to predict severity and specialty.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="prediction-container">
      <button
        onClick={handleBackClick}
        className="back-button"
      >
        <FaArrowLeft style={{ marginRight: "8px" }} />
        Back
      </button>
      <div className="prediction-header">
        <h2>Symptom Checker</h2>
        <p>Describe your symptoms to get a severity prediction and recommended specialty</p>
      </div>

      <div className="prediction-form">
        <div className="form-group">
          <label htmlFor="symptoms">Symptoms Description</label>
          <textarea
            id="symptoms"
            name="symptoms"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your symptoms in detail..."
          />
        </div>

        <button
          className="predict-button"
          onClick={handlePredict}
          disabled={loading || !description.trim()}
        >
          {loading ? "Predicting..." : "Predict Severity"}
          {loading && <span className="loading-indicator"></span>}
        </button>

        {error && <div className="error-message">{error}</div>}

        {prediction && (
          <div className="prediction-result">
            <h4>Prediction Results</h4>
            <p className="result-item">
              <strong>Severity:</strong> {prediction.gravite}
            </p>
            <p className="result-item">
              <strong>Recommended Specialty:</strong> {prediction.speciality}
            </p>
          </div>
        )}

        {/* Ajout du SpeechToTextInput si nécessaire */}
        <SpeechToTextInput
          onTextDetected={(text) => setDescription(text)}
        />
      </div>
    </div>
  );
};

export default PredictionPage;
