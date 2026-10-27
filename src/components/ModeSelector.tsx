import React from 'react';
import { Sparkles, Key, Wand2, Lightbulb, CheckCircle2 } from 'lucide-react';
import { LearningMode } from '../types';
import { playSpellSound, playPumpkinSound } from '../utils/audio';

interface ModeSelectorProps {
  currentMode: LearningMode;
  onSelectMode: (mode: LearningMode) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, onSelectMode }) => {
  const handleModeChange = (mode: LearningMode) => {
    if (mode !== currentMode) {
      if (mode === 'answer_spell') {
        playSpellSound();
      } else {
        playPumpkinSound();
      }
      onSelectMode(mode);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mode 1: THE ANSWER SPELL */}
        <button
          type="button"
          onClick={() => handleModeChange('answer_spell')}
          className={`relative text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
            currentMode === 'answer_spell'
              ? 'bg-gradient-to-br from-purple-950/80 via-purple-900/60 to-black border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.45)] ring-2 ring-purple-400/50'
              : 'bg-black/60 border-purple-900/40 hover:border-purple-600/70 hover:bg-purple-950/40'
          }`}
        >
          {/* Glowing accent orb */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-purple-600/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border ${
                  currentMode === 'answer_spell'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-600/40'
                    : 'bg-purple-950/60 text-purple-300 border-purple-800'
                }`}
              >
                <Wand2 className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-cinzel text-purple-200 tracking-wide">
                    The Answer Spell
                  </h3>
                  {currentMode === 'answer_spell' && (
                    <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-400/40">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-purple-400 font-medium">Direct Answer Mode</p>
              </div>
            </div>

            {currentMode === 'answer_spell' ? (
              <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-purple-500/40 group-hover:text-purple-400 transition-colors shrink-0" />
            )}
          </div>

          <p className="mt-3 text-xs md:text-sm text-purple-200/80 leading-relaxed relative z-10">
            Receive direct solutions with numbered step-by-step breakdowns and spectral insights. Click any step to hear it explained simpler or with analogies.
          </p>

          <div className="mt-4 pt-3 border-t border-purple-900/50 flex items-center justify-between text-[11px] text-purple-300/70 font-mono-code">
            <span>✦ Complete Solutions</span>
            <span>✦ Step Simplifier</span>
          </div>
        </button>

        {/* Mode 2: THE MYSTERY SPELL */}
        <button
          type="button"
          onClick={() => handleModeChange('mystery_spell')}
          className={`relative text-left p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group ${
            currentMode === 'mystery_spell'
              ? 'bg-gradient-to-br from-orange-950/80 via-amber-950/50 to-black border-orange-500 shadow-[0_0_25px_rgba(249,115,22,0.45)] ring-2 ring-orange-400/50'
              : 'bg-black/60 border-orange-950/50 hover:border-orange-500/70 hover:bg-orange-950/30'
          }`}
        >
          {/* Glowing accent orb */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-orange-600/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border ${
                  currentMode === 'mystery_spell'
                    ? 'bg-orange-600 text-white border-orange-400 shadow-md shadow-orange-600/40'
                    : 'bg-orange-950/60 text-orange-300 border-orange-900'
                }`}
              >
                <Key className="w-6 h-6 animate-flicker" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-cinzel text-orange-200 tracking-wide">
                    The Mystery Spell
                  </h3>
                  {currentMode === 'mystery_spell' && (
                    <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-full bg-orange-500/30 text-orange-200 border border-orange-400/40">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-orange-400 font-medium">Hint-Based Discovery Mode</p>
              </div>
            </div>

            {currentMode === 'mystery_spell' ? (
              <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0" />
            ) : (
              <Lightbulb className="w-5 h-5 text-orange-500/40 group-hover:text-orange-400 transition-colors shrink-0" />
            )}
          </div>

          <p className="mt-3 text-xs md:text-sm text-orange-200/80 leading-relaxed relative z-10">
            Never spoils the answer! Guides you step-by-step with one clue at a time. Attempts are evaluated kindly, and you can switch to Direct Answer anytime.
          </p>

          <div className="mt-4 pt-3 border-t border-orange-900/50 flex items-center justify-between text-[11px] text-orange-300/70 font-mono-code">
            <span>🕯️ Progressive Clues</span>
            <span>🗝️ Socratic Guidance</span>
          </div>
        </button>
      </div>
    </div>
  );
};
