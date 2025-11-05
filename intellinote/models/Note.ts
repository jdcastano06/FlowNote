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
  }
}, {
  timestamps: true
});

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);

export default Note;

