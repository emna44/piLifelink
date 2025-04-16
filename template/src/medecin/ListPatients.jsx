import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ListPatients.css"; // 🔁 n'oublie d'importer le CSS

const ListPatients = ({ doctorId }) => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const res = await axios.get(`http://localhost:3001/patients/${doctorId}`);
                setPatients(res.data);
            } catch (err) {
                console.error("Erreur lors du fetch des patients :", err);
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
    };

    if (loading) return <p>Chargement des patients...</p>;

    return (
        <div className="table-container">
            <h2>Liste des patients du docteur</h2>
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

export default ListPatients;
