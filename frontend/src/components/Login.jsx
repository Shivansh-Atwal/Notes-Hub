import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setEmail('');
        setPassword('');
        if (setToken && data.token) {
          setToken(data.token);
          console.log('Logged in token:', data.token);
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-50 px-2 sm:px-0">
      <div className="bg-white rounded-2xl shadow-xl p-3 xs:p-4 sm:p-8 w-full max-w-xs xs:max-w-sm sm:max-w-md flex flex-col items-center">
        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-700 mb-3 xs:mb-4 sm:mb-6">Login</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2 xs:gap-2.5 sm:gap-3">
          <label className="text-slate-700 font-medium text-sm xs:text-base">Email</label>
          <input
            type="email"
            placeholder="College Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="p-2 xs:p-2.5 sm:p-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:border-blue-600 text-sm xs:text-base"
          />
          <label className="text-slate-700 font-medium text-sm xs:text-base">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="p-2 xs:p-2.5 sm:p-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:border-blue-600 text-sm xs:text-base"
          />
          <button type="submit" className="mt-2 sm:mt-4 py-2 xs:py-2.5 sm:py-3 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-900 transition text-sm xs:text-base">Login</button>
        </form>
        <div className="mt-4 sm:mt-5 text-slate-600 text-xs xs:text-sm sm:text-base">
          Don&apos;t have an account? <Link to="/signup" className="text-blue-700 underline">Sign Up</Link>
        </div>
        {message && <div className="mt-4 text-green-600 font-medium text-sm xs:text-base">{message}{message === 'Login successful.' && <span> Redirecting to home...</span>}</div>}
        {error && <div className="mt-4 text-red-600 font-medium text-sm xs:text-base">{error}</div>}
      </div>
    </div>
  );
};

export default Login; 