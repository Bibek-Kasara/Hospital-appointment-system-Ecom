import api, { setAccessToken } from './api';
import type {
  ApiResponse,
  User,
  Department,
  Doctor,
  Slot,
  Appointment,
  PaginatedResponse,
  AdminStats,
} from '../types';

export const authApi = {
  register: (data: Record<string, unknown>) =>
    api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/register', data),
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: User; accessToken: string }>>('/auth/login', { email, password }),
  logout: () => {
    setAccessToken(null);
    return api.post('/auth/logout');
  },
};

export const departmentApi = {
  list: (params?: Record<string, string>) =>
    api.get<ApiResponse<PaginatedResponse<Department>>>('/departments', { params }),
  get: (id: string) => api.get<ApiResponse<Department>>(`/departments/${id}`),
  create: (data: Partial<Department>) => api.post<ApiResponse<Department>>('/departments', data),
  update: (id: string, data: Partial<Department>) =>
    api.put<ApiResponse<Department>>(`/departments/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/departments/${id}`),
};

export const doctorApi = {
  list: (params?: Record<string, string>) =>
    api.get<ApiResponse<PaginatedResponse<Doctor>>>('/doctors', { params }),
  get: (id: string) => api.get<ApiResponse<Doctor>>(`/doctors/${id}`),
  create: (data: Record<string, unknown>) => api.post<ApiResponse<Doctor>>('/doctors', data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<ApiResponse<Doctor>>(`/doctors/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/doctors/${id}`),
  getSlots: (id: string, params?: Record<string, string>) =>
    api.get<ApiResponse<PaginatedResponse<Slot>>>(`/doctors/${id}/slots`, { params }),
  createSlot: (id: string, data: Partial<Slot>) =>
    api.post<ApiResponse<Slot>>(`/doctors/${id}/slots`, data),
  createBulkSlots: (id: string, slots: Partial<Slot>[]) =>
    api.post<ApiResponse<Slot[]>>(`/doctors/${id}/slots/bulk`, { slots }),
  createAvailability: (id: string, data: { slot_date: string; start_time: string; end_time: string }) =>
    api.post<ApiResponse<Slot[]>>(`/doctors/${id}/availability`, data),
};

export const slotApi = {
  update: (id: string, data: Partial<Slot>) => api.put<ApiResponse<Slot>>(`/slots/${id}`, data),
  delete: (id: string) => api.delete<ApiResponse<null>>(`/slots/${id}`),
};

export const appointmentApi = {
  book: (data: { doctor_id: string; slot_id: string; reason?: string }) =>
    api.post<ApiResponse<Appointment>>('/appointments', data),
  getMy: (params?: Record<string, string>) =>
    api.get<ApiResponse<PaginatedResponse<Appointment>>>('/appointments/me', { params }),
  getDoctor: (id: string, params?: Record<string, string>) =>
    api.get<ApiResponse<PaginatedResponse<Appointment>>>(`/appointments/doctor/${id}`, { params }),
  getAll: (params?: Record<string, string>) =>
    api.get<ApiResponse<PaginatedResponse<Appointment>>>('/appointments', { params }),
  get: (id: string) => api.get<ApiResponse<Appointment>>(`/appointments/${id}`),
  cancel: (id: string) => api.patch<ApiResponse<Appointment>>(`/appointments/${id}/cancel`),
  reschedule: (id: string, slot_id: string) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}/reschedule`, { slot_id }),
  updateStatus: (id: string, status: string) =>
    api.patch<ApiResponse<Appointment>>(`/appointments/${id}/status`, { status }),
};

export const userApi = {
  getMe: () => api.get<ApiResponse<User>>('/users/me'),
  updateMe: (data: Record<string, unknown>) => api.put<ApiResponse<User>>('/users/me', data),
  getPatients: (params?: Record<string, string>) =>
    api.get<ApiResponse<PaginatedResponse<User>>>('/users/patients', { params }),
  getNotifications: () => api.get<ApiResponse<unknown[]>>('/users/notifications'),
};

export const adminApi = {
  getStats: () => api.get<ApiResponse<AdminStats>>('/admin/stats'),
  getReports: (params?: Record<string, string>) =>
    api.get<ApiResponse<unknown>>('/admin/reports', { params }),
};
