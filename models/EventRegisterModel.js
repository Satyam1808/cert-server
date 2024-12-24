// models/Registration.js
const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    eventId: { type: String, required: true },
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    organization: { type: String, required: true },
    registrationId: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RegisteredUserForEvent', RegistrationSchema);
