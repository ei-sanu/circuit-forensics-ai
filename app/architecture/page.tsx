'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Database,
  Brain,
  Shield,
  FileText,
  Phone,
  Landmark,
  ShieldAlert,
  Network,
  AlertTriangle,
  FileCheck,
  Server,
  Cpu,
  Monitor,
  CheckCircle2,
  ExternalLink,
  Download,
  Copy,
  Check,
  Sparkles,
  Play,
  Pause,
  Info,
  ChevronRight,
  Code2,
  ArrowDown,
  ArrowRight,
  RefreshCw,
  Eye,
  GitBranch,
  Search,
} from 'lucide-react';

interface NodeDetail {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  tech: string;
  description: string;
  features: string[];
  samplePayload?: string;
  targetRoute?: string;
}

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<'system' | 'pipeline' | 'drawio'>('system');
  const [selectedNode, setSelectedNode] = useState<NodeDetail | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadDrawio = (filename: string, fileUrl: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Node details database for interactive inspector
  const NODE_DETAILS: Record<string, NodeDetail> = {
    // System Architecture Nodes
    presentation: {
      id: 'presentation',
      title: 'Presentation Layer',
      subtitle: 'Next.js 14 App Router & React 18',
      category: 'Frontend UI',
      tech: 'Next.js 14, React 18, Tailwind CSS, Lucide Icons, TypeScript',
      description: 'High-contrast tactical command dashboard delivering responsive intelligence workspaces, real-time alerting, and multi-dimensional analytical views.',
      features: [
        'Server-Side & Client Components with App Router',
        'State persistence and secure JWT session handling',
        'Dark/Light tactical monochrome UI theme',
        'Instant navigation and client-side reactive caching',
      ],
      targetRoute: '/dashboard',
    },
    graph_vis: {
      id: 'graph_vis',
      title: 'React Dashboard & Graph Visualization',
      subtitle: 'Cytoscape.js & Leaflet GIS Engine',
      category: 'Visualization Engine',
      tech: 'Cytoscape.js 3.30, Leaflet OpenStreetMap, Recharts',
      description: 'Interactive canvas visualizer for complex criminal syndicate topology, multi-hop ring clustering, concentric hierarchy layout, and geospatial incident heatmaps.',
      features: [
        'COSE & Concentric physics-based force graph layouts',
        'Geo-spatial clustering with OpenStreetMap tiles',
        'Dynamic node filtering by confidence score and entity type',
        'High-resolution SVG & PNG topology export',
      ],
      targetRoute: '/explorer',
    },
    gateway: {
      id: 'gateway',
      title: 'Core Gateway',
      subtitle: 'Python FastAPI Microservice Architecture',
      category: 'Backend Core',
      tech: 'FastAPI, Pydantic v2, Python 3.11, Uvicorn, SQLAlchemy',
      description: 'High-throughput async REST API orchestrator handling request validation, data serialization, token authorization, and microservice delegation.',
      features: [
        'Sub-millisecond async endpoints with Starlette core',
        'Strict schema validation using Pydantic models',
        'Automated OpenAPI 3.1 Swagger & Redoc generation',
        'Stateless horizontal scalability with connection pooling',
      ],
    },
    jwt_rbac: {
      id: 'jwt_rbac',
      title: 'REST APIs & JWT Auth (5-Tier RBAC)',
      subtitle: 'Role-Based Cryptographic Access Governance',
      category: 'Security & Auth',
      tech: 'OAuth2 with JWT (HS256/RS256), Passlib, Cryptography',
      description: 'Granular 5-tier access control matrix ensuring strict audit compliance and data compartmentalization across police stations, analysts, and supervisors.',
      features: [
        '5 Distinct Roles: Super Admin, Inspector, Station Officer, Analyst, Investigator',
        'Zero-trust token verification on every protected route',
        'BNS/BSA Section 63 chain of custody cryptographic verification',
        'Automated audit logging of all sensitive dossier access',
      ],
      targetRoute: '/settings',
    },
    nlp_extraction: {
      id: 'nlp_extraction',
      title: 'NLP Extraction Engine',
      subtitle: 'spaCy Named Entity Recognition (NER)',
      category: 'AI / Machine Learning',
      tech: 'spaCy v3.7, Custom Indian Legal/Police NER Models',
      description: 'Automated entity extraction pipeline analyzing unstructured First Information Report (FIR) texts, extracting suspects, aliases, phone numbers, and crime sections.',
      features: [
        'Custom Indian naming and alias pattern extraction',
        'IPC & BNS legal section code parser',
        'Contextual address, landmark, and vehicle number identifier',
        'Confidence score generation per extracted entity',
      ],
      targetRoute: '/fir-track',
    },
    graph_analytics: {
      id: 'graph_analytics',
      title: 'Graph Analytics Engine',
      subtitle: 'NetworkX Topological Algorithms',
      category: 'AI / Graph Computing',
      tech: 'NetworkX 3.2, SciPy, NumPy',
      description: 'Topological network computation performing community detection, PageRank syndicate kingpin centrality, shortest-path laundering hops, and bridge identification.',
      features: [
        'Louvain modularity & Girvan-Newman community clustering',
        'Betweenness, Closeness, and Eigenvector centrality calculation',
        'Circular flow & mule-chain cycle detection',
        'Fast shortest-path trace between suspects and accounts',
      ],
      targetRoute: '/intelligence-lab',
    },
    entity_resolution: {
      id: 'entity_resolution',
      title: 'Entity Resolution',
      subtitle: 'scikit-learn & Fuzzy Matcher',
      category: 'AI / Machine Learning',
      tech: 'scikit-learn, TF-IDF, Jaro-Winkler, Levenshtein Distance',
      description: 'Probabilistic identity resolution resolving phonetically altered names, fragmented telecom records, duplicate bank accounts, and false aliases across police jurisdictions.',
      features: [
        'Multi-vector phonetic and phonetic soundex matching',
        'High-dimensional TF-IDF sparse matrix cosine similarity',
        'Cross-station alias disambiguation with 98.4% accuracy',
        'Automated merge suggestions for human verification',
      ],
      targetRoute: '/entities',
    },
    postgres_db: {
      id: 'postgres_db',
      title: 'PostgreSQL Master Data',
      subtitle: 'Relational & Graph Relational Storage',
      category: 'Database Storage',
      tech: 'PostgreSQL 16, TimescaleDB / PostGIS, SQLAlchemy ORM',
      description: 'Primary relational master store indexing entity registries, encrypted FIR transcripts, banking ledgers, telecom call records, and audit logs.',
      features: [
        'ACID-compliant relational integrity with JSONB graph indexes',
        'B-tree, GIN, and GiST indexes for sub-10ms lookup speeds',
        'Automated database replication and point-in-time recovery',
        'Encrypted at rest with AES-256 storage tablespaces',
      ],
    },
    sqlite_offline: {
      id: 'sqlite_offline',
      title: 'SQLite Encrypted Offline Fallback',
      subtitle: 'Edge Resilience & Field Operations',
      category: 'Offline Resilience',
      tech: 'SQLite 3 with SQLCipher / AES-256',
      description: 'Embedded edge database maintaining local investigation cache during network outages or remote field operations, with bi-directional auto-sync when back online.',
      features: [
        'Zero-configuration local database requiring zero cloud dependencies',
        'AES-256 page-level encryption with hardware key-derivation',
        'Two-way differential delta synchronization with master PostgreSQL',
        'Conflict-free Replicated Data Type (CRDT) merge resolution',
      ],
    },

    // Pipeline Nodes
    in_fir: {
      id: 'in_fir',
      title: 'FIR Records (Police Stations)',
      subtitle: 'FIRs, Case Files, Chargesheets',
      category: 'Input Source',
      tech: 'PDF / Image OCR, JSON Ingestion, National Police API',
      description: 'Official police First Information Reports ingested across jurisdictional police stations in digital PDF, scan, or structured schema formats.',
      features: [
        'OCR ingestion for scanned FIR physical documents',
        'Automatic IPC/BNS section code tagging',
        'Complainant, suspect, and witness record extraction',
      ],
      targetRoute: '/fir-track',
    },
    in_cdr: {
      id: 'in_cdr',
      title: 'Call Detail Records - CDR',
      subtitle: 'Call logs, Location, Contacts',
      category: 'Input Source',
      tech: 'Telecom CSV / XML Ingestion, Cell Tower Geo-Mapping',
      description: 'Telecom provider call metadata, IMEI/IMSI identifiers, tower triangulations, call frequencies, and mutual contact registries.',
      features: [
        'High-volume CSV batch ingestion (100k+ records/sec)',
        'Cell tower azimuth & geographic radius mapping',
        'Burner phone swap and IMEI switching detection',
      ],
      targetRoute: '/communications',
    },
    in_bank: {
      id: 'in_bank',
      title: 'Bank & UPI Transactions',
      subtitle: 'Transactions, Beneficiaries, Payment Patterns',
      category: 'Input Source',
      tech: 'NPCI / UPI Logs, Banking Statement Parsers, RTGS/NEFT',
      description: 'Financial transactions, rapid mule account layering, UPI VPA handles, micro-structuring transfers, and foreign remittance flows.',
      features: [
        'Mule account rapid disperse pattern detection',
        'Split transaction & structuring alert triggers',
        'Beneficiary flow tracing across multiple banking entities',
      ],
      targetRoute: '/transactions',
    },
    in_cyber: {
      id: 'in_cyber',
      title: 'Cyber Harassment Complaints',
      subtitle: 'Complaints, Social Profiles, Cross-Station Records',
      category: 'Input Source',
      tech: 'Citizen Portal API, Social Handle Scraper, Case Tracking',
      description: 'Multi-station citizen grievance logs, social media impersonation handles, phishing URLs, and cross-border extortion reports.',
      features: [
        'Cross-jurisdiction multi-complaint matching',
        'Social handle & IP address correlation',
        'Digital evidence preservation with timestamp integrity',
      ],
      targetRoute: '/cases',
    },
    entity_fusion: {
      id: 'entity_fusion',
      title: 'Entity Fusion Hub',
      subtitle: 'Multi-Modal Intelligence Correlator',
      category: 'Core Synthesis',
      tech: 'Vector Similarity, Graph Neural Networks, Fuzzy Logic',
      description: 'Central synthesis engine combining disparate signals from CDRs, bank accounts, FIR narratives, and vehicle plates into unified entity profiles.',
      features: [
        'Cross-domain graph node fusion',
        'Unified Criminal Master ID generation',
        'Dynamic risk score calculation',
      ],
      targetRoute: '/entities',
    },
    hitl_review: {
      id: 'hitl_review',
      title: 'Human-in-the-Loop Review & Blockchain Hash',
      subtitle: 'Cryptographic Audit & Supervisory Approval',
      category: 'Verification',
      tech: 'SHA-256 Merkle Trees, Digital Signature, Supervisory Queue',
      description: 'Mandatory investigator verification interface where AI-generated linkages are vetted, signed, and permanently anchored with tamper-proof blockchain hashes.',
      features: [
        'Section 63 BSA compliance audit record creation',
        'Immutable SHA-256 cryptographic chain anchoring',
        'Supervisory override and validation logging',
      ],
      targetRoute: '/alerts',
    },
    out_graph: {
      id: 'out_graph',
      title: 'Connected Syndicates Graph',
      subtitle: 'Relationships & Networks',
      category: 'Intelligence Output',
      tech: 'Cytoscape.js, Network Topology, Spatial Clustered Graph',
      description: 'Interactive high-definition visual graph representing entire criminal networks, kingpins, money laundering nodes, and operational associates.',
      features: [
        'Live relationship topology exploration',
        'Sub-network extraction and isolated ring export',
        'Interactive filtering by crime category and time window',
      ],
      targetRoute: '/explorer',
    },
    out_alerts: {
      id: 'out_alerts',
      title: 'Suspicious Anomaly Alerts',
      subtitle: 'Real-time Notifications',
      category: 'Intelligence Output',
      tech: 'WebSocket Broadcasts, Priority Dispatch System',
      description: 'Instant tactical notifications triggered when high-risk patterns, wanted kingpin phone hits, or massive financial structuring events occur.',
      features: [
        'Real-time WebSocket alerts to designated field units',
        'Severity scoring: Critical, High, Medium, Low',
        'One-click jump to full incident dossier',
      ],
      targetRoute: '/alerts',
    },
    out_dossier: {
      id: 'out_dossier',
      title: 'BNS/BSA Court-Ready Dossier',
      subtitle: 'Legal Reports & Evidence',
      category: 'Intelligence Output',
      tech: 'Automated Legal PDF Generator, Section 63 Certificate',
      description: 'Admissible court-ready prosecutorial brief automatically compiled with chronological evidence chains, call timelines, transaction graphs, and BSA certificates.',
      features: [
        '100% compliant with Bharatiya Sakshya Adhiniyam 2023',
        'Embedded cryptographic hash verification barcodes',
        'Instant multi-format PDF and print export',
      ],
      targetRoute: '/reports',
    },
  };

  // Mermaid diagrams
  const MERMAID_SYSTEM_ARCH = `flowchart TD
    %% Presentation Layer
    subgraph PresLayer["🖥️ Presentation Layer (Next.js 14)"]
        PresInner["📊 React Dashboard & Graph Visualization\\nCytoscape.js / Leaflet"]
    end

    %% Core Gateway
    subgraph GwLayer["⚙️ Core Gateway (Python / FastAPI)"]
        GwInner["🛡️ REST APIs & JWT Auth\\n5-Tier RBAC"]
    end

    %% AI & Analytics Engine
    subgraph AiLayer["🧠 AI & Analytics Engine"]
        AiNLP["📄 NLP Extraction\\nspaCy NER"]
        AiGraph["🕸️ Graph Analytics\\nNetworkX"]
        AiEntity["👥 Entity Resolution\\nscikit-learn"]
    end

    %% Data Storage
    subgraph DbLayer["🗄️ Data Storage"]
        DbPostgres[("🐘 PostgreSQL\\nMaster Data")]
    end

    %% Offline Fallback
    subgraph OfflineLayer["💾 Offline Fallback"]
        DbSqlite[("💽 SQLite\\nEncrypted Offline Fallback")]
    end

    %% Connections
    PresInner <-->|JSON Data| GwInner
    GwInner --> AiNLP
    GwInner --> AiGraph
    GwInner --> AiEntity
    AiNLP --> DbPostgres
    AiGraph <--> DbPostgres
    AiEntity --> DbPostgres
    DbPostgres <-->|Auto-Sync| DbSqlite

    %% Styling
    style PresLayer fill:#ebf5ff,stroke:#3b82f6,stroke-width:2px,color:#1e3a8a
    style PresInner fill:#2563eb,stroke:#1d4ed8,stroke-width:2px,color:#ffffff
    style GwLayer fill:#fff1f2,stroke:#f43f5e,stroke-width:2px,color:#881337
    style GwInner fill:#e11d48,stroke:#be123c,stroke-width:2px,color:#ffffff
    style AiLayer fill:#faf5ff,stroke:#a855f7,stroke-width:2px,color:#581c87
    style AiNLP fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#ffffff
    style AiGraph fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#ffffff
    style AiEntity fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#ffffff
    style DbLayer fill:#ecfdf5,stroke:#10b981,stroke-width:2px,color:#064e3b
    style DbPostgres fill:#fbbf24,stroke:#d97706,stroke-width:2px,color:#78350f
    style OfflineLayer fill:#fffbeb,stroke:#f59e0b,stroke-width:2px,color:#78350f
    style DbSqlite fill:#fbbf24,stroke:#d97706,stroke-width:2px,color:#78350f`;

  const MERMAID_DATA_PIPELINE = `flowchart LR
    %% Inputs
    subgraph Inputs["Multi-Source Ingestion"]
        InFIR["📄 FIR Records\\n(Police Stations)\\nFIRs, Case Files, Chargesheets"]
        InCDR["📞 Call Detail Records - CDR\\n(Telecom Data)\\nCall logs, Location, Contacts"]
        InBank["🏦 Bank & UPI Transactions\\n(Financial Data)\\nTransactions, Beneficiaries, Payment Patterns"]
        InCyber["🛡️ Cyber Harassment Complaints\\n(Multiple Stations)\\nComplaints, Social Profiles, Cross-Station Records"]
    end

    %% Fusion
    Fusion{"🔮 Entity\\nFusion"}

    %% Verification
    HITL["👤🔍 Human-in-the-Loop\\nReview &\\nBlockchain Hash"]

    %% Outputs
    subgraph Outputs["Actionable Outputs"]
        OutGraph["🕸️ Connected Syndicates Graph\\n(Relationships & Networks)"]
        OutAlerts["⚠️ Suspicious Anomaly Alerts\\n(Real-time Notifications)"]
        OutDossier["📜 BNS/BSA Court-Ready Dossier\\n(Legal Reports & Evidence)"]
    end

    %% Feed Connectors
    InFIR -->|NLP Entity Extraction| Fusion
    InCDR -->|NetworkX Graphing| Fusion
    InBank -->|Financial Pattern Matching| Fusion
    InCyber -->|Cross-Station Linking| Fusion

    %% Processing
    Fusion --> HITL
    HITL -->|Verifies & Locks| OutGraph
    HITL -->|Surfaces| OutAlerts
    HITL -->|Generates| OutDossier

    %% Styling
    style InFIR fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:2px
    style InCDR fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:2px
    style InBank fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:2px
    style InCyber fill:#0284c7,stroke:#0369a1,color:#ffffff,stroke-width:2px
    style Fusion fill:#7c3aed,stroke:#6d28d9,color:#ffffff,stroke-width:2px
    style HITL fill:#ea580c,stroke:#c2410c,color:#ffffff,stroke-width:3px,stroke-dasharray: 5 5
    style OutGraph fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px
    style OutAlerts fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px
    style OutDossier fill:#059669,stroke:#047857,color:#ffffff,stroke-width:2px`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Navigation Banner */}
      <div className="bg-white dark:bg-[#111622] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400">
                <BrainCircuitIcon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                CIRCUIT System Architecture & Flowchart Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                Live Interactive
              </span>
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-3xl">
              High-fidelity interactive visual blueprints representing the 5-tier monolithic microservices architecture and the end-to-end multi-modal data fusion pipeline. Fully compatible and exportable to Draw.io & Mermaid.
            </p>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isSimulating
                  ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                  : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300'
              }`}
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isSimulating ? 'Pause Flow Simulation' : 'Simulate Data Pulses'}
            </button>

            <button
              onClick={() => setActiveTab('drawio')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Draw.io & Mermaid Exports
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 border-b border-neutral-200 dark:border-neutral-800 pb-0">
          <button
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'system'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            1. System Architecture (5-Tier Full Stack)
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'pipeline'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <GitBranch className="w-4 h-4" />
            2. Data Fusion & Investigation Pipeline
          </button>
          <button
            onClick={() => setActiveTab('drawio')}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-semibold border-b-2 transition-all ${
              activeTab === 'drawio'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            3. Draw.io & Code Integrations
          </button>
        </div>
      </div>

      {/* Main Diagram Area with Interactive Inspector Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Diagram Canvas */}
        <div className="xl:col-span-8 bg-white dark:bg-[#111622] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm overflow-hidden">
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    CIRCUIT Multi-Tier System Architecture
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Click any node or layer container below to inspect its specifications, tech stack, and live routes.
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                  Ref: arch.png
                </span>
              </div>

              {/* Visual System Architecture Flowchart (Pure CSS/Tailwind Vector Fidelity) */}
              <div className="relative flex flex-col items-center gap-6 py-4 px-2 max-w-2xl mx-auto">
                {/* 1. Presentation Layer */}
                <div
                  onClick={() => setSelectedNode(NODE_DETAILS.presentation)}
                  className="w-full cursor-pointer group relative rounded-2xl border-2 border-blue-400 dark:border-blue-500/60 bg-blue-50/70 dark:bg-blue-950/20 p-5 transition-all hover:shadow-lg hover:border-blue-500"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-base text-blue-900 dark:text-blue-300">
                      Presentation Layer (Next.js 14)
                    </span>
                  </div>

                  {/* Inner Card: React Dashboard */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(NODE_DETAILS.graph_vis);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white text-center shadow-md transition-all hover:scale-[1.01] hover:shadow-blue-500/20 flex flex-col items-center justify-center"
                  >
                    <div className="flex items-center gap-2 font-bold text-base">
                      <Network className="w-5 h-5" />
                      React Dashboard &amp; Graph Visualization
                    </div>
                    <div className="text-xs text-blue-100 opacity-90 mt-0.5 font-mono">
                      Cytoscape.js / Leaflet
                    </div>
                  </div>
                </div>

                {/* Connector: Presentation -> Gateway */}
                <div className="relative flex flex-col items-center justify-center py-1">
                  <div className="h-8 w-0.5 bg-neutral-400 dark:bg-neutral-600 relative">
                    {isSimulating && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                    )}
                  </div>
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 shadow-sm font-mono my-1">
                    JSON Data
                  </span>
                  <div className="h-8 w-0.5 bg-neutral-400 dark:bg-neutral-600 relative">
                    <ArrowDown className="w-4 h-4 text-neutral-500 absolute -bottom-2 -left-[7px]" />
                  </div>
                </div>

                {/* 2. Core Gateway Layer */}
                <div
                  onClick={() => setSelectedNode(NODE_DETAILS.gateway)}
                  className="w-full cursor-pointer group relative rounded-2xl border-2 border-rose-400 dark:border-rose-500/60 bg-rose-50/70 dark:bg-rose-950/20 p-5 transition-all hover:shadow-lg hover:border-rose-500"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Cpu className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <span className="font-bold text-base text-rose-900 dark:text-rose-300">
                      Core Gateway (Python / FastAPI)
                    </span>
                  </div>

                  {/* Inner Card: REST APIs & JWT Auth */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedNode(NODE_DETAILS.jwt_rbac);
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 p-4 text-white text-center shadow-md transition-all hover:scale-[1.01] hover:shadow-rose-500/20 flex flex-col items-center justify-center"
                  >
                    <div className="flex items-center gap-2 font-bold text-base">
                      <Shield className="w-5 h-5 text-rose-200" />
                      REST APIs &amp; JWT Auth
                    </div>
                    <div className="text-xs text-rose-100 opacity-90 mt-0.5 font-mono">
                      5-Tier RBAC
                    </div>
                  </div>
                </div>

                {/* Connector: 3 Branch Lines to AI Modules */}
                <div className="w-full flex items-center justify-center relative py-1">
                  <svg className="w-full h-12" viewBox="0 0 600 48" fill="none">
                    <path
                      d="M 300 0 L 300 24 M 300 24 L 100 24 L 100 48 M 300 24 L 300 48 M 300 24 L 500 24 L 500 48"
                      stroke="currentColor"
                      className="text-neutral-400 dark:text-neutral-600"
                      strokeWidth="2"
                    />
                    {isSimulating && (
                      <circle r="3" fill="#8B5CF6">
                        <animate
                          attributeName="cx"
                          values="300;300;100;100"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cy"
                          values="0;24;24;48"
                          dur="2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}
                  </svg>
                </div>

                {/* 3. AI & Analytics Engine Layer */}
                <div
                  className="w-full relative rounded-2xl border-2 border-purple-400 dark:border-purple-500/60 bg-purple-50/70 dark:bg-purple-950/20 p-5"
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-bold text-base text-purple-900 dark:text-purple-300">
                      AI &amp; Analytics Engine
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Sub-card 1: NLP */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.nlp_extraction)}
                      className="cursor-pointer rounded-xl bg-purple-600 hover:bg-purple-700 text-white p-3.5 text-center shadow-md transition-all hover:scale-105 flex flex-col items-center justify-center"
                    >
                      <FileText className="w-5 h-5 mb-1 text-purple-200" />
                      <div className="font-bold text-sm">NLP Extraction</div>
                      <div className="text-[11px] text-purple-200 font-mono mt-0.5">spaCy NER</div>
                    </div>

                    {/* Sub-card 2: Graph Analytics */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.graph_analytics)}
                      className="cursor-pointer rounded-xl bg-purple-600 hover:bg-purple-700 text-white p-3.5 text-center shadow-md transition-all hover:scale-105 flex flex-col items-center justify-center"
                    >
                      <Network className="w-5 h-5 mb-1 text-purple-200" />
                      <div className="font-bold text-sm">Graph Analytics</div>
                      <div className="text-[11px] text-purple-200 font-mono mt-0.5">NetworkX</div>
                    </div>

                    {/* Sub-card 3: Entity Resolution */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.entity_resolution)}
                      className="cursor-pointer rounded-xl bg-purple-600 hover:bg-purple-700 text-white p-3.5 text-center shadow-md transition-all hover:scale-105 flex flex-col items-center justify-center"
                    >
                      <UsersIcon className="w-5 h-5 mb-1 text-purple-200" />
                      <div className="font-bold text-sm">Entity Resolution</div>
                      <div className="text-[11px] text-purple-200 font-mono mt-0.5">scikit-learn</div>
                    </div>
                  </div>
                </div>

                {/* Connector: Down to Postgres */}
                <div className="w-full flex items-center justify-center relative py-1">
                  <svg className="w-full h-12" viewBox="0 0 600 48" fill="none">
                    <path
                      d="M 100 0 L 100 24 L 300 24 L 300 48 M 300 0 L 300 48 M 500 0 L 500 24 L 300 24"
                      stroke="currentColor"
                      className="text-neutral-400 dark:text-neutral-600"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                {/* 4. Data Storage Layer */}
                <div
                  onClick={() => setSelectedNode(NODE_DETAILS.postgres_db)}
                  className="w-full cursor-pointer group relative rounded-2xl border-2 border-emerald-400 dark:border-emerald-500/60 bg-emerald-50/70 dark:bg-emerald-950/20 p-5 transition-all hover:shadow-lg hover:border-emerald-500"
                >
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-base text-emerald-900 dark:text-emerald-300">
                      Data Storage
                    </span>
                  </div>

                  {/* 3D Postgres Cylinder Card */}
                  <div className="w-full max-w-sm mx-auto rounded-2xl bg-gradient-to-b from-amber-400 via-amber-400 to-amber-500 border-2 border-amber-500 p-4 text-amber-950 text-center shadow-md transition-all hover:scale-105 flex items-center justify-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-200/60 border border-amber-300">
                      <Database className="w-6 h-6 text-amber-900" />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-base tracking-tight">PostgreSQL</div>
                      <div className="text-xs font-semibold text-amber-900/80 font-mono">Master Data</div>
                    </div>
                  </div>
                </div>

                {/* Connector: Postgres -> SQLite */}
                <div className="relative flex flex-col items-center justify-center py-1">
                  <div className="h-6 w-0.5 bg-neutral-400 dark:bg-neutral-600" />
                  <span className="px-3 py-1 rounded-md text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 shadow-sm font-mono my-1">
                    Auto-Sync
                  </span>
                  <div className="h-6 w-0.5 bg-neutral-400 dark:bg-neutral-600 relative">
                    <ArrowDown className="w-4 h-4 text-neutral-500 absolute -bottom-2 -left-[7px]" />
                  </div>
                </div>

                {/* 5. SQLite Offline Fallback Layer */}
                <div
                  onClick={() => setSelectedNode(NODE_DETAILS.sqlite_offline)}
                  className="w-full cursor-pointer group relative rounded-2xl border-2 border-amber-400 dark:border-amber-500/60 bg-amber-50/70 dark:bg-amber-950/20 p-5 transition-all hover:shadow-lg hover:border-amber-500"
                >
                  <div className="w-full max-w-sm mx-auto rounded-2xl bg-gradient-to-b from-amber-400 via-amber-400 to-amber-500 border-2 border-amber-500 p-4 text-amber-950 text-center shadow-md transition-all hover:scale-105 flex items-center justify-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-200/60 border border-amber-300">
                      <Server className="w-6 h-6 text-amber-900" />
                    </div>
                    <div className="text-left">
                      <div className="font-extrabold text-base tracking-tight">SQLite</div>
                      <div className="text-xs font-semibold text-amber-900/80 font-mono">
                        Encrypted Offline Fallback
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                    Multi-Modal Data Fusion &amp; Investigation Flow
                  </h2>
                  <p className="text-xs text-neutral-500">
                    End-to-end intelligence synthesis from heterogeneous inputs to court-admissible dossiers.
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                  Ref: flow.png
                </span>
              </div>

              {/* Horizontal Pipeline Diagram with SVG Connectors */}
              <div className="relative py-6 overflow-x-auto min-w-[700px]">
                <div className="grid grid-cols-12 gap-3 items-center">
                  {/* Left Column: 4 Blue Input Cards */}
                  <div className="col-span-4 space-y-3">
                    {/* FIR Records */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.in_fir)}
                      className="cursor-pointer rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 p-3.5 text-white shadow-md transition-all hover:scale-105 border border-sky-400/40"
                    >
                      <div className="flex items-start gap-2.5">
                        <FileText className="w-5 h-5 text-sky-200 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">FIR Records</div>
                          <div className="text-xs text-sky-200">(Police Stations)</div>
                          <div className="text-[11px] text-sky-100/70 mt-1">
                            FIRs, Case Files, Chargesheets
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Call Detail Records */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.in_cdr)}
                      className="cursor-pointer rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 p-3.5 text-white shadow-md transition-all hover:scale-105 border border-sky-400/40"
                    >
                      <div className="flex items-start gap-2.5">
                        <Phone className="w-5 h-5 text-sky-200 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">Call Detail Records - CDR</div>
                          <div className="text-xs text-sky-200">(Telecom Data)</div>
                          <div className="text-[11px] text-sky-100/70 mt-1">
                            Call logs, Location, Contacts
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bank & UPI */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.in_bank)}
                      className="cursor-pointer rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 p-3.5 text-white shadow-md transition-all hover:scale-105 border border-sky-400/40"
                    >
                      <div className="flex items-start gap-2.5">
                        <Landmark className="w-5 h-5 text-sky-200 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">Bank &amp; UPI Transactions</div>
                          <div className="text-xs text-sky-200">(Financial Data)</div>
                          <div className="text-[11px] text-sky-100/70 mt-1">
                            Transactions, Beneficiaries, Payment Patterns
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cyber Harassment */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.in_cyber)}
                      className="cursor-pointer rounded-xl bg-gradient-to-br from-sky-600 to-blue-700 p-3.5 text-white shadow-md transition-all hover:scale-105 border border-sky-400/40"
                    >
                      <div className="flex items-start gap-2.5">
                        <ShieldAlert className="w-5 h-5 text-sky-200 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">Cyber Harassment Complaints</div>
                          <div className="text-xs text-sky-200">(Multiple Stations)</div>
                          <div className="text-[11px] text-sky-100/70 mt-1">
                            Complaints, Social Profiles, Cross-Station Records
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Intermediate Badges & Entity Fusion Diamond (Col 4 to 8) */}
                  <div className="col-span-4 flex flex-col items-center justify-center py-2 space-y-4">
                    {/* Entity Fusion Diamond */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.entity_fusion)}
                      className="cursor-pointer group relative flex flex-col items-center justify-center text-center w-36 h-36 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xl rotate-45 transition-all hover:scale-110 border-2 border-purple-300"
                    >
                      <div className="-rotate-45 flex flex-col items-center justify-center p-2">
                        <Sparkles className="w-6 h-6 text-purple-200 mb-1" />
                        <span className="font-extrabold text-sm leading-tight">Entity<br/>Fusion</span>
                      </div>
                    </div>

                    {/* Transformation Badges Summary */}
                    <div className="grid grid-cols-2 gap-1.5 w-full text-[11px] font-semibold text-center text-blue-900 dark:text-blue-200">
                      <span className="p-1 rounded bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                        NLP NER
                      </span>
                      <span className="p-1 rounded bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                        NetworkX
                      </span>
                      <span className="p-1 rounded bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                        Pattern Match
                      </span>
                      <span className="p-1 rounded bg-blue-100 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                        Cross-Link
                      </span>
                    </div>

                    {/* Human in the Loop Card */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.hitl_review)}
                      className="cursor-pointer w-full rounded-2xl border-2 border-dashed border-orange-500 bg-gradient-to-br from-orange-500 to-amber-600 text-white p-3.5 text-center shadow-lg transition-all hover:scale-105"
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Search className="w-4 h-4 text-orange-200" />
                        <span className="font-bold text-xs">Human-in-the-Loop</span>
                      </div>
                      <div className="text-[11px] text-orange-100 font-mono">
                        Review &amp; Blockchain Hash
                      </div>
                    </div>
                  </div>

                  {/* Right Column: 3 Green Output Cards */}
                  <div className="col-span-4 space-y-3">
                    {/* Syndicates Graph */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.out_graph)}
                      className="cursor-pointer rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-3.5 text-white shadow-md transition-all hover:scale-105 border border-emerald-400/40"
                    >
                      <div className="flex items-start gap-2.5">
                        <Network className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">Connected Syndicates Graph</div>
                          <div className="text-xs text-emerald-200">(Relationships &amp; Networks)</div>
                        </div>
                      </div>
                    </div>

                    {/* Anomaly Alerts */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.out_alerts)}
                      className="cursor-pointer rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-3.5 text-white shadow-md transition-all hover:scale-105 border border-emerald-400/40"
                    >
                      <div className="flex items-start gap-2.5">
                        <AlertTriangle className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">Suspicious Anomaly Alerts</div>
                          <div className="text-xs text-emerald-200">(Real-time Notifications)</div>
                        </div>
                      </div>
                    </div>

                    {/* Court-Ready Dossier */}
                    <div
                      onClick={() => setSelectedNode(NODE_DETAILS.out_dossier)}
                      className="cursor-pointer rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 p-3.5 text-white shadow-md transition-all hover:scale-105 border border-emerald-400/40"
                    >
                      <div className="flex items-start gap-2.5">
                        <FileCheck className="w-5 h-5 text-emerald-200 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm">BNS/BSA Court-Ready Dossier</div>
                          <div className="text-xs text-emerald-200">(Legal Reports &amp; Evidence)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drawio' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Draw.io &amp; Diagram Integration Hub
                </h2>
                <p className="text-xs text-neutral-500">
                  Export directly as native `.drawio` files, copy raw XML schemas, or paste Mermaid text straight into Draw.io (`Arrange &gt; Insert &gt; Advanced &gt; Mermaid`).
                </p>
              </div>

              {/* Download Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* File 1: System Architecture */}
                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                        circuit-system-architecture.drawio
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
                      Complete layered 5-tier architecture schema with custom styles, containers, and color accents.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleDownloadDrawio(
                          'circuit-system-architecture.drawio',
                          '/diagrams/circuit-system-architecture.drawio'
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .drawio
                    </button>
                    <button
                      onClick={() => handleCopy(MERMAID_SYSTEM_ARCH, 'mermaid_arch')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all"
                    >
                      {copiedType === 'mermaid_arch' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy Mermaid
                    </button>
                  </div>
                </div>

                {/* File 2: Data Pipeline Flow */}
                <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                        <GitBranch className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                        circuit-data-fusion-pipeline.drawio
                      </h3>
                    </div>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-4">
                      Multi-modal input to court-ready dossier pipeline with glowing cards, diamond fusion hub, and verification anchors.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleDownloadDrawio(
                          'circuit-data-fusion-pipeline.drawio',
                          '/diagrams/circuit-data-fusion-pipeline.drawio'
                        )
                      }
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download .drawio
                    </button>
                    <button
                      onClick={() => handleCopy(MERMAID_DATA_PIPELINE, 'mermaid_flow')}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all"
                    >
                      {copiedType === 'mermaid_flow' ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      Copy Mermaid
                    </button>
                  </div>
                </div>
              </div>

              {/* How to open in Draw.io guide */}
              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 text-xs space-y-2">
                <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  How to open and edit in Draw.io / diagrams.net:
                </div>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-400 pl-1">
                  <li>
                    Go to{' '}
                    <a
                      href="https://app.diagrams.net"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold"
                    >
                      app.diagrams.net
                    </a>
                  </li>
                  <li>Click <strong>File &gt; Open From &gt; Device</strong> and select the downloaded <code className="font-mono bg-blue-200/50 dark:bg-blue-900/50 px-1 py-0.5 rounded">.drawio</code> file.</li>
                  <li>Alternatively, click <strong>Arrange &gt; Insert &gt; Advanced &gt; Mermaid</strong> and paste the copied Mermaid syntax!</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Interactive Node Inspector */}
        <div className="xl:col-span-4 bg-white dark:bg-[#111622] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-sm">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                  {selectedNode.category}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 font-semibold"
                >
                  Clear Selection
                </button>
              </div>

              <div>
                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
                  {selectedNode.title}
                </h3>
                <p className="text-xs font-mono text-neutral-500 mt-0.5">{selectedNode.subtitle}</p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-xs">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                  Technology Stack:
                </span>
                <span className="font-mono text-neutral-600 dark:text-neutral-400">
                  {selectedNode.tech}
                </span>
              </div>

              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {selectedNode.description}
              </p>

              <div>
                <span className="text-xs font-bold text-neutral-900 dark:text-white block mb-2">
                  Key Capabilities:
                </span>
                <ul className="space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                  {selectedNode.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {selectedNode.targetRoute && (
                <div className="pt-2">
                  <Link
                    href={selectedNode.targetRoute}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-white text-white dark:text-neutral-900 text-xs font-semibold shadow-sm transition-all"
                  >
                    Open Live Module ({selectedNode.targetRoute})
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 space-y-3">
              <div className="p-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800/80 text-neutral-400">
                <Info className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                Interactive Node Inspector
              </h4>
              <p className="text-xs text-neutral-500 max-w-xs">
                Click on any layer, component, database, or pipeline node in the flowchart on the left to inspect its real-time schema, underlying tech stack, and live application route.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BrainCircuitIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 4.58 2.5 2.5 0 0 0 2.96 3.08 2.5 2.5 0 0 0 4.96.06" />
      <path d="M12 4.5a2.5 2.5 0 0 1 4.96-.46 2.5 2.5 0 0 1 1.98 3 2.5 2.5 0 0 1 1.32 4.24 3 3 0 0 1-.34 4.58 2.5 2.5 0 0 1-2.96 3.08 2.5 2.5 0 0 1-4.96.06" />
      <path d="M12 4.5v15" />
      <path d="M10 9a2 2 0 1 1 4 0" />
      <path d="M10 15a2 2 0 1 0 4 0" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
