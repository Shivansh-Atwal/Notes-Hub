import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Signup = ({ setToken, setUser }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading,setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordChecks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const allPasswordValid = Object.values(passwordChecks).every(Boolean);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    if (!username || !email || !password) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (!/^[\d]+@sliet\.ac\.in$/.test(email)) {
      setError('Email must be a valid college email (e.g., 2341045@sliet.ac.in).');
      setLoading(false);
      return;
    }
    if (!allPasswordValid) {
      setError('Password does not meet all requirements.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        setShowOtp(true);
        setUsername('');
        setPassword('');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        if (data.token) {
          if (setToken) setToken(data.token);
          localStorage.setItem('token', data.token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          if (setUser) setUser(data.user);
          // Dispatch custom event to notify other components
          window.dispatchEvent(new Event('userStateChanged'));
        }
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.error || 'OTP verification failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-50 px-2 sm:px-0">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-xl p-3 xs:p-4 sm:p-8 w-full max-w-xs xs:max-w-sm sm:max-w-md flex flex-col items-center border border-slate-200">
        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-blue-700 mb-3 xs:mb-4 sm:mb-6 text-center">Sign Up</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2 xs:gap-2.5 sm:gap-3">
          <label className="text-slate-700 font-medium text-sm xs:text-base">Username</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            className="p-2 xs:p-2.5 sm:p-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:border-blue-600 text-sm xs:text-base"
          />
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
          {/* Password Requirements with Custom Checkbox Design */}
          <div className="mt-2 mb-1 text-left space-y-1 text-xs xs:text-sm sm:text-base">
            <PasswordRequirement
              met={passwordChecks.length}
              text="At least 8 characters"
            />
            <PasswordRequirement
              met={passwordChecks.lowercase}
              text="At least one lowercase letter"
            />
            <PasswordRequirement
              met={passwordChecks.uppercase}
              text="At least one uppercase letter"
            />
            <PasswordRequirement
              met={passwordChecks.digit}
              text="At least one digit"
            />
            <PasswordRequirement
              met={passwordChecks.special}
              text="At least one special character"
            />
          </div>
          <button type="submit" className="mt-2 sm:mt-4 py-2 xs:py-2.5 sm:py-3 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base" disabled={!allPasswordValid || loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
        </form>
        {showOtp && (
          <form onSubmit={handleOtpSubmit} className="w-full flex flex-col gap-2 mt-4">
            <label className="text-slate-700 font-medium text-sm xs:text-base">Enter OTP sent to your email</label>
            <input
              type="text"
              placeholder="6-digit OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              maxLength={6}
              className="p-2 xs:p-2.5 sm:p-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:border-blue-600 text-sm xs:text-base"
              disabled={loading}
            />
            <button type="submit" className="py-2 xs:py-2.5 sm:py-3 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
          </form>
        )}
        <div className="mt-4 sm:mt-5 text-slate-600 text-xs xs:text-sm sm:text-base text-center">
          Already have an account? <Link to="/login" className="text-blue-700 underline">Login</Link>
        </div>
        {message && <div className="mt-4 text-green-600 font-medium text-center text-sm xs:text-base">{message}</div>}
        {error && <div className="mt-4 text-red-600 font-medium text-center text-sm xs:text-base">{error}</div>}
      </div>
    </div>
  );
};

function PasswordRequirement({ met, text }) {
  return (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      <span
        className={`inline-flex items-center justify-center w-5 h-5 rounded border-2 transition-all duration-200 ${
          met
            ? 'bg-green-500 border-green-500 text-white'
            : 'bg-white border-slate-300 text-slate-400'
        }`}
      >
        {met ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 8.5L7 11.5L12 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <span className="block w-2 h-2 rounded-full bg-slate-300"></span>
        )}
      </span>
      <span className={met ? 'text-green-700 font-medium' : 'text-slate-500'}>{text}</span>
    </div>
  );
}

export default Signup; 