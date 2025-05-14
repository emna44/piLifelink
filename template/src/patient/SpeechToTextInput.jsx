import React from 'react';

const SpeechToTextInput = ({ onTextDetected }) => {
  const handleVoiceCommand = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase().trim();
      console.log("Heard:", command);
      onTextDetected(command);
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
    };

    recognition.start();
  };

  return (
    <div>
      <button onClick={handleVoiceCommand}>🎙️ Speak Complaint</button>
    </div>
  );
};

export default SpeechToTextInput;
