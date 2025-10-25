import mongoose, { Schema, Document, Types } from "mongoose";

export interface IAttempt extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  examId: Types.ObjectId;
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
  totalScore?: number;
  percentage?: number;
  isCompleted: boolean;

  // Teacher grading status
  teacherGradingComplete?: boolean;

  // Supervisor approval status
  supervisorApprovalComplete?: boolean;
  supervisorApproved?: boolean; // Used by supervisor approval API
  supervisorNotes?: string; // Supervisor notes
  allSubjectsApproved?: boolean;

  // Manager final approval
  finalStatus?: "pending" | "approved" | "rejected" | "conditional"; // قبول | رفض | قبول مشروط
  finalApprovedBy?: Types.ObjectId; // Manager ID
  finalApprovedAt?: Date;
  managerNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const AttemptSchema = new Schema<IAttempt>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    score: {
      type: Number,
    },
    totalScore: {
      type: Number,
    },
    percentage: {
      type: Number,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    teacherGradingComplete: {
      type: Boolean,
      default: false,
    },
    supervisorApprovalComplete: {
      type: Boolean,
      default: false,
    },
    supervisorApproved: {
      type: Boolean,
      default: false,
    },
    supervisorNotes: {
      type: String,
    },
    allSubjectsApproved: {
      type: Boolean,
      default: false,
    },
    finalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "conditional"],
      default: "pending",
    },
    finalApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    finalApprovedAt: {
      type: Date,
    },
    managerNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Indexes

export default mongoose.models.Attempt ||
  mongoose.model<IAttempt>("Attempt", AttemptSchema);
