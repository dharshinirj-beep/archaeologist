export interface Memory {
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

export interface MatchClue {
  type:
    | 'date'
    | 'organization'
    | 'person'
    | 'location'
    | 'amount'
    | 'topic'
    | 'documentType'
    | 'keyword';
  value: string;
}

export interface EvidenceItem {
  memoryId: string;
  filename: string;
  snippet: string;
  reason: string;
}

export interface RelatedMemory {
  memoryId: string;
  filename: string;
  date: string;
  relationship: string;
}

export interface TimelineEntry {
  date: string;
  label: string;
  memoryId: string;
}

export interface ReconstructionResult {
  memory: Memory | null;
  confidence: number;
  confidenceLabel: 'Confirmed' | 'Likely' | 'Possible' | 'Unknown';
  whyThisMatches: string[];
  evidence: EvidenceItem[];
  relatedMemories: RelatedMemory[];
  timeline: TimelineEntry[];
  extractedClues: MatchClue[];
  isAiEstimate: boolean;
  notFound: string[];
}

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[,\.\!\?;:]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractClues(query: string): MatchClue[] {
  const clues: MatchClue[] = [];
  const lower = query.toLowerCase();

  MONTH_NAMES.forEach((m, i) => {
    if (lower.includes(m)) {
      clues.push({ type: 'date', value: `${m} (month ${i + 1})` });
    }
  });

  const rawAmounts = query.match(/(?:₹|rs\.?|inr|\$|usd)\s?[\d,]+/gi);
  rawAmounts?.forEach((a) => {
    if (!clues.some((c) => c.type === 'amount' && c.value === a)) {
      clues.push({ type: 'amount', value: a });
    }
  });

  const knownLocations = [
    'bengaluru', 'bangalore', 'mumbai', 'delhi', 'hyderabad',
    'chennai', 'kolkata', 'pune', 'ahmedabad', 'gurgaon', 'noida',
    'jaipur', 'kochi', 'indore', 'remote',
  ];
  knownLocations.forEach((loc) => {
    if (lower.includes(loc)) clues.push({ type: 'location', value: loc });
  });

  const docTypes = ['offer', 'certificate', 'interview', 'invitation', 'confirmation', 'notes', 'email', 'letter'];
  docTypes.forEach((dt) => {
    if (lower.includes(dt)) clues.push({ type: 'documentType', value: dt });
  });

  const topicKeywords = [
    'internship', 'data analyst', 'data science', 'artificial intelligence',
    'machine learning', 'stipend', 'project', 'analytics', 'completion',
    'selection', 'neural networks',
  ];
  topicKeywords.forEach((kw) => {
    if (lower.includes(kw)) clues.push({ type: 'topic', value: kw });
  });

  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'i', 'me', 'my', 'we',
    'find', 'that', 'this', 'it', 'around', 'about', 'to', 'from', 'and',
    'or', 'but', 'for', 'of', 'in', 'on', 'at', 'by', 'with', 'remember',
    'dont', 'do', 'not', 'know', 'company', 'name', 'related', 'received',
    'show', 'everything', 'what', 'which', 'happened', 'after', 'before',
    'got', 'had', 'been', 'have', 'has', 'get',
  ]);
  const norm = normalize(query);
  const words = norm.split(' ').filter((w) => w.length > 2 && !stopWords.has(w));
  words.forEach((w) => {
    if (!clues.some((c) => c.value.toLowerCase().includes(w))) {
      clues.push({ type: 'keyword', value: w });
    }
  });

  return clues;
}

function clueMatchesMemory(clue: MatchClue, memory: Memory): boolean {
  const lower = clue.value.toLowerCase();
  switch (clue.type) {
    case 'date': {
      const monthIdx = MONTH_NAMES.findIndex((m) => lower.includes(m) || lower.includes(m.slice(0, 3)));
      if (monthIdx === -1) return false;
      return memory.dates.some((d) => parseInt(d.split('-')[1], 10) === monthIdx + 1);
    }
    case 'organization':
      return memory.organizations.some((o) => o.toLowerCase().includes(lower) || lower.includes(o.toLowerCase()));
    case 'person':
      return memory.people.some((p) => p.toLowerCase().includes(lower));
    case 'location':
      return memory.locations.some((l) => l.toLowerCase().includes(lower) || lower.includes(l.toLowerCase()));
    case 'amount': {
      const clueNum = lower.replace(/[^0-9]/g, '');
      return memory.amounts.some((a) => a.replace(/[^0-9]/g, '') === clueNum);
    }
    case 'topic':
      return memory.topics.some((t) => t.toLowerCase().includes(lower) || lower.includes(t.toLowerCase()));
    case 'documentType':
      return memory.documentType.toLowerCase().includes(lower);
    case 'keyword':
      return (
        memory.content.toLowerCase().includes(lower) ||
        memory.summary.toLowerCase().includes(lower) ||
        memory.topics.some((t) => t.toLowerCase().includes(lower)) ||
        memory.organizations.some((o) => o.toLowerCase().includes(lower))
      );
    default:
      return false;
  }
}

