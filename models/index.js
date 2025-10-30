/**
 * Models Index
 * 
 * Central export point for all Mongoose models.
 * Import models using: import { User, Course, Lecture, Transcript, StudyPack } from './models/index.js';
 */

import User from './User.js';
import Course from './Course.js';
import Lecture from './Lecture.js';
import Transcript from './Transcript.js';
import StudyPack from './StudyPack.js';

export {
  User,
  Course,
  Lecture,
  Transcript,
  StudyPack
};

