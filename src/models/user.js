import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true }
});

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },

    // Unique identifier from app (VERY IMPORTANT)
    deviceId: { type: String, required: true, unique: true },

    phone: { type: String },

    email: { type: String },

    contacts: {
        type: [contactSchema],
        validate: [arr => arr.length > 0, "At least 1 contact required"]
    },

    // Socket connection tracking
    socketId: { type: String },

    // SOS state
    sosActive: { type: Boolean, default: false },

    // Optional: last known location
    lastLocation: {
        lat: Number,
        lng: Number
    }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;