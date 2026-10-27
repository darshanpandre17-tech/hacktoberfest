import React, { useState } from 'react';
import { ChatMessage, LearningMode } from '../types';
import {
  Wand2,
  Key,
  Copy,
  Check,
  RotateCcw,
  HelpCircle,
  Sparkles,
  Trophy,
  Lightbulb,
  Maximize2,
  X,
  FileImage,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playVictorySound, playSpellSound, playPumpkinSound } from '../utils/audio';
import { MathRenderer, renderInlineMathAndMarkdown } from './MathRenderer';

interface MessageCardProps {
  message: ChatMessage;
  onRetry?: (messageId: string) => void;
  onSimplifyStep?: (stepContent: string) => void;
  onSwitchToAnswerSpell?: () => void;
  onAskFollowUp?: (prompt: string) => void;
}

export const MessageCard: React.FC<MessageCardProps> = ({
  message,
  onRetry,
  onSimplifyStep,
  onSwitchToAnswerSpell,
  onAskFollowUp,
}) => {
  const [copied, setCopied] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const isUser = message.role === 'user';
  const isMystery = message.mode === 'mystery_spell';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCelebration = () => {
    playVictorySound();
    setCelebrated(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#f97316', '#fb923c', '#d946ef', '#fbbf24'],
    });
  };

  // Structured message parser with KaTeX support
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 1 / 2 / 3
      if (trimmed.startsWith('### ')) {
        const text = trimmed.replace(/^###\s+/, '');
        // Highlight verification sections
        const isVerification = text.toLowerCase().includes('verification') || text.includes('✓');
        return (
          <h4
            key={idx}
            className={`text-base font-bold font-cinzel mt-4 mb-2 flex items-center gap-2 ${
              isVerification ? 'text-emerald-300' : 'text-purple-200'
            }`}
          >
            {isVerification ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <span className="text-orange-400">✦</span>
            )}
            <span>{renderInlineMathAndMarkdown(text)}</span>
          </h4>
        );
      }

      if (trimmed.startsWith('## ')) {
        const text = trimmed.replace(/^##\s+/, '');
        return (
          <h3
            key={idx}
            className="text-lg font-bold font-cinzel text-orange-200 mt-5 mb-2.5 pb-1 border-b border-purple-900/40 flex items-center gap-2"
          >
            <span className="text-purple-400">🕯️</span>
            <span>{renderInlineMathAndMarkdown(text)}</span>
          </h3>
        );
      }

      if (trimmed.startsWith('# ')) {
        const text = trimmed.replace(/^#\s+/, '');
        return (
          <h2
            key={idx}
            className="text-xl font-bold font-cinzel text-purple-100 mt-6 mb-3 flex items-center gap-2"
          >
            <span className="text-orange-400">📜</span>
            <span>{renderInlineMathAndMarkdown(text)}</span>
          </h2>
        );
      }

      // Verification Callout Block
      if (
        !isUser &&
        (trimmed.startsWith('✓') ||
          trimmed.startsWith('**Verification') ||
          trimmed.startsWith('**Sanity Check'))
      ) {
        return (
          <div
            key={idx}
            className="my-3 p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-100 text-sm leading-relaxed"
          >
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>{renderInlineMathAndMarkdown(trimmed)}</div>
            </div>
          </div>
        );
      }

      // Step detection: e.g. "Step 1:", "Step 2.", "1.", etc.
      const stepMatch = trimmed.match(/^(?:Step\s*(\d+)[:.]?|(\d+)[.:])\s*(.*)/i);
      if (stepMatch && !isUser) {
        const stepNum = stepMatch[1] || stepMatch[2];
        const stepText = stepMatch[3];
        return (
          <div
            key={idx}
            className="my-3 p-3.5 rounded-xl bg-purple-950/40 border border-purple-800/40 hover:border-purple-500/50 transition-colors group relative"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 flex-1">
                <span className="shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-purple-600 to-orange-500 text-white text-xs font-bold font-mono-code flex items-center justify-center shadow-sm">
                  {stepNum}
                </span>
                <div className="text-sm text-purple-100 font-medium leading-relaxed overflow-x-auto">
                  {renderInlineMathAndMarkdown(stepText)}
                </div>
              </div>

              {/* Quick Simplify Button for this Step */}
              {onSimplifyStep && (
                <button
                  type="button"
                  onClick={() => onSimplifyStep(`Step ${stepNum}: ${stepText}`)}
                  title="Explain this step in simpler terms with analogies"
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-md bg-purple-900/60 hover:bg-purple-800 border border-purple-700/60 text-purple-200 opacity-80 group-hover:opacity-100 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Wand2 className="w-3 h-3 text-orange-400" />
                  <span className="hidden sm:inline">Explain Simpler</span>
                </button>
              )}
            </div>
          </div>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const bulletText = trimmed.replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="ml-5 list-disc text-sm text-purple-200/90 leading-relaxed my-1">
            {renderInlineMathAndMarkdown(bulletText)}
          </li>
        );
      }

      if (trimmed.startsWith('> ')) {
        return (
          <blockquote key={idx} className="my-2 pl-4 border-l-2 border-orange-500 text-orange-200/90 italic text-sm">
            {renderInlineMathAndMarkdown(trimmed.replace(/^>\s+/, ''))}
          </blockquote>
        );
      }

      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-sm text-purple-100/90 leading-relaxed my-1.5">
          {renderInlineMathAndMarkdown(trimmed)}
        </p>
      );
    });
  };

  return (
    <div className={`w-full flex ${isUser ? 'justify-end' : 'justify-start'} my-4 px-2`}>
      <div
        className={`max-w-2xl w-full rounded-2xl p-5 border transition-all duration-300 shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-purple-950/70 via-black to-purple-950/50 border-purple-600/50 shadow-[0_0_20px_rgba(168,85,247,0.2)] ml-auto'
            : isMystery
            ? 'bg-gradient-to-br from-black via-orange-950/30 to-black border-orange-500/40 shadow-[0_0_25px_rgba(249,115,22,0.2)]'
            : 'bg-gradient-to-br from-black via-purple-950/40 to-black border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.25)]'
        } ${message.isError ? 'border-red-500/60 bg-red-950/20' : ''}`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3 text-xs">
          <div className="flex items-center gap-2">
            {isUser ? (
              <span className="flex items-center gap-1.5 font-cinzel font-semibold text-purple-300">
                <span>🧙</span> Scholar Apprentice
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-lg">👻</span>
                <span className="font-cinzel font-bold tracking-wide text-purple-200">
                  Haunted Study Buddy
                </span>
                <span
                  className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full border ${
                    isMystery
                      ? 'bg-orange-950/80 text-orange-300 border-orange-500/50'
                      : 'bg-purple-950/80 text-purple-300 border-purple-500/50'
                  }`}
                >
                  {isMystery ? '🗝️ Mystery Spell' : '🔮 Answer Spell'}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-purple-300/50 font-mono-code">
              {message.timestamp}
            </span>
            {!isUser && !message.isError && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded hover:bg-purple-900/40 text-purple-300/70 hover:text-purple-200 transition-colors cursor-pointer"
                title="Copy to parchment"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Attached Homework / Diagram Image in Student Message */}
        {message.image && (
          <div className="mb-4">
            <div className="inline-block relative group rounded-xl overflow-hidden border border-purple-500/40 bg-black/60 shadow-md">
              <img
                src={message.image.dataUrl}
                alt={message.image.name}
                className="max-h-56 max-w-full rounded-xl object-contain cursor-pointer transition-transform group-hover:scale-[1.02]"
                onClick={() => setIsZoomOpen(true)}
              />

              {/* Hover overlay with zoom hint */}
              <div
                onClick={() => setIsZoomOpen(true)}
                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-cinzel cursor-pointer"
              >
                <Maximize2 className="w-4 h-4 text-orange-400" />
                <span>Click to Expand</span>
              </div>

              {/* Badge with file name & size */}
              <div className="px-2.5 py-1 bg-black/80 border-t border-purple-900/40 flex items-center justify-between text-[10px] text-purple-300 font-mono-code">
                <span className="truncate max-w-[180px] flex items-center gap-1">
                  <FileImage className="w-3 h-3 text-orange-400 shrink-0" />
                  {message.image.name}
                </span>
                {message.image.sizeFormatted && (
                  <span className="text-purple-400/70 shrink-0 ml-2">
                    {message.image.sizeFormatted}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Card Body Text with KaTeX math rendering */}
        <div className={`prose-sm max-w-none ${isUser ? 'text-left' : 'text-left'}`}>
          {renderFormattedContent(message.content)}
        </div>

        {/* Error Handling with Retry */}
        {message.isError && (
          <div className="mt-4 pt-3 border-t border-red-500/30 flex items-center justify-between text-xs text-red-300">
            <span>The spectral connection encountered an anomaly.</span>
            {message.canRetry && onRetry && (
              <button
                type="button"
                onClick={() => onRetry(message.id)}
                className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 border border-red-500/60 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Spell</span>
              </button>
            )}
          </div>
        )}

        {/* Interactive Mode-Specific Action Helpers */}
        {!isUser && !message.isError && (
          <div className="mt-5 pt-3.5 border-t border-purple-900/40 flex flex-wrap items-center gap-2 text-xs">
            {isMystery ? (
              <>
                {onAskFollowUp && (
                  <button
                    type="button"
                    onClick={() => onAskFollowUp("I'm feeling stuck on this step. Could you give me an even simpler hint or everyday analogy?")}
                    className="px-2.5 py-1.5 rounded-lg bg-orange-950/60 hover:bg-orange-900/70 border border-orange-700/60 text-orange-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>I'm stuck, simpler hint please</span>
                  </button>
                )}

                {onSwitchToAnswerSpell && (
                  <button
                    type="button"
                    onClick={() => {
                      playSpellSound();
                      onSwitchToAnswerSpell();
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-400/60 text-purple-100 font-medium flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-purple-300" />
                    <span>Cast Answer Spell (Reveal Solution)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleCelebration}
                  disabled={celebrated}
                  className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                    celebrated
                      ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                      : 'bg-black/50 hover:bg-orange-950/50 border-orange-900/50 text-orange-300/80 hover:text-orange-200'
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{celebrated ? 'Solved! Great Job! 🎉' : 'I solved it!'}</span>
                </button>
              </>
            ) : (
              <>
                {onAskFollowUp && (
                  <>
                    <button
                      type="button"
                      onClick={() => onAskFollowUp("Can you show me an alternate verification method for this problem?")}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/50 text-emerald-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Show alternate verification check</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAskFollowUp("Can you give me a real-world analogy to help me visualize this concept better?")}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/70 border border-purple-700/50 text-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Give me an everyday analogy</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onAskFollowUp("Could you give me another practice problem on this topic so I can test myself?")}
                      className="px-2.5 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/70 border border-purple-700/50 text-purple-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-orange-400" />
                      <span>Give me a practice problem</span>
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal for Attached Homework Image */}
      {isZoomOpen && message.image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#0d071a] border border-purple-500/60 rounded-2xl p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/80 hover:bg-purple-900 border border-purple-700 text-purple-300 hover:text-white transition-colors cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={message.image.dataUrl}
              alt={message.image.name}
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-lg"
            />
            <p className="mt-2 text-center text-xs text-purple-300 font-mono-code">
              {message.image.name} ({message.image.sizeFormatted})
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
