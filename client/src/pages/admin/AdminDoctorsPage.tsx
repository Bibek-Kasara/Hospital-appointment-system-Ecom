import { useEffect, useState } from 'react';
import { doctorApi, departmentApi } from '../../services';
import type { Doctor, Department } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card, { EmptyState } from '../../components/ui/Card';
import { getDepartmentName } from '../../utils';
import { getDoctorImage } from '../../utils';

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', department_id: '', phone: '', specialization: '', qualification: '', experience_years: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetch = () => {
    Promise.all([
      doctorApi.list({ limit: '50' }),
      departmentApi.list({ limit: '50' }),
    ]).then(([docRes, deptRes]) => {
      if (docRes.data.success && docRes.data.data) setDoctors(docRes.data.data.items);
      if (deptRes.data.success && deptRes.data.data) setDepartments(deptRes.data.data.items);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await doctorApi.create({
        ...form,
        experience_years: form.experience_years ? parseInt(form.experience_years, 10) : undefined,
      });
      setShowForm(false);
      setForm({ full_name: '', email: '', password: '', department_id: '', phone: '', specialization: '', qualification: '', experience_years: '' });
      fetch();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (doctor: Doctor) => {
    try {
      await doctorApi.update(doctor._id, { is_active: !doctor.is_active });
      fetch();
    } catch {
      setError('Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this doctor?')) return;
    try {
      await doctorApi.delete(id);
      fetch();
    } catch {
      setError('Delete failed');
    }
  };

  if (loading) return <LoadingPage />;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
        <Button onClick={() => setShowForm(true)}>Add Doctor</Button>
      </div>
      {error && <Alert message={error} className="mt-4" />}

      {showForm && (
        <Card className="mt-6" title="Create Doctor Account">
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Select label="Department" options={[{ value: '', label: 'Select' }, ...departments.map((d) => ({ value: d._id, label: d.name }))]} value={form.department_id} onChange={(e) => setForm({ ...form, department_id: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
            <Input label="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
            <Input label="Experience (years)" type="number" value={form.experience_years} onChange={(e) => setForm({ ...form, experience_years: e.target.value })} />
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" loading={submitting}>Create</Button>
              <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {doctors.length === 0 ? (
        <EmptyState title="No doctors" />
      ) : (
        <div className="mt-6 space-y-3">
          {doctors.map((doc) => (
            <Card key={doc._id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3"><img src={getDoctorImage(doc)} alt={doc.full_name} className="h-10 w-10 rounded-full object-cover" /><h3 className="font-semibold">{doc.full_name}</h3></div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${doc.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {doc.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{doc.specialization} · {getDepartmentName(doc.department_id as Department)}</p>
                  <p className="text-sm text-gray-400">{doc.email}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleActive(doc)}>
                    {doc.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(doc._id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
