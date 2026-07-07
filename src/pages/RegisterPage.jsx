/**
 * RegisterPage — LVL_UP styled glass-card registration form.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './AuthPages.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        displayName: form.username,
      });
      setSuccessMessage('Account ready. Taking you into your dashboard...');
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__bg" aria-hidden="true">
        <div className="auth-page__blob auth-page__blob--1" />
        <div className="auth-page__blob auth-page__blob--2" />
      </div>

      <div className="auth-card glass-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px', color: 'var(--primary)' }}>bolt</span>
          </div>
          <h1 className="auth-card__title">LVL_UP</h1>
          <p className="auth-card__subtitle">Initialize your personal dashboard.</p>
        </div>

        {error && <div className="auth-card__error">{error}</div>}
        {successMessage && <div className="auth-card__success">{successMessage}</div>}

        <form onSubmit={handleSubmit} className="auth-card__form">
          <div className="auth-field">
            <label className="auth-field__label">Username</label>
            <div className="auth-field__input-wrap">
              <span className="material-symbols-outlined auth-field__icon">person</span>
              <input type="text" value={form.username} onChange={update('username')}
                placeholder="commander" required minLength={3} className="auth-field__input" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label">Email</label>
            <div className="auth-field__input-wrap">
              <span className="material-symbols-outlined auth-field__icon">mail</span>
              <input type="email" value={form.email} onChange={update('email')}
                placeholder="you@lvlup.dev" required className="auth-field__input" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label">Password</label>
            <div className="auth-field__input-wrap">
              <span className="material-symbols-outlined auth-field__icon">lock</span>
              <input type="password" value={form.password} onChange={update('password')}
                placeholder="Min 6 characters" required minLength={6} className="auth-field__input" />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-field__label">Confirm Password</label>
            <div className="auth-field__input-wrap">
              <span className="material-symbols-outlined auth-field__icon">lock</span>
              <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')}
                placeholder="Repeat password" required minLength={6} className="auth-field__input" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="auth-card__submit">
            {loading ? (
              <span className="auth-card__spinner" />
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>rocket_launch</span>
                CREATE ACCOUNT
              </>
            )}
          </button>
        </form>

        <div className="auth-card__footer">
          <p>Already have an account? <Link to="/login" className="auth-card__link">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
