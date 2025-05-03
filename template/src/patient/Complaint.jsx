import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Navigation } from "./navigation";
import { Send } from "lucide-react";
import "./complaint.css"; // Import the CSS file

const Complaint = () => {
  const { userId } = useParams();
  const [newComplaint, setNewComplaint] = useState({ description: "" });
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewComplaint({ ...newComplaint, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const complaintData = {
      description: newComplaint.description,
      patientId: userId,
      date: new Date(),
    };

    try {
      setSubmittingComplaint(true);
      await axios.post("http://localhost:3001/api/complaints", complaintData);
      setNewComplaint({ description: "" });
      setError(null);
      setSuccessMessage("Complaint submitted successfully!");
    } catch (err) {
      console.error("Erreur lors de la soumission :", err);
      setError("Submission failed. Please try again.");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  return (
    <div>
      <Navigation />
      <div className="complaint-page">
        <div className="complaint-container">
          <div className="complaint-header">
            <h2>Submit a Complaint</h2>
            <p>If you have a problem, please let us know.</p>
          </div>

          {successMessage && (
            <div className="success-message">✅ {successMessage}</div>
          )}
          {error && <div className="error-message">❌ {error}</div>}

          <form onSubmit={handleSubmit} className="complaint-form">
            <label htmlFor="description">Complaint Description</label>
            <textarea
              id="description"
              name="description"
              rows="6"
              placeholder="Write your complaint here..."
              value={newComplaint.description}
              onChange={handleInputChange}
              required
            />

            <button type="submit" disabled={submittingComplaint}>
              {submittingComplaint ? "Submitting..." : "Submit Complaint"}
              <Send className="send-icon" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Complaint;
