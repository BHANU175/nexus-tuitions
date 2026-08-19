import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../supabaseClient';
import Maintenance from './Maintenance';
import CustomBadge from '../components/CustomBadge';

/* ---------------------------------------------------------------------- */
/*  Site-content helpers (mirrors the pattern used in Home.jsx /            */
/*  TeacherApply.jsx / StudentRequest.jsx so this page is editable from     */
/*  the same admin "Site Content" panel — no code changes needed to        */
/*  update the phone number, WhatsApp, email, Instagram handle, address,   */
/*  hours, map, FAQ or footer.)                                            */
/* ---------------------------------------------------------------------- */
function parseSiteContentValue(raw) {
  if (typeof raw !== 'string') return raw;
  const t = raw.trim();
  if (t.startsWith('[') || t.startsWith('{')) {
    try { return JSON.parse(t); } catch { return raw; }
  }
  return raw;
}

/* Maps site_content row keys -> fields on this page's content object.
   Every one of these can be edited independently from the admin panel. */
const CONTACT_CONTENT_KEYS = {
  global: 'contact_global',
  nav: 'contact_nav',
  hero: 'contact_hero',
  methods: 'contact_methods',
  socials: 'contact_socials',
  hours: 'contact_hours',
  form: 'contact_form',
  faq: 'contact_faq',
  footer: 'contact_footer',
};

/* ---------------------------------------------------------------------- */
/*  DEFAULT CONTENT FALLBACK — the page never breaks if the DB is empty.   */
/*  Swap the placeholder phone / email / Instagram handle / address below  */
/*  for the real ones (or better: edit them from the admin Site Content    */
/*  panel using the keys above, so nobody needs to touch code again).      */
/* ---------------------------------------------------------------------- */
const DEFAULT_CONTENT = {
  global: {
    logoUrl: '/logo.png',
    footerText: 'nexus. tuitions — connecting educators and students, one lesson at a time.',
  },
  nav: {
    links: [
      { label: 'Home', href: '/', isExternal: false },
      { label: 'Find a Tutor', href: '/request-tutor', isExternal: false },
      { label: 'Become a Tutor', href: '/apply-teacher', isExternal: false },
      { label: 'Contact', href: '/contact', isExternal: false },
    ],
  },
  hero: {
    badge: '📬 We usually reply within a few hours',
    title: "Let's talk",
    highlight: 'tutoring',
    description:
      "Questions about finding a tutor, applying to teach, or anything else? Reach us however's easiest — call, WhatsApp, email or Instagram — or send a message below.",
  },
  methods: [
    {
      id: 'phone',
      icon: '📞',
      label: 'Call Us',
      value: '+91 95880 57703',
      href: 'tel:+919588057703',
      actionLabel: 'Call now',
      type: 'call',
      note: 'Mon–Sat, 9 AM – 8 PM',
    },
    {
      id: 'whatsapp',
      icon: '💬',
      label: 'WhatsApp',
      value: '+91 95880 57703',
      href: 'https://wa.me/919588057703',
      actionLabel: 'Chat now',
      type: 'whatsapp',
      note: 'Fastest way to reach us',
    },
    {
      id: 'email',
      icon: '✉️',
      label: 'Email',
      value: 'hello@nexustuitions.com',
      href: 'mailto:hello@nexustuitions.com',
      actionLabel: 'Send an email',
      type: 'email',
      note: 'We reply within 24 hrs',
    },
  ],
  socials: [
    { id: 'instagram', icon: '📷', label: 'Instagram', handle: '@nexustuitions', url: 'https://instagram.com/nexustuitions' },
    { id: 'facebook', icon: '📘', label: 'Facebook', handle: 'Nexus Tuitions', url: 'https://facebook.com/nexustuitions' },
  ],
  hours: {
    title: 'Working Hours',
    rows: [
      { day: 'Monday – Saturday', time: '9:00 AM – 8:00 PM' },
      { day: 'Sunday', time: '10:00 AM – 4:00 PM' },
    ],
    note: 'All times in IST',
  },
  form: {
    title: 'Send us a message',
    description: "Fill this in and our team will get back to you shortly — no bots, real replies.",
    subjectOptions: ['Finding a tutor', 'Becoming a tutor', 'General question', 'Report an issue', 'Something else'],
    successTitle: 'Message sent!',
    successMessage: "Thanks for reaching out — we'll get back to you shortly.",
  },
  faq: {
    tagline: 'Quick Answers',
    title: 'Before you reach out',
    items: [
      { q: 'How fast do you reply?', a: 'Phone and WhatsApp are answered fastest during working hours. Email and the form below are typically answered within 24 hours.' },
      { q: 'Can I visit your office?', a: 'Yes — we take in-person meetings by appointment. Call or WhatsApp us to schedule a time before visiting.' },
      { q: 'I already submitted a request — why haven\'t I heard back?', a: 'Advisor matching can take up to 18 hours. If it has been longer than that, message us and we will check on it directly.' },
    ],
  },
  footer: {
    columns: [
      { title: 'Company', links: [{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact' }] },
      { title: 'For Families', links: [{ label: 'Find a Tutor', href: '/request-tutor' }] },
      { title: 'For Educators', links: [{ label: 'Become a Tutor', href: '/apply-teacher' }] },
    ],
  },
};

/* ---------------------------------------------------------------------- */
/*  Small presentational helpers                                          */
/* ---------------------------------------------------------------------- */
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marigold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]';

const inputClass = (hasError) =>
  `w-full rounded-xl border bg-white px-4 py-3 text-sm font-semibold text-[var(--ink)] placeholder-[var(--ink)]/30 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--marigold)]/40 ${
    hasError ? 'border-[var(--rust)] focus:border-[var(--rust)]' : 'border-[var(--line)] focus:border-[var(--marigold)]'
  }`;

function Field({ id, label, error, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/55">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="font-mono text-[11px] font-semibold text-[var(--rust)]">
          {error}
        </p>
      )}
    </div>
  );
}

