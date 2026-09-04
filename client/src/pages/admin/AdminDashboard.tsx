import { useEffect, useState } from 'react';
import { adminApi } from '../../services';
import type { AdminStats } from '../../types';
import { LoadingPage } from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import { Users, Stethoscope, Building2, Calendar, TrendingDown } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(({ data }) => {
      if (data.success && data.data) setStats(data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  const cards = [
    { label: 'Total Patients', value: stats?.totalPatients ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'Active Doctors', value: stats?.totalDoctors ?? 0, icon: Stethoscope, color: 'text-green-600' },
    { label: 'Departments', value: stats?.totalDepartments ?? 0, icon: Building2, color: 'text-purple-600' },
    { label: 'Total Appointments', value: stats?.totalAppointments ?? 0, icon: Calendar, color: 'text-primary-600' },
    { label: "Today's Appointments", value: stats?.todayAppointments ?? 0, icon: Calendar, color: 'text-teal-600' },
    { label: 'Cancellation Rate', value: `${stats?.cancellationRate ?? 0}%`, icon: TrendingDown, color: 'text-red-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p className="mt-1 text-gray-500">Hospital overview and statistics</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <div className="flex items-center gap-4">
              <div className={`rounded-lg bg-gray-50 p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        <Card title="Pending" className="text-center">
          <p className="text-3xl font-bold text-yellow-600">{stats?.pendingAppointments ?? 0}</p>
        </Card>
        <Card title="Completed" className="text-center">
          <p className="text-3xl font-bold text-green-600">{stats?.completedAppointments ?? 0}</p>
        </Card>
        <Card title="Cancelled" className="text-center">
          <p className="text-3xl font-bold text-red-600">{stats?.cancelledAppointments ?? 0}</p>
        </Card>
      </div>
    </div>
  );
}
