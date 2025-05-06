const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["read", "unread"],
        default: "unread"
    },
    relatedTo: {
        type: String,
        enum: ["complaint", "appointment", "operation", "system"],
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;