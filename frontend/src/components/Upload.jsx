import React, { useState, useEffect, useRef } from 'react';
import swal from 'sweetalert';

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

function Upload({ token }) {
  const [title, setTitle] = useState('');
  const [trade, setTrade] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [type, setType] = useState('note');
  const [trades, setTrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    // Fetch trades from backend
    fetch(`${import.meta.env.BACKEND_URL}/trades`)
      .then(res => res.json())
      .then(data => setTrades(data))
      .catch(() => setTrades([]));
  }, []);

  useEffect(() => {
    // Fetch subjects for selected trade and semester
    if (trade && semester) {
      fetch(`${import.meta.env.BACKEND_URL}/subjects?trade=${trade}&semester=${semester}`)
        .then(res => res.json())
        .then(data => setSubjects(data))
        .catch(() => setSubjects([]));
    } else {
      setSubjects([]);
    }
  }, [trade, semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (!title || !trade || !semester || !subject || !file) {
      setError('All fields are required.');
      setLoading(false);
      return;
    }
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only PDF and image files are allowed.');
      setLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('trade', trade);
    formData.append('semester', semester);
    formData.append('subject', subject);
    formData.append('file', file);
    formData.append('type', type);
    try {
      const endpoint = type === 'pyq' ? 'pyqs/upload' : 'notes/upload';
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/${endpoint}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        swal('Success!', 'Upload successful!', 'success');
        setTitle('');
        setTrade('');
        setSemester('');
        setSubject('');
        setFile(null);
        setType('note');
        fileInputRef.current.value = '';
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 pt-28 pb-10 px-2 sm:px-0">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <div className="bg-white/90 rounded-2xl shadow-xl p-4 sm:p-8 w-full max-w-md flex flex-col items-center border border-slate-200">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-4 sm:mb-6 text-center">Upload Notes or PYQs</h2>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 sm:gap-5">
          <div>
            <label className="text-slate-700 font-semibold">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="mt-1 p-3 rounded-lg border border-slate-300 bg-slate-50 w-full focus:ring-2 focus:ring-blue-200" required>
              <option value="note">Note</option>
              <option value="pyq">PYQ</option>
            </select>
          </div>
          <div>
            <label className="text-slate-700 font-semibold">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="mt-1 p-3 rounded-lg border border-slate-300 bg-slate-50 w-full focus:ring-2 focus:ring-blue-200" required />
          </div>
          <div>
            <label className="text-slate-700 font-semibold">Trade</label>
            <select value={trade} onChange={e => setTrade(e.target.value)} className="mt-1 p-3 rounded-lg border border-slate-300 bg-slate-50 w-full focus:ring-2 focus:ring-blue-200" required>
              <option value="">Select Trade</option>
              {trades.map(t => (
                <option key={t._id} value={t._id}>{t.tradeCode} - {t.tradeName}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-slate-700 font-semibold">Semester</label>
              <select value={semester} onChange={e => setSemester(e.target.value)} className="mt-1 p-3 rounded-lg border border-slate-300 bg-slate-50 w-full focus:ring-2 focus:ring-blue-200" required>
                <option value="">Select Semester</option>
                {semesters.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-slate-700 font-semibold">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 p-3 rounded-lg border border-slate-300 bg-slate-50 w-full focus:ring-2 focus:ring-blue-200" required>
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-slate-700 font-semibold">File (PDF or Image)</label>
            <input type="file" accept="application/pdf,image/jpeg,image/png" onChange={e => setFile(e.target.files[0])} ref={fileInputRef} className="mt-1 p-3 rounded-lg border border-slate-300 bg-slate-50 w-full focus:ring-2 focus:ring-blue-200" required />
          </div>
          <button type="submit" className="mt-4 py-3 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-800 transition w-full">Upload</button>
        </form>
        {error && <div className="mt-6 text-red-600 font-semibold text-lg text-center">{error}</div>}
      </div>
    </div>
  );
}

export default Upload; 