/* Icon shown per contact-method type, used as the accent on the action button */
function methodAccent(type) {
  switch (type) {
    case 'whatsapp':
      return 'bg-[var(--good)] text-white hover:bg-[var(--good)]/90';
    case 'call':
      return 'bg-[var(--chalk)] text-white hover:bg-[var(--chalk)]/90';
    case 'email':
      return 'bg-[var(--marigold)] text-[var(--ink)] hover:bg-[var(--marigold)]/90';
    default:
      return 'bg-[var(--rust)] text-white hover:bg-[var(--rust)]/90';
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[6-9]\d{9}$/;

/* ---------------------------------------------------------------------- */
/*  Main Component                                                         */
/* ---------------------------------------------------------------------- */
export default function Contact() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [pageData, setPageData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [copiedId, setCopiedId] = useState('');

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ text: '', type: '' });

  /* ---- Fetch + live-sync dynamic content, exactly like the other pages ---- */
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [{ data: settingsData }, { data: contentRows, error: contentError }] = await Promise.all([
          supabase.from('app_settings').select('maintenance_mode').eq('id', 1).maybeSingle(),
          supabase.from('site_content').select('*'),
        ]);

        if (contentError) {
          console.error('[site_content] fetch failed — check Supabase RLS/select policy:', contentError.message || contentError);
        }

        if (settingsData && settingsData.maintenance_mode !== undefined) {
          setIsMaintenance(Boolean(settingsData.maintenance_mode));
        }

        if (contentRows) {
          const rowsDict = {};
          contentRows.forEach((row) => {
            rowsDict[row.key] = parseSiteContentValue(row.value);
          });

          // TEMP DEBUG — remove once the sync issue is confirmed fixed.
          // Shows exactly what was pulled from `site_content` for this page's keys.
          const contactRowsFound = {};
          Object.entries(CONTACT_CONTENT_KEYS).forEach(([field, key]) => {
            contactRowsFound[key] = rowsDict[key] !== undefined ? rowsDict[key] : '⛔ MISSING — no row in DB, or blocked by RLS';
          });
          console.log('[site_content] contact_* rows fetched from Supabase:', contactRowsFound);

          setPageData((prev) => {
            const next = { ...prev };
            Object.entries(CONTACT_CONTENT_KEYS).forEach(([field, key]) => {
              if (rowsDict[key] !== undefined) next[field] = rowsDict[key];
            });
            return next;
          });
        } else {
          console.warn('[site_content] contentRows was empty/undefined — table returned no rows at all (RLS or empty table).');
        }
      } catch (err) {
        console.error('Failed to fetch site content from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();

    const channel = supabase
      .channel('contact-page-dynamic-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, (payload) => {
        if (payload.new && payload.new.maintenance_mode !== undefined) {
          setIsMaintenance(Boolean(payload.new.maintenance_mode));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_content' }, () => {
        fetchInitialData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleNavigation = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  /* ---- Copy-to-clipboard for phone / email / address / socials ---- */
  const handleCopy = useCallback(async (value, id) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? '' : current)), 1800);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  }, []);

  /* ---- Contact form ---- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => setTouched((prev) => ({ ...prev, [e.target.name]: true }));

  const validate = useCallback(() => {
    const e = {};
    if (!formData.name.trim()) e.name = 'Please enter your name.';
    if (!formData.email.trim() || !EMAIL_RE.test(formData.email.trim())) e.email = 'Please enter a valid email address.';
    if (formData.phone && !PHONE_RE.test(formData.phone.replace(/\s/g, ''))) e.phone = 'Please enter a valid 10-digit phone number.';
    if (!formData.message.trim() || formData.message.trim().length < 10) e.message = 'Please add a few more details (min. 10 characters).';
    return e;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    setErrors(formErrors);
    setTouched({ name: true, email: true, phone: true, message: true });
    if (Object.keys(formErrors).length > 0) return;

    setIsSubmitting(true);
    setStatusMessage({ text: 'Sending your message…', type: 'loading' });

    try {
      // NOTE: point this at your real backend endpoint — mirrors the pattern
      // used by StudentRequest.jsx's /api/public/student-request call.
      await axios.post('https://learning-hub-backend-one.vercel.app/api/public/contact-message', formData);
      setIsSuccess(true);
      setStatusMessage({ text: '', type: '' });
    } catch (err) {
      console.error(err);
      setStatusMessage({ text: 'Connection error. Please try again, or reach us directly using the details above.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ '--paper': '#FDF9F1', '--ink': '#1C2420' }} className="flex min-h-screen items-center justify-center bg-[var(--paper)] font-sans text-[var(--ink)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--ink)]/20 border-t-[var(--ink)]"></div>
          <p className="text-sm font-semibold tracking-wide text-[var(--ink)]/60 animate-pulse">Loading contact details...</p>
        </div>
      </div>
    );
  }

  if (isMaintenance) return <Maintenance />;

  const { global, nav, hero, methods, socials, hours, form, faq, footer } = pageData;
  const whatsappMethod = methods.find((m) => m.type === 'whatsapp');
  const showDebug = typeof window !== 'undefined' && window.location.search.includes('debug=1');

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
      className="min-h-screen bg-[var(--paper)] font-sans text-[var(--ink)] selection:bg-[var(--marigold)]/30 scroll-smooth overflow-x-hidden"
    >
      {/* TEMP DEBUG PANEL — visit this page with ?debug=1 to see exactly what pageData
          the component is rendering with. Remove once the sync issue is resolved. */}
      {showDebug && (
        <div className="fixed inset-x-0 top-0 z-[9999] max-h-[50vh] overflow-auto bg-black/95 p-4 font-mono text-[11px] text-lime-300">
          <p className="mb-2 font-bold text-white">🔍 DEBUG — live pageData this page is rendering right now:</p>
          <pre className="whitespace-pre-wrap">{JSON.stringify(pageData, null, 2)}</pre>
        </div>
      )}

      {/* --- NAV --- */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--line)]/40 bg-[var(--paper)]/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" onClick={handleNavigation} className={`flex select-none items-center py-1 group rounded-lg ${focusRing}`}>
            <img src={global.logoUrl} alt="Nexus Tuitions" className="h-9 w-auto sm:h-10 object-contain bg-transparent border-0 outline-none shadow-none drop-shadow-none" />
          </Link>

          <div className="hidden items-center gap-8 text-[14px] font-bold tracking-wide text-[var(--ink)] lg:flex">
            {nav.links.map((link, idx) => {
              const isActive = link.href === '/contact';
              return (
                <Link
                  key={idx}
                  to={link.href}
                  onClick={handleNavigation}
                  className={`group relative rounded transition-colors hover:text-[var(--marigold)] ${isActive ? 'text-[var(--marigold)]' : ''} ${focusRing}`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1.5 left-0 h-[2px] bg-[var(--marigold)] transition-all duration-300 group-hover:w-full ${isActive ? 'w-full' : 'w-0'}`}></span>
                </Link>
              );
            })}
          </div>

          {whatsappMethod && (
            <div className="hidden items-center lg:flex">
              <a
                href={whatsappMethod.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-xl bg-[var(--chalk)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${focusRing}`}
              >
                {whatsappMethod.actionLabel} →
              </a>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-[var(--ink)] lg:hidden ${focusRing}`}
          >
            <span className="relative block h-4 w-6">
              <span className={`absolute left-0 top-0 h-[2px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-[7px] rotate-45' : ''}`}></span>
              <span className={`absolute left-0 top-[7px] h-[2px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`absolute left-0 top-[14px] h-[2px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-[7px] -rotate-45' : ''}`}></span>
            </span>
          </button>
        </div>

        <div className={`grid overflow-hidden border-t border-[var(--line)]/40 bg-[var(--paper)] transition-all duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 border-t-0'}`}>
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {nav.links.map((link, idx) => (
                <Link key={idx} to={link.href} onClick={handleNavigation} className={`rounded-lg px-3 py-3 text-base font-bold text-[var(--ink)] hover:bg-[var(--chalk)]/5 ${focusRing}`}>
                  {link.label}
                </Link>
              ))}
              {whatsappMethod && (
                <a href={whatsappMethod.href} target="_blank" rel="noopener noreferrer" className={`mt-2 rounded-xl bg-[var(--chalk)] px-5 py-3 text-center text-sm font-bold text-white shadow-sm ${focusRing}`}>
                  {whatsappMethod.actionLabel}
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* --- HERO --- */}
        <section className="relative mx-auto max-w-[1300px] overflow-hidden px-4 py-14 text-center sm:px-6 lg:px-8 lg:py-20">
          <div className="absolute top-[-10%] left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-[var(--marigold)]/10 blur-[100px] -z-10"></div>

          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--marigold)]/30 bg-[var(--marigold)]/10 px-4 py-2 text-xs font-bold text-[var(--rust)] shadow-[0_0_15px_rgba(243,140,53,0.15)] backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--marigold)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--rust)]"></span>
            </span>
            {hero.badge}
          </div>

          <h1 className="mx-auto mt-8 max-w-3xl break-words font-serif text-5xl font-black leading-[1.1] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
            {hero.title}{' '}
            <span className="relative inline-block text-[var(--chalk)] z-10">
              {hero.highlight}
              <svg className="absolute -bottom-3 left-0 w-full text-[var(--marigold)] -z-10" viewBox="0 0 200 12" fill="none">
                <path d="M3 9C60 -2 140 -2 197 9" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium leading-relaxed text-[var(--ink)]/60">{hero.description}</p>
        </section>

        {/* --- CONTACT METHOD CARDS (fully driven by `methods` — add, remove or edit any card from the admin panel) --- */}
        <section className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {methods.map((method) => (
              <div key={method.id} className="group relative flex flex-col justify-between rounded-3xl border border-[var(--line)]/60 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--chalk)]/5 text-2xl">{method.icon}</span>
                  <h3 className="mt-4 font-serif text-lg font-black text-[var(--ink)]">{method.label}</h3>
                  <p className="mt-1 break-words text-sm font-semibold text-[var(--ink)]/70">{method.value}</p>
                  {method.note && <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-[var(--ink)]/40">{method.note}</p>}
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <a
                    href={method.href}
                    target={method.type === 'call' || method.type === 'email' ? undefined : '_blank'}
                    rel={method.type === 'call' || method.type === 'email' ? undefined : 'noopener noreferrer'}
                    className={`flex-1 rounded-xl px-3 py-2.5 text-center text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${methodAccent(method.type)} ${focusRing}`}
                  >
                    {method.actionLabel}
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(method.value, method.id)}
                    aria-label={`Copy ${method.label}`}
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] text-sm text-[var(--ink)]/60 transition-all hover:border-[var(--ink)]/30 hover:text-[var(--ink)] ${focusRing}`}
                  >
                    {copiedId === method.id ? '✓' : '⧉'}
                  </button>
                </div>
                {copiedId === method.id && (
                  <span className="absolute -top-2 right-4 rounded-full bg-[var(--good)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow motion-safe:animate-in motion-safe:fade-in">
                    Copied
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- SOCIALS + HOURS --- */}
        <section className="mx-auto mt-6 grid max-w-[1300px] grid-cols-1 gap-5 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="rounded-3xl border border-[var(--line)]/60 bg-white p-6 shadow-sm lg:col-span-2">
            <h3 className="font-serif text-lg font-black text-[var(--ink)]">Follow along</h3>
            <p className="mt-1 text-sm font-medium text-[var(--ink)]/60">Tips, tutor spotlights and openings — follow us on socials.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-sm font-bold text-[var(--ink)] transition-all hover:-translate-y-0.5 hover:border-[var(--marigold)] hover:shadow-sm ${focusRing}`}
                >
                  <span className="text-base">{social.icon}</span>
                  {social.label}
                  <span className="text-[var(--ink)]/40 font-semibold">{social.handle}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--line)]/60 bg-[var(--chalk)] p-6 text-white shadow-sm">
            <h3 className="font-serif text-lg font-black">{hours.title}</h3>
            <div className="mt-4 flex flex-col gap-2.5">
              {hours.rows.map((row, idx) => (
                <div key={idx} className="flex items-center justify-between border-b border-white/10 pb-2.5 last:border-0 last:pb-0">
                  <span className="text-sm font-semibold text-white/80">{row.day}</span>
                  <span className="text-sm font-bold">{row.time}</span>
                </div>
              ))}
            </div>
            {hours.note && <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-white/40">{hours.note}</p>}
          </div>
        </section>

        {/* --- CONTACT FORM --- */}
        <section className="mx-auto mt-16 max-w-[800px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10">
            {/* Form */}
            <div className="rounded-3xl border border-[var(--line)]/60 bg-white p-6 shadow-sm sm:p-10">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--good)]/15 text-3xl text-[var(--good)]">✓</span>
                  <h3 className="mt-5 font-serif text-2xl font-black text-[var(--ink)]">{form.successTitle}</h3>
                  <p className="mt-2 max-w-sm text-sm font-medium text-[var(--ink)]/60">{form.successMessage}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
                      setTouched({});
                    }}
                    className={`mt-6 rounded-xl border border-[var(--line)] px-5 py-2.5 text-sm font-bold text-[var(--ink)] transition-colors hover:border-[var(--ink)]/40 ${focusRing}`}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="font-serif text-2xl font-black text-[var(--ink)]">{form.title}</h3>
                  <p className="mt-1.5 text-sm font-medium text-[var(--ink)]/60">{form.description}</p>

                  <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="name" label="Full name" error={touched.name ? errors.name : ''}>
                        <input
                          id="name" name="name" type="text" autoComplete="name" placeholder="Your name"
                          value={formData.name} onChange={handleChange} onBlur={handleBlur}
                          aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined}
                          className={inputClass(touched.name && !!errors.name)}
                        />
                      </Field>
                      <Field id="email" label="Email address" error={touched.email ? errors.email : ''}>
                        <input
                          id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com"
                          value={formData.email} onChange={handleChange} onBlur={handleBlur}
                          aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined}
                          className={inputClass(touched.email && !!errors.email)}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <Field id="phone" label="Phone (optional)" error={touched.phone ? errors.phone : ''}>
                        <input
                          id="phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel" placeholder="98765 43210"
                          value={formData.phone} onChange={handleChange} onBlur={handleBlur}
                          aria-invalid={!!errors.phone} aria-describedby={errors.phone ? 'phone-error' : undefined}
                          className={inputClass(touched.phone && !!errors.phone)}
                        />
                      </Field>
                      <Field id="subject" label="Subject">
                        <select
                          id="subject" name="subject" value={formData.subject} onChange={handleChange}
                          className={inputClass(false)}
                        >
                          <option value="">Select a topic</option>
                          {form.subjectOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field id="message" label="Message" error={touched.message ? errors.message : ''}>
                      <textarea
                        id="message" name="message" rows={5} placeholder="How can we help?"
                        value={formData.message} onChange={handleChange} onBlur={handleBlur}
                        aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined}
                        className={inputClass(touched.message && !!errors.message)}
                      />
                    </Field>

                    {statusMessage.text && (
                      <p className={`font-mono text-[12px] font-semibold ${statusMessage.type === 'error' ? 'text-[var(--rust)]' : 'text-[var(--ink)]/60'}`}>
                        {statusMessage.text}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full rounded-xl bg-[var(--chalk)] px-6 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:scale-[1.01] hover:shadow-lg active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                    >
                      {isSubmitting ? 'Sending…' : 'Send message'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </section>

        {/* --- FAQ --- */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-[var(--chalk)]/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--chalk)]">{faq.tagline}</span>
              <h2 className="mt-2 font-serif text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">{faq.title}</h2>
            </div>

            <div className="mt-14 flex flex-col gap-3">
              {faq.items.map((item, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="overflow-hidden rounded-2xl border border-[var(--line)]/60 bg-white">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                      aria-expanded={isOpen}
                      className={`flex w-full items-center justify-between gap-4 px-6 py-5 text-left ${focusRing}`}
                    >
                      <span className="text-base font-bold text-[var(--ink)]">{item.q}</span>
                      <span className={`shrink-0 text-xl font-black text-[var(--rust)] transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 text-base font-medium leading-relaxed text-[var(--ink)]/60">{item.a}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-auto border-t border-[var(--line)]/40 bg-white pb-28 pt-16 sm:pb-16">
        <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
            <div className="col-span-2 sm:col-span-1">
              <img src={global.logoUrl} alt="Nexus Tuitions" className="h-8 w-auto" />
            </div>
            {footer.columns.map((col, idx) => (
              <div key={idx}>
                <h5 className="text-xs font-black uppercase tracking-widest text-[var(--ink)]/40">{col.title}</h5>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <Link to={link.href} onClick={handleNavigation} className={`text-sm font-semibold text-[var(--ink)]/70 hover:text-[var(--marigold)] rounded ${focusRing}`}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center gap-4 border-t border-[var(--line)]/40 pt-8 text-center">
            <p className="font-mono text-[12px] font-bold uppercase tracking-widest text-[var(--ink)]/40">{global.footerText}</p>
          </div>
        </div>
      </footer>

      {/* --- STICKY MOBILE QUICK-CONTACT BAR --- */}
      {whatsappMethod && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-[var(--line)]/60 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md sm:hidden"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          {methods.find((m) => m.type === 'call') && (
            <a
              href={methods.find((m) => m.type === 'call').href}
              aria-label="Call us"
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--line)] text-lg text-[var(--ink)] ${focusRing}`}
            >
              📞
            </a>
          )}
          <a
            href={whatsappMethod.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--good)] px-6 py-3.5 text-sm font-bold text-white shadow-md active:scale-[0.98] ${focusRing}`}
          >
            {whatsappMethod.actionLabel} <span>→</span>
          </a>
        </div>
      )}

      {/* --- QUICK CONTACT (desktop/tablet only) --- */}
      {whatsappMethod && (
        <a
          href={whatsappMethod.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          className={`fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[var(--good)] text-2xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:flex ${focusRing}`}
        >
          💬
        </a>
      )}

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