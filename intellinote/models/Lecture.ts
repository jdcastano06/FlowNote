import mongoose from "mongoose";

export interface ILecture extends mongoose.Document {
  userId: string;
  courseId: mongoose.Types.ObjectId;
  title: string;
  audioUrl: string;
  status: "uploaded" | "transcribed" | "processed";
  content: string; // AI-generated summary for audio transcripts, or manual content
  transcription?: string; // Raw transcription text from audio
  createdAt: Date;
  updatedAt: Date;
}

const LectureSchema = new mongoose.Schema<ILecture>(
  {
  userId: {
    type: String,
    required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
  },
  title: {
    type: String,
    required: true,
      trim: true,
  },
  audioUrl: {
    type: String,
      required: false,
      default: "",
  },
  status: {
    type: String,
      enum: ["uploaded", "transcribed", "processed"],
      default: "uploaded",
    },
    content: {
      type: String,
      required: true,
      default: "",
    },
    transcription: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for efficient queries
LectureSchema.index({ userId: 1, createdAt: -1 });
LectureSchema.index({ courseId: 1, createdAt: -1 });

// Clear the model cache to ensure updates are applied
if (mongoose.models.Lecture) {
  delete mongoose.models.Lecture;
}

export default mongoose.model<ILecture>("Lecture", LectureSchema);