import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

export function AuthModal({ onClose, onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Official');

  const [department, setDepartment] = useState('Road Maintenance');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email, password }
      : { name, email, password, role, department: role !== 'Citizen' ? department : undefined };

    try {
      const res = await axios.post(endpoint, payload);
      if (res.data.success) {
        setSuccessMsg(res.data.message || (isLogin ? 'Login successful!' : 'Registration successful!'));
        localStorage.setItem('civicai_token', res.data.token);
        localStorage.setItem('civicai_user', JSON.stringify(res.data.user));
        
        setTimeout(() => {
          onLoginSuccess(res.data.user);
          onClose();
        }, 800);
      }
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Authentication error occurred. Please check your credentials.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: '440px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>
              {isLogin ? 'Sign In to CivicAI' : 'Create CivicAI Account'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Access Citizen Reporting or Official Command Dashboard
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', padding: '0.75rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <div>{error}</div>
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '0.75rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <div>{successMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="citizen@civicai.org"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="Citizen">Citizen (Report Issues & Track)</option>
                  <option value="Official">Government Official (Verify & Triage)</option>
                  <option value="Worker">Field Team Worker (Resolve & Photo Proof)</option>
                </select>
              </div>

              {role !== 'Citizen' && (
                <div className="form-group">
                  <label className="form-label">Assigned Department</label>
                  <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="Road Maintenance">Road Maintenance</option>
                    <option value="Municipal/Sanitation">Municipal/Sanitation</option>
                    <option value="Water & Sanitation">Water & Sanitation</option>
                    <option value="Animal Control & Sanitation">Animal Control & Sanitation</option>
                  </select>
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
            {isLogin ? <LogIn size={16} /> : <UserPlus size={16} />}
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Register Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {isLogin ? "Don't have an account? " : "Already registered? "}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontWeight: 600, cursor: 'pointer' }}
          >
            {isLogin ? 'Register now' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
