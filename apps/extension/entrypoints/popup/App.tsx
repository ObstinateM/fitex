import { useState, useEffect } from 'react';
import { signIn } from '../../src/lib/auth-client';
import { saveToken, getToken, clearToken } from '../../src/lib/auth-storage';
import './App.css';

interface User {
  name: string;
  email: string;
  isOnboarded?: boolean;
}

const WEB_URL = import.meta.env.VITE_WEB_URL ?? 'http://localhost:3000';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = await getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
      const res = await fetch(`${baseURL}/api/auth/get-session`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setUser(data.user);
        } else {
          await clearToken();
        }
      } else {
        await clearToken();
      }
    } catch {
      await clearToken();
    }
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await signIn.email({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message ?? 'Login failed');
      setLoading(false);
      return;
    }

    if (data?.token) {
      await saveToken(data.token);
    }
    if (data?.user) {
      setUser(data.user as User);
    }
    setLoading(false);
  }

  async function handleLogout() {
    await clearToken();
    setUser(null);
  }

  function handleGoogleLogin() {
    const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
    chrome.tabs.create({
      url: `${baseURL}/api/auth/sign-in/social?provider=google&callbackURL=${baseURL}/api/auth/callback/google`,
    });
  }

  if (loading) {
    return <div className="popup"><p>Loading...</p></div>;
  }

  if (user) {
    return (
      <div className="popup">
        <div className="header">
          <h1>Fitex</h1>
          <p className="user-info">{user.name}</p>
          <p className="user-email">{user.email}</p>
        </div>
        <div className="content">
          {user.isOnboarded ? (
            <p className="placeholder">CV tailoring coming soon</p>
          ) : (
            <div className="onboarding-prompt">
              <p className="placeholder">Complete setup to start tailoring CVs</p>
              <a
                href={`${WEB_URL}/onboarding`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
              >
                Complete setup at fitex.app
              </a>
            </div>
          )}
          <button className="btn btn-outline" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="popup">
      <div className="header">
        <h1>Fitex</h1>
        <p className="subtitle">Tailor your CV to any job</p>
      </div>
      <form onSubmit={handleLogin} className="form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          Sign in
        </button>
      </form>
      <div className="divider">
        <span>or</span>
      </div>
      <button className="btn btn-google" onClick={handleGoogleLogin}>
        Continue with Google
      </button>
    </div>
  );
}

export default App;
