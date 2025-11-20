// Model exports - Course must be imported before Lecture due to schema reference
import Course from './Course';
import User from './User';
import Lecture from './Lecture';

export { Course, User, Lecture };
export type { ICourse } from './Course';
export type { IUser } from './User';
export type { ILecture } from './Lecture';

