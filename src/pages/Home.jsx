import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomBadge from '../components/CustomBadge';
import { supabase } from '../supabaseClient'; // Adjust path to your Supabase client as needed
import Maintenance from './Maintenance'; // Adjust path if Maintenance.jsx lives elsewhere

/* ---------------------------------------------------------------------- */
/*  Static data                                                           */
/* ---------------------------------------------------------------------- */

const TRUST_INDICATORS = [
  { label: 'Rigorous background checks', tone: 'var(--good)' },
  { label: 'Personalised curriculum', tone: 'var(--marigold)' },
  { label: 'Accelerated results', tone: 'var(--rust)' },
];

const BENEFITS = [
  { icon: '🧭', title: 'Personalised matching', copy: 'Tell us your goals and we match you with tutors who actually fit your subject, level, and schedule.' },
  { icon: '🛡️', title: 'Verified profiles', copy: 'Every tutor on Nexus Tuitions passes an identity and background check before they can teach.' },
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
  { title: 'Good teaching compounds', copy: 'The right tutor at the right moment can change the whole trajectory of a student’s year.' },
];

/* ---------------------------------------------------------------------- */
/*  Main component                                                        */
/* ---------------------------------------------------------------------- */

export default function Home() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkMaintenance() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('maintenance_mode')
          .single();

        if (data && !error) {
          setIsMaintenance(data.maintenance_mode);
        }
      } catch (err) {
        console.error('Failed to fetch app settings:', err);
      } finally {
        setLoading(false);
      }
    }

    checkMaintenance();
  }, []);

  // Update these paths to your local image paths inside the public folder
  const HERO_IMAGE_URL = "/1.png";
  const LOGO_IMAGE_URL = "/logo.png"; // Served from /public/logo.png

  // Utility function to handle routing and scrolling to top
  const handleNavigation = () => {
    window.scrollTo(0, 0);
  };

  // Loading Screen
  if (loading) {
    return (
      <div
        style={{
          '--paper': '#FDF9F1',
          '--ink': '#1C2420',
        }}
        className="flex min-h-screen items-center justify-center bg-[var(--paper)] font-sans text-[var(--ink)]"
      >
        <p className="text-sm font-semibold tracking-wide text-[var(--ink)]/60">Loading...</p>
      </div>
    );
  }

  // Maintenance Screen
  if (isMaintenance) {
    return <Maintenance />;
  }

  return (
    <div
      style={{
        '--chalk': '#0E3E35',
        '--paper': '#FDF9F1',
        '--ink': '#1C2420',
        '--card': '#FFFFFF',
        '--marigold': '#F38C35',
        '--rust': '#D95D39',
        '--line': '#E5E5E5',
        '--good': '#3F7D5C',
      }}
      className="min-h-screen bg-[var(--paper)] font-sans text-[var(--ink)] selection:bg-[var(--marigold)]/30"
    >
      {/* --- NAV --- */}
      <nav className="sticky top-0 z-50 border-b border-[var(--line)]/60 bg-[var(--paper)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
          
          {/* Logo & Custom Badge Group */}
          <div className="flex items-center gap-3">
            <Link to="/" onClick={handleNavigation} className="flex items-center select-none py-1">
              <img
                src={LOGO_IMAGE_URL}
                alt="Nexus Tuitions"
                className="h-9 w-auto sm:h-10"
                width={190}
                height={65}
              />
            </Link>
            
            {/* Custom Badge rendered next to logo */}
            <CustomBadge />
          </div>
          
          {/* Center Links */}
          <div className="hidden items-center gap-8 text-[15px] font-medium text-[var(--ink)] lg:flex">
            <a href="#why" className="transition-colors hover:text-[var(--marigold)]">Why Us</a>
            <Link to="/request-tutor" onClick={handleNavigation} className="transition-colors hover:text-[var(--marigold)]">Find a Tutor</Link>
            <Link to="/apply-teacher" onClick={handleNavigation} className="transition-colors hover:text-[var(--marigold)]">Become a Tutor</Link>
          </div>
        </div>
      </nav>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative mx-auto max-w-[1300px] overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            
            {/* Left Content */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--marigold)]/15 px-4 py-1.5 text-xs font-bold text-[var(--ink)] shadow-sm">
                🎓 Trusted by Families & Students Across India
              </div>
              
              <h1 className="mt-6 break-words font-serif text-4xl font-black leading-[1.25] tracking-tight text-[var(--ink)] sm:text-5xl sm:leading-[1.15] md:text-6xl lg:text-7xl">
                Unlock Your <br />
                <span className="relative inline-block text-[var(--rust)]">
                  Learning
                  <svg className="absolute -bottom-2 left-0 w-full text-[var(--marigold)]" viewBox="0 0 200 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 9C60 -2 140 -2 197 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span> Potential
              </h1>
              
              <p className="mt-8 text-lg font-medium leading-relaxed text-[var(--ink)]/70">
                Find verified tutors for every subject, every class and every learning goal — online or at your home.
              </p>

              {/* Tags */}
              <div className="mt-8 flex flex-wrap gap-3">
                {['Verified Tutors', 'All Subjects', 'Home & Online Classes'].map((tag, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg bg-[#F8EDD8] px-3.5 py-2 text-sm font-semibold text-[var(--ink)]">
                    <span className="text-[var(--marigold)]">
                      {idx === 0 ? '🛡️' : idx === 1 ? '📖' : '🏠'}
                    </span>
                    {tag}
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/request-tutor"
                  onClick={handleNavigation}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[var(--chalk)] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-opacity-90"
                >
                  Find a Tutor &rarr;
                </Link>
                <Link
                  to="/apply-teacher"
                  onClick={handleNavigation}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--ink)] px-8 py-3.5 text-base font-bold text-[var(--ink)] transition-colors hover:bg-[var(--ink)]/5"
                >
                  Become a Tutor &rarr;
                </Link>
              </div>
            </div>

            {/* Right Content / Image Area */}
            <div className="relative mx-auto mt-10 w-full max-w-lg lg:mt-0 lg:max-w-xl xl:max-w-2xl">
              <div className="absolute inset-0 right-4 top-4 -z-10 rounded-full bg-[#F6C280] opacity-50 blur-3xl"></div>
              <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F3B770]"></div>
              
              <img 
                src={HERO_IMAGE_URL}
                alt="Tutor helping a student" 
                className="relative z-10 w-full scale-105 rounded-2xl object-contain drop-shadow-2xl" 
              />

              {/* Floating Badges */}
              <div className="absolute -left-4 top-2 z-20 flex origin-top-left scale-[0.75] flex-col items-center rounded-2xl bg-white p-4 shadow-xl sm:-left-8 sm:top-10 sm:scale-100">
                <div className="flex text-yellow-400">★★★★★</div>
                <div className="mt-1 text-xl font-black text-[var(--ink)]">4.9/5</div>
                <div className="text-xs font-medium text-gray-500">Average Rating</div>
              </div>

              <div className="absolute -right-4 top-2 z-20 flex origin-top-right scale-[0.75] flex-col items-center rounded-2xl bg-white p-4 shadow-xl sm:-right-8 sm:top-10 sm:scale-100">
                <span className="mb-1 text-2xl">📊</span>
                <div className="text-xl font-black text-[var(--ink)]">1,500+</div>
                <div className="text-xs font-medium text-gray-500">Happy Students</div>
              </div>

              <div className="absolute -left-4 bottom-6 z-20 flex origin-bottom-left scale-[0.75] flex-col items-center rounded-2xl bg-white p-4 shadow-xl sm:-left-12 sm:bottom-20 sm:scale-100">
                <span className="mb-1 text-2xl">🧑‍🏫</span>
                <div className="text-xl font-black text-[var(--ink)]">500+</div>
                <div className="text-xs font-medium text-gray-500">Verified Tutors</div>
              </div>

              <div className="absolute -right-4 bottom-12 z-20 flex origin-bottom-right scale-[0.75] flex-col items-center rounded-2xl bg-white p-4 shadow-xl sm:-right-12 sm:bottom-32 sm:scale-100">
                <span className="mb-1 text-2xl">🎓</span>
                <div className="text-xl font-black text-[var(--ink)]">50+</div>
                <div className="text-xs font-medium text-gray-500">Subjects</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- STATS / FEATURES BANNER --- */}
        <section className="mx-auto max-w-[1300px] px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 rounded-3xl bg-[#FEF4E8] p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)]/20 text-xl text-[var(--marigold)]">📖</div>
              <div>
                <h4 className="font-bold text-[var(--ink)]">Personalized Learning</h4>
                <p className="text-xs font-medium text-[var(--ink)]/60">Study at your own pace</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)]/20 text-xl text-[var(--marigold)]">👥</div>
              <div>
                <h4 className="font-bold text-[var(--ink)]">Trusted by Families</h4>
                <p className="text-xs font-medium text-[var(--ink)]/60">Building brighter futures</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)]/20 text-xl text-[var(--marigold)]">💻</div>
              <div>
                <h4 className="font-bold text-[var(--ink)]">Flexible Options</h4>
                <p className="text-xs font-medium text-[var(--ink)]/60">Online or at your home</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)]/20 text-xl text-[var(--marigold)]">🏅</div>
              <div>
                <h4 className="font-bold text-[var(--ink)]">Quality You Can Rely On</h4>
                <p className="text-xs font-medium text-[var(--ink)]/60">Only verified educators</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- WHY US --- */}
        <section id="why" className="border-y border-[var(--line)]/50 bg-white py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">Why Nexus Tuitions</p>
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
                Why we built Nexus Tuitions
              </h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-[var(--ink)]/60">
                We started Nexus Tuitions because finding a tutor you can trust — or building a
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
                onClick={handleNavigation}
                className="mt-6 inline-block rounded-xl bg-[var(--chalk)] px-7 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-opacity-90"
              >
                Find a tutor
              </Link>
            </div>
            <div className="rounded-3xl border border-[var(--line)]/60 bg-[var(--chalk)] p-8 sm:p-10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">For educators</p>
              <h3 className="mt-3 font-serif text-2xl font-black tracking-tight text-white sm:text-3xl">Want to teach with us?</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-white/70">
                Set your own rates and schedule, and get matched with pre-verified students.
              </p>
              <Link
                to="/apply-teacher"
                onClick={handleNavigation}
                className="mt-6 inline-block rounded-xl bg-[var(--marigold)] px-7 py-3 text-xs font-black uppercase tracking-widest text-[var(--ink)] transition-colors hover:bg-white"
              >
                Apply to teach
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-auto bg-[var(--chalk)] py-10 text-center font-mono text-[12px] font-medium uppercase tracking-widest text-[var(--line)]/50">
        nexus. tuitions — connecting educators and students, one lesson at a time.
      </footer>
    </div>
  );
}