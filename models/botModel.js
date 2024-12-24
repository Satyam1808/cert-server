const mongoose = require("mongoose");

const chatbotMessageSchema = new mongoose.Schema({
    message: { type: String, required: true },
    options: [{ type: String }], // List of follow-up options
    isInitial: { type: Boolean, default: false }, // Is this an initial message
    trigger: { type: String }, // Trigger message for response mapping
});

module.exports = mongoose.model("ChatbotMessage", chatbotMessageSchema);
