const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  }
});

module.exports = mongoose.model('User', UserSchema);
