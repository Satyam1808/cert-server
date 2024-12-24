const express = require("express");
const { getInitialMessages, getNextResponse, addChatbotMessage } = require("../controller/botController");

const router = express.Router();

// Get initial messages
router.get("/initial", getInitialMessages);

// Get the next response based on user input
router.post("/respond", getNextResponse);

// Add a new chatbot message
router.post("/add", addChatbotMessage);

module.exports = router;
