import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * User Schema
 * 
 * Represents a user account in the system.
 * Uses Clerk userId for authentication.
 * Users can have multiple courses (stored as references).
 */
export interface IUser extends Document {
  clerkUserId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  courses: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  courses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;

