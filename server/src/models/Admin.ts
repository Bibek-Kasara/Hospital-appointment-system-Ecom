import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAdmin extends Document {
  full_name: string;
  email: string;
  password_hash: string;
  role: 'admin';
}

const adminSchema = new Schema<IAdmin>(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true },
);

export const Admin = mongoose.model<IAdmin>('Admin', adminSchema);
