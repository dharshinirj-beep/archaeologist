import { useState } from 'react';
import {
  MessageCircleQuestion, Sparkles, Loader2, FileText, Link2, AlertCircle,
} from 'lucide-react';
import { ExcavationAnimation } from '@/components/SearchBar';
import { MemoryCard } from '@/components/MemoryCard';
import { askMyPast } from '@/lib/api';
import { reconstructLocally } from '@/lib/reconstructionEngine';
import type { AskPastResult, Memory } from '@/types';

interface AskMyPastProps {
  memories: Memory[];
  onLoadDemo: () => void;
}

const SUGGESTED_QUESTIONS = [
  'What internships did I explore?',
  'Show everything related to my Bengaluru internship.',
  'What happened after I received the internship offer?',
  'What certificates are related to my internship?',
  'Which opportunities involved data analytics?',
  'Show everything connected to Coorix.',
];

export function AskMyPast({ memories, onLoadDemo }: AskMyPastProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [excavating, setExcavating] = useState(false);
  const [result, setResult] = useState<AskPastResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(q?: string) {
    const query = q ?? question;
    if (!query.trim() || memories.length === 0) return;

    setError(null);
    setResult(null);
    setLoading(true);
    setExcavating(true);

    // Show animation for a bit
    setTimeout(() => setExcavating(false), 3500);

    try {
      const res = await askMyPast(query, memories);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  }

  const sourceMemories = result?.sources
    .map((s) => memories.find((m) => m.id === s.memoryId))
    .filter((m): m is Memory => m !== undefined) || [];

  const relatedMemoriesData = result?.relatedMemories
    .map((r) => memories.find((m) => m.id === r.memoryId))
    .filter((m): m is Memory => m !== undefined) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center">
            <MessageCircleQuestion className="w-5 h-5 text-clay-300" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-ink-900">Ask My Past</h1>
        </div>
        <p className="text-sm text-ink-500 ml-13">
          Ask a question about your stored memories. The AI answers using only what it finds — never invents.
        </p>
      </div>

      {memories.length === 0 ? (
        <div className="text-center bg-surface rounded-2xl border border-dashed border-clay-200 p-12">
          <MessageCircleQuestion className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <p className="text-ink-500 text-sm mb-4">
            You need memories before you can ask questions. Load the demo memories to try this feature.
          </p>
          <button
            onClick={onLoadDemo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-clay-50 text-clay-700 text-sm font-medium border border-clay-200 hover:bg-clay-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Load Demo Memories
          </button>
        </div>
      ) : (
        <>
          {/* Question input */}
          <div className="mb-6">
            <div className="relative bg-surface rounded-2xl border border-ink-900/10 shadow-soft hover:shadow-lift hover:border-clay-200 transition-all p-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Ask a question about your past..."
                  rows={2}
                  className="flex-1 w-full bg-transparent text-ink-900 placeholder:text-ink-300 text-sm sm:text-base resize-none focus:outline-none leading-relaxed px-2"
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={loading || !question.trim()}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-ink-900 text-canvas text-sm font-medium hover:bg-clay-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Ask
                </button>
              </div>
            </div>
          </div>

          {/* Suggested questions */}
          {!result && !excavating && !loading && (
            <div className="mb-8">
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-3">Try asking</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => { setQuestion(q); handleSubmit(q); }}
                    className="px-3.5 py-2 rounded-xl bg-surface border border-ink-900/8 text-sm text-ink-700 hover:border-clay-200 hover:text-clay-700 transition-all text-left"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Excavation */}
          {excavating && <ExcavationAnimation onComplete={() => {}} />}

          {/* Error */}
          {error && !excavating && (
            <div className="bg-rust-500/5 border border-rust-500/20 rounded-2xl p-6 animate-fadeInUp">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-rust-600" />
                <span className="text-sm font-semibold text-rust-600">Something went wrong</span>
              </div>
              <p className="text-sm text-ink-500">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && !excavating && (
            <div className="space-y-5 animate-fadeInUp">
              {/* Answer */}
              <div className="bg-surface rounded-2xl border border-clay-200 shadow-lift p-6">
                <div className="h-1 bg-gradient-to-r from-clay-300 via-clay-500 to-clay-700 -mt-6 -mx-6 mb-6 rounded-t-2xl" />
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center shrink-0">
                    <MessageCircleQuestion className="w-5 h-5 text-clay-300" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-clay-600 uppercase tracking-wider mb-1">Answer</p>
                    <p className="text-ink-900 leading-relaxed">{result.answer}</p>
                  </div>
                </div>
              </div>

              {/* Sources */}
              {sourceMemories.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 mb-3">
                    <FileText className="w-4 h-4 text-clay-500" />
                    Sources
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sourceMemories.map((m) => (
                      <MemoryCard key={m.id} memory={m} />
                    ))}
                  </div>
                </div>
              )}

              {/* Related */}
              {relatedMemoriesData.length > 0 && (
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900 mb-3">
                    <Link2 className="w-4 h-4 text-clay-500" />
                    Related Memories
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedMemoriesData.map((m) => (
                      <MemoryCard key={m.id} memory={m} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
