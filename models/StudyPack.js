import mongoose from 'mongoose';

/**
 * StudyPack Schema
 * 
 * Represents AI-generated study materials for a lecture.
 * Contains summary, key points, flashcards, and quiz questions.
 */
const flashcardSchema = new mongoose.Schema({
  q: {
    type: String,
    required: true // Question
  },
  a: {
    type: String,
    required: true // Answer
  }
}, { _id: false });

const quizQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  choices: {
    type: [String],
    required: true
  },
  answerIndex: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const studyPackSchema = new mongoose.Schema({
  lectureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: true,
    unique: true // One study pack per lecture
  },
  summary: {
    type: String,
    required: true
  },
  keyPoints: [{
    type: String,
    required: true
  }],
  flashcards: [flashcardSchema],
  quiz: [quizQuestionSchema]
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

export default mongoose.model('StudyPack', studyPackSchema);

