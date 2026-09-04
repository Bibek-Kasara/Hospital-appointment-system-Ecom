export type UserRole = 'patient' | 'doctor' | 'admin';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  profile_image?: string;
}

export interface Department {
  _id: string;
  name: string;
  description?: string;
}

export interface Doctor {
  _id: string;
  full_name: string;
  department_id: Department | string;
  specialization?: string;
  profile_image?: string;
  email: string;
  phone?: string;
  qualification?: string;
  experience_years?: number;
  is_active: boolean;
}

export interface Slot {
  _id: string;
  doctor_id: string;
  slot_date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

export interface Appointment {
  _id: string;
  patient_id: User | string;
  doctor_id: Doctor | string;
  slot_id: Slot | string;
  status: AppointmentStatus;
  reason?: string;
  booked_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  totalAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  cancellationRate: number;
}
