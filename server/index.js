const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/User");
const Ambulance = require("./models/Ambulance");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const AmbulanceModel = require("./models/Ambulance");
const MaterialModel = require("./models/Material");
const AppointmentModel = require('./models/Appointment');
const Room = require('./models/Room');
const RoomModel = require("./models/Room");
const OperationModel = require('./models/Operation');
const { ObjectId } = require('mongoose').Types; // Import ObjectId

const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

const router = express.Router();
const client = new OAuth2Client("300857414061-8ff3ed18qghlb7r1bcqom4a52ki58ch0.apps.googleusercontent.com");

app.use(cookieParser());

const JWT_SECRET_KEY = "MaSuperCleSecrete123";
const EMAIL_USER = "saif.meddeb.52@gmail.com";
const EMAIL_PASS = "";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "saif.meddeb.52@gmail.com",
        pass: "oduf dfxn were ycps"
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.get("/appointments", async (req, res) => {
    try {
        const appointments = await AppointmentModel.find()
            .populate("patient", "name lastName")
            .populate("doctor", "name lastName");

        res.json(appointments);
    } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.post("/appointments", async (req, res) => {
    try {
      const { startTime, endTime, doctor, patient } = req.body;
  
      const newAppointment = new AppointmentModel({
        startTime,
        endTime,
        status: 'pending',
        doctor,
        patient,
      });
  
      const savedAppointment = await newAppointment.save();
  
      const doctorData = await UserModel.findById(doctor);
      const patientData = await UserModel.findById(patient);
  
      if (doctorData && doctorData.email) {
        await transporter.sendMail({
          from: '"Système de Rendez-vous 👨‍⚕️" <saif.meddeb.52@gmail.com>',
          to: doctorData.email,
          subject: "Nouveau Rendez-vous Réservé",
          html: `
            <p>Bonjour Dr. ${doctorData.name},</p>
            <p>Un nouveau rendez-vous a été réservé par le patient <strong>${patientData.name} ${patientData.lastName}</strong>.</p>
            <p><strong>Date :</strong> ${new Date(startTime).toLocaleString()}</p>
            <p>Merci de vérifier votre planning.</p>
          `
        });
  
        console.log("📧 Email envoyé au médecin:", doctorData.email);
      }
  
      res.status(201).json(savedAppointment);
    } catch (error) {
      console.error("❌ Erreur lors de la création du rendez-vous :", error.message);
      res.status(500).json({ message: "Erreur lors de la création du rendez-vous", error: error.message });
    }
  });


app.get("/appointments/medecin/:doctorId", async (req, res) => {
    try {
        const appointments = await AppointmentModel.find({ doctor: req.params.doctorId })
            .populate("patient", "name lastName")
            .sort({ startTime: 1 });

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.get('/medecin/pending/:doctorId', async (req, res) => {
    const { doctorId } = req.params;

    if (!ObjectId.isValid(doctorId)) {
        return res.status(400).json({ message: 'ID du médecin invalide.' });
    }

    try {
        const appointments = await AppointmentModel.find({
            doctor: doctorId,
            status: 'pending'
        }).populate('patient');

        res.status(200).json(appointments);
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous en attente :', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

app.put("/appointments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
  
      // Récupérer le rendez-vous avec les informations du patient et du médecin
      const appointment = await AppointmentModel.findById(id);
  
      if (!appointment) {
        return res.status(404).json({ message: "Rendez-vous non trouvé" });
      }
  
      // Récupérer le patient et le médecin via leurs IDs
      const patient = await UserModel.findById(appointment.patient);
      const doctor = await UserModel.findById(appointment.doctor);
  
      if (!patient || !doctor) {
        return res.status(404).json({ message: "Patient ou médecin introuvable" });
      }
  
      // Mettre à jour le statut du rendez-vous
      appointment.status = status;
      await appointment.save();
  
      // Préparer les variables pour l'email
      let subject = "";
      let text = "";
      const patientName = patient.name;
      const doctorName = doctor.name;
      const date = new Date(appointment.startTime).toLocaleString();
  
      // Créer le texte de l'email en fonction du statut
      if (status === "confirmed") {
        subject = "Confirmation de rendez-vous";
        text = `Bonjour ${patientName},\n\nVotre rendez-vous avec Dr. ${doctorName} a été CONFIRMÉ pour le ${date}.\n\nMerci.`;
      } else if (status === "cancelled") {
        subject = "Annulation de rendez-vous";
        text = `Bonjour ${patientName},\n\nNous vous informons que votre rendez-vous avec Dr. ${doctorName} prévu le ${date} a été ANNULÉ.\n\nMerci de votre compréhension.`;
      }
  
      
      if (patient?.email) {
        try {
          await transporter.sendMail({
            from: `"Cabinet Médical" <saif.meddeb.52@gmail.com>`, 
            to: patient.email, 
            subject,
            text,
          });
  
          res.json({
            message: "Statut mis à jour et email envoyé",
            appointment,
          });
        } catch (mailError) {
          console.error("Erreur lors de l'envoi de l'email :", mailError);
          res.status(500).json({
            message: "Statut mis à jour mais l'email n'a pas pu être envoyé",
            appointment,
            error: mailError.message,
          });
        }
      } else {
        res.json({
          message: "Statut mis à jour, mais l'email du patient est introuvable",
          appointment,
        });
      }
    } catch (error) {
      console.error("Erreur lors de l'update :", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  });
  
  app.put("/appointments/:id/cancel", async (req, res) => {
    try {
      const appointment = await AppointmentModel.findById(req.params.id);
  
      if (!appointment) {
        return res.status(404).json({ message: "Rendez-vous non trouvé" });
      }
  
      const patient = await UserModel.findById(appointment.patient);
      const doctor = await UserModel.findById(appointment.doctor);
  
      if (!patient || !doctor) {
        return res.status(404).json({ message: "Patient ou médecin introuvable" });
      }
  
      appointment.status = "canceled";
      await appointment.save();
  
      if (patient.email) {
        const subject = "Annulation de votre rendez-vous";
        const date = new Date(appointment.startTime).toLocaleString();
        const text = `Bonjour ${patient.name},\n\nVotre rendez-vous avec Dr. ${doctor.name} prévu le ${date} a été ANNULÉ.\n\nMerci de votre compréhension.`;
  
        await transporter.sendMail({
          from: `"Cabinet Médical" <saif.meddeb.52@gmail.com>`,
          to: patient.email,
          subject,
          text,
        });
      }
  
      res.json({ message: "Statut mis à jour et email envoyé", appointment });
    } catch (error) {
      console.error("Erreur lors de l'annulation :", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  });
  

app.get("/appointments/doctor/:doctorId", async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await AppointmentModel.find({ doctor: doctorId, status: "confirmed" })
            .populate("patient", "name lastName")
            .populate("doctor", "name lastName");

        res.json(appointments);
    } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.get("/appointments/patient/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        const appointments = await AppointmentModel.find({ patient: patientId })
            .populate("patient", "name lastName")
            .populate("doctor", "name lastName");

        res.json(appointments);
    } catch (error) {
        console.error("Erreur lors de la récupération des rendez-vous :", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.get('/users/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "ID invalide" });
        }

        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(user);
    } catch (error) {
        console.error("Erreur serveur :", error);
        res.status(500).json({ message: "Erreur interne du serveur" });
    }
});

// Connexion à MongoDB
mongoose.connect("mongodb://localhost:27017/lifelink")
    .then(() => console.log("✅ Connecté à MongoDB"))
    .catch(err => console.log("❌ Erreur MongoDB :", err));

// Middleware pour vérifier le token
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.json("Token is missing");

    jwt.verify(token, JWT_SECRET_KEY, (err, decoded) => {
        if (err) return res.json("Error with token");
        if (decoded.role === "admin") {
            next();
        } else {
            return res.json("Not an admin");
        }
    });
};

// Route d'inscription
app.post("/register", async (req, res) => {
    try {
        const { name, lastName, email, age, gender, phone, password, role } = req.body;

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({ name, lastName, email, age, gender, phone, password: hashedPassword, role });

        res.status(201).json({ message: "User created successfully", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

        if (!user.isVerifyed) {
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

            user.verificationCode = verificationCode;
            user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiration
            await user.save();

            await transporter.sendMail({
                from: "saif.meddeb.52@gmail.com",
                to: user.email,
                subject: "Code de vérification",
                text: `Votre code de vérification est : ${verificationCode}`,
            });

            return res.status(201).json({ message: "Vérification requise", email: user.email });
        }

        res.status(200).json({
            message: "Connexion réussie",
            role: user.role,
            name: user.name,
            userId: user._id,
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err });
    }
});

// Route pour réinitialisation du mot de passe
app.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserModel.findOne({ email });

        if (!user) return res.json({ Status: "User not found" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET_KEY, { expiresIn: "2d" });
        const resetUrl = `http://localhost:3000/reset-password/${user._id}/${token}`;

        const mailOptions = {
            from: EMAIL_USER,
            to: user.email,
            subject: "Reset your password",
            text: `Click the link to reset your password: ${resetUrl}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error sending email:", error);
                return res.status(500).send({ Status: "Error sending email", error: error.message });
            }
            res.send({ Status: "Success" });
        });

    } catch (err) {
        res.json({ error: err.message });
    }
});

app.get("/users", async (req, res) => {
    try {
        const users = await UserModel.find({}, "id name lastName email age phone gender role");
        if (!users.length) {
            return res.status(404).json({ message: "Aucun utilisateur trouvé" });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mise à jour du rôle uniquement
app.put("/users/:id/role", async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const updatedUser = await UserModel.findByIdAndUpdate(id, { role }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

// Mise à jour des autres informations de l'utilisateur
app.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedUser = await UserModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.post("/send_recovery_mail", async (req, res) => {
    try {
        const { recipient_email } = req.body;
        console.log("Email reçu :", recipient_email);

        const user = await UserModel.findOne({ email: recipient_email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const OTP = Math.floor(1000 + Math.random() * 9000);
        console.log("OTP généré :", OTP);

        user.otp = OTP;
        user.otpExpires = Date.now() + 5 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: EMAIL_USER,
            to: user.email,
            subject: "Votre code de récupération",
            html: `<p>Votre code OTP est : <strong>${OTP}</strong></p>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Erreur d'envoi d'email :", error);
                return res.status(500).json({ message: "Erreur d'envoi d'email", error: error.message });
            }
            console.log("Email envoyé :", info.response);
            res.json({ message: "OTP envoyé avec succès !" });
        });

    } catch (err) {
        console.error("Erreur serveur :", err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

app.post('/reset-password/:id/:token', async (req, res) => {
    const { id, token } = req.params;
    const { newpassword } = req.body;

    if (!newpassword) {
        return res.json({ Status: "Error", Message: "Nouveau mot de passe requis" });
    }

    jwt.verify(token, JWT_SECRET_KEY, async (err, decoded) => {
        if (err) {
            return res.json({ Status: "Error", Message: "Token invalide ou expiré" });
        }

        try {
            const hashedPassword = await bcrypt.hash(newpassword, 10);
            await UserModel.findByIdAndUpdate(id, { password: hashedPassword });
            res.json({ Status: "Succes" });
        } catch (error) {
            res.json({ Status: "Error", Message: "Erreur lors de la mise à jour du mot de passe" });
        }
    });
});

app.post("/google-login", async (req, res) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: "300857414061-8ff3ed18qghlb7r1bcqom4a52ki58ch0.apps.googleusercontent.com",
        });

        const payload = ticket.getPayload();
        console.log("Google User:", payload);

        let user = await UserModel.findOne({ email: payload.email });

        if (!user) {
            user = new UserModel({
                email: payload.email,
                name: payload.name,
                role: "PATIENT",
            });
            await user.save();
        }

        const userToken = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET_KEY, { expiresIn: "1h" });

        res.json({ token: userToken, role: user.role, userId: user._id });
    } catch (error) {
        console.error("Erreur Google Login:", error);
        res.status(401).json({ message: "Authentification Google échouée." });
    }
});

app.get('/api/doctors', async (req, res) => {
    try {
        const medecins = await UserModel.find({ role: "DOCTOR" });
        res.json(medecins);

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.get('/api/nurses', async (req, res) => {
    try {
        const nurses = await UserModel.find({ role: "NURSE" });
        res.json(nurses);

    } catch (err) {
        res.status(500).json(err);
    }
});

app.get('/api/patients', async (req, res) => {
    try {
        const patients = await UserModel.find({ role: "PATIENT" });
        res.json(patients);

    } catch (err) {
        res.status(500).json(err);

    }
});

app.get('/api/medecin/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const medecin = await UserModel.findById(id);
        res.json(medecin);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await UserModel.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.status(200).json({ message: "Utilisateur supprimé avec succès", deletedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/createAmbulance", async (req, res) => {
    try {
        const { model, serie, contact, location } = req.body;

        const existingAmbulance = await Ambulance.findOne({ serie });
        if (existingAmbulance) {
            return res.status(400).json({ message: "Ambulance with this serie already exists" });
        }

        const newAmbulance = await Ambulance.create({
            model,
            serie,
            contact,
            location
        });

        res.status(201).json({
            message: "Ambulance created successfully",
            ambulance: newAmbulance
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/rooms', async (req, res) => {
    try {
      const rooms = await RoomModel.find(); 
      res.status(200).json(rooms);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur lors de la récupération des salles' });
    }
  });

app.post("/addroom", async (req, res) => {
    try {
        const { roomNumber, description } = req.body;

        const existingRoom = await RoomModel.findOne({ roomNumber });
        if (existingRoom) {
            return res.status(400).json({ message: "Room with this number already exists" });
        }

        const newRoom = await RoomModel.create({
            roomNumber,
            description
        });

        res.status(201).json({
            message: "Room created successfully",
            ambulance: newRoom
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/room", async (req, res) => {
    try {
      const { roomNumber, availability, patient } = req.body;
      const newRoom = await Room.create({
        roomNumber,
        availability,
        patient,
      });
      res.status(201).json({ message: "Salle créée avec succès", room: newRoom });
    } catch (error) {
      console.error("Erreur lors de la création de la salle :", error);
      res.status(500).json({ message: "Erreur serveur lors de la création de la salle", error });
    }
  });
  
  app.get("/room", async (req, res) => {
    try {
      const rooms = await Room.find(); // Optionnel : pour avoir les infos du patient
      res.status(200).json(rooms);
    } catch (error) {
      console.error("Erreur lors de la récupération des salles :", error);
      res.status(500).json({ message: "Erreur serveur", error });
    }
  });
  
  app.delete("/room/:id", async (req, res) => {
    try {
      const deletedRoom = await Room.findByIdAndDelete(req.params.id);
      if (!deletedRoom) {
        return res.status(404).json({ message: "Salle non trouvée" });
      }
      res.status(200).json({ message: "Salle supprimée avec succès" });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  });
  
  app.put("/room/:id", async (req, res) => {
    try {
      const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
      res.status(200).json(updatedRoom);
    } catch (err) {
      res.status(500).json({ message: "Erreur lors de la mise à jour", err });
    }
  });


app.get("/ambulances", async (req, res) => {
    try {
        const ambulances = await Ambulance.find({}, "id model serie contact location status");
        if (!ambulances.length) {
            return res.status(404).json({ message: "Aucune ambulance trouvée" });
        }
        res.status(200).json(ambulances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/ambulances/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAmbulance = await AmbulanceModel.findByIdAndDelete(id);

        if (!deletedAmbulance) {
            return res.status(404).json({ message: "Ambulance non trouvé" });
        }

        res.status(200).json({ message: "Ambulance supprimé avec succès", deletedAmbulance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/ambulances/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedAmbulance = await AmbulanceModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedAmbulance) {
            return res.status(404).json({ message: "Ambulance non trouvé" });
        }

        res.json(updatedAmbulance);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

app.post("/verify-code", async (req, res) => {
    const { email, code } = req.body;
    try {
        const user = await UserModel.findOne({ email });
        if (!user || user.verificationCode !== code || user.verificationCodeExpires < Date.now()) {
            return res.status(400).json({ success: false, message: "Code invalide ou expiré." });
        }
        user.isVerifyed = true;
        user.verificationCode = null;
        user.verificationCodeExpires = null;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Vérification réussie",
            role: user.role,
            name: user.name

        });

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.post("/materials", async (req, res) => {
    try {
        const { name, quantity } = req.body;
        const newMaterial = await MaterialModel.create({ name, quantity });
        res.status(201).json({ message: "Material created successfully", material: newMaterial });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all materials
app.get("/materials", async (req, res) => {
    try {
        const materials = await MaterialModel.find({});
        if (!materials.length) {
            return res.status(404).json({ message: "No materials found" });
        }
        res.status(200).json(materials);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a material by ID
app.get("/materials/:id", async (req, res) => {
    try {
        const material = await MaterialModel.findById(req.params.id);
        if (!material) {
            return res.status(404).json({ message: "Material not found" });
        }
        res.json(material);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a material by ID
app.put("/materials/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedMaterial = await MaterialModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedMaterial) {
            return res.status(404).json({ message: "Material not found" });
        }

        res.json(updatedMaterial);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/materials/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedMaterial = await MaterialModel.findByIdAndDelete(id);

        if (!deletedMaterial) {
            return res.status(404).json({ message: "Material not found" });
        }

        res.status(200).json({ message: "Material deleted successfully", deletedMaterial });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/operations', async (req, res) => {
    try {
        const { startTime, endTime, description, patient, doctor, room } = req.body;

        if (!startTime || !endTime || !patient || !doctor || !room) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        const patientExists = await UserModel.findById(patient);
        const doctorExists = await UserModel.findById(doctor);
        const roomExists = await RoomModel.findById(room);

        if (!patientExists || !doctorExists || !roomExists) {
            return res.status(400).json({ message: "Le patient, le médecin ou la salle n'existent pas" });
        }

        const newOperation = new OperationModel({
            startTime,
            endTime,
            description,
            patient,
            doctor,
            room
        });

        await newOperation.save();

        res.status(201).json({ message: "Opération ajoutée avec succès", operation: newOperation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Une erreur est survenue lors de l'ajout de l'opération" });
    }
});

app.get('/doctor/:doctorId', async (req, res) => {
    const { doctorId } = req.params;

    try {
        const operations = await OperationModel.find({ doctor: doctorId });

        res.json(operations);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des opérations' });
    }
});

app.get('/patient/:patientId', async (req, res) => {
    const { patientId } = req.params;

    try {
        const operations = await OperationModel.find({ patient: patientId });

        res.json(operations);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur lors de la récupération des opérations' });
    }
});

app.get('/api/rooms', async (req, res) => {
    try {
        const rooms = await RoomModel.find();
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des salles' });
    }
});

app.get('/api/medecins/:specialite', async (req, res) => {
    try {
        const { specialite } = req.params;

        const medecins = await UserModel.find({ speciality: specialite ,role:"DOCTOR"});

        if (!medecins || medecins.length === 0) {
            return res.status(404).json({ message: 'Aucun médecin trouvé pour cette spécialité' });
        }

        return res.json(medecins);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});

app.put("/doctor/:id/speciality", async (req, res) => {
    try {
        const { id } = req.params;
        const { speciality } = req.body;

        const updatedDoctor = await UserModel.findByIdAndUpdate(id, { speciality }, { new: true });

        if (!updatedDoctor) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        res.json(updatedDoctor);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
});

app.post("/api/complaints", async (req, res) => {
    try {
        const { description, patientId } = req.body;

        if (!description || !patientId) {
            return res.status(400).json({ message: "Description and patient ID are required." });
        }

        const newComplaint = new ComplaintModel({
            description,
            patient: patientId
        });

        await newComplaint.save();
        res.status(201).json({ message: "Complaint submitted successfully", complaint: newComplaint });
    } catch (error) {
        console.error("Error submitting complaint:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get("/api/complaints/:patientId", async (req, res) => {
    try {
        const { patientId } = req.params;
        const complaints = await ComplaintModel.find({ patient: patientId });

        res.json(complaints);
    } catch (error) {
        console.error("Error fetching complaints:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.put("/api/complaints/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "In Treatment", "Resolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
    }

    try {
        const updatedComplaint = await ComplaintModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedComplaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        res.json(updatedComplaint);
    } catch (error) {
        console.error("Error updating complaint status:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.get('/appointments/medecin/:idMedecin', async (req, res) => {
    const { idMedecin } = req.params;

    try {
        // Chercher uniquement les startTime des rendez-vous du médecin
        const appointments = await AppointmentModel.find({ doctor: idMedecin }).select('startTime -_id');

        if (!appointments.length) {
            return res.status(404).json({ message: 'Aucun rendez-vous trouvé pour ce médecin' });
        }

        // Extraire uniquement les startTime
        const startTimes = appointments.map(appointment => appointment.startTime);

        // Envoyer le résultat
        res.status(200).json({ startTimes });
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.get('/appointments/patient/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Chercher tous les rendez-vous pour le patient (par userId)
        const appointments = await AppointmentModel.find({ patient: userId });

        if (!appointments.length) {
            return res.status(404).json({ message: 'Aucun rendez-vous trouvé pour ce patient' });
        }

        // Envoyer les données complètes des rendez-vous
        res.status(200).json({ appointments });
    } catch (error) {
        console.error('Erreur lors de la récupération des rendez-vous:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

app.listen(3001, () => console.log("✅ Server is running on http://localhost:3001"));
