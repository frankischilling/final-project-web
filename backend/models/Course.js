const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  instructor: {
    type: String,
  },
  term: {
    type: String,
  },
  color: {
    type: String,
    default: '#3b82f6', // Default to a blue color
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Course', courseSchema);
