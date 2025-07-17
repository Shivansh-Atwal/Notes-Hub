import React, { useState, useEffect } from 'react';
import Select from 'react-select';

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const SubjectInsert = () => {
  const [name, setName] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [selectedTrades, setSelectedTrades] = useState([]); // Array of { value, label }
  const [semester, setSemester] = useState('');
  const [trades, setTrades] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/trades')
      .then(res => res.json())
      .then(data => setTrades(data))
      .catch(() => setTrades([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!name || !subjectCode || selectedTrades.length === 0 || !semester) {
      setError('Subject code, name, at least one trade, and semester are required.');
      return;
    }
    try {
      const tradeIds = selectedTrades.map(t => t.value);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: subjectCode, name, trade: tradeIds, semester })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Subject inserted successfully!');
        setName('');
        setSubjectCode('');
        setSelectedTrades([]);
        setSemester('');
      } else {
        setError(data.error || 'Insert failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // Prepare options for react-select
  const tradeOptions = trades.map(t => ({ value: t._id, label: t.tradeCode + ' - ' + t.tradeName }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-100">
      <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-10 w-full max-w-lg flex flex-col items-center border border-slate-200 mt-24">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-8 tracking-tight">Insert New Subject</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div>
            <label className="text-slate-700 font-semibold">Subject Code</label>
            <input type="text" value={subjectCode} onChange={e => setSubjectCode(e.target.value)} className="mt-1 p-3 rounded-lg border border-slate-300 bg-slate-50 w-full" required />
          </div>
          <div>
            <label className="text-slate-700 font-semibold">Subject Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 p-3 rounded-lg border border-slate-300 bg-slate-50 w-full" required />
          </div>
          <div>
            <label className="text-slate-700 font-semibold">Trade Code(s)</label>
            <Select
              isMulti
              options={tradeOptions}
              value={selectedTrades}
              onChange={setSelectedTrades}
              classNamePrefix="react-select"
              placeholder="Select one or more trades..."
            />
          </div>
          <div>
            <label className="text-slate-700 font-semibold">Semester</label>
            <select value={semester} onChange={e => setSemester(e.target.value)} className="mt-1 p-3 rounded-lg border border-slate-300 bg-slate-50 w-full" required>
              <option value="">Select Semester</option>
              {semesters.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="mt-6 py-3 bg-blue-700 text-white rounded-xl font-bold text-lg hover:bg-blue-900 transition">Insert Subject</button>
        </form>
        {message && <div className="mt-6 text-green-600 font-semibold text-lg">{message}</div>}
        {error && <div className="mt-6 text-red-600 font-semibold text-lg">{error}</div>}
      </div>
    </div>
  );
};

export default SubjectInsert; 