const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
  category: { type: String, required: true, trim: true },
  starterCode: { type: String, default: '' },
  testCases: [{
    input: String,
    output: String,
    explanation: String
  }],
  solution: { type: String },
  hints: [{ type: String }],
  timeLimit: { type: Number, default: 60 },

  // 🚀 Recommended Enhancements:
  interviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isEditable: { type: Boolean, default: true },
  version: { type: Number, default: 1 },
  visibility: { type: String, enum: ['private', 'public', 'shared'], default: 'private' },
  tags: [{ type: String, trim: true }],
  constraints: { type: String, default: '' }

}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
