import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ---------------------------------------------------------------------- */
/* Static data                                                            */
/* ---------------------------------------------------------------------- */

const CLASS_LEVELS = [
  'Pre-Nursery', 'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4',
  'Class 5', 'Class 6', 'Class 7', 'Class 8',
];

const SUBJECT_SUGGESTIONS = ['Hindi', 'English', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit'];
const MAX_SUBJECTS = 8;

const MODES = [
  { id: 'online', label: 'Online', icon: '💻' },
  { id: 'offline', label: "At the tutor's place", icon: '🏫' },
  { id: 'personal', label: 'At my home', icon: '🏠' },
];

const TRUST_BENEFITS = [
  { icon: '🛡️', title: 'Verified educators', copy: 'Every tutor is identity-checked and background-verified before they can teach on the platform.' },
  { icon: '🔒', title: 'Private by default', copy: 'Your contact details go only to the tutors you are matched with — never sold, never spammed.' },
  { icon: '⏱️', title: '24-hour response', copy: 'A learning advisor personally reviews every request and follows up within one business day.' },
  { icon: '🎯', title: 'Matched, not listed', copy: 'We hand-pick tutors based on subject, level, and learning style, instead of leaving you to scroll profiles.' },
  { icon: '📋', title: 'No obligation', copy: 'Requesting a match costs nothing and commits you to nothing until you choose to begin.' },
  { icon: '📞', title: 'A real person to ask', copy: 'Questions before, during, or after matching go to an advisor — not a support ticket queue.' },
];

const HOW_STEPS = [
  { title: 'Tell us what you need', copy: "Share your child's class, subjects, and preferred schedule." },
  { title: 'Get matched', copy: 'An advisor reviews your request and introduces vetted tutors who fit.' },
  { title: 'Start learning', copy: 'Choose your tutor and book the first session, online or in person.' },
];

const BANNER_SLIDES = [
  { note: 'Find the perfect tutor tailored to your specific learning style.' },
  { note: 'Every educator is verified for safety, quality, and expertise.' },
  { note: 'Get matched today with zero hidden placement fees.' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

const SELECT_ARROW_URL =
  "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E";

/* ---------------------------------------------------------------------- */
/* Small building blocks                                                  */
/* ---------------------------------------------------------------------- */

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/70 pl-1">
        {label}
      </label>
      {children}
      {error ? (
        <p className="font-mono text-[11px] font-semibold text-[var(--rust)] pl-1">{error}</p>
      ) : hint ? (
        <p className="text-[11px] font-medium text-[var(--ink)]/40 pl-1">{hint}</p>
      ) : null}
    </div>
  );
}

// NEW: Glassmorphism Input Styling
const inputClass = (hasError) =>
  `w-full rounded-[1.5rem] border border-white/60 bg-white/40 backdrop-blur-md px-5 py-4 text-sm font-semibold text-[var(--ink)] placeholder-[var(--ink)]/40 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all focus:bg-white/70 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)] focus:border-transparent ${
    hasError ? 'border-[var(--rust)]/60 bg-red-50/50 ring-2 ring-[var(--rust)]' : ''
  }`;

const selectClass = (hasError) =>
  `${inputClass(hasError)} cursor-pointer appearance-none bg-[url('${SELECT_ARROW_URL}')] bg-[length:12px_12px] bg-[right_1.25rem_center] bg-no-repeat`;

function SectionLabel({ children }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--line)] to-[var(--line)] opacity-50" />
      <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">
        {children}
      </p>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[var(--line)] to-[var(--line)] opacity-50" />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Decorative illustrations + rotating banner                             */
/* ---------------------------------------------------------------------- */

