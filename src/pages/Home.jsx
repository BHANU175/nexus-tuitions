import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomBadge from '../components/CustomBadge';
import { supabase } from '../supabaseClient';
import Maintenance from './Maintenance';

/* ---------------------------------------------------------------------- */
/*  DEFAULT CONTENT FALLBACK (The UI will never break if DB is empty)     */
/* ---------------------------------------------------------------------- */
const DEFAULT_CONTENT = {
  global: {
    logoUrl: "/logo.png",
    footerText: "nexus. tuitions — connecting educators and students, one lesson at a time."
  },
  nav: {
    links: [
      { label: 'Why Us', href: '#why', isExternal: false },
      { label: 'Find a Tutor', href: '/request-tutor', isExternal: false },
      { label: 'Become a Tutor', href: '/apply-teacher', isExternal: false }
    ]
  },
  hero: {
    badge: "🎓 Trusted by Families & Students Across India",
    titleStart: "Unlock Your",
    titleHighlight: "Learning",
    titleEnd: "Potential",
    description: "Find verified tutors for every subject, every class and every learning goal — online or at your home.",
    tags: [
      { icon: "🛡️", text: "Verified Tutors" },
      { icon: "📖", text: "All Subjects" },
      { icon: "🏠", text: "Home & Online Classes" }
    ],
    primaryCta: { label: "Find a Tutor →", href: "/request-tutor" },
    secondaryCta: { label: "Become a Tutor →", href: "/apply-teacher" },
    imageUrl: "/1.png",
    floatingStats: [
      { icon: "★★★★★", value: "4.9/5", label: "Average Rating", position: "top-left" },
      { icon: "📊", value: "1,500+", label: "Happy Students", position: "top-right" },
      { icon: "🧑‍🏫", value: "500+", label: "Verified Tutors", position: "bottom-left" },
      { icon: "🎓", value: "50+", label: "Subjects", position: "bottom-right" }
    ]
  },
  statsBanner: [
    { icon: '📖', title: 'Personalized Learning', subtitle: 'Study at your own pace' },
    { icon: '👥', title: 'Trusted by Families', subtitle: 'Building brighter futures' },
    { icon: '💻', title: 'Flexible Options', subtitle: 'Online or at your home' },
    { icon: '🏅', title: 'Quality You Can Rely On', subtitle: 'Only verified educators' },
  ],
  whyUs: {
    tagline: "Why Nexus Tuitions",
    title: "Built to work for both sides of the desk",
    description: "Families get a simpler way to find the right tutor. Educators get fair terms and real students. Everyone gets a platform they can trust.",
    cards: [
      { icon: '🧭', title: 'Personalised matching', copy: 'Tell us your goals and we match you with tutors who actually fit your subject, level, and schedule.' },
      { icon: '🛡️', title: 'Verified profiles', copy: 'Every tutor on Nexus Tuitions passes an identity and background check before they can teach.' },
      { icon: '💳', title: 'Transparent pricing', copy: 'You see the rate up front and agree on it directly with your tutor. No hidden platform fees.' },
      { icon: '🗓️', title: 'Flexible scheduling', copy: 'Book sessions around school, work, or family life — mornings, evenings, or weekends.' },
      { icon: '🎧', title: 'Real human support', copy: 'Our team is on hand to help you find the right fit, not just a chatbot and a FAQ page.' },
      { icon: '⚖️', title: 'Fair to educators', copy: 'Tutors keep what they earn and set their own terms, so the best teachers stay on the platform.' },
    ]
  },
  howItWorks: {
    tagline: "How it works",
    title: "From search to first session",
    steps: [
      { title: 'Tell us what you need', copy: 'Share the subject, level, and schedule you are looking for.' },
      { title: 'Get matched', copy: 'We introduce you to vetted tutors who fit your requirements.' },
      { title: 'Start learning', copy: 'Book your first session online or in person, on your terms.' },
    ]
  },
  whatWeBelieve: {
    tagline: "What we believe",
    title: "Why we built Nexus Tuitions",
    description: "We started Nexus Tuitions because finding a tutor you can trust — or building a tutoring business you can rely on — took far too much luck. It shouldn't.",
    values: [
      { title: 'Learning is personal', copy: 'No two students learn the same way, so we never treat tutoring as one-size-fits-all.' },
      { title: 'Trust is earned', copy: 'Verification and transparency come before growth, on both sides of the platform.' },
      { title: 'Good teaching compounds', copy: 'The right tutor at the right moment can change the whole trajectory of a student’s year.' },
    ]
  },
  dualCta: {
    family: {
      tagline: "For families",
      title: "Looking for a tutor?",
      description: "Tell us what your child needs and we'll match you with verified tutors nearby or online.",
      btnText: "Find a tutor",
      href: "/request-tutor"
    },
    educator: {
      tagline: "For educators",
      title: "Want to teach with us?",
      description: "Set your own rates and schedule, and get matched with pre-verified students.",
      btnText: "Apply to teach",
      href: "/apply-teacher"
    }
  }
};

