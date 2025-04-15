import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const MesRdvMedecin = ({ doctorId }) => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (!doctorId) {
        console.error("Le doctorId est nécessaire.");
        setLoading(false);
        return;
      }
  
      const fetchAppointments = async () => {
        try {
          const response = await axios.get(`http://localhost:3001/appointments/medecin/${doctorId}`);
  
          if (Array.isArray(response.data) && response.data.length > 0) {
            setAppointments(response.data);
          } else {
            setAppointments([]);
          }
  
          setLoading(false);
        } catch (error) {
          console.error("Erreur lors de la récupération des rendez-vous du médecin :", error.response?.data || error.message);
          setLoading(false);
        }
      };
  
      fetchAppointments();
    }, [doctorId]);
  
    if (loading) {
      return <div>Chargement des rendez-vous du médecin...</div>;
    }
  
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ textAlign: 'center' }}>Mes Rendez-vous (Médecin)</h2>
  
        {appointments.length === 0 ? (
          <p>Aucun rendez-vous trouvé pour ce médecin.</p>
        ) : (
          <div>
            {appointments.map((rdv, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #ccc',
                  padding: '10px',
                  margin: '10px 0',
                  borderRadius: '5px',
                }}
              >
                <h3>Rendez-vous {index + 1}</h3>
                <p><strong>Début :</strong> {new Date(rdv.startTime).toLocaleString()}</p>
                <p><strong>Fin :</strong> {new Date(rdv.endTime).toLocaleString()}</p>
                <p><strong>Statut :</strong> {rdv.status}</p>
                <p><strong>Patient :</strong> {rdv.patient?.name} {rdv.patient?.lastName}</p> {/* affichage du patient */}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
export default MesRdvMedecin;