const NotebookIllustration = memo(function NotebookIllustration() {
  return (
    <svg width="200" height="154" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="drop-shadow-lg">
      <path d="M20 22 Q20 10 32 10 H106 V148 H32 Q20 148 20 136 Z" fill="var(--card)" />
      <path d="M200 22 Q200 10 188 10 H114 V148 H188 Q200 148 200 136 Z" fill="var(--card)" />
      <path d="M20 22 Q20 10 32 10 H106 V148 H32 Q20 148 20 136 Z" stroke="var(--line)" strokeWidth="1.5" />
      <path d="M200 22 Q200 10 188 10 H114 V148 H188 Q200 148 200 136 Z" stroke="var(--line)" strokeWidth="1.5" />
      <rect x="104" y="8" width="12" height="142" rx="3" fill="var(--chalk)" />
      <line x1="36" y1="42" x2="96" y2="42" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="60" x2="96" y2="60" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="36" y1="78" x2="82" y2="78" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="124" y1="42" x2="184" y2="42" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="124" y1="60" x2="184" y2="60" stroke="var(--marigold)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="124" y1="78" x2="170" y2="78" stroke="var(--line)" strokeWidth="2.5" strokeLinecap="round" />
      <g transform="rotate(-26 150 96)">
        <rect x="86" y="90" width="94" height="13" rx="3.5" fill="var(--marigold)" />
        <rect x="82" y="90" width="9" height="13" fill="var(--rust)" />
        <path d="M180 90 L198 96.5 L180 103 Z" fill="var(--ink)" />
      </g>
    </svg>
  );
});

const MentorBadgeIllustration = memo(function MentorBadgeIllustration() {
  return (
    <svg width="154" height="154" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="drop-shadow-lg">
      <circle cx="85" cy="85" r="82" fill="var(--card)" />
      <circle cx="85" cy="85" r="82" stroke="var(--chalk)" strokeOpacity="0.12" strokeWidth="2" />
      <path d="M32 128 Q32 92 62 92 Q92 92 92 128 Z" fill="var(--chalk)" />
      <circle cx="62" cy="66" r="17" fill="var(--chalk)" />
      <path d="M92 128 Q92 100 116 100 Q140 100 140 128 Z" fill="var(--rust)" />
      <circle cx="116" cy="80" r="13" fill="var(--rust)" />
      <rect x="74" y="112" width="26" height="17" rx="2" fill="var(--marigold)" />
      <line x1="87" y1="112" x2="87" y2="129" stroke="var(--card)" strokeWidth="2" />
    </svg>
  );
});

