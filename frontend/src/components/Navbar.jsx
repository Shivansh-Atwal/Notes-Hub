import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar({ onLogin, onSignup, user, onLogout, onUpload }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on navigation
  const handleSidebarNav = (cb) => {
    setSidebarOpen(false);
    if (cb) cb();
  };

  return (
    <>
      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 backdrop-blur-sm z-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar Drawer for mobile */}
      <div className={`fixed top-0 right-0 h-full w-60 bg-white shadow-xl z-50 rounded-l-xl transform transition-all duration-300 sm:hidden mt-15 ${sidebarOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}> 
        <div className="flex flex-col h-full overflow-y-auto">
          {user && (
            <div className="pt-8 pb-4 px-6 text-center">
              <div className="text-base text-slate-500 font-medium flex items-center justify-center gap-1">👋 Welcome back,</div>
              <div className="mt-1 text-2xl font-bold text-blue-700 leading-tight">{user.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'User'}</div>
            </div>
          )}
          <div className="flex flex-col gap-3 px-6 pb-8 pt-2">
            <Link to="/" onClick={() => handleSidebarNav()} className="text-blue-700 font-medium px-3 py-2 rounded hover:bg-blue-100/70 transition w-full text-left text-base">Home</Link>
            <Link to="/notes" onClick={() => handleSidebarNav()} className="text-blue-700 font-medium px-3 py-2 rounded hover:bg-blue-100/70 transition w-full text-left text-base">Notes</Link>
            <Link to="/pyqs" onClick={() => handleSidebarNav()} className="text-blue-700 font-medium px-3 py-2 rounded hover:bg-blue-100/70 transition w-full text-left text-base">PYQs</Link>
            {user && user.role === 'admin' && (
              <Link to="/subject-insert" onClick={() => handleSidebarNav()} className="text-green-700 font-medium px-3 py-2 rounded hover:bg-green-100/70 transition w-full text-left text-base">+ Add Subject</Link>
            )}
            <button onClick={() => handleSidebarNav(onUpload)} className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-800 transition w-full text-base">
              <span role="img" aria-label="upload">⬆️</span> Upload
            </button>
            {user ? (
              <>
                <button onClick={() => handleSidebarNav(onLogout)} className="px-4 py-2 rounded bg-orange-500 text-white font-semibold hover:bg-orange-700 transition w-full text-base" title="Logout">
                  <span className="inline-block align-middle">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24" className="inline-block"><path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 12H9m9 0-2.25-2.25M18 12l-2.25 2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => handleSidebarNav(onLogin)} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-800 transition w-full text-base">Login</button>
                <button onClick={() => handleSidebarNav(onSignup)} className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-700 transition w-full text-base">Sign Up</button>
              </>
            )}
          </div>
        </div>
      </div>
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 border-b border-slate-200 shadow flex items-center justify-between px-5 sm:px-8 py-3">
        {/* Left: Logo/Brand */}
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label="book">📖</span>
          <span className="text-2xl font-bold text-blue-700 tracking-tight">Notes & PYQs Hub</span>
        </div>
        {/* Hamburger for mobile (opens sidebar) */}
        <button
          className="sm:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Open sidebar"
        >
          <span className="text-2xl">☰</span>
        </button>
        {/* Center: Navigation Links (desktop only) */}
        <div className="gap-6 items-center hidden sm:flex"> 
          <Link to="/" className="text-blue-700 font-medium px-3 py-2 rounded hover:bg-blue-100/70 transition">Home</Link>
          <Link to="/notes" className="text-blue-700 font-medium px-3 py-2 rounded hover:bg-blue-100/70 transition">Notes</Link>
          <Link to="/pyqs" className="text-blue-700 font-medium px-3 py-2 rounded hover:bg-blue-100/70 transition">PYQs</Link>
          {user && user.role === 'admin' && (
            <Link to="/subject-insert" className="text-green-700 font-medium px-3 py-2 rounded hover:bg-green-100/70 transition">+ Add Subject</Link>
          )}
        </div>
        {/* Right: Auth/Profile/Upload Buttons (desktop only) */}
        <div className="gap-2 items-center hidden sm:flex">
          <button
            onClick={onUpload}
            className="p-2 rounded-full bg-blue-50 hover:bg-blue-200 text-blue-700 transition flex items-center justify-center"
            title="Upload"
          >
            <span className="text-xl" role="img" aria-label="upload">⬆️</span>
          </button>
          {user ? (
            <>
              <button
                className="p-2 rounded-full bg-purple-50 hover:bg-purple-200 text-purple-700 transition flex items-center justify-center"
                title={user.username || user.email || 'Profile'}
              >
                <span className="text-xl" role="img" aria-label="user">👤</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-full bg-orange-50 hover:bg-orange-200 text-orange-700 transition flex items-center justify-center"
                title="Logout"
              >
                <span className="inline-block align-middle" aria-label="logout">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="24" height="24" className="inline-block"><path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18 12H9m9 0-2.25-2.25M18 12l-2.25 2.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
              </button>
            </>
          ) : (
            <>
              <button onClick={onLogin} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-800 transition">Login</button>
              <button onClick={onSignup} className="px-4 py-2 rounded bg-blue-500 text-white font-semibold hover:bg-blue-700 transition">Sign Up</button>
            </>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navbar;