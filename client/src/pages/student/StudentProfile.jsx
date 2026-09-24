import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
} from 'lucide-react';

export const StudentProfile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    year: '',
    cgpa: '',
    skills: '',
    phone: '',
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          const userData = res.data.data;
          setProfile(userData.profile);
          setFormData({
            name: userData.name || '',
            department: userData.profile?.department || '',
            year: userData.profile?.year || '3',
            cgpa: userData.profile?.cgpa || '0.0',
            skills: userData.profile?.skills || '',
            phone: userData.profile?.phone || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await api.put('/student/profile', formData);
      if (res.data?.success) {
        setStatusMsg({ type: 'success', text: 'Profile updated successfully.' });
        await refreshUser();
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setUploading(true);
    setStatusMsg({ type: '', text: '' });

    const data = new FormData();
    data.append('resume', resumeFile);

    try {
      const res = await api.post('/student/resume', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setStatusMsg({ type: 'success', text: 'Resume uploaded successfully!' });
        setProfile((prev) => ({ ...prev, resumeFile: res.data.data.resumeFile }));
        setResumeFile(null);
        await refreshUser();
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload resume.',
      });
    } finally {
      setUploading(false);
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Profile & Resume</h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain your academic records, technical proficiencies, and official resume
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Academic Credentials Card */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-primary-100 text-primary-700 font-bold text-2xl flex items-center justify-center mb-3">
              {user?.name ? user.name[0].toUpperCase() : 'S'}
            </div>
            <h2 className="text-base font-bold text-slate-800">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <GraduationCap className="h-3.5 w-3.5 text-primary-600" />
              {profile?.rollNumber || 'CS2023-XXXX'}
            </div>
          </div>

          {/* Assigned Faculty Advisor Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-xs font-semibold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-amber-600" /> Assigned Faculty Advisor
            </h3>
            {profile?.facultyAdvisor ? (
              <div className="space-y-1 text-xs">
                <p className="font-bold text-slate-800">{profile.facultyAdvisor.user?.name}</p>
                <p className="text-slate-500">{profile.facultyAdvisor.designation}</p>
                <p className="text-slate-400 text-[11px]">{profile.facultyAdvisor.user?.email}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Assigned upon departmental allocation.</p>
            )}
          </div>

          {/* Resume Upload & Preview Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-primary-600" /> Official Resume
            </h3>

            {profile?.resumeFile ? (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="truncate max-w-[150px]">
                  <p className="font-semibold text-slate-800 truncate">{profile.resumeFile}</p>
                  <span className="text-[10px] text-emerald-600 font-medium">Uploaded & Ready</span>
                </div>
                <a
                  href={`/uploads/resumes/${profile.resumeFile}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg p-2 text-primary-600 hover:bg-primary-50 transition"
                  title="View Resume"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No resume uploaded yet.</p>
            )}

            <form onSubmit={handleResumeUpload} className="space-y-2">
              <label className="block text-[11px] font-semibold text-slate-600">
                Replace / Upload New Resume (PDF, DOCX max 5MB)
              </label>
              <input
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <button
                type="submit"
                disabled={!resumeFile || uploading}
                className="w-full rounded-lg bg-slate-800 py-1.5 px-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-900 transition disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {uploading ? 'Uploading...' : <><Upload className="h-3.5 w-3.5" /> Save Resume</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Profile Form */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 mb-4">Edit Profile Information</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                >
                  <option value="1">1st Year</option>
                  <option value="2">2nd Year</option>
                  <option value="3">3rd Year</option>
                  <option value="4">4th Year (Final)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA (0 - 10.0)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.cgpa}
                  onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 555-019-2831"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Skills & Technologies (Comma-separated)
                </label>
                <textarea
                  rows="3"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="React, Node.js, Express, PostgreSQL, Tailwind CSS, Python, Git"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-primary-600 py-2.5 px-6 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition disabled:opacity-50"
              >
                {saving ? 'Saving changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
