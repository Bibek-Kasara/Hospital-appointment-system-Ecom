import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { appointmentApi } from '../../services';
import type { Appointment, Doctor, Slot } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import { formatDate, formatTime, getStatusColor, getDoctorImage } from '../../utils';

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    appointmentApi
      .get(id)
      .then(({ data }) => {
        if (data.success) setAppointment(data.data!);
      })
      .catch(() => setError('Failed to load appointment'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage />;
  if (error || !appointment) return <Alert message={error || 'Not found'} className="m-8" />;

  const doctor = appointment.doctor_id as Doctor;
  const slot = appointment.slot_id as Slot;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Appointment Details</h1>
      <Card className="mt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Status</span>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Doctor</span>
            {typeof doctor === 'object' && <img src={getDoctorImage(doctor)} alt={doctor.full_name} className="h-10 w-10 rounded-full object-cover" />}
            <span className="font-medium">{typeof doctor === 'object' ? doctor.full_name : '—'}</span>
          </div>
          {slot && typeof slot === 'object' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span>{formatDate(slot.slot_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
              </div>
            </>
          )}
          {appointment.reason && (
            <div className="flex justify-between">
              <span className="text-gray-500">Reason</span>
              <span>{appointment.reason}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Booked on</span>
            <span>{formatDate(appointment.booked_at)}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
