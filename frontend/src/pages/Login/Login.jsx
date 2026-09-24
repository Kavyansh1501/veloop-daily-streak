import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/daily-streak');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.subtitle}>Log in to keep your streak alive.</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className={`form-control ${styles.input}`}
          value={form.email}
          onChange={handleChange}
          required
        />

        <label className={styles.label} htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className={`form-control ${styles.input}`}
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit" className={styles.button} disabled={submitting}>
          {submitting ? 'Logging in...' : 'Log In'}
        </button>

        <p className={styles.footer}>
          No account? <Link to="/register" className={styles.link}>Create one</Link>
        </p>
      </form>
    </div>
  );
}
