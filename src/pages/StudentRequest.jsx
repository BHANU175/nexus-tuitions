import { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import Maintenance from './Maintenance';
import CustomBadge from '../components/CustomBadge';

/* ---------------------------------------------------------------------- */
/* Static data & Configurations                                           */
/* ---------------------------------------------------------------------- */

const DEFAULT_CLASS_LEVELS = [
  'Pre-Nursery', 'Nursery', 'LKG', 'UKG',
  'Class 1', 'Class 2', 'Class 3', 'Class 4',
  'Class 5', 'Class 6', 'Class 7', 'Class 8',
  'Class 9', 'Class 10', 'Class 11', 'Class 12',
];

const DEFAULT_SUBJECT_SUGGESTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 
  'English', 'Accountancy', 'Economics', 'Science', 'Social Studies'
];
const MAX_SUBJECTS = 8;

const DEFAULT_MODES = [
  { id: 'online', label: 'Online', icon: '💻', desc: 'Live virtual 1-on-1 sessions' },
  { id: 'offline', label: "At tutor's studio", icon: '🏫', desc: 'Structured local learning center' },
  { id: 'personal', label: 'At my home', icon: '🏠', desc: 'Convenient doorstep tutoring' },
];

const DEFAULT_TRUST_BENEFITS = [
  { icon: '🛡️', title: 'Verified educators', copy: 'Every tutor undergoes strict identity checks and background verification before onboarding.' },
  { icon: '🔒', title: 'Private & secure', copy: 'Your contact details are shared exclusively with your assigned academic advisor.' },
  { icon: '⏱️', title: 'Rapid 18hr turnaround', copy: 'An expert learning advisor reviews your criteria and matches profiles swiftly.' },
  { icon: '🎯', title: 'Curated matching', copy: 'Hand-picked educators matched to your child’s learning pace and board curriculum.' },
  { icon: '📋', title: 'Zero obligation', copy: 'Consultation and advisor matching are completely free with no hidden fees.' },
  { icon: '📞', title: 'Dedicated support', copy: 'Direct access to human advisors throughout your tutoring journey.' },
];

const DEFAULT_HOW_STEPS = [
  { title: 'Define your needs', copy: "Share your child's class, target subjects, and preferred mode." },
  { title: 'Advisor curation', copy: 'Our Jaipur education team hand-selects vetted local specialists.' },
  { title: 'Begin sessions', copy: 'Meet your tutor, evaluate synergy, and start structured learning.' },
];

const DEFAULT_NEXT_STEPS = [
  { icon: '🔍', text: 'An advisor reviews your requirements' },
  { icon: '🤝', text: 'We share 1–2 matched tutor profiles' },
  { icon: '🎓', text: 'You confirm and schedule the first session' },
];

const DEFAULT_BANNER_SLIDES = [
  { note: 'Expert private tutors for Classes 1 to 12 across all major school boards in Jaipur.' },
  { note: 'Rigorous background verification for absolute safety and academic excellence.' },
  { note: 'Zero placement fees. Get matched with top educators within 18 hours.' },
];

const DEFAULT_PLATFORM_STATS = [
  { label: 'Verified Tutors in Jaipur', value: '450+' },
  { label: 'Average Match Window', value: '< 18 hrs' },
  { label: 'Parent Satisfaction Score', value: '4.9 / 5' },
];

const DEFAULT_NAV_LINKS = [
  { label: 'Why Us', href: '/#why' },
  { label: 'Find a Tutor', href: '/request-tutor', current: 'true' },
  { label: 'Become a Tutor', href: '/apply-teacher' },
  { label: 'Contact Us', href: '/contact' },
];

const DEFAULT_HERO = {
  badge: "Jaipur's Premier Academic Concierge (Classes 1-12)",
  titleStart: 'Find the ultimate tutor, expertly matched for',
  titleHighlight: 'your child',
  description: 'From foundational early classes to high-stakes Class 12 board exam preparation, our academic advisors personally curate verified educators across Jaipur.',
  primaryCtaText: 'Request a tutor',
  secondaryCtaText: 'See how it works',
  footnote: 'Free advisor consultation · No placement fees · Responses within 18 hours',
};

