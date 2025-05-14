import React, { useState, useEffect } from "react";
import axios from "axios";
import "./login.css"; // Assurez-vous que ce fichier est bien importé
import { Link, useNavigate } from "react-router-dom";

function Forgetpass() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = async (e) => {
      e.preventDefault();
      setMessage("");
      setError("");

      try {
          const res = await axios.post("http://localhost:3001/forgot-password", { email });

          if (res.data.Status === "Success") {
              alert("Email de réinitialisation envoyé !");
              setTimeout(() => navigate("/"), 3000); 
          } else {
              alert(res.data.Status || "Erreur inconnue");
          }
      } catch (err) {
          setError("Une erreur s'est produite, veuillez réessayer.");
          console.error(err);
      }
  };

  return (

    <div className="login-page">
      <div className="background-slideshow">
        <img src="/images/bg1.jpg" alt="bg1" />
        <img src="/images/bg2.jpg" alt="bg2" />
        <img src="/images/bg3.jpg" alt="bg3" />
      </div>
      <div className="wrapper">
          <form onSubmit={handleSubmit} className="form-container">
              <h1 className="form-title" style={{ color: "black" }}>Réinitialiser le mot de passe</h1>
              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="input-box">
                  <input
                      type="email"
                      placeholder="Entrez votre email"
                      autoComplete="off"
                      name="email"
                      className="form-control"
                      onChange={(e) => setEmail(e.target.value)}
                      required
                  />
              </div>
              <button type="submit" className="btn btn-primary">Envoyer</button>
          </form>
      </div>
      </div>
  );
}

export default Forgetpass;