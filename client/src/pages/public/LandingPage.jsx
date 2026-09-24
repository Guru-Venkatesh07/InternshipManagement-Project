import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  Briefcase,
  Building2,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LandingPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickLogin = async (email, password, redirect) => {
    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      console.error('Quick login failed:', err);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-primary-600 font-bold text-xl">
            <GraduationCap className="h-7 w-7" />
            <span className="text-slate-900">Internship<span className="text-primary-600">MS</span></span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={
                  user.role === 'STUDENT'
                    ? '/student/dashboard'
                    : user.role === 'EMPLOYER'
                    ? '/employer/dashboard'
                    : user.role === 'FACULTY'
                    ? '/faculty/dashboard'
                    : '/admin/dashboard'
                }
                className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register/student"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 to-white py-20 lg:py-28 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-800 mb-6">
            <Sparkles className="h-3.5 w-3.5" /> Complete Academic Internship Lifecycle Platform
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto">
            Bridge the Gap Between <span className="text-primary-600">Students</span>, <span className="text-primary-600">Industry</span>, and <span className="text-primary-600">Faculty</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            A real full-stack platform managing the complete internship lifecycle: from registration, posting, application, and faculty NOC clearance to interview scheduling, weekly logging, and official grading.
          </p>

          {/* Quick Demo Launchpad */}
          <div className="mt-10 max-w-3xl mx-auto rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Explore Demo Accounts (Instant 1-Click Access)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleQuickLogin('student@college.com', 'Student@123', '/student/dashboard')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 transition group"
              >
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Student Demo</span>
                <span className="text-[10px] text-slate-400">Apply & Track</span>
              </button>

              <button
                onClick={() => handleQuickLogin('employer@techcorp.com', 'Employer@123', '/employer/dashboard')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 transition group"
              >
                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <Building2 className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Employer Demo</span>
                <span className="text-[10px] text-slate-400">Post & Interview</span>
              </button>

              <button
                onClick={() => handleQuickLogin('faculty@college.com', 'Faculty@123', '/faculty/dashboard')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 transition group"
              >
                <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Faculty Demo</span>
                <span className="text-[10px] text-slate-400">Review & Grade</span>
              </button>

              <button
                onClick={() => handleQuickLogin('admin@internship.com', 'Admin@123', '/admin/dashboard')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-primary-500 hover:bg-primary-50/50 transition group"
              >
                <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <span className="text-xs font-bold text-slate-800">Admin Demo</span>
                <span className="text-[10px] text-slate-400">System Control</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Feature Matrix */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
          Tailored Workflows for Every Stakeholder
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-5">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">For Students</h3>
            <p className="text-sm text-slate-600 mb-4">
              Discover verified industry opportunities, apply with snapshot resumes, track application progression, submit weekly activity logs, and receive academic credits.
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Filter by department, stipend, & remote</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Real-time status alerts & interview links</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Weekly progress reporting & feedback</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">For Employers</h3>
            <p className="text-sm text-slate-600 mb-4">
              Post internships, review pre-cleared academic talent, shortlist applicants, conduct live virtual interviews, and manage selections with ease.
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Verified company profile management</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Complete candidate resume review</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Built-in interview scheduling engine</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md transition">
            <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">For Faculty Advisors</h3>
            <p className="text-sm text-slate-600 mb-4">
              Oversee departmental students, approve or decline academic internship clearance, inspect weekly progress submissions, and assign final grades.
            </p>
            <ul className="space-y-2 text-xs text-slate-500">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Academic credit & prerequisite verification</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Continuous weekly log supervision</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Multi-criteria evaluation & grading (A+ to F)</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          © 2026 Internship Management System. Built with React, Vite, Tailwind CSS, Express, and Prisma ORM.
        </div>
      </footer>
    </div>
  );
};
