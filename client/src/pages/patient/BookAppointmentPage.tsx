import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { departmentApi, doctorApi, appointmentApi } from '../../services';
import type { Department, Doctor, Slot } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import { LoadingPage, Skeleton } from '../../components/ui/Spinner';
import { formatDate, formatTime, getDoctorImage, getLocalDateInputValue } from '../../utils';

const steps = ['Department', 'Doctor', 'Date & Time', 'Confirm'];

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId?: string }>();
  const [step, setStep] = useState(0);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [preselectedDoctor, setPreselectedDoctor] = useState<Doctor | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    departmentApi.list({ limit: '50' }).then(({ data }) => {
      if (data.success && data.data) setDepartments(data.data.items);
    }).finally(() => setInitialLoading(false));
  }, []);

  useEffect(() => {
    if (!doctorId) return;
    doctorApi.get(doctorId).then(({ data }) => {
      if (data.success && data.data) {
        setPreselectedDoctor(data.data);
        setSelectedDoctor(data.data._id);
        setSelectedDept(typeof data.data.department_id === 'string' ? data.data.department_id : data.data.department_id._id);
        setStep(2);
      }
    }).catch(() => setError('Failed to load the selected doctor'));
  }, [doctorId]);

  useEffect(() => {
    if (!selectedDept) return;
    setLoading(true);
    doctorApi.list({ department: selectedDept, active: 'true', limit: '50' }).then(({ data }) => {
      if (data.success && data.data) setDoctors(data.data.items);
    }).finally(() => setLoading(false));
  }, [selectedDept]);

  useEffect(() => {
    if (!selectedDoctor) return;
    setLoading(true);
    const params: Record<string, string> = { limit: '100' };
    if (selectedDate) params.date = selectedDate;
    doctorApi.getSlots(selectedDoctor, params).then(({ data }) => {
      if (data.success && data.data) setSlots(data.data.items);
    }).finally(() => setLoading(false));
  }, [selectedDoctor, selectedDate]);

  const handleBook = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await appointmentApi.book({
        doctor_id: selectedDoctor,
        slot_id: selectedSlot,
        reason: reason || undefined,
      });
      if (data.success) {
        navigate('/patient/appointments', { state: { message: 'Appointment booked successfully!' } });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <LoadingPage />;

  const selectedDoctorData = doctors.find((d) => d._id === selectedDoctor) || preselectedDoctor;
  const selectedSlotData = slots.find((s) => s._id === selectedSlot);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
      <p className="mt-1 text-gray-500">Follow the steps to schedule your visit</p>

      <div className="mt-8 flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              i < step ? 'bg-primary-600 text-white' : i === step ? 'border-2 border-primary-600 text-primary-600' : 'border border-gray-300 text-gray-400'
            }`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`hidden text-sm sm:inline ${i === step ? 'font-medium text-gray-900' : 'text-gray-500'}`}>{s}</span>
            {i < steps.length - 1 && <div className="mx-2 h-px w-8 bg-gray-300" />}
          </div>
        ))}
      </div>

      {error && <Alert message={error} className="mt-6" />}

      <Card className="mt-8">
        {step === 0 && (
          <div>
            <h2 className="text-lg font-semibold">Select Department</h2>
            <Select
              label="Department"
              options={[
                { value: '', label: 'Choose a department' },
                ...departments.map((d) => ({ value: d._id, label: d.name })),
              ]}
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="mt-4"
            />
            <Button className="mt-6" disabled={!selectedDept} onClick={() => setStep(1)}>
              Next
            </Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold">Select Doctor</h2>
            {loading ? (
              <div className="mt-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
            ) : (
              <div className="mt-4 space-y-2">
                {doctors.map((doc) => (
                  <label
                    key={doc._id}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                      selectedDoctor === doc._id ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input type="radio" name="doctor" value={doc._id} checked={selectedDoctor === doc._id} onChange={() => setSelectedDoctor(doc._id)} className="text-primary-600" />
                    <img src={getDoctorImage(doc)} alt="" className="h-10 w-10 rounded-full object-cover" />
                    <div>
                      <p className="font-medium">{doc.full_name}</p>
                      <p className="text-sm text-gray-500">{doc.specialization}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
              <Button disabled={!selectedDoctor} onClick={() => setStep(2)}>Next</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold">Select Date & Time</h2>
            <Input
              label="Appointment date"
              type="date"
              min={getLocalDateInputValue()}
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
              className="mt-4 max-w-xs"
            />
            {loading ? (
              <Skeleton className="mt-4 h-32" />
            ) : !selectedDate ? (
              <p className="mt-4 text-gray-500">Select a date to see available slots.</p>
            ) : slots.length === 0 ? (
              <p className="mt-4 text-gray-500">No appointment slots are available for this date.</p>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot._id}
                    type="button"
                    disabled={slot.is_booked}
                    onClick={() => setSelectedSlot(slot._id)}
                    className={`rounded-lg border px-3 py-2 text-sm transition-colors ${slot.is_booked ? 'cursor-not-allowed border-gray-300 bg-gray-200 text-gray-500' : selectedSlot === slot._id ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-primary-300'}`}
                  >
                    {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                    {slot.is_booked && <span className="ml-1 text-xs">(Booked)</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!selectedSlot} onClick={() => setStep(3)}>Next</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold">Confirm Booking</h2>
            <div className="mt-4 space-y-2 rounded-lg bg-gray-50 p-4 text-sm">
              <p><span className="font-medium">Doctor:</span> {selectedDoctorData?.full_name}</p>
              <p><span className="font-medium">Specialization:</span> {selectedDoctorData?.specialization}</p>
              {selectedSlotData && (
                <p><span className="font-medium">Date & Time:</span> {formatDate(selectedSlotData.slot_date)} at {formatTime(selectedSlotData.start_time)}</p>
              )}
            </div>
            <Textarea
              label="Reason for visit (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-4"
            />
            <div className="mt-6 flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
              <Button loading={loading} onClick={handleBook}>Confirm Booking</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
