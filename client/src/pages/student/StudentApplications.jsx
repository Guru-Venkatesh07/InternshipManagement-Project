import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  FileText,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
  Video,
  Clock,
} from 'lucide-react';

export const StudentApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      if (res.data?.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleAcceptOffer = async (applicationId) => {
    if (!window.confirm('Are you sure you want to accept this internship offer? Accepting will officially initialize your active placement record.')) {
      return;
    }

    setAcceptingId(applicationId);
    setActionMsg({ type: '', text: '' });

    try {
      const res = await api.put(`/applications/${applicationId}/accept`);
      if (res.data?.success) {
        setActionMsg({
          type: 'success',
          text: 'Congratulations! Internship offer accepted. Active placement workspace initialized.',
        });
        await fetchApplications();
        setTimeout(() => {
          navigate('/student/internship');
        }, 1500);
      }
    } catch (err) {
      setActionMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to accept offer.',
      });
    } finally {
      setAcceptingId(null);
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
        <h1 className="text-2xl font-bold text-slate-900">Application History & Tracking</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor review progress, interview invitations, faculty endorsements, and official offers
        </p>
      </div>

      {actionMsg.text && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-xs ${
            actionMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {actionMsg.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{actionMsg.text}</span>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No applications submitted</h3>
          <p className="text-xs text-slate-400 mt-1 mb-4">You have not applied to any internships yet.</p>
          <Link
            to="/student/internships"
            className="rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
          >
            Browse Open Internships
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{app.internship?.title}</h3>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    {app.internship?.employer?.companyName} • Applied on{' '}
                    {new Date(app.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge status={app.status} />
                </div>
              </div>

              {/* Status details & remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 text-xs">
                {/* Faculty Review Status */}
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Academic / Faculty Review:
                  </span>
                  <p className="text-slate-600 italic">
                    {app.facultyRemarks || 'Pending faculty advisor clearance and credit review.'}
                  </p>
                </div>

                {/* Employer Remarks */}
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                  <span className="font-semibold text-slate-700 block mb-1">
                    Employer Feedback:
                  </span>
                  <p className="text-slate-600 italic">
                    {app.employerRemarks || 'Application under departmental assessment.'}
                  </p>
                </div>
              </div>

              {/* Interview callout if scheduled */}
              {app.interview && (
                <div className="rounded-xl bg-purple-50/80 border border-purple-200 p-3.5 text-xs text-purple-900 mb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold flex items-center gap-1.5 text-purple-800">
                        <Video className="h-4 w-4" /> Interview Scheduled: {app.interview.roundName}
                      </span>
                      <p className="text-[11px] text-purple-700 mt-1">
                        Date: {app.interview.scheduledDate} at {app.interview.scheduledTime} ({app.interview.mode})
                      </p>
                    </div>
                    {app.interview.meetingLink && (
                      <a
                        href={app.interview.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition"
                      >
                        Join Meeting Link <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Offer Acceptance Action Banner */}
              {app.status === 'SELECTED' && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-300 p-4 text-xs text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-sm flex items-center gap-1.5 text-emerald-800">
                      <Award className="h-4 w-4" /> Official Internship Offer Extended!
                    </span>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      The employer has selected you for this role. Confirm acceptance to initiate your placement.
                    </p>
                  </div>
                  <button
                    onClick={() => handleAcceptOffer(app.id)}
                    disabled={acceptingId === app.id}
                    className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    {acceptingId === app.id ? 'Accepting...' : 'Accept Offer & Start Placement'}
                  </button>
                </div>
              )}

              {/* If already accepted */}
              {app.status === 'ACCEPTED' && (
                <div className="text-right pt-2">
                  <Link
                    to="/student/internship"
                    className="text-xs font-bold text-primary-600 hover:underline"
                  >
                    View Active Placement Workspace →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
