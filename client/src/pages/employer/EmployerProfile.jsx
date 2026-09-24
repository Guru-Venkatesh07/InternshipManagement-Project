import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../../components/common/Badge';
import {
  Building2,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const EmployerProfile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    description: '',
    website: '',
    address: '',
    contactPerson: '',
    phone: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.success) {
          const userData = res.data.data;
          setProfile(userData.profile);
          setFormData({
            companyName: userData.profile?.companyName || '',
            industry: userData.profile?.industry || '',
            description: userData.profile?.description || '',
            website: userData.profile?.website || '',
            address: userData.profile?.address || '',
            contactPerson: userData.profile?.contactPerson || '',
            phone: userData.profile?.phone || '',
          });
        }
      } catch (err) {
        console.error('Failed to load employer profile:', err);
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
      const res = await api.put('/employer/profile', formData);
      if (res.data?.success) {
        setStatusMsg({ type: 'success', text: 'Company profile updated successfully.' });
        await refreshUser();
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update company profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    e.preventDefault();
    if (!logoFile) return;

    setUploadingLogo(true);
    setStatusMsg({ type: '', text: '' });

    const data = new FormData();
    data.append('logo', logoFile);

    try {
      const res = await api.post('/employer/logo', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setStatusMsg({ type: 'success', text: 'Company logo uploaded successfully!' });
        setProfile((prev) => ({ ...prev, logoFile: res.data.data.logoFile }));
        setLogoFile(null);
        await refreshUser();
      }
    } catch (err) {
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.message || 'Failed to upload logo.',
      });
    } finally {
      setUploadingLogo(false);
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
        <h1 className="text-2xl font-bold text-slate-900">Company Profile & Verification</h1>
        <p className="text-xs text-slate-500 mt-1">
          Maintain your corporate brand, recruitment contacts, and institutional credentials
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
        {/* Left Column: Brand & Logo */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center">
            {profile?.logoFile ? (
              <img
                src={`/uploads/logos/${profile.logoFile}`}
                alt="Logo"
                className="mx-auto h-20 w-20 rounded-2xl object-cover border border-slate-200 mb-3"
              />
            ) : (
              <div className="mx-auto h-20 w-20 rounded-2xl bg-primary-50 text-primary-600 font-bold text-2xl flex items-center justify-center mb-3">
                <Building2 className="h-10 w-10" />
              </div>
            )}
            <h2 className="text-base font-bold text-slate-800">{profile?.companyName}</h2>
            <p className="text-xs text-slate-500">{profile?.industry}</p>

            <div className="mt-3">
              <Badge status={profile?.verificationStatus} />
            </div>
          </div>

          {/* Logo Upload Form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-semibold uppercase text-slate-400">Company Logo</h3>
            <form onSubmit={handleLogoUpload} className="space-y-2">
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <button
                type="submit"
                disabled={!logoFile || uploadingLogo}
                className="w-full rounded-lg bg-slate-800 py-1.5 px-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-900 transition disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                {uploadingLogo ? 'Uploading...' : <><Upload className="h-3.5 w-3.5" /> Save Logo</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Edit Company Form */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <h2 className="text-base font-bold text-slate-800 mb-4">Edit Corporate Details</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Sector *</label>
                <input
                  type="text"
                  required
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Talent / Contact Person *</label>
                <input
                  type="text"
                  required
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Office Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Corporate Overview</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                {saving ? 'Updating Company...' : 'Save Company Details'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
