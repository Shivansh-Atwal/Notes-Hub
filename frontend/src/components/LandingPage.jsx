import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '🔍', title: 'Smart Search', desc: 'Find notes and PYQs by trade, stream, or subject in seconds.' },
  { icon: '📚', title: 'All-in-One Notes', desc: 'Access a curated collection of notes for every subject and semester.' },
  { icon: '📄', title: 'PYQs', desc: 'Practice with previous year questions, organized by trade and subject.' },
  { icon: '⬆️', title: 'Easy Uploads', desc: 'Upload your own notes and PYQs in PDF or JPEG format to help others.' },
  { icon: '💡', title: 'Student Friendly', desc: 'Clean, distraction-free interface designed for students.' },
  { icon: '📱', title: 'Mobile Ready', desc: 'Use the platform on any device, anywhere, anytime.' },
];

const testimonials = [
  { name: 'Shivansh Atwal', role: 'Computer Science', text: 'Found all my semester notes here! Saved me hours of searching.' },
  { name: 'Simrandeep Singh', role: 'Electronics', text: 'The PYQs section is gold! Helped me ace my exams.' },
  { name: 'Satvik Chauhan', role: 'Mechanical', text: 'Uploaded my notes and helped 50+ students. Great community!' },
  { name: 'Brinder Preet Singh', role: 'Electrical', text: 'Clean interface, easy to use. Exactly what students need.' },
];

const LandingPage = ({ user: propUser }) => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Use prop user if available, otherwise check localStorage
    if (propUser) {
      setUser(propUser);
    } else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) setUser(JSON.parse(savedUser));
    }
  }, [propUser]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleUserChange = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    };

    // Listen for custom user change events
    window.addEventListener('userStateChanged', handleUserChange);
    
    // Also listen for storage changes (for cross-tab sync)
    window.addEventListener('storage', handleUserChange);
    
    return () => {
      window.removeEventListener('userStateChanged', handleUserChange);
      window.removeEventListener('storage', handleUserChange);
    };
  }, []);

  const nextTestimonial = () => setTestimonialIdx((testimonialIdx + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIdx((testimonialIdx - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-100 pt-20 sm:pt-32 pb-6 sm:pb-10 px-2 sm:px-0 relative overflow-x-hidden">
      {/* Animated background shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full animate-gradient bg-gradient-to-br from-blue-100 via-indigo-100 to-slate-100 opacity-80" />
        <div className="absolute left-1/4 top-1/3 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30 animate-pulse-slow" />
        <div className="absolute right-1/4 bottom-1/4 w-80 h-80 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse-slow" />
      </div>
      {/* Hero Section */}
      <div className="max-w-2xl w-full text-center mb-8 sm:mb-14 px-2 sm:px-0">
        <div className="flex flex-col items-center mb-3 sm:mb-4">
          <span className="text-5xl xs:text-6xl sm:text-7xl mb-2 drop-shadow-lg" role="img" aria-label="campus">🎓</span>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow-lg leading-tight tracking-tight">SLIET Student Success Hub</h1>
          <span className="text-blue-700 font-semibold text-base xs:text-lg sm:text-xl">Notes, PYQs, and More for Every SLIETian</span>
        </div>
        {user && (
          <div className="mb-2 text-lg sm:text-xl font-semibold text-blue-800">Welcome back, {user.username}! 🚀</div>
        )}
        <p className="text-base xs:text-lg sm:text-xl text-slate-700 mb-6 sm:mb-10 font-medium">Your one-stop platform to <span className="text-blue-700 font-bold">find</span>, <span className="text-blue-700 font-bold">share</span>, and <span className="text-blue-700 font-bold">succeed</span> at SLIET.</p>
        {!user ? (
          <button
            className="w-full sm:w-auto px-8 sm:px-14 py-3 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-500 to-blue-400 text-white font-bold text-lg sm:text-xl shadow-xl hover:scale-105 hover:from-blue-900 hover:to-blue-600 transition-all duration-200"
            onClick={() => navigate('/signup')}
          >
            Join the Community
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-2">
            <button
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-500 to-blue-400 text-white font-bold text-lg shadow-lg hover:scale-105 hover:from-blue-900 hover:to-blue-600 transition-all duration-200"
              onClick={() => navigate('/upload')}
            >
              Upload Notes/PYQs
            </button>
            <button
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-slate-200 via-blue-100 to-slate-50 text-blue-700 font-bold text-lg shadow-lg hover:scale-105 hover:bg-blue-100 transition-all duration-200"
              onClick={() => navigate('/notes')}
            >
              Search Notes
            </button>
            <button
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-slate-200 via-blue-100 to-slate-50 text-blue-700 font-bold text-lg shadow-lg hover:scale-105 hover:bg-blue-100 transition-all duration-200"
              onClick={() => navigate('/pyqs')}
            >
              Search PYQs
            </button>
          </div>
        )}
      </div>
      {/* Modern Glassmorphic Features Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-6 xs:gap-8 sm:gap-12 justify-center mb-10 w-full max-w-6xl px-1 xs:px-2 sm:px-0">
        {features.map((f, i) => (
          <div key={f.title} className={
            `relative bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-6 xs:p-8 sm:p-12 flex flex-col items-center border border-blue-100 hover:scale-105 transition-transform duration-200 group overflow-hidden` +
            (i % 2 === 0 ? ' bg-gradient-to-br from-blue-50 via-white to-blue-100' : ' bg-gradient-to-tr from-indigo-50 via-white to-blue-100')
          }>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-200 rounded-full opacity-20 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-4xl xs:text-5xl sm:text-6xl mb-3 drop-shadow-lg">{f.icon}</span>
            <h3 className="text-blue-800 font-extrabold text-lg xs:text-xl sm:text-2xl mb-2 text-center drop-shadow">{f.title}</h3>
            <p className="text-slate-700 text-center text-base xs:text-lg sm:text-xl font-medium drop-shadow-sm">{f.desc}</p>
          </div>
        ))}
      </div>
      
      {/* Testimonials Section */}
      <div className="w-full max-w-4xl px-4 sm:px-6 mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 text-center mb-8">What Students Say</h2>
        <div className="relative bg-white/30 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 border border-blue-100">
          <div className="text-center mb-6">
            <p className="text-lg sm:text-xl text-slate-700 italic mb-4">"{testimonials[testimonialIdx].text}"</p>
            <div className="font-semibold text-blue-800">{testimonials[testimonialIdx].name}</div>
            <div className="text-sm text-slate-600">{testimonials[testimonialIdx].role}</div>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={prevTestimonial}
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
              aria-label="Previous testimonial"
            >
              ←
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestimonialIdx(idx)}
                  className={`w-2 h-2 rounded-full transition ${
                    idx === testimonialIdx ? 'bg-blue-600' : 'bg-blue-200'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextTestimonial}
              className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 transition"
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default LandingPage; 