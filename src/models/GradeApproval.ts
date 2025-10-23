import mongoose, { Schema, Document, Types } from "mongoose";

export interface IGradeApproval extends Document {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  managerId: Types.ObjectId; // Manager who approved
  status: "approved" | "rejected" | "conditional"; // مقبول | غير مقبول | قبول مشروط
  notes?: string; // Manager notes
  approvedAt: Date;
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
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["approved", "rejected", "conditional"],
    },
    notes: {
      type: String,
    },
    approvedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Index for finding approvals by student
GradeApprovalSchema.index({ studentId: 1 });

export default mongoose.models.GradeApproval ||
  mongoose.model<IGradeApproval>("GradeApproval", GradeApprovalSchema);
