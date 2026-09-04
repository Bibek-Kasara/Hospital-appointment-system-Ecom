import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { fetchMe, setInitialized, selectAuthInitialized } from './store/authSlice';
import { getAccessToken } from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import PublicLayout from './components/layouts/PublicLayout';
import { PatientLayout, DoctorLayout, AdminLayout } from './components/layouts/DashboardLayout';
import { LoadingPage } from './components/ui/Spinner';

import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import DepartmentsPage from './pages/public/DepartmentsPage';
import DoctorsPage from './pages/public/DoctorsPage';
import DoctorProfilePage from './pages/public/DoctorProfilePage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';
import TermsPage from './pages/public/TermsPage';
import PrivacyPage from './pages/public/PrivacyPage';
import NotFoundPage from './pages/public/NotFoundPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import PatientAppointmentsPage from './pages/patient/PatientAppointmentsPage';
import AppointmentDetailPage from './pages/patient/AppointmentDetailPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';
import PatientNotificationsPage from './pages/patient/PatientNotificationsPage';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorPortalProfilePage from './pages/doctor/DoctorProfilePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDepartmentsPage from './pages/admin/AdminDepartmentsPage';
import AdminDoctorsPage from './pages/admin/AdminDoctorsPage';
import AdminAppointmentsPage from './pages/admin/AdminAppointmentsPage';
import AdminPatientsPage from './pages/admin/AdminPatientsPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const initialized = useAppSelector(selectAuthInitialized);

  useEffect(() => {
    if (getAccessToken() && !initialized) {
      dispatch(fetchMe());
    } else if (!getAccessToken() && !initialized) {
      dispatch(setInitialized());
    }
  }, [dispatch, initialized]);

  if (!initialized && getAccessToken()) return <LoadingPage />;

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <AuthInitializer>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="doctors/:id" element={<DoctorProfilePage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route path="patient" element={<ProtectedRoute role="patient"><PatientLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="book" element={<BookAppointmentPage />} />
          <Route path="book/:doctorId" element={<BookAppointmentPage />} />
          <Route path="appointments" element={<PatientAppointmentsPage />} />
          <Route path="appointments/:id" element={<AppointmentDetailPage />} />
          <Route path="profile" element={<PatientProfilePage />} />
          <Route path="notifications" element={<PatientNotificationsPage />} />
        </Route>

        <Route path="doctor" element={<ProtectedRoute role="doctor"><DoctorLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="schedule" element={<DoctorSchedulePage />} />
          <Route path="appointments" element={<DoctorAppointmentsPage />} />
          <Route path="profile" element={<DoctorPortalProfilePage />} />
        </Route>

        <Route path="admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="departments" element={<AdminDepartmentsPage />} />
          <Route path="doctors" element={<AdminDoctorsPage />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
          <Route path="patients" element={<AdminPatientsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="announcements" element={<AdminAnnouncementsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthInitializer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
