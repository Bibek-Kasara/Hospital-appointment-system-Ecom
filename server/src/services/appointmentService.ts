import mongoose from 'mongoose';
import { Appointment, Slot, Doctor, User, Notification } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResult } from '../utils/response.js';
import { env } from '../config/env.js';
import { sendEmail, buildAppointmentEmail } from './emailService.js';
import { AppointmentStatus } from '../types/index.js';
import { getSlotDate } from '../config/scheduling.js';

const populateOptions = [
  { path: 'patient_id', select: 'full_name email phone' },
  { path: 'doctor_id', select: 'full_name email specialization', populate: { path: 'department_id', select: 'name' } },
  { path: 'slot_id', select: 'slot_date start_time end_time' },
];

const isWithinCutoff = (slotDate: Date, startTime: string): boolean => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const appointmentTime = new Date(slotDate);
  appointmentTime.setHours(hours, minutes, 0, 0);
  const cutoffMs = env.appointmentCutoffHours * 60 * 60 * 1000;
  return appointmentTime.getTime() - Date.now() < cutoffMs;
};

const formatDate = (date: Date) =>
  date.toLocaleDateString('en-NP', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

export const bookAppointment = async (
  patientId: string,
  data: { doctor_id: string; slot_id: string; reason?: string },
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const slot = await Slot.findOneAndUpdate(
      { _id: data.slot_id, doctor_id: data.doctor_id, is_booked: false },
      { $set: { is_booked: true } },
      { new: true, session },
    );
    if (!slot) throw new AppError('Slot is no longer available', 409);

    const slotDate = getSlotDate(new Date(slot.slot_date), slot.start_time);
    if (slotDate <= new Date()) {
      throw new AppError('Cannot book past slots', 400);
    }

    const doctor = await Doctor.findById(data.doctor_id).populate('department_id').session(session);
    if (!doctor || !doctor.is_active) throw new AppError('Doctor not available', 400);

    const appointment = await Appointment.create(
      [
        {
          patient_id: patientId,
          doctor_id: data.doctor_id,
          slot_id: data.slot_id,
          status: 'confirmed' as AppointmentStatus,
          reason: data.reason,
          booked_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { session },
    );

    const patient = await User.findById(patientId).session(session);
    const emailContent = buildAppointmentEmail('booking', {
      patientName: patient?.full_name || 'Patient',
      doctorName: doctor.full_name,
      date: formatDate(slotDate),
      time: `${slot.start_time} - ${slot.end_time}`,
      department: (doctor.department_id as { name?: string })?.name,
    });

    const notification = await Notification.create(
      [
        {
          appointment_id: appointment[0]._id,
          type: 'email',
          message: emailContent.subject,
          is_sent: false,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    if (patient?.email) {
      const result = await sendEmail(patient.email, emailContent.subject, emailContent.html);
      if (result.sent) {
        await Notification.findByIdAndUpdate(notification[0]._id, {
          is_sent: true,
          sent_at: new Date(),
        });
      }
    }

    return Appointment.findById(appointment[0]._id).populate(populateOptions);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getPatientAppointments = async (
  patientId: string,
  query: { page?: string; limit?: string; status?: string },
) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, unknown> = { patient_id: patientId };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .populate(populateOptions)
      .sort({ booked_at: -1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, page, limit);
};

export const getDoctorAppointments = async (
  doctorId: string,
  query: { page?: string; limit?: string; status?: string; date?: string },
) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, unknown> = { doctor_id: doctorId };
  if (query.status) filter.status = query.status;

  let items = await Appointment.find(filter)
    .populate(populateOptions)
    .sort({ booked_at: -1 })
    .skip(skip)
    .limit(limit);

  if (query.date) {
    items = items.filter((apt) => {
      const slot = apt.slot_id as { slot_date?: Date };
      if (!slot?.slot_date) return false;
      const slotDate = new Date(slot.slot_date).toISOString().split('T')[0];
      return slotDate === query.date;
    });
  }

  const total = await Appointment.countDocuments(filter);
  return buildPaginatedResult(items, total, page, limit);
};

export const getAllAppointments = async (query: {
  page?: string;
  limit?: string;
  status?: string;
  doctor_id?: string;
  patient_id?: string;
  from?: string;
  to?: string;
}) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.doctor_id) filter.doctor_id = query.doctor_id;
  if (query.patient_id) filter.patient_id = query.patient_id;

  const [items, total] = await Promise.all([
    Appointment.find(filter)
      .populate(populateOptions)
      .sort({ booked_at: -1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, page, limit);
};

export const getAppointmentById = async (id: string, userId?: string, role?: string) => {
  const appointment = await Appointment.findById(id).populate(populateOptions);
  if (!appointment) throw new AppError('Appointment not found', 404);
  if (role === 'patient' && appointment.patient_id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }
  if (role === 'doctor' && appointment.doctor_id.toString() !== userId) {
    throw new AppError('Not authorized', 403);
  }
  return appointment;
};

export const cancelAppointment = async (appointmentId: string, userId: string, role: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findById(appointmentId).session(session);
    if (!appointment) throw new AppError('Appointment not found', 404);

    if (role === 'patient' && appointment.patient_id.toString() !== userId) {
      throw new AppError('Not authorized', 403);
    }

    if (['cancelled', 'completed'].includes(appointment.status)) {
      throw new AppError(`Appointment is already ${appointment.status}`, 400);
    }

    const slot = await Slot.findById(appointment.slot_id).session(session);
    if (slot && isWithinCutoff(slot.slot_date, slot.start_time) && role === 'patient') {
      throw new AppError(
        `Cannot cancel within ${env.appointmentCutoffHours} hours of appointment`,
        400,
      );
    }

    appointment.status = 'cancelled';
    appointment.updated_at = new Date();
    await appointment.save({ session });

    if (slot) {
      slot.is_booked = false;
      await slot.save({ session });
    }

    await session.commitTransaction();

    const populated = await Appointment.findById(appointmentId).populate(populateOptions);
    const patient = populated?.patient_id as { full_name?: string; email?: string };
    const doctor = populated?.doctor_id as { full_name?: string };
    const slotData = populated?.slot_id as { slot_date?: Date; start_time?: string; end_time?: string };

    if (patient?.email) {
      const emailContent = buildAppointmentEmail('cancellation', {
        patientName: patient.full_name || 'Patient',
        doctorName: doctor?.full_name || 'Doctor',
        date: slotData?.slot_date ? formatDate(new Date(slotData.slot_date)) : '',
        time: slotData ? `${slotData.start_time} - ${slotData.end_time}` : '',
      });
      await sendEmail(patient.email, emailContent.subject, emailContent.html);
    }

    return populated;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const rescheduleAppointment = async (
  appointmentId: string,
  patientId: string,
  newSlotId: string,
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const appointment = await Appointment.findById(appointmentId).session(session);
    if (!appointment) throw new AppError('Appointment not found', 404);
    if (appointment.patient_id.toString() !== patientId) {
      throw new AppError('Not authorized', 403);
    }
    if (['cancelled', 'completed'].includes(appointment.status)) {
      throw new AppError(`Cannot reschedule ${appointment.status} appointment`, 400);
    }

    const oldSlot = await Slot.findById(appointment.slot_id).session(session);
    if (oldSlot && isWithinCutoff(oldSlot.slot_date, oldSlot.start_time)) {
      throw new AppError(
        `Cannot reschedule within ${env.appointmentCutoffHours} hours of appointment`,
        400,
      );
    }

    const newSlot = await Slot.findById(newSlotId).session(session);
    if (!newSlot) throw new AppError('New slot not found', 404);
    if (newSlot.is_booked) throw new AppError('New slot is already booked', 409);
    if (newSlot.doctor_id.toString() !== appointment.doctor_id.toString()) {
      throw new AppError('New slot must belong to the same doctor', 400);
    }

    const newSlotDate = getSlotDate(new Date(newSlot.slot_date), newSlot.start_time);
    if (newSlotDate <= new Date()) throw new AppError('Cannot reschedule to a past slot', 400);

    const securedNewSlot = await Slot.findOneAndUpdate(
      { _id: newSlotId, doctor_id: appointment.doctor_id, is_booked: false },
      { $set: { is_booked: true } },
      { new: true, session },
    );
    if (!securedNewSlot) throw new AppError('New slot is no longer available', 409);

    if (oldSlot) {
      oldSlot.is_booked = false;
      await oldSlot.save({ session });
    }

    appointment.slot_id = newSlot._id;
    appointment.status = 'confirmed';
    appointment.updated_at = new Date();
    await appointment.save({ session });

    await session.commitTransaction();

    const populated = await Appointment.findById(appointmentId).populate(populateOptions);
    const patient = populated?.patient_id as { full_name?: string; email?: string };
    const doctor = populated?.doctor_id as { full_name?: string };

    if (patient?.email) {
      const emailContent = buildAppointmentEmail('reschedule', {
        patientName: patient.full_name || 'Patient',
        doctorName: doctor?.full_name || 'Doctor',
        date: formatDate(new Date(securedNewSlot.slot_date)),
        time: `${securedNewSlot.start_time} - ${securedNewSlot.end_time}`,
      });
      await sendEmail(patient.email, emailContent.subject, emailContent.html);
    }

    return populated;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updateAppointmentStatus = async (
  appointmentId: string,
  doctorId: string,
  status: AppointmentStatus,
) => {
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new AppError('Appointment not found', 404);
  if (appointment.doctor_id.toString() !== doctorId) {
    throw new AppError('Not authorized', 403);
  }

  if (!['completed', 'no-show', 'confirmed'].includes(status)) {
    throw new AppError('Invalid status update for doctor', 400);
  }

  if (['completed', 'no-show'].includes(status)) {
    const slot = await Slot.findById(appointment.slot_id);
    if (!slot || getSlotDate(new Date(slot.slot_date), slot.start_time) > new Date()) {
      throw new AppError('Future appointments cannot be marked completed or no-show', 400);
    }
  }

  appointment.status = status;
  appointment.updated_at = new Date();
  await appointment.save();

  return Appointment.findById(appointmentId).populate(populateOptions);
};
