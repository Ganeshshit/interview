const mongoose = require('mongoose');
const interviewSchema = new mongoose.Schema({
  interviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  topic: {
    type: String,
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  meetingLink: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'in-progress','ended'],
    default: 'scheduled',
    lowercase: true
  },
  currentQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  feedback: {
    rating: Number,
    comments: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to ensure status is lowercase
interviewSchema.pre('save', function(next) {
  if (this.status) {
    this.status = this.status.toLowerCase();
  }
  next();
});

module.exports = mongoose.model('Interview', interviewSchema);