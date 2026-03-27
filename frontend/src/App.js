import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Screening from './pages/Screening';
import Chat from './pages/Chat';
import Appointments from './pages/Appointments';
import Resources from './pages/Resources';
import AssessmentResult from './pages/AssessmentResult';
import CounselorDashboard from './pages/CounselorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminCounselors from './pages/AdminCounselors';
import AdminAnalytics from './pages/AdminAnalytics';
import SessionNotes from './pages/SessionNotes';
import CounselorAppointments from './pages/CounselorAppointments';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import CounselorLayout from './layouts/CounselorLayout';
import AdminLayout from './layouts/AdminLayout';

function App() {
  const user = JSON.parse(localStorage.getItem('baymax_user') || 'null');
  const role = user?.role?.toUpperCase() || 'STUDENT';

  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to={user ? `/${role.toLowerCase()}/dashboard` : '/login'} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* STUDENT PORTAL */}
          <Route path="/student" element={<StudentLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="chat" element={<Chat />} />
            <Route path="screening" element={<Screening />} />
            <Route path="screening/result" element={<AssessmentResult />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="resources" element={<Resources />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Route>

          {/* COUNSELOR PORTAL */}
          <Route path="/counselor" element={<CounselorLayout />}>
            <Route path="dashboard" element={<CounselorDashboard />} />
            <Route path="appointments" element={<CounselorAppointments />} />
            <Route path="notes" element={<SessionNotes />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Route>

          {/* ADMIN PORTAL */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="counselors" element={<AdminCounselors />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route index element={<Navigate to="dashboard" />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
