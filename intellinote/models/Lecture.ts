import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Lecture Schema
 * 
 * Represents a lecture recording associated with a course.
 * Each lecture has one transcript and one study pack.
 * Status tracks the processing pipeline: uploaded -> transcribed -> processed
 */
export interface ILecture extends Document {
  courseId: mongoose.Types.ObjectId;
  userId: string; // Clerk user ID
  title: string;
  audioUrl: string;
  status: 'uploaded' | 'transcribed' | 'processed';
  createdAt: Date;
  updatedAt: Date;
}

const lectureSchema = new Schema<ILecture>({
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
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
  audioUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['uploaded', 'transcribed', 'processed'],
    default: 'uploaded'
  }
}, {
  timestamps: true
});

const Lecture: Model<ILecture> = mongoose.models.Lecture || mongoose.model<ILecture>('Lecture', lectureSchema);

export default Lecture;

