import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISchool extends Document {
  _id: Types.ObjectId;
  shortCode: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolSchema = new Schema<ISchool>(
  {
    shortCode: {
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

export default mongoose.models.School ||
  mongoose.model<ISchool>("School", SchoolSchema);
