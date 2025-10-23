import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuestionOption extends Document {
  _id: Types.ObjectId;
  questionId: Types.ObjectId;
  optionText: string;
  isCorrect: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema<IQuestionOption>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    optionText: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

export default mongoose.models.QuestionOption ||
  mongoose.model<IQuestionOption>("QuestionOption", QuestionOptionSchema);
