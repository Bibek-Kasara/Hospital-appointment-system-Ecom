import { useEffect, useState } from 'react';
import { userApi } from '../../services';
import type { User } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Card, { EmptyState } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { Search } from 'lucide-react';

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params: Record<string, string> = { limit: '50' };
    if (search) params.search = search;
    userApi.getPatients(params).then(({ data }) => {
      if (data.success && data.data) setPatients(data.data.items);
    }).finally(() => setLoading(false));
  }, [search]);

  if (loading && patients.length === 0) return <LoadingPage />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
      <div className="relative mt-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {patients.length === 0 ? (
        <EmptyState title="No patients found" />
      ) : (
        <div className="mt-6 space-y-3">
          {patients.map((p) => (
            <Card key={p.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{p.full_name}</h3>
                  <p className="text-sm text-gray-500">{p.email}</p>
                  {p.phone && <p className="text-sm text-gray-400">{p.phone}</p>}
                </div>
                {p.gender && <span className="text-sm capitalize text-gray-500">{p.gender}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
