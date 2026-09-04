import { User, Doctor, Admin, Appointment, Department, Notification } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResult } from '../utils/response.js';

const sanitizeProfile = (doc: Record<string, unknown>, role: string) => {
  const obj = typeof doc.toObject === 'function' ? (doc as { toObject: () => Record<string, unknown> }).toObject() : { ...doc };
  return {
    ...obj,
    id: String(obj._id),
    role,
  };
};

export const getProfile = async (userId: string, role: string) => {
  if (role === 'patient') {
    const user = await User.findById(userId).select('-password_hash');
    if (!user) throw new AppError('User not found', 404);
    return sanitizeProfile(user as unknown as Record<string, unknown>, 'patient');
  }
  if (role === 'doctor') {
    const doctor = await Doctor.findById(userId)
      .populate('department_id', 'name description')
      .select('-password_hash');
    if (!doctor) throw new AppError('Doctor not found', 404);
    return sanitizeProfile(doctor as unknown as Record<string, unknown>, 'doctor');
  }
  if (role === 'admin') {
    const admin = await Admin.findById(userId).select('-password_hash');
    if (!admin) throw new AppError('Admin not found', 404);
    return sanitizeProfile(admin as unknown as Record<string, unknown>, 'admin');
  }
  throw new AppError('Profile not available for this role', 400);
};

export const updateProfile = async (
  userId: string,
  role: string,
  data: Record<string, unknown>,
) => {
  const allowedFields = ['full_name', 'phone', 'address', 'date_of_birth', 'gender'];
  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updateData[field] = data[field];
  }

  if (role === 'patient') {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select('-password_hash');
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  if (role === 'doctor') {
    const doctorFields = ['full_name', 'phone', 'specialization', 'qualification', 'profile_image'];
    const doctorUpdate: Record<string, unknown> = {};
    for (const field of doctorFields) {
      if (data[field] !== undefined) doctorUpdate[field] = data[field];
    }
    const doctor = await Doctor.findByIdAndUpdate(userId, doctorUpdate, {
      new: true,
      runValidators: true,
    })
      .populate('department_id', 'name description')
      .select('-password_hash');
    if (!doctor) throw new AppError('Doctor not found', 404);
    return doctor;
  }

  throw new AppError('Profile update not available for this role', 400);
};

export const getPatients = async (query: { page?: string; limit?: string; search?: string }) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, unknown> = { role: 'patient' };

  if (query.search) {
    filter.$or = [
      { full_name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter).select('-password_hash').sort({ created_at: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, page, limit);
};

export const getAdminStats = async () => {
  const [
    totalPatients,
    totalDoctors,
    totalDepartments,
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments,
    todayAppointments,
  ] = await Promise.all([
    User.countDocuments({ role: 'patient' }),
    Doctor.countDocuments({ is_active: true }),
    Department.countDocuments(),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'pending' }),
    Appointment.countDocuments({ status: 'completed' }),
    Appointment.countDocuments({ status: 'cancelled' }),
    Appointment.countDocuments({
      booked_at: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    }),
  ]);

  return {
    totalPatients,
    totalDoctors,
    totalDepartments,
    totalAppointments,
    pendingAppointments,
    completedAppointments,
    cancelledAppointments,
    todayAppointments,
    cancellationRate:
      totalAppointments > 0
        ? Math.round((cancelledAppointments / totalAppointments) * 100)
        : 0,
  };
};

export const getReports = async (query: { from?: string; to?: string }) => {
  const from = query.from ? new Date(query.from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = query.to ? new Date(query.to) : new Date();

  const appointments = await Appointment.find({
    booked_at: { $gte: from, $lte: to },
  }).populate([
    { path: 'doctor_id', populate: { path: 'department_id', select: 'name' } },
    { path: 'slot_id', select: 'slot_date' },
  ]);

  const byDay: Record<string, number> = {};
  const byDepartment: Record<string, number> = {};
  let cancelled = 0;

  for (const apt of appointments) {
    const day = new Date(apt.booked_at).toISOString().split('T')[0];
    byDay[day] = (byDay[day] || 0) + 1;

    const doctor = apt.doctor_id as { department_id?: { name?: string } };
    const deptName = doctor?.department_id?.name || 'Unknown';
    byDepartment[deptName] = (byDepartment[deptName] || 0) + 1;

    if (apt.status === 'cancelled') cancelled++;
  }

  return {
    period: { from, to },
    totalAppointments: appointments.length,
    cancellationRate:
      appointments.length > 0 ? Math.round((cancelled / appointments.length) * 100) : 0,
    appointmentsByDay: Object.entries(byDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    appointmentsByDepartment: Object.entries(byDepartment).map(([department, count]) => ({
      department,
      count,
    })),
  };
};

export const getPatientNotifications = async (patientId: string) => {
  const appointments = await Appointment.find({ patient_id: patientId }).select('_id');
  const appointmentIds = appointments.map((a) => a._id);

  return Notification.find({ appointment_id: { $in: appointmentIds } })
    .populate({
      path: 'appointment_id',
      populate: [{ path: 'doctor_id', select: 'full_name' }, { path: 'slot_id' }],
    })
    .sort({ createdAt: -1 })
    .limit(50);
};
