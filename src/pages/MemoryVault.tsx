import { useState, useRef } from 'react';
import {
  Upload, Plus, Sparkles, FileText, X, Loader2, FileUp,
} from 'lucide-react';
import { MemoryCardGrid } from '@/components/MemoryCard';
import type { Memory } from '@/types';

interface MemoryVaultProps {
  memories: Memory[];
  onAdd: (memory: Memory) => void;
  onDelete: (id: string) => void;
  onLoadDemo: () => void;
}

const ACCEPTED = '.pdf,.txt,.md,.png,.jpg,.jpeg';

function extractText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'txt' || ext === 'md') {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    } else {
      resolve('');
    }
  });
}

function inferDocType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes('offer')) return 'Offer Letter';
  if (lower.includes('certificate')) return 'Certificate';
  if (lower.includes('interview')) return 'Interview';
  if (lower.includes('invitation')) return 'Invitation';
  if (lower.includes('confirmation') || lower.includes('selection')) return 'Confirmation';
  if (lower.includes('notes')) return 'Notes';
  return 'Document';
}

export function MemoryVault({ memories, onAdd, onDelete, onLoadDemo }: MemoryVaultProps) {
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Manual form state
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [organizations, setOrganizations] = useState('');
  const [locations, setLocations] = useState('');
  const [dates, setDates] = useState('');
  const [amounts, setAmounts] = useState('');
  const [topics, setTopics] = useState('');
  const [people, setPeople] = useState('');
  const [documentType, setDocumentType] = useState('');

  function resetForm() {
    setFilename(''); setContent(''); setSummary(''); setOrganizations('');
    setLocations(''); setDates(''); setAmounts(''); setTopics('');
    setPeople(''); setDocumentType('');
  }

  function parseList(s: string): string[] {
    return s.split(',').map((x) => x.trim()).filter(Boolean);
  }

  function parseDates(s: string): string[] {
    return s.split(',').map((x) => x.trim()).filter(Boolean).map((d) => {
      const parsed = new Date(d);
      if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
      return d;
    });
  }

  function createMemoryFromForm() {
    const mem: Memory = {
      id: `mem-${Date.now()}`,
      filename: filename || 'Untitled.txt',
      content: content || summary,
      summary: summary || content.slice(0, 150),
      people: parseList(people),
      organizations: parseList(organizations),
      dates: parseDates(dates),
      locations: parseList(locations),
      amounts: parseList(amounts),
      topics: parseList(topics),
      documentType: documentType || inferDocType(filename),
      createdAt: new Date().toISOString(),
    };
    onAdd(mem);
    resetForm();
    setShowForm(false);
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (arr.length === 0) return;
    setUploading(true);

    for (const file of arr) {
      const text = await extractText(file);
      const mem: Memory = {
        id: `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        filename: file.name,
        content: text || '',
        summary: text ? text.slice(0, 150) + (text.length > 150 ? '…' : '') : '',
        people: [],
        organizations: [],
        dates: [],
        locations: [],
        amounts: [],
        topics: [],
        documentType: inferDocType(file.name),
        createdAt: new Date().toISOString(),
      };
      onAdd(mem);
    }

    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink-900 mb-1">Memory Vault</h1>
          <p className="text-sm text-ink-500">
            {memories.length} {memories.length === 1 ? 'memory' : 'memories'} stored. Upload documents or add memories manually.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-clay-50 text-clay-700 text-sm font-medium border border-clay-200 hover:bg-clay-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Load Demo
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 text-canvas text-sm font-medium hover:bg-clay-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Memory
          </button>
        </div>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`mb-6 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
          dragOver ? 'border-clay-400 bg-clay-50' : 'border-ink-900/15 bg-surface'
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-clay-500 animate-spin" />
            <p className="text-sm text-ink-500">Processing files...</p>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-3 w-full"
          >
            <div className="w-14 h-14 rounded-2xl bg-clay-50 border border-clay-100 flex items-center justify-center">
              <Upload className="w-7 h-7 text-clay-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900">Drop files here or click to upload</p>
              <p className="text-xs text-ink-500 mt-1">Supports PDF, TXT, MD, PNG, JPG, JPEG</p>
            </div>
          </button>
        )}
      </div>

      {/* Manual form */}
      {showForm && (
        <div className="mb-6 bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-6 animate-fadeInUp">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-sm text-ink-900">Add Memory Manually</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-ink-300 hover:text-ink-900 hover:bg-ink-900/5 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-ink-500 mb-1 block">Filename</label>
              <input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g., Coorix_Internship_Offer.pdf"
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-ink-500 mb-1 block">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste or type the document content..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300 resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-ink-500 mb-1 block">Summary</label>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="A short summary of this memory"
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-500 mb-1 block">Organizations (comma-separated)</label>
              <input
                value={organizations}
                onChange={(e) => setOrganizations(e.target.value)}
                placeholder="Coorix, Google"
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-500 mb-1 block">Locations</label>
              <input
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
                placeholder="Bengaluru, Mumbai"
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-500 mb-1 block">Dates</label>
              <input
                value={dates}
                onChange={(e) => setDates(e.target.value)}
                placeholder="2026-03-14"
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-500 mb-1 block">Amounts</label>
              <input
                value={amounts}
                onChange={(e) => setAmounts(e.target.value)}
                placeholder="₹15,000"
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-500 mb-1 block">Topics</label>
              <input
                value={topics}
                onChange={(e) => setTopics(e.target.value)}
                placeholder="Internship, Data Analyst"
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-500 mb-1 block">People</label>
              <input
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                placeholder="John Doe"
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-500 mb-1 block">Document Type</label>
              <input
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                placeholder="Offer Letter"
                className="w-full px-3 py-2 rounded-lg border border-ink-900/10 text-sm focus:outline-none focus:border-clay-300"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-ink-500 hover:text-ink-900 transition-colors">
              Cancel
            </button>
            <button
              onClick={createMemoryFromForm}
              disabled={!filename.trim() && !content.trim() && !summary.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ink-900 text-canvas text-sm font-medium hover:bg-clay-600 disabled:opacity-40 transition-colors"
            >
              <FileUp className="w-4 h-4" />
              Save Memory
            </button>
          </div>
        </div>
      )}

      {/* Memory grid */}
      <MemoryCardGrid
        memories={memories}
        onDelete={onDelete}
        emptyMessage="No memories yet. Upload files or load demo memories to get started."
        emptyAction={
          <button
            onClick={onLoadDemo}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-clay-50 text-clay-700 text-sm font-medium border border-clay-200 hover:bg-clay-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Load Demo Memories
          </button>
        }
      />
    </div>
  );
}
