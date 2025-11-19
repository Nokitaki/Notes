// src/Auth.jsx
import { useState } from 'react';
import styles from './styles/Auth.module.css';

const Auth = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/signup';
      
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLogin(data.user);

      if (!isLoginMode && data.signupBonus) {
        alert(`🎉 Welcome! You received ${data.signupBonus} tADA signup bonus!`);
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.authBox}>
        <h1 className={styles.title}>
          📝 Notes App
          <br />
          <span className={styles.subtitle}>Blockchain Edition</span>
        </h1>

        <div className={styles.toggleContainer}>
          <button
            onClick={() => setIsLoginMode(true)}
            className={`${styles.toggleButton} ${isLoginMode ? styles.toggleButtonActive : ''}`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLoginMode(false)}
            className={`${styles.toggleButton} ${!isLoginMode ? styles.toggleButtonActive : ''}`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
          />
          
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />

          {error && (
            <div className={styles.error}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Please wait...' : isLoginMode ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {!isLoginMode && (
          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              🎁 Sign up and get <strong>10 tADA</strong> bonus!
            </p>
            <p className={styles.infoText}>
              ✨ Earn <strong>2 tADA</strong> for every note you create!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;