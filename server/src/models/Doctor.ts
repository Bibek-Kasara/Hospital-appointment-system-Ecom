import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDoctor extends Document {
  full_name: string;
  department_id: Types.ObjectId;
  specialization?: string;
  profile_image?: string;
  email: string;
  phone?: string;
  qualification?: string;
  experience_years?: number;
  is_active: boolean;
  password_hash: string;
  role: 'doctor';
}

const doctorSchema = new Schema<IDoctor>(
  {
    full_name: { type: String, required: true, trim: true },
    department_id: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    specialization: { type: String, trim: true },
    profile_image: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    qualification: { type: String, trim: true },
    experience_years: { type: Number, min: 0 },
    is_active: { type: Boolean, default: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['doctor'], default: 'doctor' },
  },
  { timestamps: true },
);

doctorSchema.index({ department_id: 1 });

export const Doctor = mongoose.model<IDoctor>('Doctor', doctorSchema);
