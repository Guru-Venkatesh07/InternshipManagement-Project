import React from 'react';

const statusStyles = {
  // Postings
  PUBLISHED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
  CLOSED: 'bg-rose-50 text-rose-700 border-rose-200',

  // Applications
  APPLIED: 'bg-blue-50 text-blue-700 border-blue-200',
  FACULTY_PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  UNDER_REVIEW: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  SHORTLISTED: 'bg-sky-50 text-sky-700 border-sky-200',
  INTERVIEW_SCHEDULED: 'bg-purple-50 text-purple-700 border-purple-200',
  SELECTED: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
  ACCEPTED: 'bg-teal-50 text-teal-700 border-teal-200 font-semibold',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',

  // Verification & Placements
  VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  ONGOING: 'bg-blue-50 text-blue-700 border-blue-200',
  COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  TERMINATED: 'bg-rose-50 text-rose-700 border-rose-200',
};

const formatLabel = (status) => {
  if (!status) return 'UNKNOWN';
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const Badge = ({ status, className = '' }) => {
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}
    >
      {formatLabel(status)}
    </span>
  );
};
