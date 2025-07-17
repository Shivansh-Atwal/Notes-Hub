import React, { useState, useEffect } from 'react';

function Notes({ token }) {
  const [trades, setTrades] = useState([]);
  const [trade, setTrade] = useState(''); // tradeCode
  const [semester, setSemester] = useState('');
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyId, setVerifyId] = useState(null);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    // Fetch trades for dropdown
    fetch('http://localhost:3000/trades')
      .then(res => res.json())
      .then(data => setTrades(data))
      .catch(() => setTrades([]));
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const fetchNotes = async (tradeCode = '', semesterValue = '') => {
    setLoading(true);
    setError('');
    let url = 'http://localhost:3000/notes?';
    if (tradeCode) url += `tradeCode=${tradeCode}&`;
    if (semesterValue) url += `semester=${semesterValue}&`;
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch notes');
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      setError('Could not fetch notes.');
      setNotes([]);
    }
    setLoading(false);
  };

  // On initial load, fetch all notes
  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line
  }, []);

  // When trade or semester changes, fetch filtered notes
  useEffect(() => {
    if (!trade && !semester) {
      fetchNotes();
    } else {
      fetchNotes(trade, semester);
    }
    // eslint-disable-next-line
  }, [trade, semester]);

  // Handler for trade selection
  const handleTradeChange = (e) => {
    setTrade(e.target.value);
  };

  const handleSemesterChange = (e) => {
    setSemester(e.target.value);
  };

  const handleDelete = (id) => {
    setVerifyId(id);
    setShowVerify(true);
    setAdminCodeInput('');
    setVerifyError('');
  };

  const handleVerifySubmit = async () => {
    if (!adminCodeInput) {
      setVerifyError('Verification code required.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/notes/${verifyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ adminCode: adminCodeInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotes(notes.filter(n => n._id !== verifyId));
        setShowVerify(false);
      } else {
        setVerifyError(data.error || 'Delete failed');
      }
    } catch (err) {
      setVerifyError('Delete failed');
    }
    setLoading(false);
  };

  const handleVerifyCancel = () => {
    setShowVerify(false);
    setAdminCodeInput('');
    setVerifyError('');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-100 pt-20 sm:pt-32 pb-6 sm:pb-10 px-2 sm:px-0">
      {/* Outer blurred border effect */}
      <div className="relative w-full flex justify-center items-center">
        <div className="absolute inset-0 z-0 rounded-3xl pointer-events-none" style={{ filter: 'blur(18px)', boxShadow: '0 0 0 8px rgba(59,130,246,0.15), 0 0 40px 8px rgba(59,130,246,0.10)' }}></div>
        <div className="relative z-10 w-full max-w-6xl flex flex-col justify-center items-center">
          {/* Hero Section */}
          <div className="max-w-2xl w-full flex flex-col items-center justify-center text-center mb-6 sm:mb-10 px-2 sm:px-0 min-h-[160px]">
            <div className="flex flex-col items-center justify-center h-full w-full">
              <span className="text-4xl xs:text-5xl sm:text-6xl mb-2" role="img" aria-label="notes">📝</span>
              <h1 className="text-2xl xs:text-3xl sm:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow-lg leading-tight">Browse All Notes</h1>
              <span className="text-blue-700 font-semibold text-sm xs:text-base sm:text-lg">Find, view, and download notes for every subject and semester</span>
            </div>
          </div>
          {/* Filter Card and Notes Grid (existing content) */}
          <div className={showVerify ? 'filter blur-sm pointer-events-none select-none w-full flex justify-center' : 'w-full flex justify-center'}>
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 xs:p-4 sm:p-8 w-full max-w-5xl flex flex-col items-center border border-blue-200 mb-8 mx-auto">
              <div className="w-full flex flex-row xs:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 justify-center items-center">
                <div className="w-1/2 xs:w-1/2">
                  <select value={trade} onChange={handleTradeChange} className="p-2 sm:p-3 rounded-lg border border-slate-300 bg-slate-50 w-full">
                    <option value="">All Trades</option>
                    {trades.map(t => (
                      <option key={t._id} value={t.tradeCode}>{t.tradeCode}</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/2 xs:w-1/2">
                  <select value={semester} onChange={handleSemesterChange} className="p-2 sm:p-3 rounded-lg border border-slate-300 bg-slate-50 w-full">
                    <option value="">All Semesters</option>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              {loading ? (
                <div className="text-blue-600 font-semibold text-center w-full">Loading...</div>
              ) : error ? (
                <div className="text-red-600 font-semibold text-center w-full">{error}</div>
              ) : notes.length === 0 ? (
                <div className="text-slate-500 text-center w-full">No notes found.</div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 w-full justify-items-center">
                  {notes.map(note => (
                    <div
                      key={note._id}
                      className="relative bg-gradient-to-br from-white via-blue-50 to-slate-100 border-l-8 border-blue-500 rounded-2xl shadow-xl p-4 sm:p-7 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl group mb-2 mt-2 w-full max-w-xs mx-auto"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-xl sm:text-2xl font-bold text-blue-800 group-hover:text-blue-900 transition-colors">{note.title}</div>
                          <span className="ml-auto px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                            {note.subject?.code ? `${note.subject.code}` : ''}
                          </span>
                        </div>
                        <div className="text-slate-600 text-xs sm:text-sm mb-1 flex items-center gap-2">
                          <span className="font-semibold">Trade:</span> <span className="text-blue-700">{note.trade?.tradeName || note.trade}</span>
                        </div>
                        <div className="text-slate-600 text-xs sm:text-sm mb-1 flex items-center gap-2">
                          <span className="font-semibold">Semester:</span> <span className="text-blue-700">{note.semester}</span>
                        </div>
                        <div className="text-slate-600 text-xs sm:text-sm mb-3 flex items-center gap-2">
                          <span className="font-semibold">Subject:</span> <span className="text-blue-700">{note.subject?.name || note.subject}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        <a
                          href={note.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-800 transition shadow-md hover:shadow-lg"
                        >
                          View
                        </a>
                        {user && user.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(note._id)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-700 transition shadow-md hover:shadow-lg"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* Overlay */}
          {showVerify && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl p-6 w-80 flex flex-col items-center gap-4" style={{ boxShadow: '0 0 24px 8px rgba(239,68,68,0.5), 0 0 0 4px #ef4444, 0 10px 25px rgba(0,0,0,0.1)' }}>
                <h3 className="text-lg font-bold text-blue-700 mb-2">Admin Verification</h3>
                <input
                  type="password"
                  value={adminCodeInput}
                  onChange={e => setAdminCodeInput(e.target.value)}
                  placeholder="Enter admin code"
                  className="p-3 rounded-lg border border-slate-300 bg-slate-50 w-full focus:outline-none focus:border-blue-600"
                />
                {verifyError && <div className="text-red-600 text-sm font-semibold text-center">{verifyError}</div>}
                <div className="flex gap-3 mt-2">
                  <button onClick={handleVerifySubmit} className="px-4 py-2 bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-900 transition">Verify & Delete</button>
                  <button onClick={handleVerifyCancel} className="px-4 py-2 bg-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-400 transition">Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes; 