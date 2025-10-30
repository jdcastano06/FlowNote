import mongoose from 'mongoose';

/**
 * User Schema
 * 
 * Represents a user account in the system.
 * Users can have multiple courses (stored as references).
 */
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

export default mongoose.model('User', userSchema);

