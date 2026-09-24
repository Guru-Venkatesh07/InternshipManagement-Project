import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  Search,
  Filter,
  FileText,
  Calendar,
  CheckCircle2,
  XCircle,
  Award,
  ExternalLink,
  AlertCircle,
  Video,
} from 'lucide-react';

export const EmployerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Interview Scheduling Modal
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [targetApp, setTargetApp] = useState(null);
  const [interviewForm, setInterviewForm] = useState({
    roundName: 'Round 1: Technical & Behavioral',
    scheduledDate: '',
    scheduledTime: '11:00',
    mode: 'ONLINE',
    meetingLink: '',
    location: '',
    remarks: '',
  });

  // Action status message
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await api.get('/applications/employer/applicants', { params });
      if (res.data?.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplications();
  };

  const handleUpdateStatus = async (appId, newStatus, remarks = '') => {
    setActionLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.put(`/applications/${appId}/status`, {
        status: newStatus,
        remarks,
      });
      setStatusMsg({ type: 'success', text: `Candidate application moved to ${newStatus}.` });
      await fetchApplications();
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update status.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openInterviewModal = (app) => {
    setTargetApp(app);
    setInterviewForm({
      roundName: 'Round 1: Technical Interview',
      scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      scheduledTime: '14:00',
      mode: 'ONLINE',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      location: 'Online Video Call',
      remarks: 'Please prepare to discuss previous project architectures.',
    });
    setStatusMsg({ type: '', text: '' });
    setInterviewModalOpen(true);
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!targetApp) return;

    setActionLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.post('/interviews', {
        applicationId: targetApp.id,
        ...interviewForm,
      });
      setStatusMsg({
        type: 'success',
        text: 'Interview successfully scheduled! Candidate has been notified.',
      });
      await fetchApplications();
      setTimeout(() => setInterviewModalOpen(false), 1200);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to schedule interview.',
      });
    } finally {
      setActionLoading(false);
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
        <h1 className="text-2xl font-bold text-slate-900">Applicant Reviews & Candidate Pipeline</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review student resumes, shortlist qualified candidates, conduct interviews, and extend offers
        </p>
      </div>

      {statusMsg.text && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-xs ${
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

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidate name or email..."
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
              <option value="ALL">All Application Statuses</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="INTERVIEW_SCHEDULED">Interview Scheduled</option>
              <option value="SELECTED">Selected (Offer Out)</option>
              <option value="ACCEPTED">Accepted Placement</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </form>
      </div>

      {/* Candidates List */}
      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No applications match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting the status filter or search query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {app.student?.user?.name}
                    </h3>
                    <Badge status={app.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Applied for <span className="font-semibold text-slate-700">{app.internship?.title}</span> • {app.student?.department} (Roll: {app.student?.rollNumber || 'N/A'})
                  </p>
                </div>

                {/* Candidate Resume Link */}
                {app.resumeSnapshot && (
                  <a
                    href={`/uploads/resumes/${app.resumeSnapshot}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50 transition"
                  >
                    <FileText className="h-3.5 w-3.5" /> View Resume <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              {/* Cover Letter */}
              {app.coverLetter && (
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 text-xs">
                  <span className="font-semibold text-slate-700 block mb-0.5">Cover Letter / Note:</span>
                  <p className="text-slate-600 leading-relaxed italic">{app.coverLetter}</p>
                </div>
              )}

              {/* Interview info if scheduled */}
              {app.interview && (
                <div className="rounded-xl bg-purple-50/70 border border-purple-200 p-3 text-xs text-purple-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold flex items-center gap-1 text-purple-800">
                      <Video className="h-3.5 w-3.5" /> Interview: {app.interview.roundName}
                    </span>
                    <p className="text-[11px] text-purple-700">
                      Scheduled: {app.interview.scheduledDate} at {app.interview.scheduledTime} ({app.interview.mode})
                    </p>
                  </div>
                  <Badge status={app.interview.result} />
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                {/* Shortlist */}
                {['UNDER_REVIEW', 'APPLIED', 'FACULTY_PENDING'].includes(app.status) && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED', 'Candidate shortlisted for interview.')}
                    disabled={actionLoading}
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-sky-700 transition"
                  >
                    Shortlist
                  </button>
                )}

                {/* Schedule Interview */}
                {['UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(app.status) && (
                  <button
                    onClick={() => openInterviewModal(app)}
                    disabled={actionLoading}
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition flex items-center gap-1"
                  >
                    <Calendar className="h-3.5 w-3.5" /> Schedule Interview
                  </button>
                )}

                {/* Select / Extend Offer */}
                {['SHORTLISTED', 'INTERVIEW_SCHEDULED'].includes(app.status) && (
                  <button
                    onClick={() => handleUpdateStatus(app.id, 'SELECTED', 'Candidate selected after interview.')}
                    disabled={actionLoading}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition flex items-center gap-1"
                  >
                    <Award className="h-3.5 w-3.5" /> Select Candidate (Offer)
                  </button>
                )}

                {/* Reject */}
                {!['REJECTED', 'ACCEPTED'].includes(app.status) && (
                  <button
                    onClick={() => {
                      const remarks = prompt('Enter rejection feedback for candidate (optional):', 'Qualifications did not match current position criteria.');
                      if (remarks !== null) handleUpdateStatus(app.id, 'REJECTED', remarks);
                    }}
                    disabled={actionLoading}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                  >
                    Reject
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        title={`Schedule Interview for ${targetApp?.student?.user?.name}`}
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Interview Round Title *</label>
              <input
                type="text"
                required
                value={interviewForm.roundName}
                onChange={(e) => setInterviewForm({ ...interviewForm, roundName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={interviewForm.scheduledDate}
                onChange={(e) => setInterviewForm({ ...interviewForm, scheduledDate: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Time (24h) *</label>
              <input
                type="time"
                required
                value={interviewForm.scheduledTime}
                onChange={(e) => setInterviewForm({ ...interviewForm, scheduledTime: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Interview Mode</label>
              <select
                value={interviewForm.mode}
                onChange={(e) => setInterviewForm({ ...interviewForm, mode: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              >
                <option value="ONLINE">Online Video Call</option>
                <option value="IN_PERSON">In-Person Campus Interview</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Meeting Link (Google Meet / Teams)</label>
              <input
                type="url"
                value={interviewForm.meetingLink}
                onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Preparation Instructions & Remarks</label>
              <textarea
                rows="2"
                value={interviewForm.remarks}
                onChange={(e) => setInterviewForm({ ...interviewForm, remarks: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setInterviewModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-primary-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition disabled:opacity-50"
            >
              {actionLoading ? 'Scheduling...' : 'Confirm Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
