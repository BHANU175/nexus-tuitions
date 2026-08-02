import React from 'react';

/**
 * Reusable Maintenance Mode Component
 * Matches the styling tone and design system of Nexus Tuitions.
 */
export default function Maintenance() {
  return (
    <div
      style={{
        '--paper': '#FDF9F1',
        '--ink': '#1C2420',
        '--marigold': '#F38C35',
      }}
      className="flex min-h-screen flex-col items-center justify-center bg-[var(--paper)] px-4 text-center font-sans text-[var(--ink)]"
    >
      <div className="mb-8 flex flex-col justify-center select-none">
        <span className="font-sans text-4xl font-black tracking-tighter text-black leading-none">
          nexus<span className="text-black">.</span>
        </span>
        <span className="font-sans text-[12px] font-medium tracking-[0.42em] text-black lowercase mt-1 pl-[2px]">
          tuitions
        </span>
      </div>
      
      <h1 className="font-serif text-4xl font-black tracking-tight text-[var(--ink)] sm:text-5xl">
        We'll be right back
      </h1>
      
      <p className="mt-4 max-w-md text-base font-medium leading-relaxed text-[var(--ink)]/70">
        Nexus Tuitions is currently undergoing scheduled maintenance. Please check back soon.
      </p>
    </div>
  );
}