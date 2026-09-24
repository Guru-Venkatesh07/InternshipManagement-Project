import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Briefcase,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  GraduationCap,
  BookOpen,
  Award,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/admin/metrics');
        if (res.data?.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Administration Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time platform metrics, role distribution, and compliance monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
          >
            <FileSpreadsheet className="h-4 w-4" /> Export System Reports
          </Link>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Accounts</span>
            <Users className="h-4 w-4 text-primary-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{metrics?.totalUsers || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active platform users</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Internships</span>
            <Briefcase className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{metrics?.totalInternships || 0}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">
            {metrics?.activeInternships || 0} currently active
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Total Applications</span>
            <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{metrics?.totalApplications || 0}</p>
          <span className="text-[11px] text-indigo-600 font-medium mt-1 block">
            {metrics?.selectedApplications || 0} offers extended
          </span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Placements Active</span>
            <Award className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{metrics?.ongoingPlacements || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {metrics?.completedPlacements || 0} completed
          </span>
        </div>
      </div>

      {/* User Role Distribution Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-800 mb-4">User Population by Role</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mb-1">
                <GraduationCap className="h-4 w-4" /> Enrolled Students
              </span>
              <p className="text-2xl font-bold text-slate-900">{metrics?.totalStudents || 0}</p>
            </div>
            <Link to="/admin/users" className="text-xs font-semibold text-blue-600 hover:underline">
              Manage →
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-1">
                <Building2 className="h-4 w-4" /> Corporate Employers
              </span>
              <p className="text-2xl font-bold text-slate-900">{metrics?.totalEmployers || 0}</p>
            </div>
            <Link to="/admin/employers" className="text-xs font-semibold text-emerald-600 hover:underline">
              Verify →
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5 mb-1">
                <BookOpen className="h-4 w-4" /> Faculty Advisors
              </span>
              <p className="text-2xl font-bold text-slate-900">{metrics?.totalFaculty || 0}</p>
            </div>
            <Link to="/admin/users" className="text-xs font-semibold text-amber-600 hover:underline">
              View →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Administrative Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-primary-400 hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-800">User Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">Activate, deactivate, or add faculty</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/admin/audit-logs"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-primary-400 hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-800">Security Audit Logs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Inspect immutable system records</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          to="/admin/reports"
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-primary-400 hover:shadow-md transition flex items-center justify-between group"
        >
          <div>
            <h3 className="text-sm font-bold text-slate-800">Accreditation Reports</h3>
            <p className="text-xs text-slate-500 mt-0.5">Generate CSV data exports</p>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
};
