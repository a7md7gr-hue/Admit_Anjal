import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubjectApproval extends Document {
  _id: Types.ObjectId;
  attemptId: Types.ObjectId; // الاختبار
  subjectId: Types.ObjectId; // المادة
  supervisorId: Types.ObjectId; // المشرف اللي اعتمد
  originalScore: number; // الدرجة الأصلية من التصحيح
  adjustedScore?: number; // الدرجة المعدلة (إذا المشرف عدّل)
  maxScore: number; // الدرجة الكلية
  isApproved: boolean; // معتمدة ولا لا
  notes?: string; // ملاحظات المشرف
  approvedAt?: Date; // تاريخ الاعتماد
  createdAt: Date;
  updatedAt: Date;
}

const SubjectApprovalSchema = new Schema<ISubjectApproval>(
  {
    attemptId: {
      type: Schema.Types.ObjectId,
      ref: "Attempt",
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    supervisorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    originalScore: {
      type: Number,
      required: true,
    },
    adjustedScore: {
      type: Number,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
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

// Indexes
SubjectApprovalSchema.index({ attemptId: 1, subjectId: 1 });
SubjectApprovalSchema.index({ supervisorId: 1 });

export default mongoose.models.SubjectApproval ||
  mongoose.model<ISubjectApproval>("SubjectApproval", SubjectApprovalSchema);
