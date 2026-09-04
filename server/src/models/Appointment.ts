import mongoose, { Document, Schema, Types } from 'mongoose';
import { AppointmentStatus } from '../types/index.js';

export interface IAppointment extends Document {
  patient_id: Types.ObjectId;
  doctor_id: Types.ObjectId;
  slot_id: Types.ObjectId;
  status: AppointmentStatus;
  reason?: string;
  booked_at: Date;
  updated_at: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    slot_id: { type: Schema.Types.ObjectId, ref: 'Slot', required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },
    reason: { type: String, trim: true },
    booked_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false },
);

appointmentSchema.index({ patient_id: 1, status: 1 });
appointmentSchema.index({ doctor_id: 1, status: 1 });
appointmentSchema.index(
  { slot_id: 1 },
  {
    name: 'active_slot_unique',
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'confirmed', 'completed', 'no-show'] } },
  },
);

export const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);
