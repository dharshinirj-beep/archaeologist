import { useState, useMemo } from 'react';
import { Map as MapIcon, Sparkles, Compass, Building2, FileText, Tag } from 'lucide-react';
import { MemoryCard } from '@/components/MemoryCard';
import type { Memory } from '@/types';

interface KnowledgeMapProps {
  memories: Memory[];
  onLoadDemo: () => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: 'organization' | 'memory' | 'topic';
  memory?: Memory;
}

interface GraphEdge {
  from: string;
  to: string;
}

export function KnowledgeMap({ memories, onLoadDemo }: KnowledgeMapProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { nodes, edges, clusters } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const edgeList: GraphEdge[] = [];

    // Add memory nodes
    memories.forEach((m) => {
      nodeMap.set(m.id, { id: m.id, label: m.filename, type: 'memory', memory: m });
    });

    // Add org nodes and edges
    memories.forEach((m) => {
      m.organizations.forEach((org) => {
        const orgId = `org-${org}`;
        if (!nodeMap.has(orgId)) {
          nodeMap.set(orgId, { id: orgId, label: org, type: 'organization' });
        }
        edgeList.push({ from: orgId, to: m.id });
      });
    });

    // Add topic nodes and edges (for shared topics only)
    const topicCount = new Map<string, number>();
    memories.forEach((m) => {
      m.topics.forEach((t) => {
        topicCount.set(t, (topicCount.get(t) || 0) + 1);
      });
    });

    memories.forEach((m) => {
      m.topics.forEach((t) => {
        if ((topicCount.get(t) || 0) >= 2) {
          const topicId = `topic-${t}`;
          if (!nodeMap.has(topicId)) {
            nodeMap.set(topicId, { id: topicId, label: t, type: 'topic' });
          }
          edgeList.push({ from: m.id, to: topicId });
        }
      });
    });

    // Cluster by organization
    const clusterMap = new Map<string, Memory[]>();
    memories.forEach((m) => {
      const key = m.organizations[0] || 'Unsorted';
      if (!clusterMap.has(key)) clusterMap.set(key, []);
      clusterMap.get(key)!.push(m);
    });

    return {
      nodes: Array.from(nodeMap.values()),
      edges: edgeList,
      clusters: Array.from(clusterMap.entries()),
    };
  }, [memories]);

  const selectedMemory = selectedNode
    ? nodes.find((n) => n.id === selectedNode)?.memory
    : null;

  const connectedMemories = useMemo(() => {
    if (!selectedNode) return [];
    const connectedIds = new Set<string>();
    edges.forEach((e) => {
      if (e.from === selectedNode) connectedIds.add(e.to);
      if (e.to === selectedNode) connectedIds.add(e.from);
    });
    return memories.filter((m) => connectedIds.has(m.id));
  }, [selectedNode, edges, memories]);

  if (memories.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center bg-surface rounded-2xl border border-dashed border-clay-200 p-12">
          <MapIcon className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-semibold text-ink-900 mb-2">Knowledge Map</h1>
          <p className="text-ink-500 text-sm mb-4">
            Load demo memories to see the visual relationship map.
          </p>
          <button
            onClick={onLoadDemo}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-clay-50 text-clay-700 text-sm font-medium border border-clay-200 hover:bg-clay-100 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Load Demo Memories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-ink-900 flex items-center justify-center">
            <MapIcon className="w-5 h-5 text-clay-300" />
          </div>
          <h1 className="font-serif text-3xl font-semibold text-ink-900">Knowledge Map</h1>
        </div>
        <p className="text-sm text-ink-500 ml-13">
          Visual relationships between your memories. Click any node to explore connections.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-6 overflow-x-auto">
          <div className="space-y-6">
            {clusters.map(([orgName, mems]) => {
              const isOrgSelected = selectedNode === `org-${orgName}`;
              return (
                <div key={orgName} className="relative">
                  {/* Org node */}
                  <button
                    onClick={() => setSelectedNode(`org-${orgName}`)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isOrgSelected
                        ? 'bg-ink-900 text-canvas shadow-lift'
                        : 'bg-clay-50 text-clay-700 border border-clay-100 hover:bg-clay-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    {orgName}
                    <span className={`text-xs ${isOrgSelected ? 'text-clay-300' : 'text-clay-500'}`}>
                      ({mems.length})
                    </span>
                  </button>

                  {/* Connection lines + memory nodes */}
                  <div className="ml-4 mt-2 space-y-2 border-l-2 border-clay-200 pl-6 relative">
                    {mems.map((m, i) => {
                      const isSelected = selectedNode === m.id;
                      return (
                        <div key={m.id} className="relative animate-fadeIn" style={{ animationDelay: `${i * 80}ms` }}>
                          {/* Branch line */}
                          <div className="absolute -left-[26px] top-1/2 w-[18px] h-0.5 bg-clay-200" />
                          <button
                            onClick={() => setSelectedNode(m.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all w-full text-left ${
                              isSelected
                                ? 'bg-ink-900 text-canvas shadow-lift'
                                : 'bg-canvas/50 text-ink-700 border border-ink-900/8 hover:border-clay-200 hover:bg-surface'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{m.filename}</span>
                          </button>
                          {/* Date label */}
                          {m.dates[0] && (
                            <span className="ml-2 text-xs text-ink-300">
                              {new Date(m.dates[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Shared topics */}
            {nodes.filter((n) => n.type === 'topic').length > 0 && (
              <div>
                <p className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-3">Shared Topics</p>
                <div className="flex flex-wrap gap-2">
                  {nodes.filter((n) => n.type === 'topic').map((n) => {
                    const isSelected = selectedNode === n.id;
                    return (
                      <button
                        key={n.id}
                        onClick={() => setSelectedNode(n.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-ink-900 text-canvas'
                            : 'bg-sage-500/10 text-sage-600 border border-sage-500/20 hover:bg-sage-500/15'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {n.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-1">
          {selectedMemory ? (
            <div className="sticky top-20 space-y-4 animate-fadeIn">
              <MemoryCard memory={selectedMemory} />
              {connectedMemories.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-ink-500 uppercase tracking-wider mb-2">Connected Memories</p>
                  <div className="space-y-2">
                    {connectedMemories.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedNode(m.id)}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-ink-900/8 hover:border-clay-200 transition-colors w-full text-left"
                      >
                        <Compass className="w-3.5 h-3.5 text-clay-500 shrink-0" />
                        <span className="text-xs text-ink-700 truncate">{m.filename}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="sticky top-20 bg-surface rounded-2xl border border-ink-900/8 shadow-soft p-6 text-center">
              <Compass className="w-10 h-10 text-ink-300 mx-auto mb-3" />
              <p className="text-sm text-ink-500">
                Click any node in the map to see its details and connections.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
