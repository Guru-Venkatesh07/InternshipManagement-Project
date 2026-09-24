import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Badge } from '../../components/common/Badge';
import { Users, GraduationCap, Phone, Mail, Award, BookOpen, Search } from 'lucide-react';

export const FacultyStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/faculty/students');
        if (res.data?.success) {
          setStudents(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load assigned students:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.user?.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.department.toLowerCase().includes(search.toLowerCase())
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
          <h1 className="text-2xl font-bold text-slate-900">Assigned Departmental Students</h1>
          <p className="text-xs text-slate-500 mt-1">
            Oversee advisees, academic eligibility, and career progression
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search student or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden"
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No students found</h3>
          <p className="text-xs text-slate-400 mt-1">No advisees match your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((s) => {
            const activePlacement = s.internshipRecords?.find((r) => r.status === 'ONGOING');
            const completedCount = s.internshipRecords?.filter((r) => r.status === 'COMPLETED').length || 0;

            return (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{s.user?.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary-600" />
                      {s.rollNumber} • {s.department} (Year {s.year})
                    </p>
                  </div>
                  <span className="rounded-full bg-primary-50 text-primary-700 font-bold px-2.5 py-0.5 text-xs">
                    CGPA {s.cgpa.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.user?.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{s.phone || 'No phone'}</span>
                  </div>
                </div>

                {/* Skills */}
                {s.skills && (
                  <div className="text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Skills: </span>
                    <span>{s.skills}</span>
                  </div>
                )}

                {/* Placement status summary */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    {activePlacement ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        Placement Active
                      </span>
                    ) : (
                      <span className="text-slate-400">Seeking Placement</span>
                    )}
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    {s.applications?.length || 0} applications • {completedCount} completed
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
