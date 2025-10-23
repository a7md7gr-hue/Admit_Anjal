import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  fullName: string;
  nationalId?: string;
  password?: string;
  roleId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    nationalId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^\d{10}$/.test(v);
        },
        message: "National ID must be exactly 10 digits",
      },
    },
    password: {
      type: String,
      select: false, // Don't return password by default
    },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
  },
  {
    timestamps: true,
    autoIndex: false, // Disable auto index creation
  },
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
