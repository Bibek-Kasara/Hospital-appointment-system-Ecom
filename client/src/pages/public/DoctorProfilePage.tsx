import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock } from 'lucide-react';
import { doctorApi } from '../../services';
import type { Doctor, Slot, Department } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card, { EmptyState } from '../../components/ui/Card';
import { formatDate, formatTime, getDepartmentName, getDoctorImage } from '../../utils';

export default function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      doctorApi.get(id),
      doctorApi.getSlots(id, { available: 'true', limit: '50' }),
    ])
      .then(([doctorRes, slotsRes]) => {
        if (doctorRes.data.success) setDoctor(doctorRes.data.data!);
        if (slotsRes.data.success && slotsRes.data.data) setSlots(slotsRes.data.data.items);
      })
      .catch(() => setError('Failed to load doctor profile'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage />;
  if (error || !doctor) return <Alert message={error || 'Doctor not found'} className="m-8" />;

  const slotsByDate = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const date = new Date(slot.slot_date).toISOString().split('T')[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Card>
        <div className="flex flex-col gap-6 sm:flex-row">
          <img src={getDoctorImage(doctor)} alt={doctor.full_name} className="h-24 w-24 shrink-0 rounded-full object-cover" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{doctor.full_name}</h1>
            <p className="text-primary-600">{doctor.specialization}</p>
            <p className="mt-1 text-gray-500">{getDepartmentName(doctor.department_id as Department)}</p>
            {doctor.qualification && <p className="mt-2 text-sm text-gray-600">{doctor.qualification}</p>}
            {doctor.experience_years && (
              <p className="text-sm text-gray-500">{doctor.experience_years} years of experience</p>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Available Slots</h2>
          <Link to={`/patient/book/${doctor._id}`}>
            <Button>
              <Calendar className="h-4 w-4" />
              Book Appointment
            </Button>
          </Link>
        </div>

        {Object.keys(slotsByDate).length === 0 ? (
          <EmptyState
            title="No available slots"
            description="Check back later or contact the hospital."
          />
        ) : (
          <div className="mt-6 space-y-6">
            {Object.entries(slotsByDate).map(([date, dateSlots]) => (
              <div key={date} className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="flex items-center gap-2 font-medium text-gray-900">
                  <Calendar className="h-4 w-4 text-primary-600" />
                  {formatDate(date)}
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {dateSlots.map((slot) => (
                    <span
                      key={slot._id}
                      className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-sm text-green-700"
                    >
                      <Clock className="h-3 w-3" />
                      {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
