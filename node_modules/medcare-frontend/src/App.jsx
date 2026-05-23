import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { useAuthStore } from './store/authStore';

import Layout from "./components/ui/Layout.jsx";

const HomePage = lazy(() => import('./pages/Home'));
const DashboardPage = lazy(() => import('./pages/Dashboard'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage'));
const DoctorProfilePage = lazy(() => import('./pages/DoctorProfilePage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('./pages/PaymentSuccessPage'));
const ReceiptPage = lazy(() => import('./pages/ReceiptPage'));
const AmbulancePage = lazy(() => import('./pages/AmbulancePage'));
const ForgotPage = lazy(() => import('./pages/ForgotPage'));
const OAuthSuccess = lazy(() => import('./pages/OAuthSuccess'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ResearchPage = lazy(() => import('./pages/ResearchPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const CookiesPage = lazy(() => import('./pages/CookiesPage'));
const VoiceAssistant = lazy(() => import('./components/VoiceAssistant'));

// PRIVATE ROUTE
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  const token = localStorage.getItem("token");

  return isAuthenticated || token
    ? children
    : <Navigate to="/login" replace />;
};

// PUBLIC ROUTE
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const Fallback = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
    <div style={{ width: 40, height: 40, border: '3px solid #1e293b', borderTopColor: '#06b6d4', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
    <Routes>

      {/* 🔥 LOGIN OUTSIDE LAYOUT */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
  path="/oauth-success"
  element={<OAuthSuccess />}
/>

      {/* 🔥 MAIN APP */}
      <Route path="/" element={<Layout />}>


      <Route
  path="ai"
  element={
    <PrivateRoute>
      <VoiceAssistant />
    </PrivateRoute>
  }
/>

        <Route index element={<HomePage />} />

        <Route path="doctors" element={<DoctorsPage />} />
        <Route path="doctors/:id" element={<DoctorProfilePage />} />
        <Route path="payment/:appointmentId" element={<PaymentPage />} />
        <Route path="payment-success" element={<PaymentSuccessPage />} />
        <Route path="receipt/:id" element={<ReceiptPage />} />
        <Route path="emergency" element={<AmbulancePage />} />
        <Route path="book" element={<Navigate to="/dashboard/appointments" replace />} />
        <Route path="testimonials" element={<TestimonialsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="research" element={<ResearchPage />} />
        <Route path="careers" element={<CareersPage />} />
        <Route path="privacy" element={<PrivacyPage />} />
        <Route path="terms" element={<TermsPage />} />
        <Route path="cookies" element={<CookiesPage />} />

        <Route
          path="dashboard/*"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/forgot" element={<ForgotPage />} />

    </Routes>
    </Suspense>
  );
}