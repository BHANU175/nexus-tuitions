import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ---------------------------------------------------------------------- */
/*  Static data                                                           */
/* ---------------------------------------------------------------------- */

const BANNER_SLIDES = [
  { note: 'Get a personal tutor for your child, matched in days.' },
  { note: 'Every educator is verified before they ever teach.' },
  { note: 'Learn online or at home — you choose the mode.' },
];

const TRUST_INDICATORS = [
  { label: 'Rigorous background checks', tone: 'var(--good)' },
  { label: 'Personalised curriculum', tone: 'var(--marigold)' },
  { label: 'Accelerated results', tone: 'var(--rust)' },
];

const BENEFITS = [
  { icon: '🧭', title: 'Personalised matching', copy: 'Tell us your goals and we match you with tutors who actually fit your subject, level, and schedule.' },
  { icon: '🛡️', title: 'Verified profiles', copy: 'Every tutor on Learning Hub passes an identity and background check before they can teach.' },
  { icon: '💳', title: 'Transparent pricing', copy: 'You see the rate up front and agree on it directly with your tutor. No hidden platform fees.' },
  { icon: '🗓️', title: 'Flexible scheduling', copy: 'Book sessions around school, work, or family life — mornings, evenings, or weekends.' },
  { icon: '🎧', title: 'Real human support', copy: 'Our team is on hand to help you find the right fit, not just a chatbot and a FAQ page.' },
  { icon: '⚖️', title: 'Fair to educators', copy: 'Tutors keep what they earn and set their own terms, so the best teachers stay on the platform.' },
];

const HOW_STEPS = [
  { title: 'Tell us what you need', copy: 'Share the subject, level, and schedule you are looking for.' },
  { title: 'Get matched', copy: 'We introduce you to vetted tutors who fit your requirements.' },
  { title: 'Start learning', copy: 'Book your first session online or in person, on your terms.' },
];

const VALUES = [
  { title: 'Learning is personal', copy: 'No two students learn the same way, so we never treat tutoring as one-size-fits-all.' },
  { title: 'Trust is earned', copy: 'Verification and transparency come before growth, on both sides of the platform.' },
  { title: 'Good teaching compounds', copy: 'The right tutor at the right moment can change the whole trajectory of a student\u2019s year.' },
];

/* ---------------------------------------------------------------------- */
/*  Decorative illustrations (original, generated inline — no stock art)  */
/* ---------------------------------------------------------------------- */

