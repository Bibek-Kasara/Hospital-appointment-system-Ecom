import mongoose, { Document, Schema } from 'mongoose';
import { Gender, UserRole } from '../types/index.js';

export interface IUser extends Document {
  full_name: string;
  email: string;
  phone: string;
  password_hash: string;
  address?: string;
  date_of_birth?: Date;
  gender?: Gender;
  role: UserRole;
  created_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password_hash: { type: String, required: true },
    address: { type: String, trim: true },
    date_of_birth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    role: { type: String, enum: ['patient'], default: 'patient' },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

export const User = mongoose.model<IUser>('User', userSchema);
