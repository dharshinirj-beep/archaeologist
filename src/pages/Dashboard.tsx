import { Compass, Search, Sparkles, ArrowRight, Layers, Brain, Zap } from 'lucide-react';
import { SearchBar, ExcavationAnimation } from '@/components/SearchBar';
import { ReconstructionResultView } from '@/components/ReconstructionResult';
import type { ReconstructionResult, Memory } from '@/types';

interface DashboardProps {
  query: string;
  setQuery: (v: string) => void;
  onReconstruct: () => void;
  onDemo: () => void;
  loading: boolean;
  excavating: boolean;
  result: ReconstructionResult | null;
  memories: Memory[];
  memoryCount: number;
  onLoadDemo: () => void;
  onNavigate: (page: 'dashboard' | 'vault' | 'ask' | 'map' | 'about') => void;
}

export function Dashboard({
  query, setQuery, onReconstruct, onDemo, loading, excavating, result, memories, memoryCount, onLoadDemo, onNavigate,
}: DashboardProps) {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Hero */}
      {!result && !excavating && (
        <div className="text-center mb-10 animate-fadeInUp">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-clay-50 border border-clay-100 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-clay-600" />
            <span className="text-xs font-medium text-clay-700">AI Memory Reconstruction</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-semibold text-ink-900 leading-[1.1] tracking-tight text-balance mb-5">
            People remember moments.
            <br />
            <span className="text-clay-600">Archaeologist reconstructs</span> the information behind them.
          </h1>

          <p className="text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed mb-8">
            Search your memories, not your files. Describe what you remember — a time, a place,
            a number — and let AI reconstruct the document behind the moment.
          </p>
        </div>
      )}

      {/* Search */}
      {!excavating && (
        <div className={!result ? 'mb-8' : 'mb-6'}>
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={onReconstruct}
            onDemo={onDemo}
            loading={loading}
          />

          {/* Example query hint */}
          {!result && (
            <p className="mt-3 text-center text-xs text-ink-300">
              Try: <span className="text-ink-500 italic">"Find that internship document I received around March. I remember it mentioned around ₹15,000 and Bengaluru."</span>
            </p>
          )}
        </div>
      )}

      {/* Excavation animation */}
      {excavating && (
        <ExcavationAnimation onComplete={() => {}} />
      )}

      {/* Result */}
      {result && !excavating && (
        <ReconstructionResultView result={result} memories={memories} />
      )}

      {/* Why Archaeologist section */}
      {!result && !excavating && (
        <div className="mt-16 space-y-8">
          {/* Comparison */}
          <div className="bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-6 sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-ink-900 mb-6 text-center">
              Why Archaeologist?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Traditional search */}
              <div className="p-5 rounded-xl bg-ink-900/3 border border-ink-900/8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-ink-900/10 flex items-center justify-center">
                    <Search className="w-4 h-4 text-ink-500" />
                  </div>
                  <span className="text-sm font-semibold text-ink-700">Traditional Search</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-500">
                  <span className="px-2 py-1 rounded-md bg-surface text-ink-700 text-xs">Filename</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-1 rounded-md bg-surface text-ink-700 text-xs">Keyword</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-1 rounded-md bg-surface text-ink-700 text-xs">Browse files</span>
                </div>
              </div>

              {/* Archaeologist */}
              <div className="p-5 rounded-xl bg-clay-50 border border-clay-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-clay-600 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-canvas" />
                  </div>
                  <span className="text-sm font-semibold text-clay-700">Archaeologist</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-clay-700">
                  <span className="px-2 py-1 rounded-md bg-surface text-clay-700 text-xs">Memory</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-1 rounded-md bg-surface text-clay-700 text-xs">Context</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-1 rounded-md bg-surface text-clay-700 text-xs">Clues</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-1 rounded-md bg-surface text-clay-700 text-xs">Relationships</span>
                  <ArrowRight className="w-3 h-3" />
                  <span className="px-2 py-1 rounded-md bg-surface text-clay-700 text-xs">Answer</span>
                </div>
              </div>
            </div>
            <p className="text-center font-serif text-lg text-ink-700 mt-6 italic">
              "You remember the moment. Archaeologist finds the information."
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Brain,
                title: 'Semantic Matching',
                desc: 'Searches by meaning, not exact keywords. "Around ₹15,000" finds "₹15,000".',
              },
              {
                icon: Layers,
                title: 'Memory Vault',
                desc: 'Store documents with rich metadata — people, places, dates, amounts, topics.',
              },
              {
                icon: Zap,
                title: 'Instant Reconstruction',
                desc: 'Get confidence-scored results with evidence, related memories, and timelines.',
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="p-5 rounded-2xl bg-surface border border-ink-900/8 shadow-soft hover:shadow-lift transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-clay-50 border border-clay-100 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-clay-600" />
                  </div>
                  <h3 className="font-medium text-sm text-ink-900 mb-1">{f.title}</h3>
                  <p className="text-xs text-ink-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>

          {/* Empty state CTA */}
          {memoryCount === 0 && (
            <div className="text-center bg-surface rounded-2xl border border-dashed border-clay-200 p-8">
              <p className="text-ink-500 text-sm mb-4">
                Your memory vault is empty. Load demo memories to try the reconstruction instantly.
              </p>
              <button
                onClick={onLoadDemo}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-clay-50 text-clay-700 text-sm font-medium border border-clay-200 hover:bg-clay-100 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Load Demo Memories
              </button>
            </div>
          )}

          {/* Quick nav */}
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => onNavigate('vault')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-ink-900/8 text-sm text-ink-700 hover:border-clay-200 transition-colors">
              <Layers className="w-4 h-4" /> Memory Vault
            </button>
            <button onClick={() => onNavigate('ask')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-ink-900/8 text-sm text-ink-700 hover:border-clay-200 transition-colors">
              <Brain className="w-4 h-4" /> Ask My Past
            </button>
            <button onClick={() => onNavigate('map')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-ink-900/8 text-sm text-ink-700 hover:border-clay-200 transition-colors">
              <Compass className="w-4 h-4" /> Knowledge Map
            </button>
            <button onClick={() => onNavigate('about')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface border border-ink-900/8 text-sm text-ink-700 hover:border-clay-200 transition-colors">
              <Sparkles className="w-4 h-4" /> About
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
