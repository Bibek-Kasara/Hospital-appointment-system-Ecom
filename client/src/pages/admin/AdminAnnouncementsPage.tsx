import Card from '../../components/ui/Card';
import { Bell } from 'lucide-react';

const announcements = [
  {
    title: 'Online Booking Available 24/7',
    date: '2026-01-15',
    content: 'Patients can now book appointments online at any time through the Sahid Hospital Appointment System.',
  },
  {
    title: 'New Cardiology Department Hours',
    date: '2026-02-01',
    content: 'The Cardiology department has extended OPD hours to 6 PM on weekdays.',
  },
  {
    title: 'Holiday Schedule',
    date: '2026-03-10',
    content: 'The hospital will operate on reduced hours during upcoming public holidays. Please check slot availability before booking.',
  },
];

export default function AdminAnnouncementsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
      <p className="mt-1 text-gray-500">Hospital notices displayed on the public website</p>

      <div className="mt-6 space-y-4">
        {announcements.map((a, i) => (
          <Card key={i}>
            <div className="flex items-start gap-3">
              <Bell className="mt-1 h-5 w-5 shrink-0 text-primary-600" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{a.title}</h3>
                  <span className="text-xs text-gray-400">{a.date}</span>
                </div>
                <p className="mt-1 text-sm text-gray-600">{a.content}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Announcement management via CMS is planned for a future release. Current notices are configured in the application.
      </p>
    </div>
  );
}
