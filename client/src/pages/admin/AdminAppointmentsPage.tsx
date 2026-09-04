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
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const fetch = () => {
    setLoading(true);
    const params: Record<string, string> = { limit: '50' };
    if (statusFilter) params.status = statusFilter;
    appointmentApi.getAll(params).then(({ data }) => {
      if (data.success && data.data) setAppointments(data.data.items);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const handleCancel = async () => {
    if (!cancelId) return;
    setCancelling(true);
    try {
      await appointmentApi.cancel(cancelId);
      setCancelId(null);
      fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Cancel failed');
    } finally {
      setCancelling(false);
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
                    <Button variant="danger" size="sm" onClick={() => setCancelId(apt._id)}>Cancel</Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {cancelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="cancel-title">
          <Card className="w-full max-w-md" title="Cancel Appointment?">
            <p id="cancel-title" className="text-sm text-gray-600">Are you sure you want to cancel this appointment?</p>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCancelId(null)} disabled={cancelling}>Keep Appointment</Button>
              <Button variant="danger" onClick={handleCancel} loading={cancelling}>Cancel Appointment</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