const DEFAULT_SECTIONS = {
  whyTrustTitle: 'An advisory process built for total confidence',
  whyTrustSubtitle: "Finding the right mentor shouldn't feel uncertain. Here's our operational standard for every match.",
  howItWorksTitle: 'Three clear steps to your first session',
  requestFormTitle: 'Request your tutor match',
  requestFormSubtitle: 'Complete the secure form below. An academic advisor will review your criteria today.',
  successTitle: 'Request Registered Successfully!',
  successSubtitle: 'Thank you. One of our senior learning advisors in Jaipur has received your criteria and is carefully vetting the ideal tutor match. You will hear from us within 18 hours.',
};

/* Maps site_content row keys to fields on this page's `content` state.
   Must exactly match STUDENT_KEYS in SiteContentManager.jsx */
const STUDENT_CONTENT_KEYS = {
  hero: 'student_hero',
  nav: 'student_nav',
  sections: 'student_sections',
  trustBenefits: 'student_trust_benefits',
  howSteps: 'student_how_steps',
  nextSteps: 'student_next_steps',
  bannerSlides: 'student_banner_slides',
  platformStats: 'student_platform_stats',
  classLevels: 'student_class_levels',
  subjectSuggestions: 'student_subject_suggestions',
  teachingModes: 'student_teaching_modes',
};

function parseSiteContentValue(raw) {
  if (typeof raw !== 'string') return raw;
  const t = raw.trim();
  if (t.startsWith('[') || t.startsWith('{')) {
    try { return JSON.parse(t); } catch { return raw; }
  }
  return raw;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

const WHATSAPP_URL = "https://wa.me/919588057703";

const SELECT_ARROW_URL =
  "data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E";

const LOGO_URL = "/logo.png";

/* ---------------------------------------------------------------------- */
/* Helper UI Components                                                   */
/* ---------------------------------------------------------------------- */

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marigold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]";

function Field({ label, htmlFor, error, hint, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/80 pl-1">
        {label}
      </label>
      {children}
      {error ? (
        <p className="font-mono text-[11px] font-semibold text-[var(--rust)] pl-1 animate-shake" role="alert">{error}</p>
      ) : hint ? (
        <p className="text-[11px] font-medium text-[var(--ink)]/40 pl-1">{hint}</p>
      ) : null}
    </div>
  );
}

const inputClass = (hasError) =>
  `w-full rounded-2xl border-2 bg-white px-5 py-4 text-sm font-semibold text-[var(--ink)] placeholder-[var(--ink)]/30 shadow-xs transition-all focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--marigold)]/15 ${
    hasError ? 'border-[var(--rust)] focus:border-[var(--rust)]' : 'border-[var(--line)] focus:border-[var(--marigold)]'
  }`;

const selectClass = (hasError) =>
  `${inputClass(hasError)} cursor-pointer appearance-none bg-[url('${SELECT_ARROW_URL}')] bg-[length:12px_12px] bg-[right_1.25rem_center] bg-no-repeat`;

function SectionLabel({ children, stepNumber }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--marigold)]/10 font-mono text-xs font-bold text-[var(--marigold)]">
        {stepNumber}
      </span>
      <h3 className="font-serif text-xl font-black text-[var(--ink)]">{children}</h3>
      <div className="h-px flex-1 bg-[var(--line)]/60" />
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Decorative Illustrations + Rotating Banner                             */
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

function HeroBanner({ slides }) {
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      if (!pausedRef.current) setActive((a) => (a + 1) % slides.length);
    }, 4500);
    return () => clearInterval(id);
  }, [slides.length]);

  return (
    <div
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[var(--marigold)] to-[var(--rust)] shadow-2xl p-2"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(circle, var(--ink) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
      />
      <div className="relative grid grid-cols-1 items-center gap-6 px-6 py-10 sm:px-10 sm:py-12 md:grid-cols-[1fr_auto_auto] md:gap-8 md:px-12 md:py-12">
        <div className="mx-auto w-full max-w-[260px] -rotate-1 rounded-2xl bg-[var(--card)] p-6 shadow-xl md:mx-0">
          <p key={active} aria-live="polite" className="animate-in fade-in font-serif text-base font-bold leading-snug text-[var(--ink)] duration-500">
            {slides[active].note}
          </p>
          <div className="mt-5 flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show message ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${focusRing} ${i === active ? 'w-6 bg-[var(--marigold)]' : 'w-1.5 bg-[var(--ink)]/20'}`}
              />
            ))}
          </div>
        </div>
        <div className="hidden justify-self-center md:block">
          <NotebookIllustration />
        </div>
        <div className="hidden justify-self-center md:block">
          <MentorBadgeIllustration />
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Main Component                                                         */
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
  consent: false,
};

