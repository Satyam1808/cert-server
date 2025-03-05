const ApiUsage = require("../models/ApiUsage");

const RATE_LIMITS = { daily: 10, perMinute: 2 };

module.exports = async (req, res, next) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ error: "Unauthorized access" });
        }

        const userId = req.user.userId;
        const now = new Date();

        let userUsage = await ApiUsage.findOne({ userId });

        if (!userUsage) {
            userUsage = new ApiUsage({ userId, requests: [] });
        }

        // Filter requests made in the last 24 hours
        userUsage.requests = userUsage.requests.filter(req => (now - new Date(req.timestamp)) < 24 * 60 * 60 * 1000);

        if (userUsage.requests.length >= RATE_LIMITS.daily) {
            return res.status(429).json({ error: "Daily API limit reached. Try again tomorrow." });
        }

        // Filter requests made in the last 1 minute
        const recentRequests = userUsage.requests.filter(req => (now - new Date(req.timestamp)) < 60 * 1000);
        if (recentRequests.length >= RATE_LIMITS.perMinute) {
            return res.status(429).json({ error: "Too many requests. Try again later." });
        }

        userUsage.requests.push({ timestamp: now });
        await userUsage.save();

        next();
    } catch (error) {
        console.error("Rate limit error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
