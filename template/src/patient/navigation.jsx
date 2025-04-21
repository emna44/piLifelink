import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "../medecin/Navigation.css"; // Reuse the CSS from medecin

export const Navigation = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Utilisateur");
  const [userId, setUserId] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState("home");

  useEffect(() => {
    const storedUserName = localStorage.getItem("userName");
    const storedUserId = localStorage.getItem("userId");

    if (storedUserName) setUserName(storedUserName);
    if (storedUserId) setUserId(storedUserId);
  }, []);

  const Logout = () => {
    localStorage.removeItem("isLogedIn");
    localStorage.removeItem("userName");
    localStorage.removeItem("userId");
    navigate("/");
  };

  const handleUserClick = (e) => {
    e.preventDefault();
    if (userId) navigate(`/showProfile/${userId}`);
  };

  const renderContent = () => {
    if (!userId) {
      return <p>Veuillez vous connecter pour accéder à votre espace.</p>;
    }

    switch (selectedMenu) {
      case "appointments":
        return <div>Mes rendez-vous</div>;
      case "medecins":
        return <div>Trouver un médecin</div>;
      case "specialites":
        return <div>Spécialités médicales</div>;
      case "complaint":
        return <div>Déposer une réclamation</div>;
      default:
        return <div>Bienvenue ! Sélectionnez un menu.</div>;
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="container">
          <div className="navbar-brand">
            <img src="/img/logo.png" alt="Logo" className="logo" />
            <span className="brand-text">LifeLink</span>
          </div>
          <ul className="nav-links">
            <li>
              <a href="#" onClick={() => setSelectedMenu("appointments")}>Mes rendez-vous</a>
            </li>
            <li>
              <a href="#" onClick={() => setSelectedMenu("medecins")}>Trouver un médecin</a>
            </li>
            <li>
              <a href="#" onClick={() => setSelectedMenu("specialites")}>Spécialités</a>
            </li>
            <li>
              <a href="#" onClick={() => setSelectedMenu("complaint")}>Réclamation</a>
            </li>
            <li className="nav-user">
              <a href="#" onClick={handleUserClick}>
                <FaUserCircle className="user-icon" />
                <span className="user-name">{userName}</span>
              </a>
            </li>
            <li>
              <button className="logout-button" onClick={Logout}>
                Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div style={{ marginTop: "150px", padding: "20px" }}>
        {renderContent()}
      </div>
    </>
  );
};

// Export both as named and default export for compatibility
export default Navigation;
