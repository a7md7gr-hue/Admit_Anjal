import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISupervisorAssignment extends Document {
  _id: Types.ObjectId;
  supervisorId: Types.ObjectId;
  teacherId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupervisorAssignmentSchema = new Schema<ISupervisorAssignment>(
  {
    supervisorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Indexes

export default mongoose.models.SupervisorAssignment ||
  mongoose.model<ISupervisorAssignment>(
    "SupervisorAssignment",
    SupervisorAssignmentSchema,
  );
