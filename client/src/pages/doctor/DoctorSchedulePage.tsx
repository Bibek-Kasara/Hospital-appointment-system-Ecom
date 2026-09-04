import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/authSlice';
import { doctorApi, slotApi } from '../../services';
import type { Slot } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { EmptyState } from '../../components/ui/Card';
import { CalendarDays, Clock3 } from 'lucide-react';
import { APPOINTMENT_SLOT_DURATION_MINUTES, formatDate, formatTime, getLocalDateInputValue, getLocalTimeInputValue } from '../../utils';

export default function DoctorSchedulePage() {
  const user = useAppSelector(selectUser);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ slot_date: '', start_time: '09:00', end_time: '16:00' });
  const [submitting, setSubmitting] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const startTimeInputRef = useRef<HTMLInputElement>(null);
  const endTimeInputRef = useRef<HTMLInputElement>(null);

  const openPicker = (input: HTMLInputElement | null) => {
    input?.showPicker?.();
    input?.focus();
  };

  const fetchSlots = () => {
    if (!user?.id) return;
    setLoading(true);
    doctorApi
      .getSlots(user.id, { limit: '100' })
      .then(({ data }) => {
        if (data.success && data.data) setSlots(data.data.items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSlots(); }, [user?.id]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    const today = new Date();
    const selectedDate = new Date(`${formData.slot_date}T00:00:00`);
    const [startHour, startMinute] = formData.start_time.split(':').map(Number);
    const [endHour, endMinute] = formData.end_time.split(':').map(Number);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    if (!formData.slot_date || Number.isNaN(selectedDate.getTime())) {
      setError('Please select a valid availability date');
      return;
    }
    if (endMinutes <= startMinutes) {
      setError('End time must be after start time');
      return;
    }
    if (endMinutes - startMinutes < APPOINTMENT_SLOT_DURATION_MINUTES) {
      setError(`Availability must allow at least one ${APPOINTMENT_SLOT_DURATION_MINUTES}-minute slot`);
      return;
    }
    if (selectedDate.toDateString() === today.toDateString()) {
      const currentMinutes = today.getHours() * 60 + today.getMinutes();
      if (startMinutes <= currentMinutes) {
        setError('Availability cannot start in the past');
        return;
      }
    } else if (selectedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      setError('Availability date cannot be in the past');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await doctorApi.createAvailability(user.id, formData);
      setSuccess('20-minute availability slots created');
      setShowForm(false);
      setFormData({ slot_date: '', start_time: '09:00', end_time: '16:00' });
      fetchSlots();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Failed to create slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slot?')) return;
    try {
      await slotApi.delete(id);
      fetchSlots();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Cannot delete booked slot');
    }
  };

  if (loading) return <LoadingPage />;

  const futureSlots = slots.filter((s) => new Date(s.slot_date) >= new Date(new Date().setHours(0, 0, 0, 0)));
  const today = getLocalDateInputValue();
  const minimumStartTime = formData.slot_date === today ? getLocalTimeInputValue() : undefined;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
        <Button onClick={() => setShowForm(!showForm)}>Add Availability</Button>
      </div>

      {success && <Alert type="success" message={success} className="mt-4" onClose={() => setSuccess('')} />}
      {error && <Alert message={error} className="mt-4" onClose={() => setError('')} />}

      {showForm && (
        <Card className="mt-6" title="Set Working Hours">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-3">
            <div className="relative">
              <Input ref={dateInputRef} label="Date" type="date" min={today} className="pr-10" value={formData.slot_date} onChange={(e) => setFormData({ ...formData, slot_date: e.target.value })} required />
              <button type="button" aria-label="Pick availability date" title="Pick availability date" className="absolute right-3 top-8 text-gray-500 hover:text-primary-600" onClick={() => openPicker(dateInputRef.current)}>
                <CalendarDays className="h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <Input ref={startTimeInputRef} label="Start Time" type="time" min={minimumStartTime} step={60} className="pr-10" value={formData.start_time} onChange={(e) => setFormData({ ...formData, start_time: e.target.value })} required />
              <button type="button" aria-label="Pick start time" title="Pick start time" className="absolute right-3 top-8 text-gray-500 hover:text-primary-600" onClick={() => openPicker(startTimeInputRef.current)}>
                <Clock3 className="h-5 w-5" />
              </button>
            </div>
            <div className="relative">
              <Input ref={endTimeInputRef} label="End Time" type="time" min={formData.start_time} step={60} className="pr-10" value={formData.end_time} onChange={(e) => setFormData({ ...formData, end_time: e.target.value })} required />
              <button type="button" aria-label="Pick end time" title="Pick end time" className="absolute right-3 top-8 text-gray-500 hover:text-primary-600" onClick={() => openPicker(endTimeInputRef.current)}>
                <Clock3 className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-500 sm:col-span-3">Appointments are generated automatically in 20-minute intervals.</p>
            <Button type="submit" loading={submitting} className="sm:col-span-3 sm:w-auto">Generate Availability</Button>
          </form>
        </Card>
      )}

      {futureSlots.length === 0 ? (
        <EmptyState title="No upcoming slots" description="Add availability for patients to book." />
      ) : (
        <div className="mt-6 space-y-3">
          {futureSlots.map((slot) => (
            <Card key={slot._id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{formatDate(slot.slot_date)}</p>
                  <p className="text-sm text-gray-500">{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs ${slot.is_booked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {slot.is_booked ? 'Booked' : 'Available'}
                  </span>
                  {!slot.is_booked && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(slot._id)}>Delete</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
