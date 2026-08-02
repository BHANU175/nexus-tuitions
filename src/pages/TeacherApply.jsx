import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import Maintenance from './Maintenance'; // Adjust path if Maintenance.jsx lives elsewhere

/* ---------------------------------------------------------------------- */
/*  Static data                                                           */
/* ---------------------------------------------------------------------- */

const CITIES = ['Jaipur'];

const TEACHING_MODES = [
  { id: 'online', label: 'Remote / Online', icon: '💻' },
  { id: 'offline', label: "Tutor's location", icon: '🏫' },
  { id: 'personal', label: "Student's location", icon: '🏠' },
];

const STEPS = ['About you', 'Where you teach', 'Verify identity'];

const TRUST_CHIPS = ['Verified tutor profiles', 'No listing fees', 'You set your own rates'];

const BANNER_SLIDES = [
  { note: 'Set your own rates and teach on your schedule.' },
  { note: 'Every lead is verified before it reaches you.' },
  { note: 'Get paid for the sessions you actually run.' },
];

const ICON_TINTS = ['bg-[var(--marigold)]/10', 'bg-[var(--rust)]/10', 'bg-[var(--good)]/10', 'bg-[var(--chalk)]/8'];

const BENEFITS = [
  { icon: '🎯', title: 'Pre-verified leads', copy: 'Every student request is checked by our team before it reaches your dashboard, so you spend time teaching, not screening.' },
  { icon: '💸', title: 'Keep what you earn', copy: 'What you agree with a student is exactly what you take home. No hidden commission on your sessions.' },
  { icon: '⚖️', title: 'Full autonomy', copy: 'Choose your own subjects, schedule, teaching modes, and how far you are willing to travel.' },
  { icon: '🛡️', title: 'Secure verification', copy: 'ID checks on every profile keep the network safe and trustworthy for tutors and families alike.' },
  { icon: '🗓️', title: 'Flexible scheduling', copy: 'Teach mornings, evenings, or weekends only — the platform works around your calendar, not the other way round.' },
  { icon: '🤝', title: 'Real onboarding support', copy: 'Our team helps you set up a strong profile and answers questions as you get your first few students.' },
];

const JOIN_STEPS = [
  { title: 'Apply', copy: 'Share your subjects, availability, and where you teach.' },
  { title: 'Verify', copy: 'Our team checks your credentials and identity.' },
  { title: 'Match', copy: 'Get introduced to students who fit your style.' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;
const MAX_FILE_BYTES = 8 * 1024 * 1024;

const SUBJECT_SUGGESTIONS = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Hindi', 'Computer Science', 'Economics'];
const MAX_SUBJECTS = 8;

// Served from /public/logo.png
const LOGO_URL = "/logo.png";

/* ---------------------------------------------------------------------- */
/*  Helpers                                                                */
/* ---------------------------------------------------------------------- */

function compressImage(file, maxWidth = 1280, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) return resolve(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            resolve(new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  return digits.length > 5 ? `${digits.slice(0, 5)} ${digits.slice(5)}` : digits;
}

// Single source of truth for field validity, shared by per-field blur checks and step-level gating.
function validateField(name, value, extra = {}) {
  switch (name) {
    case 'fullName':
      return value.trim() ? '' : 'Enter your full name.';
    case 'email':
      return EMAIL_RE.test(value.trim()) ? '' : 'Enter a valid email address.';
    case 'contactNumber':
      return PHONE_RE.test(value.replace(/\s/g, '')) ? '' : 'Enter a valid 10-digit phone number.';
    case 'subjects':
      return (extra.subjects || []).length > 0 ? '' : 'Add at least one subject.';
    case 'specificArea':
      return value.trim() ? '' : 'Enter your area or locality.';
    case 'teachingModes':
      return (extra.teachingModes || []).length > 0 ? '' : 'Select at least one teaching mode.';
    default:
      return '';
  }
}

/* ---------------------------------------------------------------------- */
/*  Building Blocks                                                        */
/* ---------------------------------------------------------------------- */

function Field({ id, label, error, hint, valid, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/55">
          {label}
        </label>
        {valid && !error && (
          <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0 text-[var(--good)]">
            <path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {children}
      {error ? (
        <p id={id ? `${id}-error` : undefined} role="alert" className="font-mono text-[11px] font-semibold text-[var(--rust)]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-[var(--ink)]/40">{hint}</p>
      ) : null}
    </div>
  );
}

const inputClass = (hasError, isValid) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)] placeholder-[var(--ink)]/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]/40 ${
    hasError
      ? 'border-[var(--rust)] focus:border-[var(--rust)]'
      : isValid
      ? 'border-[var(--good)]/50 focus:border-[var(--marigold)]'
      : 'border-[var(--line)] focus:border-[var(--marigold)]'
  }`;

function FileUploadZone({ id, label, hint, file, previewUrl, accept, onFile, onRemove, error }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/55">
        {label}
      </label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-5 text-center transition-all duration-150 sm:p-6 ${
          dragOver
            ? 'scale-[1.01] border-[var(--marigold)] bg-[var(--marigold)]/10'
            : file
            ? 'border-[var(--good)] bg-[var(--good)]/5'
            : 'border-[var(--line)] bg-white hover:border-[var(--ink)]/30'
        }`}
      >
        {previewUrl ? (
          <div className="relative">
            <img src={previewUrl} alt="" className="h-16 w-16 rounded-full object-cover ring-2 ring-white shadow" />
            {onRemove && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                aria-label={`Remove ${label.toLowerCase()}`}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--rust)] text-[11px] font-bold leading-none text-white shadow transition-transform hover:scale-110"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          <div className="text-2xl">{file ? '📄' : '📎'}</div>
        )}
        <span className="max-w-full truncate text-xs font-bold text-[var(--ink)]">
          {file ? file.name : 'Drop a file or browse'}
        </span>
        <span className="font-mono text-[10px] text-[var(--ink)]/40">
          {file ? `${(file.size / 1024).toFixed(0)} KB` : hint}
        </span>
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={accept}
          onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
          className="hidden"
        />
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-[var(--ink)]/15 px-3 py-1 text-[11px] font-bold text-[var(--ink)]/70 transition-colors hover:border-[var(--ink)]/40"
          >
            {file ? 'Replace' : 'Browse files'}
          </button>
          {file && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-full border border-[var(--rust)]/25 px-3 py-1 text-[11px] font-bold text-[var(--rust)] transition-colors hover:bg-[var(--rust)]/10"
            >
              Remove
            </button>
          )}
        </div>
      </div>
      {error && <p role="alert" className="font-mono text-[11px] font-semibold text-[var(--rust)]">{error}</p>}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Illustrations + Hero Banner                                            */