/* ---------------------------------------------------------------------- */
/*  Main Component                                                        */
/* ---------------------------------------------------------------------- */

export default function Home() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [pageData, setPageData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [settingsRes, contentRes] = await Promise.all([
          supabase.from('app_settings').select('maintenance_mode').single(),
          supabase.from('page_content').select('data_json').eq('page_name', 'home').single()
        ]);

        if (settingsRes.data && !settingsRes.error) {
          setIsMaintenance(settingsRes.data.maintenance_mode);
        }

        // Deep merge database content with default content to ensure no undefined crashes
        if (contentRes.data?.data_json) {
          setPageData({
            ...DEFAULT_CONTENT,
            ...contentRes.data.data_json,
          });
        }
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();
  }, []);

  const handleNavigation = () => window.scrollTo(0, 0);

  if (loading) {
    return (
      <div style={{ '--paper': '#FDF9F1', '--ink': '#1C2420' }} className="flex min-h-screen items-center justify-center bg-[var(--paper)] font-sans text-[var(--ink)]">
        <p className="text-sm font-semibold tracking-wide text-[var(--ink)]/60">Loading...</p>
      </div>
    );
  }

  if (isMaintenance) return <Maintenance />;

  // Destructure for cleaner JSX
  const { global, nav, hero, statsBanner, whyUs, howItWorks, whatWeBelieve, dualCta } = pageData;

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
          <div className="flex items-center gap-3">
            <Link to="/" onClick={handleNavigation} className="flex select-none items-center py-1">
              <img src={global.logoUrl} alt="Nexus Tuitions" className="h-9 w-auto sm:h-10" />
            </Link>
            <CustomBadge />
          </div>
          
          <div className="hidden items-center gap-8 text-[15px] font-medium text-[var(--ink)] lg:flex">
            {nav.links.map((link, idx) => (
              link.href.startsWith('#') ? (
                <a key={idx} href={link.href} className="transition-colors hover:text-[var(--marigold)]">{link.label}</a>
              ) : (
                <Link key={idx} to={link.href} onClick={handleNavigation} className="transition-colors hover:text-[var(--marigold)]">
                  {link.label}
                </Link>
              )
            ))}
          </div>
        </div>
      </nav>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative mx-auto max-w-[1300px] overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-[var(--marigold)]/15 px-4 py-1.5 text-xs font-bold text-[var(--ink)] shadow-sm">
                {hero.badge}
              </div>
              
              <h1 className="mt-6 break-words font-serif text-4xl font-black leading-[1.25] tracking-tight text-[var(--ink)] sm:text-5xl sm:leading-[1.15] md:text-6xl lg:text-7xl">
                {hero.titleStart} <br />
                <span className="relative inline-block text-[var(--rust)]">
                  {hero.titleHighlight}
                  <svg className="absolute -bottom-2 left-0 w-full text-[var(--marigold)]" viewBox="0 0 200 12" fill="none">
                    <path d="M3 9C60 -2 140 -2 197 9" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </span> {hero.titleEnd}
              </h1>
              
              <p className="mt-8 text-lg font-medium leading-relaxed text-[var(--ink)]/70">
                {hero.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {hero.tags.map((tag, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-lg bg-[#F8EDD8] px-3.5 py-2 text-sm font-semibold text-[var(--ink)]">
                    <span className="text-[var(--marigold)]">{tag.icon}</span>
                    {tag.text}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to={hero.primaryCta.href} onClick={handleNavigation} className="flex items-center justify-center gap-2 rounded-xl bg-[var(--chalk)] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-opacity-90">
                  {hero.primaryCta.label}
                </Link>
                <Link to={hero.secondaryCta.href} onClick={handleNavigation} className="flex items-center justify-center gap-2 rounded-xl border-2 border-[var(--ink)] px-8 py-3.5 text-base font-bold text-[var(--ink)] transition-colors hover:bg-[var(--ink)]/5">
                  {hero.secondaryCta.label}
                </Link>
              </div>
            </div>

            <div className="relative mx-auto mt-10 w-full max-w-lg lg:mt-0 lg:max-w-xl xl:max-w-2xl">
              <div className="absolute inset-0 right-4 top-4 -z-10 rounded-full bg-[#F6C280] opacity-50 blur-3xl"></div>
              <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F3B770]"></div>
              
              <img src={hero.imageUrl} alt="Hero illustration" className="relative z-10 w-full scale-105 rounded-2xl object-contain drop-shadow-2xl" />

              {/* Dynamic Floating Stats */}
              {hero.floatingStats.map((stat, idx) => {
                const positions = {
                  "top-left": "absolute -left-4 top-2 sm:-left-8 sm:top-10 origin-top-left",
                  "top-right": "absolute -right-4 top-2 sm:-right-8 sm:top-10 origin-top-right",
                  "bottom-left": "absolute -left-4 bottom-6 sm:-left-12 sm:bottom-20 origin-bottom-left",
                  "bottom-right": "absolute -right-4 bottom-12 sm:-right-12 sm:bottom-32 origin-bottom-right"
                };
                
                return (
                  <div key={idx} className={`z-20 flex scale-[0.75] flex-col items-center rounded-2xl bg-white p-4 shadow-xl sm:scale-100 ${positions[stat.position]}`}>
                    {stat.icon.includes('★') ? (
                      <div className="flex text-yellow-400">{stat.icon}</div>
                    ) : (
                      <span className="mb-1 text-2xl">{stat.icon}</span>
                    )}
                    <div className="mt-1 text-xl font-black text-[var(--ink)]">{stat.value}</div>
                    <div className="text-xs font-medium text-gray-500">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* --- STATS / FEATURES BANNER --- */}
        <section className="mx-auto max-w-[1300px] px-4 pb-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 rounded-3xl bg-[#FEF4E8] p-6 sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
            {statsBanner.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--marigold)]/20 text-xl text-[var(--marigold)]">{stat.icon}</div>
                <div>
                  <h4 className="font-bold text-[var(--ink)]">{stat.title}</h4>
                  <p className="text-xs font-medium text-[var(--ink)]/60">{stat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- WHY US --- */}
        <section id="why" className="border-y border-[var(--line)]/50 bg-white py-16 sm:py-20 md:py-24">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10">
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">{whyUs.tagline}</p>
              <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">{whyUs.title}</h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-[var(--ink)]/60">{whyUs.description}</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {whyUs.cards.map((b, idx) => (
                <div key={idx} className="rounded-2xl border border-[var(--line)]/50 bg-[var(--paper)]/60 p-6 transition-colors hover:bg-[var(--paper)]">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--chalk)]/5 text-xl">{b.icon}</div>
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
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">{howItWorks.tagline}</p>
              <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">{howItWorks.title}</h2>
            </div>

            <div className="relative mt-14 flex flex-col gap-10 md:flex-row md:justify-between md:gap-6">
              <div aria-hidden="true" className="absolute left-[16%] right-[16%] top-6 hidden h-px bg-[var(--line)] md:block" />
              {howItWorks.steps.map((s, i) => (
                <div key={i} className="relative z-10 flex items-start gap-4 md:w-1/3 md:flex-col md:items-center md:text-center">
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
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">{whatWeBelieve.tagline}</p>
              <h2 className="font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">{whatWeBelieve.title}</h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-[var(--ink)]/60">{whatWeBelieve.description}</p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {whatWeBelieve.values.map((v, i) => (
                <div key={i} className="border-t-2 border-[var(--marigold)] pt-5">
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
            {/* Family CTA */}
            <div className="rounded-3xl border border-[var(--line)]/60 bg-[var(--card)] p-8 sm:p-10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">{dualCta.family.tagline}</p>
              <h3 className="mt-3 font-serif text-2xl font-black tracking-tight text-[var(--ink)] sm:text-3xl">{dualCta.family.title}</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-[var(--ink)]/60">{dualCta.family.description}</p>
              <Link to={dualCta.family.href} onClick={handleNavigation} className="mt-6 inline-block rounded-xl bg-[var(--chalk)] px-7 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-opacity-90">
                {dualCta.family.btnText}
              </Link>
            </div>
            
            {/* Educator CTA */}
            <div className="rounded-3xl border border-[var(--line)]/60 bg-[var(--chalk)] p-8 sm:p-10">
              <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-[var(--marigold)]">{dualCta.educator.tagline}</p>
              <h3 className="mt-3 font-serif text-2xl font-black tracking-tight text-white sm:text-3xl">{dualCta.educator.title}</h3>
              <p className="mt-3 text-sm font-medium leading-relaxed text-white/70">{dualCta.educator.description}</p>
              <Link to={dualCta.educator.href} onClick={handleNavigation} className="mt-6 inline-block rounded-xl bg-[var(--marigold)] px-7 py-3 text-xs font-black uppercase tracking-widest text-[var(--ink)] transition-colors hover:bg-white">
                {dualCta.educator.btnText}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="mt-auto bg-[var(--chalk)] py-10 text-center font-mono text-[12px] font-medium uppercase tracking-widest text-[var(--line)]/50">
        {global.footerText}
      </footer>
    </div>
  );
}