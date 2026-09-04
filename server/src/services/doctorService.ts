import { Doctor, Department } from '../models/index.js';
import { hashPassword } from '../utils/password.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResult } from '../utils/response.js';

export const getDoctors = async (query: {
  page?: string;
  limit?: string;
  department?: string;
  search?: string;
  active?: string;
}) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, unknown> = {};

  if (query.department) filter.department_id = query.department;
  if (query.search) filter.full_name = { $regex: query.search, $options: 'i' };
  if (query.active !== undefined) filter.is_active = query.active === 'true';

  const [items, total] = await Promise.all([
    Doctor.find(filter)
      .populate('department_id', 'name description')
      .select('-password_hash')
      .sort({ full_name: 1 })
      .skip(skip)
      .limit(limit),
    Doctor.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, page, limit);
};

export const getDoctorById = async (id: string) => {
  const doctor = await Doctor.findById(id)
    .populate('department_id', 'name description')
    .select('-password_hash');
  if (!doctor) throw new AppError('Doctor not found', 404);
  return doctor;
};

export const createDoctor = async (data: {
  full_name: string;
  department_id: string;
  email: string;
  password: string;
  phone?: string;
  specialization?: string;
  profile_image?: string;
  qualification?: string;
  experience_years?: number;
}) => {
  const department = await Department.findById(data.department_id);
  if (!department) throw new AppError('Department not found', 404);

  const existing = await Doctor.findOne({ email: data.email.toLowerCase() });
  if (existing) throw new AppError('Email already registered', 409);

  const password_hash = await hashPassword(data.password);
  const doctor = await Doctor.create({
    ...data,
    email: data.email.toLowerCase(),
    password_hash,
  });

  return Doctor.findById(doctor._id)
    .populate('department_id', 'name description')
    .select('-password_hash');
};

export const updateDoctor = async (
  id: string,
  data: Partial<{
    full_name: string;
    department_id: string;
    email: string;
    phone: string;
    specialization: string;
    profile_image?: string;
    qualification: string;
    experience_years: number;
    is_active: boolean;
    password: string;
  }>,
) => {
  const updateData: Record<string, unknown> = { ...data };
  delete updateData.password;

  if (data.password) {
    updateData.password_hash = await hashPassword(data.password);
  }

  if (data.department_id) {
    const department = await Department.findById(data.department_id);
    if (!department) throw new AppError('Department not found', 404);
  }

  const doctor = await Doctor.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate('department_id', 'name description')
    .select('-password_hash');

  if (!doctor) throw new AppError('Doctor not found', 404);
  return doctor;
};

export const deleteDoctor = async (id: string) => {
  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) throw new AppError('Doctor not found', 404);
  return doctor;
};
