import React from 'react';
import { SubjectCategory, SampleQuestion, LearningMode } from '../types';
import { BookOpen, Calculator, Atom, FlaskConical, Terminal, Dna, Scroll } from 'lucide-react';
import { playPumpkinSound } from '../utils/audio';

interface SubjectBarProps {
  selectedSubject: SubjectCategory;
  onSelectSubject: (subject: SubjectCategory) => void;
  onSelectSampleQuestion: (sample: SampleQuestion) => void;
}

export const SAMPLE_QUESTIONS: SampleQuestion[] = [
  {
    title: 'Autumn Foliage Mystery',
    prompt: 'Why do green tree leaves change into fiery orange and purple colors in autumn?',
    subject: 'Biology',
    recommendedMode: 'answer_spell',
    icon: '🍂',
    difficulty: 'Apprentice',
  },
  {
    title: 'Quadratic Curse Factoring',
    prompt: 'How do I solve the quadratic equation x² - 5x + 6 = 0 step by step?',
    subject: 'Mathematics',
    recommendedMode: 'mystery_spell',
    icon: '📐',
    difficulty: 'Adept',
  },
  {
    title: 'Cauldron Fog Chemistry',
    prompt: 'What chemical reaction causes dry ice (solid CO₂) in water to create dense spooky fog?',
    subject: 'Chemistry',
    recommendedMode: 'answer_spell',
    icon: '🧪',
    difficulty: 'Apprentice',
  },
  {
    title: 'Binary Search Crypt',
    prompt: 'How does Binary Search find a secret key in a sorted list in O(log n) time?',
    subject: 'Computer Science',
    recommendedMode: 'mystery_spell',
    icon: '💻',
    difficulty: 'Adept',
  },
  {
    title: 'Homework Scroll (Triangle)',
    prompt: 'Solve the right-angled triangle problem in this geometry homework image.',
    subject: 'Mathematics',
    recommendedMode: 'answer_spell',
    icon: '📐',
    difficulty: 'Adept',
  },
  {
    title: 'Velocity-Time Graph (55m)',
    prompt: 'Analyze this velocity-time graph. Calculate the total distance traveled from t = 0 to 8 s, and distinguish total distance vs displacement over the full 10 seconds.',
    subject: 'Physics',
    recommendedMode: 'answer_spell',
    icon: '📈',
    difficulty: 'Archmage',
  },
  {
    title: 'Gravitational Ghosts',
    prompt: 'Why do objects fall at the same acceleration in a vacuum regardless of mass?',
    subject: 'Physics',
    recommendedMode: 'answer_spell',
    icon: '⚡',
    difficulty: 'Archmage',
  },
];

const SUBJECT_LIST: { name: SubjectCategory; icon: React.ReactNode }[] = [
  { name: 'All Subjects', icon: <BookOpen className="w-3.5 h-3.5" /> },
  { name: 'Mathematics', icon: <Calculator className="w-3.5 h-3.5" /> },
  { name: 'Physics', icon: <Atom className="w-3.5 h-3.5" /> },
  { name: 'Chemistry', icon: <FlaskConical className="w-3.5 h-3.5" /> },
  { name: 'Computer Science', icon: <Terminal className="w-3.5 h-3.5" /> },
  { name: 'Biology', icon: <Dna className="w-3.5 h-3.5" /> },
  { name: 'Literature & History', icon: <Scroll className="w-3.5 h-3.5" /> },
];

export const SubjectBar: React.FC<SubjectBarProps> = ({
  selectedSubject,
  onSelectSubject,
  onSelectSampleQuestion,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-4">
      {/* Subject Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
        {SUBJECT_LIST.map((subj) => {
          const isActive = selectedSubject === subj.name;
          return (
            <button
              key={subj.name}
              type="button"
              onClick={() => {
                playPumpkinSound();
                onSelectSubject(subj.name);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                isActive
                  ? 'bg-purple-900/80 text-purple-100 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-black/40 text-purple-300/70 border-purple-950/60 hover:border-purple-800/80 hover:text-purple-200'
              }`}
            >
              <span className={isActive ? 'text-purple-300' : 'text-purple-400/60'}>
                {subj.icon}
              </span>
              <span>{subj.name}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Spell Suggestions Banner */}
      <div className="mt-2.5 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] text-orange-400/80 font-cinzel font-semibold flex items-center gap-1 shrink-0">
          <span>🕯️</span> Sample Spells:
        </span>
        {SAMPLE_QUESTIONS.map((sample) => (
          <button
            key={sample.title}
            type="button"
            onClick={() => {
              playPumpkinSound();
              onSelectSampleQuestion(sample);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/30 hover:bg-orange-900/50 border border-orange-900/40 hover:border-orange-500/50 text-orange-200 text-xs transition-colors shrink-0 cursor-pointer group"
          >
            <span>{sample.icon}</span>
            <span className="group-hover:text-orange-100">{sample.title}</span>
            <span className="text-[10px] text-orange-400/60 font-mono-code">
              ({sample.recommendedMode === 'answer_spell' ? 'Answer' : 'Mystery'})
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
