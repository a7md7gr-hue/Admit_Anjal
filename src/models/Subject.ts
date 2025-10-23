import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubject extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
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

export default mongoose.models.Subject ||
  mongoose.model<ISubject>("Subject", SubjectSchema);
