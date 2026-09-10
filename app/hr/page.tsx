'use client';

import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Users,
  Building,
  Shield,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Lock,
  Mail,
  User,
  Phone,
  BadgePercent,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { api } from '@/lib/api';

const DEFAULT_PERSONNEL = [
  {
    _id: 'usr-p-01',
    name: 'Senior Inspector Vikram Shinde',
    email: 'police@circuit.gov',
    role: 'police_station',
    department: 'District Cyber Crime Wing',
    badgeNumber: 'PS-MUM-891',
    district: 'Mumbai South',
    stationName: 'Colaba Cyber Crime PS',
    inchargeRank: 'Senior Inspector / SHO',
    inchargeName: 'Inspector Vikram Shinde',
    phone: '+912222019944',
    status: 'approved',
    createdAt: '2026-08-01T10:00:00Z',
  },
  {
    _id: 'usr-p-02',
    name: 'ACP Rakesh Malhotra',
    email: 'delhi.specialcell@circuit.gov',
    role: 'police_station',
    department: 'Special Operations Cell',
    badgeNumber: 'PS-DEL-412',
    district: 'Central Delhi',
    stationName: 'Karol Bagh Special Cell PS',
    inchargeRank: 'Assistant Commissioner of Police (ACP)',
    inchargeName: 'ACP Rakesh Malhotra',
    phone: '+911123389012',
    status: 'approved',
    createdAt: '2026-08-10T12:00:00Z',
  },
  {
    _id: 'usr-p-03',
    name: 'Inspector Ananth Kumar',
    email: 'blr.cyber@circuit.gov',
    role: 'police_station',
    department: 'Cyber Crime Investigation Bureau',
    badgeNumber: 'PS-BLR-199',
    district: 'Bengaluru South',
    stationName: 'Koramangala Cyber Crime PS',
    inchargeRank: 'Inspector / SHO',
    inchargeName: 'Inspector Ananth Kumar',
    phone: '+918025539090',
    status: 'approved',
    createdAt: '2026-08-20T14:00:00Z',
  },
  {
    _id: 'usr-p-04',
    name: 'Sub-Inspector Rohit Varma',
    email: 'rohit.varma@circuit.gov',
    role: 'police_station',
    department: 'Economic Offences Wing',
    badgeNumber: 'PS-PUN-088',
    district: 'Pune City',
    stationName: 'Shivajinagar EOW Police Station',
    inchargeRank: 'Senior Inspector / SHO',
    inchargeName: 'Senior Inspector S. Patil',
    phone: '+912025531122',
    status: 'pending_approval',
    createdAt: '2026-09-05T08:30:00Z',
  },
];

