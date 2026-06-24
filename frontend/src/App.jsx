import { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { api, clearStoredToken, getStoredToken, setStoredToken } from './api';
import HomePage from './pages/HomePage';
import CourseListPage from './pages/CourseListPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyCoursesPage from './pages/MyCoursesPage';
import LearningPage from './pages/LearningPage';
import CertificatesPage from './pages/CertificatesPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/AdminPage';

const navItems = [
  { to: '/courses', label: 'Courses' },
  { to: '/my-courses', label: 'My Courses' },
  { to: '/certificates', label: 'Certificates' },
  { to: '/notifications', label: 'Notifications' },
  { to: '/admin', label: 'Admin' },
];

function LoginPage({ onLogin, error, loading }) {
  const [username, setUsername] = useState('student-1');
  const [password, setPassword] = useState('demo123');

  return (
    <main className="auth-wrap">
      <section className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to continue learning</h1>
        <p className="muted">Demo account is pre-filled for quick local testing.</p>
        <form className="stack" onSubmit={(e) => { e.preventDefault(); onLogin(username, password); }}>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
          {error && <p className="error">{error}</p>}
          <button className="button" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </section>
    </main>
  );
}

function Shell({ children, user, onLogout }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-lockup">
            <Link to="/" className="brand">Cloud-Native Learning Platform</Link>
            <span className="brand-sub">Professional learning, simplified</span>
          </div>

          <nav className="nav" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? 'active' : undefined)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="actions">
            <span className="badge info">{user?.name}</span>
            <button className="button secondary" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const token = getStoredToken();
    if (!token) return setChecking(false);
    api.me().then(setUser).catch(() => clearStoredToken()).finally(() => setChecking(false));
  }, []);

  const handleLogin = async (username, password) => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const result = await api.login(username, password);
      setStoredToken(result.access_token);
      setUser(result.user);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredToken();
    setUser(null);
  };

  if (checking) return <main className="auth-wrap"><section className="auth-card"><div className="pulse" /></section></main>;
  if (!user) return <LoginPage onLogin={handleLogin} error={authError} loading={authLoading} />;

  return (
    <Shell user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CourseListPage />} />
        <Route path="/courses/:courseId" element={<CourseDetailPage />} />
        <Route path="/my-courses" element={<MyCoursesPage />} />
        <Route path="/learn/:courseId" element={<LearningPage />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Shell>
  );
}

