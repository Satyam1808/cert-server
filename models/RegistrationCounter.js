// models/RegistrationCounter.js
const mongoose = require('mongoose');

const RegistrationCounterSchema = new mongoose.Schema({
    lastRegistrationNum: { type: Number, default: 0 }, // Global counter for registrations
});

module.exports = mongoose.model('RegistrationCounter', RegistrationCounterSchema);
