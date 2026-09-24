import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  FileText,
  Clock,
  CheckCircle2,
  Calendar,
  Award,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Building2,
} from 'lucide-react';

export const StudentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, appsRes] = await Promise.all([
          api.get('/student/dashboard'),
          api.get('/applications/my-applications'),
        ]);

        if (dashRes.data?.success) setStats(dashRes.data.data);
        if (appsRes.data?.success) setRecentApps(appsRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
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

  const activePlacement = stats?.activeInternship;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your internship applications, interview calls, and placement lifecycle
        </p>
      </div>

      {/* Active Placement Banner if student has an ongoing internship */}
      {activePlacement ? (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700 mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" /> Active Internship In-Progress
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {activePlacement.application?.internship?.title}
              </h3>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Building2 className="h-3.5 w-3.5 text-slate-400" />
                {activePlacement.application?.internship?.employer?.companyName} • Supervisor: {activePlacement.industrySupervisorName}
              </p>
            </div>
            <Link
              to="/student/internship"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              Submit Progress Log <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      ) : null}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Applications</span>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.totalApplications || 0}</p>
          <span className="text-[10px] text-slate-400">Total submitted</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Under Review</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.underReview || 0}</p>
          <span className="text-[10px] text-slate-400">Faculty/Employer</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Shortlisted</span>
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.shortlisted || 0}</p>
          <span className="text-[10px] text-slate-400">Advanced to review</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Interviews</span>
            <Calendar className="h-4 w-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.interviews || 0}</p>
          <span className="text-[10px] text-slate-400">Scheduled rounds</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Offers</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.selected || 0}</p>
          <span className="text-[10px] text-slate-400">Selected / Accepted</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Completed</span>
            <Briefcase className="h-4 w-4 text-slate-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.completedInternshipCount || 0}</p>
          <span className="text-[10px] text-slate-400">Graded internships</span>
        </div>
      </div>

      {/* Recent Applications Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Recent Applications</h2>
          <Link
            to="/student/applications"
            className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            View all ({stats?.totalApplications || 0}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentApps.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-slate-300" />
            You have not applied for any internships yet.{' '}
            <Link to="/student/internships" className="text-primary-600 font-semibold hover:underline">
              Browse available openings
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Internship & Company</th>
                  <th className="pb-3">Applied On</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Interview / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3">
                      <p className="font-semibold text-slate-800">{app.internship?.title}</p>
                      <p className="text-[11px] text-slate-500">{app.internship?.employer?.companyName}</p>
                    </td>
                    <td className="py-3 text-slate-500">
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3">
                      {app.interview ? (
                        <span className="text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                          {app.interview.scheduledDate} ({app.interview.mode})
                        </span>
                      ) : app.status === 'SELECTED' ? (
                        <Link
                          to="/student/applications"
                          className="text-[11px] font-bold text-emerald-700 hover:underline"
                        >
                          Accept Offer →
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-400">—</span>
                      )}
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
