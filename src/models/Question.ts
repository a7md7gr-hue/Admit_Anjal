import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuestion extends Document {
  _id: Types.ObjectId;
  subjectId: Types.ObjectId;
  programId: Types.ObjectId;
  gradeId: Types.ObjectId;
  questionType: string; // mcq, true_false, essay, oral
  questionText: string;
  imageUrl?: string; // URL or path to question image
  points?: number;
  isApproved?: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    questionType: {
      type: String,
      required: true,
      enum: ["mcq", "true_false", "essay", "oral"],
    },
    questionText: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
    },
    points: {
      type: Number,
      default: 1,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

export default mongoose.models.Question ||
  mongoose.model<IQuestion>("Question", QuestionSchema);
