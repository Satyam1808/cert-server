const mongoose = require("mongoose");

const apiUsageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    requests: [{ timestamp: Date }]
});

module.exports = mongoose.model("ApiUsage", apiUsageSchema);
