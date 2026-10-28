import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Building2, Lock, Mail, User, ShieldAlert } from 'lucide-react';

export function CommandCenterRegister({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Official');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/register', { name, email, password, role });
      if (res.data.success) {
        localStorage.setItem('civicai_token', res.data.token);
        localStorage.setItem('civicai_user', JSON.stringify(res.data.user));
        navigate('/command-center/dashboard');
        onLoginSuccess(res.data.user);
      } else {
        setError(res.data.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration server connection error');
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
              Register Official Account
            </h1>
            <p className="mt-1 text-sm text-slate-600 mb-0">
              CivicAI Command Center Official Registration
            </p>
          </div>

          {error && (
            <div role="alert" className="alert alert-error mb-5">
              <ShieldAlert size={18} className="mt-0.5 shrink-0" /> <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="cc-reg-name" className="field-label">Full Name</label>
              <div className="relative">
                <User size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="cc-reg-name"
                  type="text"
                  required
                  autoComplete="name"
                  className="form-input pl-10"
                  placeholder="Official Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="cc-reg-email" className="field-label">Official Email</label>
              <div className="relative">
                <Mail size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="cc-reg-email"
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
              <label htmlFor="cc-reg-role" className="field-label">Role</label>
              <select
                id="cc-reg-role"
                className="form-select"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="Official">Municipality Official</option>
                <option value="Worker">Maintenance Field Worker</option>
              </select>
            </div>

            <div>
              <label htmlFor="cc-reg-password" className="field-label">Password</label>
              <div className="relative">
                <Lock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  id="cc-reg-password"
                  type="password"
                  required
                  autoComplete="new-password"
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
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-600">
            Already registered?{' '}
            <Link to="/command-center/login" className="font-bold text-blue-700 no-underline hover:text-blue-800 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
