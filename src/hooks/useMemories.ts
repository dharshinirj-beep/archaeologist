import { useCallback, useEffect, useState } from 'react';
import type { Memory } from '@/types';
import { DEMO_MEMORIES } from '@/data/demoMemories';

const STORAGE_KEY = 'archaeologist-memories';

export function useMemories() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setMemories(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  const persist = useCallback((next: Memory[]) => {
    setMemories(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const addMemory = useCallback(
    (memory: Memory) => {
      persist([...memories, memory]);
    },
    [memories, persist],
  );

  const removeMemory = useCallback(
    (id: string) => {
      persist(memories.filter((m) => m.id !== id));
    },
    [memories, persist],
  );

  const loadDemoMemories = useCallback(() => {
    const existing = new Set(memories.map((m) => m.id));
    const toAdd = DEMO_MEMORIES.filter((m) => !existing.has(m.id));
    persist([...memories, ...toAdd]);
  }, [memories, persist]);

  const clearAll = useCallback(() => {
    persist([]);
  }, [persist]);

  return { memories, loaded, addMemory, removeMemory, loadDemoMemories, clearAll };
}
