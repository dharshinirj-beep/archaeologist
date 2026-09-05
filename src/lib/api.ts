import type { ReconstructionResult, AskPastResult, Memory } from '@/types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callEdgeFunction<T>(slug: string, body: unknown): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase not configured');
  }
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    let message: string;
    try {
      const json = JSON.parse(text);
      message = json.error || json.message || text;
    } catch {
      message = text;
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export interface ReconstructionResponse {
  result: ReconstructionResult;
}

export async function reconstructMemory(
  query: string,
  memories: Memory[],
): Promise<ReconstructionResult> {
  const data = await callEdgeFunction<ReconstructionResponse>('reconstruct-memory', {
    query,
    memories,
  });
  return data.result;
}

export async function askMyPast(
  question: string,
  memories: Memory[],
): Promise<AskPastResult> {
  return callEdgeFunction<AskPastResult>('ask-my-past', {
    question,
    memories,
  });
}
