const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  unit: {
    type: String,
    default: 'General'
  }
}, { timestamps: true });

const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  examDate: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  topics: [TopicSchema]
}, { timestamps: true });

module.exports = mongoose.model('Subject', SubjectSchema);
