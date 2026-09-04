import mongoose, { Document, Schema, Types } from 'mongoose';
import { NotificationType } from '../types/index.js';

export interface INotification extends Document {
  appointment_id: Types.ObjectId;
  type: NotificationType;
  message: string;
  is_sent: boolean;
  sent_at?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    appointment_id: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    type: { type: String, enum: ['email', 'sms'], required: true },
    message: { type: String, required: true },
    is_sent: { type: Boolean, default: false },
    sent_at: { type: Date },
  },
  { timestamps: true },
);

notificationSchema.index({ appointment_id: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