export default function HrManagementPage() {
  const [personnel, setPersonnel] = useState<any[]>(DEFAULT_PERSONNEL);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form State for Onboarding
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'police_station',
    department: 'District Police Department',
    badgeNumber: '',
    district: 'Mumbai South',
    stationName: '',
    inchargeRank: 'Senior Inspector / SHO',
    inchargeName: '',
    phone: '',
  });

  const loadPersonnel = async () => {
    try {
      const users = await api.getAllUsers();
      if (users && Array.isArray(users) && users.length > 0) {
        setPersonnel(users);
      }
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadPersonnel();
  }, []);

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');

    const payload = {
      ...formData,
      createdByHr: true,
    };

    try {
      const res = await api.register(payload);
      setSuccessMsg(`Personnel profile for "${formData.name}" submitted successfully! Status: Pending Admin Review.`);
      setPersonnel((prev) => [
        {
          _id: res.id || `usr-${Date.now()}`,
          ...payload,
          status: 'pending_approval',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'police_station',
        department: 'District Police Department',
        badgeNumber: '',
        district: 'Mumbai South',
        stationName: '',
        inchargeRank: 'Senior Inspector / SHO',
        inchargeName: '',
        phone: '',
      });
    } catch (err: any) {
      alert(`Onboarding error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filtered = personnel.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.role?.toLowerCase().includes(q) ||
      p.stationName?.toLowerCase().includes(q) ||
      p.district?.toLowerCase().includes(q) ||
      p.badgeNumber?.toLowerCase().includes(q)
    );
  });

  const pendingCount = personnel.filter((p) => p.status === 'pending_approval').length;
  const activeCount = personnel.filter((p) => p.status === 'approved').length;

  return (
    <div className="space-y-6 text-charcoal-900 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-charcoal-950 flex items-center gap-2">
            <Users className="w-5 h-5 text-charcoal-800" />
            <span>Human Resources & Personnel Directorate</span>
          </h2>
          <p className="text-xs text-charcoal-600 mt-0.5">
            Official personnel registry, district police station credential provisioning, and role onboarding management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold text-[11px]">HR Restricted Scope: Personnel Data Only</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 rounded-3xl glass-panel shadow-md space-y-1">
          <span className="text-charcoal-500 uppercase text-[10px] font-bold">Total Staff Registered</span>
          <p className="text-2xl font-bold text-charcoal-950 font-mono">{personnel.length}</p>
          <span className="text-[10px] text-charcoal-400 font-sans">Officers & Station Incharges</span>
        </div>
        <div className="p-4 rounded-3xl glass-panel shadow-md space-y-1 border border-amber-500/20">
          <span className="text-amber-700 uppercase text-[10px] font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Admin Review</span>
          </span>
          <p className="text-2xl font-bold text-amber-900 font-mono">{pendingCount}</p>
          <span className="text-[10px] text-amber-800 font-sans">Awaiting Admin Verification</span>
        </div>
        <div className="p-4 rounded-3xl glass-panel shadow-md space-y-1">
          <span className="text-emerald-700 uppercase text-[10px] font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Verified Accounts</span>
          </span>
          <p className="text-2xl font-bold text-emerald-900 font-mono">{activeCount}</p>
          <span className="text-[10px] text-emerald-800 font-sans">Authorized for Portal Access</span>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Onboarding Form & Staff Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Onboarding Form (Left 1 Col) */}
        <div className="glass-panel p-6 rounded-3xl shadow-xl space-y-4">
          <div className="border-b border-beige-300 pb-3">
            <h3 className="font-bold text-sm text-charcoal-950 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-charcoal-800" />
              <span>Onboard New Officer / Station</span>
            </h3>
            <p className="text-[11px] text-charcoal-600 mt-0.5">
              Account will be saved and forwarded for First Admin Review & Approval.
            </p>
          </div>

          <form onSubmit={handleOnboard} className="space-y-3 text-xs">
            <div>
              <label className="block text-charcoal-700 mb-1 font-medium">Designated Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm cursor-pointer"
              >
                <option value="police_station">District Police Station Incharge</option>
                <option value="investigator">Field / Case Investigator</option>
                <option value="analyst">Forensic Financial Analyst</option>
                <option value="admin">System Administrator</option>
                <option value="hr">HR Personnel Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-charcoal-700 mb-1 font-medium">Officer / Staff Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Inspector Vikram Shinde"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-charcoal-700 mb-1 font-medium">Official Government Email</label>
              <input
                type="email"
                required
                placeholder="e.g. vikram.shinde@circuit.gov"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
              />
            </div>

            <div>
              <label className="block text-charcoal-700 mb-1 font-medium">Initial Secure Password</label>
              <input
                type="password"
                required
                placeholder="Assign temporary password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
              />
            </div>

            {formData.role === 'police_station' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-charcoal-700 mb-1 font-medium">District Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai South"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full p-2 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-charcoal-700 mb-1 font-medium">Police Station Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Colaba Cyber Crime PS"
                      value={formData.stationName}
                      onChange={(e) => setFormData({ ...formData, stationName: e.target.value })}
                      className="w-full p-2 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-charcoal-700 mb-1 font-medium">
                    Highest Ranking Incharge Officer Title
                  </label>
                  <select
                    value={formData.inchargeRank}
                    onChange={(e) => setFormData({ ...formData, inchargeRank: e.target.value })}
                    className="w-full p-2.5 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm cursor-pointer"
                  >
                    <option value="Senior Inspector / SHO">Senior Police Inspector / SHO</option>
                    <option value="Assistant Commissioner of Police (ACP)">Assistant Commissioner of Police (ACP)</option>
                    <option value="Deputy Superintendent of Police (DSP)">Deputy Superintendent of Police (DSP)</option>
                    <option value="Superintendent of Police (SP)">Superintendent of Police (SP)</option>
                    <option value="Sub-Inspector">Sub-Inspector (PSI)</option>
                  </select>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Badge / ID Number</label>
                <input
                  type="text"
                  placeholder="e.g. PS-MUM-891"
                  value={formData.badgeNumber}
                  onChange={(e) => setFormData({ ...formData, badgeNumber: e.target.value })}
                  className="w-full p-2 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
              <div>
                <label className="block text-charcoal-700 mb-1 font-medium">Contact Phone</label>
                <input
                  type="tel"
                  placeholder="e.g. +912222019944"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2 bg-white border border-beige-300 focus:border-charcoal-900 rounded-2xl text-charcoal-900 outline-none shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-full bg-charcoal-900 hover:bg-charcoal-800 text-beige-100 font-bold text-xs shadow-md shadow-charcoal-900/15 transition flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-beige-100 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Submit for Admin Review</span>
                  <ArrowRight className="w-4 h-4 text-beige-300" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Staff Directory & Onboarding Status Ledger (Right 2 Cols) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-beige-300 pb-3">
            <div>
              <h3 className="font-bold text-base text-charcoal-950">Personnel & Station Directory</h3>
              <p className="text-xs text-charcoal-600">Live credential status and administrative review ledger</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-beige-300 rounded-2xl text-xs text-charcoal-900 outline-none shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-beige-300 bg-white/60 text-charcoal-600 font-mono font-bold">
                  <th className="p-3 font-semibold">Staff / Officer Name</th>
                  <th className="p-3 font-semibold">Role & Station</th>
                  <th className="p-3 font-semibold">Incharge Rank</th>
                  <th className="p-3 font-semibold">Badge ID</th>
                  <th className="p-3 font-semibold text-right">Approval Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200">
                {filtered.map((p) => (
                  <tr key={p._id || p.email} className="hover:bg-white/70 transition">
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-bold text-charcoal-950 text-xs block">{p.name}</span>
                        <span className="text-[10px] text-charcoal-500 font-mono">{p.email}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="capitalize font-semibold text-charcoal-900 block">{p.role.replace('_', ' ')}</span>
                        {p.stationName && (
                          <span className="text-[10px] text-charcoal-500 block truncate max-w-xs">
                            {p.stationName} ({p.district})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-charcoal-800 text-[11px]">
                        {p.inchargeRank || 'Officer'}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-charcoal-600">{p.badgeNumber || '—'}</td>
                    <td className="p-3 text-right">
                      {p.status === 'pending_approval' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-bold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Pending Admin Review</span>
                        </span>
                      ) : p.status === 'rejected' ? (
                        <span className="px-3 py-1 rounded-full text-[10px] bg-red-100 text-red-700 border border-red-200 font-bold inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified & Active</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
