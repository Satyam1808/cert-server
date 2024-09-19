const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    resetToken: { type: String },
    resetTokenExpiration: { type: Date }
  }, { timestamps: { createdAt: 'createdAt' } });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Check if the password is already hashed
  if (!this.isModified('password')) return next();
  
  // Avoid re-hashing if it's already a bcrypt hash
  const passwordRegex = /^\$2[aby]\$.{56}$/;
  if (passwordRegex.test(this.password)) {
    return next();
  }

  // If not hashed, then hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', UserSchema);
