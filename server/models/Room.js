const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: String,
  type: String,
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  description: String,
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: false
  }
});

const Room = mongoose.model("room", RoomSchema);
module.exports = Room;