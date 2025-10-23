import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITeacherAssignment extends Document {
  _id: Types.ObjectId;
  teacherId: Types.ObjectId;
  examId: Types.ObjectId;
  subjectId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TeacherAssignmentSchema = new Schema<ITeacherAssignment>(
  {
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Indexes

export default mongoose.models.TeacherAssignment ||
  mongoose.model<ITeacherAssignment>(
    "TeacherAssignment",
    TeacherAssignmentSchema,
  );
