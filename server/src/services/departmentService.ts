import { Department } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildPaginatedResult } from '../utils/response.js';

export const getDepartments = async (query: { page?: string; limit?: string; search?: string }) => {
  const { page, limit, skip } = getPagination(query);
  const filter: Record<string, unknown> = {};

  if (query.search) {
    filter.name = { $regex: query.search, $options: 'i' };
  }

  const [items, total] = await Promise.all([
    Department.find(filter).sort({ name: 1 }).skip(skip).limit(limit),
    Department.countDocuments(filter),
  ]);

  return buildPaginatedResult(items, total, page, limit);
};

export const getDepartmentById = async (id: string) => {
  const department = await Department.findById(id);
  if (!department) throw new AppError('Department not found', 404);
  return department;
};

export const createDepartment = async (data: { name: string; description?: string }) => {
  const existing = await Department.findOne({ name: data.name });
  if (existing) throw new AppError('Department already exists', 409);
  return Department.create(data);
};

export const updateDepartment = async (
  id: string,
  data: { name?: string; description?: string },
) => {
  const department = await Department.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!department) throw new AppError('Department not found', 404);
  return department;
};

export const deleteDepartment = async (id: string) => {
  const department = await Department.findByIdAndDelete(id);
  if (!department) throw new AppError('Department not found', 404);
  return department;
};
