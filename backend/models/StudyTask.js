const mongoose = require('mongoose');

const studyTaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // Optional, can be a general study task
    ref: 'Course',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  durationMinutes: {
    type: Number,
    default: 60,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudyTask', studyTaskSchema);
