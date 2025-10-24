import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITeacherAssignment extends Document {
  _id: Types.ObjectId;
  teacherId: Types.ObjectId;
  subjectId: Types.ObjectId;
  gradeIds: Types.ObjectId[]; // Array of grades this teacher teaches
  schoolId: Types.ObjectId;
  programId: Types.ObjectId;
  isActive: boolean;
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
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    gradeIds: [{
      type: Schema.Types.ObjectId,
      ref: "Grade",
    }],
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Composite index: one assignment per teacher per subject per school/program
TeacherAssignmentSchema.index({ teacherId: 1, subjectId: 1, schoolId: 1, programId: 1 }, { unique: true });

export default mongoose.models.TeacherAssignment ||
  mongoose.model<ITeacherAssignment>(
    "TeacherAssignment",
    TeacherAssignmentSchema,
  );