function HeroBanner() {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setActive((a) => (a + 1) % BANNER_SLIDES.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      className="relative w-full overflow-hidden rounded-[3rem] bg-gradient-to-br from-[var(--marigold)] to-[var(--rust)] shadow-[0_20px_50px_-12px_rgba(59,130,246,0.3)] lg:h-full lg:min-h-[400px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{ backgroundImage: 'radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}
      />
      <div className="relative flex h-full flex-col justify-center px-6 py-12 sm:px-10 lg:p-14">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="hidden sm:block">
             <NotebookIllustration />
          </div>
          <div className="z-10 mx-auto w-full max-w-[260px] -rotate-2 rounded-[2rem] bg-white/90 backdrop-blur-xl p-7 shadow-2xl transition-transform hover:rotate-0 lg:mx-0">
            <p key={active} className="animate-in fade-in font-serif text-base font-bold leading-snug text-[var(--ink)] duration-500">
              {BANNER_SLIDES[active].note}
            </p>
            <div className="mt-6 flex gap-2">
              {BANNER_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show message ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === active ? 'w-8 bg-[var(--marigold)]' : 'w-2 bg-[var(--ink)]/10 hover:bg-[var(--ink)]/30'}`}
                />
              ))}
            </div>
          </div>
          <div className="hidden xl:block">
            <MentorBadgeIllustration />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main component                                                         */
/* ---------------------------------------------------------------------- */

const INITIAL_FORM = {
  student_name: '',
  class_level: '',
  parent_name: '',
  email: '',
  contact_number: '',
  subjects: [],
  preferred_mode: 'online',
  city: 'Jaipur',
  specific_area: '',
  location_coords: '',
};

export default function StudentRequest() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [subjectInput, setSubjectInput] = useState('');
  const [errors, setErrors] = useState({});
  const [gpsError, setGpsError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const clearError = useCallback((name) => {
    setErrors((e) => {
      if (!(name in e)) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  }, [clearError]);

  const handleModeSelect = useCallback((id) => {
    setFormData((prev) => ({ ...prev, preferred_mode: id }));
  }, []);

  /* ---- Subjects: add-as-you-go tag input ---- */
  const addSubject = useCallback((raw) => {
    setFormData((prev) => {
      const value = (raw ?? subjectInput).trim();
      if (!value) return prev;
      if (prev.subjects.length >= MAX_SUBJECTS) return prev;
      const alreadyAdded = prev.subjects.some((s) => s.toLowerCase() === value.toLowerCase());
      if (alreadyAdded) return prev;
      return { ...prev, subjects: [...prev.subjects, value] };
    });
    setSubjectInput('');
    clearError('subjects');
  }, [subjectInput, clearError]);

  const removeSubject = useCallback((subject) => {
    setFormData((prev) => ({ ...prev, subjects: prev.subjects.filter((s) => s !== subject) }));
  }, []);

  const handleSubjectKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSubject();
    }
  }, [addSubject]);

  const handleGetLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError('Location services are not supported in this browser.');
      return;
    }
    setIsLocating(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          location_coords: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`,
        }));
        setIsLocating(false);
      },
      () => {
        setGpsError('Could not get your location. Check your permissions.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  const validate = useCallback(() => {
    const e = {};
    if (!formData.student_name.trim()) e.student_name = "Enter the student's full name.";
    if (!formData.class_level) e.class_level = 'Select a class.';
    if (!formData.parent_name.trim()) e.parent_name = "Enter the parent's full name.";
    if (!EMAIL_RE.test(formData.email)) e.email = 'Enter a valid email address.';
    if (!PHONE_RE.test(formData.contact_number.replace(/\s/g, ''))) e.contact_number = 'Enter a valid phone number.';
    if (formData.subjects.length === 0) e.subjects = 'Add at least one subject.';
    if (!formData.specific_area.trim()) e.specific_area = 'Enter your area or locality.';
    return e;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      const firstErrorName = Object.keys(formErrors)[0];
      const firstError = document.getElementsByName(firstErrorName)[0];
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ text: 'Submitting your request…', type: 'loading' });

    try {
      await axios.post('https://learning-hub-backend-one.vercel.app/api/public/student-request', {
        ...formData,
        subjects: formData.subjects, 
      });

      setStatusMessage({ text: 'Request received! An advisor will contact you shortly.', type: 'success' });
      setFormData(INITIAL_FORM);
      setSubjectInput('');
    } catch (error) {
      console.error(error);
      setStatusMessage({ text: 'Could not connect. Please check your network and try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
   <div
      style={{
        // Modern & Vibrant Tech Theme applied to root
        '--chalk': '#1E1B4B',     
        '--paper': '#F8FAFC',     
        '--ink': '#0F172A',       
        '--card': '#FFFFFF',      
        '--marigold': '#3B82F6',  
        '--rust': '#8B5CF6',      
        '--line': '#E2E8F0',      
        '--good': '#10B981',      
      }}
      className="relative flex min-h-screen scroll-smooth flex-col bg-[var(--paper)] font-sans text-[var(--ink)] selection:bg-[var(--marigold)]/30 overflow-hidden"
    >
      {/* Background Abstract Blobs for Glassmorphism Effect */}
      <div className="pointer-events-none absolute left-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-[var(--marigold)]/10 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-10%] top-[40%] h-[600px] w-[600px] rounded-full bg-[var(--rust)]/10 blur-[150px]" />
      
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-white/40 bg-white/50 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10">
          <div className="flex items-center gap-3 text-lg font-black tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--chalk)] font-mono text-sm text-white shadow-lg">
              LH
            </div>
            <span className="hidden sm:inline">Learning Hub</span>
          </div>
          <div className="hidden items-center gap-8 font-mono text-[13px] font-bold uppercase tracking-wide text-[var(--ink)]/60 md:flex">
            <Link to="/" className="transition-colors hover:text-[var(--ink)]">Home</Link>
            <Link to="/request-tutor" className="text-[var(--marigold)]">Find a tutor</Link>
            <Link to="/apply-teacher" className="transition-colors hover:text-[var(--ink)]">Become a tutor</Link>
          </div>
          <Link
            to="/apply-teacher"
            className="rounded-2xl bg-white/80 backdrop-blur-md border border-white/60 px-5 py-2.5 text-xs font-bold text-[var(--ink)] shadow-sm transition-all hover:bg-[var(--marigold)] hover:text-white hover:border-transparent sm:px-6 sm:text-sm"
          >
            Teach with us
          </Link>
        </div>
      </nav>

      {/* --- UNIFIED HERO SECTION --- */}
      <header className="relative pt-12 pb-20 sm:pt-20 sm:pb-32 lg:pt-24 lg:pb-36 z-10">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-12">

            {/* Left: Copy */}
            <div className="max-w-xl text-center lg:text-left">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[var(--marigold)]/30 bg-white/60 backdrop-blur-md px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink)] shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--marigold)]" />
                For students &amp; parents in Jaipur
              </div>
              <h1 className="font-serif text-4xl font-black leading-[1.1] tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
                Find the right tutor,<br className="hidden sm:block lg:hidden xl:block" />
                matched to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--marigold)] to-[var(--rust)]">your</span> child.
              </h1>
              <p className="mx-auto mt-6 text-base font-medium leading-relaxed text-[var(--ink)]/60 lg:mx-0 lg:text-lg">
                Tell us what you're looking for. A learning advisor reviews every request personally
                and introduces you to verified tutors who fit — usually within 24 hours.
              </p>
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <a
                  href="#request"
                  className="w-full rounded-[1.5rem] bg-[var(--chalk)] px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_30px_-10px_rgba(30,27,75,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(30,27,75,0.5)] sm:w-auto"
                >
                  Request a tutor
                </a>
                <a
                  href="#how"
                  className="w-full rounded-[1.5rem] border border-[var(--line)] bg-white/50 backdrop-blur-sm px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-[var(--ink)]/70 transition-all hover:bg-white sm:w-auto"
                >
                  See how it works
                </a>
              </div>
            </div>

            {/* Right: Premium Banner Component */}
            <div className="mx-auto w-full max-w-lg lg:max-w-none">
              <HeroBanner />
            </div>

          </div>
        </div>
      </header>

      {/* --- WHY TRUST US --- */}
      <section className="relative py-20 sm:py-32 z-10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              A process built for peace of mind
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-[var(--ink)]/60">
              Handing your child's learning to a stranger shouldn't feel like a leap of faith.
              Here's what stands behind every match we make.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_BENEFITS.map((b) => (
              <div key={b.title} className="group rounded-[2.5rem] bg-white/60 backdrop-blur-xl border border-white/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:bg-white/90">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[var(--marigold)]/10 text-2xl transition-transform group-hover:scale-110 group-hover:bg-[var(--marigold)]/20">
                  {b.icon}
                </div>
                <h3 className="mb-2 text-lg font-black text-[var(--ink)]">{b.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-[var(--ink)]/60">{b.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how" className="relative py-20 sm:py-32 z-10">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 md:px-10">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              Three steps to your first session
            </h2>
          </div>

          <div className="relative mt-20 flex flex-col gap-12 md:flex-row md:justify-between md:gap-8">
            <div aria-hidden="true" className="absolute left-[15%] right-[15%] top-8 hidden h-0.5 rounded-full bg-gradient-to-r from-transparent via-[var(--line)] to-transparent md:block" />
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} className="relative z-10 flex flex-1 flex-col items-center text-center">
                <span className="mb-8 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-[var(--marigold)] to-[var(--rust)] font-mono text-xl font-black text-white shadow-[0_10px_20px_rgba(59,130,246,0.3)] ring-8 ring-[var(--paper)] transition-transform hover:scale-110">
                  0{i + 1}
                </span>
                <h3 className="mb-3 text-lg font-black text-[var(--ink)]">{s.title}</h3>
                <p className="max-w-[260px] text-sm font-medium leading-relaxed text-[var(--ink)]/60">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- REQUEST FORM (GLASSMORPHISM ELEVATED) --- */}
      <section id="request" className="relative pb-32 pt-20 sm:pt-32 z-10">
        <div className="relative mx-auto max-w-[760px] px-4 sm:px-6 md:px-10">
          <div className="mb-14 text-center">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              Ready to begin?
            </h2>
            <p className="mt-4 text-base font-medium text-[var(--ink)]/60">
              Fill out the details below. An advisor will review it today.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="relative">
            {/* Glassmorphism Card Wrapper */}
            <div className="overflow-hidden rounded-[2.5rem] bg-white/50 backdrop-blur-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-white/60 sm:rounded-[3rem]">
              <div className="h-2 w-full bg-gradient-to-r from-[var(--marigold)] to-[var(--rust)]" />

              <div className="p-6 sm:p-10 md:p-14">
                <div className="space-y-12">

                  {/* Student details */}
                  <div>
                    <SectionLabel>Student Details</SectionLabel>
                    <div className="space-y-6">
                      <Field label="Student's full name" error={errors.student_name}>
                        <input
                          name="student_name" type="text" autoComplete="name" placeholder="e.g. AA"
                          value={formData.student_name} onChange={handleChange} className={inputClass(errors.student_name)}
                        />
                      </Field>
                      <Field label="Class" error={errors.class_level} hint="Pre-Nursery to Class 8">
                        <select
                          name="class_level" value={formData.class_level} onChange={handleChange}
                          className={selectClass(errors.class_level)}
                        >
                          <option value="" disabled>Select class</option>
                          {CLASS_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>

                  {/* Parent details */}
                  <div>
                    <SectionLabel>Parent Details</SectionLabel>
                    <div className="space-y-6">
                      <Field label="Parent's full name" error={errors.parent_name}>
                        <input
                          name="parent_name" type="text" autoComplete="name" placeholder="e.g. Rohit Sharma"
                          value={formData.parent_name} onChange={handleChange} className={inputClass(errors.parent_name)}
                        />
                      </Field>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Field label="Parent email" error={errors.email}>
                          <input
                            name="email" type="email" autoComplete="email" placeholder="you@example.com"
                            value={formData.email} onChange={handleChange} className={inputClass(errors.email)}
                          />
                        </Field>
                        <Field label="Contact number" error={errors.contact_number}>
                          <input
                            name="contact_number" type="tel" autoComplete="tel" placeholder="98765 43210"
                            value={formData.contact_number} onChange={handleChange} className={inputClass(errors.contact_number)}
                          />
                        </Field>
                      </div>
                    </div>
                  </div>

                  {/* Learning needs */}
                  <div>
                    <SectionLabel>Learning Needs</SectionLabel>
                    <div className="space-y-8">
                      <Field
                        label="Subjects"
                        error={errors.subjects}
                        hint={`Add each subject one at a time · up to ${MAX_SUBJECTS}`}
                      >
                        {formData.subjects.length > 0 && (
                          <div className="mb-2 flex flex-wrap gap-2">
                            {formData.subjects.map((subject) => (
                              <span
                                key={subject}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[var(--ink)] shadow-sm border border-white/60"
                              >
                                {subject}
                                <button
                                  type="button"
                                  onClick={() => removeSubject(subject)}
                                  aria-label={`Remove ${subject}`}
                                  className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--rust)] transition-colors hover:bg-[var(--rust)]/10"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-3">
                          <input
                            name="subject_input" type="text" placeholder="e.g. Mathematics"
                            value={subjectInput}
                            onChange={(e) => setSubjectInput(e.target.value)}
                            onKeyDown={handleSubjectKeyDown}
                            disabled={formData.subjects.length >= MAX_SUBJECTS}
                            className={inputClass(errors.subjects)}
                          />
                          <button
                            type="button"
                            onClick={() => addSubject()}
                            disabled={!subjectInput.trim() || formData.subjects.length >= MAX_SUBJECTS}
                            className="shrink-0 rounded-[1.5rem] bg-[var(--chalk)] px-6 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-[var(--marigold)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[var(--chalk)]"
                          >
                            + Add
                          </button>
                        </div>
                        {formData.subjects.length < MAX_SUBJECTS && (
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <span className="mr-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/40">
                              Quick add:
                            </span>
                            {SUBJECT_SUGGESTIONS
                              .filter((s) => !formData.subjects.some((f) => f.toLowerCase() === s.toLowerCase()))
                              .map((s) => (
                                <button
                                  key={s}
                                  type="button"
                                  onClick={() => addSubject(s)}
                                  className="rounded-full border border-white/60 bg-white/30 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-[var(--ink)]/70 transition-all hover:bg-white hover:border-transparent hover:shadow-sm"
                                >
                                  + {s}
                                </button>
                              ))}
                          </div>
                        )}
                      </Field>

                      <div className="space-y-4">
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/70 pl-1">
                          Preferred mode
                        </label>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                          {MODES.map((mode) => (
                            <button
                              type="button" key={mode.id} onClick={() => handleModeSelect(mode.id)}
                              className={`flex flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-white/60 p-5 text-center text-sm font-bold transition-all ${
                                formData.preferred_mode === mode.id
                                  ? 'bg-white shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] ring-2 ring-[var(--marigold)] text-[var(--ink)]'
                                  : 'bg-white/30 backdrop-blur-sm text-[var(--ink)]/60 hover:bg-white/60'
                              }`}
                            >
                              <span className="text-3xl drop-shadow-sm">{mode.icon}</span>
                              {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <SectionLabel>Location</SectionLabel>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <Field label="City" hint="We currently serve Jaipur only">
                        <div className="flex items-center gap-2 rounded-[1.5rem] border border-white/60 bg-white/30 backdrop-blur-md px-5 py-4 text-sm font-semibold text-[var(--ink)]/70">
                          <span aria-hidden="true">📍</span> Jaipur, Rajasthan
                        </div>
                      </Field>
                      <Field label="Area / locality" error={errors.specific_area}>
                        <div className="flex gap-3">
                          <input
                            name="specific_area" type="text" placeholder="e.g. Malviya Nagar"
                            value={formData.specific_area} onChange={handleChange}
                            className={inputClass(errors.specific_area)}
                          />
                          <button
                            type="button" onClick={handleGetLocation} disabled={isLocating}
                            className={`shrink-0 rounded-[1.5rem] border px-5 text-xs font-bold transition-all ${
                              formData.location_coords
                                ? 'border-transparent bg-[var(--good)] text-white shadow-md'
                                : 'border-white/60 bg-white/40 backdrop-blur-sm text-[var(--ink)] hover:bg-white hover:shadow-sm'
                            }`}
                          >
                            {isLocating ? '···' : formData.location_coords ? '✓ Pinned' : '📍 GPS'}
                          </button>
                        </div>
                        {gpsError && <p className="font-mono text-[11px] font-semibold text-[var(--rust)] pl-1 pt-1">{gpsError}</p>}
                      </Field>
                    </div>
                  </div>

                  {/* Submission Area */}
                  <div className="pt-6">
                    {statusMessage.text && (
                      <div
                        className={`mb-8 flex items-center gap-4 rounded-[1.5rem] border px-6 py-5 text-sm font-bold backdrop-blur-md ${
                          statusMessage.type === 'error'
                            ? 'border-red-200 bg-red-50/80 text-red-700'
                            : statusMessage.type === 'success'
                            ? 'border-green-200 bg-green-50/80 text-green-700'
                            : 'border-blue-200 bg-blue-50/80 text-blue-700'
                        }`}
                      >
                        {statusMessage.type === 'loading' && (
                          <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
                        )}
                        <span className="flex-1 text-[15px]">{statusMessage.text}</span>
                      </div>
                    )}

                    <button
                      type="submit" disabled={isSubmitting}
                      className={`w-full rounded-[1.5rem] py-5 text-[15px] font-black uppercase tracking-widest text-white transition-all disabled:cursor-not-allowed ${
                        isSubmitting
                          ? 'bg-[var(--ink)]/30'
                          : 'bg-gradient-to-r from-[var(--marigold)] to-[var(--rust)] shadow-[0_15px_30px_-10px_rgba(59,130,246,0.5)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-10px_rgba(59,130,246,0.6)] active:translate-y-0'
                      }`}
                    >
                      {isSubmitting ? 'Sending Request…' : 'Submit Tutor Request'}
                    </button>
                    <p className="mt-6 flex items-center justify-center gap-2 text-center font-mono text-[11px] font-medium text-[var(--ink)]/50">
                      <span className="text-sm drop-shadow-sm">🔒</span> Your details are shared only with matched tutors.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-auto bg-[var(--chalk)] py-12 text-center font-mono text-[12px] font-medium uppercase tracking-widest text-white/50 z-10 relative">
        Learning Hub — connecting educators and students, one lesson at a time.
      </footer>
    </div>
  );
}