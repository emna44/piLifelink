import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const UserFiles = () => {
  const { userId } = useParams();
  const [userFiles, setUserFiles] = useState({ files: [], images: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/users/${userId}/fichiers`);
        if (!response.ok) {
          throw new Error('Impossible de récupérer les fichiers');
        }
        const data = await response.json();
        setUserFiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserFiles();
  }, [userId]);

  if (loading) return <div>Chargement des fichiers...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div>
      <h2>Fichiers de l'utilisateur {userId}</h2>

      {/* Affichage des fichiers PDF */}
      <div>
        <h3>Fichiers PDF :</h3>
        <ul>
          {userFiles.files.length === 0 ? (
            <p>Aucun fichier PDF disponible.</p>
          ) : (
            userFiles.files.map((file, index) => (
              <li key={index}>
                <a href={`http://localhost:3001/files/${file}`} target="_blank" rel="noopener noreferrer">
                  {file}
                </a>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Affichage des images */}
      <div>
        <h3>Images :</h3>
        {userFiles.images.length === 0 ? (
          <p>Aucune image disponible.</p>
        ) : (
          userFiles.images.map((image, index) => (
            <div key={index}>
              <img
                src={`http://localhost:3001/images/${image}`}
                alt={`Image ${index}`}
                style={{ width: "200px", height: "auto", marginBottom: "10px" }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserFiles;
