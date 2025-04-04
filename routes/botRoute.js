const express = require("express");
const { getInitialMessages, getNextResponse, addChatbotMessage } = require("../controller/botController");

const router = express.Router();
const userAuthMiddleware = require("../middlewares/userAuthMiddleware");   
const adminAuthMiddleware = require("../middlewares/authMiddleware");

router.get("/initial",userAuthMiddleware, getInitialMessages);

router.post("/respond",userAuthMiddleware, getNextResponse);

router.post("/add", adminAuthMiddleware,addChatbotMessage);

module.exports = router;
