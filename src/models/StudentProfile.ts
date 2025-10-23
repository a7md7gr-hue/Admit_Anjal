import mongoose, { Schema, Document, Types } from "mongoose";

export interface IStudentProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  schoolId: Types.ObjectId;
  programId: Types.ObjectId;
  gradeId: Types.ObjectId;
  pin4: string;
  phone1: string; // Required - Must start with +966
  phone2?: string; // Optional - Must start with +966 if provided
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
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
    gradeId: {
      type: Schema.Types.ObjectId,
      ref: "Grade",
      required: true,
    },
    pin4: {
      type: String,
      required: true,
      length: 4,
    },
    phone1: {
      type: String,
      required: true,
      validate: {
        validator: function (v: string) {
          return /^\+966\d{9}$/.test(v); // Must be +966 followed by 9 digits
        },
        message: "رقم الهاتف يجب أن يبدأ بـ +966 ويتبعه 9 أرقام",
      },
    },
    phone2: {
      type: String,
      required: false,
      validate: {
        validator: function (v: string) {
          return !v || /^\+966\d{9}$/.test(v); // Optional but must match format if provided
        },
        message: "رقم الهاتف يجب أن يبدأ بـ +966 ويتبعه 9 أرقام",
      },
    },
  },
  {
    timestamps: true,
    autoIndex: false,
  },
);

// Indexes

export default mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);
