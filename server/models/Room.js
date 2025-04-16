<<<<<<< HEAD
const mongoose = require('mongoose')

const RoomSchema = new mongoose.Schema({
    roomNumber: String,
    description: String
});

const RoomModel = mongoose.model("rooms", RoomSchema);
module.exports = RoomModel;
=======
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  roomNumber: String,
  availability: Boolean,
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const Room = mongoose.model("room", RoomSchema);
module.exports = Room;
>>>>>>> 7c4e19f2f9b86dd9f733b0b8866bfabfd5b704a8
