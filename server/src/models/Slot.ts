import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISlot extends Document {
  doctor_id: Types.ObjectId;
  slot_date: Date;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

const slotSchema = new Schema<ISlot>(
  {
    doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    slot_date: { type: Date, required: true },
    start_time: { type: String, required: true },
    end_time: { type: String, required: true },
    is_booked: { type: Boolean, default: false },
  },
  { timestamps: true },
);

slotSchema.index({ doctor_id: 1, slot_date: 1 });
slotSchema.index({ doctor_id: 1, slot_date: 1, start_time: 1 }, { unique: true });

export const Slot = mongoose.model<ISlot>('Slot', slotSchema);
