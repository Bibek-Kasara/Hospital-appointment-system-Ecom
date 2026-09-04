import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Department, Doctor, Admin, Slot } from '../models/index.js';
import { hashPassword } from '../utils/password.js';

const departments = [
  { name: 'General Medicine', description: 'Primary care and general health consultations' },
  { name: 'Cardiology', description: 'Heart and cardiovascular system care' },
  { name: 'Orthopedics', description: 'Bone, joint, and musculoskeletal treatment' },
  { name: 'Pediatrics', description: 'Healthcare for infants, children, and adolescents' },
  { name: 'Dermatology', description: 'Skin, hair, and nail conditions' },
  { name: 'Neurology', description: 'Brain and nervous system disorders' },
];

const doctorsData = [
  {
    full_name: 'Dr. Ram Sharma',
    specialization: 'General Physician',
    email: 'ram.sharma@sahidhospital.gov.np',
    phone: '9801111111',
    qualification: 'MBBS, MD',
    experience_years: 15,
    profile_image: 'https://randomuser.me/api/portraits/men/32.jpg',
    deptIndex: 0,
  },
  {
    full_name: 'Dr. Sita Thapa',
    specialization: 'Cardiologist',
    email: 'sita.thapa@sahidhospital.gov.np',
    phone: '9802222222',
    qualification: 'MBBS, DM Cardiology',
    experience_years: 12,
    profile_image: 'https://randomuser.me/api/portraits/women/44.jpg',
    deptIndex: 1,
  },
  {
    full_name: 'Dr. Hari Karki',
    specialization: 'Orthopedic Surgeon',
    email: 'hari.karki@sahidhospital.gov.np',
    phone: '9803333333',
    qualification: 'MBBS, MS Orthopedics',
    experience_years: 10,
    profile_image: 'https://randomuser.me/api/portraits/men/46.jpg',
    deptIndex: 2,
  },
  {
    full_name: 'Dr. Gita Rai',
    specialization: 'Pediatrician',
    email: 'gita.rai@sahidhospital.gov.np',
    phone: '9804444444',
    qualification: 'MBBS, MD Pediatrics',
    experience_years: 8,
    profile_image: 'https://randomuser.me/api/portraits/women/68.jpg',
    deptIndex: 3,
  },
  {
    full_name: 'Dr. Bijay Lama',
    specialization: 'Dermatologist',
    email: 'bijay.lama@sahidhospital.gov.np',
    phone: '9805555555',
    qualification: 'MBBS, MD Dermatology',
    experience_years: 7,
    profile_image: 'https://randomuser.me/api/portraits/men/65.jpg',
    deptIndex: 4,
  },
  {
    full_name: 'Dr. Anjali Gurung',
    specialization: 'Neurologist',
    email: 'anjali.gurung@sahidhospital.gov.np',
    phone: '9806666666',
    qualification: 'MBBS, DM Neurology',
    experience_years: 11,
    profile_image: 'https://randomuser.me/api/portraits/women/32.jpg',
    deptIndex: 5,
  },
];

const timeSlots = Array.from({ length: 21 }, (_, index) => {
  const start = 9 * 60 + index * 20;
  const format = (minutes: number) => `${Math.floor(minutes / 60).toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
  return { start: format(start), end: format(start + 20) };
});

const seed = async () => {
  try {
    await connectDB();
    console.log('Clearing existing data...');

    await Promise.all([
      Department.deleteMany({}),
      Doctor.deleteMany({}),
      Admin.deleteMany({}),
      Slot.deleteMany({}),
    ]);

    console.log('Creating departments...');
    const createdDepts = await Department.insertMany(departments);

    console.log('Creating admin...');
    const adminPassword = await hashPassword('Admin@123');
    await Admin.create({
      full_name: 'System Administrator',
      email: 'admin@sahidhospital.gov.np',
      password_hash: adminPassword,
      role: 'admin',
    });

    console.log('Creating doctors...');
    const doctorPassword = await hashPassword('Doctor@123');
    const createdDoctors = [];

    for (const doc of doctorsData) {
      const doctor = await Doctor.create({
        full_name: doc.full_name,
        department_id: createdDepts[doc.deptIndex]._id,
        specialization: doc.specialization,
        email: doc.email,
        phone: doc.phone,
        qualification: doc.qualification,
        experience_years: doc.experience_years,
        profile_image: doc.profile_image,
        password_hash: doctorPassword,
        is_active: true,
        role: 'doctor',
      });
      createdDoctors.push(doctor);
    }

    console.log('Creating slots for the next 7 days...');
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= 7; day++) {
      const slotDate = new Date(today);
      slotDate.setDate(today.getDate() + day);

      if (slotDate.getDay() === 0) continue;

      for (const doctor of createdDoctors) {
        for (const time of timeSlots) {
          slots.push({
            doctor_id: doctor._id,
            slot_date: slotDate,
            start_time: time.start,
            end_time: time.end,
            is_booked: false,
          });
        }
      }
    }

    await Slot.insertMany(slots);

    console.log('\n✅ Seed completed successfully!\n');
    console.log('Demo credentials (dev only):');
    console.log('  Admin:  admin@sahidhospital.gov.np / Admin@123');
    console.log('  Doctor: ram.sharma@sahidhospital.gov.np / Doctor@123');
    console.log(`  Created ${createdDepts.length} departments`);
    console.log(`  Created ${createdDoctors.length} doctors`);
    console.log(`  Created ${slots.length} slots\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
