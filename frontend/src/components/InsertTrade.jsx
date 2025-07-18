import React, { useState } from 'react';

const InsertTrade = () => {
  const [tradeCode, setTradeCode] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!tradeCode || !tradeName) {
      setError('Trade code and trade name are required.');
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL || ''}/trades`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ tradeCode, tradeName })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Trade inserted successfully!');
        setTradeCode('');
        setTradeName('');
      } else {
        setError(data.error || 'Insert failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-100 to-slate-100 px-2 py-8 mt-5">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-10 flex flex-col items-center border border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-extrabold mb-6 text-blue-700 text-center">Insert New Trade</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Trade Code</label>
            <input
              type="text"
              value={tradeCode}
              onChange={e => setTradeCode(e.target.value)}
              className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg transition bg-slate-50"
              placeholder="e.g., GCS"
              required
            />
          </div>
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Trade Name</label>
            <input
              type="text"
              value={tradeName}
              onChange={e => setTradeName(e.target.value)}
              className="w-full border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg transition bg-slate-50"
              placeholder="e.g., Computer Science"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-900 transition"
          >
            Insert Trade
          </button>
        </form>
        {message && <div className="mt-6 text-green-600 font-semibold text-lg text-center">{message}</div>}
        {error && <div className="mt-6 text-red-600 font-semibold text-lg text-center">{error}</div>}
        <div className="mt-8 w-full bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm text-center">
          <strong>Note:</strong> Trade code should be a short code like <span className="font-mono">GCS</span> and trade name should be descriptive like <span className="font-mono">Computer Science</span>.
        </div>
      </div>
    </div>
  );
};

export default InsertTrade;