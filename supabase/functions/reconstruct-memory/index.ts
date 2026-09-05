import { reconstructLocally } from '../_shared/reconstruction.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Memory {
  id: string;
  filename: string;
  content: string;
  summary: string;
  people: string[];
  organizations: string[];
  dates: string[];
  locations: string[];
  amounts: string[];
  topics: string[];
  documentType: string;
  createdAt: string;
}

interface RequestBody {
  query: string;
  memories: Memory[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    const { query, memories } = body;

    if (!query || !memories) {
      return new Response(
        JSON.stringify({ error: 'Query and memories are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const localResult = reconstructLocally(query, memories);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiKey) {
      if (localResult) {
        return new Response(
          JSON.stringify({ result: { ...localResult, isAiEstimate: false } }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      return new Response(
        JSON.stringify({
          result: {
            memory: null,
            confidence: 0,
            confidenceLabel: 'Unknown',
            whyThisMatches: [],
            evidence: [],
            relatedMemories: [],
            timeline: [],
            extractedClues: [],
            isAiEstimate: false,
            notFound: ['No matching memories found'],
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Use OpenAI to enhance the reconstruction
    const localResultForAi = localResult
      ? {
          memoryId: localResult.memory.id,
          filename: localResult.memory.filename,
          confidence: localResult.confidence,
          whyThisMatches: localResult.whyThisMatches,
        }
      : null;

    const systemPrompt = `You are Archaeologist, an AI memory reconstruction engine. Your job is to analyze a user's natural-language memory query and find the best matching memory from their stored memories.

You must NEVER invent information. If something is not found, say "Unknown — not found in available memories."

You will receive:
1. The user's query (what they remember)
2. A list of stored memories with their metadata
3. A preliminary local analysis result

Return a JSON object with this exact structure:
{
  "enhancedWhyThisMatches": string[] (human-readable reasons why the best memory matches, each starting with a clue like "March timing matches", "₹15,000 stipend matches", etc.),
  "enhancedSummary": string (a refined 1-2 sentence summary of the best matching memory),
  "notFound": string[] (things the user mentioned that were NOT found in any memory),
  "confidenceAdjustment": number (adjust the local confidence by this amount, -10 to +10, based on semantic understanding)
}

Focus on semantic matching — the user may use different words than what's stored. For example "around ₹15,000" should match "₹15,000". "around March" should match "March 14".

Return ONLY the JSON, no markdown, no explanation.`;

    const userPrompt = `User query: "${query}"

Stored memories:
${JSON.stringify(memories.map((m) => ({
  id: m.id,
  filename: m.filename,
  summary: m.summary,
  content: m.content.slice(0, 300),
  organizations: m.organizations,
  dates: m.dates,
  locations: m.locations,
  amounts: m.amounts,
  topics: m.topics,
  documentType: m.documentType,
})), null, 2)}

Local analysis preliminary result:
${JSON.stringify(localResultForAi, null, 2)}`;

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
      if (localResult) {
        return new Response(
          JSON.stringify({ result: { ...localResult, isAiEstimate: false } }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        );
      }
      throw new Error('AI reconstruction failed');
    }

    const openaiData = await openaiRes.json();
    const aiContent = openaiData.choices?.[0]?.message?.content || '{}';
    let aiEnhancement: {
      enhancedWhyThisMatches?: string[];
      enhancedSummary?: string;
      notFound?: string[];
      confidenceAdjustment?: number;
    };

    try {
      aiEnhancement = JSON.parse(aiContent);
    } catch {
      aiEnhancement = {};
    }

    if (!localResult) {
      return new Response(
        JSON.stringify({
          result: {
            memory: null,
            confidence: 0,
            confidenceLabel: 'Unknown',
            whyThisMatches: aiEnhancement.enhancedWhyThisMatches || [],
            evidence: [],
            relatedMemories: [],
            timeline: [],
            extractedClues: [],
            isAiEstimate: true,
            notFound: aiEnhancement.notFound || ['No matching memories found in available memories.'],
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const adjustedConfidence = Math.min(
      99,
      Math.max(0,
        localResult.confidence + (aiEnhancement.confidenceAdjustment || 0),
      ),
    );

    let confidenceLabel = 'Unknown';
    if (adjustedConfidence >= 80) confidenceLabel = 'Confirmed';
    else if (adjustedConfidence >= 55) confidenceLabel = 'Likely';
    else if (adjustedConfidence >= 30) confidenceLabel = 'Possible';

    const result = {
      ...localResult,
      memory: {
        ...localResult.memory,
        summary: aiEnhancement.enhancedSummary || localResult.memory.summary,
      },
      confidence: adjustedConfidence,
      confidenceLabel,
      whyThisMatches:
        aiEnhancement.enhancedWhyThisMatches?.length > 0
          ? aiEnhancement.enhancedWhyThisMatches
          : localResult.whyThisMatches,
      notFound:
        aiEnhancement.notFound?.length > 0
          ? aiEnhancement.notFound
          : localResult.notFound,
      isAiEstimate: true,
    };

    return new Response(
      JSON.stringify({ result }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Reconstruction failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
