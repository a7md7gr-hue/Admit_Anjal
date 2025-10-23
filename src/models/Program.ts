import mongoose, { Schema, Document, Types } from "mongoose";

export interface IProgram extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProgramSchema = new Schema<IProgram>(
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

export default mongoose.models.Program ||
  mongoose.model<IProgram>("Program", ProgramSchema);
