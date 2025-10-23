import mongoose, { Schema, Document, Types } from "mongoose";

export interface IRole extends Document {
  _id: Types.ObjectId;
  code: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
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
    autoIndex: false, // Disable auto index creation
  },
);

export default mongoose.models.Role ||
  mongoose.model<IRole>("Role", RoleSchema);
