import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGrade extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const GradeSchema = new Schema<IGrade>(
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

export default mongoose.models.Grade ||
  mongoose.model<IGrade>("Grade", GradeSchema);
