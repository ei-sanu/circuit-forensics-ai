'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  ShieldAlert,
  Phone,
  Car,
  MapPin,
  Building,
  Calendar,
  User,
  ExternalLink,
  X,
  Filter,
  Download,
  ArrowRight,
  CreditCard,
  Radio,
  FileSpreadsheet,
  AlertTriangle,
  Layers,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { EntitiesSkeleton } from '@/components/ui/Skeleton';
import {
  MASTER_ENTITIES,
  MASTER_TRANSACTIONS,
  MASTER_COMMUNICATIONS,
  MASTER_VEHICLES,
  MASTER_CASES,
  EntityRecord,
} from '@/lib/data';

const TYPE_ICONS: Record<string, any> = {
  person: User,
  organization: Building,
  phone: Phone,
  vehicle: Car,
  location: MapPin,
  event: Calendar,
};

export default function EntitiesPage() {
  const [entities, setEntities] = useState<EntityRecord[]>(MASTER_ENTITIES);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'influence' | 'name' | 'id'>('influence');
  const [selectedEntity, setSelectedEntity] = useState<EntityRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEntity, setNewEntity] = useState({
    entityId: '',
    type: 'person' as const,
    label: '',
    aliases: '',
    riskFlag: true,
    designation: '',
    jurisdiction: '',
    extraDetail: '',
  });

  const loadEntities = async () => {
    try {
      const data = await api.getEntities();
      if (data && Array.isArray(data) && data.length > 0) {
        // Merge API data with MASTER_ENTITIES so rich properties & linkages are retained
        const merged = [...MASTER_ENTITIES];
        data.forEach((apiItem: any) => {
          if (!merged.some((m) => m.entityId === apiItem.entityId)) {
            merged.push({
              ...apiItem,
              riskScore: apiItem.riskScore || (apiItem.riskFlag ? 85 : 30),
              connectedEntities: apiItem.connectedEntities || [],
            });
          }
        });
        setEntities(merged);
      } else {
        setEntities(MASTER_ENTITIES);
      }
    } catch (err) {
      console.warn('Using master connected entity registry:', err);
      setEntities(MASTER_ENTITIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntities();
  }, []);

  const [page, setPage] = useState(1);
  const pageSize = 20;

  const filteredEntities = useMemo(() => {
    return entities
      .filter((e) => {
        const matchesType = selectedType === 'all' || e.type === selectedType;
        const matchesFlag = !flaggedOnly || e.riskFlag;
        const q = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !q ||
          e.label?.toLowerCase().includes(q) ||
          e.entityId?.toLowerCase().includes(q) ||
          (Array.isArray(e.aliases) && e.aliases.some((a: string) => a.toLowerCase().includes(q))) ||
          (e.properties && JSON.stringify(e.properties).toLowerCase().includes(q));
        return matchesType && matchesFlag && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'influence') return (b.influenceScore || 0) - (a.influenceScore || 0);
        if (sortBy === 'name') return (a.label || '').localeCompare(b.label || '');
        return (a.entityId || '').localeCompare(b.entityId || '');
      });
  }, [entities, selectedType, searchQuery, flaggedOnly, sortBy]);

  const totalPages = Math.ceil(filteredEntities.length / pageSize) || 1;

  const paginatedEntities = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredEntities.slice(start, start + pageSize);
  }, [filteredEntities, page, pageSize]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [selectedType, searchQuery, flaggedOnly, sortBy]);

  // Telemetry linkages for the selected entity
  const entityLinkages = useMemo(() => {
    if (!selectedEntity) return null;
    const eid = selectedEntity.entityId;

    const transactions = MASTER_TRANSACTIONS.filter(
      (tx) => tx.fromId === eid || tx.toId === eid
    );
    const communications = MASTER_COMMUNICATIONS.filter(
      (c) =>
        c.callerId === eid ||
        c.recipientId === eid ||
        c.callerPhone === selectedEntity.properties?.phone ||
        c.recipientPhone === selectedEntity.properties?.phone
    );
    const vehicles = MASTER_VEHICLES.filter(
      (v) => v.ownerId === eid || v.vehicleId === eid
    );
    const cases = MASTER_CASES.filter(
      (c) => c.entityIds?.includes(eid) || selectedEntity.cases?.includes(c.caseNumber)
    );

    return { transactions, communications, vehicles, cases };
  }, [selectedEntity]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId =
      newEntity.entityId ||
      `${newEntity.type[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const entityPayload: EntityRecord = {
      entityId: generatedId,
      type: newEntity.type,
      label: newEntity.label,
      aliases: newEntity.aliases
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean),
      riskFlag: newEntity.riskFlag,
      influenceScore: newEntity.riskFlag ? 85.0 : 45.0,
      riskScore: newEntity.riskFlag ? 88.0 : 25.0,
      cases: ['CR-2026-00124'],
      properties: {
        designation: newEntity.designation,
        jurisdiction: newEntity.jurisdiction,
        type: newEntity.extraDetail,
      },
      connectedEntities: [],
    };

    try {
      await api.createEntity(entityPayload);
    } catch (err) {
      console.warn('Stored locally in session registry');
    }

    setEntities((prev) => [entityPayload, ...prev]);
    setShowCreateModal(false);
    setNewEntity({
      entityId: '',
      type: 'person',
      label: '',
      aliases: '',
      riskFlag: true,
      designation: '',
      jurisdiction: '',
      extraDetail: '',
    });
  };

  const exportCSV = () => {
    const headers = ['Entity ID', 'Type', 'Label', 'Aliases', 'Influence Score', 'Risk Score', 'Flagged', 'Jurisdiction', 'Designation'];
    const rows = filteredEntities.map((e) => [
      `"${e.entityId}"`,
      `"${e.type}"`,
      `"${e.label.replace(/"/g, '""')}"`,
      `"${(e.aliases || []).join(', ')}"`,
      e.influenceScore || 0,
      e.riskScore || 0,
      e.riskFlag ? 'YES' : 'NO',
      `"${e.properties?.jurisdiction || ''}"`,
      `"${e.properties?.designation || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `circuit_entities_registry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const types = ['all', 'person', 'organization', 'phone', 'vehicle', 'location'];

  return (
    <div className="space-y-6 text-charcoal-900 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-charcoal-800" />
            <span>Entity Registry & Profiles</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Master database of suspects, front companies, burner phones, transit vehicles, and financial conduits.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={exportCSV}
            className="px-4 py-2.5 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-charcoal-700" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 text-xs font-bold flex items-center gap-2 shadow-md shadow-charcoal-900/15 transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-beige-300" />
            <span>Register Entity</span>
          </button>
        </div>
      </div>

      {/* Biometric & Suspect Registry Ribbon */}
      <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-950 via-slate-900 to-charcoal-900 text-white flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono shadow-sm border border-cyan-800/40">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-bold text-cyan-300 tracking-wider">CENTRAL SUSPECT & BIOMETRIC INTELLIGENCE REGISTRY</span>
          <span className="text-slate-400 hidden sm:inline">• KYC & MULTI-ALIAS CROSS-INDEX</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300 text-[10px]">
          <span>INDEXED TARGETS: <strong className="text-white font-bold">{entities.length}</strong></span>
          <span className="hidden sm:inline">BIOMETRIC MATCH: <strong className="text-cyan-300 font-bold">1:1 IRIS & FACE MESH</strong></span>
          <span className="hidden md:inline">INTERPOL RED NOTICE: <strong className="text-emerald-300 font-bold">CROSS-CHECKED</strong></span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-3xl glass-panel flex flex-wrap items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {types.map((t) => {
            const count = entities.filter((e) => (t === 'all' ? true : e.type === t)).length;
            return (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-4 py-2 rounded-full capitalize font-semibold transition cursor-pointer flex items-center gap-2 ${
                  selectedType === t
                    ? 'bg-charcoal-900 text-beige-100 shadow-sm'
                    : 'bg-white text-charcoal-700 hover:text-charcoal-950 border border-beige-300'
                }`}
              >
                <span>{t}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    selectedType === t ? 'bg-charcoal-800 text-beige-200' : 'bg-beige-200 text-charcoal-800'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Flagged filter toggle */}
          <button
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              flaggedOnly
                ? 'bg-red-500 text-white border-red-600 shadow-sm'
                : 'bg-white text-charcoal-700 border-beige-300 hover:border-charcoal-400'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Flagged Only</span>
          </button>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-800 font-medium outline-none cursor-pointer"
          >
            <option value="influence">Sort by Influence</option>
            <option value="name">Sort by Name</option>
            <option value="id">Sort by ID</option>
          </select>

          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, ID, alias, PAN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-xs text-charcoal-900 outline-none shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Entities Table */}
      {loading ? (
        <EntitiesSkeleton />
      ) : (
        <div className="glass-panel rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-beige-300 bg-white/60 text-charcoal-600 font-mono font-bold">
                  <th className="p-4 font-semibold">Entity Label / Name</th>
                  <th className="p-4 font-semibold">Canonical ID</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Known Aliases / Designation</th>
                  <th className="p-4 font-semibold">Influence Score</th>
                  <th className="p-4 font-semibold">Threat Level</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {paginatedEntities.map((e) => {
                  const Icon = TYPE_ICONS[e.type] || User;
                  return (
                    <tr
                      key={e.entityId}
                      onClick={() => setSelectedEntity(e)}
                      className="hover:bg-white/80 transition cursor-pointer"
                    >
                      <td className="p-4 font-medium text-charcoal-950">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-2xl bg-charcoal-900 text-beige-200 shrink-0 shadow-sm">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-charcoal-950 text-sm block">{e.label}</span>
                            {e.properties?.designation && (
                              <span className="text-[10px] text-charcoal-500">{e.properties.designation}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-charcoal-700 font-bold">{e.entityId}</td>
                      <td className="p-4 capitalize text-charcoal-700 font-medium">
                        <span className="px-2.5 py-1 rounded-full bg-white border border-beige-300 text-[11px]">
                          {e.type}
                        </span>
                      </td>
                      <td className="p-4 text-charcoal-600 max-w-xs truncate">
                        {e.aliases && e.aliases.length > 0 ? (
                          <span className="font-mono text-charcoal-800">{e.aliases.join(', ')}</span>
                        ) : e.properties?.jurisdiction ? (
                          <span>{e.properties.jurisdiction}</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-charcoal-950">{e.influenceScore || 75}</span>
                          <div className="w-16 bg-beige-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-charcoal-900 h-full rounded-full"
                              style={{ width: `${Math.min(100, e.influenceScore || 75)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {e.riskFlag ? (
                          <span className="px-3 py-1 rounded-full text-[10px] bg-red-100 text-red-700 border border-red-200 font-bold flex items-center gap-1.5 w-fit">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Flagged Target</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium">
                            Clear / Verified
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(evt) => {
                            evt.stopPropagation();
                            setSelectedEntity(e);
                          }}
                          className="px-3 py-1.5 rounded-full bg-white hover:bg-beige-100 border border-beige-300 text-charcoal-900 font-semibold text-[11px] inline-flex items-center gap-1 shadow-sm transition cursor-pointer"
                        >
                          <span>View Profile</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-beige-200 bg-white/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-charcoal-600 font-medium">
              Showing <span className="font-bold text-charcoal-950 font-mono">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-bold text-charcoal-950 font-mono">{Math.min(page * pageSize, filteredEntities.length)}</span> of{' '}
              <span className="font-bold text-charcoal-950 font-mono">{filteredEntities.length}</span> entities
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-xl border border-beige-300 bg-white hover:bg-beige-100 text-charcoal-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1 transition"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="flex items-center gap-1 font-mono text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-charcoal-900 text-beige-100 font-bold">{page}</span>
                <span className="text-charcoal-400">/</span>
                <span className="px-2 py-1 text-charcoal-700">{totalPages}</span>
              </div>

              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-xl border border-beige-300 bg-white hover:bg-beige-100 text-charcoal-800 disabled:opacity-40 disabled:cursor-not-allowed font-medium flex items-center gap-1 transition"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entity Profile Drawer / Modal with Interconnected Links */}
      {selectedEntity && (
        <div className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-white/95 border border-beige-300 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-7 shadow-2xl space-y-5 animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-beige-300 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3.5 rounded-2xl bg-charcoal-900 text-beige-100 shadow-md">
                  {React.createElement(TYPE_ICONS[selectedEntity.type] || User, { className: 'w-6 h-6 text-beige-200' })}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-charcoal-950">{selectedEntity.label}</h3>
                    {selectedEntity.riskFlag && (
                      <span className="px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200 text-[10px] font-bold">
                        HIGH RISK
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-charcoal-500">
                    {selectedEntity.entityId} • <span className="capitalize">{selectedEntity.type}</span>
                    {selectedEntity.properties?.jurisdiction && ` • ${selectedEntity.properties.jurisdiction}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEntity(null)}
                className="p-2 rounded-full hover:bg-beige-200 text-charcoal-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Badges */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-beige-300">
                <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Influence Score</span>
                <span className="font-bold font-mono text-lg text-charcoal-950">{selectedEntity.influenceScore || 75} / 100</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-beige-300">
                <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Risk Score</span>
                <span className="font-bold font-mono text-lg text-red-600">{selectedEntity.riskScore || 80} / 100</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-beige-300">
                <span className="text-[10px] font-mono text-charcoal-500 uppercase block">Associated Cases</span>
                <span className="font-bold font-mono text-lg text-charcoal-950">
                  {selectedEntity.cases?.length || 1}
                </span>
              </div>
            </div>

            {/* Dossier Attributes */}
            {selectedEntity.properties && (
              <div className="p-4 rounded-2xl bg-white border border-beige-300 text-xs space-y-1.5 font-mono">
                <span className="text-[10px] text-charcoal-500 uppercase font-bold block mb-1">Profile Telemetry & Identifiers</span>
                {Object.entries(selectedEntity.properties).map(([k, v]: [string, any]) => (
                  <div key={k} className="flex justify-between border-b border-beige-100 py-1 last:border-0">
                    <span className="text-charcoal-500 capitalize">{k}:</span>
                    <span className="font-bold text-charcoal-900">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Connected Entities in Network - Clicking one switches modal to that entity! */}
            {selectedEntity.connectedEntities && selectedEntity.connectedEntities.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-charcoal-900 flex items-center justify-between">
                  <span>Direct Graph Connections ({selectedEntity.connectedEntities.length})</span>
                  <span className="text-[10px] text-charcoal-500 font-normal">Click any node to inspect profile</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedEntity.connectedEntities.map((conn) => {
                    const targetObj = entities.find((ent) => ent.entityId === conn.entityId);
                    return (
                      <button
                        key={conn.entityId}
                        onClick={() => {
                          if (targetObj) {
                            setSelectedEntity(targetObj);
                          } else {
                            // Synthesize record if missing
                            setSelectedEntity({
                              entityId: conn.entityId,
                              label: conn.label,
                              type: (conn.type as any) || 'person',
                              aliases: [],
                              riskFlag: true,
                              influenceScore: 78,
                              riskScore: 75,
                              cases: ['CR-2026-00124'],
                              properties: { designation: conn.relationship },
                              connectedEntities: [],
                            });
                          }
                        }}
                        className="p-2.5 rounded-2xl bg-white hover:bg-beige-100 border border-beige-300 text-left flex items-center justify-between transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-xl bg-charcoal-900 text-beige-200">
                            {React.createElement(TYPE_ICONS[conn.type] || User, { className: 'w-3.5 h-3.5' })}
                          </div>
                          <div>
                            <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-950 block">
                              {conn.label}
                            </span>
                            <span className="text-[10px] font-mono text-charcoal-500 block capitalize">
                              {conn.relationship.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-charcoal-400 group-hover:text-charcoal-900 transition" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cross-Tab Linkages: Transactions, Calls, Vehicles */}
            {entityLinkages && (
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-bold text-charcoal-900">Interlinked Forensic Evidence</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  {/* Transactions Link */}
                  <Link
                    href={`/transactions`}
                    className="p-3 rounded-2xl bg-white border border-beige-300 hover:border-charcoal-800 transition flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between text-charcoal-600 mb-1">
                      <span className="font-semibold text-[11px]">Financial Flow</span>
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-base font-bold font-mono text-charcoal-950">
                        {entityLinkages.transactions.length}
                      </span>
                      <span className="text-[10px] text-charcoal-500 block">Ledger Records</span>
                    </div>
                  </Link>

                  {/* CDR Link */}
                  <Link
                    href={`/communications`}
                    className="p-3 rounded-2xl bg-white border border-beige-300 hover:border-charcoal-800 transition flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between text-charcoal-600 mb-1">
                      <span className="font-semibold text-[11px]">CDR Intercepts</span>
                      <Radio className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-base font-bold font-mono text-charcoal-950">
                        {entityLinkages.communications.length}
                      </span>
                      <span className="text-[10px] text-charcoal-500 block">Phone Calls / SMS</span>
                    </div>
                  </Link>

                  {/* Vehicles Link */}
                  <Link
                    href={`/vehicles`}
                    className="p-3 rounded-2xl bg-white border border-beige-300 hover:border-charcoal-800 transition flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between text-charcoal-600 mb-1">
                      <span className="font-semibold text-[11px]">Vehicle Intel</span>
                      <Car className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="text-base font-bold font-mono text-charcoal-950">
                        {entityLinkages.vehicles.length}
                      </span>
                      <span className="text-[10px] text-charcoal-500 block">Toll Sightings</span>
                    </div>
                  </Link>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-3 border-t border-beige-300">
              <Link
                href={`/copilot`}
                className="text-xs font-semibold text-charcoal-700 hover:text-charcoal-950 flex items-center gap-1.5"
              >
                <span>Ask Copilot about {selectedEntity.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedEntity(null)}
                className="px-5 py-2.5 rounded-full bg-charcoal-900 text-beige-100 hover:bg-charcoal-800 font-bold text-xs shadow-md transition cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register Entity Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-charcoal-950/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel bg-white/95 border border-beige-300 rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-4 animate-scale-in">
            <h3 className="text-base font-bold text-charcoal-950">Register Verified Entity</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Entity Category</label>
                <select
                  value={newEntity.type}
                  onChange={(e) => setNewEntity({ ...newEntity, type: e.target.value as any })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm cursor-pointer"
                >
                  <option value="person">Person (Suspect / Associate)</option>
                  <option value="organization">Organization / Shell Company</option>
                  <option value="phone">Burner Phone Number</option>
                  <option value="vehicle">Transit Vehicle</option>
                  <option value="location">Safehouse / Transit Hub</option>
                </select>
              </div>

              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Canonical ID (Optional, Auto-Generated)</label>
                <input
                  type="text"
                  placeholder="e.g. P-0099 or PH-0044"
                  value={newEntity.entityId}
                  onChange={(e) => setNewEntity({ ...newEntity, entityId: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Primary Label / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Verma"
                  value={newEntity.label}
                  onChange={(e) => setNewEntity({ ...newEntity, label: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Aliases (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Vicky, VV"
                  value={newEntity.aliases}
                  onChange={(e) => setNewEntity({ ...newEntity, aliases: e.target.value })}
                  className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-charcoal-700 mb-1 font-medium">Designation / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Hawala Courier"
                    value={newEntity.designation}
                    onChange={(e) => setNewEntity({ ...newEntity, designation: e.target.value })}
                    className="w-full p-2 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-charcoal-700 mb-1 font-medium">Jurisdiction / City</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai South"
                    value={newEntity.jurisdiction}
                    onChange={(e) => setNewEntity({ ...newEntity, jurisdiction: e.target.value })}
                    className="w-full p-2 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input
                  type="checkbox"
                  id="riskFlag"
                  checked={newEntity.riskFlag}
                  onChange={(e) => setNewEntity({ ...newEntity, riskFlag: e.target.checked })}
                  className="rounded w-4 h-4 text-charcoal-900 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="riskFlag" className="text-charcoal-700 font-medium cursor-pointer">
                  Flag as High-Risk Target / Prior Record
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 rounded-full bg-white text-charcoal-700 hover:bg-beige-100 border border-beige-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold shadow-md shadow-charcoal-900/15 transition cursor-pointer"
                >
                  Save Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