function scoreMemory(memory: Memory, clues: MatchClue[]) {
  let score = 0;
  const matchedClues: MatchClue[] = [];
  const reasons: string[] = [];

  const weights: Record<string, number> = {
    date: 20, amount: 25, location: 18, organization: 22,
    person: 15, topic: 12, documentType: 10, keyword: 4,
  };

  for (const clue of clues) {
    if (clueMatchesMemory(clue, memory)) {
      score += weights[clue.type];
      matchedClues.push(clue);
    }
  }

  const dateMatch = matchedClues.find((c) => c.type === 'date');
  if (dateMatch) {
    const monthName = MONTH_NAMES.find((m) => dateMatch.value.toLowerCase().includes(m)) || '';
    reasons.push(`${monthName || dateMatch.value} timing matches`);
  }
  const amountMatch = matchedClues.find((c) => c.type === 'amount');
  if (amountMatch) reasons.push(`${amountMatch.value} stipend/amount matches`);
  const locMatch = matchedClues.find((c) => c.type === 'location');
  if (locMatch) reasons.push(`${locMatch.value} connection matches`);
  const orgMatch = matchedClues.find((c) => c.type === 'organization');
  if (orgMatch) reasons.push(`${orgMatch.value} organization matches`);
  const topicMatches = matchedClues.filter((c) => c.type === 'topic');
  if (topicMatches.length > 0) reasons.push(`${topicMatches[0].value} topic matches`);
  const docMatch = matchedClues.find((c) => c.type === 'documentType');
  if (docMatch) reasons.push(`${docMatch.value} document type matches`);

  return { score, matchedClues, reasons };
}

function getConfidence(score: number, maxPossible: number) {
  if (maxPossible === 0) return { value: 0, label: 'Unknown' as const };
  const ratio = score / maxPossible;
  const value = Math.min(99, Math.round(ratio * 100));
  let label: 'Confirmed' | 'Likely' | 'Possible' | 'Unknown' = 'Unknown';
  if (value >= 80) label = 'Confirmed';
  else if (value >= 55) label = 'Likely';
  else if (value >= 30) label = 'Possible';
  return { value, label };
}

export function reconstructLocally(query: string, memories: Memory[]): ReconstructionResult | null {
  if (memories.length === 0) return null;

  const clues = extractClues(query);
  const scored = memories.map((m) => ({ memory: m, ...scoreMemory(m, clues) }));
  scored.sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.score === 0) return null;

  const maxPossible = clues.reduce((sum, c) => {
    const weights: Record<string, number> = {
      date: 20, amount: 25, location: 18, organization: 22,
      person: 15, topic: 12, documentType: 10, keyword: 4,
    };
    return sum + weights[c.type];
  }, 0);

  const { value, label } = getConfidence(best.score, maxPossible);

  const snippet = best.memory.content.slice(0, 200) + (best.memory.content.length > 200 ? '…' : '');
  const evidence: EvidenceItem[] = [{
    memoryId: best.memory.id,
    filename: best.memory.filename,
    snippet,
    reason: best.reasons.join('; ') || 'Content overlap with query',
  }];

  const relatedMemories: RelatedMemory[] = memories
    .filter((m) => m.id !== best.memory.id)
    .filter((m) =>
      m.organizations.some((o) => best.memory.organizations.includes(o)) ||
      m.topics.some((t) => best.memory.topics.includes(t))
    )
    .map((m) => ({
      memoryId: m.id,
      filename: m.filename,
      date: m.dates[0] || m.createdAt.slice(0, 10),
      relationship: m.organizations.some((o) => best.memory.organizations.includes(o))
        ? 'Same organization'
        : 'Related topic',
    }));

  const allIds = new Set([best.memory.id, ...relatedMemories.map((r) => r.memoryId)]);
  const timeline: TimelineEntry[] = memories
    .filter((m) => allIds.has(m.id) && m.dates.length > 0)
    .map((m) => ({
      date: m.dates[0],
      label: m.summary.split('.')[0] || m.filename,
      memoryId: m.id,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const notFound: string[] = [];
  const foundTypes = new Set(best.matchedClues.map((c) => c.type));
  if (clues.some((c) => c.type === 'organization') && !foundTypes.has('organization'))
    notFound.push('Organization name not found in available memories');
  if (clues.some((c) => c.type === 'person') && !foundTypes.has('person'))
    notFound.push('People not found in available memories');

  return {
    memory: best.memory,
    confidence: value,
    confidenceLabel: label,
    whyThisMatches: best.reasons,
    evidence,
    relatedMemories,
    timeline,
    extractedClues: clues,
    isAiEstimate: false,
    notFound,
  };
}
