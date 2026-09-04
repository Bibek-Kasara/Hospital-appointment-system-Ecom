import { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/authSlice';
import { appointmentApi } from '../../services';
import type { Appointment, User, Slot } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { formatDate, formatTime, getStatusColor } from '../../utils';

export default function DoctorDashboard() {
  const user = useAppSelector(selectUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    appointmentApi
      .getDoctor(user.id, { limit: '10' })
      .then(({ data }) => {
        if (data.success && data.data) setAppointments(data.data.items);
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  if (loading) return <LoadingPage />;

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => {
    const slot = a.slot_id as Slot;
    return slot && typeof slot === 'object' && new Date(slot.slot_date).toISOString().split('T')[0] === today;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Doctor Dashboard</h1>
      <p className="mt-1 text-gray-500">Welcome, {user?.full_name}</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-primary-600">{todayAppts.length}</p>
          <p className="text-sm text-gray-500">Today's Appointments</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold">{appointments.filter((a) => a.status === 'confirmed').length}</p>
          <p className="text-sm text-gray-500">Confirmed</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-green-600">{appointments.filter((a) => a.status === 'completed').length}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </Card>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Recent Appointments</h2>
      <div className="mt-4 space-y-3">
        {appointments.slice(0, 5).map((apt) => {
          const patient = apt.patient_id as User;
          const slot = apt.slot_id as Slot;
          return (
            <Card key={apt._id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{typeof patient === 'object' ? patient.full_name : 'Patient'}</p>
                  {slot && typeof slot === 'object' && (
                    <p className="text-sm text-gray-500">{formatDate(slot.slot_date)} · {formatTime(slot.start_time)}</p>
                  )}
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(apt.status)}`}>{apt.status}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
