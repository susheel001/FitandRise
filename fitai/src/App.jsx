import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppProvider     from './context/AppProvider';
import ProtectedRoute  from './components/ProtectedRoute';
import PublicRoute     from './components/PublicRoute';     {/* ← new */}
import DashboardLayout from './layout/DashboardLayout';
import Landing         from './pages/Landing';
import Dashboard       from './pages/Dashboard';
import Workouts        from './pages/Workouts';
import Nutrition       from './pages/Nutrition';
import Progress        from './pages/Progress';
import BMITools        from './pages/BMITools';
import Profile         from './pages/Profile';
import Settings        from './pages/Settings';
import Login           from './pages/Login';
import Signup          from './pages/Signup';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';
import NotFound        from './pages/NotFound';

const Wrap = ({ page }) => (
  <ProtectedRoute>
    <DashboardLayout>{page}</DashboardLayout>
  </ProtectedRoute>
);

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public routes — redirect to /dashboard if already logged in */}
          <Route path="/"                element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/landing"         element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/login"           element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup"          element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
          <Route path="/reset-password"  element={<ResetPassword />} /> {/* No PublicRoute — needs session from email link */}

          {/* Protected routes */}
          <Route path="/dashboard" element={<Wrap page={<Dashboard />} />} />
          <Route path="/workouts"  element={<Wrap page={<Workouts />} />} />
          <Route path="/nutrition" element={<Wrap page={<Nutrition />} />} />
          <Route path="/progress"  element={<Wrap page={<Progress />} />} />
          <Route path="/tools"     element={<Wrap page={<BMITools />} />} />
          <Route path="/profile"   element={<Wrap page={<Profile />} />} />
          <Route path="/settings"  element={<Wrap page={<Settings />} />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}