import React, { useState } from "react";
import { useParams } from "react-router-dom";
import './ImageUpload.css';

const ImageUpload = () => {
  const { patientId } = useParams();
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [stepResults, setStepResults] = useState([]); // Stocke les étapes
  const [fetchUrl, setFetchUrl] = useState("");

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Pour prévisualiser l'image
      setImage(file); // Stocke le fichier
      setImagePreview(imageUrl); // Prévisualise l'image
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title || !image) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    // Préparation de FormData pour envoyer le fichier
    const formData = new FormData();
    formData.append('images', image); // Ajoute le fichier image
    formData.append('title', title); // Ajoute le titre de l'image (si nécessaire)

    setStepResults(prevResults => [...prevResults, "Préparation des données pour l'envoi..."]);
    
    const url = `http://localhost:3001/api/patients/${patientId}/images`;
    setFetchUrl(url);

    try {
      setStepResults(prevResults => [...prevResults, "Envoi de la requête PUT..."]);

      // Envoi des données avec FormData
      const response = await fetch(url, {
        method: "PUT",
        body: formData, // On envoie le formData contenant l'image
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'ajout de l'image");
      }

      setStepResults(prevResults => [...prevResults, "Réponse reçue du serveur."]);
      const result = await response.json();

      setStepResults(prevResults => [...prevResults, "Image ajoutée avec succès."]);
      alert("Image ajoutée avec succès !");
      setTitle(""); // Réinitialise le titre
      setImage(null); // Réinitialise l'image
      setImagePreview(null); // Réinitialise la prévisualisation
    } catch (err) {
      console.error("Erreur :", err);
      setStepResults(prevResults => [...prevResults, "Une erreur s'est produite lors de l'ajout de l'image."]);
      alert("Une erreur s'est produite lors de l'ajout de l'image.");
    }
  };

  return (
    <div className="image-upload-container">
      <h2>Ajouter une nouvelle image</h2>
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
          <label htmlFor="title" className="form-label">Titre de l'image :</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Entrez le titre de l'image"
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">Sélectionnez une image :</label>
          <input
            type="file"
            id="image"
            onChange={handleImageChange}
            accept="image/*"
            required
            className="form-input file-input"
          />
        </div>

        <button type="submit" className="submit-btn">Ajouter l'image</button>
      </form>

      {imagePreview && (
        <div className="image-preview">
          <h3>Aperçu de l'image :</h3>
          <img src={imagePreview} alt="Aperçu" className="image-preview-img" />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
