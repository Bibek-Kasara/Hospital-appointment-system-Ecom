import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/authSlice';
import { appointmentApi } from '../../services';
import type { Appointment, User, Slot } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card, { EmptyState } from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import { formatDate, formatTime, getStatusColor } from '../../utils';

export default function DoctorAppointmentsPage() {
  const user = useAppSelector(selectUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');

  const fetch = () => {
    if (!user?.id) return;
    setLoading(true);
    const params: Record<string, string> = { limit: '50' };
    if (statusFilter) params.status = statusFilter;
    appointmentApi
      .getDoctor(user.id, params)
      .then(({ data }) => {
        if (data.success && data.data) setAppointments(data.data.items);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [user?.id, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setActionLoading(id);
    try {
      await appointmentApi.updateStatus(id, status);
      fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Update failed');
    } finally {
      setActionLoading('');
    }
  };

  if (loading && appointments.length === 0) return <LoadingPage />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
      {error && <Alert message={error} className="mt-4" onClose={() => setError('')} />}

      <Select
        options={[
          { value: '', label: 'All Statuses' },
          { value: 'confirmed', label: 'Confirmed' },
          { value: 'completed', label: 'Completed' },
          { value: 'no-show', label: 'No Show' },
        ]}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="mt-4 w-48"
      />

      {appointments.length === 0 ? (
        <EmptyState title="No appointments" description="Appointments will appear here when patients book." />
      ) : (
        <div className="mt-6 space-y-4">
          {appointments.map((apt) => {
            const patient = apt.patient_id as User;
            const slot = apt.slot_id as Slot;
            const canUpdate = ['confirmed', 'pending'].includes(apt.status);

            return (
              <Card key={apt._id}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{typeof patient === 'object' ? patient.full_name : 'Patient'}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
                    </div>
                    {slot && typeof slot === 'object' && (
                      <p className="mt-1 text-sm text-gray-500">{formatDate(slot.slot_date)} · {formatTime(slot.start_time)}</p>
                    )}
                    {apt.reason && <p className="text-sm text-gray-600">Reason: {apt.reason}</p>}
                    {typeof patient === 'object' && patient.phone && (
                      <p className="text-sm text-gray-500">Phone: {patient.phone}</p>
                    )}
                  </div>
                  {canUpdate && (
                    <div className="flex gap-2">
                      <Button size="sm" loading={actionLoading === apt._id} onClick={() => updateStatus(apt._id, 'completed')}>
                        Completed
                      </Button>
                      <Button variant="outline" size="sm" loading={actionLoading === apt._id} onClick={() => updateStatus(apt._id, 'no-show')}>
                        No Show
                      </Button>
                    </div>
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
