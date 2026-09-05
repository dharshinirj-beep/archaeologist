import { useEffect, useState } from 'react';
import { Search, Sparkles, Compass } from 'lucide-react';

const STAGES = [
  'Excavating your memories...',
  'Searching documents...',
  'Connecting clues...',
  'Comparing context...',
  'Reconstructing memory...',
];

interface ExcavationAnimationProps {
  onComplete: () => void;
}

export function ExcavationAnimation({ onComplete }: ExcavationAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const stageDuration = 700;
    const timers: ReturnType<typeof setTimeout>[] = [];

    STAGES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setStage(i);
        }, i * stageDuration),
      );
    });

    timers.push(
      setTimeout(() => {
        onComplete();
      }, STAGES.length * stageDuration + 300),
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
      {/* Animated compass icon */}
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-pulseGlow rounded-full" />
        <div className="relative w-20 h-20 rounded-full bg-ink-900 flex items-center justify-center">
          <Compass
            className="w-10 h-10 text-clay-300"
            strokeWidth={1.5}
            style={{
              animation: 'spin 2s linear infinite',
            }}
          />
        </div>
        {/* Orbiting dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full border border-clay-200 animate-pulseGlow" />
        </div>
      </div>

      {/* Stages */}
      <div className="space-y-2.5 w-full max-w-sm">
        {STAGES.map((label, i) => (
          <div
            key={label}
            className={`flex items-center gap-3 transition-all duration-500 ${
              i <= stage ? 'opacity-100 translate-x-0' : 'opacity-30 translate-x-2'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                i < stage
                  ? 'bg-sage-500'
                  : i === stage
                    ? 'bg-clay-500'
                    : 'bg-ink-900/10'
              }`}
            >
              {i < stage && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
              {i === stage && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </div>
            <span
              className={`text-sm transition-colors ${
                i <= stage ? 'text-ink-900 font-medium' : 'text-ink-300'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-8 w-full max-w-sm h-1 rounded-full bg-ink-900/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-clay-400 to-clay-600 transition-all duration-700 ease-out"
          style={{ width: `${((stage + 1) / STAGES.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onDemo: () => void;
  loading: boolean;
  compact?: boolean;
}

export function SearchBar({ value, onChange, onSubmit, onDemo, loading, compact }: SearchBarProps) {
  return (
    <div className="w-full">
      <div
        className={`relative group rounded-2xl bg-surface border border-ink-900/10 shadow-soft transition-all hover:shadow-lift hover:border-clay-300 ${
          compact ? 'p-2' : 'p-3'
        }`}
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2 px-2">
            <Search className="w-5 h-5 text-ink-300 shrink-0" />
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              placeholder="Tell me what you remember..."
              rows={compact ? 1 : 3}
              className="w-full bg-transparent text-ink-900 placeholder:text-ink-300 text-sm sm:text-base resize-none focus:outline-none leading-relaxed"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={onSubmit}
              disabled={loading || !value.trim()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ink-900 text-canvas text-sm font-medium hover:bg-clay-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Reconstruct Memory
            </button>
            <button
              onClick={onDemo}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-clay-50 text-clay-700 text-sm font-medium border border-clay-200 hover:bg-clay-100 disabled:opacity-40 transition-colors"
            >
              Try Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
