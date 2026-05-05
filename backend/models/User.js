const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, trim: true }, // Added trim to prevent whitespace issues
  googleId: { type: String },
  createdAt: { type: Date, default: Date.now },
  refreshToken: { type: String }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified AND exists
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  
  try {
    // Prevent double hashing if somehow called twice
    if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$')) {
      console.log(`[USER MODEL] Password for ${this.email} already hashed, skipping.`);
      return next();
    }

    console.log(`[USER MODEL] Hashing password for ${this.email}...`);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    console.log(`[USER MODEL] Compare failed: No password hash for ${this.email}`);
    return false;
  }
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    if (!isMatch) {
      console.log(`[USER MODEL] Password mismatch for ${this.email}`);
    }
    return isMatch;
  } catch (err) {
    console.error(`[USER MODEL] Bcrypt error for ${this.email}:`, err);
    return false;
  }
};

module.exports = mongoose.model('User', UserSchema);
