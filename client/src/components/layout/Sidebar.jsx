import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  UserCheck,
  Briefcase,
  FileText,
  Activity,
  Award,
  Building2,
  Users,
  Calendar,
  ClipboardCheck,
  BookOpen,
  FileSpreadsheet,
  ShieldAlert,
  BarChart3,
  X,
  GraduationCap,
} from 'lucide-react';

const roleMenus = {
  STUDENT: [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Profile & Resume', path: '/student/profile', icon: UserCheck },
    { label: 'Browse Internships', path: '/student/internships', icon: Briefcase },
    { label: 'My Applications', path: '/student/applications', icon: FileText },
    { label: 'Active Placement', path: '/student/internship', icon: Activity },
    { label: 'Grades & Feedback', path: '/student/evaluations', icon: Award },
  ],
  EMPLOYER: [
    { label: 'Dashboard', path: '/employer/dashboard', icon: LayoutDashboard },
    { label: 'Company Profile', path: '/employer/profile', icon: Building2 },
    { label: 'Manage Postings', path: '/employer/internships', icon: Briefcase },
    { label: 'Applicants Review', path: '/employer/applications', icon: Users },
    { label: 'Interviews', path: '/employer/interviews', icon: Calendar },
  ],
  FACULTY: [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: LayoutDashboard },
    { label: 'Assigned Students', path: '/faculty/students', icon: Users },
    { label: 'Pending Approvals', path: '/faculty/applications', icon: ClipboardCheck },
    { label: 'Supervised Placements', path: '/faculty/placements', icon: BookOpen },
  ],
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'User Management', path: '/admin/users', icon: Users },
    { label: 'Company Verification', path: '/admin/employers', icon: Building2 },
    { label: 'All Internships', path: '/admin/internships', icon: Briefcase },
    { label: 'All Applications', path: '/admin/applications', icon: FileSpreadsheet },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'Reports & Export', path: '/admin/reports', icon: BarChart3 },
  ],
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const menuItems = (user && roleMenus[user.role]) || [];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-lg">
            <GraduationCap className="h-6 w-6" />
            <span className="tracking-tight text-slate-900">Internship<span className="text-primary-600">MS</span></span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Role identifier badge */}
        <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold tracking-wider uppercase text-slate-500">
          {user?.role} Portal
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="border-t border-slate-100 p-4 text-xs text-slate-400 text-center">
          Internship Management System v1.0
        </div>
      </aside>
    </>
  );
};
