import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { appointmentApi } from '../../services';
import type { Appointment, Doctor, Slot } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Card, { EmptyState } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { formatDate, formatTime, getStatusColor } from '../../utils';

export default function PatientDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentApi
      .getMy({ limit: '5' })
      .then(({ data }) => {
        if (data.success && data.data) setAppointments(data.data.items);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  const upcoming = appointments.filter((a) => !['cancelled', 'completed'].includes(a.status));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
      <p className="mt-1 text-gray-500">Welcome back! Manage your healthcare appointments.</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <Card className="text-center">
          <Calendar className="mx-auto h-8 w-8 text-primary-600" />
          <p className="mt-2 text-2xl font-bold">{upcoming.length}</p>
          <p className="text-sm text-gray-500">Upcoming</p>
        </Card>
        <Card className="text-center">
          <Clock className="mx-auto h-8 w-8 text-green-600" />
          <p className="mt-2 text-2xl font-bold">{appointments.filter((a) => a.status === 'completed').length}</p>
          <p className="text-sm text-gray-500">Completed</p>
        </Card>
        <Link to="/patient/book">
          <Card className="flex h-full cursor-pointer items-center justify-center border-dashed border-primary-300 bg-primary-50 transition-colors hover:bg-primary-100">
            <div className="text-center">
              <Calendar className="mx-auto h-8 w-8 text-primary-600" />
              <p className="mt-2 font-medium text-primary-700">Book New Appointment</p>
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Appointments</h2>
          <Link to="/patient/appointments" className="text-sm text-primary-600 hover:text-primary-700">
            View all →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <EmptyState
            title="No appointments yet"
            description="Book your first appointment to get started."
            action={
              <Link to="/patient/book">
                <Button>Book Appointment</Button>
              </Link>
            }
          />
        ) : (
          <div className="mt-4 space-y-3">
            {appointments.map((apt) => {
              const doctor = apt.doctor_id as Doctor;
              const slot = apt.slot_id as Slot;
              return (
                <div key={apt._id} className="rounded-lg border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{typeof doctor === 'object' ? doctor.full_name : 'Doctor'}</p>
                      <p className="text-sm text-gray-500">
                        {slot && typeof slot === 'object'
                          ? `${formatDate(slot.slot_date)} at ${formatTime(slot.start_time)}`
                          : ''}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
