import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Heart, Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, selectUser } from '../../store/authSlice';
import Button from '../ui/Button';

interface DashboardLayoutProps {
  navItems: { to: string; label: string }[];
  title: string;
}

export default function DashboardLayout({ navItems, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-gray-200 bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Heart className="h-6 w-6 text-primary-600" />
          <span className="font-bold text-gray-900">{title}</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-700"
              onClick={() => setSidebarOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <p className="truncate text-sm font-medium text-gray-900">{user?.full_name}</p>
          <p className="truncate text-xs text-gray-500">{user?.email}</p>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:px-8">
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="text-sm text-gray-500 hover:text-primary-600">
            ← Back to Website
          </Link>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PatientLayout() {
  return (
    <DashboardLayout
      title="Patient Portal"
      navItems={[
        { to: '/patient/dashboard', label: 'Dashboard' },
        { to: '/patient/book', label: 'Book Appointment' },
        { to: '/patient/appointments', label: 'My Appointments' },
        { to: '/patient/notifications', label: 'Notifications' },
        { to: '/patient/profile', label: 'Profile' },
      ]}
    />
  );
}

export function DoctorLayout() {
  return (
    <DashboardLayout
      title="Doctor Portal"
      navItems={[
        { to: '/doctor/dashboard', label: 'Dashboard' },
        { to: '/doctor/schedule', label: 'My Schedule' },
        { to: '/doctor/appointments', label: 'Appointments' },
        { to: '/doctor/profile', label: 'Profile' },
      ]}
    />
  );
}

export function AdminLayout() {
  return (
    <DashboardLayout
      title="Admin Portal"
      navItems={[
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/departments', label: 'Departments' },
        { to: '/admin/doctors', label: 'Doctors' },
        { to: '/admin/appointments', label: 'Appointments' },
        { to: '/admin/patients', label: 'Patients' },
        { to: '/admin/reports', label: 'Reports' },
        { to: '/admin/announcements', label: 'Announcements' },
      ]}
    />
  );
}
