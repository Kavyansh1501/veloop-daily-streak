import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Register.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
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
        <h1 className={styles.title}>Create your account</h1>
        <p className={styles.subtitle}>Start your VELoop streak today.</p>

        {error && <div className={styles.error}>{error}</div>}

        <label className={styles.label} htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          className={`form-control ${styles.input}`}
          value={form.name}
          onChange={handleChange}
          required
        />

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
          minLength={6}
        />

        <button type="submit" className={styles.button} disabled={submitting}>
          {submitting ? 'Creating account...' : 'Create Account'}
        </button>

        <p className={styles.footer}>
          Already have an account? <Link to="/login" className={styles.link}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
