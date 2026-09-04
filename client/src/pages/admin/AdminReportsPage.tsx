import { useEffect, useState } from 'react';
import { adminApi } from '../../services';
import { LoadingPage } from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';

interface ReportData {
  period: { from: string; to: string };
  totalAppointments: number;
  cancellationRate: number;
  appointmentsByDay: { date: string; count: number }[];
  appointmentsByDepartment: { department: string; count: number }[];
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getReports().then(({ data }) => {
      if (data.success && data.data) setReport(data.data as ReportData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
      <p className="mt-1 text-gray-500">Appointment analytics for the last 30 days</p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Card title="Summary">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Total Appointments</span>
              <span className="font-bold">{report?.totalAppointments ?? 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cancellation Rate</span>
              <span className="font-bold text-red-600">{report?.cancellationRate ?? 0}%</span>
            </div>
          </div>
        </Card>

        <Card title="By Department">
          <div className="space-y-2">
            {report?.appointmentsByDepartment.map(({ department, count }) => (
              <div key={department} className="flex items-center justify-between">
                <span className="text-sm">{department}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 rounded-full bg-primary-200" style={{ width: `${Math.min(count * 20, 120)}px` }}>
                    <div className="h-2 rounded-full bg-primary-600" style={{ width: '100%' }} />
                  </div>
                  <span className="text-sm font-medium">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Appointments by Day" className="mt-6">
        {report?.appointmentsByDay.length === 0 ? (
          <p className="text-gray-500">No data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Count</th>
                </tr>
              </thead>
              <tbody>
                {report?.appointmentsByDay.map(({ date, count }) => (
                  <tr key={date} className="border-b border-gray-100">
                    <td className="py-2">{date}</td>
                    <td className="py-2 font-medium">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
