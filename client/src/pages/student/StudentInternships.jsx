import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import {
  Briefcase,
  Search,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Send,
  Eye,
} from 'lucide-react';

export const StudentInternships = () => {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [isRemote, setIsRemote] = useState('');
  const [minStipend, setMinStipend] = useState('');

  // Modals
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applicationResume, setApplicationResume] = useState(null);
  const [applying, setApplying] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (department !== 'ALL') params.department = department;
      if (isRemote !== '') params.isRemote = isRemote;
      if (minStipend) params.minStipend = minStipend;

      const res = await api.get('/internships', { params });
      if (res.data?.success) {
        setInternships(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [department, isRemote, minStipend]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInternships();
  };

  const handleOpenApply = (internship) => {
    setSelectedInternship(internship);
    setCoverLetter('');
    setApplicationResume(null);
    setStatusMessage({ type: '', text: '' });
    setApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    if (!selectedInternship) return;

    setApplying(true);
    setStatusMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('internshipId', selectedInternship.id);
    formData.append('coverLetter', coverLetter);
    if (applicationResume) {
      formData.append('resume', applicationResume);
    }

    try {
      const res = await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setStatusMessage({
          type: 'success',
          text: 'Application submitted successfully! Faculty advisor has been notified for academic review.',
        });
        setTimeout(() => {
          setApplyModalOpen(false);
          fetchInternships();
        }, 1800);
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to submit application.',
      });
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Browse Internship Opportunities</h1>
        <p className="text-xs text-slate-500 mt-1">
          Explore approved corporate internships, review requirements, and submit applications
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Keyword Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search job title, skills, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              >
                <option value="ALL">All Departments</option>
                <option value="Computer Science and Engineering">Computer Science</option>
                <option value="Information Technology">Information Tech</option>
                <option value="Electronics and Communication">Electronics & Comm</option>
                <option value="Electrical Engineering">Electrical</option>
                <option value="Mechanical Engineering">Mechanical</option>
              </select>
            </div>

            {/* Remote Filter */}
            <div>
              <select
                value={isRemote}
                onChange={(e) => setIsRemote(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
              >
                <option value="">Work Mode (All)</option>
                <option value="true">Remote Only</option>
                <option value="false">On-Site / Hybrid</option>
              </select>
            </div>

            {/* Search Button */}
            <div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary-600 py-2 px-4 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Internships List */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : internships.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Briefcase className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No active internships found</h3>
          <p className="text-xs text-slate-400 mt-1">Try broadening your search terms or clearing filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-primary-600 uppercase tracking-wide">
                    {job.employer?.industry || 'Technology'}
                  </span>
                  {job.isRemote && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      <Sparkles className="h-3 w-3" /> Remote
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">{job.title}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-1 font-medium">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {job.employer?.companyName}
                </p>

                <p className="text-xs text-slate-500 mt-3 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                {/* Key specs */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                    <span>{job.stipend ? `$${job.stipend}/mo` : 'Unpaid / Credit'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    <span>{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Due: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-slate-400">
                  {job._count?.applications || 0} applicant{(job._count?.applications || 0) === 1 ? '' : 's'}
                </span>
                <button
                  onClick={() => handleOpenApply(job)}
                  className="rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition"
                >
                  Apply Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Application Submission Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply to ${selectedInternship?.title}`}
      >
        {statusMessage.text && (
          <div
            className={`mb-4 flex items-center gap-2 p-3 rounded-lg text-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
          <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
            <p className="font-bold text-slate-800">{selectedInternship?.employer?.companyName}</p>
            <p className="text-slate-500 mt-0.5">
              Required: {selectedInternship?.departmentRequired} • Eligibility: {selectedInternship?.eligibility}
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Cover Letter / Statement of Purpose *
            </label>
            <textarea
              rows="4"
              required
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Explain why you are interested in this position and how your academic background and project skills align with the requirements..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Resume Snapshot (Defaults to your profile resume or upload customized PDF/DOCX)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setApplicationResume(e.target.files[0])}
              className="block w-full text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applying}
              className="rounded-lg bg-primary-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-1.5"
            >
              {applying ? 'Submitting...' : <><Send className="h-3.5 w-3.5" /> Submit Application</>}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
