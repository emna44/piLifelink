import React, { useEffect, useState } from "react";
import { FaMicrophone } from "react-icons/fa";
import './VoiceCommandButton.css';

const VoiceCommandButton = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleVoiceCommand = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase();
      console.log("Heard:", command);

      if (command.includes("home")) {
        window.location.href = "/home";
      } else if (
        command.includes("complaint") ||
        command.includes("complained") ||
        command.includes("complaints")
      ) {
        userId
          ? window.location.href = `/complaints/${userId}`
          : alert("User ID not found");
      } else if (
        command.includes("chatbot") ||
        command.includes("chat") ||
        command.includes("assistant")
      ) {
        window.location.href = "http://localhost:3000/patient#testimonials";
      } else if (
        command.includes("specialties") ||
        command.includes("specialists") ||
        command.includes("doctors list")
      ) {
        window.location.href = "http://localhost:3000/patient#specialite";
      } else if (
        command.includes("contact") ||
        command.includes("support") ||
        command.includes("help")
      ) {
        window.location.href = "http://localhost:3000/patient#contact";
      } else if (command.includes("view profile") || command.includes("show profile")) {
        userId
          ? window.location.href = `/showProfile/${userId}`
          : alert("User ID not found");
      } else if (
        command.includes("edit profile") ||
        command.includes("update profile") ||
        command.includes("modify profile")
      ) {
        userId
          ? window.location.href = `/updateProfile/${userId}`
          : alert("User ID not found");
      } else if (
        command.includes("log out") ||
        command.includes("logout") ||
        command.includes("sign out") ||
        command.includes("disconnect")
      ) {
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert("Command not recognized: " + command);
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
    };

    recognition.start();
  };

  return (
    <div className="voice-command-container">
      <button 
        className="voice-command-btn"
        onClick={handleVoiceCommand}
      >
        <FaMicrophone className="voice-icon" /> Speak Command
      </button>
    </div>
  );
};

export default VoiceCommandButton;