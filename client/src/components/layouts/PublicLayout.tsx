import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, selectIsAuthenticated, selectUser } from '../../store/authSlice';
import Button from '../ui/Button';

// 1. IMPORT THE LOGO HERE (Stepping back two folders to find assets)
import hospitalLogo from '../../assets/logo.png';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/departments', label: 'Departments' },
  { to: '/doctors', label: 'Doctors' },
  { to: '/contact', label: 'Contact' },
  { to: '/faq', label: 'FAQ' },
];

export default function PublicLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'doctor'
        ? '/doctor/dashboard'
        : '/patient/dashboard';

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg ">
              {/* 2. USE THE LOGO VARIABLE HERE */}
              <img src={hospitalLogo} alt="Sahid Hospital Logo" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900">Sahid Hospital</span>
              <p className="text-xs text-gray-500">Appointment System</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-primary-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPath}>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Register</Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="rounded-lg p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-gray-200 px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t pt-3">
                {isAuthenticated ? (
                  <>
                    <Link to={dashboardPath} onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button variant="ghost" className="w-full" onClick={handleLogout}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full">Register</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-gray-200 bg-gray-900 text-gray-300">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Heart className="h-6 w-6 text-primary-400" />
                <span className="font-bold text-white">Sahid Hospital</span>
              </div>
              <p className="mt-3 text-sm">
                Government hospital providing quality healthcare services to citizens of Nepal.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white">Quick Links</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link to="/departments" className="hover:text-white">Departments</Link></li>
                <li><Link to="/doctors" className="hover:text-white">Find a Doctor</Link></li>
                <li><Link to="/register" className="hover:text-white">Book Appointment</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Contact</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li>Baneshwor, Kathmandu</li>
                <li>+977-1-4221111</li>
                <li>info@sahidhospital.gov.np</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white">Legal</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
            © {new Date().getFullYear()} Sahid Hospital. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
