import mongoose, { Schema, Document, Types } from "mongoose";

export interface IExam extends Document {
  _id: Types.ObjectId;
  name: string;
  subjectId: Types.ObjectId;
  programId: Types.ObjectId;
  gradeId: Types.ObjectId;
  schoolId: Types.ObjectId; // المدرسة
  startDate: Date; // تاريخ بدء الامتحان
  endDate: Date; // تاريخ انتهاء الامتحان
  duration: number; // مدة الامتحان بالدقائق
  totalMarks: number; // مجموع الدرجات
  passingMarks: number; // درجة النجاح
  instructions?: string; // تعليمات الامتحان
  isActive: boolean;
  createdBy: Types.ObjectId; // من أنشأ الامتحان
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    programId: {
      type: Schema.Types.ObjectId,
      ref: "Program",
      required: true,
    },
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: true,
      min: 1,
    },
    passingMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    instructions: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
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

export default mongoose.models.Exam ||
  mongoose.model<IExam>("Exam", ExamSchema);
