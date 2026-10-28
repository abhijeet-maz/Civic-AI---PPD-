import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, Lock, Mail, ShieldAlert } from 'lucide-react';

export function CommandCenterLogin({ onLoginSuccess }) {
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
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('civicai_token', res.data.token);
        localStorage.setItem('civicai_user', JSON.stringify(res.data.user));
        navigate('/command-center/dashboard');
        onLoginSuccess(res.data.user);
      } else {
        setError(res.data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication server connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4 py-8">
      <div className="w-full max-w-md">
        <div className="panel p-6 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mb-3 inline-grid size-14 place-items-center rounded-2xl bg-navy">
              <Building2 size={28} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 mb-0">
              CivicAI Command Center
            </h1>
            <p className="mt-1 text-sm text-slate-600 mb-0">
              Municipal Operational Management Portal Login
            </p>
          </div>

          {error && (
            <div role="alert" className="alert alert-error mb-5">
              <ShieldAlert size={18} className="mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="cc-login-email" className="field-label">Official Email</label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="cc-login-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="form-input pl-10"
                  placeholder="official@municipality.gov"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label htmlFor="cc-login-password" className="field-label">Password</label>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="cc-login-password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="form-input pl-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="btn btn-primary mt-1 min-h-11 w-full"
            >
              {loading ? 'Authenticating...' : 'Sign In to Command Center'}
            </button>
          </form>

          <div className="mt-5 rounded-lg border border-dashed border-blue-300 bg-blue-50 p-3 text-center text-sm">
            <div className="mb-1 font-semibold text-blue-800">💡 Quick Demo Login</div>
            <button
              type="button"
              onClick={() => {
                setEmail('official@municipality.gov');
                setPassword('Password123');
              }}
              className="min-h-9 rounded px-2 text-[13px] text-slate-800 underline underline-offset-2 hover:text-blue-800 border-0 bg-transparent"
            >
              Click to autofill: <strong>official@municipality.gov</strong> / <strong>Password123</strong>
            </button>
          </div>

          <div className="mt-5 text-center text-sm text-slate-600">
            Don't have an official account?{' '}
            <Link to="/command-center/register" className="font-bold text-blue-700 no-underline hover:text-blue-800 hover:underline">
              Register Official Account
            </Link>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Link to="/" className="inline-flex min-h-10 items-center text-sm font-medium text-blue-700 no-underline hover:underline">
            ← Return to Public Citizen Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
