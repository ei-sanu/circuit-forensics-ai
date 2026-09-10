'use client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'investigator' | 'analyst' | 'admin' | 'police_station' | 'hr';
  department?: string;
  badgeNumber?: string;
  district?: string;
  stationName?: string;
  inchargeRank?: string;
  status?: string;
}


export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('circuit_token');
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('circuit_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('circuit_token');
    localStorage.removeItem('circuit_user');
  }
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('circuit_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user: AuthUser) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('circuit_user', JSON.stringify(user));
  }
}
