import { useEffect, useState } from 'react';
import { appointmentApi } from '../../services';
import type { Appointment, Doctor, User, Slot } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card, { EmptyState } from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import { formatDate, formatTime, getStatusColor } from '../../utils';

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    const params: Record<string, string> = { limit: '50' };
    if (statusFilter) params.status = statusFilter;
    appointmentApi.getAll(params).then(({ data }) => {
      if (data.success && data.data) setAppointments(data.data.items);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this appointment?')) return;
    try {
      await appointmentApi.cancel(id);
      fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading && appointments.length === 0) return <LoadingPage />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">All Appointments</h1>
      {error && <Alert message={error} className="mt-4" />}
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
        className="mt-4 w-48"
      />

      {appointments.length === 0 ? (
        <EmptyState title="No appointments" />
      ) : (
        <div className="mt-6 space-y-3">
          {appointments.map((apt) => {
            const patient = apt.patient_id as User;
            const doctor = apt.doctor_id as Doctor;
            const slot = apt.slot_id as Slot;
            return (
              <Card key={apt._id}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{typeof patient === 'object' ? patient.full_name : 'Patient'}</span>
                      <span>→</span>
                      <span className="font-medium">{typeof doctor === 'object' ? doctor.full_name : 'Doctor'}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(apt.status)}`}>{apt.status}</span>
                    </div>
                    {slot && typeof slot === 'object' && (
                      <p className="text-sm text-gray-500">{formatDate(slot.slot_date)} · {formatTime(slot.start_time)}</p>
                    )}
                  </div>
                  {!['cancelled', 'completed'].includes(apt.status) && (
                    <Button variant="danger" size="sm" onClick={() => handleCancel(apt._id)}>Cancel</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
