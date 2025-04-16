import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ListPatients.css"; // Tu peux garder le même style

const ListAppointmentPatients = ({ doctorId }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/appointments/patients/${doctorId}`);
                setPatients(res.data);
            } catch (err) {
                console.error("Erreur lors du fetch des patients depuis appointments :", err);
            } finally {
                setLoading(false);
            }
        };

        if (doctorId) {
            fetchPatients();
        }
    }, [doctorId]);

    const handleUpdate = (patient) => {
        console.log("Mettre à jour le patient :", patient);
        // Tu peux ouvrir une modal ici ou rediriger vers une page de modification
    };

    if (loading) return <p>Chargement des patients à partir des rendez-vous...</p>;

    return (
        <div className="table-container">
            <h2>Patients avec rendez-vous</h2>
            <table className="styled-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {patients.map((patient) => (
                        <tr key={patient._id}>
                            <td>{patient.lastName}</td>
                            <td>{patient.name}</td>
                            <td>{patient.email}</td>
                            <td>
                                <button className="update-btn" onClick={() => handleUpdate(patient)}>
                                    Update
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListAppointmentPatients;
