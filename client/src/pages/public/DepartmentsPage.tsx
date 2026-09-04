import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { departmentApi } from '../../services';
import type { Department } from '../../types';
import { Skeleton } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import { EmptyState } from '../../components/ui/Card';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    departmentApi
      .list({ limit: '50' })
      .then(({ data }) => {
        if (data.success && data.data) setDepartments(data.data.items);
      })
      .catch(() => setError('Failed to load departments'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <Skeleton className="mb-8 h-10 w-64" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Departments & Services</h1>
      <p className="mt-2 text-gray-600">Browse our medical departments and find the right care for you.</p>

      {error && <Alert message={error} className="mt-6" />}

      {departments.length === 0 ? (
        <EmptyState title="No departments found" description="Please check back later." />
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <div key={dept._id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
              <p className="mt-2 text-sm text-gray-500">{dept.description || 'Specialized medical care'}</p>
              <Link
                to={`/doctors?department=${dept._id}`}
                className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                View Doctors →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
