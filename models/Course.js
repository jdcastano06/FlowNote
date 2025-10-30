import mongoose from 'mongoose';

/**
 * Course Schema
 * 
 * Represents a course that belongs to a user.
 * Each course can have multiple lectures (stored as references).
 */
const courseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

export default mongoose.model('Course', courseSchema);

