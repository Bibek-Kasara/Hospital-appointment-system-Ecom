import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { Doctor } from '../models/Doctor.js';

const doctorRenames = [
  ['ram.sharma@sahidhospital.gov.np', 'Dr. Anil Rana', 'anil.rana@sahidhospital.gov.np'],
  ['sita.thapa@sahidhospital.gov.np', 'Dr. Aryan Saud', 'aryan.saud@sahidhospital.gov.np'],
  ['hari.karki@sahidhospital.gov.np', 'Dr. Safal Shyangwa', 'safal.shyangwa@sahidhospital.gov.np'],
  ['gita.rai@sahidhospital.gov.np', 'Dr. Yogesh Shah Thakuri', 'yogesh.shah.thakuri@sahidhospital.gov.np'],
  ['bijay.lama@sahidhospital.gov.np', 'Dr. Shaan Maharjna', 'shaan.maharjna@sahidhospital.gov.np'],
  ['anjali.gurung@sahidhospital.gov.np', 'Dr. Shandesh Shrestha', 'shandesh.shrestha@sahidhospital.gov.np'],
] as const;

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    await mongoose.connect(uri);
    await Promise.all(
      doctorRenames.map(([oldEmail, fullName, email]) =>
        Doctor.updateOne({ email: oldEmail }, { $set: { full_name: fullName, email } }),
      ),
    );
    // Replace the former unconditional slot index so cancelled history does not block rebooking.
    try {
      await Appointment.collection.dropIndex('slot_id_1');
    } catch (error) {
      if ((error as { codeName?: string }).codeName !== 'IndexNotFound') throw error;
    }
    await Appointment.collection.createIndex(
      { slot_id: 1 },
      {
        name: 'active_slot_unique',
        unique: true,
        partialFilterExpression: { status: { $in: ['pending', 'confirmed', 'completed', 'no-show'] } },
      },
    ).catch((error: { codeName?: string }) => {
      if (error.codeName !== 'IndexOptionsConflict' && error.codeName !== 'IndexKeySpecsConflict') throw error;
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const startSession = () => mongoose.startSession();
