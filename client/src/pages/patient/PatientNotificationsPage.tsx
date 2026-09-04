import { useEffect, useState } from 'react';
import { userApi } from '../../services';
import { LoadingPage } from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card, { EmptyState } from '../../components/ui/Card';
import { formatDate } from '../../utils';

interface NotificationItem {
  _id: string;
  type: string;
  message: string;
  is_sent: boolean;
  sent_at?: string;
  createdAt: string;
}

export default function PatientNotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userApi
      .getNotifications()
      .then(({ data }) => {
        if (data.success && data.data) setNotifications(data.data as NotificationItem[]);
      })
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
      {error && <Alert message={error} className="mt-4" />}
      {notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You'll see appointment updates here." />
      ) : (
        <div className="mt-6 space-y-3">
          {notifications.map((n) => (
            <Card key={n._id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{n.message}</p>
                  <p className="mt-1 text-xs text-gray-500">{formatDate(n.sent_at || n.createdAt)}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${n.is_sent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {n.is_sent ? 'Sent' : 'Pending'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
