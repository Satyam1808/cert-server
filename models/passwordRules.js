const mongoose = require('mongoose');

const passwordRuleSchema = new mongoose.Schema({
  ruleType: { type: String, required: true },
  description: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

// Explicitly specify the collection name for consistency
module.exports = mongoose.model('PasswordRule', passwordRuleSchema, 'passwordRules');
