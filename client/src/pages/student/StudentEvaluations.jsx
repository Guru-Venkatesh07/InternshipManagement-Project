import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Award, CheckCircle2, Star, BookOpen, AlertCircle } from 'lucide-react';

export const StudentEvaluations = () => {
  const [placement, setPlacement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlacement = async () => {
      try {
        const res = await api.get('/placements/my-placement');
        if (res.data?.success) {
          setPlacement(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load evaluation data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlacement();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  const evaluations = placement?.evaluationGrades || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Academic Evaluations & Final Grades</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review official faculty assessment scores, academic internship credits, and supervisor remarks
        </p>
      </div>

      {evaluations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
          <Award className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">No evaluations submitted yet</h3>
          <p className="text-xs text-slate-400 mt-1">
            Mid-term and final academic grades are assigned by your faculty advisor during your placement lifecycle.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {evaluations.map((evalItem) => (
            <div
              key={evalItem.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">
                    {evalItem.evaluationType} EVALUATION
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                    {placement?.application?.internship?.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Evaluator: {evalItem.faculty?.user?.name || 'Faculty Committee'} • Graded on{' '}
                    {new Date(evalItem.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-center p-3 rounded-2xl bg-primary-50 border border-primary-200">
                  <span className="text-[10px] uppercase font-bold text-primary-700 block">Grade</span>
                  <span className="text-3xl font-black text-primary-700">{evalItem.grade}</span>
                </div>
              </div>

              {/* Score Breakdown Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium">Attendance</p>
                  <p className="text-base font-bold text-slate-800 mt-1">{evalItem.attendance}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium">Technical</p>
                  <p className="text-base font-bold text-slate-800 mt-1">{evalItem.technicalScore}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium">Performance</p>
                  <p className="text-base font-bold text-slate-800 mt-1">{evalItem.performanceScore}%</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-[11px] text-slate-500 font-medium">Communication</p>
                  <p className="text-base font-bold text-slate-800 mt-1">{evalItem.communicationScore}%</p>
                </div>
                <div className="p-3 rounded-xl bg-primary-50/70 border border-primary-200 col-span-2 sm:col-span-1">
                  <p className="text-[11px] text-primary-700 font-medium">Overall Score</p>
                  <p className="text-base font-bold text-primary-800 mt-1">{evalItem.overallScore}%</p>
                </div>
              </div>

              {/* Evaluator Remarks */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary-600" /> Faculty Evaluator Feedback:
                </span>
                <p className="text-slate-600 leading-relaxed italic">{evalItem.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
