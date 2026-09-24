import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  Briefcase,
  Search,
  Building2,
  DollarSign,
  Users,
  Archive,
  Clock,
} from 'lucide-react';

export const AdminInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchInternships = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/admin/internships', { params });
      if (res.data?.success) {
        setInternships(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInternships();
  };

  const handleClose = async (id) => {
    if (!window.confirm('Close this internship posting across the platform?')) return;
    try {
      await api.put(`/internships/${id}`, { status: 'CLOSED' });
      await fetchInternships();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to close posting.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform-Wide Internship Postings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor all active and archived corporate postings across all company partners
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search internship title or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            >
              <option value="ALL">All Postings</option>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Internship Title</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Department Required</th>
                <th className="py-3.5 px-4">Stipend</th>
                <th className="py-3.5 px-4">Applicants</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {internships.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{job.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{job.employer?.companyName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{job.departmentRequired}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">${job.stipend}/mo</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{job._count?.applications || 0}</td>
                  <td className="py-3.5 px-4">
                    <Badge status={job.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {job.status === 'PUBLISHED' && (
                      <button
                        onClick={() => handleClose(job.id)}
                        className="rounded-md border border-rose-200 text-rose-600 hover:bg-rose-50 px-2 py-1 text-[11px] font-semibold transition"
                      >
                        Close Posting
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
