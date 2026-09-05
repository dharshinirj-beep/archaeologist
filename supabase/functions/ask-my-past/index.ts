import { reconstructLocally, type Memory, type EvidenceItem, type RelatedMemory } from '../_shared/reconstruction.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RequestBody {
  question: string;
  memories: Memory[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { question, memories } = body;

    if (!question || !memories) {
      return new Response(
        JSON.stringify({ error: 'Question and memories are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      // Fallback: use local reconstruction to find relevant memories and build a simple answer
      const localResult = reconstructLocally(question, memories);
      if (localResult && localResult.memory) {
        const sources: EvidenceItem[] = [{
          memoryId: localResult.memory.id,
          filename: localResult.memory.filename,
          snippet: localResult.memory.content.slice(0, 200),
          reason: 'Best match for your question',
        }];
        const relatedMemories: RelatedMemory[] = localResult.relatedMemories;
        return new Response(
          JSON.stringify({
            answer: `Based on your stored memories, the most relevant entry is "${localResult.memory.filename}": ${localResult.memory.summary}`,
            sources,
            relatedMemories,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({
          answer: 'No matching memories found for your question.',
          sources: [],
          relatedMemories: [],
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const systemPrompt = `You are Archaeologist, an AI that answers questions about a user's past using ONLY their stored memories. You must NEVER invent information. If something is not found, say "Unknown — not found in available memories."

Answer the user's question using only the provided memories. Be conversational but precise. Reference specific memories by filename when relevant.

Return a JSON object:
{
  "answer": string (a natural-language answer to the question, using only the stored memories),
  "sourceIds": string[] (the IDs of memories you referenced in your answer)
}

Return ONLY the JSON, no markdown.`;

    const userPrompt = `Question: "${question}"

Stored memories:
${JSON.stringify(memories.map((m) => ({
  id: m.id,
  filename: m.filename,
  summary: m.summary,
  content: m.content,
  organizations: m.organizations,
  dates: m.dates,
  locations: m.locations,
  amounts: m.amounts,
  topics: m.topics,
  documentType: m.documentType,
})), null, 2)}`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('OpenAI error:', errText);
      const localResult = reconstructLocally(question, memories);
      if (localResult && localResult.memory) {
        return new Response(
          JSON.stringify({
            answer: `Based on your stored memories, the most relevant entry is "${localResult.memory.filename}": ${localResult.memory.summary}`,
            sources: [{
              memoryId: localResult.memory.id,
              filename: localResult.memory.filename,
              snippet: localResult.memory.content.slice(0, 200),
              reason: 'Best match',
            }],
            relatedMemories: localResult.relatedMemories,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      throw new Error('AI service unavailable');
    }

    const openaiData = await openaiRes.json();
    const aiContent = openaiData.choices?.[0]?.message?.content || '{}';
    let parsed: { answer?: string; sourceIds?: string[] };
    try {
      parsed = JSON.parse(aiContent);
    } catch {
      parsed = { answer: aiContent, sourceIds: [] };
    }

    const sourceIds = parsed.sourceIds || [];
    const sources: EvidenceItem[] = sourceIds
      .map((id) => memories.find((m) => m.id === id))
      .filter((m): m is Memory => m !== undefined)
      .map((m) => ({
        memoryId: m.id,
        filename: m.filename,
        snippet: m.content.slice(0, 200),
        reason: 'Referenced in answer',
      }));

    // If no sources identified, try local match
    let relatedMemories: RelatedMemory[] = [];
    if (sources.length === 0) {
      const localResult = reconstructLocally(question, memories);
      if (localResult && localResult.memory) {
        sources.push({
          memoryId: localResult.memory.id,
          filename: localResult.memory.filename,
          snippet: localResult.memory.content.slice(0, 200),
          reason: 'Best match for question',
        });
        relatedMemories = localResult.relatedMemories;
      }
    } else {
      // Build related from source memories
      const sourceMemory = memories.find((m) => sourceIds.includes(m.id));
      if (sourceMemory) {
        relatedMemories = memories
          .filter((m) => m.id !== sourceMemory.id)
          .filter((m) =>
            m.organizations.some((o) => sourceMemory.organizations.includes(o)) ||
            m.topics.some((t) => sourceMemory.topics.includes(t))
          )
          .map((m) => ({
            memoryId: m.id,
            filename: m.filename,
            date: m.dates[0] || m.createdAt.slice(0, 10),
            relationship: m.organizations.some((o) => sourceMemory.organizations.includes(o))
              ? 'Same organization'
              : 'Related topic',
          }));
      }
    }

    return new Response(
      JSON.stringify({
        answer: parsed.answer || 'Unable to generate an answer from available memories.',
        sources,
        relatedMemories,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to answer question',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
