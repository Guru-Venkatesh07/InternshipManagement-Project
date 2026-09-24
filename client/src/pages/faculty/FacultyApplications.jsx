import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  ClipboardCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  ExternalLink,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const FacultyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [decision, setDecision] = useState('APPROVE');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchPending = async () => {
    try {
      const res = await api.get('/faculty/pending-applications');
      if (res.data?.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load pending applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const openReviewModal = (app, initialDecision) => {
    setSelectedApp(app);
    setDecision(initialDecision);
    setRemarks(
      initialDecision === 'APPROVE'
        ? 'Prerequisites satisfied and academic clearance granted for internship credits.'
        : 'Ineligible due to pending coursework / attendance criteria.'
    );
    setStatusMsg({ type: '', text: '' });
    setModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await api.put(`/applications/${selectedApp.id}/faculty-review`, {
        decision,
        remarks,
      });

      if (res.data?.success) {
        setStatusMsg({
          type: 'success',
          text: `Application has been ${decision === 'APPROVE' ? 'APPROVED' : 'REJECTED'}. The student and employer have been notified.`,
        });
        await fetchPending();
        setTimeout(() => setModalOpen(false), 1400);
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit academic review.',
      });
    } finally {
      setSubmitting(false);
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
        <h1 className="text-2xl font-bold text-slate-900">Academic Review & NOC Verification Queue</h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify student eligibility and grant departmental clearance before employer evaluation
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

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-400 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No applications pending review</h3>
          <p className="text-xs text-slate-400 mt-1">All student applications have been processed.</p>
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
                    <h3 className="text-base font-bold text-slate-900">{app.student?.user?.name}</h3>
                    <Badge status={app.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {app.student?.department} • Roll No: {app.student?.rollNumber} • CGPA: {app.student?.cgpa}
                  </p>
                </div>

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

              {/* Internship Opportunity Info */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">
                    {app.internship?.title}
                  </span>
                  <span className="text-slate-500">
                    Stipend: ${app.internship?.stipend}/mo
                  </span>
                </div>
                <p className="text-slate-600 flex items-center gap-1.5 mt-1">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {app.internship?.employer?.companyName} • {app.internship?.location}
                </p>
                {app.coverLetter && (
                  <p className="mt-2 text-slate-500 italic pt-2 border-t border-slate-200/60">
                    "{app.coverLetter}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openReviewModal(app, 'REJECT')}
                  className="rounded-lg border border-rose-200 px-4 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1.5"
                >
                  <XCircle className="h-3.5 w-3.5" /> Decline Clearance
                </button>
                <button
                  onClick={() => openReviewModal(app, 'APPROVE')}
                  className="rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Approve Academic Clearance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Academic Decision: ${decision === 'APPROVE' ? 'Clear Application' : 'Decline Application'}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <p className="font-bold text-slate-800">{selectedApp?.student?.user?.name}</p>
            <p className="text-slate-500">
              Applying for: {selectedApp?.internship?.title} ({selectedApp?.internship?.employer?.companyName})
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Official Faculty Remarks & Academic Credit Sign-Off *
            </label>
            <textarea
              rows="3"
              required
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
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
              disabled={submitting}
              className={`rounded-lg px-5 py-2 text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 ${
                decision === 'APPROVE'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {submitting ? 'Submitting...' : `Confirm ${decision === 'APPROVE' ? 'Approval' : 'Rejection'}`}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
