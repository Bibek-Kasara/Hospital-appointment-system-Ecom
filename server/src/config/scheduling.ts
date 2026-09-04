export const APPOINTMENT_SLOT_DURATION_MINUTES = 20;

export const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const remainingMinutes = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${remainingMinutes}`;
};

export const getSlotDate = (date: Date, time: string) => {
  const slotDate = new Date(date);
  const [hours, minutes] = time.split(':').map(Number);
  slotDate.setHours(hours, minutes, 0, 0);
  return slotDate;
};