import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  ClipboardCheck,
  Users,
  CheckCircle2,
  XCircle,
  BookOpen,
  Award,
  ArrowRight,
  Building2,
  FileText,
} from 'lucide-react';

export const FacultyDashboard = () => {
  const [stats, setStats] = useState(null);
  const [pendingApps, setPendingApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, appsRes] = await Promise.all([
          api.get('/faculty/dashboard'),
          api.get('/faculty/pending-applications'),
        ]);

        if (dashRes.data?.success) setStats(dashRes.data.data);
        if (appsRes.data?.success) setPendingApps(appsRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
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
          <h1 className="text-2xl font-bold text-slate-900">Faculty Advisor Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervise departmental students, grant academic clearance, monitor logs, and submit grades
          </p>
        </div>
        <Link
          to="/faculty/applications"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
        >
          <ClipboardCheck className="h-4 w-4" /> Review Pending Applications
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Pending NOC</span>
            <ClipboardCheck className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats?.pendingApprovals || 0}</p>
          <span className="text-[10px] text-slate-400">Needs clearance</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.approvedApplications || 0}</p>
          <span className="text-[10px] text-slate-400">Credits verified</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Ongoing</span>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.ongoingInternships || 0}</p>
          <span className="text-[10px] text-slate-400">Active placements</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.completedInternships || 0}</p>
          <span className="text-[10px] text-slate-400">Finished & graded</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Students</span>
            <Users className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.supervisedStudents || 0}</p>
          <span className="text-[10px] text-slate-400">Under supervision</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Due Grades</span>
            <FileText className="h-4 w-4 text-rose-600" />
          </div>
          <p className="text-2xl font-bold text-rose-600">{stats?.pendingEvaluations || 0}</p>
          <span className="text-[10px] text-slate-400">Pending grade</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Declined</span>
            <XCircle className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.rejectedApplications || 0}</p>
          <span className="text-[10px] text-slate-400">Ineligible</span>
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Applications Awaiting Academic Clearance</h2>
          <Link
            to="/faculty/applications"
            className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            Review all pending ({stats?.pendingApprovals || 0}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {pendingApps.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <CheckCircle2 className="h-8 w-8 mx-auto text-emerald-400 mb-2" />
            No applications currently awaiting your academic review. All caught up!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Internship & Company</th>
                  <th className="pb-3">Applied Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-semibold text-slate-800">
                      {app.student?.user?.name}
                    </td>
                    <td className="py-3 text-slate-600">
                      {app.internship?.title} ({app.internship?.employer?.companyName})
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/faculty/applications"
                        className="rounded-lg bg-amber-50 text-amber-700 px-3 py-1 font-semibold hover:bg-amber-100 transition inline-block"
                      >
                        Review & Clear →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
