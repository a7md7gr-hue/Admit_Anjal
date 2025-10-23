import mongoose, { Schema, Document, Types } from "mongoose";

export interface IManagerAssignment extends Document {
  _id: Types.ObjectId;
  managerId: Types.ObjectId;
  schoolId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ManagerAssignmentSchema = new Schema<IManagerAssignment>(
  {
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Indexes

export default mongoose.models.ManagerAssignment ||
  mongoose.model<IManagerAssignment>(
    "ManagerAssignment",
    ManagerAssignmentSchema,
  );
