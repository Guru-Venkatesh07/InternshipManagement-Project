import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Activity,
  Building2,
  Calendar,
  User,
  Mail,
  Phone,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Send,
} from 'lucide-react';

export const StudentPlacement = () => {
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);

  // Weekly Log Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    weekNumber: 1,
    tasksCompleted: '',
    skillsGained: '',
    challenges: '',
    studentRemarks: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchPlacement = async () => {
    try {
      const res = await api.get('/placements/my-placement');
      if (res.data?.success) {
        setPlacement(res.data.data);
        const nextWeek = (res.data.data?.progressLogs?.length || 0) + 1;
        setLogForm((prev) => ({ ...prev, weekNumber: nextWeek }));
      }
    } catch (err) {
      console.error('Failed to load placement record:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacement();
  }, []);

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!placement) return;

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await api.post('/placements/progress-logs', {
        internshipRecordId: placement.id,
        ...logForm,
      });

      if (res.data?.success) {
        setStatusMsg({
          type: 'success',
          text: `Week ${logForm.weekNumber} progress log submitted! Your faculty advisor has been notified.`,
        });
        setLogForm({
          weekNumber: logForm.weekNumber + 1,
          tasksCompleted: '',
          skillsGained: '',
          challenges: '',
          studentRemarks: '',
        });
        await fetchPlacement();
        setTimeout(() => setModalOpen(false), 1500);
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit progress log.',
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

  if (!placement) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
        <Activity className="h-10 w-10 mx-auto text-slate-300 mb-2" />
        <h3 className="text-sm font-semibold text-slate-700">No active placement in-progress</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Active placement tracking unlocks once an employer extends an offer and you accept it through the applications tab.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Active Internship & Progress Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Log weekly achievements, technical challenges, and receive ongoing faculty mentorship
          </p>
        </div>
        <button
          onClick={() => {
            setStatusMsg({ type: '', text: '' });
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" /> Submit Weekly Log
        </button>
      </div>

      {/* Placement Metadata Banner */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {placement.application?.internship?.title}
            </h2>
            <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              {placement.application?.internship?.employer?.companyName}
            </p>
          </div>
          <Badge status={placement.status} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-600" />
            <div>
              <p className="text-[11px] text-slate-400">Duration</p>
              <p className="font-semibold text-slate-800">
                {new Date(placement.startDate).toLocaleDateString()} —{' '}
                {new Date(placement.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary-600" />
            <div>
              <p className="text-[11px] text-slate-400">Industry Supervisor</p>
              <p className="font-semibold text-slate-800">{placement.industrySupervisorName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary-600" />
            <div>
              <p className="text-[11px] text-slate-400">Supervisor Contact</p>
              <p className="font-semibold text-slate-800 truncate">{placement.industrySupervisorEmail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Logs Timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Weekly Progress Reports</h2>
          <span className="text-xs font-semibold text-slate-400">
            {placement.progressLogs?.length || 0} Reports Filed
          </span>
        </div>

        {placement.progressLogs?.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">
            No weekly logs submitted yet. Click "Submit Weekly Log" above to record your first report.
          </p>
        ) : (
          <div className="space-y-4">
            {placement.progressLogs?.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-slate-50 transition text-xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-sm">
                    Week {log.weekNumber} Report
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Submitted {new Date(log.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">Tasks Completed:</span>
                    <p className="text-slate-600 leading-relaxed">{log.tasksCompleted}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">Skills Learned:</span>
                    <p className="text-slate-600 leading-relaxed">{log.skillsGained}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 block mb-0.5">Challenges:</span>
                    <p className="text-slate-600 leading-relaxed">{log.challenges || 'None'}</p>
                  </div>
                </div>

                {/* Faculty Feedback Section */}
                <div className="rounded-lg bg-amber-50/80 border border-amber-200 p-3 mt-2">
                  <span className="font-semibold text-amber-900 block mb-0.5 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-amber-700" /> Faculty Advisor Feedback:
                  </span>
                  {log.facultyFeedback ? (
                    <p className="text-amber-800 italic mt-0.5">{log.facultyFeedback}</p>
                  ) : (
                    <p className="text-amber-600/70 text-[11px] italic">Pending faculty review and sign-off.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Submission Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Submit Week ${logForm.weekNumber} Progress Report`}
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

        <form onSubmit={handleLogSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Week Number *</label>
            <input
              type="number"
              min="1"
              max="52"
              required
              value={logForm.weekNumber}
              onChange={(e) => setLogForm({ ...logForm, weekNumber: parseInt(e.target.value) })}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tasks Completed This Week *</label>
            <textarea
              rows="3"
              required
              value={logForm.tasksCompleted}
              onChange={(e) => setLogForm({ ...logForm, tasksCompleted: e.target.value })}
              placeholder="Detail projects worked on, tickets closed, features implemented..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Technical Skills & Tools Acquired *</label>
            <textarea
              rows="2"
              required
              value={logForm.skillsGained}
              onChange={(e) => setLogForm({ ...logForm, skillsGained: e.target.value })}
              placeholder="Frameworks, libraries, methodologies, or architectural patterns learned..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Challenges & How They Were Overcome</label>
            <textarea
              rows="2"
              value={logForm.challenges}
              onChange={(e) => setLogForm({ ...logForm, challenges: e.target.value })}
              placeholder="Debugging issues, technical roadblocks, or design challenges..."
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
              className="rounded-lg bg-primary-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'Submitting...' : <><Send className="h-3.5 w-3.5" /> Submit Log</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
