export type UserRole = 'patient' | 'doctor' | 'admin';

export type Gender = 'male' | 'female' | 'other';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export type NotificationType = 'email' | 'sms';

export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
