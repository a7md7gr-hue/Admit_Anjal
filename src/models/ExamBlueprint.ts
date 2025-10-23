import mongoose, { Schema, Document, Types } from "mongoose";

export interface IExamBlueprint extends Document {
  _id: Types.ObjectId;
  examId: Types.ObjectId;
  questionId: Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExamBlueprintSchema = new Schema<IExamBlueprint>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Indexes

export default mongoose.models.ExamBlueprint ||
  mongoose.model<IExamBlueprint>("ExamBlueprint", ExamBlueprintSchema);
