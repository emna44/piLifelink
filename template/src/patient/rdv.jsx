import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import DateTimePicker from 'react-datetime-picker';
import './rdv.css';

const localizer = momentLocalizer(moment);

const Rdv = () => {
  const { idMedecin } = useParams();
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [requestMessage, setRequestMessage] = useState('');

  const fetchData = async () => {
    try {
      const appointmentsResponse = await axios.get(`http://localhost:3001/appointments/medecin/${idMedecin}`);
      const formattedAppointments = appointmentsResponse.data.startTimes.map(startTime => ({
        title: 'Rendez-vous',
        start: new Date(startTime),
        end: new Date(new Date(startTime).getTime() + 60 * 60 * 1000),
      }));

      const operationsResponse = await axios.get(`http://localhost:3001/doctor/${idMedecin}`);
      const formattedOperations = operationsResponse.data.map(op => ({
        title: `Opération : ${op.description}`,
        start: new Date(op.startTime),
        end: new Date(op.endTime),
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

    // ❌ Ne pas autoriser une date passée
    if (startTime < new Date()) {
      setRequestMessage("Impossible de prendre un rendez-vous dans le passé.");
      return;
    }

    // ❌ Ne pas autoriser un créneau déjà pris
    if (!isSlotAvailable(startTime.getTime(), endTime.getTime())) {
      setRequestMessage("Ce créneau est déjà occupé. Veuillez en choisir un autre.");
      return;
    }

    try {
      const response = await axios.post(`http://localhost:3001/appointments`, {
        startTime,
        endTime,
        status: 'pending',
        patient: '661cb1e7a49fabe253a8b90a', // 🔁 À remplacer dynamiquement
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
        />

        {selectedDate && selectedTime && (
          <div>
            <p>Date sélectionnée : {selectedDate.toDateString()}</p>
            <DateTimePicker
              onChange={setSelectedTime}
              value={selectedTime}
              format="y-MM-dd HH:mm:ss"
              minDate={new Date()} // 🔐 Interdit la sélection d'une date dans le passé
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
