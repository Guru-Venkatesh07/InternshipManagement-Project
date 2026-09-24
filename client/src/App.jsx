import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleGuard } from './routes/RoleGuard';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterStudentPage } from './pages/auth/RegisterStudentPage';
import { RegisterEmployerPage } from './pages/auth/RegisterEmployerPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentProfile } from './pages/student/StudentProfile';
import { StudentInternships } from './pages/student/StudentInternships';
import { StudentApplications } from './pages/student/StudentApplications';
import { StudentPlacement } from './pages/student/StudentPlacement';
import { StudentEvaluations } from './pages/student/StudentEvaluations';

// Employer Pages
import { EmployerDashboard } from './pages/employer/EmployerDashboard';
import { EmployerProfile } from './pages/employer/EmployerProfile';
import { EmployerInternships } from './pages/employer/EmployerInternships';
import { EmployerApplications } from './pages/employer/EmployerApplications';
import { EmployerInterviews } from './pages/employer/EmployerInterviews';

// Faculty Pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyStudents } from './pages/faculty/FacultyStudents';
import { FacultyApplications } from './pages/faculty/FacultyApplications';
import { FacultyPlacements } from './pages/faculty/FacultyPlacements';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminEmployers } from './pages/admin/AdminEmployers';
import { AdminInternships } from './pages/admin/AdminInternships';
import { AdminApplications } from './pages/admin/AdminApplications';
import { AdminAuditLogs } from './pages/admin/AdminAuditLogs';
import { AdminReports } from './pages/admin/AdminReports';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/student" element={<RegisterStudentPage />} />
      <Route path="/register/employer" element={<RegisterEmployerPage />} />

      {/* Protected Student Routes */}
      <Route element={<RoleGuard allowedRoles={['STUDENT']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/internships" element={<StudentInternships />} />
          <Route path="/student/applications" element={<StudentApplications />} />
          <Route path="/student/internship" element={<StudentPlacement />} />
          <Route path="/student/evaluations" element={<StudentEvaluations />} />
        </Route>
      </Route>

      {/* Protected Employer Routes */}
      <Route element={<RoleGuard allowedRoles={['EMPLOYER', 'ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/employer/dashboard" element={<EmployerDashboard />} />
          <Route path="/employer/profile" element={<EmployerProfile />} />
          <Route path="/employer/internships" element={<EmployerInternships />} />
          <Route path="/employer/applications" element={<EmployerApplications />} />
          <Route path="/employer/interviews" element={<EmployerInterviews />} />
        </Route>
      </Route>

      {/* Protected Faculty Routes */}
      <Route element={<RoleGuard allowedRoles={['FACULTY', 'ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
          <Route path="/faculty/students" element={<FacultyStudents />} />
          <Route path="/faculty/applications" element={<FacultyApplications />} />
          <Route path="/faculty/placements" element={<FacultyPlacements />} />
        </Route>
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/employers" element={<AdminEmployers />} />
          <Route path="/admin/internships" element={<AdminInternships />} />
          <Route path="/admin/applications" element={<AdminApplications />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Route>
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
