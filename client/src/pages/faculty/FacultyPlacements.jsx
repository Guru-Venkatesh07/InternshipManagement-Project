import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  Award,
  MessageSquare,
  Clock,
  Star,
  Send,
  AlertCircle,
} from 'lucide-react';

export const FacultyPlacements = () => {
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feedback Modal
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [targetLog, setTargetLog] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Grading Modal
  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [targetPlacement, setTargetPlacement] = useState(null);
  const [gradeForm, setGradeForm] = useState({
    evaluationType: 'FINAL',
    attendance: '95',
    technicalScore: '90',
    performanceScore: '90',
    communicationScore: '92',
    grade: 'A+',
    feedback: 'Demonstrated outstanding dedication and technical execution throughout the internship.',
  });

  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const fetchPlacements = async () => {
    try {
      const res = await api.get('/faculty/placements');
      if (res.data?.success) {
        setPlacements(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load supervised placements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlacements();
  }, []);

  const openFeedbackModal = (log, studentName) => {
    setTargetLog({ ...log, studentName });
    setFeedbackText(log.facultyFeedback || '');
    setStatusMsg({ type: '', text: '' });
    setFeedbackModalOpen(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!targetLog) return;

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.put(`/placements/progress-logs/${targetLog.id}/review`, {
        feedback: feedbackText,
      });
      setStatusMsg({ type: 'success', text: 'Faculty feedback recorded.' });
      await fetchPlacements();
      setTimeout(() => setFeedbackModalOpen(false), 1200);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit feedback.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const openGradeModal = (placement) => {
    setTargetPlacement(placement);
    setGradeForm({
      evaluationType: 'FINAL',
      attendance: '95',
      technicalScore: '90',
      performanceScore: '92',
      communicationScore: '90',
      grade: 'A+',
      feedback: 'Excellent work ethic, timely weekly reporting, and outstanding technical achievements.',
    });
    setStatusMsg({ type: '', text: '' });
    setGradeModalOpen(true);
  };

  const handleGradeSubmit = async (e) => {
    e.preventDefault();
    if (!targetPlacement) return;

    setSubmitting(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.post('/placements/evaluations', {
        internshipRecordId: targetPlacement.id,
        ...gradeForm,
      });
      setStatusMsg({
        type: 'success',
        text: `Official ${gradeForm.evaluationType} grade (${gradeForm.grade}) assigned! Internship marked as completed.`,
      });
      await fetchPlacements();
      setTimeout(() => setGradeModalOpen(false), 1500);
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit grade.',
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
        <h1 className="text-2xl font-bold text-slate-900">Supervised Placements & Evaluations</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor weekly student progress logs, provide academic guidance, and assign final grades
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

      {placements.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No active placements</h3>
          <p className="text-xs text-slate-400 mt-1">
            Placements appear here once advised students accept their internship offers.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {placements.map((pl) => (
            <div
              key={pl.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">
                      {pl.student?.user?.name}
                    </h3>
                    <Badge status={pl.status} />
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {pl.application?.internship?.title} at{' '}
                    <span className="font-semibold text-slate-700">
                      {pl.application?.internship?.employer?.companyName}
                    </span>{' '}
                    • Supervisor: {pl.industrySupervisorName}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openGradeModal(pl)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    <Award className="h-4 w-4" /> Evaluate & Assign Grade
                  </button>
                </div>
              </div>

              {/* Existing Grades if any */}
              {pl.evaluationGrades?.length > 0 && (
                <div className="p-3.5 rounded-xl bg-primary-50/60 border border-primary-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-primary-800">
                      Official Grade Assigned: {pl.evaluationGrades[0]?.grade} (Overall: {pl.evaluationGrades[0]?.overallScore}%)
                    </span>
                    <p className="text-primary-700 text-[11px] italic mt-0.5">
                      "{pl.evaluationGrades[0]?.feedback}"
                    </p>
                  </div>
                  <Badge status="COMPLETED" />
                </div>
              )}

              {/* Progress Logs Submissions */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Weekly Progress Submissions ({pl.progressLogs?.length || 0})
                </h4>

                {pl.progressLogs?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No progress logs filed yet by student.</p>
                ) : (
                  <div className="space-y-3">
                    {pl.progressLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-slate-200 p-4 bg-slate-50/50 hover:bg-slate-50 transition text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">
                            Week {log.weekNumber} Report
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Submitted {new Date(log.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-700 block">Tasks Completed:</span>
                            <p>{log.tasksCompleted}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 block">Skills Learned:</span>
                            <p>{log.skillsGained}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700 block">Challenges:</span>
                            <p>{log.challenges || 'None'}</p>
                          </div>
                        </div>

                        {/* Current Feedback & Review Button */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-200 mt-2">
                          <div className="text-[11px]">
                            <span className="font-semibold text-slate-700">Faculty Feedback: </span>
                            <span className="italic text-slate-500">
                              {log.facultyFeedback || 'No feedback provided yet.'}
                            </span>
                          </div>
                          <button
                            onClick={() => openFeedbackModal(log, pl.student?.user?.name)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 transition flex items-center gap-1 shrink-0"
                          >
                            <MessageSquare className="h-3 w-3" />
                            {log.facultyFeedback ? 'Edit Feedback' : 'Add Feedback'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Faculty Feedback Modal */}
      <Modal
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        title={`Faculty Feedback on Week ${targetLog?.weekNumber} for ${targetLog?.studentName}`}
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Feedback & Guidance Remarks *
            </label>
            <textarea
              rows="4"
              required
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Provide constructive feedback, architectural recommendations, and encouragement..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFeedbackModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-primary-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {submitting ? 'Saving...' : <><Send className="h-3.5 w-3.5" /> Save Feedback</>}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Grading & Evaluation Modal */}
      <Modal
        isOpen={gradeModalOpen}
        onClose={() => setGradeModalOpen(false)}
        title={`Academic Evaluation: ${targetPlacement?.student?.user?.name}`}
      >
        <form onSubmit={handleGradeSubmit} className="space-y-4 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <p className="font-bold text-slate-800">{targetPlacement?.student?.user?.name}</p>
            <p className="text-slate-500">
              {targetPlacement?.application?.internship?.title} at{' '}
              {targetPlacement?.application?.internship?.employer?.companyName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Evaluation Stage</label>
              <select
                value={gradeForm.evaluationType}
                onChange={(e) => setGradeForm({ ...gradeForm, evaluationType: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              >
                <option value="FINAL">Final Evaluation (Concludes Internship)</option>
                <option value="MID_TERM">Mid-Term Evaluation</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Final Letter Grade *</label>
              <select
                value={gradeForm.grade}
                onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs font-bold text-primary-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              >
                <option value="A+">A+ (Exceptional)</option>
                <option value="A">A (Excellent)</option>
                <option value="B+">B+ (Very Good)</option>
                <option value="B">B (Good)</option>
                <option value="C">C (Satisfactory)</option>
                <option value="D">D (Pass)</option>
                <option value="F">F (Fail)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Attendance Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={gradeForm.attendance}
                onChange={(e) => setGradeForm({ ...gradeForm, attendance: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Technical Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={gradeForm.technicalScore}
                onChange={(e) => setGradeForm({ ...gradeForm, technicalScore: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Performance Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={gradeForm.performanceScore}
                onChange={(e) => setGradeForm({ ...gradeForm, performanceScore: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Communication Score (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={gradeForm.communicationScore}
                onChange={(e) => setGradeForm({ ...gradeForm, communicationScore: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Official Evaluation Feedback & Credit Certificate Endorsement *
            </label>
            <textarea
              rows="3"
              required
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setGradeModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Official Grade'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