function NotebookIllustration() {
  return (
    <svg width="220" height="170" viewBox="0 0 220 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="110" cy="158" rx="86" ry="8" fill="var(--ink)" opacity="0.08" />
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
    <svg width="170" height="170" viewBox="0 0 170 170" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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

/* ---------------------------------------------------------------------- */
/*  Rotating banner                                                       */
/* ---------------------------------------------------------------------- */

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
      <div className="relative grid grid-cols-1 items-center gap-8 px-6 py-12 sm:px-10 sm:py-14 md:grid-cols-[1fr_auto_auto] md:gap-10 md:px-14 md:py-16">
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

/* ---------------------------------------------------------------------- */
/*  Main component                                                        */
/* ---------------------------------------------------------------------- */

export default function Home() {
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
      className="min-h-screen bg-[var(--paper)] font-sans text-[var(--ink)] selection:bg-[var(--marigold)]/30"
    >
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-[var(--line)]/60 bg-[var(--paper)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 md:px-10">
          <div className="flex items-center gap-2.5 text-lg font-black tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--chalk)] font-mono text-sm text-[var(--paper)] sm:h-10 sm:w-10">
              LH
            </div>
            <span className="hidden sm:inline">Learning Hub</span>
          </div>
          <div className="hidden items-center gap-8 font-mono text-[13px] font-bold uppercase tracking-wide text-[var(--ink)]/55 md:flex">
            <a href="#why" className="transition-colors hover:text-[var(--ink)]">Why us</a>
            <Link to="/request-tutor" className="transition-colors hover:text-[var(--ink)]">Find a tutor</Link>
            <Link to="/apply-teacher" className="transition-colors hover:text-[var(--ink)]">Become a tutor</Link>
          </div>
          <Link
            to="/request-tutor"
            className="rounded-lg bg-[var(--chalk)] px-3.5 py-2 text-xs font-bold text-[var(--paper)] transition-colors hover:bg-[var(--rust)] sm:px-5 sm:py-2.5 sm:text-sm"
          >
            Get started
          </Link>
        </div>
      </nav>

      <main>
        {/* --- ROTATING BANNER --- */}
        <div className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-6 sm:pt-10 md:px-10">
          <HeroBanner />
        </div>

        {/* --- HERO TEXT --- */}
        <section className="mx-auto max-w-[860px] px-4 py-14 text-center sm:px-6 sm:py-18 md:py-20">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--ink)]/60">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--marigold)]" />
            Trusted by families &amp; educators
          </div>
          <h1 className="font-serif text-4xl font-black leading-[1.08] tracking-tight text-[var(--ink)] sm:text-5xl md:text-6xl">
            Unlock your potential with<br className="hidden sm:block" />
            <span className="italic text-[var(--rust)]">expert</span> guidance.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-relaxed text-[var(--ink)]/60 sm:text-lg">
            Connect with vetted, professional tutors matched to your exact learning needs — a
            personal standard of education, without the guesswork.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/request-tutor"
              className="w-full rounded-xl bg-[var(--chalk)] px-8 py-3.5 text-sm font-black uppercase tracking-widest text-[var(--paper)] transition-colors hover:bg-[var(--rust)] sm:w-auto"
            >
              Find a tutor
            </Link>
            <Link
              to="/apply-teacher"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-8 py-3.5 text-sm font-black uppercase tracking-widest text-[var(--ink)]/70 transition-colors hover:border-[var(--ink)]/40 sm:w-auto"
            >
              Apply as an educator
            </Link>
          </div>
          <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-4 border-t border-[var(--line)]/60 pt-8 sm:flex-row sm:gap-10">
            {TRUST_INDICATORS.map((t) => (
              <span key={t.label} className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]/50">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke={t.tone} strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.label}
              </span>
            ))}
          </div>
        </section>

        {/* --- WHY US --- */}
        <section id="why" className="border-y border-[var(--line)]/50 bg-white py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">Why Learning Hub</p>
              <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
                Built to work for both sides of the desk
              </h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-[var(--ink)]/60">
                Families get a simpler way to find the right tutor. Educators get fair terms and
                real students. Everyone gets a platform they can trust.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {BENEFITS.map((b) => (
                <div key={b.title} className="rounded-2xl border border-[var(--line)]/50 bg-[var(--paper)]/60 p-6 transition-colors hover:bg-[var(--paper)]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--chalk)]/5 text-xl">
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
        <section className="border-b border-[var(--line)]/50 py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-[900px] px-4 sm:px-6 md:px-10">
            <div className="mx-auto max-w-xl text-center">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">How it works</p>
              <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
                From search to first session
              </h2>
            </div>

            <div className="relative mt-14 flex flex-col gap-10 md:flex-row md:justify-between md:gap-6">
              <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-6 hidden h-px bg-[var(--line)] md:block" />
              {HOW_STEPS.map((s, i) => (
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

        {/* --- WHAT WE BELIEVE --- */}
        <section className="border-b border-[var(--line)]/50 bg-white py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-[1000px] px-4 sm:px-6 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">What we believe</p>
              <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">
                Why we built Learning Hub
              </h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-[var(--ink)]/60">
                We started Learning Hub because finding a tutor you can trust — or building a
                tutoring business you can rely on — took far too much luck. It shouldn't.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {VALUES.map((v, i) => (
                <div key={v.title} className="border-t-2 border-[var(--marigold)] pt-5">
                  <span className="font-mono text-xs font-bold text-[var(--ink)]/40">0{i + 1}</span>
                  <h3 className="mt-2 font-serif text-lg font-black text-[var(--ink)]">{v.title}</h3>
                  <p className="mt-2 text-sm font-medium leading-relaxed text-[var(--ink)]/55">{v.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- DUAL CTA --- */}
        <section className="py-16 sm:py-20 md:py-24">
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 md:px-10">
            <div className="rounded-3xl border border-[var(--line)]/60 bg-[var(--card)] p-8 sm:p-10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">For families</p>
              <h3 className="mt-3 font-serif text-2xl font-black tracking-tight text-[var(--ink)] sm:text-3xl">Looking for a tutor?</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--ink)]/60">
                Tell us what your child needs and we'll match you with verified tutors nearby or online.
              </p>
              <Link
                to="/request-tutor"
                className="mt-6 inline-block rounded-xl bg-[var(--chalk)] px-7 py-3 text-xs font-black uppercase tracking-widest text-[var(--paper)] transition-colors hover:bg-[var(--rust)]"
              >
                Find a tutor
              </Link>
            </div>
            <div className="rounded-3xl border border-[var(--line)]/60 bg-[var(--chalk)] p-8 sm:p-10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">For educators</p>
              <h3 className="mt-3 font-serif text-2xl font-black tracking-tight text-[var(--paper)] sm:text-3xl">Want to teach with us?</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--paper)]/70">
                Set your own rates and schedule, and get matched with pre-verified students.
              </p>
              <Link
                to="/apply-teacher"
                className="mt-6 inline-block rounded-xl bg-[var(--marigold)] px-7 py-3 text-xs font-black uppercase tracking-widest text-[var(--ink)] transition-colors hover:bg-[var(--paper)]"
              >
                Apply to teach
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 text-center font-mono text-[11px] font-medium uppercase tracking-widest text-[var(--ink)]/35">
        Learning Hub — connecting educators and students, one lesson at a time.
      </footer>
    </div>
  );
}