/* ---------------------------------------------------------------------- */

function NotebookIllustration() {
  return (
    <svg width="200" height="154" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
    <svg width="154" height="154" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[var(--marigold)] to-[var(--rust)] sm:rounded-[2.5rem]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: 'radial-gradient(circle, var(--ink) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}
      />
      <div className="relative grid grid-cols-1 items-center gap-8 px-6 py-10 sm:px-10 sm:py-12 md:grid-cols-[1fr_auto_auto] md:gap-10 md:px-14 md:py-14">
        <div className="mx-auto w-full max-w-[240px] -rotate-2 rounded-2xl bg-[var(--card)] p-5 shadow-xl md:mx-0">
          <p key={active} className="animate-in fade-in font-serif text-base font-bold leading-snug text-[var(--ink)] duration-500">
            {BANNER_SLIDES[active].note}
          </p>
          <div className="mt-4 flex gap-1.5">
            {BANNER_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`Show message ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${i === active ? 'w-6 bg-[var(--marigold)]' : 'w-1.5 bg-[var(--ink)]/20'}`}
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

function Stepper({ steps, current, onStepClick }) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((label, i) => {
          const isDone = i < current;
          const isActive = i === current;
          const clickable = i < current;
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                onClick={() => clickable && onStepClick(i)}
                disabled={!clickable}
                aria-current={isActive ? 'step' : undefined}
                className={`group flex flex-col items-center gap-2 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold transition-all duration-200 ${
                    isDone
                      ? 'bg-[var(--good)] text-white'
                      : isActive
                      ? 'bg-[var(--chalk)] text-white ring-4 ring-[var(--marigold)]/25'
                      : 'bg-[var(--line)]/40 text-[var(--ink)]/40'
                  } ${clickable ? 'group-hover:scale-105' : ''}`}
                >
                  {isDone ? (
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M4 10.5 8 14.5 16 5.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </span>
                <span
                  className={`hidden font-mono text-[10px] font-bold uppercase tracking-wider sm:block ${
                    isActive ? 'text-[var(--ink)]' : 'text-[var(--ink)]/40'
                  }`}
                >
                  {label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <span
                  className={`mx-2 h-px flex-1 transition-colors duration-300 sm:mx-3 ${
                    isDone ? 'bg-[var(--good)]' : 'bg-[var(--line)]/50'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/40 sm:hidden">
        Step {current + 1} of {steps.length} — {steps[current]}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Main Component                                                         */
/* ---------------------------------------------------------------------- */

export default function TeacherApply() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [docUploadEnabled, setDocUploadEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  // Fetch and sync app settings from Supabase
  useEffect(() => {
    async function checkAppSettings() {
      try {
        console.log("📡 Fetching app_settings from Supabase...");
        
        const { data, error } = await supabase
          .from('app_settings')
          .select('*') // Selecting all to see what actually exists
          .eq('id', 1)
          .maybeSingle();

        console.log("📦 Supabase Response:", { data, error });

        if (error) {
          console.error("❌ Supabase Error:", error.message);
        }

        if (data) {
          setIsMaintenance(Boolean(data.maintenance_mode));
          
          // More resilient boolean check handling tinyints (1/0), strings, or booleans
          const isUploadEnabled = 
            data.enable_doc_upload === true || 
            String(data.enable_doc_upload).toLowerCase() === 'true' || 
            data.enable_doc_upload === 1;
            
          console.log("⚙️ Evaluated docUploadEnabled:", isUploadEnabled);
          setDocUploadEnabled(isUploadEnabled);
        } else {
          console.warn("⚠️ No data returned! Is there a row with id=1? Or is RLS blocking it?");
        }
      } catch (err) {
        console.error('🔥 Failed to fetch app settings:', err);
      } finally {
        setLoading(false);
      }
    }

    checkAppSettings();

    // Realtime listener
    const channel = supabase
      .channel('teacher-apply-settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, (payload) => {
        console.log("🔄 Realtime Update Received:", payload.new);
        if (payload.new) {
          setIsMaintenance(Boolean(payload.new.maintenance_mode));
          
          const isUploadEnabled = 
            payload.new.enable_doc_upload === true || 
            String(payload.new.enable_doc_upload).toLowerCase() === 'true' || 
            payload.new.enable_doc_upload === 1;
            
          setDocUploadEnabled(isUploadEnabled);
        }
      })
      .subscribe((status) => {
        console.log("🔌 Realtime Connection Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const [textData, setTextData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    city: 'Jaipur',
    specificArea: '',
    locationCoords: '',
  });

  const [subjects, setSubjects] = useState([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [teachingModes, setTeachingModes] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState('');
  const [idProofPreview, setIdProofPreview] = useState('');

  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [gpsError, setGpsError] = useState('');
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [lastApplicant, setLastApplicant] = useState({ name: '', email: '' });

  const stepRef = useRef(null);
  const didMountRef = useRef(false);

  // Move focus to the new step's first field for keyboard and screen-reader users,
  // but skip on initial mount so the page doesn't yank focus down on load.
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    const el = stepRef.current?.querySelector('input:not([type="file"]), select, textarea, button');
    el?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => () => { if (profilePhotoPreview) URL.revokeObjectURL(profilePhotoPreview); }, [profilePhotoPreview]);
  useEffect(() => () => { if (idProofPreview) URL.revokeObjectURL(idProofPreview); }, [idProofPreview]);

  const clearError = (name) =>
    setErrors((e) => {
      if (!(name in e)) return e;
      const next = { ...e };
      delete next[name];
      return next;
    });

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setTextData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const msg = validateField(name, value);
      setErrors((prev) => {
        const next = { ...prev };
        if (msg) next[name] = msg; else delete next[name];
        return next;
      });
    } else {
      clearError(name);
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setTextData((prev) => ({ ...prev, contactNumber: formatted }));
    if (touched.contactNumber) {
      const msg = validateField('contactNumber', formatted);
      setErrors((prev) => {
        const next = { ...prev };
        if (msg) next.contactNumber = msg; else delete next.contactNumber;
        return next;
      });
    } else {
      clearError('contactNumber');
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField(name, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[name] = msg; else delete next[name];
      return next;
    });
  };

  const addSubject = (value) => {
    const v = (value ?? subjectInput).trim();
    if (!v || subjects.length >= MAX_SUBJECTS) return;
    if (subjects.some((s) => s.toLowerCase() === v.toLowerCase())) { setSubjectInput(''); return; }
    setSubjects((prev) => [...prev, v]);
    setSubjectInput('');
    clearError('subjects');
  };

  const removeSubject = (value) => setSubjects((prev) => prev.filter((s) => s !== value));

  const handleSubjectKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSubject();
    } else if (e.key === 'Backspace' && !subjectInput && subjects.length) {
      removeSubject(subjects[subjects.length - 1]);
    }
  };

  const handleCheckboxChange = (e) => {
    const value = e.target.value;
    setTeachingModes((prev) => (prev.includes(value) ? prev.filter((m) => m !== value) : [...prev, value]));
    clearError('teachingModes');
  };

  const handleStepClick = (i) => { if (i < step) setStep(i); };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Location services are not supported in this browser.');
      return;
    }
    setIsLocating(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setTextData((prev) => ({
          ...prev,
          locationCoords: `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`,
        }));
        setIsLocating(false);
      },
      () => {
        setGpsError('Could not get your location. Check your browser permissions and try again.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleProfilePhoto = async (file) => {
    if (!file.type.startsWith('image/')) return setErrors((e) => ({ ...e, profilePhoto: 'Upload a JPG or PNG image.' }));
    if (file.size > MAX_FILE_BYTES) return setErrors((e) => ({ ...e, profilePhoto: 'That file is too large. Try one under 8MB.' }));
    const compressed = await compressImage(file, 1280, 0.85);
    setProfilePhotoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(compressed); });
    setProfilePhoto(compressed);
    clearError('profilePhoto');
  };

  const handleIdProof = async (file) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    if (!isImage && !isPdf) return setErrors((e) => ({ ...e, idProof: 'Upload a JPG, PNG, or PDF file.' }));
    if (file.size > MAX_FILE_BYTES) return setErrors((e) => ({ ...e, idProof: 'That file is too large. Try one under 8MB.' }));
    const finalFile = isImage ? await compressImage(file, 1600, 0.88) : file;
    setIdProofPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return isImage ? URL.createObjectURL(finalFile) : ''; });
    setIdProof(finalFile);
    clearError('idProof');
  };

  const handleRemoveProfilePhoto = () => {
    setProfilePhotoPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return ''; });
    setProfilePhoto(null);
  };

  const handleRemoveIdProof = () => {
    setIdProofPreview((prev) => { if (prev) URL.revokeObjectURL(prev); return ''; });
    setIdProof(null);
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 0) {
      ['fullName', 'email', 'contactNumber'].forEach((k) => {
        const msg = validateField(k, textData[k]);
        if (msg) e[k] = msg;
      });
      const subjectsErr = validateField('subjects', '', { subjects });
      if (subjectsErr) e.subjects = subjectsErr;
    }
    if (s === 1) {
      const areaErr = validateField('specificArea', textData.specificArea);
      if (areaErr) e.specificArea = areaErr;
      const modesErr = validateField('teachingModes', '', { teachingModes });
      if (modesErr) e.teachingModes = modesErr;
    }
    if (s === 2) {
      // ONLY enforce required files if doc uploads are enabled globally
      if (docUploadEnabled) {
        if (!profilePhoto) e.profilePhoto = 'A profile photo is required.';
        if (!idProof) e.idProof = 'An ID proof is required.';
      }
    }
    return e;
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setUploadProgress(0);
    setStatusMessage({ text: 'Uploading your application…', type: 'loading' });

    const formData = new FormData();
    Object.entries(textData).forEach(([k, v]) => {
      formData.append(k, k === 'contactNumber' ? v.replace(/\s/g, '') : v);
    });
    formData.append('subjects', subjects.join(', '));
    formData.append('teachingModes', JSON.stringify(teachingModes));

    // Append files only if selected
    if (profilePhoto) formData.append('profilePhoto', profilePhoto);
    if (idProof) formData.append('idProof', idProof);

    try {
      await axios.post('https://learning-hub-backend-one.vercel.app/api/public/teacher-apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => { if (evt.total) setUploadProgress(Math.round((evt.loaded * 100) / evt.total)); },
      });

      setLastApplicant({ name: textData.fullName, email: textData.email });
      setStatusMessage({ text: '', type: '' });
      setTextData({ fullName: '', email: '', contactNumber: '', city: 'Jaipur', specificArea: '', locationCoords: '' });
      setSubjects([]);
      setSubjectInput('');
      setTeachingModes([]);
      setProfilePhoto(null);
      setIdProof(null);
      setProfilePhotoPreview('');
      setIdProofPreview('');
      setTouched({});
      setErrors({});
      setStep(0);
      setSubmitted(true);
    } catch (error) {
      console.error(error);
      setStatusMessage({ text: 'We could not reach the server. Please check your connection and try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    const stepErrors = validateStep(step);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(stepErrors).map((k) => [k, true])) }));
      return;
    }

    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  if (loading) {
    return (
      <div
        style={{ '--paper': '#FDF9F1', '--ink': '#1C2420' }}
        className="flex min-h-screen items-center justify-center bg-[var(--paper)] font-sans text-[var(--ink)]"
      >
        <p className="text-sm font-semibold tracking-wide text-[var(--ink)]/60">Loading...</p>
      </div>
    );
  }

  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <div
      style={{
        '--chalk': '#16302A',
        '--paper': '#FDF9F1',
        '--ink': '#1C2420',
        '--card': '#FCFBF6',
        '--marigold': '#E7A23D',
        '--rust': '#B6472F',
        '--line': '#C9CBB8',
        '--good': '#3F7D5C',
      }}
      className="scroll-smooth bg-[var(--paper)] font-sans text-[var(--ink)] selection:bg-[var(--marigold)]/30"
    >
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-[var(--line)]/60 bg-[var(--paper)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10">
          <Link to="/" className="flex items-center select-none">
            <img
              src={LOGO_URL}
              alt="Nexus Tuitions"
              className="h-8 w-auto sm:h-9"
              width={190}
              height={65}
            />
          </Link>

          <div className="hidden items-center gap-8 font-mono text-[13px] font-bold uppercase tracking-wide text-[var(--ink)]/55 md:flex">
            <Link to="/" className="transition-colors hover:text-[var(--ink)]">Platform</Link>
            <a href="#why" className="transition-colors hover:text-[var(--ink)]">Why us</a>
            <Link to="/request-tutor" className="transition-colors hover:text-[var(--ink)]">Hire a tutor</Link>
          </div>

          <a
            href="#apply"
            className="rounded-lg bg-[var(--chalk)] px-3.5 py-2 text-xs font-bold text-[var(--paper)] transition-colors hover:bg-[var(--rust)] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Apply to teach
          </a>
        </div>
      </nav>

      {/* --- ROTATING BANNER --- */}
      <div className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-6 sm:pt-10 md:px-10">
        <HeroBanner />
      </div>

      {/* --- HERO --- */}
      <header className="relative overflow-hidden border-b border-[var(--line)]/50">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'repeating-linear-gradient(to bottom, var(--ink) 0, var(--ink) 1px, transparent 1px, transparent 34px)',
          }}
        />
        <div className="relative mx-auto max-w-[860px] px-4 py-14 text-center sm:px-6 sm:py-16 md:py-20">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink)]/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--marigold)]" />
            Educator network
          </div>
          <h1 className="font-serif text-4xl font-black leading-[1.08] tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
            Teach on your terms.<br />
            <span className="italic text-[var(--rust)]">Grow</span> your income.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-relaxed text-[var(--ink)]/60 sm:text-lg">
            Learning Hub connects you with students who fit your subjects, your schedule, and your
            teaching style — we handle the marketing, lead verification, and logistics.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#apply"
              className="w-full rounded-xl bg-[var(--chalk)] px-8 py-3.5 text-sm font-black uppercase tracking-widest text-[var(--paper)] transition-colors hover:bg-[var(--rust)] sm:w-auto"
            >
              Apply to teach
            </a>
            <a
              href="#why"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-8 py-3.5 text-sm font-black uppercase tracking-widest text-[var(--ink)]/70 transition-colors hover:border-[var(--ink)]/40 sm:w-auto"
            >
              See why tutors join
            </a>
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {TRUST_CHIPS.map((chip) => (
              <span key={chip} className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/45">
                <span className="text-[var(--good)]">✓</span>{chip}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* --- WHY US --- */}
      <section id="why" className="border-b border-[var(--line)]/50 bg-white py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">Why tutor with us</p>
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              Built around how educators actually work
            </h2>
            <p className="mt-4 text-base font-medium leading-relaxed text-[var(--ink)]/60">
              We built Learning Hub because good tutoring shouldn't be hard to find, or hard to
              offer. Every part of the platform is designed to put more of your time into teaching.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((b, i) => (
              <div key={b.title} className="rounded-2xl border border-[var(--line)]/50 bg-[var(--paper)]/60 p-6 transition-colors hover:bg-[var(--paper)]">
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-xl ${ICON_TINTS[i % ICON_TINTS.length]}`}>
                  {b.icon}
                </div>
                <h3 className="mb-1.5 font-black text-[var(--ink)]">{b.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-[var(--ink)]/55">{b.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how" className="border-b border-[var(--line)]/50 py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-[900px] px-4 sm:px-6 md:px-10">
          <div className="mx-auto max-w-xl text-center">
            <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">How joining works</p>
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              Three steps to your first student
            </h2>
          </div>

          <div className="relative mt-14 flex flex-col gap-10 md:flex-row md:justify-between md:gap-6">
            <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-6 hidden h-px bg-[var(--line)] md:block" />
            {JOIN_STEPS.map((s, i) => (
              <div key={s.title} className="relative z-10 flex items-start gap-4 md:w-1/3 md:flex-col md:items-center md:text-center">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--chalk)] font-mono text-base font-bold text-[var(--paper)] shadow-sm">
                  0{i + 1}
                </span>
                <div>
                  <h3 className="font-black text-[var(--ink)]">{s.title}</h3>
                  <p className="mt-1 max-w-[220px] text-sm font-medium leading-relaxed text-[var(--ink)]/55">{s.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- APPLY FORM --- */}
      <section id="apply" className="bg-white py-16 sm:py-20 md:py-24">
        <div className="mx-auto max-w-[720px] px-4 sm:px-6 md:px-10">
          <div className="mb-10 text-center">
            <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">Application</p>
            <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
              Apply to teach
            </h2>
            <p className="mt-3 text-sm font-medium text-[var(--ink)]/50">
              {submitted ? 'You are all set — here is what happens next.' : 'Three short steps. Verification usually takes 12–24 hours.'}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[var(--line)]/60 bg-[var(--card)] shadow-lg shadow-[var(--chalk)]/5">
            <div className="h-1.5 w-full bg-[var(--marigold)]" />
            <div className="p-6 sm:p-10">
              {submitted ? (
                <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-500 flex flex-col items-center py-4 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--good)]/10 text-[var(--good)]">
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <h3 className="mt-5 font-serif text-2xl font-black text-[var(--ink)]">
                    Application received{lastApplicant.name ? `, ${lastApplicant.name.split(' ')[0]}` : ''}!
                  </h3>
                  <p className="mt-2 max-w-sm text-sm font-medium leading-relaxed text-[var(--ink)]/60">
                    Our onboarding team will verify your details and reach out within 24 hours
                    {lastApplicant.email ? <> at <span className="font-bold text-[var(--ink)]">{lastApplicant.email}</span></> : ''}.
                  </p>
                  <div className="mt-6 grid w-full max-w-sm grid-cols-1 gap-2.5 text-left">
                    {[
                      'Our team reviews your subjects, area, and availability.',
                      'We verify your ID and profile photo.',
                      'You get an email once your profile is live.',
                    ].map((line, i) => (
                      <div key={line} className="flex items-start gap-3 rounded-xl bg-[var(--chalk)]/5 px-4 py-3">
                        <span className="mt-0.5 font-mono text-[11px] font-bold text-[var(--marigold)]">0{i + 1}</span>
                        <p className="text-xs font-medium leading-relaxed text-[var(--ink)]/70">{line}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitted(false)}
                    className="mt-7 rounded-xl border border-[var(--line)] px-6 py-3 text-xs font-black uppercase tracking-widest text-[var(--ink)]/70 transition-colors hover:border-[var(--ink)]/40"
                  >
                    Submit another application
                  </button>
                </div>
              ) : (
                <form onSubmit={onFormSubmit} noValidate>
                  <Stepper steps={STEPS} current={step} onStepClick={handleStepClick} />

                  {/* step content */}
                  <div ref={stepRef} key={step} className="min-h-[280px] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-300">
                    {step === 0 && (
                      <div className="space-y-5">
                        <Field
                          id="fullName" label="Full name" error={errors.fullName}
                          valid={touched.fullName && !errors.fullName && !!textData.fullName.trim()}
                        >
                          <input
                            id="fullName" name="fullName" type="text" autoComplete="name" placeholder="e.g. Aditi Sharma"
                            value={textData.fullName} onChange={handleTextChange} onBlur={handleBlur}
                            aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                            className={inputClass(errors.fullName, touched.fullName && !errors.fullName)}
                          />
                        </Field>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <Field
                            id="email" label="Email address" error={errors.email}
                            valid={touched.email && !errors.email && !!textData.email.trim()}
                          >
                            <input
                              id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
                              value={textData.email} onChange={handleTextChange} onBlur={handleBlur}
                              aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
                              className={inputClass(errors.email, touched.email && !errors.email)}
                            />
                          </Field>
                          <Field
                            id="contactNumber" label="Phone number" error={errors.contactNumber}
                            valid={touched.contactNumber && !errors.contactNumber && !!textData.contactNumber}
                          >
                            <input
                              id="contactNumber" name="contactNumber" type="tel" inputMode="numeric" autoComplete="tel"
                              placeholder="98765 43210" maxLength={11}
                              value={textData.contactNumber} onChange={handlePhoneChange} onBlur={handleBlur}
                              aria-invalid={!!errors.contactNumber} aria-describedby={errors.contactNumber ? 'contactNumber-error' : undefined}
                              className={inputClass(errors.contactNumber, touched.contactNumber && !errors.contactNumber)}
                            />
                          </Field>
                        </div>

                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <label htmlFor="subjectInput" className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/55">
                              Subjects you teach
                            </label>
                            <span className="font-mono text-[10px] font-medium text-[var(--ink)]/35">{subjects.length}/{MAX_SUBJECTS}</span>
                          </div>

                          {subjects.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {subjects.map((s) => (
                                <span
                                  key={s}
                                  className="flex items-center gap-1.5 rounded-full border border-[var(--marigold)]/40 bg-[var(--marigold)]/10 py-1.5 pl-3 pr-2 text-xs font-bold text-[var(--ink)]"
                                >
                                  {s}
                                  <button
                                    type="button" onClick={() => removeSubject(s)} aria-label={`Remove ${s}`}
                                    className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--ink)]/40 transition-colors hover:bg-[var(--ink)]/10 hover:text-[var(--ink)]"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <input
                              id="subjectInput" type="text"
                              placeholder={subjects.length ? 'Add another subject' : 'e.g. Calculus'}
                              value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} onKeyDown={handleSubjectKeyDown}
                              disabled={subjects.length >= MAX_SUBJECTS}
                              aria-invalid={!!errors.subjects} aria-describedby={errors.subjects ? 'subjects-error' : undefined}
                              className={inputClass(errors.subjects, subjects.length > 0)}
                            />
                            <button
                              type="button" onClick={() => addSubject()}
                              disabled={!subjectInput.trim() || subjects.length >= MAX_SUBJECTS}
                              className="shrink-0 rounded-xl bg-[var(--chalk)] px-5 text-xs font-black uppercase tracking-wider text-white transition-all hover:bg-[var(--marigold)] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              + Add
                            </button>
                          </div>

                          {subjects.length < MAX_SUBJECTS && (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <span className="mr-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--ink)]/35">Quick add:</span>
                              {SUBJECT_SUGGESTIONS.filter((s) => !subjects.some((f) => f.toLowerCase() === s.toLowerCase())).map((s) => (
                                <button
                                  key={s} type="button" onClick={() => addSubject(s)}
                                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[11px] font-semibold text-[var(--ink)]/60 transition-colors hover:border-[var(--marigold)] hover:text-[var(--ink)]"
                                >
                                  + {s}
                                </button>
                              ))}
                            </div>
                          )}
                          {errors.subjects && (
                            <p id="subjects-error" role="alert" className="font-mono text-[11px] font-semibold text-[var(--rust)]">{errors.subjects}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <Field id="city" label="City">
                            <select
                              id="city" name="city" value={textData.city} onChange={handleTextChange}
                              className={`${inputClass(false)} cursor-pointer`}
                            >
                              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </Field>
                          <Field
                            id="specificArea" label="Area / locality" error={errors.specificArea}
                            valid={touched.specificArea && !errors.specificArea && !!textData.specificArea.trim()}
                          >
                            <div className="flex gap-2">
                              <input
                                id="specificArea" name="specificArea" type="text" placeholder="e.g. Vaishali Nagar"
                                value={textData.specificArea} onChange={handleTextChange} onBlur={handleBlur}
                                aria-invalid={!!errors.specificArea} aria-describedby={errors.specificArea ? 'specificArea-error' : undefined}
                                className={inputClass(errors.specificArea, touched.specificArea && !errors.specificArea)}
                              />
                              <button
                                type="button" onClick={handleGetLocation} disabled={isLocating}
                                className={`shrink-0 rounded-xl border px-3 text-xs font-bold transition-colors ${
                                  textData.locationCoords
                                    ? 'border-[var(--good)] bg-[var(--good)]/10 text-[var(--good)]'
                                    : 'border-[var(--line)] bg-white text-[var(--ink)]/60 hover:border-[var(--ink)]/40'
                                } ${isLocating ? 'animate-pulse' : ''}`}
                              >
                                {isLocating ? '···' : textData.locationCoords ? '✓ Pinned' : '📍 GPS'}
                              </button>
                            </div>
                            {gpsError && <p role="alert" className="font-mono text-[11px] font-semibold text-[var(--rust)]">{gpsError}</p>}
                          </Field>
                        </div>

                        <div className="space-y-3">
                          <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/55">
                            Teaching mode
                          </label>
                          <div className="flex flex-wrap gap-2.5">
                            {TEACHING_MODES.map((mode) => (
                              <label
                                key={mode.id}
                                className={`flex cursor-pointer items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition-all active:scale-[0.97] ${
                                  teachingModes.includes(mode.id)
                                    ? 'border-[var(--marigold)] bg-[var(--marigold)]/10 text-[var(--ink)]'
                                    : 'border-[var(--line)] bg-white text-[var(--ink)]/55 hover:border-[var(--ink)]/30'
                                }`}
                              >
                                <input
                                  type="checkbox" value={mode.id} checked={teachingModes.includes(mode.id)}
                                  onChange={handleCheckboxChange} className="hidden"
                                />
                                <span>{mode.icon}</span>{mode.label}
                              </label>
                            ))}
                          </div>
                          {errors.teachingModes && (
                            <p role="alert" className="font-mono text-[11px] font-semibold text-[var(--rust)]">{errors.teachingModes}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-5">
                        {docUploadEnabled ? (
                          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <FileUploadZone
                              id="profilePhoto" label="Profile photo" hint="JPG or PNG, under 8MB"
                              file={profilePhoto} previewUrl={profilePhotoPreview} accept="image/*"
                              onFile={handleProfilePhoto} onRemove={handleRemoveProfilePhoto} error={errors.profilePhoto}
                            />
                            <FileUploadZone
                              id="idProof" label="Govt. ID proof" hint="PAN, Govt ID, or passport"
                              file={idProof} previewUrl={idProofPreview} accept="image/*,application/pdf"
                              onFile={handleIdProof} onRemove={handleRemoveIdProof} error={errors.idProof}
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-[var(--marigold)]/30 bg-[var(--marigold)]/10 p-5 text-center">
                            <p className="text-xs font-bold text-[var(--ink)]">
                              Document uploads are currently disabled by administration.
                            </p>
                            <p className="mt-1 text-xs text-[var(--ink)]/60">
                              You can proceed directly by clicking <strong>Submit application</strong>.
                            </p>
                          </div>
                        )}
                        <p className="rounded-xl bg-[var(--chalk)]/5 px-4 py-3 text-[11px] font-medium leading-relaxed text-[var(--ink)]/60">
                          Your documents are used only to verify your identity and are never shared publicly.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* status + progress */}
                  {statusMessage.text && (
                    <div
                      role="status" aria-live="polite"
                      className={`mt-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
                        statusMessage.type === 'error'
                          ? 'border-[var(--rust)]/30 bg-[var(--rust)]/8 text-[var(--rust)]'
                          : statusMessage.type === 'success'
                          ? 'border-[var(--good)]/30 bg-[var(--good)]/8 text-[var(--good)]'
                          : 'border-[var(--marigold)]/30 bg-[var(--marigold)]/10 text-[var(--ink)]'
                      }`}
                    >
                      {statusMessage.type === 'loading' && (
                        <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[var(--marigold)]/30 border-t-[var(--marigold)]" />
                      )}
                      <span className="flex-1">{statusMessage.text}</span>
                    </div>
                  )}
                  {isSubmitting && (
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--line)]/40">
                      <div
                        className="h-full rounded-full bg-[var(--marigold)] transition-all duration-200"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}

                  {/* nav buttons */}
                  <div className="mt-7 flex items-center justify-between gap-3">
                    {step > 0 ? (
                      <button
                        type="button" onClick={handleBack}
                        className="group flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[var(--ink)]/60 transition-colors hover:border-[var(--ink)]/40 hover:text-[var(--ink)]"
                      >
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="transition-transform group-hover:-translate-x-0.5">
                          <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                      </button>
                    ) : <span />}
                    <button
                      type="submit" disabled={isSubmitting}
                      className={`flex-1 rounded-xl py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all disabled:cursor-not-allowed sm:flex-none sm:px-10 ${
                        isSubmitting ? 'bg-[var(--ink)]/30' : 'bg-[var(--chalk)] hover:bg-[var(--rust)] active:scale-[0.98]'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {isSubmitting && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                        {isSubmitting ? 'Submitting…' : step === STEPS.length - 1 ? 'Submit application' : 'Continue'}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- CLOSING CTA --- */}
      <section className="bg-[var(--chalk)] py-14 sm:py-16">
        <div className="mx-auto flex max-w-[720px] flex-col items-center gap-5 px-4 text-center sm:px-6">
          <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">Ready when you are</p>
          <h2 className="font-serif text-2xl font-black tracking-tight text-[var(--paper)] sm:text-3xl">
            The application takes about five minutes.
          </h2>
          <a
            href="#apply"
            className="rounded-xl bg-[var(--marigold)] px-8 py-3.5 text-sm font-black uppercase tracking-widest text-[var(--ink)] transition-colors hover:bg-[var(--paper)]"
          >
            Start application
          </a>
        </div>
      </section>

      <footer className="bg-[var(--chalk)] py-6 text-center font-mono text-[11px] font-medium uppercase tracking-widest text-[var(--paper)]/40">
        nexus. tuitions — connecting educators and students, one lesson at a time.
      </footer>
    </div>
  );
}