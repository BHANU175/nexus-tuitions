import React, { useEffect, useState } from 'react';

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
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden px-6 py-12 text-center"
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
          position: absolute; top: 10%; left: 50%; width: 500px; height: 500px;
          transform: translateX(-50%);
          background: radial-gradient(circle, var(--marigold-light) 0%, transparent 65%);
          opacity: 0.3; pointer-events: none; filter: blur(4px);
        }

        @keyframes nx-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .nx-idle { animation: nx-float 4.6s ease-in-out infinite; }

        @keyframes nx-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        .nx-blink { transform-box: fill-box; transform-origin: center; animation: nx-blink 5.4s ease-in-out infinite; }

        @keyframes nx-wrench {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(16deg); }
        }
        .nx-wrench { transform-box: fill-box; transform-origin: 0% 50%; animation: nx-wrench 2.1s ease-in-out infinite; }

        @keyframes nx-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .nx-antenna-dot { transform-box: fill-box; transform-origin: center; animation: nx-pulse 2s ease-in-out infinite; }
        .nx-chest { transform-box: fill-box; transform-origin: center; animation: nx-pulse 2.6s ease-in-out infinite; }

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
      `}</style>

      <div className="nx-bg-glow" aria-hidden="true" />
      <div className="nx-bg-grid" aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        {/* Wordmark */}
        <div className="mb-2 flex flex-col items-center select-none">
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

        {/* Robot Graphic */}
        <div className="w-36 sm:w-44">
          <svg viewBox="0 0 220 240" className="nx-idle h-auto w-full" role="img" aria-label="Animated robot tinkering">
            <g>
              {/* Feet */}
              <rect x="72" y="212" width="26" height="12" rx="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              <rect x="122" y="212" width="26" height="12" rx="6" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              
              {/* Legs */}
              <rect x="80" y="184" width="12" height="30" rx="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              <rect x="128" y="184" width="12" height="30" rx="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              
              {/* Torso */}
              <rect x="58" y="112" width="104" height="78" rx="20" fill="var(--paper)" stroke="var(--ink)" strokeWidth="5" />
              <circle className="nx-chest" cx="110" cy="151" r="9" fill="var(--marigold)" />
              
              {/* Left Arm */}
              <rect x="34" y="122" width="16" height="52" rx="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              
              {/* Right Arm & Wrench Group */}
              <rect x="170" y="122" width="16" height="52" rx="8" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              <g className="nx-wrench" transform="translate(178, 160)">
                <rect x="0" y="0" width="24" height="7" rx="3.5" fill="var(--ink)" transform="rotate(35)" />
                <circle cx="18" cy="12" r="7" fill="var(--paper)" stroke="var(--ink)" strokeWidth="3" />
              </g>

              {/* Neck & Head */}
              <rect x="98" y="96" width="24" height="18" rx="5" fill="var(--paper)" stroke="var(--ink)" strokeWidth="4" />
              <rect x="62" y="34" width="96" height="66" rx="22" fill="var(--paper)" stroke="var(--ink)" strokeWidth="5" />
              
              {/* Eyes */}
              <g className="nx-blink">
                <circle cx="92" cy="66" r="7" fill="var(--marigold)" />
                <circle cx="128" cy="66" r="7" fill="var(--marigold)" />
              </g>

              {/* Antenna */}
              <line x1="110" y1="34" x2="110" y2="14" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round" />
              <circle className="nx-antenna-dot" cx="110" cy="10" r="6" fill="var(--mint)" />
            </g>
          </svg>
        </div>

        {/* Status Readout */}
        <div className="nx-mono mt-2 flex h-6 items-center justify-center text-[11px] tracking-wide" style={{ color: 'var(--ink-soft)' }} aria-live="polite">
          <span key={statusIndex} className="nx-fade">
            <span style={{ color: 'var(--marigold)' }}>{'> '}</span>
            {STATUS_MESSAGES[statusIndex]}...
          </span>
        </div>

        {/* Headline */}
        <h1 className="nx-display mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
          Class is briefly out of session.
        </h1>
        <p className="mt-3 max-w-sm text-[14px] leading-relaxed" style={{ color: 'var(--ink-soft)' }}>
          We're tuning up systems behind every lesson so things load faster. Back shortly.
        </p>

        {/* Scan Bar */}
        <div className="mt-6 w-full max-w-xs">
          <div className="h-[5px] w-full overflow-hidden rounded-full" style={{ background: 'var(--paper-deep)', border: '1px solid var(--line)' }}>
            <div className="nx-scan-bar relative h-full rounded-full" style={{ background: 'var(--marigold)' }} />
          </div>
        </div>

        {/* Subscription Form */}
        <div className="mt-6 w-full max-w-sm">
          {subscribed ? (
            <p className="nx-mono text-[13px]" style={{ color: 'var(--mint)' }}>
              ✓ you're on the list — we'll email you when we're back.
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
                  style={{ background: 'var(--paper-deep)', border: '1px solid var(--line)', color: 'var(--ink)', height: '42px' }}
                />
                <button
                  type="button"
                  onClick={handleSubscribe}
                  className="nx-focus rounded-lg px-4 text-sm font-semibold"
                  style={{ background: 'var(--ink)', color: 'var(--paper)', height: '42px' }}
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

        <p className="nx-mono mt-8 text-[10px] tracking-[0.3em]" style={{ color: 'var(--ink-soft)' }}>
          NEXUS TUITIONS · SCHEDULED MAINTENANCE
        </p>
      </div>
    </div>
  );
}