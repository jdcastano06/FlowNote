/**
 * Central model registration file
 * 
 * This file ensures all models are registered in the correct order
 * for serverless environments (like Vercel). This is critical when
 * using .populate() with model references.
 * 
 * Import models from this file instead of directly from their
 * individual files to ensure proper registration order.
 */

// Import in dependency order: Course must be imported before Lecture
// since Lecture references Course in its schema
import Course from './Course';
import User from './User';
import Lecture from './Lecture';

export { Course, User, Lecture };
export type { ICourse } from './Course';
export type { IUser } from './User';
export type { ILecture } from './Lecture';

