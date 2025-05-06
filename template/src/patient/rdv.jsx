import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import DateTimePicker from 'react-datetime-picker';
import './rdv.css';
import Popping from './popping'; // Import du composant modal

const localizer = momentLocalizer(moment);

const Rdv = () => {
  const { idMedecin, idPatient } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');
  
  const [open, setOpen] = useState(false);           // État pour la modale
  const [currentEvent, setCurrentEvent] = useState(null); // État pour l'événement sélectionné

  const fetchData = async () => {
    try {
      const appointmentsResponse = await axios.get(`http://localhost:3001/appointments/medecin/${idMedecin}`);
      const appointments = Array.isArray(appointmentsResponse.data) ? appointmentsResponse.data : [];

      const formattedAppointments = appointments.map(appt => ({
        title: appt.patient?.name
          ? `Rendez-vous avec ${appt.patient.name} ${appt.patient.lastName}`
          : 'Rendez-vous',
        start: new Date(appt.startTime),
        end: new Date(appt.endTime),
        description: appt.description || 'Pas de description',
      }));

      const operationsResponse = await axios.get(`http://localhost:3001/doctor/${idMedecin}`);
      const operations = Array.isArray(operationsResponse.data) ? operationsResponse.data : [];

      const formattedOperations = operations.map(op => ({
        title: `Opération : ${op.description}`,
        start: new Date(op.startTime),
        end: new Date(op.endTime),
        description: op.description,
      }));

      setEvents([...formattedAppointments, ...formattedOperations]);
    } catch (error) {
      console.error('Erreur de récupération des données:', error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [idMedecin]);

  const handleSelectSlot = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setSelectedTime(slotInfo.start);
    setRequestMessage('');
  };

  const handleSelectEvent = (event) => {
    setCurrentEvent(event);
    setOpen(true);
  };

  const isSlotAvailable = (start, end) => {
    return !events.some(event => {
      const eventStart = new Date(event.start).getTime();
      const eventEnd = new Date(event.end).getTime();
      return (
        (start >= eventStart && start < eventEnd) ||
        (end > eventStart && end <= eventEnd) ||
        (start <= eventStart && end >= eventEnd)
      );
    });
  };

  const handleRequestAppointment = async () => {
    if (!selectedDate || !selectedTime) {
      setRequestMessage('Veuillez sélectionner une date et une heure.');
      return;
    }

    const startTime = selectedTime;
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    // Ne pas autoriser une date passée
    if (startTime < new Date()) {
      setRequestMessage("Impossible de prendre un rendez-vous dans le passé.");
      return;
    }

    // Ne pas autoriser un créneau déjà pris
    if (!isSlotAvailable(startTime.getTime(), endTime.getTime())) {
      setRequestMessage("Ce créneau est déjà occupé. Veuillez en choisir un autre.");
      return;
    }

    try {
      await axios.post(`http://localhost:3001/appointments`, {
        startTime,
        endTime,
        status: 'pending',
        patient: idPatient,
        doctor: idMedecin,
      });

      setRequestMessage('Rendez-vous ajouté avec succès.');
      fetchData();
    } catch (error) {
      setRequestMessage("Erreur lors de l'ajout du rendez-vous.");
      console.error("Erreur lors de l'ajout du rendez-vous:", error.response?.data || error);
    }
  };

  return (
    <div className="container">
      <h2>Prendre rendez-vous avec un médecin</h2>

      <Popping
        open={open}
        handleClose={() => setOpen(false)}
        event={currentEvent}
      />

      <div className="calendar-container">
        <h3>Planning du médecin</h3>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent} // Clic sur un event = ouvrir modal
        />

        {selectedDate && selectedTime && (
          <div>
            <p>Date sélectionnée : {selectedDate.toDateString()}</p>
            <DateTimePicker
              onChange={setSelectedTime}
              value={selectedTime}
              format="y-MM-dd HH:mm:ss"
              minDate={new Date()} // Interdit la sélection d'une date dans le passé
            />
            <button onClick={handleRequestAppointment}>Confirmer le rendez-vous</button>
          </div>
        )}

        {requestMessage && <p>{requestMessage}</p>}
      </div>
    </div>
  );
};

export default Rdv;