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
  {
    name: 'Rohit Raj',
    avatar: 'https://res.cloudinary.com/dqfelbf0m/image/upload/v1752685276/WhatsApp_Image_2025-07-16_at_22.30.12_fc2b6937_npwtl3.jpg',
    quote: 'Even all toppers use this platform !',
    branch: 'GCS, 3rd Year',
  },
  {
    name: 'Simrandeep Singh',
    avatar: 'https://res.cloudinary.com/dqfelbf0m/image/upload/v1752685275/WhatsApp_Image_2025-07-16_at_22.29.09_7c77dc72_ykztaj.jpg',
    quote: 'All SLIET notes and PYQs in one place. Love it!',
    branch: 'GEC, 3rd Year',
  },
  {
    name: 'Rajiv Meena',
    avatar: 'https://res.cloudinary.com/dqfelbf0m/image/upload/v1752687015/WhatsApp_Image_2025-07-16_at_22.54.24_a8f585b8_cblr2r.jpg',
    quote: 'Uploading my notes was super easy and helped my juniors.',
    branch: 'GCS, 3rd Year',
  },
];

const LandingPage = () => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);
  const nextTestimonial = () => setTestimonialIdx((testimonialIdx + 1) % testimonials.length);
  const prevTestimonial = () => setTestimonialIdx((testimonialIdx - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-50 to-slate-100 pt-20 sm:pt-32 pb-6 sm:pb-10 px-2 sm:px-0">
      {/* Hero Section */}
      <div className="max-w-2xl w-full text-center mb-6 sm:mb-10 px-2 sm:px-0">
        <div className="flex flex-col items-center mb-3 sm:mb-4">
          <span className="text-4xl xs:text-5xl sm:text-6xl mb-2" role="img" aria-label="campus">🏫</span>
          <h1 className="text-2xl xs:text-3xl sm:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow-lg leading-tight">Welcome to SLIET Notes & PYQs Hub</h1>
          <span className="text-blue-700 font-semibold text-sm xs:text-base sm:text-lg">Sant Longowal Institute of Engineering & Technology</span>
        </div>
        <p className="text-sm xs:text-base sm:text-lg text-slate-700 mb-4 sm:mb-8">Access, upload, and search SLIET notes and previous year questions. Study smarter—anytime, anywhere!</p>
        {!user && (
          <button
            className="w-full sm:w-auto px-6 xs:px-8 sm:px-12 py-2 xs:py-3 sm:py-4 rounded-xl bg-blue-700 text-white font-bold text-base xs:text-lg sm:text-xl shadow-lg hover:bg-blue-900 transition"
            onClick={() => navigate('/signup')}
          >
            Get Started
          </button>
        )}
      </div>
      {/* Features Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-8 justify-center mb-6 sm:mb-10 w-full max-w-5xl px-1 xs:px-2 sm:px-0">
        {features.map((f) => (
          <div key={f.title} className="bg-white/80 rounded-2xl shadow-lg p-4 xs:p-6 sm:p-10 flex flex-col items-center hover:scale-105 transition-transform backdrop-blur-md">
            <span className="text-2xl xs:text-3xl sm:text-4xl mb-2 xs:mb-3 sm:mb-4">{f.icon}</span>
            <h3 className="text-blue-700 font-bold text-sm xs:text-base sm:text-lg mb-1 xs:mb-2">{f.title}</h3>
            <p className="text-slate-600 text-center text-xs xs:text-sm sm:text-base">{f.desc}</p>
          </div>
        ))}
      </div>
      {/* Testimonial Carousel */}
      <div className="max-w-xs xs:max-w-sm sm:max-w-xl w-full mx-auto bg-white/90 rounded-2xl shadow-lg p-4 xs:p-5 sm:p-8 flex flex-col items-center">
        <img src={testimonials[testimonialIdx].avatar} alt={testimonials[testimonialIdx].name} className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-full border-4 border-blue-300 mb-2 xs:mb-3" />
        <div className="italic text-blue-900 text-sm xs:text-base sm:text-lg mb-2 xs:mb-3 sm:mb-4">“{testimonials[testimonialIdx].quote}”</div>
        <div className="flex items-center gap-2 mb-1 xs:mb-2">
          <span className="font-bold text-blue-700 text-xs xs:text-sm sm:text-base">{testimonials[testimonialIdx].name}</span>
          <span className="text-slate-500 text-xs sm:text-sm">({testimonials[testimonialIdx].branch})</span>
        </div>
        <div className="flex gap-2 xs:gap-3 mt-2">
          <button onClick={prevTestimonial} className="px-2 xs:px-3 py-1 rounded bg-blue-100 text-blue-700 font-bold hover:bg-blue-200 transition">&#8592;</button>
          <button onClick={nextTestimonial} className="px-2 xs:px-3 py-1 rounded bg-blue-100 text-blue-700 font-bold hover:bg-blue-200 transition">&#8594;</button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 