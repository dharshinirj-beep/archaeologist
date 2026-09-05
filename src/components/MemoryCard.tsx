import { useState } from 'react';
import {
  FileText, FileSpreadsheet, Image, File, Trash2, Plus,
  Building2, MapPin, Calendar, IndianRupee, Tag, User,
} from 'lucide-react';
import type { Memory } from '@/types';

interface MemoryCardProps {
  memory: Memory;
  onDelete?: (id: string) => void;
}

function getFileIcon(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg'].includes(ext || '')) return Image;
  if (['txt', 'md'].includes(ext || '')) return FileText;
  if (['csv', 'xlsx'].includes(ext || '')) return FileSpreadsheet;
  return File;
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function MemoryCard({ memory, onDelete }: MemoryCardProps) {
  const [expanded, setExpanded] = useState(false);
  const Icon = getFileIcon(memory.filename);

  return (
    <div className="group bg-surface rounded-2xl border border-ink-900/8 shadow-soft hover:shadow-lift hover:border-clay-200 transition-all overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-clay-50 border border-clay-100 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-clay-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-medium text-sm text-ink-900 truncate">{memory.filename}</h3>
              <span className="text-xs text-ink-500">{memory.documentType}</span>
            </div>
          </div>
          {onDelete && (
            <button
              onClick={() => onDelete(memory.id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-ink-300 hover:text-rust-500 hover:bg-rust-500/5 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <p className="text-sm text-ink-700 leading-relaxed mb-3">{memory.summary}</p>

        {expanded && (
          <div className="mb-3 p-3 rounded-xl bg-canvas/50 border border-ink-900/5">
            <p className="text-xs text-ink-500 leading-relaxed">{memory.content}</p>
          </div>
        )}

        {/* Metadata chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {memory.organizations.map((org) => (
            <span key={org} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-clay-50 text-clay-700 text-xs font-medium border border-clay-100">
              <Building2 className="w-3 h-3" /> {org}
            </span>
          ))}
          {memory.locations.map((loc) => (
            <span key={loc} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sage-500/10 text-sage-600 text-xs font-medium">
              <MapPin className="w-3 h-3" /> {loc}
            </span>
          ))}
          {memory.dates.map((d) => (
            <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-900/5 text-ink-700 text-xs font-medium">
              <Calendar className="w-3 h-3" /> {formatDate(d)}
            </span>
          ))}
          {memory.amounts.map((a) => (
            <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rust-500/10 text-rust-600 text-xs font-medium">
              <IndianRupee className="w-3 h-3" /> {a.replace('₹', '')}
            </span>
          ))}
          {memory.topics.slice(0, 3).map((t) => (
            <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-900/5 text-ink-500 text-xs font-medium">
              <Tag className="w-3 h-3" /> {t}
            </span>
          ))}
          {memory.people.map((p) => (
            <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-ink-900/5 text-ink-500 text-xs font-medium">
              <User className="w-3 h-3" /> {p}
            </span>
          ))}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-medium text-clay-600 hover:text-clay-700 transition-colors"
        >
          {expanded ? 'Show less' : 'Show content'}
        </button>
      </div>
    </div>
  );
}

interface MemoryCardGridProps {
  memories: Memory[];
  onDelete?: (id: string) => void;
  emptyMessage?: string;
  emptyAction?: React.ReactNode;
}

export function MemoryCardGrid({ memories, onDelete, emptyMessage, emptyAction }: MemoryCardGridProps) {
  if (memories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-ink-900/5 flex items-center justify-center mb-4">
          <Plus className="w-8 h-8 text-ink-300" />
        </div>
        <p className="text-ink-500 text-sm mb-4">
          {emptyMessage || 'No memories stored yet.'}
        </p>
        {emptyAction}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {memories.map((m) => (
        <MemoryCard key={m.id} memory={m} onDelete={onDelete} />
      ))}
    </div>
  );
}
