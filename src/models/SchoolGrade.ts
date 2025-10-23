import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISchoolGrade extends Document {
  _id: Types.ObjectId;
  schoolId: Types.ObjectId;
  gradeId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SchoolGradeSchema = new Schema<ISchoolGrade>(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Unique constraint: one entry per school-grade combination
SchoolGradeSchema.index({ schoolId: 1, gradeId: 1 }, { unique: true });

export default mongoose.models.SchoolGrade ||
  mongoose.model<ISchoolGrade>("SchoolGrade", SchoolGradeSchema);
