import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ShieldAlert, Search, Filter, Clock, User, Globe } from 'lucide-react';

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const fetchAuditLogs = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (actionFilter !== 'ALL') params.action = actionFilter;

      const res = await api.get('/admin/audit-logs', { params });
      if (res.data?.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAuditLogs();
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
        <h1 className="text-2xl font-bold text-slate-900">Security & Action Audit Logs</h1>
        <p className="text-xs text-slate-500 mt-1">
          Immutable historical audit trail of administrative operations, state transitions, and logins
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search action, actor email, or resource..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            >
              <option value="ALL">All Logged Actions</option>
              <option value="LOGIN">Authentication / Login</option>
              <option value="REGISTER">User Registration</option>
              <option value="INTERNSHIP">Internship Operations</option>
              <option value="APPLICATION">Application Lifecycle</option>
              <option value="FACULTY">Faculty Clearance</option>
              <option value="EVALUATION">Evaluation & Grading</option>
            </select>
          </div>
        </form>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Target Resource</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-xs">
                    <span className="font-semibold text-slate-800">{log.actor?.name || 'System / Guest'}</span>
                    <span className="block text-[11px] text-slate-400">{log.actor?.email}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {log.resourceType} {log.resourceId ? `(${log.resourceId.slice(0, 8)}...)` : ''}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                    {log.metadata || '—'}
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
