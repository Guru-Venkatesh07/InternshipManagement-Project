import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Briefcase,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
} from 'lucide-react';

export const EmployerInternships = () => {
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    departmentRequired: 'Computer Science and Engineering',
    skillsRequired: '',
    eligibility: '',
    location: '',
    isRemote: false,
    stipend: '2000',
    openings: '2',
    applicationDeadline: '',
    status: 'PUBLISHED',
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchPostings = async () => {
    try {
      const res = await api.get('/internships/employer/my-postings');
      if (res.data?.success) {
        setPostings(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load employer postings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      departmentRequired: 'Computer Science and Engineering',
      skillsRequired: '',
      eligibility: 'Undergraduate or Postgraduate student, min 7.0 CGPA',
      location: 'Hybrid / On-site',
      isRemote: false,
      stipend: '2500',
      openings: '2',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'PUBLISHED',
    });
    setStatusMsg({ type: '', text: '' });
    setModalOpen(true);
  };

  const openEditModal = (posting) => {
    setEditingId(posting.id);
    setFormData({
      title: posting.title,
      description: posting.description,
      departmentRequired: posting.departmentRequired,
      skillsRequired: posting.skillsRequired,
      eligibility: posting.eligibility,
      location: posting.location,
      isRemote: posting.isRemote,
      stipend: String(posting.stipend),
      openings: String(posting.openings),
      applicationDeadline: new Date(posting.applicationDeadline).toISOString().split('T')[0],
      status: posting.status,
    });
    setStatusMsg({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      if (editingId) {
        await api.put(`/internships/${editingId}`, formData);
        setStatusMsg({ type: 'success', text: 'Posting updated successfully.' });
      } else {
        await api.post('/internships', formData);
        setStatusMsg({ type: 'success', text: 'Internship posting published successfully!' });
      }
      await fetchPostings();
      setTimeout(() => setModalOpen(false), 1200);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save internship posting.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClosePosting = async (id) => {
    if (!window.confirm('Close this internship posting to new applicants?')) return;
    try {
      await api.put(`/internships/${id}`, { status: 'CLOSED' });
      await fetchPostings();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Internship Postings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, publish, and close corporate opportunities
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" /> Create Posting
        </button>
      </div>

      {postings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Briefcase className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No postings created yet</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">Post your first internship to begin receiving campus applicants.</p>
          <button
            onClick={openCreateModal}
            className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
          >
            Create Internship Posting
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {postings.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                  <Badge status={p.status} />
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {p.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span>{p.location} {p.isRemote ? '(Remote)' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                    <span>${p.stipend}/month</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{p._count?.applications || 0} Applicants</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Deadline: {new Date(p.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 mt-4">
                <button
                  onClick={() => openEditModal(p)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit
                </button>
                {p.status === 'PUBLISHED' && (
                  <button
                    onClick={() => handleClosePosting(p.id)}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1"
                  >
                    <Archive className="h-3.5 w-3.5" /> Close
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Internship Posting' : 'Create New Internship Posting'}
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

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Full Stack Cloud Engineer Intern"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Required Department *</label>
              <select
                value={formData.departmentRequired}
                onChange={(e) => setFormData({ ...formData, departmentRequired: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              >
                <option value="Computer Science and Engineering">Computer Science & Eng</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics and Communication">Electronics & Communication</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Monthly Stipend ($) *</label>
              <input
                type="number"
                min="0"
                required
                value={formData.stipend}
                onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Openings Count *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Application Deadline *</label>
              <input
                type="date"
                required
                value={formData.applicationDeadline}
                onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. San Francisco, CA / Hybrid"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                  className="rounded-sm border-slate-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                Is Remote Eligible
              </label>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Required Skills *</label>
              <input
                type="text"
                required
                value={formData.skillsRequired}
                onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
                placeholder="e.g. React, Node.js, Express, PostgreSQL, Git"
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Detailed Description *</label>
              <textarea
                rows="3"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Key responsibilities and project scope..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Publication Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              >
                <option value="PUBLISHED">Published (Accepting Applications)</option>
                <option value="DRAFT">Draft (Internal Only)</option>
                <option value="CLOSED">Closed</option>
              </select>
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
              {saving ? 'Saving...' : editingId ? 'Update Posting' : 'Publish Posting'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
