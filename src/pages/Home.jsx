import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CustomBadge from '../components/CustomBadge';
import Maintenance from './Maintenance';
import { supabase } from '../supabaseClient';

function parseSiteContentValue(raw) {
  if (typeof raw !== 'string') return raw;
  const t = raw.trim();
  if (t.startsWith('[') || t.startsWith('{')) {
    try { return JSON.parse(t); } catch { return raw; }
  }
  return raw;
}

const HOME_CONTENT_KEYS = {
  global: 'home_global',
  nav: 'home_nav',
  hero: 'home_hero',
  statsBanner: 'home_stats_banner',
  whyUs: 'home_why_us',
  howItWorks: 'home_how_it_works',
  comparison: 'home_comparison',
  whatWeBelieve: 'home_what_we_believe',
  testimonials: 'home_testimonials',
  dualCta: 'home_dual_cta',
  contact: 'home_contact',
  faq: 'home_faq',
  footer: 'home_footer',
};

const DEFAULT_CONTENT = {
  global: {
    logoUrl: "/logo.png",
    footerText: "nexus. tuitions — connecting educators and students, one lesson at a time."
  },
  nav: {
    links: [
      { label: 'Why Us', href: '#why', isExternal: false },
      { label: 'How It Works', href: '#how', isExternal: false },
      { label: 'Find a Tutor', href: '/request-tutor', isExternal: false },
      { label: 'Become a Tutor', href: '/apply-teacher', isExternal: false },
      { label: 'Contact Us', href: '#contact', isExternal: false }
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
    primaryCta: { label: "Find a Tutor", href: "/request-tutor" },
    secondaryCta: { label: "Become a Tutor", href: "/apply-teacher" },
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
    tagline: "The Nexus Advantage",
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
    tagline: "Seamless Process",
    title: "From search to first session",
    steps: [
      { title: 'Tell us what you need', copy: 'Share the subject, level, and schedule you are looking for.' },
      { title: 'Get matched', copy: 'We introduce you to vetted tutors who fit your requirements.' },
      { title: 'Start learning', copy: 'Book your first session online or in person, on your terms.' },
    ]
  },
  comparison: {
    tagline: "The Nexus Difference",
    title: "Nexus Tuitions vs. a local coaching agency",
    footnote: "Based on common practices at traditional tutoring agencies. Individual agencies may vary.",
    columns: { nexus: "Nexus Tuitions", other: "Typical Agency" },
    rows: [
      { feature: "Background-verified tutors", nexus: 'yes', other: 'varies' },
      { feature: "See tutor rates before you commit", nexus: 'yes', other: 'no' },
      { feature: "No hidden placement fees", nexus: 'yes', other: 'no' },
      { feature: "Browse and choose your own tutor", nexus: 'yes', other: 'varies' },
      { feature: "Switch tutors any time, no penalty", nexus: 'yes', other: 'varies' },
      { feature: "Online or at-home sessions", nexus: 'yes', other: 'varies' },
    ],
  },
  whatWeBelieve: {
    tagline: "Our Core Values",
    title: "Why we built Nexus Tuitions",
    description: "We started Nexus Tuitions because finding a tutor you can trust — or building a tutoring business you can rely on — took far too much luck. It shouldn't.",
    values: [
      { title: 'Learning is personal', copy: 'No two students learn the same way, so we never treat tutoring as one-size-fits-all.' },
      { title: 'Trust is earned', copy: 'Verification and transparency come before growth, on both sides of the platform.' },
      { title: 'Good teaching compounds', copy: 'The right tutor at the right moment can change the whole trajectory of a student’s year.' },
    ]
  },
  testimonials: {
    tagline: "From the Nexus Community",
    title: "What families and educators say",
    items: [
      { quote: "We went through three tutors before Nexus — the matching questions actually mattered this time. My daughter's grades in chemistry turned around within a term.", name: "Priya S.", role: "Parent, Class 10 student" },
      { quote: "I could see the rate and the tutor's background before messaging anyone. No awkward negotiation, no agency middleman.", name: "Arjun M.", role: "Parent, Class 8 student" },
      { quote: "I set my own hours and my own rate. Support actually replies when I have a question about a student match.", name: "Kavya R.", role: "Mathematics tutor" },
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
  },
  contact: {
    tagline: "Get in Touch",
    title: "Have questions? We're here to help.",
    description: "Reach out to us directly for any inquiries, technical support, or personalized matching assistance.",
    email: "support@nexustuitions.com",
    phone: "+91 95880 57703",
    whatsapp: "https://wa.me/919588057703"
  },
  faq: {
    tagline: "Questions, Answered",
    title: "Before you get started",
    items: [
      { q: "How are tutors verified?", a: "Every tutor completes an identity check and a background screening before their profile goes live, and before they can message a family." },
      { q: "How much does tutoring cost?", a: "Rates are set by each tutor and shown on their profile up front. You agree on the rate directly with your tutor — Nexus doesn't add a hidden booking or placement fee." },
      { q: "What if the tutor isn't the right fit?", a: "You can switch to a different tutor at any time, at no extra cost. We'd rather you find the right match than stay stuck with the wrong one." },
      { q: "Do you offer online or in-person sessions?", a: "Both. You can filter tutors by whether they teach online, at your home, or either, when you search." },
      { q: "How do I pay my tutor?", a: "Payment is arranged directly between you and your tutor, based on the terms you agree on together." },
    ]
  },
  footer: {
    columns: [
      { title: "Company", links: [{ label: "Why Us", href: "#why" }, { label: "How It Works", href: "#how" }, { label: "Contact Us", href: "#contact" }] },
      { title: "For Families", links: [{ label: "Find a Tutor", href: "/request-tutor" }] },
      { title: "For Educators", links: [{ label: "Become a Tutor", href: "/apply-teacher" }] },
    ]
  }
};

function ComparisonMark({ value }) {
  if (value === 'yes') {
    return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--good)]/15 text-[var(--good)] font-black">✓</span>;
  }
  if (value === 'no') {
    return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-[var(--ink)]/30 font-black">–</span>;
  }
  return <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--marigold)]/15 text-[var(--rust)] font-black text-xs">~</span>;
}

