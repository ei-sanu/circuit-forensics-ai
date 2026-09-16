import { getAuthToken } from './auth';

const API_BASE = '/api';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const inFlightRequests = new Map<string, Promise<any>>();
const DEFAULT_TTL_MS = 300000; // 5 minutes cache for ultra-fast instant UI tab switching
const REVALIDATE_AFTER_MS = 30000; // Refresh in background after 30 seconds

export function invalidateApiCache(pattern?: string) {
  if (!pattern) {
    cache.clear();
  } else {
    cache.forEach((_, key) => {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    });
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheKey = `${endpoint}`;

  if (!isGet) {
    invalidateApiCache();
  } else {
    const cached = cache.get(cacheKey);
    const now = Date.now();
    if (cached) {
      // If within fresh TTL, return immediately
      if (now - cached.timestamp < DEFAULT_TTL_MS) {
        // If older than REVALIDATE_AFTER_MS, revalidate in background without blocking
        if (now - cached.timestamp > REVALIDATE_AFTER_MS && !inFlightRequests.has(cacheKey)) {
          executeFetch<T>(endpoint, options, cacheKey, isGet).catch(() => {});
        }
        return cached.data;
      }
    }
    if (inFlightRequests.has(cacheKey)) {
      return inFlightRequests.get(cacheKey)!;
    }
  }

  return executeFetch<T>(endpoint, options, cacheKey, isGet);
}

async function executeFetch<T>(endpoint: string, options: RequestInit, cacheKey: string, isGet: boolean): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  // Always attach a valid token or fallback dev token
  headers.set('Authorization', `Bearer ${token || 'demo-token-investigator'}`);

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(errorData?.message || errorData?.detail || `HTTP Error ${res.status}`);
      }

      const json = await res.json();
      const result = json?.data !== undefined ? json.data : json;

      if (isGet) {
        cache.set(cacheKey, { data: result, timestamp: Date.now() });
      }

      return result;
    } finally {
      if (isGet) {
        inFlightRequests.delete(cacheKey);
      }
    }
  })();

  if (isGet) {
    inFlightRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}


