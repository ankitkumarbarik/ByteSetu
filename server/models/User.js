const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'reviewer', 'author'],
    default: 'author'
  },
  qualifications: {
    type: String, // Specific to reviewers
    default: ''
  },
  reviewerStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: function () {
      return this.role === 'reviewer' ? 'PENDING' : 'APPROVED'; // Authors/Admins auto-approved/not-applicable
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

module.exports = mongoose.model('User', userSchema);
