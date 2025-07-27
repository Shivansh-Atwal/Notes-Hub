import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'OTP sent to your email.');
        setShowOtp(true);
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'Password reset successful.');
        setShowOtp(false);
        setEmail('');
        setOtp('');
        setNewPassword('');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'OTP resent to your email.');
      } else {
        setError(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = {
    length: newPassword.length >= 8,
    lowercase: /[a-z]/.test(newPassword),
    uppercase: /[A-Z]/.test(newPassword),
    digit: /\d/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };
  const allPasswordValid = Object.values(passwordChecks).every(Boolean);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-50 px-2 sm:px-0">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid rounded-full animate-spin"></div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-xl p-3 xs:p-4 sm:p-8 w-full max-w-xs xs:max-w-sm sm:max-w-md flex flex-col items-center border border-slate-200">
        <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">Forgot Password</h2>
        {!showOtp ? (
          <>
            <p className="mb-4 text-slate-600 text-center">Enter your registered email to receive an OTP for password reset.</p>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              <label htmlFor="email" className="text-slate-700 font-medium text-sm xs:text-base">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="p-2 xs:p-2.5 sm:p-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:border-blue-600 text-sm xs:text-base"
              />
              <button type="submit" disabled={loading} className="mt-2 py-2 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base">{loading ? 'Sending...' : 'Send OTP'}</button>
            </form>
          </>
        ) : (
          <>
            <p className="mb-4 text-slate-600 text-center">Enter the OTP sent to your email and set a new password.</p>
            <form onSubmit={handleOtpSubmit} className="w-full flex flex-col gap-3">
              <label htmlFor="otp" className="text-slate-700 font-medium text-sm xs:text-base">OTP</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                required
                className="p-2 xs:p-2.5 sm:p-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:border-blue-600 text-sm xs:text-base"
              />
              <label htmlFor="newPassword" className="text-slate-700 font-medium text-sm xs:text-base">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                className="p-2 xs:p-2.5 sm:p-3 rounded-md border border-slate-300 bg-slate-50 focus:outline-none focus:border-blue-600 text-sm xs:text-base"
              />
              <div className="mt-2 mb-1 text-left space-y-1 text-xs xs:text-sm sm:text-base">
                <PasswordRequirement met={passwordChecks.length} text="At least 8 characters" />
                <PasswordRequirement met={passwordChecks.lowercase} text="At least one lowercase letter" />
                <PasswordRequirement met={passwordChecks.uppercase} text="At least one uppercase letter" />
                <PasswordRequirement met={passwordChecks.digit} text="At least one digit" />
                <PasswordRequirement met={passwordChecks.special} text="At least one special character" />
              </div>
              <button type="submit" disabled={loading || !allPasswordValid} className="mt-2 py-2 bg-blue-700 text-white rounded-md font-semibold hover:bg-blue-900 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base">{loading ? 'Resetting...' : 'Reset Password'}</button>
              <button type="button" onClick={handleResendOtp} disabled={loading} className="mt-1 py-2 bg-slate-200 text-blue-700 rounded-md font-semibold hover:bg-blue-100 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm xs:text-base">{loading ? 'Resending...' : 'Resend OTP'}</button>
            </form>
          </>
        )}
        {message && (
          <div className="success-message mt-4 text-green-700 text-center">
            {message}
            {message.toLowerCase().includes('successful') && (
              <div className="mt-2">
                <Link to="/login" className="text-blue-700 underline">Back to Login</Link>
              </div>
            )}
          </div>
        )}
        {error && <div className="error-message mt-4 text-red-600 text-center">{error}</div>}
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

export default ForgotPassword; 