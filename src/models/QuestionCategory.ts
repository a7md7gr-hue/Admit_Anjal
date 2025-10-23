import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuestionCategory extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionCategorySchema = new Schema<IQuestionCategory>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

export default mongoose.models.QuestionCategory ||
  mongoose.model<IQuestionCategory>("QuestionCategory", QuestionCategorySchema);
