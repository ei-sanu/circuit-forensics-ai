'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Network,
  Search,
  Filter,
  Eye,
  EyeOff,
  ShieldAlert,
  Sliders,
  Sparkles,
  Route,
  Scissors,
  Download,
  Info,
  ChevronRight,
  X,
  Layers,
  CheckSquare,
  Square,
  Link2,
} from 'lucide-react';
import { NetworkGraph } from '@/components/graph/NetworkGraph';
import { api } from '@/lib/api';
import { GraphSkeleton } from '@/components/ui/Skeleton';
import {
  EXPLORER_CASES,
  buildGraphForCase,
  MASTER_ENTIRE_NETWORK,
  ExplorerCaseMeta,
} from '@/lib/networkExplorerCases';


const EDGE_COLORS: Record<string, string> = {
  communicated_with: '#10b981',
  called: '#10b981',
  transferred_money_to: '#f59e0b',
  associated_with: '#38bdf8',
  employed_by: '#a855f7',
  owns: '#f97316',
  visited: '#ec4899',
  traveled_with: '#fb923c',
  attended: '#06b6d4',
  linked_to: '#94a3b8',
};

function findShortestPathClient(edges: any[], startId: string, endId: string): string[] | null {
  if (startId === endId) return [startId];
  const adj = new Map<string, string[]>();
  edges.forEach((e) => {
    const s = String(e.source);
    const t = String(e.target);
    if (!adj.has(s)) adj.set(s, []);
    if (!adj.has(t)) adj.set(t, []);
    adj.get(s)!.push(t);
    adj.get(t)!.push(s);
  });
  const queue: string[][] = [[startId]];
  const visited = new Set<string>([startId]);
  while (queue.length > 0) {
    const path = queue.shift()!;
    const last = path[path.length - 1];
    if (last === endId) return path;
    for (const neighbor of adj.get(last) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }
  return null;
}

export default function ExplorerPage() {
  const [loading, setLoading] = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({
    nodes: MASTER_ENTIRE_NETWORK.nodes,
    edges: MASTER_ENTIRE_NETWORK.edges,
  });

  const [analytics, setAnalytics] = useState<any>(MASTER_ENTIRE_NETWORK.analytics);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [selectedEdge, setSelectedEdge] = useState<any>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [caseScope, setCaseScope] = useState('all');
  const [caseFilterQuery, setCaseFilterQuery] = useState('');
  const [suspectRoster, setSuspectRoster] = useState(MASTER_ENTIRE_NETWORK.suspectRoster);
  const [suspiciousOnly, setSuspiciousOnly] = useState(false);
  const [colorBy, setColorBy] = useState<'type' | 'risk' | 'community'>('type');
  const [minConfidence, setMinConfidence] = useState(0.0);

  // Active case metadata when specific case is selected
  const activeCaseMeta = useMemo<ExplorerCaseMeta | null>(() => {
    if (caseScope === 'all') return null;
    return EXPLORER_CASES.find((c) => c.caseNumber === caseScope) || null;
  }, [caseScope]);

  // Filtered cases list for quick searching across 225 cases
  const filteredCasesList = useMemo(() => {
    if (!caseFilterQuery.trim()) return EXPLORER_CASES;
    const q = caseFilterQuery.toLowerCase().trim();
    return EXPLORER_CASES.filter(
      (c) =>
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.leadInvestigator.toLowerCase().includes(q)
    );
  }, [caseFilterQuery]);

  // Entity Type Checkboxes with vibrant color coding
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<Record<string, boolean>>({
    person: true,
    organization: true,
    phone: true,
    vehicle: true,
    location: true,
    event: true,
  });

  // Relationship Type Checkboxes
  const [allRelTypes, setAllRelTypes] = useState(true);
  const [selectedRelTypes, setSelectedRelTypes] = useState<Record<string, boolean>>({
    associated_with: true,
    communicated_with: true,
    called: true,
    transferred_money_to: true,
    employed_by: true,
    owns: true,
    visited: true,
    traveled_with: true,
    attended: true,
    linked_to: true,
  });

  // Shortest path states
  const [sourceId, setSourceId] = useState('P-0001');
  const [targetId, setTargetId] = useState('O-0001');
  const [pathResult, setPathResult] = useState<any>(null);

  useEffect(() => {
    async function loadGraph() {
      setLoading(true);
      try {
        const caseParam = caseScope === 'all' ? undefined : caseScope;
        const res = await api.getGraphAnalytics(caseParam).catch(() => null);
        if (res && res.graph && Array.isArray(res.graph.nodes) && res.graph.nodes.length > 0) {
          setGraphData(res.graph);
          if (res.analytics) {
            setAnalytics(res.analytics);
          }
          const localPayload = buildGraphForCase(caseScope);
          setSuspectRoster(localPayload.suspectRoster);
        } else {
          // Dynamic forensic graph builder covering all 225+ cases
          const localPayload = buildGraphForCase(caseScope);
          setGraphData({ nodes: localPayload.nodes, edges: localPayload.edges });
          setAnalytics(localPayload.analytics);
          setSuspectRoster(localPayload.suspectRoster);
        }
      } catch (err) {
        console.warn('Loading fallback case topology graph:', err);
        const localPayload = buildGraphForCase(caseScope);
        setGraphData({ nodes: localPayload.nodes, edges: localPayload.edges });
        setAnalytics(localPayload.analytics);
        setSuspectRoster(localPayload.suspectRoster);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, [caseScope]);

  // Adjust source and target path defaults when nodes change
  useEffect(() => {
    if (graphData.nodes && graphData.nodes.length >= 2) {
      const ids = graphData.nodes.map((n) => String(n.id));
      if (!ids.includes(sourceId)) {
        setSourceId(ids[0]);
      }
      if (!ids.includes(targetId)) {
        setTargetId(ids[1] || ids[0]);
      }
    }
    setPathResult(null);
  }, [graphData]);


  // Filter Elements
  const filteredElements = useMemo(() => {
    let nodes = graphData.nodes || [];
    let edges = graphData.edges || [];

    // 1. Search Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      nodes = nodes.filter(
        (n) =>
          n.label?.toLowerCase().includes(q) ||
          n.id?.toLowerCase().includes(q) ||
          (n.entity_type || n.type)?.toLowerCase().includes(q) ||
          (n.properties && JSON.stringify(n.properties).toLowerCase().includes(q))
      );
    }

    // 2. Suspicious only filter
    if (suspiciousOnly) {
      nodes = nodes.filter((n) => n.risk_flag || n.risk);
    }

    // 3. Entity type filter
    nodes = nodes.filter((n) => {
      const type = (n.entity_type || n.type || 'person').toLowerCase();
      return selectedEntityTypes[type] !== false;
    });

    const validNodeIds = new Set(nodes.map((n) => String(n.id)));

    // 4. Filter edges connecting valid nodes
    edges = edges.filter((e) => validNodeIds.has(String(e.source)) && validNodeIds.has(String(e.target)));

    // 5. Relationship Type filter
    if (!allRelTypes) {
      edges = edges.filter((e) => {
        const rel = (e.rel_type || '').toLowerCase().replace(/ /g, '_');
        return selectedRelTypes[rel] !== false;
      });
    }

    // 6. Min confidence
    if (minConfidence > 0) {
      edges = edges.filter((e) => (e.confidence || 1.0) >= minConfidence);
    }

    return { nodes, edges };
  }, [graphData, searchQuery, suspiciousOnly, selectedEntityTypes, allRelTypes, selectedRelTypes, minConfidence]);

  const handleFindPath = async () => {
    if (!sourceId || !targetId) return;
    try {
      const res = await api.findPath(sourceId, targetId);
      if (res && res.found && Array.isArray(res.path) && res.path.length > 0) {
        setPathResult(res);
        return;
      }
    } catch (err) {
      console.warn('Backend path calculation fallback to client topology:', err);
    }

    // Fallback Client BFS
    const path = findShortestPathClient(filteredElements.edges, sourceId, targetId);
    if (path) {
      setPathResult({ found: true, path, total_hops: path.length - 1 });
    } else {
      setPathResult({ found: false, path: [] });
    }
  };

  const handleSelectSuspect = (suspect: any) => {
    const found = graphData.nodes.find((n) => String(n.id) === String(suspect.id));
    if (found) {
      setSelectedNode(found);
    } else {
      setSelectedNode({
        id: suspect.id,
        label: suspect.name,
        entity_type: 'person',
        risk_flag: suspect.risk,
        properties: { designation: suspect.role, score: suspect.score, jurisdiction: suspect.jurisdiction },
      });
    }
    setSelectedEdge(null);
  };

  const communityMap: Record<string, number> = {};
  if (analytics && Array.isArray(analytics.communities)) {
    analytics.communities.forEach((c: any) => {
      if (Array.isArray(c.members)) {
        c.members.forEach((m: string) => {
          communityMap[m] = c.community_id;
        });
      }
    });
  }

  return (
    <div className="h-[calc(100vh-9.5rem)] min-h-[580px] flex flex-col gap-3 text-neutral-900 dark:text-neutral-100">
      {/* Top Search & Controller Bar */}
      <div className="p-3 sm:p-4 rounded-3xl glass-panel flex flex-col lg:flex-row items-center justify-between gap-3 text-xs shadow-md">
        {/* Search Bar */}
        <div className="relative w-full lg:w-96">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search suspects, phones, vehicles, entities... (try 'Vikram' or 'Phone')"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-900 placeholder:text-charcoal-400 focus:border-charcoal-900 outline-none shadow-sm font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-800 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2 font-semibold">
          {/* Toggle Filter Drawer */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
              showFilters
                ? 'bg-charcoal-900 text-white'
                : 'bg-white border border-slate-200 text-charcoal-700 hover:text-charcoal-950'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          {/* Color Selector */}
          <select
            value={colorBy}
            onChange={(e) => setColorBy(e.target.value as any)}
            className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-charcoal-900 font-bold outline-none shadow-sm cursor-pointer"
          >
            <option value="type">Color: Multi-Spectral (Entity Type)</option>
            <option value="risk">Color: Risk Threat Level</option>
            <option value="community">Color: Communities (Neural Clusters)</option>
          </select>

          {/* Suspicious Only Toggle */}
          <button
            onClick={() => setSuspiciousOnly(!suspiciousOnly)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
              suspiciousOnly
                ? 'bg-red-600 text-white shadow-red-600/20'
                : 'bg-white border border-slate-200 text-charcoal-700 hover:text-charcoal-950'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Suspicious Only</span>
          </button>

          {/* Quick Snapshot / Save Image Button */}
          <button
            onClick={() => {
              const btn = document.querySelector<HTMLButtonElement>('button[title*="Save & Download"]');
              if (btn) btn.click();
            }}
            title="Download Graph Diagram as High-Resolution PNG"
            className="px-3.5 py-1.5 rounded-full bg-charcoal-900 hover:bg-black text-white text-xs font-bold font-mono transition flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Image</span>
          </button>

          <span className="text-[11px] font-mono text-charcoal-600 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full">
            <strong className="text-charcoal-950">{filteredElements.nodes.length}</strong> nodes •{' '}
            <strong className="text-charcoal-950">{filteredElements.edges.length}</strong> edges
          </span>
        </div>
      </div>

      {/* Main Graph Workspace: Left Filters Drawer, Center Cytoscape Canvas, Right Intel Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Filter Drawer */}
        {showFilters && (
          <div className="lg:col-span-3 glass-panel rounded-3xl p-4 overflow-y-auto space-y-4 shadow-lg text-xs animate-scale-in">
            {/* Case Scope (225+ Cases with Quick Filter) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-mono uppercase font-extrabold text-charcoal-700 tracking-wider">
                  CASE SCOPE ({EXPLORER_CASES.length} CASES)
                </label>
                {caseScope !== 'all' && (
                  <button
                    onClick={() => setCaseScope('all')}
                    className="text-[10px] text-sky-600 hover:text-sky-800 font-bold underline cursor-pointer"
                  >
                    Reset Scope
                  </button>
                )}
              </div>

              {/* Quick Case Filter */}
              <div className="relative">
                <Search className="w-3 h-3 text-charcoal-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter 225 cases..."
                  value={caseFilterQuery}
                  onChange={(e) => setCaseFilterQuery(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 bg-white border border-slate-200 rounded-xl text-[11px] text-charcoal-800 placeholder:text-charcoal-400 focus:border-charcoal-900 outline-none"
                />
              </div>

              <select
                value={caseScope}
                onChange={(e) => setCaseScope(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-charcoal-950 outline-none shadow-sm cursor-pointer"
              >
                <option value="all">Entire network (Multi-Syndicate Global View)</option>
                {filteredCasesList.map((c) => (
                  <option key={c.caseNumber} value={c.caseNumber}>
                    {c.caseNumber} — {c.title.length > 32 ? `${c.title.slice(0, 32)}...` : c.title} ({c.priority.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Entity Types (Vibrant Multi-Color Badges) */}
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <label className="block text-[10px] font-mono uppercase font-extrabold text-charcoal-700 tracking-wider">
                ENTITY TYPES
              </label>
              {[
                { id: 'person', label: 'Person / Suspect', color: '#0284c7', glow: '#38bdf8' },
                { id: 'organization', label: 'Organization / Enterprise', color: '#d97706', glow: '#fbbf24' },
                { id: 'phone', label: 'Burner Phone / Intercept', color: '#059669', glow: '#34d399' },
                { id: 'vehicle', label: 'Transit Vehicle / Fleet', color: '#ea580c', glow: '#fb923c' },
                { id: 'location', label: 'Safehouse Location / Vault', color: '#7c3aed', glow: '#c084fc' },
                { id: 'event', label: 'Incident / Operation Event', color: '#db2777', glow: '#f472b6' },
              ].map((et) => (
                <label key={et.id} className="flex items-center gap-2.5 cursor-pointer text-xs font-medium hover:text-charcoal-950 transition">
                  <input
                    type="checkbox"
                    checked={selectedEntityTypes[et.id] !== false}
                    onChange={(e) =>
                      setSelectedEntityTypes({ ...selectedEntityTypes, [et.id]: e.target.checked })
                    }
                    className="rounded text-charcoal-900 cursor-pointer"
                  />
                  <span
                    className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: et.color, boxShadow: `0 0 6px ${et.glow}88` }}
                  />
                  <span>{et.label}</span>
                </label>
              ))}
            </div>

            {/* Relationship Types (Color Coded) */}
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <label className="block text-[10px] font-mono uppercase font-extrabold text-charcoal-700 tracking-wider">
                RELATIONSHIP TYPES
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-bold">
                <input
                  type="checkbox"
                  checked={allRelTypes}
                  onChange={(e) => setAllRelTypes(e.target.checked)}
                  className="rounded text-charcoal-900 cursor-pointer"
                />
                <span>All Relationships</span>
              </label>
              {[
                'associated with',
                'communicated with',
                'called',
                'transferred money to',
                'employed by',
                'owns',
                'visited',
                'traveled with',
                'attended',
                'linked to',
              ].map((rel) => {
                const key = rel.replace(/ /g, '_');
                const relColor = EDGE_COLORS[key] || '#94a3b8';
                return (
                  <label key={rel} className="flex items-center gap-2 cursor-pointer text-charcoal-700 text-[11px] hover:text-charcoal-950 transition">
                    <input
                      type="checkbox"
                      checked={allRelTypes || selectedRelTypes[key] !== false}
                      onChange={(e) => {
                        setAllRelTypes(false);
                        setSelectedRelTypes({ ...selectedRelTypes, [key]: e.target.checked });
                      }}
                      className="rounded text-charcoal-900 cursor-pointer"
                    />
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: relColor }} />
                    <span className="capitalize">{rel}</span>
                  </label>
                );
              })}
            </div>

            {/* Min Confidence Slider */}
            <div className="border-t border-slate-200 pt-3 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono font-bold">
                <span className="uppercase text-charcoal-700">MIN CONFIDENCE</span>
                <span className="text-charcoal-950 font-bold">{minConfidence.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full cursor-pointer accent-charcoal-900"
              />
            </div>
          </div>
        )}

        {/* Center: Graph Canvas */}
        <div className={`${showFilters ? 'lg:col-span-6' : 'lg:col-span-9'} h-full min-h-0 flex flex-col relative`}>
          {/* Active Case Context Ribbon (shows when specific case is selected from 225+ cases) */}
          {activeCaseMeta && (
            <div className="mb-2 p-2.5 px-3.5 rounded-2xl bg-white border border-sky-200 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 animate-scale-in">
              <div className="flex items-center gap-2 truncate">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800 border border-sky-300 shrink-0">
                  {activeCaseMeta.caseNumber}
                </span>
                <span className="font-extrabold text-charcoal-950 text-xs truncate max-w-xs sm:max-w-md">
                  {activeCaseMeta.title}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold shrink-0 ${
                  activeCaseMeta.priority === 'critical'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : activeCaseMeta.priority === 'high'
                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                    : 'bg-slate-100 text-slate-700'
                }`}>
                  {activeCaseMeta.priority}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono text-charcoal-600">
                <span className="hidden sm:inline">Officer: <strong>{activeCaseMeta.leadInvestigator}</strong></span>
                <span>Tracked: <strong className="text-emerald-700">₹{(activeCaseMeta.totalVolume / 100000).toFixed(1)} Lakhs</strong></span>
                <button
                  onClick={() => setCaseScope('all')}
                  className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-charcoal-800 text-[10px] font-bold font-sans cursor-pointer transition"
                  title="View Entire Multi-Syndicate Network"
                >
                  Clear Scope
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 min-h-0 relative">
            {loading ? (
              <GraphSkeleton />
            ) : (
              <NetworkGraph
                elements={filteredElements}
                selectedNodeId={selectedNode?.id || selectedNode?.entityId}
                colorBy={colorBy}
                communityMap={communityMap}
                highlightedPath={pathResult?.path}
                onSelectNode={(id, data) => {
                  setSelectedNode(data || { id, label: id, entity_type: 'person' });
                  setSelectedEdge(null);
                }}
                onSelectEdge={(edgeData) => {
                  setSelectedEdge(edgeData);
                }}
              />
            )}
          </div>
        </div>

        {/* Right: Network Intelligence & Suspect List */}
        <div className="lg:col-span-3 h-full flex flex-col gap-3 overflow-y-auto pr-1">
          {/* Selected Entity / Edge Intel Panel */}
          {selectedNode ? (
            <div className="p-4 rounded-3xl glass-panel space-y-2.5 shadow-md border-2 border-sky-500/40 animate-scale-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-600 font-bold">
                  Inspected Node
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-charcoal-400 hover:text-charcoal-950 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div>
                <h4 className="font-extrabold text-charcoal-950 text-sm">
                  {selectedNode.label || selectedNode.name || selectedNode.id}
                </h4>
                <p className="text-[11px] text-charcoal-500 font-mono">
                  {selectedNode.id || selectedNode.entityId} ·{' '}
                  <span className="capitalize font-semibold">{selectedNode.entity_type || selectedNode.type || 'Entity'}</span>
                </p>
              </div>
              {(selectedNode.risk_flag || selectedNode.risk || selectedNode.riskFlag) && (
                <div className="p-2 rounded-xl bg-red-100 border border-red-200 text-red-700 text-xs flex items-center gap-1.5 font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Flagged High-Risk Target</span>
                </div>
              )}
              {selectedNode.properties?.designation && (
                <p className="text-xs text-charcoal-700 font-medium">
                  <strong>Role:</strong> {selectedNode.properties.designation}
                </p>
              )}
              {selectedNode.properties?.jurisdiction && (
                <p className="text-xs text-charcoal-700 font-medium">
                  <strong>Jurisdiction:</strong> {selectedNode.properties.jurisdiction}
                </p>
              )}
              {selectedNode.properties?.nationality && (
                <p className="text-xs text-charcoal-700 font-medium">
                  <strong>Nationality:</strong> {selectedNode.properties.nationality}
                </p>
              )}
              {selectedNode.properties?.carrier && (
                <p className="text-xs text-charcoal-700 font-medium">
                  <strong>Carrier:</strong> {selectedNode.properties.carrier} ({selectedNode.properties.circle})
                </p>
              )}
              {selectedNode.properties?.make && (
                <p className="text-xs text-charcoal-700 font-medium">
                  <strong>Vehicle Make:</strong> {selectedNode.properties.make} {selectedNode.properties.model}
                </p>
              )}
            </div>
          ) : selectedEdge ? (
            <div className="p-4 rounded-3xl glass-panel space-y-2.5 shadow-md border-2 border-sky-500/40 animate-scale-in">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-charcoal-600 font-bold flex items-center gap-1">
                  <Link2 className="w-3 h-3 text-sky-600" />
                  <span>Inspected Link</span>
                </span>
                <button
                  onClick={() => setSelectedEdge(null)}
                  className="text-charcoal-400 hover:text-charcoal-950 text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div>
                <h4 className="font-extrabold text-charcoal-950 text-sm capitalize">
                  {(selectedEdge.rel_type || selectedEdge.label || 'Connected').replace(/_/g, ' ')}
                </h4>
                <p className="text-[11px] text-charcoal-500 font-mono">
                  {selectedEdge.source} ➔ {selectedEdge.target}
                </p>
              </div>
              {selectedEdge.total_amount > 0 && (
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-mono font-bold">
                  Amount: ₹{Number(selectedEdge.total_amount).toLocaleString('en-IN')}
                </div>
              )}
              <div className="text-xs text-charcoal-700 font-mono space-y-1">
                <p>Confidence: <strong>{((selectedEdge.confidence ?? 0.95) * 100).toFixed(0)}%</strong></p>
                {selectedEdge.count && <p>Frequency: <strong>{selectedEdge.count} interactions</strong></p>}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-3xl glass-panel text-xs text-charcoal-600 space-y-1 shadow-sm">
              <p className="flex items-center gap-1.5 font-bold text-charcoal-950">
                <Info className="w-4 h-4 text-charcoal-700" />
                <span>Network Intelligence</span>
              </p>
              <p className="text-[11px] text-charcoal-500 leading-relaxed">
                Click any node, link, or suspect below to inspect forensics, or trace evidential connections.
              </p>
            </div>
          )}

          {/* Suspect Roster List (Case-aware) */}
          <div className="flex-1 glass-panel rounded-3xl p-4 overflow-y-auto space-y-2 shadow-md">
            <h4 className="text-[10px] font-mono font-extrabold uppercase text-charcoal-700 tracking-wider border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>{caseScope === 'all' ? 'Key Syndicate Targets' : 'Case Targets & Operatives'} ({suspectRoster.length})</span>
              <span className="text-[9px] text-charcoal-400 font-normal">Click to Inspect</span>
            </h4>
            <div className="space-y-1.5">
              {suspectRoster.map((suspect) => (
                <div
                  key={suspect.id}
                  onClick={() => handleSelectSuspect(suspect)}
                  className={`p-2.5 rounded-2xl border text-xs cursor-pointer transition flex items-center justify-between ${
                    (selectedNode?.id === suspect.id || selectedNode?.entityId === suspect.id)
                      ? 'bg-charcoal-900 border-charcoal-900 text-white font-bold shadow-sm'
                      : 'bg-white border-slate-200 text-charcoal-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="truncate">
                    <p className="font-bold truncate">{suspect.name}</p>
                    <p className={`text-[10px] truncate ${(selectedNode?.id === suspect.id || selectedNode?.entityId === suspect.id) ? 'text-slate-300' : 'text-charcoal-500'}`}>
                      {suspect.role} · {suspect.jurisdiction}
                    </p>
                  </div>
                  {suspect.risk && (
                    <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 ml-1.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Shortest Path Evidential Resolver */}
          <div className="p-4 rounded-3xl glass-panel space-y-2.5 shadow-md text-xs">
            <h4 className="text-xs font-bold text-charcoal-950 flex items-center gap-1.5">
              <Route className="w-3.5 h-3.5 text-charcoal-700" />
              <span>Evidential Path Finder</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[11px] text-charcoal-900 font-bold outline-none cursor-pointer"
              >
                {(filteredElements.nodes.length > 0 ? filteredElements.nodes : graphData.nodes).map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label || n.id}
                  </option>
                ))}
              </select>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl p-2 text-[11px] text-charcoal-900 font-bold outline-none cursor-pointer"
              >
                {(filteredElements.nodes.length > 0 ? filteredElements.nodes : graphData.nodes).map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label || n.id}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleFindPath}
              className="w-full py-2 bg-charcoal-900 hover:bg-charcoal-800 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Trace Connection
            </button>
            {pathResult && (
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[10px] space-y-1">
                {pathResult.found ? (
                  <p className="font-mono text-charcoal-800 font-bold leading-relaxed">
                    🔗 {pathResult.path.join(' ➔ ')}
                  </p>
                ) : (
                  <p className="text-charcoal-500">No evidential link found between selected nodes.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
