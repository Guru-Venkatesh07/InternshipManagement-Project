import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'STUDENT') navigate('/student/dashboard');
      else if (user.role === 'EMPLOYER') navigate('/employer/dashboard');
      else if (user.role === 'FACULTY') navigate('/faculty/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl mb-2">
            <GraduationCap className="h-8 w-8" />
            <span className="text-slate-900">Internship<span className="text-primary-600">MS</span></span>
          </Link>
          <h2 className="text-xl font-bold text-slate-800">Sign in to your portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your student, employer, faculty, or admin workspace
          </p>
        </div>

        {/* Demo Quick-Select Buttons */}
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2">
            <ShieldCheck className="h-4 w-4 text-primary-600" />
            Quick Demo Autofill
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => autofill('student@college.com', 'Student@123')}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left font-medium text-slate-700 transition"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => autofill('employer@techcorp.com', 'Employer@123')}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left font-medium text-slate-700 transition"
            >
              🏢 Employer
            </button>
            <button
              type="button"
              onClick={() => autofill('faculty@college.com', 'Faculty@123')}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 text-left font-medium text-slate-700 transition"
            >
              👨‍🏫 Faculty
            </button>
            <button
              type="button"
              onClick={() => autofill('admin@internship.com', 'Admin@123')}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 text-left font-medium text-slate-700 transition"
            >
              ⚙️ Admin
            </button>
          </div>
        </div>

        {/* Form Box */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@college.com"
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-hidden transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary-600 py-2.5 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Registration Links */}
        <div className="text-center text-xs text-slate-500 space-y-1.5">
          <p>
            New Student?{' '}
            <Link to="/register/student" className="font-semibold text-primary-600 hover:text-primary-800">
              Register as Student
            </Link>
          </p>
          <p>
            Representing a Company?{' '}
            <Link to="/register/employer" className="font-semibold text-primary-600 hover:text-primary-800">
              Register as Employer
            </Link>
          </p>
          <p>
            Faculty Member?{' '}
            <Link to="/register/faculty" className="font-semibold text-primary-600 hover:text-primary-800">
              Register as Faculty
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
