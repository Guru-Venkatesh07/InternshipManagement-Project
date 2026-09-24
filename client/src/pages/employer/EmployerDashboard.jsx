import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Award,
  Plus,
  ArrowRight,
  Building2,
  AlertCircle,
} from 'lucide-react';

export const EmployerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, appsRes] = await Promise.all([
          api.get('/employer/dashboard'),
          api.get('/applications/employer/applicants'),
        ]);

        if (dashRes.data?.success) setStats(dashRes.data.data);
        if (appsRes.data?.success) setRecentApplicants(appsRes.data.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load employer dashboard:', err);
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
          <h1 className="text-2xl font-bold text-slate-900">Employer Recruitment Portal</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your corporate postings, candidate evaluations, interviews, and job offers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/employer/internships"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" /> Post New Internship
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Total Postings</span>
            <Briefcase className="h-4 w-4 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.totalInternships || 0}</p>
          <span className="text-[10px] text-slate-400">All created</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Active Jobs</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.activeInternships || 0}</p>
          <span className="text-[10px] text-slate-400">Published & open</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Applicants</span>
            <Users className="h-4 w-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.totalApplications || 0}</p>
          <span className="text-[10px] text-slate-400">Total received</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Shortlisted</span>
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.shortlisted || 0}</p>
          <span className="text-[10px] text-slate-400">Advanced candidates</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Selected</span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.selectedCandidates || 0}</p>
          <span className="text-[10px] text-slate-400">Offers extended</span>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">Closed Jobs</span>
            <AlertCircle className="h-4 w-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.closedInternships || 0}</p>
          <span className="text-[10px] text-slate-400">Archived postings</span>
        </div>
      </div>

      {/* Recent Applicants Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Recent Candidate Applications</h2>
          <Link
            to="/employer/applications"
            className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            Review all applicants ({stats?.totalApplications || 0}) <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentApplicants.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            No applications received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Applied Role</th>
                  <th className="pb-3">Department</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplicants.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-semibold text-slate-800">
                      {app.student?.user?.name}
                    </td>
                    <td className="py-3 text-slate-600">{app.internship?.title}</td>
                    <td className="py-3 text-slate-500">{app.student?.department}</td>
                    <td className="py-3">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to="/employer/applications"
                        className="text-xs font-semibold text-primary-600 hover:text-primary-800"
                      >
                        Manage Review →
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
