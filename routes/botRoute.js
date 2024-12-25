const express = require("express");
const { getInitialMessages, getNextResponse, addChatbotMessage } = require("../controller/botController");

const router = express.Router();
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");   
const adminAuthMiddleware = require("../middlewares/authMiddleware");

// Get initial messages
router.get("/initial",userAuthMiddleware, getInitialMessages);

// Get the next response based on user input
router.post("/respond",userAuthMiddleware, getNextResponse);

// Add a new chatbot message
router.post("/add", adminAuthMiddleware,addChatbotMessage);

module.exports = router;
