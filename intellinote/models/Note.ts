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
  type?: 'lecture' | 'reading' | 'assignment' | 'lab' | 'other';
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
    enum: ['lecture', 'reading', 'assignment', 'lab', 'other'],
    default: 'lecture'
  },
  summary: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Clear existing model in development to pick up schema changes
if (process.env.NODE_ENV === 'development' && mongoose.models.Note) {
  delete mongoose.models.Note;
}

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);

export default Note;

