import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-NP', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(time: string) {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getDepartmentName(dept: { name?: string } | string | undefined): string {
  if (!dept) return 'Unknown';
  if (typeof dept === 'string') return dept;
  return dept.name || 'Unknown';
}

export function getDoctorImage(doctor: { _id?: string; id?: string; profile_image?: string }) {
  if (doctor.profile_image) return doctor.profile_image;
  const identifier = doctor._id || doctor.id || 'doctor';
  const fallbackId = identifier.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0) % 70 + 1;
  return `https://randomuser.me/api/portraits/men/${fallbackId}.jpg`;
}
