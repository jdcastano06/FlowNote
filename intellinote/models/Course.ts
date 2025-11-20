import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Course Schema
 * 
 * Represents a course that belongs to a user.
 * Each course can have multiple lectures/notes.
 */
export interface ICourse extends Document {
  userId: string; // Clerk user ID
  title: string;
  description?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>({
  userId: {
    type: String,
    required: true,
    index: true
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
  icon: {
    type: String,
    trim: true,
    default: '📚'
  }
}, {
  timestamps: true
});

// Use the serverless-friendly pattern for model registration
const Course: Model<ICourse> = mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);

export default Course;

