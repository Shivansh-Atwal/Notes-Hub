import React, { useState, useEffect } from 'react';
import PYQPreview from './PYQPreview';

function PYQ({ token, user }) {
  const [trades, setTrades] = useState([]);
  const [trade, setTrade] = useState('');
  const [semester, setSemester] = useState('');
  const [pyqs, setPYQs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPYQ, setSelectedPYQ] = useState(null);
  const [showVerify, setShowVerify] = useState(false);
  const [verifyId, setVerifyId] = useState(null);
  const [adminCodeInput, setAdminCodeInput] = useState('');
  const [verifyError, setVerifyError] = useState('');

  // Fetch trades for dropdown
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/trades`)
      .then(res => res.json())
      .then(data => setTrades(data))
      .catch(() => setTrades([]));
  }, []);

  const fetchPYQs = async (tradeCode = '', semesterValue = '') => {
    setLoading(true);
    setError('');
    let url = `${import.meta.env.VITE_BACKEND_URL}/pyqs?`;
    if (tradeCode) url += `tradeCode=${tradeCode}&`;
    if (semesterValue) url += `semester=${semesterValue}&`;
    try {
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to fetch PYQs');
      const data = await res.json();
      setPYQs(data);
    } catch (err) {
      setError('Could not fetch PYQs.');
      setPYQs([]);
    }
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    fetchPYQs();
  }, []);

  // Filter changes
  useEffect(() => {
    if (!trade && !semester) {
      fetchPYQs();
    } else {
      fetchPYQs(trade, semester);
    }
  }, [trade, semester]);

  const handlePreview = async (pyq) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/pyqs/preview/${pyq._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) throw new Error('Failed to get preview URL');
      
      const data = await res.json();
      setSelectedPYQ({
        ...pyq,
        secureUrl: data.url 
      });
    } catch (err) {
      console.error('Preview error:', err);
      setError('Failed to load preview. Please try again.');
    }
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
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/pyqs/${verifyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ adminCode: adminCodeInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setPYQs(pyqs.filter(p => p._id !== verifyId));
        setShowVerify(false);
      } else {
        setVerifyError(data.error || 'Delete failed');
      }
    } catch (err) {
      setVerifyError('Delete failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-baseline bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-100 pt-20 sm:pt-32 pb-6 sm:pb-10 px-2 sm:px-0">
      <div className="relative w-full flex justify-center items-center">
        <div className="absolute inset-0 z-0 rounded-3xl pointer-events-none" 
             style={{ filter: 'blur(18px)', boxShadow: '0 0 0 8px rgba(59,130,246,0.15), 0 0 40px 8px rgba(59,130,246,0.10)' }}>
        </div>
        <div className="relative z-10 w-full max-w-6xl flex flex-col justify-center items-center">
          {/* Hero Section */}
          <div className="max-w-2xl w-full flex flex-col items-center justify-center text-center mb-1 sm:mb-10 px-2 sm:px-0 min-h-[160px]">
            <div className="flex flex-col items-center justify-center h-full w-full">
              <span className="text-4xl xs:text-5xl sm:text-6xl mb-2" role="img" aria-label="pyq">📝</span>
              <h1 className="text-2xl xs:text-3xl sm:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow-lg leading-tight">
                Previous Year Questions
              </h1>
              <span className="text-blue-700 font-semibold text-sm xs:text-base sm:text-lg">
                Access previous year question papers for every subject
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className={showVerify ?'filter blur-sm pointer-events-none select-none w-full flex justify-center' : 'w-full flex justify-center'}>
            {/* Filters */}
            <div className="bg-white/90 rounded-2xl shadow-xl p-8 xs:p-4 sm:p-8 w-full max-w-5xl flex flex-col items-center border border-blue-200 mb-8 mx-auto">
              <div className="w-full flex flex-row xs:flex-row gap-2 sm:gap-4 mb-4 sm:mb-6 justify-center items-center">
              <div className="w-1/2 xs:w-1/2">
                <select
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="p-2 sm:p-3 rounded-lg border border-slate-300 bg-slate-50 w-full"
                >
                  <option value="">All Trades</option>
                  {trades.map(t => (
                    <option key={t._id} value={t.tradeCode}>{t.tradeCode}</option>
                  ))}
                </select>
                </div>
              <div className="w-1/2 xs:w-1/2">
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="p-2 sm:p-3 rounded-lg border border-slate-300 bg-slate-50 w-full"
                >
                  <option value="">All Semesters</option>
                  {[1,2,3,4,5,6,7,8].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              </div>
              

              {/* PYQ Cards */}
              {loading ? (
                <div className="text-center mt-8">Loading...</div>
              ) : error ? (
                <div className="text-red-500 text-center mt-8">{error}</div>
              ) : pyqs.length === 0 ? (
                <div className="text-center mt-8">No PYQs found.</div>
              ) : (
                <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5 w-full justify-items-center mt-3">
                  {pyqs.map(pyq => (
                    <div
                      key={pyq._id}
                      className="relative bg-gradient-to-br from-white via-blue-50 to-slate-100 border-l-8 border-blue-500 rounded-2xl shadow-xl p-4 sm:p-7 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl group mb-2 mt-2 w-full max-w-xs mx-auto"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="text-xl sm:text-2xl font-bold text-blue-800 group-hover:text-blue-900 transition-colors">{pyq.title}</div>
                          <span className="ml-auto px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                            {pyq.subject?.code ? `${pyq.subject.code}` : ''}
                          </span>
                        </div>
                        <div className="text-slate-600 text-xs sm:text-sm mb-1 flex items-center gap-2">
                          <span className="font-semibold">Trade:</span> <span className="text-blue-700">{pyq.trade?.tradeName || pyq.trade}</span>
                        </div>
                        <div className="text-slate-600 text-xs sm:text-sm mb-1 flex items-center gap-2">
                          <span className="font-semibold">Semester:</span> <span className="text-blue-700">{pyq.semester}</span>
                        </div>
                        <div className="text-slate-600 text-xs sm:text-sm mb-3 flex items-center gap-2">
                          <span className="font-semibold">Subject:</span> <span className="text-blue-700">{pyq.subject?.name || pyq.subject}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 mt-4">
                        <button
                          onClick={() => handlePreview(pyq)}
                          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-center hover:bg-blue-800 transition shadow-md hover:shadow-lg"
                        >
                          View
                        </button>
                        {user && user.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(pyq._id)}
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

          {/* Verification Modal */}
          {showVerify && (
            <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-xl p-6 w-80">
                <h3 className="text-lg font-bold text-blue-700 mb-4">Admin Verification</h3>
                <input
                  type="password"
                  value={adminCodeInput}
                  onChange={(e) => setAdminCodeInput(e.target.value)}
                  placeholder="Enter admin code"
                  className="w-full p-2 border rounded mb-4"
                />
                {verifyError && (
                  <p className="text-red-500 text-sm mb-4">{verifyError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={handleVerifySubmit}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowVerify(false)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Modal */}
          {selectedPYQ && (
            <PYQPreview
              pyq={selectedPYQ}
              onClose={() => setSelectedPYQ(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PYQ;