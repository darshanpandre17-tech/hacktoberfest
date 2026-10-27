import React, { useState } from 'react';
import { playGhostSound } from '../utils/audio';

export const HalloweenAtmosphere: React.FC = () => {
  const [ghostMood, setGhostMood] = useState<'happy' | 'spooky' | 'wink'>('happy');
  const [ghostQuote, setGhostQuote] = useState('Boo! Ready to study?');

  const quotes = [
    'Boo! Ready to study?',
    'Gemma 4 is in the spellbook!',
    'Knowledge is the purest magic!',
    'Even ghosts love calculus!',
    'Have a spooky productive session!',
    'Whisper a spell and ask away!',
  ];

  const handleGhostClick = () => {
    playGhostSound();
    const nextMood = ghostMood === 'happy' ? 'wink' : ghostMood === 'wink' ? 'spooky' : 'happy';
    setGhostMood(nextMood);
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setGhostQuote(randomQuote);
  };

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Deep purple & midnight gradient backdrop overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(112,26,179,0.25),rgba(8,4,14,0.95))]" />

      {/* Spooky Cobweb in top-left */}
      <svg
        className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 text-purple-500/20"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M0 0 L100 0 M0 0 L0 100 M0 0 L100 100 M0 0 L50 100 M0 0 L100 50" />
        <path d="M20 0 Q 20 20 0 20" />
        <path d="M40 0 Q 40 40 0 40" />
        <path d="M60 0 Q 60 60 0 60" />
        <path d="M80 0 Q 80 80 0 80" />
      </svg>

      {/* Spooky Cobweb in top-right */}
      <svg
        className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 text-orange-500/20 scale-x-[-1]"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M0 0 L100 0 M0 0 L0 100 M0 0 L100 100 M0 0 L50 100 M0 0 L100 50" />
        <path d="M20 0 Q 20 20 0 20" />
        <path d="M40 0 Q 40 40 0 40" />
        <path d="M60 0 Q 60 60 0 60" />
        <path d="M80 0 Q 80 80 0 80" />
      </svg>

      {/* Floating Animated Bats across header */}
      <div
        className="absolute top-12 left-0 text-purple-300/40 opacity-70 pointer-events-none"
        style={{ animation: 'batFly 22s linear infinite' }}
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 9c-1.5-2-4-3-7-3-2 0-4 1-5 2 1 2 2 4 4 5 1 0.5 2 0.5 3 0l2-2 1 1 1-1 2 2c1 0.5 2 0.5 3 0 2-1 3-3 4-5-1-1-3-2-5-2-3 0-5.5 1-7 3z" />
        </svg>
      </div>

      <div
        className="absolute top-28 left-0 text-orange-400/30 opacity-60 pointer-events-none"
        style={{ animation: 'batFly 28s linear infinite 8s' }}
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 9c-1.5-2-4-3-7-3-2 0-4 1-5 2 1 2 2 4 4 5 1 0.5 2 0.5 3 0l2-2 1 1 1-1 2 2c1 0.5 2 0.5 3 0 2-1 3-3 4-5-1-1-3-2-5-2-3 0-5.5 1-7 3z" />
        </svg>
      </div>

      {/* Interactive Floating Friendly Ghost mascot in top right corner */}
      <div className="pointer-events-auto absolute top-20 right-4 md:right-10 z-10 hidden sm:block">
        <div
          onClick={handleGhostClick}
          className="group relative cursor-pointer select-none animate-float transition-transform hover:scale-110"
          title="Click the friendly ghost!"
        >
          {/* Speech bubble */}
          <div className="absolute -top-10 -left-24 bg-purple-950/90 text-purple-200 border border-purple-500/40 text-xs px-3 py-1.5 rounded-xl shadow-lg shadow-purple-900/50 whitespace-nowrap opacity-90 group-hover:opacity-100 transition-opacity">
            {ghostQuote}
            <div className="absolute right-4 -bottom-1.5 w-3 h-3 bg-purple-950 border-r border-b border-purple-500/40 rotate-45" />
          </div>

          {/* Ghost SVG Body */}
          <svg
            className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_15px_rgba(192,132,252,0.6)]"
            viewBox="0 0 100 100"
            fill="none"
          >
            {/* Ghost body aura */}
            <path
              d="M50 15 C30 15 20 35 20 55 C20 75 25 85 30 85 C35 85 38 78 45 78 C52 78 55 85 62 85 C69 85 72 78 78 78 C84 78 85 85 90 85 C92 75 90 45 80 30 C72 18 62 15 50 15 Z"
              fill="url(#ghostGlow)"
              opacity="0.95"
            />
            {/* Spectral hat / witch cap */}
            <path d="M35 22 L50 4 L65 22 Z" fill="#6b21a8" />
            <path d="M30 22 C40 20 60 20 70 22 C60 25 40 25 30 22 Z" fill="#f97316" />
            <circle cx="50" cy="5" r="3" fill="#fb923c" />

            {/* Eyes */}
            {ghostMood === 'wink' ? (
              <>
                <circle cx="40" cy="42" r="4" fill="#08040e" />
                <path d="M58 42 Q 64 39 70 42" stroke="#08040e" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : ghostMood === 'spooky' ? (
              <>
                <ellipse cx="40" cy="42" rx="4" ry="6" fill="#f97316" />
                <ellipse cx="68" cy="42" rx="4" ry="6" fill="#f97316" />
              </>
            ) : (
              <>
                <circle cx="40" cy="42" r="4.5" fill="#08040e" />
                <circle cx="41.5" cy="40.5" r="1.5" fill="#ffffff" />
                <circle cx="66" cy="42" r="4.5" fill="#08040e" />
                <circle cx="67.5" cy="40.5" r="1.5" fill="#ffffff" />
              </>
            )}

            {/* Rosy ghost cheeks */}
            <circle cx="33" cy="48" r="4" fill="#ec4899" opacity="0.4" />
            <circle cx="73" cy="48" r="4" fill="#ec4899" opacity="0.4" />

            {/* Friendly mouth */}
            {ghostMood === 'spooky' ? (
              <path d="M48 52 Q 54 62 60 52" stroke="#f97316" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M48 50 Q 54 58 60 50" stroke="#08040e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            )}

            <defs>
              <linearGradient id="ghostGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f3e8ff" />
                <stop offset="60%" stopColor="#d8b4fe" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Subtle bottom mist */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-purple-950/30 via-orange-950/10 to-transparent pointer-events-none" />
    </div>
  );
};
