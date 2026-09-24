import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import {
  Building2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Search,
  Briefcase,
} from 'lucide-react';

export const AdminEmployers = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/admin/companies');
      if (res.data?.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleUpdateVerification = async (employerId, status) => {
    try {
      await api.put(`/admin/companies/${employerId}/verification`, { status });
      await fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update company verification.');
    }
  };

  const filtered = companies.filter(
    (c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase()) ||
      c.contactPerson.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-slate-900">Corporate Partner & Company Verification</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review employer legitimacy, verified status, and posted internship openings
          </p>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search company or industry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Building2 className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No companies found</h3>
          <p className="text-xs text-slate-400 mt-1">No corporate partners match your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.companyName}</h3>
                    <p className="text-xs text-slate-500">{c.industry}</p>
                  </div>
                  <Badge status={c.verificationStatus} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <p>
                    <span className="font-semibold text-slate-700">Contact: </span>
                    {c.contactPerson} ({c.phone})
                  </p>
                  <p>
                    <span className="font-semibold text-slate-700">Account: </span>
                    {c.user?.email}
                  </p>
                  {c.website && (
                    <a
                      href={c.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 hover:underline flex items-center gap-1 font-medium pt-1"
                    >
                      {c.website} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {c.description && (
                    <p className="text-slate-500 italic mt-2 line-clamp-2">{c.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4 text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" /> {c._count?.internships || 0} postings
                </span>

                <div className="flex items-center gap-2">
                  {c.verificationStatus !== 'VERIFIED' && (
                    <button
                      onClick={() => handleUpdateVerification(c.id, 'VERIFIED')}
                      className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Verify Company
                    </button>
                  )}
                  {c.verificationStatus !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdateVerification(c.id, 'REJECTED')}
                      className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition flex items-center gap-1"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
