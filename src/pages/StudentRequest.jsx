import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ---------------------------------------------------------------------- */
/* Static data                                                            */
/* ---------------------------------------------------------------------- */

const CITIES = ['Jaipur', 'Delhi', 'Mumbai', 'Bangalore', 'Other'];

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
  { title: 'Tell us what you need', copy: "Share your child's subject, level, and preferred schedule." },
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

/* ---------------------------------------------------------------------- */
/* Small building blocks                                                  */
/* ---------------------------------------------------------------------- */

function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-2">
      <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/70">
        {label}
      </label>
      {children}
      {error ? (
        <p className="font-mono text-[11px] font-semibold text-[var(--rust)]">{error}</p>
      ) : hint ? (
        <p className="text-[11px] font-medium text-[var(--ink)]/40">{hint}</p>
      ) : null}
    </div>
  );
}

const inputClass = (hasError) =>
  `w-full rounded-xl border-2 bg-black/[0.02] px-4 py-3.5 text-sm font-semibold text-[var(--ink)] placeholder-[var(--ink)]/30 transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--marigold)]/20 ${
    hasError ? 'border-[var(--rust)]/50 focus:border-[var(--rust)]' : 'border-transparent focus:border-[var(--marigold)]'
  }`;

function SectionLabel({ children }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-[var(--line)]/50" />
      <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">
        {children}
      </p>
      <div className="h-px flex-1 bg-[var(--line)]/50" />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Decorative illustrations + rotating banner                             */
/* ---------------------------------------------------------------------- */

function NotebookIllustration() {
  return (
    <svg width="200" height="154" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="drop-shadow-sm">
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
}

function MentorBadgeIllustration() {
  return (
    <svg width="154" height="154" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" className="drop-shadow-sm">
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
}

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
      className="relative w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--marigold)] to-[var(--rust)] shadow-2xl shadow-[var(--marigold)]/20 lg:h-full lg:min-h-[400px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(circle, var(--ink) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
      />
      <div className="relative flex h-full flex-col justify-center px-6 py-12 sm:px-10 lg:p-14">
        <div className="flex w-full items-center justify-between gap-6">
          <div className="hidden sm:block">
             <NotebookIllustration />
          </div>
          <div className="z-10 mx-auto w-full max-w-[260px] -rotate-3 rounded-2xl bg-[var(--card)] p-6 shadow-xl transition-transform hover:-rotate-1 lg:mx-0">
            <p key={active} className="animate-in fade-in font-serif text-base font-bold leading-snug text-[var(--ink)] duration-500">
              {BANNER_SLIDES[active].note}
            </p>
            <div className="mt-5 flex gap-2">
              {BANNER_SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show message ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === active ? 'w-8 bg-[var(--marigold)]' : 'w-2 bg-[var(--ink)]/20 hover:bg-[var(--ink)]/40'}`}
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

export default function StudentRequest() {
  const [formData, setFormData] = useState({
    student_name: '',
    email: '',
    contact_number: '',
    subject_needed: '',
    preferred_mode: 'online',
    city: 'Jaipur',
    specific_area: '',
    location_coords: '',
  });

  const [errors, setErrors] = useState({});
  const [gpsError, setGpsError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const clearError = (name) =>
    setErrors((e) => {
      if (!(name in e)) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    clearError(name);
  };

  const handleModeSelect = (id) => {
    setFormData((prev) => ({ ...prev, preferred_mode: id }));
  };

  const handleGetLocation = () => {
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
  };

  const validate = () => {
    const e = {};
    if (!formData.student_name.trim()) e.student_name = "Enter the student's full name.";
    if (!EMAIL_RE.test(formData.email)) e.email = 'Enter a valid email address.';
    if (!PHONE_RE.test(formData.contact_number.replace(/\s/g, ''))) e.contact_number = 'Enter a valid phone number.';
    if (!formData.subject_needed.trim()) e.subject_needed = 'Tell us the subject and class or level.';
    if (!formData.specific_area.trim()) e.specific_area = 'Enter your area or locality.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      // Scroll to the first error smoothly
      const firstError = document.getElementsByName(Object.keys(formErrors)[0])[0];
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ text: 'Submitting your request…', type: 'loading' });

    try {
      await axios.post('https://rich-kids-open.loca.lt/api/public/student-request', formData);

      setStatusMessage({ text: 'Request received! An advisor will contact you shortly.', type: 'success' });
      setFormData({
        student_name: '', email: '', contact_number: '', subject_needed: '',
        preferred_mode: 'online', city: 'Jaipur', specific_area: '', location_coords: '',
      });
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
        '--chalk': '#16302A',
        '--paper': '#EEEFE4',
        '--ink': '#1C2420',
        '--card': '#FCFBF6',
        '--marigold': '#E7A23D',
        '--rust': '#B6472F',
        '--line': '#C9CBB8',
        '--good': '#3F7D5C',
      }}
      className="flex min-h-screen scroll-smooth flex-col bg-[var(--paper)] font-sans text-[var(--ink)] selection:bg-[var(--marigold)]/30"
    >
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-[var(--line)]/60 bg-[var(--paper)]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10">
          <div className="flex items-center gap-3 text-lg font-black tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--chalk)] font-mono text-sm text-[var(--paper)] shadow-md sm:h-10 sm:w-10">
              LH
            </div>
            <span className="hidden sm:inline">Learning Hub</span>
          </div>
          <div className="hidden items-center gap-8 font-mono text-[13px] font-bold uppercase tracking-wide text-[var(--ink)]/60 md:flex">
            <Link to="/" className="transition-colors hover:text-[var(--ink)]">Home</Link>
            <Link to="/request-tutor" className="text-[var(--rust)]">Find a tutor</Link>
            <Link to="/apply-teacher" className="transition-colors hover:text-[var(--ink)]">Become a tutor</Link>
          </div>
          <Link
            to="/apply-teacher"
            className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-[var(--ink)] shadow-sm ring-1 ring-[var(--line)] transition-all hover:bg-[var(--chalk)] hover:text-[var(--paper)] sm:px-5 sm:text-sm"
          >
            Teach with us
          </Link>
        </div>
      </nav>

      {/* --- UNIFIED HERO SECTION --- */}
      <header className="relative overflow-hidden border-b border-[var(--line)]/50 pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(to right, var(--line) 0, var(--line) 1px, transparent 1px, transparent 40px)' }}
        />
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
            
            {/* Left: Copy */}
            <div className="max-w-xl text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--marigold)]/30 bg-[var(--marigold)]/10 px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--rust)]" />
                For students &amp; parents
              </div>
              <h1 className="font-serif text-4xl font-black leading-[1.05] tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
                Find the right tutor,<br className="hidden sm:block lg:hidden xl:block" />
                matched to <span className="italic text-[var(--rust)]">your</span> child.
              </h1>
              <p className="mx-auto mt-6 text-base font-medium leading-relaxed text-[var(--ink)]/65 lg:mx-0 lg:text-lg">
                Tell us what you're looking for. A learning advisor reviews every request personally
                and introduces you to verified tutors who fit — usually within 24 hours.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <a
                  href="#request"
                  className="w-full rounded-xl bg-[var(--chalk)] px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-[var(--paper)] shadow-lg shadow-[var(--chalk)]/20 transition-all hover:-translate-y-0.5 hover:bg-[var(--rust)] hover:shadow-xl hover:shadow-[var(--rust)]/20 sm:w-auto"
                >
                  Request a tutor
                </a>
                <a
                  href="#how"
                  className="w-full rounded-xl border-2 border-[var(--ink)]/10 px-8 py-3.5 text-center text-sm font-black uppercase tracking-widest text-[var(--ink)]/70 transition-colors hover:border-[var(--ink)]/30 sm:w-auto"
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
              <div key={b.title} className="group rounded-3xl bg-white p-8 shadow-xl shadow-[var(--chalk)]/5 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-[var(--marigold)]/10">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--paper)] text-2xl transition-transform group-hover:scale-110">
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
      <section id="how" className="border-t border-[var(--line)]/50 py-16 sm:py-24">
        <div className="mx-auto max-w-[1000px] px-4 sm:px-6 md:px-10">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              Three steps to your first session
            </h2>
          </div>

          <div className="relative mt-16 flex flex-col gap-12 md:flex-row md:justify-between md:gap-8">
            <div aria-hidden="true" className="absolute left-[15%] right-[15%] top-7 hidden h-0.5 rounded-full bg-[var(--line)]/50 md:block" />
            {HOW_STEPS.map((s, i) => (
              <div key={s.title} className="relative z-10 flex flex-1 flex-col items-center text-center">
                <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--marigold)] font-mono text-lg font-black text-[var(--ink)] shadow-lg shadow-[var(--marigold)]/30 ring-4 ring-[var(--paper)] transition-transform hover:scale-110">
                  0{i + 1}
                </span>
                <h3 className="mb-2 text-lg font-black text-[var(--ink)]">{s.title}</h3>
                <p className="max-w-[260px] text-sm font-medium leading-relaxed text-[var(--ink)]/60">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- REQUEST FORM (ELEVATED) --- */}
      <section id="request" className="relative border-t border-[var(--line)]/50 pb-24 pt-16 sm:pt-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-b from-transparent to-[var(--chalk)]/5"
        />
        <div className="relative mx-auto max-w-[760px] px-4 sm:px-6 md:px-10">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              Ready to begin?
            </h2>
            <p className="mt-3 text-base font-medium text-[var(--ink)]/60">
              Fill out the details below. An advisor will review it today.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="relative">
            {/* Premium Card Wrapper */}
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-2xl shadow-[var(--chalk)]/10 ring-1 ring-[var(--line)]/40 sm:rounded-[2.5rem]">
              <div className="h-2 w-full bg-gradient-to-r from-[var(--marigold)] to-[var(--rust)]" />
              
              <div className="p-6 sm:p-10 md:p-12">
                <div className="space-y-10">
                  
                  {/* Student details */}
                  <div>
                    <SectionLabel>Student Details</SectionLabel>
                    <div className="space-y-6">
                      <Field label="Student's full name" error={errors.student_name}>
                        <input
                          name="student_name" type="text" autoComplete="name" placeholder="e.g. Aarav Sharma"
                          value={formData.student_name} onChange={handleChange} className={inputClass(errors.student_name)}
                        />
                      </Field>
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <Field label="Parent Email" error={errors.email}>
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
                    <div className="space-y-6">
                      <Field label="Subject & class / level" error={errors.subject_needed} hint="e.g. Class 10 Mathematics, or Python Programming">
                        <input
                          name="subject_needed" type="text" placeholder="e.g. Class 10 Mathematics"
                          value={formData.subject_needed} onChange={handleChange} className={inputClass(errors.subject_needed)}
                        />
                      </Field>
                      <div className="space-y-3">
                        <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/70">
                          Preferred mode
                        </label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {MODES.map((mode) => (
                            <button
                              type="button" key={mode.id} onClick={() => handleModeSelect(mode.id)}
                              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center text-sm font-bold transition-all ${
                                formData.preferred_mode === mode.id
                                  ? 'border-[var(--marigold)] bg-[var(--marigold)]/10 text-[var(--ink)] shadow-sm'
                                  : 'border-transparent bg-black/[0.02] text-[var(--ink)]/60 hover:bg-black/[0.04]'
                              }`}
                            >
                              <span className="text-2xl drop-shadow-sm">{mode.icon}</span>
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
                      <Field label="City">
                        <select
                          name="city" value={formData.city} onChange={handleChange}
                          className={`${inputClass(false)} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_1rem_center] bg-no-repeat`}
                        >
                          {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                      <Field label="Area / locality" error={errors.specific_area}>
                        <div className="flex gap-2">
                          <input
                            name="specific_area" type="text" placeholder="e.g. Malviya Nagar"
                            value={formData.specific_area} onChange={handleChange}
                            className={inputClass(errors.specific_area)}
                          />
                          <button
                            type="button" onClick={handleGetLocation} disabled={isLocating}
                            className={`shrink-0 rounded-xl border-2 px-4 text-xs font-bold transition-all ${
                              formData.location_coords
                                ? 'border-[var(--good)] bg-[var(--good)]/10 text-[var(--good)]'
                                : 'border-transparent bg-[var(--ink)]/5 text-[var(--ink)]/60 hover:bg-[var(--ink)]/10'
                            }`}
                          >
                            {isLocating ? '···' : formData.location_coords ? '✓ Pinned' : '📍 GPS'}
                          </button>
                        </div>
                        {gpsError && <p className="font-mono text-[11px] font-semibold text-[var(--rust)]">{gpsError}</p>}
                      </Field>
                    </div>
                  </div>

                  {/* Submission Area */}
                  <div className="pt-4">
                    {statusMessage.text && (
                      <div
                        className={`mb-6 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-bold ${
                          statusMessage.type === 'error'
                            ? 'border-[var(--rust)]/30 bg-[var(--rust)]/10 text-[var(--rust)]'
                            : statusMessage.type === 'success'
                            ? 'border-[var(--good)]/30 bg-[var(--good)]/10 text-[var(--good)]'
                            : 'border-[var(--marigold)]/40 bg-[var(--marigold)]/15 text-[var(--ink)]'
                        }`}
                      >
                        {statusMessage.type === 'loading' && (
                          <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[var(--marigold)]/30 border-t-[var(--marigold)]" />
                        )}
                        <span className="flex-1">{statusMessage.text}</span>
                      </div>
                    )}

                    <button
                      type="submit" disabled={isSubmitting}
                      className={`w-full rounded-2xl py-4.5 text-sm font-black uppercase tracking-widest text-white transition-all disabled:cursor-not-allowed ${
                        isSubmitting 
                          ? 'bg-[var(--ink)]/30' 
                          : 'bg-[var(--chalk)] shadow-lg shadow-[var(--chalk)]/20 hover:-translate-y-0.5 hover:bg-[var(--rust)] hover:shadow-[var(--rust)]/20 active:translate-y-0'
                      }`}
                    >
                      {isSubmitting ? 'Sending Request…' : 'Submit Tutor Request'}
                    </button>
                    <p className="mt-5 flex items-center justify-center gap-2 text-center font-mono text-[11px] font-medium text-[var(--ink)]/40">
                      <span className="text-sm drop-shadow-sm">🔒</span> Your details are shared only with matched tutors.
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* --- FOOTER (ANCHORS THE BOTTOM) --- */}
      <footer className="mt-auto bg-[var(--chalk)] py-10 text-center font-mono text-[12px] font-medium uppercase tracking-widest text-[var(--paper)]/50">
        Learning Hub — connecting educators and students, one lesson at a time.
      </footer>
    </div>
  );
}