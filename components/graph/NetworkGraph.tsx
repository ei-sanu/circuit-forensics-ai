'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import cytoscape from 'cytoscape';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  ShieldAlert,
  Activity,
  Layers,
  Crosshair,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  X,
  Compass,
  Sun,
  Moon,
  RotateCw,
} from 'lucide-react';
import { audioAlert } from '@/lib/audioAlert';

interface NetworkGraphProps {
  elements: {
    nodes: Array<{ id: string; label: string; entity_type?: string; type?: string; risk_flag?: boolean; risk?: boolean; properties?: any }>;
    edges: Array<{ source: string; target: string; rel_type: string; count?: number; total_amount?: number; confidence?: number; properties?: any }>;
  };
  selectedNodeId?: string;
  onSelectNode?: (nodeId: string, nodeData: any) => void;
  onSelectEdge?: (edgeData: any) => void;
  highlightedPath?: string[];
  colorBy?: 'risk' | 'community' | 'type';
  communityMap?: Record<string, number>;
}

// Vibrant Category Configuration
const TYPE_CONFIG: Record<string, { color: string; neonGlow: string; borderColor: string; label: string }> = {
  person: { color: '#0284c7', neonGlow: '#38bdf8', borderColor: '#7dd3fc', label: 'Person / Suspect' },
  organization: { color: '#d97706', neonGlow: '#fbbf24', borderColor: '#fde68a', label: 'Shell Enterprise' },
  phone: { color: '#059669', neonGlow: '#34d399', borderColor: '#a7f3d0', label: 'Burner Phone' },
  vehicle: { color: '#ea580c', neonGlow: '#fb923c', borderColor: '#fed7aa', label: 'Transit Vehicle' },
  location: { color: '#7c3aed', neonGlow: '#c084fc', borderColor: '#e9d5ff', label: 'Safehouse Location' },
  event: { color: '#db2777', neonGlow: '#f472b6', borderColor: '#fbcfe8', label: 'Incident / Event' },
};

// Distinct Edge Line Colors based on relationship type
const EDGE_TYPE_COLORS: Record<string, string> = {
  communicated_with: '#10b981',
  called: '#10b981',
  uses_phone: '#10b981',
  transferred_money_to: '#f59e0b',
  associated_with: '#38bdf8',
  associate_of: '#38bdf8',
  employed_by: '#a855f7',
  director_of: '#a855f7',
  owns: '#f97316',
  drives_vehicle: '#f97316',
  visited: '#ec4899',
  visited_location: '#ec4899',
  traveled_with: '#fb923c',
  attended: '#06b6d4',
  linked_to: '#94a3b8',
};

