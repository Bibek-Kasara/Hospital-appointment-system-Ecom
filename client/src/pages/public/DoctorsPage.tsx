import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { doctorApi, departmentApi } from '../../services';
import type { Doctor, Department } from '../../types';
import { Skeleton } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { getDepartmentName, getDoctorImage } from '../../utils';

export default function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState(searchParams.get('department') || '');

  useEffect(() => {
    departmentApi.list({ limit: '50' }).then(({ data }) => {
      if (data.success && data.data) setDepartments(data.data.items);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: '50', active: 'true' };
    if (department) params.department = department;
    if (search) params.search = search;

    doctorApi
      .list(params)
      .then(({ data }) => {
        if (data.success && data.data) setDoctors(data.data.items);
      })
      .catch(() => setError('Failed to load doctors'))
      .finally(() => setLoading(false));
  }, [department, search]);

  const deptOptions = [
    { value: '', label: 'All Departments' },
    ...departments.map((d) => ({ value: d._id, label: d.name })),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Our Doctors</h1>
      <p className="mt-2 text-gray-600">Find and book appointments with our experienced specialists.</p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select
          options={deptOptions}
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setSearchParams(e.target.value ? { department: e.target.value } : {});
          }}
          className="sm:w-64"
        />
      </div>

      {error && <Alert message={error} className="mt-6" />}

      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : doctors.length === 0 ? (
        <EmptyState title="No doctors found" description="Try adjusting your search or filters." />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <Link
              key={doctor._id}
              to={`/doctors/${doctor._id}`}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <img src={getDoctorImage(doctor)} alt={doctor.full_name} className="h-16 w-16 rounded-full object-cover" />
              <h3 className="mt-4 text-lg font-semibold text-gray-900">{doctor.full_name}</h3>
              <p className="text-sm text-primary-600">{doctor.specialization}</p>
              <p className="mt-1 text-sm text-gray-500">{getDepartmentName(doctor.department_id as Department)}</p>
              {doctor.experience_years && (
                <p className="mt-2 text-xs text-gray-400">{doctor.experience_years} years experience</p>
              )}
              <span className="mt-3 inline-block text-sm font-medium text-primary-600">View profile and book</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
