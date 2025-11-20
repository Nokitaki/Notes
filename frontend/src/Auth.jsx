// src/Auth.jsx
import { useState } from 'react';
import styles from './styles/Auth.module.css';

const Auth = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // 💡 SIGN UP ONLY: check if passwords match
    if (!isLoginMode && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLoginMode) {
        onLogin(data.user);
      } else {
        alert(`🎉 Account Created!\nYou received ${data.signupBonus} tADA bonus.`);
        setIsLoginMode(true); // switch to login after success
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
        {/* Title */}
        <h1 className={styles.title}>
          📝 Notes App
          <br />
          <span className={styles.subtitle}>Blockchain Edition</span>
        </h1>

        {/* Toggle */}
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className={styles.form}>
          
          <input
            type="text"
            placeholder={isLoginMode ? "Enter username" : "Choose a username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
          />

          <input
            type="password"
            placeholder={isLoginMode ? "Enter password" : "Create a password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />

          {/* SIGN UP MODE --- ADD CONFIRM PASSWORD */}
          {!isLoginMode && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              required
            />
          )}

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Please wait...' : isLoginMode ? 'Login' : 'Create Account'}
          </button>
        </form>

        {/* SIGN UP EXTRA INFO */}
        {!isLoginMode && (
          <div className={styles.infoBox}>
            <p className={styles.infoText}>🎁 Earn <strong>10 tADA</strong> signup bonus!</p>
            <p className={styles.infoText}>✨ Earn <strong>2 tADA</strong> every time you create a note!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
