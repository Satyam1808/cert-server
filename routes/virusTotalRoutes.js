const express = require("express");
const { submitUrl,getReport } = require("../controller/virusTotalController");
const authMiddleware = require("../middlewares/userAuthMiddleware");
const rateLimitMiddleware = require("../middlewares/rateLimitMiddleware");

const router = express.Router();
router.post("/scan-url", authMiddleware, rateLimitMiddleware, submitUrl);
router.get("/get-report/:urlId", authMiddleware, rateLimitMiddleware, getReport);

module.exports = router;