// Safe URI-encoded SVG Icons for crisp canvas rendering
const makeSvgUri = (svgStr: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;

const TYPE_ICONS_SVG: Record<string, string> = {
  person: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'),
  organization: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>'),
  phone: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>'),
  vehicle: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>'),
  location: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'),
  event: makeSvgUri('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>'),
};

const COMMUNITY_PALETTE = ['#0284c7', '#059669', '#d97706', '#7c3aed', '#db2777', '#ea580c', '#0d9488'];

export function NetworkGraph({
  elements,
  selectedNodeId,
  onSelectNode,
  onSelectEdge,
  highlightedPath,
  colorBy = 'type',
  communityMap = {},
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const currentLayoutRef = useRef<cytoscape.Layouts | null>(null);
  const isMountedRef = useRef(true);
  const isInitialMountRef = useRef(true);

  // Keep latest callbacks in refs to avoid recreating event listeners or tearing down cy
  const onSelectNodeRef = useRef(onSelectNode);
  onSelectNodeRef.current = onSelectNode;
  const onSelectEdgeRef = useRef(onSelectEdge);
  onSelectEdgeRef.current = onSelectEdge;

  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'circle' | 'breadthfirst' | 'grid'>('cose');
  const [selectedNodeData, setSelectedNodeData] = useState<any>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(soundEnabled);
  soundEnabledRef.current = soundEnabled;

  const [canvasTheme, setCanvasTheme] = useState<'dark' | 'light'>('dark');
  const [radarActive, setRadarActive] = useState(true);

  // Layout configuration generator with generous node separation & physics
  const getLayoutConfig = useCallback((name: string) => {
    switch (name) {
      case 'concentric':
        return {
          name: 'concentric',
          animate: true,
          animationDuration: 600,
          fit: true,
          padding: 60,
          minNodeSpacing: 80,
          spacingFactor: 1.6,
          concentric: (node: any) => (node.data('risk') ? 2 : 1),
          levelWidth: () => 1,
        };
      case 'circle':
        return {
          name: 'circle',
          animate: true,
          animationDuration: 600,
          fit: true,
          padding: 60,
          spacingFactor: 1.6,
        };
      case 'breadthfirst':
        return {
          name: 'breadthfirst',
          animate: true,
          animationDuration: 600,
          directed: true,
          fit: true,
          padding: 60,
          spacingFactor: 1.6,
        };
      case 'grid':
        return {
          name: 'grid',
          animate: true,
          animationDuration: 600,
          fit: true,
          padding: 60,
          spacingFactor: 1.6,
        };
      case 'cose':
      default:
        return {
          name: 'cose',
          animate: true,
          animationDuration: 700,
          refresh: 20,
          fit: true,
          padding: 60,
          randomize: false,
          nodeRepulsion: 750000,
          idealEdgeLength: 160,
          edgeElasticity: 100,
          nestingFactor: 5,
          gravity: 0.25,
          numIter: 1000,
          initialTemp: 200,
          coolingFactor: 0.95,
          minTemp: 1.0,
        };
    }
  }, []);

  // Helper to build formatted Cytoscape element definitions with geometric initial spread
  const formatCytoscapeElements = useCallback((
    nodes: typeof elements.nodes,
    edges: typeof elements.edges,
    activeColorBy: 'risk' | 'community' | 'type',
    cMap: Record<string, number>
  ) => {
    const nodeCount = (nodes || []).length || 1;
    const baseRadius = Math.max(180, nodeCount * 24);

    const cyNodes = (nodes || []).map((n, idx) => {
      const commId = cMap[n.id] ?? 0;
      const typeKey = (n.entity_type || n.type || 'person').toLowerCase();
      const typeCfg = TYPE_CONFIG[typeKey] || TYPE_CONFIG.person;
      const iconSvg = TYPE_ICONS_SVG[typeKey] || TYPE_ICONS_SVG.person;
      const isRisk = Boolean(n.risk_flag ?? n.risk);

      let nodeColor = typeCfg.color;
      let borderColor = isRisk ? '#ef4444' : typeCfg.borderColor;
      let borderWidth = isRisk ? 3.5 : 2.5;

      if (activeColorBy === 'community') {
        nodeColor = COMMUNITY_PALETTE[commId % COMMUNITY_PALETTE.length];
        borderColor = '#ffffff';
      } else if (activeColorBy === 'risk') {
        if (isRisk) {
          nodeColor = '#dc2626';
          borderColor = '#fca5a5';
          borderWidth = 3.5;
        } else {
          nodeColor = '#059669';
          borderColor = '#6ee7b7';
          borderWidth = 2.5;
        }
      }

      // Pre-position in a wide circle so nodes NEVER clump at (0, 0)
      const angle = (2 * Math.PI * idx) / nodeCount;
      const posX = 400 + baseRadius * Math.cos(angle);
      const posY = 350 + baseRadius * Math.sin(angle);

      return {
        data: {
          id: String(n.id),
          label: n.label || String(n.id),
          type: typeKey,
          risk: isRisk,
          color: nodeColor,
          borderColor,
          borderWidth,
          bgImage: iconSvg,
          raw: n,
        },
        position: { x: posX, y: posY },
      };
    });

    const cyEdges = (edges || []).map((e, idx) => {
      const relKey = (e.rel_type || 'associated_with').toLowerCase().replace(/ /g, '_');
      const edgeColor = EDGE_TYPE_COLORS[relKey] || '#38bdf8';

      return {
        data: {
          id: `e_${e.source}_${e.target}_${idx}`,
          source: String(e.source),
          target: String(e.target),
          label: (e.rel_type || 'linked').replace(/_/g, ' '),
          count: e.count || 1,
          amount: e.total_amount || 0,
          lineColor: edgeColor,
          raw: e,
        },
      };
    });

    return [...cyNodes, ...cyEdges];
  }, []);

  // Cytoscape Style Generator based on Canvas Theme
  const getCytoscapeStyles = useCallback((theme: 'dark' | 'light'): any[] => {
    const isDark = theme === 'dark';
    const labelBgColor = isDark ? '#070b14' : '#ffffff';
    const labelTextColor = isDark ? '#ffffff' : '#0f172a';
    const edgeLabelColor = isDark ? '#f1f5f9' : '#0f172a';
    const edgeLabelBg = isDark ? '#070b14' : '#ffffff';

    return [
      {
        selector: 'node',
        style: {
          'background-color': 'data(color)',
          'background-image': 'data(bgImage)',
          'background-fit': 'contain',
          'background-width': '20px',
          'background-height': '20px',
          'background-clip': 'node',
          'background-position-x': '50%',
          'background-position-y': '50%',
          label: 'data(label)',
          color: labelTextColor,
          'font-size': '11px',
          'font-weight': 'bold',
          'font-family': 'ui-sans-serif, system-ui, -apple-system, sans-serif',
          'text-valign': 'bottom',
          'text-margin-y': 8,
          'text-max-width': '130px',
          'text-wrap': 'ellipsis',
          'text-background-color': labelBgColor,
          'text-background-opacity': 0.95,
          'text-background-padding': '4px',
          'text-background-shape': 'roundrectangle',
          'text-border-color': 'data(borderColor)',
          'text-border-width': 1.5,
          'text-border-opacity': 0.85,
          width: 40,
          height: 40,
          'border-width': 'data(borderWidth)' as any,
          'border-color': 'data(borderColor)',
          'overlay-opacity': 0,
          'transition-property': 'background-color, border-color, width, height',
          'transition-duration': 0.2,
        } as any,
      },
      {
        selector: 'node:selected',
        style: {
          'border-color': isDark ? '#ffffff' : '#0284c7',
          'border-width': 4.5,
          width: 48,
          height: 48,
          'overlay-color': '#38bdf8',
          'overlay-opacity': 0.35,
          'overlay-padding': 6,
        },
      },
      {
        selector: 'edge',
        style: {
          width: 2.5,
          'line-color': 'data(lineColor)',
          'line-opacity': 0.88,
          'line-style': 'solid',
          'target-arrow-color': 'data(lineColor)',
          'target-arrow-shape': 'triangle',
          'arrow-scale': 1.25,
          'curve-style': 'bezier',
          'control-point-step-size': 40,
          label: 'data(label)',
          'font-size': '9.5px',
          'font-weight': 'bold',
          'font-family': 'ui-monospace, monospace',
          color: edgeLabelColor,
          'text-rotation': 'autorotate',
          'text-margin-y': -8,
          'text-background-color': edgeLabelBg,
          'text-background-opacity': 0.92,
          'text-background-padding': '3px',
          'text-background-shape': 'roundrectangle',
          'text-border-color': 'data(lineColor)',
          'text-border-width': 1,
          'text-border-opacity': 0.6,
          'overlay-opacity': 0,
          opacity: isDark ? 0.8 : 0.9,
        } as any,
      },
      {
        selector: 'edge:selected',
        style: {
          width: 4,
          'line-color': '#38bdf8',
          'target-arrow-color': '#38bdf8',
          opacity: 1,
        },
      },
      {
        selector: '.highlighted',
        style: {
          'line-color': '#ef4444',
          'target-arrow-color': '#ef4444',
          'border-color': '#ef4444',
          'border-width': 5,
          width: 48,
          height: 48,
          'overlay-color': '#ef4444',
          'overlay-opacity': 0.45,
          'overlay-padding': 6,
        },
      },
      {
        selector: '.faded',
        style: {
          opacity: 0.15,
        },
      },
    ];
  }, []);

  // 1. Initialize Cytoscape ONCE on component mount with ResizeObserver
  useEffect(() => {
    isMountedRef.current = true;
    if (!containerRef.current) return;

    let cyInstance: cytoscape.Core | null = null;
    let ro: ResizeObserver | null = null;
    let timer: NodeJS.Timeout | null = null;

    try {
      const initialEles = formatCytoscapeElements(
        elements.nodes,
        elements.edges,
        colorBy,
        communityMap
      );

      cyInstance = cytoscape({
        container: containerRef.current,
        elements: initialEles,
        style: getCytoscapeStyles(canvasTheme),
        layout: getLayoutConfig(layoutName) as any,
      });

      // Stable tap handlers
      cyInstance.on('tap', 'node', (evt) => {
        try {
          if (!isMountedRef.current || !cyRef.current || cyRef.current.destroyed()) return;
          const node = evt.target;
          const raw = node.data('raw');
          setSelectedNodeData(raw);
          if (soundEnabledRef.current) audioAlert.playRadarPing();
          onSelectNodeRef.current?.(node.id(), raw);
        } catch (err) {
          console.warn('Node tap error:', err);
        }
      });

      cyInstance.on('tap', 'edge', (evt) => {
        try {
          if (!isMountedRef.current || !cyRef.current || cyRef.current.destroyed()) return;
          const edge = evt.target;
          if (soundEnabledRef.current) audioAlert.playRadarPing();
          onSelectEdgeRef.current?.(edge.data('raw'));
        } catch (err) {
          console.warn('Edge tap error:', err);
        }
      });

      cyInstance.on('dbltap', 'node', (evt) => {
        try {
          if (!isMountedRef.current || !cyRef.current || cyRef.current.destroyed()) return;
          const node = evt.target;
          const neighborhood = node.neighborhood().add(node);
          cyInstance?.elements().addClass('faded');
          neighborhood.removeClass('faded');
          cyInstance?.fit(neighborhood, 60);
          if (soundEnabledRef.current) audioAlert.playRadarPing();
        } catch (err) {
          console.warn('Double tap error:', err);
        }
      });

      cyInstance.on('tap', (evt) => {
        try {
          if (!isMountedRef.current || !cyRef.current || cyRef.current.destroyed()) return;
          if (evt.target === cyInstance) {
            cyInstance?.elements().removeClass('faded');
            setSelectedNodeData(null);
          }
        } catch (err) {}
      });

      cyRef.current = cyInstance;

      // Ensure layout runs and fits container dimensions
      const layout = cyInstance.layout(getLayoutConfig(layoutName) as any);
      currentLayoutRef.current = layout;
      layout.run();

      // Post-mount resize check ensuring canvas coordinates match CSS bounds
      timer = setTimeout(() => {
        try {
          if (isMountedRef.current && cyRef.current && !cyRef.current.destroyed()) {
            cyRef.current.resize();
            cyRef.current.fit(undefined, 60);
          }
        } catch (e) {}
      }, 150);

      // ResizeObserver to automatically resize and fit when drawer or window changes
      ro = new ResizeObserver(() => {
        try {
          if (isMountedRef.current && cyRef.current && !cyRef.current.destroyed()) {
            cyRef.current.resize();
          }
        } catch (e) {}
      });
      if (containerRef.current) {
        ro.observe(containerRef.current);
      }
    } catch (err) {
      console.error('Cytoscape init error:', err);
    }

    return () => {
      isMountedRef.current = false;
      if (timer) clearTimeout(timer);
      if (ro) ro.disconnect();
      if (currentLayoutRef.current) {
        try {
          currentLayoutRef.current.stop();
        } catch (e) {}
        currentLayoutRef.current = null;
      }
      if (cyRef.current) {
        try {
          const cy = cyRef.current;
          cyRef.current = null;
          if (!cy.destroyed()) {
            cy.stop(true, true);
            cy.removeAllListeners();
            cy.destroy();
          }
        } catch (err) {}
      }
    };
  }, []); // Run only once on mount

  // 2. Update styles when canvasTheme changes
  useEffect(() => {
    try {
      const cy = cyRef.current;
      if (!isMountedRef.current || !cy || cy.destroyed()) return;
      cy.style(getCytoscapeStyles(canvasTheme));
    } catch (e) {}
  }, [canvasTheme, getCytoscapeStyles]);

  // 3. Safely sync elements & styling in-place with layout (only on actual updates after mount)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }

    try {
      const cy = cyRef.current;
      if (!isMountedRef.current || !cy || cy.destroyed()) return;

      if (currentLayoutRef.current) {
        try {
          currentLayoutRef.current.stop();
        } catch (e) {}
        currentLayoutRef.current = null;
      }
      cy.stop(true, true);

      const nextEles = formatCytoscapeElements(
        elements.nodes,
        elements.edges,
        colorBy,
        communityMap
      );

      cy.batch(() => {
        cy.elements().remove();
        cy.add(nextEles);
      });

      const layout = cy.layout(getLayoutConfig(layoutName) as any);
      currentLayoutRef.current = layout;
      layout.run();
    } catch (err) {
      console.warn('Error updating Cytoscape elements:', err);
    }
  }, [elements, colorBy, communityMap, layoutName, formatCytoscapeElements, getLayoutConfig]);

  // 4. Handle Focus on external selectedNodeId
  useEffect(() => {
    try {
      const cy = cyRef.current;
      if (!isMountedRef.current || !cy || cy.destroyed() || !selectedNodeId) return;

      const node = cy.getElementById(String(selectedNodeId));
      if (node && node.length > 0) {
        cy.elements().unselect();
        node.select();
        setSelectedNodeData(node.data('raw'));
        cy.center(node);
      }
    } catch (e) {
      console.warn('Could not focus selected node:', selectedNodeId, e);
    }
  }, [selectedNodeId]);

  // 5. Highlight Evidential Path
  useEffect(() => {
    try {
      const cy = cyRef.current;
      if (!isMountedRef.current || !cy || cy.destroyed()) return;

      cy.elements().removeClass('highlighted');
      if (!highlightedPath || highlightedPath.length === 0) return;

      highlightedPath.forEach((nodeId) => {
        try {
          const node = cy.getElementById(String(nodeId));
          if (node && node.length > 0) {
            node.addClass('highlighted');
          }
        } catch (e) {}
      });

      for (let i = 0; i < highlightedPath.length - 1; i++) {
        const u = String(highlightedPath[i]);
        const v = String(highlightedPath[i + 1]);
        try {
          cy.edges()
            .filter((e) => {
              const s = e.data('source');
              const t = e.data('target');
              return (s === u && t === v) || (s === v && t === u);
            })
            .addClass('highlighted');
        } catch (e) {}
      }
    } catch (err) {
      console.warn('Error during path highlight:', err);
    }
  }, [highlightedPath]);

  const handleZoomIn = () => {
    try {
      const cy = cyRef.current;
      if (!isMountedRef.current || !cy || cy.destroyed()) return;
      cy.zoom(cy.zoom() * 1.25);
      if (soundEnabledRef.current) audioAlert.playRadarPing();
    } catch (e) {}
  };

  const handleZoomOut = () => {
    try {
      const cy = cyRef.current;
      if (!isMountedRef.current || !cy || cy.destroyed()) return;
      cy.zoom(cy.zoom() * 0.8);
      if (soundEnabledRef.current) audioAlert.playRadarPing();
    } catch (e) {}
  };

  const handleFit = () => {
    try {
      const cy = cyRef.current;
      if (!isMountedRef.current || !cy || cy.destroyed()) return;
      cy.resize();
      cy.fit(undefined, 60);
      if (soundEnabledRef.current) audioAlert.playRadarPing();
    } catch (e) {}
  };

  const handleRerunLayout = () => {
    try {
      const cy = cyRef.current;
      if (!isMountedRef.current || !cy || cy.destroyed()) return;
      const layout = cy.layout(getLayoutConfig(layoutName) as any);
      layout.run();
      if (soundEnabledRef.current) audioAlert.playRadarPing();
    } catch (e) {}
  };

  const handleExportPNG = () => {
    try {
      const cy = cyRef.current;
      if (!isMountedRef.current || !cy || cy.destroyed()) return;
      const isDark = canvasTheme === 'dark';
      const png = cy.png({ full: true, bg: isDark ? '#0b0f19' : '#ffffff', scale: 2.5 });
      const link = document.createElement('a');
      link.href = png;
      link.download = `circuit-investigative-graph-${Date.now()}.png`;
      link.click();
      if (soundEnabledRef.current) audioAlert.playRadarPing();
    } catch (e) {
      console.error('Failed to export graph image:', e);
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioAlert.setSoundEnabled(next);
    if (next) audioAlert.playRadarPing();
  };

  const isDark = canvasTheme === 'dark';

  return (
    <div
      className={`relative w-full h-full rounded-3xl border transition-colors shadow-xl overflow-hidden select-none group ${
        isDark
          ? 'bg-[#0b0f19] border-sky-500/20 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
      }`}
    >
      {/* Background Matrix Grid Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${isDark ? 'opacity-40' : 'opacity-25'}`}
        style={{
          backgroundImage: isDark
            ? `
              radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.08) 0%, transparent 60%),
              linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
            `
            : `
              radial-gradient(circle at 50% 50%, rgba(2, 132, 199, 0.05) 0%, transparent 60%),
              linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)
            `,
          backgroundSize: '100% 100%, 36px 36px, 36px 36px',
        }}
      />

      {/* Futuristic Radar Sweep Ring (Dark mode) */}
      {isDark && radarActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-sky-500/10 pointer-events-none animate-pulse">
          <div className="absolute inset-4 rounded-full border border-sky-400/5" />
          <div className="absolute inset-16 rounded-full border border-sky-400/5" />
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-sky-500/10" />
          <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-sky-500/10" />
        </div>
      )}

      {/* Cyber Tactical Telemetry HUD */}
      <div
        className={`absolute top-4 right-4 z-10 pointer-events-none flex items-center gap-3 font-mono text-[10px] px-3.5 py-1.5 rounded-full border backdrop-blur-xl shadow-md ${
          isDark
            ? 'text-sky-400/90 bg-charcoal-950/80 border-sky-500/20'
            : 'text-slate-700 bg-white/90 border-slate-200'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Crosshair className={`w-3.5 h-3.5 animate-spin ${isDark ? 'text-sky-400' : 'text-sky-600'}`} style={{ animationDuration: '12s' }} />
          <span>CYBER-INTEL // MULTI-SPECTRAL MATRIX</span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <span className="text-emerald-600 font-bold">ONLINE</span>
      </div>

      {/* Cytoscape Canvas */}
      <div ref={containerRef} className="w-full h-full relative z-0" />

      {/* Floating Tactical HUD Toolbar with High Visibility Controls */}
      <div
        className={`absolute top-4 left-4 flex flex-wrap items-center gap-2 p-2 rounded-2xl border-2 shadow-2xl backdrop-blur-3xl z-10 ${
          isDark
            ? 'bg-charcoal-950/95 border-sky-500/50 text-white shadow-sky-950/50'
            : 'bg-white/98 border-slate-300 text-slate-900 shadow-slate-400/30'
        }`}
      >
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-charcoal-900 border-sky-500/30 hover:bg-sky-900/60 text-sky-200 hover:text-white'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-charcoal-900 border-sky-500/30 hover:bg-sky-900/60 text-sky-200 hover:text-white'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            title="Reset View / Fit All Nodes"
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-charcoal-900 border-sky-500/30 hover:bg-sky-900/60 text-sky-200 hover:text-white'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleRerunLayout}
            title="Recalculate & Re-spread Nodes"
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-charcoal-900 border-sky-500/30 hover:bg-sky-900/60 text-sky-200 hover:text-white'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <div className={`w-[1px] h-5 ${isDark ? 'bg-sky-500/40' : 'bg-slate-300'}`} />

        <select
          value={layoutName}
          onChange={(e) => {
            setLayoutName(e.target.value as any);
            if (soundEnabledRef.current) audioAlert.playRadarPing();
          }}
          className={`font-mono text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none shadow-sm cursor-pointer border ${
            isDark
              ? 'bg-charcoal-900 border-sky-500/40 text-sky-100'
              : 'bg-slate-100 border-slate-300 text-slate-900'
          }`}
        >
          <option value="cose">Force Matrix (COSE Physics)</option>
          <option value="concentric">Concentric Quantum Orbit</option>
          <option value="circle">Radial Neural Ring</option>
          <option value="breadthfirst">Syndicate Hierarchy Tree</option>
          <option value="grid">Orthogonal Grid</option>
        </select>

        <div className={`w-[1px] h-5 ${isDark ? 'bg-sky-500/40' : 'bg-slate-300'}`} />

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCanvasTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Switch to Pure White Canvas' : 'Switch to Cyber Dark Canvas'}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-charcoal-900 border-sky-500/30 hover:bg-sky-900/60 text-amber-300'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Radar Sound Effects Enabled' : 'Muted'}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isDark
                ? 'bg-charcoal-900 border-sky-500/30 hover:bg-sky-900/60 text-sky-200'
                : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-800'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        <div className={`w-[1px] h-5 ${isDark ? 'bg-sky-500/40' : 'bg-slate-300'}`} />

        {/* High-Visibility Prominent Save Image Button */}
        <button
          onClick={handleExportPNG}
          title="Save & Download High-Resolution Graph Image (PNG)"
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-extrabold text-xs font-mono transition flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 active:scale-95 border border-emerald-400/50"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>SAVE IMAGE (PNG)</span>
        </button>
      </div>

      {/* Target Telemetry Lock Reticle & Inspector Drawer */}
      {selectedNodeData && (
        <div
          className={`absolute bottom-4 right-4 max-w-sm w-full p-4 rounded-3xl border shadow-2xl backdrop-blur-2xl z-20 animate-scale-in space-y-3 ${
            isDark
              ? 'bg-charcoal-950/95 border-sky-500/40 text-white'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-300/40'
          }`}
        >
          <div className={`flex items-center justify-between border-b pb-2.5 ${isDark ? 'border-sky-500/20' : 'border-slate-100'}`}>
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl border flex items-center justify-center"
                style={{
                  backgroundColor: `${TYPE_CONFIG[(selectedNodeData.entity_type || selectedNodeData.type || 'person').toLowerCase()]?.color || '#0284c7'}33`,
                  borderColor: TYPE_CONFIG[(selectedNodeData.entity_type || selectedNodeData.type || 'person').toLowerCase()]?.neonGlow || '#38bdf8',
                }}
              >
                <Crosshair className="w-4 h-4 text-sky-500 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <div>
                <h4 className={`font-bold text-sm font-mono ${isDark ? 'text-white' : 'text-slate-950'}`}>{selectedNodeData.label || selectedNodeData.id}</h4>
                <p className="text-[10px] text-sky-500 font-mono uppercase">{selectedNodeData.entityId || selectedNodeData.id}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedNodeData(null)}
              className={`p-1 rounded-lg transition cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-charcoal-800' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
            <div className={`p-2 rounded-2xl border ${isDark ? 'bg-charcoal-900/80 border-sky-500/15' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-500 uppercase block">Category</span>
              <span className={`font-bold capitalize ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedNodeData.entity_type || selectedNodeData.type || 'Entity'}</span>
            </div>
            <div className={`p-2 rounded-2xl border ${isDark ? 'bg-charcoal-900/80 border-sky-500/15' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-[10px] text-slate-500 uppercase block">Threat Level</span>
              <span className={`font-bold ${selectedNodeData.risk_flag || selectedNodeData.risk || selectedNodeData.riskFlag ? 'text-red-500' : 'text-emerald-600'}`}>
                {selectedNodeData.risk_flag || selectedNodeData.risk || selectedNodeData.riskFlag ? '🚨 HIGH RISK' : 'NORMAL'}
              </span>
            </div>
          </div>

          {selectedNodeData.aliases && Array.isArray(selectedNodeData.aliases) && selectedNodeData.aliases.length > 0 && (
            <div className={`text-[11px] font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-slate-400 uppercase text-[10px] block">Known Aliases:</span>
              <span>{selectedNodeData.aliases.join(', ')}</span>
            </div>
          )}

          {selectedNodeData.properties?.designation && (
            <div className={`text-[11px] font-mono ${isDark ? 'text-sky-200' : 'text-slate-800'}`}>
              <span className="text-slate-400 uppercase text-[10px] block">Designation:</span>
              <span>{selectedNodeData.properties.designation}</span>
            </div>
          )}

          <div className={`flex items-center justify-between pt-1 border-t text-[10px] font-mono ${isDark ? 'border-sky-500/15 text-sky-300' : 'border-slate-100 text-slate-600'}`}>
            <span>Forensic Score: {selectedNodeData.influenceScore || selectedNodeData.properties?.score || 85} / 100</span>
            <span className="text-emerald-500 font-bold">ACTIVE FORENSICS</span>
          </div>
        </div>
      )}

    </div>
  );
}
