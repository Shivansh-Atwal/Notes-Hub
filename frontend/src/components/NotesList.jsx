import React, { useState } from 'react';
import NotePreview from './NotePreview';
import axios from 'axios';

const NotesList = ({ notes }) => {
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePreview = async (noteId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/notes/preview/${noteId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSelectedNote(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load preview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notes-list">
      {error && <div className="error-message">{error}</div>}
      
      <div className="notes-grid">
        {notes.map(note => (
          <div key={note._id} className="note-card">
            <h3>{note.title}</h3>
            <p>Type: {note.fileType}</p>
            <button 
              onClick={() => handlePreview(note._id)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'View'}
            </button>
          </div>
        ))}
      </div>

      {selectedNote && (
        <NotePreview 
          note={selectedNote} 
          onClose={() => setSelectedNote(null)} 
        />
      )}
    </div>
  );
};

export default NotesList;