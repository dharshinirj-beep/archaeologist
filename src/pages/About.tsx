import { Compass, Search, Brain, Layers, Map as MapIcon, Zap, Shield, Sparkles } from 'lucide-react';

export function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ink-900 mb-6">
          <Compass className="w-8 h-8 text-clay-300" />
        </div>
        <h1 className="font-serif text-4xl font-semibold text-ink-900 mb-3">Archaeologist</h1>
        <p className="text-lg text-ink-500 italic">"Search your memories, not your files."</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-6">
        <div className="bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-6">
          <h2 className="font-serif text-xl font-semibold text-ink-900 mb-3">The Problem</h2>
          <p className="text-ink-700 leading-relaxed">
            People don't remember filenames. They remember context — a time, a place, a number,
            a feeling. Traditional search demands exact keywords and filenames, but human memory
            doesn't work that way.
          </p>
        </div>

        <div className="bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-6">
          <h2 className="font-serif text-xl font-semibold text-ink-900 mb-3">The Solution</h2>
          <p className="text-ink-700 leading-relaxed mb-4">
            Archaeologist reconstructs memories from contextual clues. You describe what you remember,
            and the AI excavates through your stored documents to find the most likely match — with
            confidence scores, evidence, and a timeline.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { icon: Brain, title: 'Semantic Matching', desc: 'Finds by meaning, not exact words' },
              { icon: Layers, title: 'Rich Metadata', desc: 'People, places, dates, amounts, topics' },
              { icon: Zap, title: 'Confidence Scoring', desc: 'Confirmed, Likely, Possible, Unknown' },
              { icon: MapIcon, title: 'Knowledge Map', desc: 'Visual relationship graph' },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex items-start gap-3 p-3 rounded-xl bg-canvas/50">
                  <div className="w-8 h-8 rounded-lg bg-clay-50 border border-clay-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-clay-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{f.title}</p>
                    <p className="text-xs text-ink-500">{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-6">
          <h2 className="font-serif text-xl font-semibold text-ink-900 mb-3">How It Works</h2>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Extract Clues', desc: 'AI parses your query for dates, organizations, locations, amounts, topics, and keywords.' },
              { step: '2', title: 'Semantic Search', desc: 'Memories are scored against each clue using weighted matching across all metadata fields.' },
              { step: '3', title: 'Rank & Reconstruct', desc: 'The strongest candidate is selected, with confidence calculated from matched clue weights.' },
              { step: '4', title: 'Present Evidence', desc: 'You see why it matched, supporting evidence, related memories, and a timeline.' },
            ].map((s) => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-ink-900 text-canvas flex items-center justify-center text-xs font-bold shrink-0">
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-900">{s.title}</p>
                  <p className="text-xs text-ink-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-6">
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-ink-900 mb-3">
            <Shield className="w-5 h-5 text-clay-600" />
            Trust & Safety
          </h2>
          <ul className="space-y-2 text-sm text-ink-700">
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-clay-500 mt-0.5 shrink-0" />
              The AI never invents information — if something isn't found, it says so.
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-clay-500 mt-0.5 shrink-0" />
              Confidence is calculated from real clue matches, not faked.
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-clay-500 mt-0.5 shrink-0" />
              Every result shows "Why this matches" so you can verify the reasoning.
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-clay-500 mt-0.5 shrink-0" />
              The OpenAI API key is stored server-side, never exposed in the browser.
            </li>
          </ul>
        </div>

        <div className="text-center py-8">
          <p className="font-serif text-2xl text-ink-700 italic">
            "You remember the moment.
            <br />
            Archaeologist finds the information."
          </p>
        </div>
      </div>
    </div>
  );
}
