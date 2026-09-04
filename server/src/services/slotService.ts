import { Slot, Doctor } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResult } from '../utils/response.js';
import {
  APPOINTMENT_SLOT_DURATION_MINUTES,
  minutesToTime,
  timeToMinutes,
} from '../config/scheduling.js';
import { getSlotDate } from '../config/scheduling.js';

export const getDoctorSlots = async (
  doctorId: string,
  query: { page?: string; limit?: string; from?: string; to?: string; date?: string; available?: string },
) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError('Doctor not found', 404);

  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, unknown> = { doctor_id: doctorId };

  if (query.from || query.to) {
    filter.slot_date = {};
    if (query.from) (filter.slot_date as Record<string, Date>).$gte = new Date(query.from);
    if (query.to) (filter.slot_date as Record<string, Date>).$lte = new Date(query.to);
  }

  if (query.date) {
    const date = new Date(`${query.date}T00:00:00`);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    filter.slot_date = { $gte: date, $lt: nextDate };
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
      (filter as { start_time?: { $gt: string } }).start_time = { $gt: currentTime };
    }
  }

  if (query.available === 'true') {
    filter.is_booked = false;
    const slotDateFilter = (filter.slot_date as Record<string, Date> | undefined) || {};
    slotDateFilter.$gte = slotDateFilter.$gte || new Date(new Date().setHours(0, 0, 0, 0));
    filter.slot_date = slotDateFilter;
  }

  const [items, total] = await Promise.all([
    Slot.find(filter).sort({ slot_date: 1, start_time: 1 }).skip(skip).limit(limit),
    Slot.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, page, limit);
};

export const createSlot = async (
  doctorId: string,
  data: { slot_date: string; start_time: string; end_time: string },
) => {
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) throw new AppError('Doctor not found', 404);

  const slotDate = new Date(data.slot_date);
  if (slotDate < new Date(new Date().setHours(0, 0, 0, 0))) {
    throw new AppError('Cannot create slots in the past', 400);
  }
  if (timeToMinutes(data.end_time) - timeToMinutes(data.start_time) !== APPOINTMENT_SLOT_DURATION_MINUTES) {
    throw new AppError(`Slots must be ${APPOINTMENT_SLOT_DURATION_MINUTES} minutes long`, 400);
  }
  if (getSlotDate(slotDate, data.start_time) <= new Date()) {
    throw new AppError('Availability cannot start in the past', 400);
  }

  const existing = await Slot.findOne({
    doctor_id: doctorId,
    slot_date: slotDate,
    start_time: data.start_time,
  });
  if (existing) throw new AppError('Slot already exists for this time', 409);

  return Slot.create({
    doctor_id: doctorId,
    slot_date: slotDate,
    start_time: data.start_time,
    end_time: data.end_time,
  });
};

export const createAvailability = async (
  doctorId: string,
  data: { slot_date: string; start_time: string; end_time: string },
) => {
  const start = timeToMinutes(data.start_time);
  const end = timeToMinutes(data.end_time);
  if (end <= start) throw new AppError('End time must be after start time', 400);
  if (end - start < APPOINTMENT_SLOT_DURATION_MINUTES) {
    throw new AppError(`Availability must allow at least one ${APPOINTMENT_SLOT_DURATION_MINUTES}-minute slot`, 400);
  }
  if (getSlotDate(new Date(data.slot_date), data.start_time) <= new Date()) {
    throw new AppError('Availability cannot start in the past', 400);
  }

  const slots = [];
  for (let current = start; current + APPOINTMENT_SLOT_DURATION_MINUTES <= end; current += APPOINTMENT_SLOT_DURATION_MINUTES) {
    slots.push({
      slot_date: data.slot_date,
      start_time: minutesToTime(current),
      end_time: minutesToTime(current + APPOINTMENT_SLOT_DURATION_MINUTES),
    });
  }
  return createBulkSlots(doctorId, slots);
};

export const updateSlot = async (slotId: string, data: { is_booked?: boolean }) => {
  const slot = await Slot.findByIdAndUpdate(slotId, data, { new: true });
  if (!slot) throw new AppError('Slot not found', 404);
  return slot;
};

export const deleteSlot = async (slotId: string) => {
  const slot = await Slot.findById(slotId);
  if (!slot) throw new AppError('Slot not found', 404);
  if (slot.is_booked) throw new AppError('Cannot delete a booked slot', 400);
  await Slot.findByIdAndDelete(slotId);
  return slot;
};

export const createBulkSlots = async (
  doctorId: string,
  slots: { slot_date: string; start_time: string; end_time: string }[],
) => {
  const created = [];
  for (const slotData of slots) {
    try {
      const slot = await createSlot(doctorId, slotData);
      created.push(slot);
    } catch {
      // skip duplicates
    }
  }
  return created;
};
