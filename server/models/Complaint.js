const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["Pending", "In Treatment", "Resolved"],
    default: "Pending",
  },
});

const ComplaintModel = mongoose.model("Complaint", ComplaintSchema);
module.exports = ComplaintModel;
