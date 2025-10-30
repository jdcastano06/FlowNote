import mongoose from 'mongoose';

/**
 * Lecture Schema
 * 
 * Represents a lecture recording associated with a course.
 * Each lecture has one transcript and one study pack.
 * Status tracks the processing pipeline: uploaded -> transcribed -> processed
 */
const lectureSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  audioUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'transcribed', 'processed'],
    default: 'uploaded'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

export default mongoose.model('Lecture', lectureSchema);

