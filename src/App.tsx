import { useState, useCallback } from 'react';
import { Nav } from '@/components/Nav';
import { Dashboard } from '@/pages/Dashboard';
import { MemoryVault } from '@/pages/MemoryVault';
import { AskMyPast } from '@/pages/AskMyPast';
import { KnowledgeMap } from '@/pages/KnowledgeMap';
import { About } from '@/pages/About';
import { useMemories } from '@/hooks/useMemories';
import { reconstructMemory } from '@/lib/api';
import { reconstructLocally } from '@/lib/reconstructionEngine';
import { DEMO_QUERY, DEMO_MEMORIES } from '@/data/demoMemories';
import type { Page, ReconstructionResult } from '@/types';

function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [excavating, setExcavating] = useState(false);
  const [result, setResult] = useState<ReconstructionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { memories, loaded, addMemory, removeMemory, loadDemoMemories } = useMemories();

  const handleReconstruct = useCallback(async (q?: string) => {
    const searchQuery = q ?? query;
    if (!searchQuery.trim() || memories.length === 0) return;

    setError(null);
    setResult(null);
    setLoading(true);
    setExcavating(true);

    // Show excavation animation for minimum duration
    const minAnimTime = 3800;
    const startTime = Date.now();

    try {
      const [res] = await Promise.all([
        reconstructMemory(searchQuery, memories),
        new Promise<void>((resolve) => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, minAnimTime - elapsed);
          setTimeout(resolve, remaining);
        }),
      ]);

      setExcavating(false);
      setResult(res);
    } catch (err) {
      // Fall back to local reconstruction
      const localResult = reconstructLocally(searchQuery, memories);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minAnimTime - elapsed);

      setTimeout(() => {
        setExcavating(false);
        if (localResult) {
          setResult(localResult);
        } else {
          setError(
            err instanceof Error
              ? err.message
              : 'Reconstruction failed. Please try again.'
          );
        }
      }, remaining);
    } finally {
      setLoading(false);
    }
  }, [query, memories]);

  const handleDemo = useCallback(async () => {
    if (memories.length === 0) {
      loadDemoMemories();
    }
    setQuery(DEMO_QUERY);

    // Wait for memories to be loaded, then run reconstruction
    setTimeout(async () => {
      // Use demo memories directly since state update hasn't applied
      const currentMemories = memories.length > 0 ? memories : DEMO_MEMORIES;

      setError(null);
      setResult(null);
      setLoading(true);
      setExcavating(true);

      const startTime = Date.now();
      const minAnimTime = 3800;

      try {
        const [res] = await Promise.all([
          reconstructMemory(DEMO_QUERY, currentMemories),
          new Promise<void>((resolve) => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, minAnimTime - elapsed);
            setTimeout(resolve, remaining);
          }),
        ]);
        setExcavating(false);
        setResult(res);
      } catch {
        const localResult = reconstructLocally(DEMO_QUERY, currentMemories);
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minAnimTime - elapsed);
        setTimeout(() => {
          setExcavating(false);
          if (localResult) {
            setResult(localResult);
          } else {
            setError('Demo reconstruction failed. Please try again.');
          }
        }, remaining);
      } finally {
        setLoading(false);
      }
    }, 100);
  }, [memories, loadDemoMemories]);

  const handleNavigate = useCallback((p: Page) => {
    setPage(p);
    if (p !== 'dashboard') {
      setResult(null);
      setExcavating(false);
    }
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-ink-900/10 border-t-clay-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas grain">
      <Nav current={page} onNavigate={handleNavigate} memoryCount={memories.length} />

      {page === 'dashboard' && (
        <Dashboard
          query={query}
          setQuery={setQuery}
          onReconstruct={() => handleReconstruct()}
          onDemo={handleDemo}
          loading={loading}
          excavating={excavating}
          result={result}
          memories={memories}
          memoryCount={memories.length}
          onLoadDemo={loadDemoMemories}
          onNavigate={handleNavigate}
        />
      )}

      {page === 'vault' && (
        <MemoryVault
          memories={memories}
          onAdd={addMemory}
          onDelete={removeMemory}
          onLoadDemo={loadDemoMemories}
        />
      )}

      {page === 'ask' && (
        <AskMyPast memories={memories} onLoadDemo={loadDemoMemories} />
      )}

      {page === 'map' && (
        <KnowledgeMap memories={memories} onLoadDemo={loadDemoMemories} />
      )}

      {page === 'about' && <About />}

      {/* Error toast */}
      {error && page === 'dashboard' && !excavating && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-surface rounded-2xl border border-rust-500/20 shadow-lift p-4 animate-fadeInUp z-50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-rust-500/10 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-rust-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M5 19h14a2 2 0 001.7-3L13.7 4a2 2 0 00-3.4 0L3.3 16A2 2 0 005 19z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900 mb-1">Reconstruction Issue</p>
              <p className="text-xs text-ink-500">{error}</p>
              <p className="text-xs text-clay-600 mt-2">
                Showing local results instead. Add OPENAI_API_KEY to the server environment for full AI reconstruction.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-ink-900/8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-ink-500">
              Archaeologist — Search your memories, not your files.
            </p>
            <p className="text-xs text-ink-300">
              AI Memory Reconstruction Engine
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