export default function Home() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [pageData, setPageData] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [{ data: settingsData }, { data: contentRows }] = await Promise.all([
          supabase.from('app_settings').select('maintenance_mode').eq('id', 1).maybeSingle(),
          supabase.from('site_content').select('*'),
        ]);

        if (settingsData && settingsData.maintenance_mode !== undefined) {
          setIsMaintenance(Boolean(settingsData.maintenance_mode));
        }

        if (contentRows) {
          const rowsDict = {};
          contentRows.forEach((row) => {
            rowsDict[row.key] = parseSiteContentValue(row.value);
          });

          setPageData((prev) => {
            const next = { ...prev };
            Object.entries(HOME_CONTENT_KEYS).forEach(([field, key]) => {
              if (rowsDict[key] !== undefined) next[field] = rowsDict[key];
            });
            return next;
          });
        }
      } catch (err) {
        console.error('Failed to fetch site content from Supabase:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchInitialData();

    const channel = supabase
      .channel('home-page-dynamic-sync')
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

  useEffect(() => {
    const handleScroll = () => setShowStickyCta(window.scrollY > 700);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--marigold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper)]";

  if (loading) {
    return (
      <div style={{ '--paper': '#FDF9F1', '--ink': '#1C2420' }} className="flex min-h-screen items-center justify-center bg-[var(--paper)] font-sans text-[var(--ink)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--ink)]/20 border-t-[var(--ink)]"></div>
          <p className="text-sm font-semibold tracking-wide text-[var(--ink)]/60 animate-pulse">Curating your experience...</p>
        </div>
      </div>
    );
  }

  if (isMaintenance) return <Maintenance />;

  const { global, nav, hero, statsBanner, whyUs, howItWorks, comparison, whatWeBelieve, testimonials, dualCta, contact, faq, footer } = pageData;

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
      {/* --- PREMIUM NAV --- */}
      <nav className="fixed top-0 z-50 w-full border-b border-[var(--line)]/40 bg-[var(--paper)]/85 backdrop-blur-xl transition-all duration-300">
        <div className="mx-auto flex max-w-[1300px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/" onClick={handleNavigation} className={`flex select-none items-center py-1 group rounded-lg ${focusRing}`}>
              <img src={global.logoUrl} alt="Nexus Tuitions" className="h-9 w-auto sm:h-10 object-contain bg-transparent border-0 outline-none shadow-none drop-shadow-none" />
            </Link>
            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-[var(--chalk)]/5 text-[var(--chalk)] border border-[var(--chalk)]/10 select-none shadow-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--good)]"></span>
                Verified Platform
              </span>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-[14px] font-bold tracking-wide text-[var(--ink)] lg:flex">
            {nav.links.map((link, idx) => (
              link.href.startsWith('#') ? (
                <a key={idx} href={link.href} className={`group relative rounded transition-colors hover:text-[var(--marigold)] ${focusRing}`}>
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-[var(--marigold)] transition-all duration-300 group-hover:w-full"></span>
                </a>
              ) : (
                <Link key={idx} to={link.href} onClick={handleNavigation} className={`group relative rounded transition-colors hover:text-[var(--marigold)] ${focusRing}`}>
                  {link.label}
                  <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-[var(--marigold)] transition-all duration-300 group-hover:w-full"></span>
                </Link>
              )
            ))}
          </div>

          <div className="hidden items-center lg:flex">
            <Link
              to={hero.primaryCta.href}
              onClick={handleNavigation}
              className={`rounded-xl bg-[var(--chalk)] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${focusRing}`}
            >
              {hero.primaryCta.label}
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className={`flex h-10 w-10 items-center justify-center rounded-lg text-[var(--ink)] lg:hidden ${focusRing}`}
          >
            <span className="relative block h-4 w-6">
              <span className={`absolute left-0 top-0 h-[2px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-[7px] rotate-45' : ''}`}></span>
              <span className={`absolute left-0 top-[7px] h-[2px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`absolute left-0 top-[14px] h-[2px] w-6 bg-current transition-all duration-300 ${mobileMenuOpen ? 'top-[7px] -rotate-45' : ''}`}></span>
            </span>
          </button>
        </div>

        {/* Mobile nav panel */}
        <div className={`grid overflow-hidden border-t border-[var(--line)]/40 bg-[var(--paper)] transition-all duration-300 ease-in-out lg:hidden ${mobileMenuOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 border-t-0'}`}>
          <div className="overflow-hidden">
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {nav.links.map((link, idx) => (
                link.href.startsWith('#') ? (
                  <a key={idx} href={link.href} onClick={() => setMobileMenuOpen(false)} className={`rounded-lg px-3 py-3 text-base font-bold text-[var(--ink)] hover:bg-[var(--chalk)]/5 ${focusRing}`}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={idx} to={link.href} onClick={handleNavigation} className={`rounded-lg px-3 py-3 text-base font-bold text-[var(--ink)] hover:bg-[var(--chalk)]/5 ${focusRing}`}>
                    {link.label}
                  </Link>
                )
              ))}
              <Link
                to={hero.primaryCta.href}
                onClick={handleNavigation}
                className={`mt-2 rounded-xl bg-[var(--chalk)] px-5 py-3 text-center text-sm font-bold text-white shadow-sm ${focusRing}`}
              >
                {hero.primaryCta.label}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24">
        {/* --- HERO SECTION --- */}
        <section className="relative mx-auto max-w-[1300px] overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-24">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--marigold)]/10 blur-[100px] -z-10"></div>

          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="max-w-2xl z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--marigold)]/30 bg-[var(--marigold)]/10 px-4 py-2 text-xs font-bold text-[var(--rust)] shadow-[0_0_15px_rgba(243,140,53,0.15)] backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--marigold)] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--rust)]"></span>
                </span>
                {hero.badge}
              </div>

              <h1 className="mt-8 break-words font-serif text-5xl font-black leading-[1.1] tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl lg:text-[5rem]">
                {hero.titleStart} <br />
                <span className="relative inline-block text-[var(--chalk)] z-10">
                  {hero.titleHighlight}
                  <svg className="absolute -bottom-3 left-0 w-full text-[var(--marigold)] -z-10" viewBox="0 0 200 12" fill="none">
                    <path d="M3 9C60 -2 140 -2 197 9" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                </span> {hero.titleEnd}
              </h1>

              <p className="mt-8 text-lg sm:text-xl font-medium leading-relaxed text-[var(--ink)]/75 max-w-lg">
                {hero.description}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                {hero.tags.map((tag, idx) => (
                  <div key={idx} className="flex items-center gap-2 rounded-xl bg-white border border-[var(--line)]/50 px-4 py-2.5 text-sm font-bold text-[var(--ink)] shadow-sm hover:shadow-md transition-shadow">
                    <span className="text-[var(--marigold)] text-lg">{tag.icon}</span>
                    {tag.text}
                  </div>
                ))}
              </div>

              <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link to={hero.primaryCta.href} onClick={handleNavigation} className={`group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[var(--chalk)] px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] ${focusRing}`}>
                  <span className="relative z-10 flex items-center gap-2">{hero.primaryCta.label} <span className="group-hover:translate-x-1 transition-transform">→</span></span>
                  <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full motion-safe:group-hover:animate-[shimmer_1.5s_infinite]"></div>
                </Link>
                <Link to={hero.secondaryCta.href} onClick={handleNavigation} className={`flex items-center justify-center gap-2 rounded-2xl border-2 border-[var(--line)] bg-white/50 px-8 py-4 text-base font-bold text-[var(--ink)] backdrop-blur-sm transition-all hover:border-[var(--ink)]/30 hover:bg-white hover:shadow-md active:scale-[0.98] ${focusRing}`}>
                  {hero.secondaryCta.label}
                </Link>
              </div>

              <p className="mt-6 text-sm font-semibold text-[var(--ink)]/50">
                No commitment to browse. See tutor rates before you message anyone.
              </p>
            </div>

            <div className="relative mx-auto mt-10 w-full max-w-lg lg:mt-0 lg:max-w-xl xl:max-w-2xl">
              <div className="absolute left-1/2 top-1/2 -z-20 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-[#F6D2B1] to-[#F1BC8A] opacity-30 blur-3xl"></div>

              <div className="relative z-10 group">
                <img src={hero.imageUrl} alt="Student learning with a Nexus tutor" className="w-full scale-105 rounded-2xl object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-transform duration-700 group-hover:scale-110" />
              </div>

              {hero.floatingStats.map((stat, idx) => {
                const positions = {
                  "top-left": "absolute -left-2 top-0 sm:-left-12 sm:top-10 origin-top-left motion-safe:animate-[float_6s_ease-in-out_infinite]",
                  "top-right": "absolute -right-2 top-0 sm:-right-12 sm:top-10 origin-top-right motion-safe:animate-[float_6s_ease-in-out_infinite_1s]",
                  "bottom-left": "absolute -left-2 bottom-6 sm:-left-12 sm:bottom-20 origin-bottom-left motion-safe:animate-[float_6s_ease-in-out_infinite_2s]",
                  "bottom-right": "absolute -right-2 bottom-12 sm:-right-12 sm:bottom-24 origin-bottom-right motion-safe:animate-[float_6s_ease-in-out_infinite_3s]"
                };

                return (
                  <div key={idx} className={`z-20 flex scale-[0.8] sm:scale-100 flex-col items-center rounded-2xl border border-white/40 bg-white/80 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md transition-transform hover:scale-[1.05] sm:hover:scale-110 cursor-default ${positions[stat.position]}`}>
                    {stat.icon.includes('★') ? (
                      <div className="flex text-yellow-400 drop-shadow-sm">{stat.icon}</div>
                    ) : (
                      <span className="mb-1 text-2xl drop-shadow-sm">{stat.icon}</span>
                    )}
                    <div className="mt-1 text-xl font-black text-[var(--ink)]">{stat.value}</div>
                    <div className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]/50">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* --- STATS / FEATURES BANNER --- */}
        <section className="relative z-20 mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12">
          <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-3xl bg-white shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-[var(--line)]/30 sm:grid-cols-2 lg:grid-cols-4">
            {statsBanner.map((stat, idx) => (
              <div key={idx} className="group flex items-center gap-5 border-b border-[var(--line)]/30 p-8 transition-colors hover:bg-gray-50/50 sm:border-b-0 lg:border-r last:border-0">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--marigold)]/10 text-2xl text-[var(--rust)] transition-transform group-hover:scale-110 group-hover:bg-[var(--marigold)]/20">
                  {stat.icon}
                </div>
                <div>
                  <h4 className="text-base font-bold text-[var(--ink)]">{stat.title}</h4>
                  <p className="mt-1 text-sm font-medium text-[var(--ink)]/60">{stat.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- WHY US --- */}
        <section id="why" className="relative mt-20 bg-gradient-to-b from-white to-[var(--paper)] py-20 sm:py-28">
          <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-[var(--chalk)]/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--chalk)]">{whyUs.tagline}</span>
              <h2 className="mt-2 font-serif text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">{whyUs.title}</h2>
              <p className="mt-6 text-lg font-medium leading-relaxed text-[var(--ink)]/60">{whyUs.description}</p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {whyUs.cards.map((b, idx) => (
                <div key={idx} className="group relative overflow-hidden rounded-3xl border border-[var(--line)]/60 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[var(--chalk)]/5">
                  <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-[var(--marigold)]/5 transition-transform duration-500 group-hover:scale-150"></div>
                  <div className="relative z-10">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--chalk)]/5 text-2xl text-[var(--chalk)] transition-colors group-hover:bg-[var(--chalk)] group-hover:text-white">
                      {b.icon}
                    </div>
                    <h3 className="mb-3 text-xl font-black text-[var(--ink)]">{b.title}</h3>
                    <p className="text-base font-medium leading-relaxed text-[var(--ink)]/60">{b.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="how" className="py-20 sm:py-28">
          <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-[var(--marigold)]/20 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--rust)]">{howItWorks.tagline}</span>
              <h2 className="mt-2 font-serif text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">{howItWorks.title}</h2>
            </div>

            <div className="relative mt-20 flex flex-col gap-12 md:flex-row md:justify-between md:gap-8">
              <div aria-hidden="true" className="absolute left-[5%] right-[5%] top-8 hidden h-[2px] bg-gradient-to-r from-[var(--chalk)]/10 via-[var(--chalk)]/40 to-[var(--chalk)]/10 md:block" />

              {howItWorks.steps.map((s, i) => (
                <div key={i} className="group relative z-10 flex items-start gap-6 md:w-1/3 md:flex-col md:items-center md:text-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-[6px] border-[var(--paper)] bg-[var(--chalk)] font-mono text-xl font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                    0{i + 1}
                  </div>
                  <div className="pt-2 md:pt-0">
                    <h3 className="text-xl font-black text-[var(--ink)]">{s.title}</h3>
                    <p className="mt-3 text-base font-medium leading-relaxed text-[var(--ink)]/60 md:mx-auto md:max-w-[260px]">{s.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- COMPARISON --- */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-[var(--chalk)]/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--chalk)]">{comparison.tagline}</span>
              <h2 className="mt-2 font-serif text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">{comparison.title}</h2>
            </div>

            <div className="mt-14 overflow-hidden rounded-3xl border border-[var(--line)]/60 bg-white shadow-sm">
              <div className="grid grid-cols-3 border-b border-[var(--line)]/60 bg-[var(--paper)]">
                <div className="p-5"></div>
                <div className="p-5 text-center">
                  <span className="text-sm font-black text-[var(--chalk)]">{comparison.columns.nexus}</span>
                </div>
                <div className="p-5 text-center">
                  <span className="text-sm font-bold text-[var(--ink)]/50">{comparison.columns.other}</span>
                </div>
              </div>
              {comparison.rows.map((row, idx) => (
                <div key={idx} className={`grid grid-cols-3 items-center ${idx !== comparison.rows.length - 1 ? 'border-b border-[var(--line)]/40' : ''}`}>
                  <div className="p-5 text-sm font-bold text-[var(--ink)]/80">{row.feature}</div>
                  <div className="flex justify-center p-5"><ComparisonMark value={row.nexus} /></div>
                  <div className="flex justify-center p-5"><ComparisonMark value={row.other} /></div>
                </div>
              ))}
            </div>
            {comparison.footnote && (
              <p className="mt-4 text-center text-xs font-medium text-[var(--ink)]/40">{comparison.footnote}</p>
            )}
          </div>
        </section>

        {/* --- WHAT WE BELIEVE --- */}
        <section className="relative overflow-hidden bg-[var(--ink)] py-20 text-white sm:py-28">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>

          <div className="relative z-10 mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-4 inline-block font-mono text-xs font-bold uppercase tracking-widest text-[var(--marigold)]">{whatWeBelieve.tagline}</span>
              <h2 className="mt-2 font-serif text-4xl font-black tracking-tight sm:text-5xl">{whatWeBelieve.title}</h2>
              <p className="mt-6 text-lg font-medium leading-relaxed text-white/70">{whatWeBelieve.description}</p>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-8">
              {whatWeBelieve.values.map((v, i) => (
                <div key={i} className="relative border-t border-white/20 pt-6 transition-all hover:border-[var(--marigold)]">
                  <span className="absolute -top-4 right-0 font-serif text-6xl font-black text-white/5">0{i + 1}</span>
                  <h3 className="mt-2 font-serif text-2xl font-black text-white">{v.title}</h3>
                  <p className="mt-4 text-base font-medium leading-relaxed text-white/60">{v.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- TESTIMONIALS --- */}
        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-[var(--marigold)]/20 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--rust)]">{testimonials.tagline}</span>
              <h2 className="mt-2 font-serif text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">{testimonials.title}</h2>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.items.map((t, idx) => (
                <figure key={idx} className="flex flex-col rounded-3xl border border-[var(--line)]/60 bg-white p-8 shadow-sm">
                  <div className="text-[var(--marigold)]" aria-hidden="true">★★★★★</div>
                  <blockquote className="mt-4 flex-1 text-base font-medium leading-relaxed text-[var(--ink)]/75">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 border-t border-[var(--line)]/50 pt-4">
                    <div className="text-sm font-black text-[var(--ink)]">{t.name}</div>
                    <div className="text-xs font-bold uppercase tracking-wide text-[var(--ink)]/40">{t.role}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* --- DUAL CTA --- */}
        <section className="relative py-20 sm:py-28 bg-gradient-to-b from-[var(--paper)] to-white">
          <div className="mx-auto grid max-w-[1300px] grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
            <div className="group relative overflow-hidden rounded-3xl border border-[var(--line)]/60 bg-white p-10 sm:p-14 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[var(--marigold)]/10 blur-3xl transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10">
                <p className="inline-block rounded-md bg-[var(--marigold)]/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-[var(--rust)]">{dualCta.family.tagline}</p>
                <h3 className="mt-6 font-serif text-3xl font-black tracking-tight text-[var(--ink)] sm:text-4xl">{dualCta.family.title}</h3>
                <p className="mt-4 max-w-sm text-base font-medium leading-relaxed text-[var(--ink)]/60">{dualCta.family.description}</p>
                <Link to={dualCta.family.href} onClick={handleNavigation} className={`mt-10 inline-flex items-center gap-2 rounded-2xl bg-[var(--chalk)] px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-opacity-90 active:scale-[0.98] ${focusRing}`}>
                  {dualCta.family.btnText} <span className="text-lg">→</span>
                </Link>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-3xl bg-[var(--chalk)] p-10 sm:p-14 shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
              <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[var(--good)] blur-3xl transition-transform duration-500 group-hover:scale-150"></div>
              <div className="relative z-10">
                <p className="inline-block rounded-md bg-white/10 px-3 py-1 font-mono text-xs font-bold uppercase tracking-widest text-[var(--marigold)] backdrop-blur-sm">{dualCta.educator.tagline}</p>
                <h3 className="mt-6 font-serif text-3xl font-black tracking-tight text-white sm:text-4xl">{dualCta.educator.title}</h3>
                <p className="mt-4 max-w-sm text-base font-medium leading-relaxed text-white/70">{dualCta.educator.description}</p>
                <Link to={dualCta.educator.href} onClick={handleNavigation} className={`mt-10 inline-flex items-center gap-2 rounded-2xl bg-[var(--marigold)] px-8 py-4 text-sm font-bold uppercase tracking-wider text-[var(--ink)] shadow-lg transition-all hover:scale-[1.02] hover:bg-white active:scale-[0.98] ${focusRing}`}>
                  {dualCta.educator.btnText} <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* --- CONTACT US SECTION --- */}
        <section id="contact" className="py-20 sm:py-28 bg-[var(--paper)]">
          <div className="mx-auto max-w-[800px] px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="mb-4 inline-block rounded-full bg-[var(--chalk)]/10 px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-widest text-[var(--chalk)]">{contact.tagline}</span>
              <h2 className="mt-2 font-serif text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">{contact.title}</h2>
              <p className="mt-4 text-base font-medium leading-relaxed text-[var(--ink)]/60">{contact.description}</p>
            </div>

            <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-start gap-4 rounded-2xl border border-[var(--line)]/60 bg-white p-6 shadow-sm">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--marigold)]/10 text-2xl text-[var(--rust)]">✉️</span>
                <div>
                  <h4 className="text-sm font-bold text-[var(--ink)]/50 uppercase tracking-wider">Email Us</h4>
                  <a href={`mailto:${contact.email}`} className="mt-1 text-base font-black text-[var(--ink)] hover:text-[var(--marigold)] transition-colors">{contact.email}</a>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-2xl border border-[var(--line)]/60 bg-white p-6 shadow-sm">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--good)]/10 text-2xl text-[var(--good)]">📞</span>
                <div>
                  <h4 className="text-sm font-bold text-[var(--ink)]/50 uppercase tracking-wider">Call or WhatsApp</h4>
                  <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-1 text-base font-black text-[var(--ink)] hover:text-[var(--good)] transition-colors">{contact.phone}</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FAQ --- */}
        <section className="py-20 sm:py-28 bg-white">
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
                      {link.href.startsWith('#') ? (
                        <a href={link.href} className={`text-sm font-semibold text-[var(--ink)]/70 hover:text-[var(--marigold)] rounded ${focusRing}`}>{link.label}</a>
                      ) : (
                        <Link to={link.href} onClick={handleNavigation} className={`text-sm font-semibold text-[var(--ink)]/70 hover:text-[var(--marigold)] rounded ${focusRing}`}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 flex flex-col items-center gap-4 border-t border-[var(--line)]/40 pt-8 text-center">
            <p className="font-mono text-[12px] font-bold uppercase tracking-widest text-[var(--ink)]/40">
              {global.footerText}
            </p>
          </div>
        </div>
      </footer>

      {/* --- STICKY MOBILE CTA --- */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-[var(--line)]/60 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md transition-transform duration-300 sm:hidden ${showStickyCta ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <Link
          to={hero.primaryCta.href}
          onClick={handleNavigation}
          className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--chalk)] px-6 py-3.5 text-sm font-bold text-white shadow-md active:scale-[0.98] ${focusRing}`}
        >
          {hero.primaryCta.label} <span>→</span>
        </Link>
      </div>

      {/* --- QUICK CONTACT --- */}
      <a
        href={contact.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className={`fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[var(--good)] text-2xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95 sm:flex ${focusRing}`}
      >
        💬
      </a>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
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