export const api = {
  // Auth
  login: (credentials: any) =>
    request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  demoLogin: (role: string = 'investigator') =>
    request<any>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),
  register: (userData: any) =>
    request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  adminResetPassword: (userId: string, data: { newPassword: string }) =>
    request<any>(`/auth/admin-reset-password/${userId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getProfile: () => request<any>('/auth/me'),

  // Biometric Facial 2-Factor Authentication
  verifyFaceBiometric: (data: {
    challengeId: string;
    faceImage: string;
    livenessData?: any;
    threshold?: number;
  }) =>
    request<any>('/biometric/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  enrollFaceBiometric: (data: {
    userId?: string;
    faceImage: string;
    livenessProof?: any;
  }) =>
    request<any>('/biometric/enroll', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getBiometricStatus: (userId?: string) =>
    request<any>(`/biometric/status${userId ? `/${userId}` : ''}`),
  getBiometricTelemetry: () => request<any>('/biometric/telemetry'),

  // Cases
  getCases: (params?: { limit?: number; skip?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/cases?${qs}`);
  },
  getCase: (caseNumber: string) => request<any>(`/cases/${caseNumber}`),
  createCase: (data: any) =>
    request<any>('/cases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCase: (caseNumber: string, data: any) =>
    request<any>(`/cases/${caseNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Entities
  getEntities: (params?: { type?: string; risk?: boolean; caseId?: string; q?: string; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/entities?${qs}`);
  },
  getEntity: (entityId: string) => request<any>(`/entities/${entityId}`),
  createEntity: (data: any) =>
    request<any>('/entities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Documents
  getDocuments: (caseId?: string) => request<any[]>(`/documents${caseId ? `?caseId=${caseId}` : ''}`),
  getDocument: (documentId: string) => request<any>(`/documents/${documentId}`),
  uploadDocument: (formData: FormData) =>
    request<any>('/documents/upload', {
      method: 'POST',
      body: formData,
    }),
  commitDocument: (documentId: string, data: any) =>
    request<any>(`/documents/${documentId}/commit`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Graph
  getGraph: (caseId?: string) => request<any>(`/graph${caseId ? `?caseId=${caseId}` : ''}`),
  getGraphAnalytics: (caseId?: string) => request<any>(`/graph/analytics${caseId ? `?caseId=${caseId}` : ''}`),
  getTransactions: (params?: { caseId?: string; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/graph/transactions?${qs}`);
  },
  getCommunications: (params?: { caseId?: string; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/graph/communications?${qs}`);
  },
  findPath: (sourceId: string, targetId: string, caseId?: string) => {
    const qs = new URLSearchParams({ sourceId, targetId, ...(caseId ? { caseId } : {}) }).toString();
    return request<any>(`/graph/path?${qs}`);
  },
  simulateRemoval: (nodeId: string, caseId?: string) =>
    request<any>(`/graph/simulate${caseId ? `?caseId=${caseId}` : ''}`, {
      method: 'POST',
      body: JSON.stringify({ nodeId }),
    }),

  // Alerts
  getAlerts: (caseId?: string) => request<any[]>(`/alerts${caseId ? `?caseId=${caseId}` : ''}`),
  refreshAlerts: (caseId: string) =>
    request<any>(`/alerts/refresh/${caseId}`, {
      method: 'POST',
    }),
  updateAlertStatus: (alertId: string, status: string, notes?: string) =>
    request<any>(`/alerts/${alertId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    }),

  // FIRs (Police Station & Forensic Tracker)
  getFirs: (params?: { policeStation?: string; district?: string; status?: string; q?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/firs?${qs}`);
  },
  getFir: (id: string) => request<any>(`/firs/${id}`),
  createFir: (data: any) =>
    request<any>('/firs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateFirStatus: (id: string, status: string) =>
    request<any>(`/firs/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  uploadFirCopy: (formData: FormData) =>
    request<any>('/firs/upload-copy', {
      method: 'POST',
      body: formData,
    }),
  parseFirOcr: (rawText: string) =>
    request<any>('/firs/parse-ocr', {
      method: 'POST',
      body: JSON.stringify({ rawText }),
    }),

  // HR & User Management
  getPendingUsers: () => request<any[]>('/auth/pending-users'),
  getAllUsers: () => request<any[]>('/auth/users'),
  approveUser: (userId: string) =>
    request<any>(`/auth/approve-user/${userId}`, {
      method: 'POST',
    }),
  rejectUser: (userId: string) =>
    request<any>(`/auth/reject-user/${userId}`, {
      method: 'POST',
    }),

  // Copilot
  askCopilot: (
    query: string,
    caseId?: string,
    options?: { apiKey?: string; provider?: string; model?: string; history?: any[] }
  ) =>
    request<any>('/copilot/ask', {
      method: 'POST',
      body: JSON.stringify({
        query,
        caseId,
        apiKey: options?.apiKey,
        provider: options?.provider,
        model: options?.model,
        history: options?.history,
      }),
    }),
  getCopilotModelStatus: () => request<any>('/copilot/model-status'),


  // Audit Logs
  getAuditLogs: (params?: { limit?: number; skip?: number; userId?: string; action?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/audit?${qs}`);
  },

  // Vehicles
  getVehicles: async (params?: { q?: string; type?: string; flagged?: boolean }) => {
    try {
      const qs = new URLSearchParams(params as any).toString();
      const res = await request<any[]>(`/vehicles?${qs}`);
      if (res && res.length > 0) return res;
    } catch {
      // Fallback
    }
    const { MASTER_VEHICLES } = await import('./data');
    let list = [...MASTER_VEHICLES];
    if (params?.q) {
      const q = params.q.toLowerCase();
      list = list.filter((v) => v.plateNumber.toLowerCase().includes(q) || v.ownerName.toLowerCase().includes(q) || v.makeModel.toLowerCase().includes(q));
    }
    if (params?.type && params.type !== 'all') {
      list = list.filter((v) => v.vehicleType === params.type);
    }
    if (params?.flagged) {
      list = list.filter((v) => v.riskFlag);
    }
    return list;
  },
  getVehicle: async (vehicleId: string) => {
    try {
      const res = await request<any>(`/vehicles/${vehicleId}`);
      if (res) return res;
    } catch {}
    const { MASTER_VEHICLES } = await import('./data');
    return MASTER_VEHICLES.find((v) => v.vehicleId === vehicleId || v.plateNumber === vehicleId) || null;
  },
  createVehicle: async (data: any) => {
    return request<any>('/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  scanVehiclePlate: async (plateNumber: string) => {
    return request<any>('/vehicles/scan-plate', {
      method: 'POST',
      body: JSON.stringify({ plateNumber }),
    });
  },

  // AI / ML Insights
  getInsights: async () => {
    try {
      const res = await request<any>('/insights');
      if (res) return res;
    } catch {}
    const { MASTER_INSIGHTS } = await import('./data');
    return MASTER_INSIGHTS;
  },

  // Intelligence Lab Simulations
  getSimulationEvolution: async (week: number) => {
    try {
      const res = await request<any>(`/intelligence-lab/evolution?week=${week}`);
      if (res) return res;
    } catch {}
    const { MASTER_ENTITIES, MASTER_TRANSACTIONS } = await import('./data');
    return {
      week,
      activeNodes: MASTER_ENTITIES.slice(0, Math.min(MASTER_ENTITIES.length, 3 + week * 2)),
      activeEdges: MASTER_TRANSACTIONS.slice(0, Math.min(MASTER_TRANSACTIONS.length, 2 + week * 2)),
      density: 0.05 + week * 0.03,
    };
  },
  simulateBreakpoints: async (removedNodeIds: string[]) => {
    try {
      const res = await request<any>('/intelligence-lab/breakpoint', {
        method: 'POST',
        body: JSON.stringify({ removedNodeIds }),
      });
      if (res) return res;
    } catch {}
    const { MASTER_INSIGHTS } = await import('./data');
    const isMajorRemoved = removedNodeIds.includes('P-0001') || removedNodeIds.includes('P-0007');
    return {
      removedNodes: removedNodeIds,
      fragmentationScore: isMajorRemoved ? 0.78 : 0.22,
      isolatedSubgraphs: isMajorRemoved ? 3 : 1,
      impactAssessment: isMajorRemoved
        ? 'CRITICAL BREAKPOINT: Primary finance flow disrupted. Western syndicate decoupled from Southern convoy escort.'
        : 'LOW IMPACT: Peripheral target removal. Alternative routes remain operational.',
      unaffectedClusters: MASTER_INSIGHTS.communities.slice(isMajorRemoved ? 1 : 0),
    };
  },

  // Transactions
  importTransactions: (formData: FormData) =>
    request<any>('/transactions/import', {
      method: 'POST',
      body: formData,
    }),
  getTransactionStats: (caseId?: string) =>
    request<any>(`/transactions/stats${caseId ? `?caseId=${caseId}` : ''}`),

  // Communications / CDR
  importCommunications: (formData: FormData) =>
    request<any>('/communications/import', {
      method: 'POST',
      body: formData,
    }),
  getCommunicationStats: (caseId?: string) =>
    request<any>(`/communications/stats${caseId ? `?caseId=${caseId}` : ''}`),

  // Timeline
  getTimeline: (params?: { caseId?: string; entityId?: string; limit?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<any[]>(`/timeline?${qs}`);
  },

  // Evidence & Court Dossiers
  getEntityProvenance: (entityId: string) =>
    request<any>(`/evidence/provenance/${entityId}`),
  verifyDocumentHash: (documentId: string) =>
    request<any>(`/evidence/verify/${documentId}`),
  generateCourtReport: (data: { caseId: string; entityId?: string; officerName?: string; officerBadge?: string }) =>
    request<any>('/reports/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getCaseReport: (caseId: string) =>
    request<any>(`/reports/cases/${caseId}`),
};


