import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISubjectWeight extends Document {
  _id: Types.ObjectId;
  gradeId: Types.ObjectId;
  subjectId: Types.ObjectId;
  weight: number; // Percentage (0-100)
  createdAt: Date;
  updatedAt: Date;
}

const SubjectWeightSchema = new Schema<ISubjectWeight>(
  {
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 25, // Default 25% for 4 subjects
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Composite unique index: one weight per subject per grade
SubjectWeightSchema.index({ gradeId: 1, subjectId: 1 }, { unique: true });

export default mongoose.models.SubjectWeight ||
  mongoose.model<ISubjectWeight>("SubjectWeight", SubjectWeightSchema);
