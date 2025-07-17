import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Signup from './components/Signup';
import Login from './components/Login';
import Upload from './components/Upload';
import Notes from './components/Notes';
import LandingPage from './components/LandingPage';
import Pyqs from './components/Pyqs';
import SubjectInsert from './components/SubjectInsert';

function UploadPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 pt-32 pb-10">
      <h2 className="text-3xl font-bold text-blue-700 mb-6">Upload Notes or PYQs</h2>
      <p className="text-slate-600">(Upload form goes here...)</p>
    </div>
  );
}

// ProtectedRoute component
function ProtectedRoute({ token, children }) {
  const [showMessage, setShowMessage] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  if (!token) {
    return (
      <div>
        {/* Blurred background overlay */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.2)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
        }} />
        {/* Centered alert message */}
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#f87171',
          color: 'white',
          padding: '32px 40px',
          borderRadius: '18px',
          textAlign: 'center',
          zIndex: 1001,
          fontWeight: 'bold',
          fontSize: '1.25rem',
          letterSpacing: '0.5px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
          minWidth: '320px',
        }}>
          Please login to access this page.<br />Redirecting to login...
        </div>
      </div>
    );
  }
  return children;
}

function AppWrapper() {
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken) setToken(savedToken);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);



  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, [token]);

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      {location.pathname !== '/login' && location.pathname !== '/signup' && (
        <Navbar
          onLogin={() => navigate('/login')}
          onSignup={() => navigate('/signup')}
          user={user}
          onLogout={handleLogout}
          onUpload={() => navigate('/upload')}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup setToken={setToken} />} />
        <Route path="/upload" element={
          <ProtectedRoute token={token}>
            <Upload token={token} />
          </ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute token={token}>
            <Notes token={token} />
          </ProtectedRoute>
        } />
        <Route path="/pyqs" element={
          <ProtectedRoute token={token}>
            <Pyqs token={token} />
          </ProtectedRoute>
        } />
        <Route path="/subject-insert" element={
          <ProtectedRoute token={token}>
            {user && user.role === 'admin' ? <SubjectInsert /> : null}
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  // Initialize token from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');

  // When token changes, update localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;