import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAttemptAnswer extends Document {
  _id: Types.ObjectId;
  attemptId: Types.ObjectId;
  questionId: Types.ObjectId;
  selectedOptionId?: Types.ObjectId;
  freeText?: string; // For essay answers
  autoScore?: number; // Auto-calculated score for MCQ/True-False
  manual_score?: number; // Teacher-assigned score for essay/oral
  comment?: string; // Teacher comment
  isOralReady?: boolean; // Student marked as ready for oral exam
  oralGradedAt?: Date; // When teacher graded the oral exam
  createdAt: Date;
  updatedAt: Date;
}

const AttemptAnswerSchema = new Schema<IAttemptAnswer>(
  {
    attemptId: {
      type: Schema.Types.ObjectId,
      ref: "Attempt",
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    selectedOptionId: {
      type: Schema.Types.ObjectId,
      ref: "QuestionOption",
    },
    freeText: {
      type: String,
    },
    autoScore: {
      type: Number,
      default: 0,
    },
    manual_score: {
      type: Number,
    },
    comment: {
      type: String,
    },
    isOralReady: {
      type: Boolean,
      default: false,
    },
    oralGradedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Indexes

export default mongoose.models.AttemptAnswer ||
  mongoose.model<IAttemptAnswer>("AttemptAnswer", AttemptAnswerSchema);
