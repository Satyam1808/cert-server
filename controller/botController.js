const ChatbotMessage = require("../models/botModel");

// Get initial messages
exports.getInitialMessages = async (req, res) => {
    try {
        const initialMessages = await ChatbotMessage.find({ isInitial: true });
        res.status(200).json(initialMessages);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch initial messages" });
    }
};

// Handle user response and fetch next bot message
exports.getNextResponse = async (req, res) => {
    const { userMessage } = req.body;

    try {
        const response = await ChatbotMessage.findOne({ trigger: userMessage });
        if (response) {
            res.status(200).json(response);
        } else {
            res.status(200).json({
                message: "Sorry, I couldn't understand that. Please choose an option.",
                options: ["Try again", "Help"],
            });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to process response" });
    }
};

// Add a new chatbot message
exports.addChatbotMessage = async (req, res) => {
    const { message, options, isInitial, trigger } = req.body;

    try {
        const newMessage = new ChatbotMessage({
            message,
            options,
            isInitial,
            trigger,
        });

        await newMessage.save();
        res.status(201).json({ message: "Chatbot message added successfully", data: newMessage });
    } catch (error) {
        res.status(500).json({ error: "Failed to add chatbot message" });
    }
};
