import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Note Schema
 * 
 * Represents a note that belongs to a course.
 * Each note has a title and content.
 */
export interface INote extends Document {
  courseId: mongoose.Types.ObjectId;
  userId: string; // Clerk user ID
  title: string;
  content: string;
  type?: string;
  tags?: string[];
  status?: string;
  summary?: string;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
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
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'Note',
    enum: ['Note', 'Lecture', 'Reading', 'Assignment', 'Lab', 'Exam']
  },
  tags: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'completed', 'archived']
  },
  summary: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);

export default Note;

