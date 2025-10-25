import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGradeApproval extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  examId: Types.ObjectId; // Exam being approved
  managerId: Types.ObjectId; // Manager who approved
  status: "approved" | "rejected" | "conditional" | "pending"; // مقبول | غير مقبول | قبول مشروط | معلق
  notes?: string; // Manager notes
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const GradeApprovalSchema = new Schema<IGradeApproval>(
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
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      required: true,
      enum: ["approved", "rejected", "conditional", "pending"],
      default: "pending",
    },
    notes: {
      type: String,
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Index for finding approvals by student and exam
GradeApprovalSchema.index({ studentId: 1, examId: 1 });

export default mongoose.models.GradeApproval ||
  mongoose.model<IGradeApproval>("GradeApproval", GradeApprovalSchema);
