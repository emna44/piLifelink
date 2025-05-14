const mongoose = require('mongoose')

const medicalHistoryOptions = [
  "asthme", "diabète", "hypertension", "allergies", "maladie cardiaque",
  "antécédents d'AVC", "cholestérol élevé", "eczéma", "glaucome",
  "appendicite", "infection rénale", "bronchite chronique", "polypes intestinaux"
];

const UserSchema = new mongoose.Schema({
    id: Number,
    name: String,
    lastName: String,
    email: String,
    age: Number,
    gender: String,
    phone: String,
    password: String,
    bloc: String,
    speciality: {
        type: String,
        enum: [
            "Cardiologie", "Neurologie", "Pédiatrie", "Gynécologie-obstétrique", 
            "Traumatologie", "Pneumologie", "Néphrologie", "Gastro-entérologie", 
            "Oncologie", "Psychiatrie", "Radiologie", "Anesthésie-réanimation"
        ],
        default: undefined 
    },
    medicalHistory: String,
    testResults: String,
    isVerifyed: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["ADMIN", "PATIENT", "NURSE", "DOCTOR"],
        default: "PATIENT"
    },
    status: String,
    images: [String],
    files: [String],  
    diagnostics: [
        {
            date: {
                type: Date,
                default: Date.now
            },
            result: {
                type: String,
                enum: ["Normal", "Malade", "Non analysé"],
                default: "Non analysé"
            }
        }
    ],

    verificationCode: String,
    verificationCodeExpires: Date 
})

UserSchema.pre('save', function (next) {
  if (!this.medicalHistory) {
    const randomIndex = Math.floor(Math.random() * medicalHistoryOptions.length);
    this.medicalHistory = medicalHistoryOptions[randomIndex];
  }
  next();
});

const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel