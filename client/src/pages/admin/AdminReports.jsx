import React, { useState } from 'react';
import api from '../../services/api';
import {
  FileSpreadsheet,
  Download,
  Users,
  Briefcase,
  Award,
  CheckCircle2,
} from 'lucide-react';

export const AdminReports = () => {
  const [downloading, setDownloading] = useState('');

  const handleDownload = async (type) => {
    setDownloading(type);
    try {
      const res = await api.get(`/admin/reports/${type}/export`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ims-${type}-report-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV report.');
    } finally {
      setDownloading('');
    }
  };

  const reports = [
    {
      id: 'users',
      title: 'Institutional User Registry Report',
      description: 'Complete export of registered students, faculty advisors, corporate employers, and administrators.',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'internships',
      title: 'Corporate Internship Postings Report',
      description: 'Comprehensive breakdown of approved postings, stipend distributions, departments, and applicant metrics.',
      icon: Briefcase,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'applications',
      title: 'Application Pipeline & Selection Report',
      description: 'End-to-end applicant tracking data: submissions, faculty clearances, interview stages, and offers.',
      icon: FileSpreadsheet,
      color: 'text-indigo-600 bg-indigo-50',
    },
    {
      id: 'placements',
      title: 'Accreditation Placement & Grades Report',
      description: 'Official academic placement records: duration, industry supervisors, weekly log totals, and final grades.',
      icon: Award,
      color: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Accreditation Reports & Data Exports</h1>
        <p className="text-xs text-slate-500 mt-1">
          Export standardized CSV reports for academic accreditation, institutional analytics, and audits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((r) => {
          const Icon = r.icon;
          const isCurrent = downloading === r.id;

          return (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-xl ${r.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{r.title}</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  {r.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Format: CSV / Excel Compatible
                </span>
                <button
                  onClick={() => handleDownload(r.id)}
                  disabled={!!downloading}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-primary-700 transition disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isCurrent ? 'Generating CSV...' : 'Download CSV'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