export default function StudentRequest() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  const [content, setContent] = useState({
    hero: DEFAULT_HERO,
    nav: { links: DEFAULT_NAV_LINKS },
    sections: DEFAULT_SECTIONS,
    trustBenefits: DEFAULT_TRUST_BENEFITS,
    howSteps: DEFAULT_HOW_STEPS,
    nextSteps: DEFAULT_NEXT_STEPS,
    bannerSlides: DEFAULT_BANNER_SLIDES,
    platformStats: DEFAULT_PLATFORM_STATS,
    classLevels: DEFAULT_CLASS_LEVELS,
    subjectSuggestions: DEFAULT_SUBJECT_SUGGESTIONS,
    teachingModes: DEFAULT_MODES,
  });

  // Check maintenance mode + load editable page content from Supabase
  useEffect(() => {
    let isMounted = true;
    async function fetchSiteData() {
      try {
        const [{ data: settingsData }, { data: contentRows, error: contentError }] = await Promise.all([
          supabase.from('app_settings').select('maintenance_mode').eq('id', 1).maybeSingle(),
          supabase.from('site_content').select('*'),
        ]);

        if (contentError) {
          console.error('[site_content] fetch failed — check Supabase RLS/select policy:', contentError.message || contentError);
        }

        if (isMounted && settingsData) {
          setIsMaintenance(Boolean(settingsData.maintenance_mode));
        }

        if (isMounted && contentRows) {
          const rowsDict = {};
          contentRows.forEach((row) => {
            rowsDict[row.key] = parseSiteContentValue(row.value);
          });

          setContent((prev) => {
            const next = { ...prev };
            Object.entries(STUDENT_CONTENT_KEYS).forEach(([field, key]) => {
              if (rowsDict[key] !== undefined) next[field] = rowsDict[key];
            });
            return next;
          });
        }
      } catch (err) {
        console.error('Failed to fetch app settings or site content:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchSiteData();

    const channel = supabase
      .channel('student-request-dynamic-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, (payload) => {
        if (payload.new && payload.new.maintenance_mode !== undefined) {
          setIsMaintenance(Boolean(payload.new.maintenance_mode));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, () => {
        fetchSiteData();
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [subjectInput, setSubjectInput] = useState('');
  const [errors, setErrors] = useState({});
  const [gpsError, setGpsError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);

  // State for Multi-Step Form & Success View
  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reveal a persistent mobile CTA once the visitor has scrolled past the hero
  useEffect(() => {
    const handleScroll = () => setShowStickyCta(window.scrollY > 700);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleConsentToggle = useCallback(() => {
    setFormData((prev) => ({ ...prev, consent: !prev.consent }));
    clearError('consent');
  }, [clearError]);

  /* ---- Subjects Tag System ---- */
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

  // Step Validation Logic
  const validateStep = useCallback((step) => {
    const e = {};
    if (step === 1) {
      if (!formData.student_name.trim()) e.student_name = "Enter the student's full name.";
      if (!formData.class_level) e.class_level = 'Select a class level.';
    }
    if (step === 2) {
      if (!formData.parent_name.trim()) e.parent_name = "Enter the parent's full name.";
      if (!EMAIL_RE.test(formData.email)) e.email = 'Enter a valid email address.';
      if (!PHONE_RE.test(formData.contact_number.replace(/\s/g, ''))) e.contact_number = 'Enter a valid 10-digit phone number.';
    }
    if (step === 3) {
      if (formData.subjects.length === 0) e.subjects = 'Add at least one subject requirement.';
      if (!formData.specific_area.trim()) e.specific_area = 'Enter your specific locality in Jaipur.';
      if (!formData.consent) e.consent = 'Please confirm you agree to be contacted about this request.';
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
    if (e) e.preventDefault();
    const stepErrors = validateStep(3);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setIsSubmitting(true);
    setStatusMessage({ text: 'Submitting your request securely…', type: 'loading' });

    try {
      await axios.post('https://learning-hub-backend-e5rl5lnse-nexus-9b39.vercel.app/api/public/student-request', {
        ...formData,
        subjects: formData.subjects, 
      });

      setIsSuccess(true);
      setStatusMessage({ text: '', type: '' });
    } catch (error) {
      console.error(error);
      setStatusMessage({ text: 'Connection error. Please verify your network and retry.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      handleNextStep();
    } else {
      handleSubmit(e);
    }
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  if (loading) {
    return (
      <div
        style={{
          '--paper': '#FDF9F1',
          '--ink': '#1C2420',
        }}
        className="flex min-h-screen items-center justify-center bg-[var(--paper)] font-sans text-[var(--ink)]"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--marigold)] border-t-transparent" />
          <p className="text-sm font-semibold tracking-wide text-[var(--ink)]/60">Loading academic portal...</p>
        </div>
      </div>
    );
  }

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <div
      style={{
        '--chalk': '#12392F',
        '--paper': '#FDF9F1',
        '--ink': '#1C2420',
        '--card': '#FFFFFF',
        '--marigold': '#E8903D',
        '--rust': '#C24D2C',
        '--line': '#DCDAD0',
        '--good': '#3D8A62',
      }}
      className="relative flex min-h-screen scroll-smooth flex-col bg-[var(--paper)] font-sans text-[var(--ink)] selection:bg-[var(--marigold)]/30"
    >
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 sm:px-6 md:px-10">
          <Link to="/" className={`flex items-center select-none rounded-lg ${focusRing}`}>
            <img
              src={LOGO_URL}
              alt="Nexus Tuitions"
              className="h-9 w-auto"
              width={190}
              height={65}
            />
          </Link>
          <div className="hidden items-center gap-8 font-sans text-sm font-semibold text-[var(--ink)] md:flex">
            {content.nav.links.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className={`rounded transition-colors hover:opacity-70 ${focusRing} ${link.current ? 'text-[var(--marigold)] font-bold' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-[var(--ink)] md:hidden ${focusRing}`}
          >
            <span className="relative block h-4 w-6">
              <span className={`absolute left-0 top-0 h-[2px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-[7px] rotate-45' : ''}`}></span>
              <span className={`absolute left-0 top-[7px] h-[2px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`absolute left-0 top-[14px] h-[2px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-[7px] -rotate-45' : ''}`}></span>
            </span>
          </button>
        </div>

        {/* Mobile nav panel */}
        <div className={`grid overflow-hidden border-t border-[var(--line)] bg-[var(--paper)] transition-all duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 border-t-0'}`}>
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {content.nav.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={closeMobileMenu}
                  className={`rounded-lg px-3 py-3 text-base font-bold hover:bg-[var(--chalk)]/5 ${focusRing} ${link.current ? 'text-[var(--marigold)]' : 'text-[var(--ink)]'}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2 lg:gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <div className="mb-6 inline-block">
                <CustomBadge text={content.hero.badge} variant="orange" />
              </div>
              <h1 className="font-serif text-4xl font-black leading-[1.1] tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
                {content.hero.titleStart} <span className="text-[var(--marigold)]">{content.hero.titleHighlight}</span>.
              </h1>
              <p className="mx-auto mt-6 text-base font-medium leading-relaxed text-[var(--ink)]/70 lg:mx-0 lg:text-lg">
                {content.hero.description}
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                <a
                  href="#request"
                  className={`w-full rounded-2xl bg-[var(--chalk)] px-8 py-4 text-center text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[var(--chalk)]/20 transition-all hover:-translate-y-0.5 hover:bg-[var(--marigold)] hover:shadow-2xl sm:w-auto ${focusRing}`}
                >
                  {content.hero.primaryCtaText}
                </a>
                <a
                  href="#how"
                  className={`w-full rounded-2xl border-2 border-[var(--line)] bg-white px-8 py-3.5 text-center text-sm font-black uppercase tracking-widest text-[var(--ink)]/70 transition-all hover:bg-gray-50 hover:border-gray-300 sm:w-auto ${focusRing}`}
                >
                  {content.hero.secondaryCtaText}
                </a>
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-[var(--ink)]/40">
                {content.hero.footnote}
              </p>
            </div>

            <div className="mx-auto w-full max-w-lg lg:max-w-none">
              <HeroBanner slides={content.bannerSlides} />
            </div>
          </div>

          {/* --- PLATFORM STATS BAR --- */}
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {content.platformStats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between sm:justify-start sm:gap-6 rounded-2xl bg-white/80 border border-[var(--line)] px-6 py-5 shadow-sm backdrop-blur-sm">
                <span className="font-serif text-3xl font-black text-[var(--marigold)]">{stat.value}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]/60">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* --- WHY TRUST US --- */}
      <section className="relative py-16 sm:py-24 bg-white/40 border-t border-[var(--line)]/50">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              {content.sections.whyTrustTitle}
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-[var(--ink)]/70">
              {content.sections.whyTrustSubtitle}
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {content.trustBenefits.map((b) => (
              <div key={b.title} className="group rounded-3xl bg-white border border-[var(--line)]/60 p-8 shadow-xs transition-all hover:-translate-y-1 hover:shadow-xl hover:border-[var(--marigold)]/40">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--paper)] border border-[var(--line)] text-xl transition-transform group-hover:scale-110">
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
              {content.sections.howItWorksTitle}
            </h2>
          </div>

          <div className="relative mt-16 flex flex-col gap-12 md:flex-row md:justify-between md:gap-8">
            <div aria-hidden="true" className="absolute left-[15%] right-[15%] top-7 hidden h-0.5 rounded-full bg-[var(--line)] md:block" />
            {content.howSteps.map((s, i) => (
              <div key={s.title} className="relative z-10 flex flex-1 flex-col items-center text-center">
                <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--marigold)] font-mono text-lg font-black text-white shadow-lg shadow-[var(--marigold)]/25 ring-4 ring-[var(--paper)] transition-transform hover:scale-110">
                  0{i + 1}
                </span>
                <h3 className="mb-2 text-lg font-black text-[var(--ink)]">{s.title}</h3>
                <p className="max-w-[260px] text-sm font-medium leading-relaxed text-[var(--ink)]/60">{s.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- REQUEST FORM (MULTI-STEP & SUCCESS VIEW) --- */}
      <section id="request" className="relative pb-24 pt-16 sm:pt-24 border-t border-[var(--line)]/50 bg-white/20">
        <div className="relative mx-auto max-w-[760px] px-4 sm:px-6 md:px-10">
          <div className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              {content.sections.requestFormTitle}
            </h2>
            <p className="mt-3 text-base font-medium text-[var(--ink)]/70">
              {content.sections.requestFormSubtitle}
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]/50">
              Prefer to talk it through? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`font-bold text-[var(--marigold)] underline underline-offset-2 rounded ${focusRing}`}>Message us on WhatsApp</a> instead.
            </p>
          </div>

          {statusMessage.text && (
            <div
              role="status"
              aria-live="polite"
              className="mb-8 flex items-center gap-4 rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-bold text-red-700 shadow-xs"
            >
              <span className="flex-1 text-[15px]">{statusMessage.text}</span>
            </div>
          )}

          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-[var(--chalk)]/5 ring-1 ring-[var(--line)]">
            {isSuccess ? (
              /* --- SUCCESS CARD SCREEN --- */
              <div className="p-8 sm:p-14 text-center animate-in fade-in zoom-in-95 duration-500">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-3xl shadow-inner">
                  ✓
                </div>
                <h3 className="font-serif text-3xl font-black text-[var(--ink)] mb-3">{content.sections.successTitle}</h3>
                <p className="text-base font-medium text-[var(--ink)]/70 max-w-md mx-auto mb-8 leading-relaxed">
                  {content.sections.successSubtitle}
                </p>

                <div className="mx-auto mb-8 grid max-w-lg grid-cols-1 gap-4 text-left sm:grid-cols-3">
                  {content.nextSteps.map((step, i) => (
                    <div key={i} className="rounded-2xl border border-[var(--line)] bg-[var(--paper)]/60 p-4">
                      <span className="text-2xl" aria-hidden="true">{step.icon}</span>
                      <p className="mt-2 text-xs font-bold leading-relaxed text-[var(--ink)]/70">{step.text}</p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setFormData(INITIAL_FORM);
                    setCurrentStep(1);
                  }}
                  className={`rounded-2xl bg-[var(--chalk)] px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all hover:bg-[var(--marigold)] ${focusRing}`}
                >
                  Submit Another Request
                </button>

                <p className="mt-6 text-sm font-semibold text-[var(--ink)]/50">
                  Questions in the meantime? <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={`font-bold text-[var(--marigold)] underline underline-offset-2 rounded ${focusRing}`}>Message us on WhatsApp</a>.
                </p>
              </div>
            ) : (
              /* --- MULTI-STEP FORM --- */
              <>
                <div className="flex h-2 w-full bg-[var(--line)]/50">
                  <div 
                    className="bg-gradient-to-r from-[var(--marigold)] to-[var(--rust)] transition-all duration-500" 
                    style={{ width: `${(currentStep / 3) * 100}%` }} 
                  />
                </div>

                <div className="p-6 sm:p-10">
                  <div className="mb-8 border-b border-[var(--line)]/40 pb-4">
                    {/* Compact progress for narrow screens */}
                    <div className="flex items-center justify-between sm:hidden">
                      <span className="text-xs font-black uppercase tracking-widest text-[var(--marigold)]">Step {currentStep} of 3</span>
                      <div className="flex gap-1.5" aria-hidden="true">
                        {[1, 2, 3].map((s) => (
                          <span key={s} className={`h-1.5 w-6 rounded-full transition-colors ${currentStep >= s ? 'bg-[var(--marigold)]' : 'bg-[var(--line)]'}`} />
                        ))}
                      </div>
                    </div>
                    {/* Full step labels for wider screens */}
                    <div className="hidden justify-between text-xs font-bold uppercase tracking-widest text-[var(--ink)]/40 sm:flex">
                      <span aria-current={currentStep === 1 ? 'step' : undefined} className={currentStep >= 1 ? 'text-[var(--marigold)] font-black' : ''}>Step 1: Student</span>
                      <span aria-current={currentStep === 2 ? 'step' : undefined} className={currentStep >= 2 ? 'text-[var(--marigold)] font-black' : ''}>Step 2: Parent</span>
                      <span aria-current={currentStep === 3 ? 'step' : undefined} className={currentStep >= 3 ? 'text-[var(--marigold)] font-black' : ''}>Step 3: Location & Subjects</span>
                    </div>
                  </div>

                  <form onSubmit={handleFormSubmit} noValidate>
                    {/* --- STEP 1: STUDENT DETAILS --- */}
                    {currentStep === 1 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                        <SectionLabel stepNumber="1">Student Information</SectionLabel>
                        <Field label="Student's full name" htmlFor="student_name" error={errors.student_name}>
                          <input
                            id="student_name" name="student_name" type="text" autoComplete="name" placeholder="e.g. Aarav Sharma"
                            value={formData.student_name} onChange={handleChange} className={inputClass(errors.student_name)}
                          />
                        </Field>
                        <Field label="Class Selection (Classes 1 to 12 & Early Years)" htmlFor="class_level" error={errors.class_level} hint="Choose the precise current academic class level">
                          <select
                            id="class_level" name="class_level" value={formData.class_level} onChange={handleChange}
                            className={selectClass(errors.class_level)}
                          >
                            <option value="" disabled>Select class level</option>
                            {content.classLevels.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </Field>
                      </div>
                    )}

                    {/* --- STEP 2: PARENT DETAILS --- */}
                    {currentStep === 2 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                        <SectionLabel stepNumber="2">Parent / Guardian Contact</SectionLabel>
                        <Field label="Parent's full name" htmlFor="parent_name" error={errors.parent_name}>
                          <input
                            id="parent_name" name="parent_name" type="text" autoComplete="name" placeholder="e.g. Rajesh Sharma"
                            value={formData.parent_name} onChange={handleChange} className={inputClass(errors.parent_name)}
                          />
                        </Field>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <Field label="Parent email address" htmlFor="email" error={errors.email}>
                            <input
                              id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
                              value={formData.email} onChange={handleChange} className={inputClass(errors.email)}
                            />
                          </Field>
                          <Field label="Contact phone number" htmlFor="contact_number" error={errors.contact_number}>
                            <input
                              id="contact_number" name="contact_number" type="tel" autoComplete="tel" placeholder="98765 43210"
                              value={formData.contact_number} onChange={handleChange} className={inputClass(errors.contact_number)}
                            />
                          </Field>
                        </div>
                        <p className="pl-1 text-[11px] font-medium text-[var(--ink)]/40">
                          We'll only use these details to match you with a tutor and follow up on this request — never spam, never shared with third parties.
                        </p>
                      </div>
                    )}

                    {/* --- STEP 3: LEARNING NEEDS & LOCATION --- */}
                    {currentStep === 3 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                        <SectionLabel stepNumber="3">Academic Requirements & Location</SectionLabel>
                        <Field
                          label="Subjects Required"
                          htmlFor="subject_input"
                          error={errors.subjects}
                          hint={`Add each subject individually · up to ${MAX_SUBJECTS}`}
                        >
                          {formData.subjects.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {formData.subjects.map((subject) => (
                                <span
                                  key={subject}
                                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--marigold)]/10 px-4 py-2 text-xs font-bold text-[var(--ink)] border border-[var(--marigold)]/20 shadow-xs"
                                >
                                  {subject}
                                  <button
                                    type="button"
                                    onClick={() => removeSubject(subject)}
                                    aria-label={`Remove ${subject}`}
                                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[var(--rust)] transition-colors hover:bg-[var(--rust)]/10 ${focusRing}`}
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex gap-3">
                            <input
                              id="subject_input" name="subject_input" type="text" placeholder="e.g. Physics, Accountancy, Mathematics"
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
                              className={`shrink-0 rounded-2xl bg-[var(--chalk)] px-6 text-xs font-black uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 hover:bg-[var(--marigold)] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}
                            >
                              + Add
                            </button>
                          </div>
                          {formData.subjects.length < MAX_SUBJECTS && (
                            <div className="flex flex-wrap items-center gap-2 pt-3">
                              <span className="mr-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/50">
                                Suggested:
                              </span>
                              {content.subjectSuggestions
                                .filter((s) => !formData.subjects.some((f) => f.toLowerCase() === s.toLowerCase()))
                                .map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => addSubject(s)}
                                    className={`rounded-full border border-[var(--line)] bg-white px-3.5 py-1.5 text-xs font-semibold text-[var(--ink)]/80 transition-all hover:border-[var(--marigold)] hover:bg-[var(--marigold)]/5 shadow-2xs ${focusRing}`}
                                  >
                                    + {s}
                                  </button>
                                ))}
                            </div>
                          )}
                        </Field>

                        <div className="space-y-4">
                          <span className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/80 pl-1">
                            Preferred tutoring mode
                          </span>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {content.teachingModes.map((mode) => (
                              <button
                                type="button" key={mode.id} onClick={() => handleModeSelect(mode.id)}
                                aria-pressed={formData.preferred_mode === mode.id}
                                className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 p-4 text-center transition-all ${focusRing} ${
                                  formData.preferred_mode === mode.id
                                    ? 'border-[var(--marigold)] bg-[var(--marigold)]/5 text-[var(--ink)] shadow-xs ring-2 ring-[var(--marigold)]/20'
                                    : 'border-[var(--line)] bg-gray-50/50 text-[var(--ink)]/60 hover:bg-gray-50'
                                }`}
                              >
                                <span className="text-3xl drop-shadow-xs">{mode.icon}</span>
                                <span className="text-sm font-bold">{mode.label}</span>
                                <span className="text-[11px] font-medium text-[var(--ink)]/50">{mode.desc}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                          <Field label="City Location" hint="Active service zone">
                            <div className="flex items-center gap-2 rounded-2xl border-2 border-[var(--line)] bg-gray-50/50 px-5 py-4 text-sm font-semibold text-[var(--ink)]/80">
                              <span aria-hidden="true">📍</span> Jaipur, Rajasthan
                            </div>
                          </Field>
                          <Field label="Specific Area / Locality" htmlFor="specific_area" error={errors.specific_area}>
                            <div className="flex gap-3">
                              <input
                                id="specific_area" name="specific_area" type="text" placeholder="e.g. Malviya Nagar, C-Scheme"
                                value={formData.specific_area} onChange={handleChange}
                                className={inputClass(errors.specific_area)}
                              />
                              <button
                                type="button" onClick={handleGetLocation} disabled={isLocating}
                                className={`shrink-0 rounded-2xl border-2 px-5 text-xs font-bold transition-all ${focusRing} ${
                                  formData.location_coords
                                    ? 'border-[var(--good)] bg-[var(--good)] text-white shadow-xs'
                                    : 'border-[var(--line)] bg-white text-[var(--ink)] hover:bg-gray-50'
                                }`}
                              >
                                {isLocating ? '···' : formData.location_coords ? '✓ Pinned' : '📍 GPS'}
                              </button>
                            </div>
                            {gpsError && <p className="font-mono text-[11px] font-semibold text-[var(--rust)] pl-1 pt-1">{gpsError}</p>}
                          </Field>
                        </div>

                        <div className="rounded-2xl border-2 border-[var(--line)] bg-gray-50/50 p-5">
                          <label htmlFor="consent" className="flex cursor-pointer items-start gap-3">
                            <input
                              id="consent"
                              name="consent"
                              type="checkbox"
                              checked={formData.consent}
                              onChange={handleConsentToggle}
                              className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-[var(--line)] text-[var(--marigold)] focus:ring-2 focus:ring-[var(--marigold)]/40 ${focusRing}`}
                            />
                            <span className="text-sm font-medium leading-relaxed text-[var(--ink)]/70">
                              I agree to be contacted by Nexus Tuitions and its advisors about this request, by phone, email, or WhatsApp. See our{' '}
                              <Link to="/privacy" className={`font-bold text-[var(--marigold)] underline underline-offset-2 rounded ${focusRing}`}>Privacy Policy</Link>.
                            </span>
                          </label>
                          {errors.consent && <p role="alert" className="mt-2 pl-8 font-mono text-[11px] font-semibold text-[var(--rust)]">{errors.consent}</p>}
                        </div>
                      </div>
                    )}

                    {/* --- NAVIGATION BUTTONS --- */}
                    <div className="mt-12 flex gap-4 pt-6 border-t border-[var(--line)]/50">
                      {currentStep > 1 && (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className={`rounded-2xl border-2 border-[var(--line)] px-6 py-4 text-sm font-black uppercase tracking-widest text-[var(--ink)]/70 transition-all hover:bg-gray-50 hover:text-[var(--ink)] ${focusRing}`}
                        >
                          Back
                        </button>
                      )}
                      
                      {currentStep < 3 ? (
                        <button
                          type="button"
                          onClick={handleNextStep}
                          className={`ml-auto rounded-2xl bg-[var(--chalk)] px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg shadow-[var(--chalk)]/20 transition-all hover:-translate-y-0.5 hover:bg-[var(--marigold)] hover:shadow-xl active:translate-y-0 ${focusRing}`}
                        >
                          Next Step
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className={`ml-auto rounded-2xl px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all disabled:cursor-not-allowed ${focusRing} ${
                            isSubmitting
                              ? 'bg-[var(--ink)]/30'
                              : 'bg-[var(--chalk)] shadow-lg shadow-[var(--chalk)]/20 hover:-translate-y-0.5 hover:bg-[var(--rust)] hover:shadow-xl active:translate-y-0'
                          }`}
                        >
                          {isSubmitting ? 'Transmitting Request…' : 'Submit Match Request'}
                        </button>
                      )}
                    </div>
                    {currentStep === 3 && (
                      <p className="mt-4 text-center text-[11px] font-semibold uppercase tracking-wider text-[var(--ink)]/40">
                        Free, no-obligation consultation · Advisors typically respond within 18 hours
                      </p>
                    )}
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="mt-auto border-t border-[var(--line)] bg-[var(--chalk)] py-12 text-center text-white">
        <div className="mx-auto max-w-[1200px] px-4 font-mono text-xs uppercase tracking-widest text-[var(--line)]/70">
          <div className="mb-6 flex flex-wrap justify-center gap-6 font-sans text-sm font-semibold capitalize text-white">
            <Link to="/#why" className="hover:text-[var(--marigold)]">Why Us</Link>
            <Link to="/request-tutor" className="hover:text-[var(--marigold)]">Find a Tutor</Link>
            <Link to="/apply-teacher" className="hover:text-[var(--marigold)]">Become a Tutor</Link>
            <Link to="/contact" className="hover:text-[var(--marigold)]">Contact Us</Link>
            <Link to="/privacy" className="hover:text-[var(--marigold)]">Privacy Policy</Link>
          </div>
          <p>Nexus Tuitions — connecting elite educators and ambitious students across Jaipur.</p>
        </div>
      </footer>

      {/* --- STICKY MOBILE CTA (jumps back to the request form) --- */}
      {!isSuccess && (
        <a
          href="#request"
          className={`fixed inset-x-0 bottom-0 z-40 flex items-center justify-center gap-2 border-t border-[var(--line)] bg-white/95 px-6 py-3.5 text-sm font-black uppercase tracking-widest text-[var(--chalk)] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-transform duration-300 sm:hidden ${focusRing} ${showStickyCta ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
        >
          Request a Tutor <span aria-hidden="true">→</span>
        </a>
      )}

      {/* --- QUICK CONTACT --- */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={`fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[var(--good)] text-2xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:flex ${focusRing}`}
      >
        💬
      </a>

      <style dangerouslySetInnerHTML={{__html: `
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}} />
    </div>
  );
}