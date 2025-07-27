import React, { useState, useEffect } from 'react';

const PYQPreview = ({ pyq, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const loadPreviewUrl = async () => {
      try {
        const url = pyq.fileUrl;
        setPreviewUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Error loading preview:', err);
        setError('Failed to load document preview');
        setLoading(false);
      }
    };

    loadPreviewUrl();
  }, [pyq]);

  const renderPreview = () => {
    if (!previewUrl) return null;

    const fileExtension = previewUrl.split('.').pop().toLowerCase();
    
    if (fileExtension === 'pdf') {
      return (
        <div className="w-full h-full">
          <iframe
            src={previewUrl}
            title={pyq.title}
            width="100%"
            height="550vh"
            className="rounded-lg"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Failed to load PDF');
            }}
          />
        </div>
      );
    } else if (['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      return (
        <div className="flex justify-center items-center h-full">
          <img
            src={previewUrl}
            alt={pyq.title}
            className="max-h-[80vh] w-auto mx-auto rounded-lg object-contain"
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError('Failed to load image');
            }}
          />
        </div>
      );
    }
    
    return <div className="text-red-500 text-center">Unsupported file type</div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl p-4 w-[95%] max-w-7xl h-[80vh] flex flex-col mt-15">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-xl font-bold text-blue-800">{pyq.title}</h3>
            {pyq.subject && (
              <p className="text-sm text-blue-600">
                {pyq.subject.name} - Year: {pyq.year}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Preview Content */}
        <div className="relative flex-1 overflow-auto h-full">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg mb-4">
              {error}
            </div>
          )}
          {!loading && !error && renderPreview()}
        </div>

        {/* Download Button */}
        <div className="mt-2 flex justify-end">
          <a
            href={previewUrl}
            download={pyq.title}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default PYQPreview;

