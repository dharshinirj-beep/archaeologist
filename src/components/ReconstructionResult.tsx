import {
  Sparkles, Check, FileText, Link2, Calendar, AlertCircle,
  Compass, TrendingUp,
} from 'lucide-react';
import type { ReconstructionResult, Memory } from '@/types';
import { MemoryCard } from './MemoryCard';

interface ReconstructionResultViewProps {
  result: ReconstructionResult;
  memories: Memory[];
  onSelectMemory?: (id: string) => void;
}

function confidenceColor(label: string) {
  switch (label) {
    case 'Confirmed': return 'text-sage-600 bg-sage-500/10 border-sage-500/20';
    case 'Likely': return 'text-clay-700 bg-clay-50 border-clay-200';
    case 'Possible': return 'text-ink-700 bg-ink-900/5 border-ink-900/10';
    default: return 'text-ink-500 bg-ink-900/5 border-ink-900/10';
  }
}

function confidenceBarColor(label: string) {
  switch (label) {
    case 'Confirmed': return 'bg-sage-500';
    case 'Likely': return 'bg-clay-500';
    case 'Possible': return 'bg-ink-500';
    default: return 'bg-ink-300';
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatFullDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function ReconstructionResultView({ result, memories, onSelectMemory }: ReconstructionResultViewProps) {
  if (!result.memory) {
    return (
      <div className="bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-8 animate-fadeInUp">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-ink-900/5 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-ink-500" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-ink-900">No Memory Found</h2>
        </div>
        <p className="text-ink-500 text-sm mb-4">
          We couldn't find a matching memory for your query. Try adding more details or loading demo memories.
        </p>
        {result.notFound.length > 0 && (
          <div className="space-y-1.5">
            {result.notFound.map((nf, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-ink-500">
                <span className="w-1.5 h-1.5 rounded-full bg-ink-300" />
                {nf}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const evidenceMemories = result.evidence
    .map((e) => memories.find((m) => m.id === e.memoryId))
    .filter((m): m is Memory => m !== undefined);

  const relatedMemoriesData = result.relatedMemories
    .map((r) => memories.find((m) => m.id === r.memoryId))
    .filter((m): m is Memory => m !== undefined);

  return (
    <div className="space-y-5 animate-fadeInUp">
      {/* Main result card */}
      <div className="relative bg-surface rounded-2xl border border-clay-200 shadow-lift overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-clay-300 via-clay-500 to-clay-700" />

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-ink-900 flex items-center justify-center">
                <Compass className="w-6 h-6 text-clay-300" />
              </div>
              <div>
                <p className="text-xs font-medium text-clay-600 uppercase tracking-wider mb-0.5">
                  Memory Reconstructed
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-ink-900 leading-tight">
                  {result.memory.summary.split('.')[0] || result.memory.filename}
                </h2>
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-ink-900/10" />
                  <circle
                    cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeDasharray={`${(result.confidence / 100) * 94.2} 94.2`}
                    strokeLinecap="round"
                    className={confidenceBarColor(result.confidenceLabel).replace('bg-', 'text-')}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-ink-900">{result.confidence}%</span>
                </div>
              </div>
              <div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${confidenceColor(result.confidenceLabel)}`}>
                  <TrendingUp className="w-3 h-3" />
                  {result.confidenceLabel}
                </span>
                {result.isAiEstimate && (
                  <p className="text-xs text-ink-500 mt-1">AI-estimated confidence</p>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-ink-700 leading-relaxed">{result.memory.summary}</p>
            </div>
          </div>

          {/* Why This Matches */}
          {result.whyThisMatches.length > 0 && (
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 mb-3">
                <Sparkles className="w-4 h-4 text-clay-500" />
                Why This Matches
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.whyThisMatches.map((reason, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-sage-500/5 border border-sage-500/10 animate-fadeIn"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <div className="w-5 h-5 rounded-full bg-sage-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm text-ink-700">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Not found */}
          {result.notFound.length > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-ink-900/3 border border-ink-900/8">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-ink-500" />
                <span className="text-xs font-semibold text-ink-700 uppercase tracking-wider">Not Found</span>
              </div>
              <div className="space-y-1">
                {result.notFound.map((nf, i) => (
                  <p key={i} className="text-sm text-ink-500">{nf}</p>
                ))}
              </div>
            </div>
          )}

          {/* Extracted clues */}
          {result.extractedClues.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Clues Extracted From Your Query</h3>
              <div className="flex flex-wrap gap-1.5">
                {result.extractedClues.map((clue, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-ink-900/5 text-ink-500 text-xs"
                  >
                    <span className="text-clay-500 font-medium">{clue.type}:</span>
                    {clue.value}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Evidence */}
      {evidenceMemories.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 mb-3">
            <FileText className="w-4 h-4 text-clay-500" />
            Evidence
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidenceMemories.map((m) => (
              <MemoryCard key={m.id} memory={m} />
            ))}
          </div>
        </div>
      )}

      {/* Related Memories */}
      {relatedMemoriesData.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 mb-3">
            <Link2 className="w-4 h-4 text-clay-500" />
            Related Memories
          </h3>
          <div className="space-y-2">
            {result.relatedMemories.map((rm) => {
              const mem = memories.find((m) => m.id === rm.memoryId);
              if (!mem) return null;
              return (
                <button
                  key={rm.memoryId}
                  onClick={() => onSelectMemory?.(rm.memoryId)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface border border-ink-900/8 hover:border-clay-200 hover:shadow-soft transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-clay-50 flex items-center justify-center shrink-0">
                    <Link2 className="w-4 h-4 text-clay-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{mem.filename}</p>
                    <p className="text-xs text-ink-500">{rm.relationship}</p>
                  </div>
                  {rm.date && (
                    <span className="text-xs text-ink-500 shrink-0">{formatDate(rm.date)}</span>
                  )}
                  <svg className="w-4 h-4 text-ink-300 group-hover:text-clay-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline */}
      {result.timeline.length > 0 && (
        <div className="bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 mb-4">
            <Calendar className="w-4 h-4 text-clay-500" />
            Timeline
          </h3>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-clay-300 via-clay-400 to-clay-300" />

            <div className="space-y-4">
              {result.timeline.map((entry, i) => (
                <div
                  key={i}
                  className="relative flex items-start gap-4 animate-fadeIn"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="relative z-10 w-4 h-4 rounded-full bg-surface border-2 border-clay-400 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-clay-500" />
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-xs font-medium text-clay-600">{formatFullDate(entry.date)}</p>
                    <p className="text-sm text-ink-900">{entry.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
