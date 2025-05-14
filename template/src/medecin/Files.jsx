import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import './ImageUpload.css';

const Files = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null); // 📌 URL pour l'affichage du PDF

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setFilePreview(uploadedFile.name);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !file) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const url = `http://localhost:3001/api/patients/${patientId}/files`;

    try {
      const response = await fetch(url, {
        method: "PUT",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur lors de l'ajout du fichier");
      }

      setDiagnosticResult(data.diagnostic); // 🧠 Diagnostic IA
      setPdfUrl(`http://localhost:3001/public/Files/${data.file}`); 

      alert(`✅ Fichier ajouté. Diagnostic IA : ${data.diagnostic}`);
      setTitle("");
      setFile(null);
      setFilePreview(null);
    } catch (err) {
      console.error("Erreur :", err);
      alert("❌ Une erreur est survenue.");
    }
  };

  return (
    <div className="upload-wrapper">
      <button className="back-button" onClick={() => navigate(-1)}>← Retour</button>
      <div className="upload-card">
        <h2>📄 Ajouter un fichier PDF d'analyse</h2>
        <form onSubmit={handleSubmit} className="upload-form">
          <input
            type="text"
            placeholder="Titre du fichier"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-text"
            required
          />
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf"
            className="input-file"
            required
          />
          <button type="submit" className="btn-submit">📤 Envoyer</button>
        </form>

        {filePreview && (
          <div className="preview">
            <h3>Aperçu :</h3>
            <p>{filePreview}</p>
          </div>
        )}

        {diagnosticResult && (
          <div className="steps">
            <h3>🧠 Résultat IA :</h3>
            <p>
              <strong style={{ color: diagnosticResult === "Malade" ? "red" : "green" }}>
                {diagnosticResult === "Malade" ? "⚠️ Malade détecté" : "✅ Aucun signe détecté"}
              </strong>
            </p>
          </div>
        )}

        {pdfUrl && (
          <div className="pdf-viewer">
            <h3>📑 Fichier PDF analysé :</h3>
            <embed
              src={pdfUrl}
              type="application/pdf"
              width="100%"
              height="600px"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Files;
