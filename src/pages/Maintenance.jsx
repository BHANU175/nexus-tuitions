import React, { useEffect, useState } from 'react';

/**
 * Nexus Tuitions — Maintenance Mode
 * Signature element: a line-art AI robot, built entirely from the brand's
 * own palette, that assembles itself on load and settles into an idle
 * "tinkering" loop — a small nod to an AI tutor doing the fixing.
 */

const STATUS_MESSAGES = [
  'calibrating lesson plans',
  'reconnecting tutors to students',
  'polishing the whiteboard',
  'indexing the question bank',
  'running final diagnostics',
];

export default function Maintenance() {
  const [statusIndex, setStatusIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setStatusIndex((i) => (i + 1) % STATUS_MESSAGES.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const handleSubscribe = () => {
    if (!email.trim()) {
      setError('Enter an email to get notified.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError('That email looks off — check it and try again.');
      return;
    }
    setError('');
    setSubscribed(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubscribe();
  };

  return (
    <div
      style={{
        '--paper': '#FDF9F1',
        '--paper-deep': '#F2E9D7',
        '--ink': '#1C2420',
        '--ink-soft': 'rgba(28, 36, 32, 0.64)',
        '--marigold': '#F38C35',
        '--marigold-light': '#FFCB8E',
        '--mint': '#2E7A63',
        '--line': 'rgba(28, 36, 32, 0.14)',
        background: 'var(--paper)',
        color: 'var(--ink)',
        fontFamily: "'Inter', sans-serif",
      }}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16 text-center"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');

        .nx-display { font-family: 'Fraunces', serif; }
        .nx-mono { font-family: 'IBM Plex Mono', monospace; }

        .nx-bg-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image: radial-gradient(var(--line) 1px, transparent 1px);
          background-size: 26px 26px;
          -webkit-mask-image: radial-gradient(ellipse 60% 46% at 50% 36%, black 5%, transparent 75%);
          mask-image: radial-gradient(ellipse 60% 46% at 50% 36%, black 5%, transparent 75%);
        }
        .nx-bg-glow {
          position: absolute; top: -12%; left: 50%; width: 640px; height: 640px;
          transform: translateX(-50%);
          background: radial-gradient(circle, var(--marigold-light) 0%, transparent 62%);
          opacity: 0.35; pointer-events: none; filter: blur(2px);
        }

        @keyframes nx-drop {
          0% { opacity: 0; transform: translateY(-22px) scale(0.92); }
          65% { opacity: 1; }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .nx-part { animation: nx-drop 0.62s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .nx-p-feet { animation-delay: 0s; }
        .nx-p-legs { animation-delay: .08s; }
        .nx-p-torso { animation-delay: .18s; }
        .nx-p-arm-l { animation-delay: .30s; }
        .nx-p-arm-r { animation-delay: .30s; }
        .nx-p-neck { animation-delay: .42s; }
        .nx-p-head { animation-delay: .50s; }
        .nx-p-antenna { animation-delay: .62s; }

        @keyframes nx-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .nx-idle { animation: nx-float 4.6s ease-in-out infinite; animation-delay: 1.3s; }

        @keyframes nx-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .nx-blink { transform-box: fill-box; transform-origin: center; animation: nx-blink 5.4s ease-in-out infinite; animation-delay: 2s; }

        @keyframes nx-power { 0% { fill: var(--ink); } 100% { fill: var(--marigold); } }
        .nx-eye { animation: nx-power .3s .92s ease-out both; }

        @keyframes nx-wrench {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(16deg); }
        }
        .nx-wrench { transform-box: fill-box; transform-origin: 30% 80%; animation: nx-wrench 2.1s ease-in-out infinite; animation-delay: 1.4s; }

        @keyframes nx-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.22); }
        }
        .nx-antenna-dot { transform-box: fill-box; transform-origin: center; animation: nx-pulse 2s ease-in-out infinite; animation-delay: 1s; }
        .nx-chest { transform-box: fill-box; transform-origin: center; animation: nx-pulse 2.6s ease-in-out infinite; animation-delay: 1.1s; }

        @keyframes nx-spark {
          0% { opacity: 0; transform: scale(0.5); }
          35% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.35); }
        }
        .nx-spark { transform-box: fill-box; transform-origin: center; animation: nx-spark .9s .86s ease-out both; }

        @keyframes nx-fade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .nx-fade { animation: nx-fade .4s ease-out both; }

        @keyframes nx-scan {
          0% { left: -32%; width: 32%; }
          55% { width: 46%; }
          100% { left: 100%; width: 30%; }
        }
        .nx-scan-bar { animation: nx-scan 1.9s ease-in-out infinite; }

        .nx-focus:focus-visible { outline: 2px solid var(--marigold); outline-offset: 2px; }

        @media (prefers-reduced-motion: reduce) {
          .nx-part, .nx-idle, .nx-blink, .nx-wrench, .nx-antenna-dot, .nx-chest, .nx-spark, .nx-scan-bar, .nx-fade {
            animation: none !important;
          }
          .nx-eye { fill: var(--marigold) !important; }
        }
      `}</style>

      <div className="nx-bg-glow" aria-hidden="true" />
      <div className="nx-bg-grid" aria-hidden="true" />

      <div className="relative z-10 flex w-full flex-col items-center">
        {/* Wordmark */}
        <div className="mb-4 flex flex-col items-center select-none">
          <span className="nx-display text-2xl font-bold tracking-tight">
            nexus<span style={{ color: 'var(--marigold)' }}>.</span>
          </span>
          <span
            className="mt-1 text-[10px] font-medium tracking-[0.4em]"
            style={{ color: 'var(--ink-soft)', paddingLeft: '2px' }}
          >
            TUITIONS
          </span>
        </div>

        {/* Robot */}
        <div className="w-40 sm:w-48 md:w-56">
          <svg viewBox="0 0 220 240" className="nx-idle h-auto w-full" role="img" aria-label="Animated robot tinkering, representing scheduled maintenance">
            <g>
              <g className="nx-part nx-p-feet">
                <rect x="72" y="212" width="26" height="12" rx="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
                <rect x="122" y="212" width="26" height="12" rx="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              </g>
              <g className="nx-part nx-p-legs">
                <rect x="80" y="184" width="12" height="30" rx="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
                <rect x="128" y="184" width="12" height="30" rx="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              </g>
              <g className="nx-part nx-p-torso">
                <rect x="58" y="112" width="104" height="78" rx="20" fill="var(--paper)" stroke="var(--ink)" strokeWidth="5" />
                <circle className="nx-chest" cx="110" cy="151" r="9" fill="var(--marigold)" />
              </g>
              <g className="nx-part nx-p-arm-l">
                <rect x="34" y="122" width="16" height="52" rx="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              </g>
              <g className="nx-part nx-p-arm-r">
                <rect x="170" y="122" width="16" height="52" rx="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
                <g className="nx-wrench" transform="translate(178,172)">
                  <rect x="-3" y="-3" width="30" height="7" rx="3.5" fill="var(--ink)" transform="rotate(38)" />
                  <circle cx="19" cy="15" r="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3.5" />
                </g>
              </g>
              <g className="nx-part nx-p-neck">
                <rect x="98" y="96" width="24" height="18" rx="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              </g>
              <g className="nx-part nx-p-head">
                <rect x="62" y="34" width="96" height="66" rx="22" fill="var(--paper)" stroke="var(--ink)" strokeWidth="5" />
                <g className="nx-blink">
                  <circle className="nx-eye" cx="92" cy="66" r="7" fill="var(--ink)" />
                  <circle className="nx-eye" cx="128" cy="66" r="7" fill="var(--ink)" />
                </g>
              </g>
              <g className="nx-part nx-p-antenna">
                <line x1="110" y1="34" x2="110" y2="14" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
                <circle className="nx-antenna-dot" cx="110" cy="10" r="6" fill="var(--mint)" />
              </g>
              <g className="nx-spark" aria-hidden="true">
                <line x1="110" y1="66" x2="110" y2="26" stroke="var(--marigold)" strokeWidth="3" strokeLinecap="round" />
                <line x1="110" y1="66" x2="110" y2="26" stroke="var(--marigold)" strokeWidth="3" strokeLinecap="round" transform="rotate(60 110 66)" />
                <line x1="110" y1="66" x2="110" y2="26" stroke="var(--mint)" strokeWidth="3" strokeLinecap="round" transform="rotate(120 110 66)" />
                <line x1="110" y1="66" x2="110" y2="26" stroke="var(--marigold)" strokeWidth="3" strokeLinecap="round" transform="rotate(180 110 66)" />
                <line x1="110" y1="66" x2="110" y2="26" stroke="var(--mint)" strokeWidth="3" strokeLinecap="round" transform="rotate(240 110 66)" />
                <line x1="110" y1="66" x2="110" y2="26" stroke="var(--marigold)" strokeWidth="3" strokeLinecap="round" transform="rotate(300 110 66)" />
              </g>
            </g>
          </svg>
        </div>

        {/* Status readout */}
        <div className="nx-mono mt-1 flex h-6 items-center justify-center text-[11px] tracking-wide" style={{ color: 'var(--ink-soft)' }} aria-live="polite">
          <span key={statusIndex} className="nx-fade">
            <span style={{ color: 'var(--marigold)' }}>{'> '}</span>
            {STATUS_MESSAGES[statusIndex]}...
          </span>
        </div>

        {/* Headline */}
        <h1 className="nx-display mt-6 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
          Class is briefly out of session.
        </h1>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          We're tuning up the systems behind every lesson so things load faster and feel sharper. Back shortly.
        </p>

        {/* Scan / progress bar */}
        <div className="mt-8 w-full max-w-xs">
          <div className="h-[6px] w-full overflow-hidden rounded-full" style={{ background: 'var(--paper-deep)', border: '1px solid var(--line)' }}>
            <div className="nx-scan-bar relative h-full rounded-full" style={{ background: 'var(--marigold)' }} />
          </div>
        </div>

        {/* Notify me */}
        <div className="mt-8 w-full max-w-sm">
          {subscribed ? (
            <p className="nx-mono text-[13px]" style={{ color: 'var(--mint)' }}>
              ✓ you're on the list — we'll email you the moment we're back.
            </p>
          ) : (
            <>
              <div className="flex items-stretch gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="you@email.com"
                  aria-label="Email address"
                  className="nx-focus flex-1 rounded-lg px-4 text-sm outline-none"
                  style={{ background: 'var(--paper-deep)', border: '1px solid var(--line)', color: 'var(--ink)', height: '44px' }}
                />
                <button
                  onClick={handleSubscribe}
                  className="nx-focus rounded-lg px-5 text-sm font-semibold"
                  style={{ background: 'var(--ink)', color: 'var(--paper)', height: '44px' }}
                >
                  Notify me
                </button>
              </div>
              {error && (
                <p className="mt-2 text-[12px]" style={{ color: '#B0442B' }}>
                  {error}
                </p>
              )}
            </>
          )}
        </div>

        <p className="nx-mono mt-10 text-[10px] tracking-[0.3em]" style={{ color: 'var(--ink-soft)' }}>
          NEXUS TUITIONS · SCHEDULED MAINTENANCE
        </p>
      </div>
    </div>
  );
}