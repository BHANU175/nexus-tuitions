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

const inputClass = (hasError) =>
  `w-full rounded-xl border-2 bg-gray-50/50 px-5 py-4 text-sm font-semibold text-[var(--ink)] placeholder-[var(--ink)]/30 transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--marigold)]/20 ${
    hasError ? 'border-[var(--rust)]/50 focus:border-[var(--rust)]' : 'border-[var(--line)] focus:border-[var(--marigold)]'
  }`;

const selectClass = (hasError) =>
  `${inputClass(hasError)} cursor-pointer appearance-none bg-[url('${SELECT_ARROW_URL}')] bg-[length:12px_12px] bg-[right_1.25rem_center] bg-no-repeat`;

function SectionLabel({ children }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <h3 className="font-serif text-2xl font-black text-[var(--ink)]">{children}</h3>
      <div className="h-px flex-1 bg-[var(--line)]/60" />
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
      className="relative w-full overflow-hidden rounded-3xl bg-[var(--chalk)] shadow-2xl shadow-[var(--chalk)]/20 lg:h-full lg:min-h-[400px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
      />
      <div className="relative flex h-full flex-col justify-center px-6 py-12 sm:px-10 lg:p-14">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="hidden sm:block">
             <NotebookIllustration />
          </div>
          <div className="z-10 mx-auto w-full max-w-[260px] -rotate-2 rounded-2xl bg-white p-7 shadow-xl transition-transform hover:rotate-0 lg:mx-0">
            <p key={active} className="animate-in fade-in font-serif text-base font-bold leading-snug text-[var(--ink)] duration-500">
              {BANNER_SLIDES[active].note}
            </p>
            <div className="mt-6 flex gap-2">
              {BANNER_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show message ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${i === active ? 'w-8 bg-[var(--marigold)]' : 'w-2 bg-[var(--line)] hover:bg-[var(--line)]/70'}`}
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
  
  // New State for Multi-Step Form
  const [currentStep, setCurrentStep] = useState(1);

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

  // Updated Step-by-Step Validation Logic
  const validateStep = useCallback((step) => {
    const e = {};
    if (step === 1) {
      if (!formData.student_name.trim()) e.student_name = "Enter the student's full name.";
      if (!formData.class_level) e.class_level = 'Select a class.';
    }
    if (step === 2) {
      if (!formData.parent_name.trim()) e.parent_name = "Enter the parent's full name.";
      if (!EMAIL_RE.test(formData.email)) e.email = 'Enter a valid email address.';
      if (!PHONE_RE.test(formData.contact_number.replace(/\s/g, ''))) e.contact_number = 'Enter a valid phone number.';
    }
    if (step === 3) {
      if (formData.subjects.length === 0) e.subjects = 'Add at least one subject.';
      if (!formData.specific_area.trim()) e.specific_area = 'Enter your area or locality.';
    }
    return e;
  }, [formData]);

  const handleNextStep = () => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setErrors({});
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const stepErrors = validateStep(3); // Final step validation
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
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
      setCurrentStep(1); // Reset form to step 1 on success
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
        /* Clean, Crisp SaaS Theme */
        '--chalk': '#1E293B',     /* Slate 800 - Main dark color */
        '--paper': '#F8FAFC',     /* Slate 50 - Very light grey background */
        '--ink': '#0F172A',       /* Slate 900 - Text color */
        '--card': '#FFFFFF',      /* Pure White */
        '--marigold': '#3B82F6',  /* Blue 500 - Primary accent */
        '--rust': '#6366F1',      /* Indigo 500 - Secondary accent */
        '--line': '#E2E8F0',      /* Slate 200 - Borders */
        '--good': '#10B981',      /* Emerald 500 - Success states */
      }}
      className="relative flex min-h-screen scroll-smooth flex-col bg-[var(--paper)] font-sans text-[var(--ink)] selection:bg-[var(--marigold)]/30"
    >
      
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10">
          <div className="flex items-center gap-3 text-lg font-black tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--marigold)] font-mono text-sm text-white shadow-sm">
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
            className="rounded-xl border-2 border-[var(--line)] bg-white px-5 py-2.5 text-xs font-bold text-[var(--ink)] transition-all hover:border-[var(--chalk)] hover:bg-[var(--chalk)] hover:text-white sm:px-6 sm:text-sm"
          >
            Teach with us
          </Link>
        </div>
      </nav>

      {/* --- UNIFIED HERO SECTION --- */}
      <header className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-12">

            {/* Left: Copy */}
            <div className="max-w-xl text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink)] shadow-sm">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--marigold)]" />
                For students &amp; parents in Jaipur
              </div>
              <h1 className="font-serif text-4xl font-black leading-[1.1] tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
                Find the right tutor,<br className="hidden sm:block lg:hidden xl:block" />
                matched to <span className="text-[var(--marigold)]">your</span> child.
              </h1>
              <p className="mx-auto mt-6 text-base font-medium leading-relaxed text-[var(--ink)]/60 lg:mx-0 lg:text-lg">
                Tell us what you're looking for. A learning advisor reviews every request personally
                and introduces you to verified tutors who fit — usually within 24 hours.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <a
                  href="#request"
                  className="w-full rounded-xl bg-[var(--chalk)] px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[var(--chalk)]/20 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--chalk)]/30 sm:w-auto"
                >
                  Request a tutor
                </a>
                <a
                  href="#how"
                  className="w-full rounded-xl border-2 border-[var(--line)] bg-white px-8 py-3.5 text-center text-sm font-black uppercase tracking-widest text-[var(--ink)]/70 transition-all hover:bg-gray-50 hover:border-gray-300 sm:w-auto"
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
      <section className="relative py-16 sm:py-24">
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

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_BENEFITS.map((b) => (
              <div key={b.title} className="group rounded-2xl bg-white border border-[var(--line)]/50 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[var(--line)]">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--paper)] border border-[var(--line)] text-xl transition-transform group-hover:scale-110">
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
      <section id="how" className="relative py-16 sm:py-24 border-t border-[var(--line)]/50">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 md:px-10">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              Three steps to your first session
            </h2>
          </div>

          <div className="relative mt-16 flex flex-col gap-12 md:flex-row md:justify-between md:gap-8">
            <div aria-hidden="true" className="absolute left-[15%] right-[15%] top-7 hidden h-0.5 rounded-full bg-[var(--line)] md:block" />
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} className="relative z-10 flex flex-1 flex-col items-center text-center">
                <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--marigold)] font-mono text-lg font-black text-white shadow-lg shadow-[var(--marigold)]/20 ring-4 ring-[var(--paper)] transition-transform hover:scale-110">
                  0{i + 1}
                </span>
                <h3 className="mb-2 text-lg font-black text-[var(--ink)]">{s.title}</h3>
                <p className="max-w-[260px] text-sm font-medium leading-relaxed text-[var(--ink)]/60">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- REQUEST FORM (MULTI-STEP) --- */}
      <section id="request" className="relative pb-24 pt-16 sm:pt-24 border-t border-[var(--line)]/50">
        <div className="relative mx-auto max-w-[760px] px-4 sm:px-6 md:px-10">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              Ready to begin?
            </h2>
            <p className="mt-3 text-base font-medium text-[var(--ink)]/60">
              Fill out the details below. An advisor will review it today.
            </p>
          </div>

          {statusMessage.text && (
            <div
              className={`mb-8 flex items-center gap-4 rounded-2xl border px-6 py-5 text-sm font-bold ${
                statusMessage.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : statusMessage.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-700'
                  : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}
            >
              {statusMessage.type === 'loading' && (
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-70" />
              )}
              <span className="flex-1 text-[15px]">{statusMessage.text}</span>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl bg-white shadow-xl shadow-[var(--chalk)]/5 ring-1 ring-[var(--line)]">
            {/* Progress Bar */}
            <div className="flex h-1.5 w-full bg-[var(--line)]/50">
              <div 
                className="bg-[var(--marigold)] transition-all duration-300" 
                style={{ width: `${(currentStep / 3) * 100}%` }} 
              />
            </div>

            <div className="p-6 sm:p-10">
              {/* Step Indicators */}
              <div className="mb-8 flex justify-between text-xs font-bold uppercase tracking-widest text-[var(--ink)]/40">
                <span className={currentStep >= 1 ? 'text-[var(--marigold)]' : ''}>1. Student</span>
                <span className={currentStep >= 2 ? 'text-[var(--marigold)]' : ''}>2. Parent</span>
                <span className={currentStep >= 3 ? 'text-[var(--marigold)]' : ''}>3. Details</span>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); if(currentStep === 3) handleSubmit(e); }} noValidate>
                
                {/* --- STEP 1: STUDENT DETAILS --- */}
                {currentStep === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
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
                )}

                {/* --- STEP 2: PARENT DETAILS --- */}
                {currentStep === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
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
                )}

                {/* --- STEP 3: LEARNING NEEDS & LOCATION --- */}
                {currentStep === 3 && (
                  <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <SectionLabel>Learning Needs & Location</SectionLabel>
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
                                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--marigold)]/10 px-4 py-2 text-xs font-bold text-[var(--ink)] border border-[var(--marigold)]/20"
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
                            className="shrink-0 rounded-xl bg-[var(--chalk)] px-6 text-xs font-black uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--marigold)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[var(--chalk)] disabled:hover:shadow-none"
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
                                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--ink)]/70 transition-all hover:border-[var(--marigold)] hover:text-[var(--ink)]"
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
                              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-5 text-center text-sm font-bold transition-all ${
                                formData.preferred_mode === mode.id
                                  ? 'border-[var(--marigold)] bg-[var(--marigold)]/5 text-[var(--ink)] shadow-sm'
                                  : 'border-[var(--line)] bg-gray-50/50 text-[var(--ink)]/60 hover:bg-gray-50'
                              }`}
                            >
                              <span className="text-3xl drop-shadow-sm">{mode.icon}</span>
                              {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Field label="City" hint="We currently serve Jaipur only">
                          <div className="flex items-center gap-2 rounded-xl border-2 border-[var(--line)] bg-gray-50/50 px-5 py-4 text-sm font-semibold text-[var(--ink)]/70">
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
                              className={`shrink-0 rounded-xl border-2 px-5 text-xs font-bold transition-all ${
                                formData.location_coords
                                  ? 'border-[var(--good)] bg-[var(--good)] text-white shadow-sm'
                                  : 'border-[var(--line)] bg-white text-[var(--ink)] hover:bg-gray-50'
                              }`}
                            >
                              {isLocating ? '···' : formData.location_coords ? '✓ Pinned' : '📍 GPS'}
                            </button>
                          </div>
                          {gpsError && <p className="font-mono text-[11px] font-semibold text-[var(--rust)] pl-1 pt-1">{gpsError}</p>}
                        </Field>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- NAVIGATION BUTTONS --- */}
                <div className="mt-12 flex gap-4 pt-6 border-t border-[var(--line)]/50">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="rounded-xl border-2 border-[var(--line)] px-6 py-4 text-sm font-black uppercase tracking-widest text-[var(--ink)]/70 transition-all hover:bg-gray-50 hover:text-[var(--ink)]"
                    >
                      Back
                    </button>
                  )}
                  
                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="ml-auto rounded-xl bg-[var(--chalk)] px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[var(--chalk)]/20 transition-all hover:-translate-y-0.5 hover:bg-[var(--marigold)] hover:shadow-[var(--marigold)]/30 active:translate-y-0"
                    >
                      Next Step
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className={`ml-auto rounded-xl px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all disabled:cursor-not-allowed ${
                        isSubmitting
                          ? 'bg-[var(--ink)]/30'
                          : 'bg-[var(--chalk)] shadow-lg shadow-[var(--chalk)]/20 hover:-translate-y-0.5 hover:bg-[var(--rust)] hover:shadow-[var(--rust)]/30 active:translate-y-0'
                      }`}
                    >
                      {isSubmitting ? 'Sending…' : 'Submit Request'}
                    </button>
                  )}
                </div>

              </form>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-auto bg-[var(--chalk)] py-10 text-center font-mono text-[12px] font-medium uppercase tracking-widest text-[var(--line)]/50">
        Learning Hub — connecting educators and students, one lesson at a time.
      </footer>
    </div>
  );
}