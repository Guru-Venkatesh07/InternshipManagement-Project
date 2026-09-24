import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Search,
  UserPlus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  GraduationCap,
} from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Create Faculty Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    email: '',
    password: '',
    facultyId: '',
    department: 'Computer Science and Engineering',
    designation: 'Associate Professor',
    phone: '',
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchUsers = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter !== 'ALL') params.role = roleFilter;

      const res = await api.get('/admin/users', { params });
      if (res.data?.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/status`);
      if (res.data?.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, isActive: res.data.data.isActive } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle user status.');
    }
  };

  const handleCreateFaculty = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await api.post('/admin/users/faculty', facultyForm);
      if (res.data?.success) {
        setStatusMsg({ type: 'success', text: 'Faculty advisor account registered successfully!' });
        await fetchUsers();
        setTimeout(() => {
          setModalOpen(false);
          setFacultyForm({
            name: '',
            email: '',
            password: '',
            facultyId: '',
            department: 'Computer Science and Engineering',
            designation: 'Associate Professor',
            phone: '',
          });
        }, 1200);
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to create faculty account.',
      });
    } finally {
      setSaving(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Account Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Search system users, manage active states, and onboard institutional faculty advisors
          </p>
        </div>

        <button
          onClick={() => {
            setStatusMsg({ type: '', text: '' });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
        >
          <UserPlus className="h-4 w-4" /> Add Faculty Account
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="EMPLOYER">Employers</option>
              <option value="FACULTY">Faculty Advisors</option>
              <option value="ADMIN">Administrators</option>
            </select>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Associated Entity / Dept</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge status={u.role} />
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {u.studentProfile
                      ? `${u.studentProfile.department} (${u.studentProfile.rollNumber})`
                      : u.employerProfile
                      ? `${u.employerProfile.companyName} (${u.employerProfile.industry})`
                      : u.facultyProfile
                      ? `${u.facultyProfile.department} (${u.facultyProfile.designation})`
                      : 'System Governance'}
                  </td>
                  <td className="py-3.5 px-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        <XCircle className="h-3 w-3" /> Deactivated
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition ${
                        u.isActive
                          ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Faculty Account Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Faculty Advisor Account"
      >
        {statusMsg.text && (
          <div
            className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-xs ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleCreateFaculty} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faculty Name *</label>
              <input
                type="text"
                required
                value={facultyForm.name}
                onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                placeholder="Prof. Jane Doe"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={facultyForm.email}
                onChange={(e) => setFacultyForm({ ...facultyForm, email: e.target.value })}
                placeholder="jane.doe@college.com"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Temporary Password *</label>
              <input
                type="password"
                required
                value={facultyForm.password}
                onChange={(e) => setFacultyForm({ ...facultyForm, password: e.target.value })}
                placeholder="Min 6 characters"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Faculty ID Number *</label>
              <input
                type="text"
                required
                value={facultyForm.facultyId}
                onChange={(e) => setFacultyForm({ ...facultyForm, facultyId: e.target.value })}
                placeholder="FAC-CSE-099"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Department *</label>
              <select
                value={facultyForm.department}
                onChange={(e) => setFacultyForm({ ...facultyForm, department: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              >
                <option value="Computer Science and Engineering">Computer Science & Eng</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication">Electronics & Comm</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Designation</label>
              <input
                type="text"
                value={facultyForm.designation}
                onChange={(e) => setFacultyForm({ ...facultyForm, designation: e.target.value })}
                placeholder="Associate Professor"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Register Faculty Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
