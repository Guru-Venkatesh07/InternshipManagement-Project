import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Calendar,
  Video,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit2,
  AlertCircle,
} from 'lucide-react';

export const EmployerInterviews = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Record Result Modal
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [targetInterview, setTargetInterview] = useState(null);
  const [resultForm, setResultForm] = useState({
    result: 'PASSED',
    remarks: '',
  });

  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchInterviews = async () => {
    try {
      const res = await api.get('/applications/employer/applicants');
      if (res.data?.success) {
        // Filter those that have an interview scheduled
        const withInterviews = res.data.data.filter((a) => !!a.interview);
        setApplications(withInterviews);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
  }, []);

  const openResultModal = (interview, app) => {
    setTargetInterview({ ...interview, candidateName: app.student?.user?.name, role: app.internship?.title });
    setResultForm({
      result: interview.result || 'PASSED',
      remarks: interview.remarks || '',
    });
    setStatusMsg({ type: '', text: '' });
    setResultModalOpen(true);
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    if (!targetInterview) return;

    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.put(`/interviews/${targetInterview.id}/result`, resultForm);
      setStatusMsg({ type: 'success', text: 'Interview result recorded successfully.' });
      await fetchInterviews();
      setTimeout(() => setResultModalOpen(false), 1200);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update result.',
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Scheduled Interviews & Assessments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track interview timelines, meeting links, and record evaluation outcomes
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Calendar className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No scheduled interviews</h3>
          <p className="text-xs text-slate-400 mt-1">
            Shortlist candidates and schedule interviews from the Applicants Review tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => {
            const iv = app.interview;
            return (
              <div
                key={iv.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{iv.roundName}</h3>
                      <p className="text-xs text-slate-500">
                        Candidate: <span className="font-semibold text-slate-800">{app.student?.user?.name}</span> ({app.internship?.title})
                      </p>
                    </div>
                    <Badge status={iv.result} />
                  </div>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary-600" />
                      <span>{iv.scheduledDate} at {iv.scheduledTime} ({iv.mode})</span>
                    </div>

                    {iv.meetingLink && (
                      <div className="flex items-center gap-2">
                        <Video className="h-3.5 w-3.5 text-purple-600" />
                        <a
                          href={iv.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary-600 hover:underline flex items-center gap-1 font-medium truncate"
                        >
                          {iv.meetingLink} <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}

                    {iv.remarks && (
                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/70 mt-2">
                        <span className="font-semibold text-slate-700 block mb-0.5">Notes:</span>
                        <p className="text-slate-600 italic">{iv.remarks}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end mt-4">
                  <button
                    onClick={() => openResultModal(iv, app)}
                    className="rounded-lg bg-slate-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-900 transition flex items-center gap-1.5"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Record Outcome / Result
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Record Result Modal */}
      <Modal
        isOpen={resultModalOpen}
        onClose={() => setResultModalOpen(false)}
        title={`Record Interview Result for ${targetInterview?.candidateName}`}
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

        <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Interview Outcome *</label>
            <select
              value={resultForm.result}
              onChange={(e) => setResultForm({ ...resultForm, result: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            >
              <option value="PASSED">Passed (Proceed to Next Round / Selection)</option>
              <option value="FAILED">Failed</option>
              <option value="RESCHEDULED">Rescheduled</option>
              <option value="SCHEDULED">Scheduled / In-Progress</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Feedback & Interview Notes</label>
            <textarea
              rows="3"
              value={resultForm.remarks}
              onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
              placeholder="Candidate demonstrated strong knowledge of relational modeling..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setResultModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Result'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
