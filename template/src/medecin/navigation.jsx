import React, { useState, useEffect } from "react";
import DoctorCalendar from "./doctorCalendar";
import Operation from "./Operation";
import MesRdvMedecin from "./MesRdvMedecin";
import OperationAndDoctorCalendar from "./OperationAndDoctorCalendar";

const Navigation = ({ selectedMenu, userId }) => {
  switch (selectedMenu) {
    case "appointment":
      return <DoctorCalendar doctorId={userId} />;
    case "profile":
      return <div>Profil de l'utilisateur #{userId}</div>;
    case "liste":
      return <div>Liste des patients</div>;
    case "operations":
      return <Operation doctorId={userId} />;
    case "Rendez-vous":
      return <MesRdvMedecin doctorId={userId} />;
    case "schedule":
      return <OperationAndDoctorCalendar doctorId={userId} />;
    case "chatbot":
      return <div>Composant Chatbot ici</div>;
    default:
      return <div>Bienvenue ! Sélectionnez un menu.</div>;
  }
};

export default Navigation;
