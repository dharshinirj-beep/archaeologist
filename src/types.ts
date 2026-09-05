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
  memory: Memory;
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

export interface AskPastResult {
  answer: string;
  sources: EvidenceItem[];
  relatedMemories: RelatedMemory[];
}

export type ConfidenceLabel = 'Confirmed' | 'Likely' | 'Possible' | 'Unknown';

export type Page = 'dashboard' | 'vault' | 'ask' | 'map' | 'about';
