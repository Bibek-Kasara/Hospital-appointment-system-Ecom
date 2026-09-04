import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { appointmentApi, doctorApi } from '../../services';
import type { Appointment, Doctor, Slot } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card, { EmptyState } from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import { formatDate, formatTime, getStatusColor, getDoctorImage } from '../../utils';

export default function PatientAppointmentsPage() {
  const location = useLocation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState((location.state as { message?: string })?.message || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleSlots, setRescheduleSlots] = useState<Slot[]>([]);
  const [selectedNewSlot, setSelectedNewSlot] = useState('');

  const fetchAppointments = () => {
    setLoading(true);
    const params: Record<string, string> = { limit: '50' };
    if (statusFilter) params.status = statusFilter;
    appointmentApi
      .getMy(params)
      .then(({ data }) => {
        if (data.success && data.data) setAppointments(data.data.items);
      })
      .catch(() => setError('Failed to load appointments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, [statusFilter]);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(id);
    try {
      await appointmentApi.cancel(id);
      fetchAppointments();
      setSuccess('Appointment cancelled');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Cancel failed');
    } finally {
      setActionLoading('');
    }
  };

  const openReschedule = async (apt: Appointment) => {
    const doctorId = typeof apt.doctor_id === 'object' ? (apt.doctor_id as Doctor)._id : apt.doctor_id;
    setRescheduleId(apt._id);
    const { data } = await doctorApi.getSlots(doctorId as string, { available: 'true', limit: '50' });
    if (data.success && data.data) setRescheduleSlots(data.data.items);
  };

  const handleReschedule = async () => {
    if (!rescheduleId || !selectedNewSlot) return;
    setActionLoading(rescheduleId);
    try {
      await appointmentApi.reschedule(rescheduleId, selectedNewSlot);
      setRescheduleId(null);
      setSelectedNewSlot('');
      fetchAppointments();
      setSuccess('Appointment rescheduled');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Reschedule failed');
    } finally {
      setActionLoading('');
    }
  };

  if (loading && appointments.length === 0) return <LoadingPage />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>

      {success && <Alert type="success" message={success} className="mt-4" onClose={() => setSuccess('')} />}
      {error && <Alert message={error} className="mt-4" onClose={() => setError('')} />}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Select
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'confirmed', label: 'Confirmed' },
            { value: 'pending', label: 'Pending' },
            { value: 'completed', label: 'Completed' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        />
        <Link to="/patient/book">
          <Button>Book New</Button>
        </Link>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments yet"
          description="Book one now to get started."
          action={<Link to="/patient/book"><Button>Book Appointment</Button></Link>}
        />
      ) : (
        <div className="mt-6 space-y-4">
          {appointments.map((apt) => {
            const doctor = apt.doctor_id as Doctor;
            const slot = apt.slot_id as Slot;
            const canModify = ['pending', 'confirmed'].includes(apt.status);

            return (
              <Card key={apt._id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {typeof doctor === 'object' && <img src={getDoctorImage(doctor)} alt="" className="h-9 w-9 rounded-full object-cover" />}
                      <h3 className="font-semibold">{typeof doctor === 'object' ? doctor.full_name : 'Doctor'}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </div>
                    {slot && typeof slot === 'object' && (
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(slot.slot_date)} · {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </p>
                    )}
                    {apt.reason && <p className="mt-1 text-sm text-gray-600">Reason: {apt.reason}</p>}
                  </div>
                  {canModify && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openReschedule(apt)} loading={actionLoading === apt._id}>
                        Reschedule
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleCancel(apt._id)} loading={actionLoading === apt._id}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {rescheduleId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md" title="Reschedule Appointment">
            <div className="mt-4 max-h-60 space-y-2 overflow-y-auto">
              {rescheduleSlots.map((slot) => (
                <label key={slot._id} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${selectedNewSlot === slot._id ? 'border-primary-500 bg-primary-50' : ''}`}>
                  <input type="radio" checked={selectedNewSlot === slot._id} onChange={() => setSelectedNewSlot(slot._id)} />
                  <span className="text-sm">{formatDate(slot.slot_date)} · {formatTime(slot.start_time)}</span>
                </label>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => { setRescheduleId(null); setSelectedNewSlot(''); }}>Cancel</Button>
              <Button disabled={!selectedNewSlot} loading={!!actionLoading} onClick={handleReschedule}>Confirm</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
