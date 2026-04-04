import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Shield, Activity, Zap, CloudRain, Flame, Wind, AlertTriangle, FileText, Calculator, ChevronRight, Star } from 'lucide-react';
import ShiftCheckIn from '../../components/ShiftCheckIn';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const MOCK_WEATHER = {
  rain: { label: 'Rainfall', value: '2.1mm', status: 'safe', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
  heat: { label: 'Temperature', value: '31°C', status: 'safe', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' },
  aqi: { label: 'AQI', value: '87', status: 'safe', icon: Wind, color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
  alert: { label: 'NDMA Alert', value: 'None', status: 'safe', icon: AlertTriangle, color: 'text-slate-400', bg: 'bg-slate-50 border-slate-200' },
};

function RiskGauge({ score }: { score: number }) {
  const color = score > 70 ? '#EF4444' : score > 45 ? '#F59E0B' : '#10B981';
  const label = score > 70 ? 'High' : score > 45 ? 'Moderate' : 'Low';
  const pct = (score / 100) * 100;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F5F9" strokeWidth="10" />
          <circle
            cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${2.64 * pct} ${264 - 2.64 * pct}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span className="text-2xl font-black text-[#0F172A]">{score}</span>
          <span className="text-[10px] text-[#94A3B8] font-bold">/ 100</span>
        </div>
      </div>
      <span className="text-sm font-black" style={{ color }}>{label} Risk</span>
    </div>
  );
}

export default function Dashboard() {
  const workerId = Number(localStorage.getItem('userId')) || 1;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/workers/dashboard/${workerId}`)
      .then(r => setData(r.data))
      .catch(e => console.error('Dashboard fetch failed:', e))
      .finally(() => setLoading(false));
  }, [workerId]);

  const name = data?.worker_name || 'Worker';
  const riskScore = data?.risk_score || 65;
  const activePlan = data?.active_plan;
  const recentClaims = data?.recent_claims || [];
  const totalPayouts = data?.total_payouts_received || 0;
  const surgeActive = data?.surge_active;
  const surgeMultiplier = data?.surge_multiplier || 1;
  const policyStatus = data?.policy_status || 'none';

  if (loading) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#2563EB] border-t-transparent animate-spin" />
        <p className="text-[#64748B] text-sm font-bold">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 pb-24 text-[#0F172A] font-sans">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-start pt-4">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A]">Welcome back, {name.split(' ')[0]} 👋</h1>
            <p className="text-[#64748B] text-sm mt-1 font-medium">GigShield is actively protecting your income.</p>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-black uppercase tracking-widest px-3 py-1 bg-white border border-[#E2E8F0] rounded-full text-[#64748B] shadow-sm">ID #{workerId}</div>
            {surgeActive && (
              <div className="mt-2 text-[10px] px-3 py-1 bg-amber-100 border border-amber-200 rounded-full text-amber-700 font-black uppercase tracking-tight">
                ⚡ {surgeMultiplier}x Surge Pricing
              </div>
            )}
          </div>
        </div>

        {/* Top Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Risk Score', value: riskScore, icon: Activity, color: 'text-amber-600', bg: 'bg-white', suffix: '/100' },
            { label: 'Active Plan', value: activePlan || 'No Plan', icon: Shield, color: 'text-[#2563EB]', bg: 'bg-white', suffix: '' },
            { label: 'Total Payout', value: `₹${totalPayouts}`, icon: Zap, color: 'text-[#059669]', bg: 'bg-white', suffix: '' },
            { label: 'Status', value: policyStatus.toUpperCase(), icon: Star, color: policyStatus === 'active' ? 'text-[#059669]' : 'text-slate-400', bg: 'bg-white', suffix: '' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} border border-[#E2E8F0] rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} className={stat.color} />
                <span className="text-[10px] text-[#94A3B8] font-black uppercase tracking-widest">{stat.label}</span>
              </div>
              <div className={`text-xl font-black ${stat.color}`}>{stat.value}<span className="text-sm text-[#94A3B8] font-normal">{stat.suffix}</span></div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Shift Check-In (spans 2 cols) */}
          <div className="lg:col-span-2">
            <ShiftCheckIn workerId={workerId} />
          </div>

          {/* Risk + Weather */}
          <div className="space-y-4">
            {/* Risk Profile */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm">
              <h2 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-4">Risk Profile Analysis</h2>
              <div className="flex items-center gap-6">
                <RiskGauge score={riskScore} />
                <div className="flex-1 text-sm space-y-3">
                  <div className="flex justify-between items-center"><span className="text-[#64748B] font-medium">Suggestion</span> <span className="font-black text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded text-xs">{data?.recommended_plan || 'Standard'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-[#64748B] font-medium">Income</span> <span className="font-black text-[#0F172A]">₹{data?.weekly_income?.toLocaleString() || '—'}/wk</span></div>
                  <div className="flex justify-between items-center"><span className="text-[#64748B] font-medium">Zone</span> <span className="font-black text-[#0F172A]">{data?.city || '—'}</span></div>
                </div>
              </div>
            </div>

            {/* Live Conditions */}
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm">
              <h2 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-3">Live Conditions (Area)</h2>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(MOCK_WEATHER).map(w => (
                  <div key={w.label} className={`border rounded-2xl p-3 ${w.bg}`}>
                    <w.icon size={16} className={`${w.color} mb-1`} />
                    <div className={`text-sm font-black ${w.color}`}>{w.value}</div>
                    <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-tight">{w.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Policy Summary */}
        {!activePlan ? (
          <div className="bg-white border-2 border-dashed border-[#E2E8F0] rounded-3xl p-10 text-center">
            <Shield className="mx-auto h-12 w-12 text-[#CBD5E1] mb-4" />
            <h3 className="text-xl font-black text-[#0F172A] mb-2">No Active Policy</h3>
            <p className="text-[#64748B] text-sm mb-6 max-w-sm mx-auto font-medium">Protect your income today. Automated payouts for rainfall, heatwaves, and platform outages.</p>
            <button onClick={() => navigate('/premium')} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20">
              Get Covered → View Plans
            </button>
          </div>
        ) : (
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2"><Shield size={22} className="text-[#2563EB]" /> Active Coverage</h2>
              <button onClick={() => navigate('/policy')} className="text-xs font-black uppercase tracking-widest text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">Manage <ChevronRight size={14} /></button>
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {(data?.triggers_covered || []).map((t: string) => (
                <span key={t} className="px-3 py-1 bg-emerald-50 text-[#059669] border border-emerald-100 rounded-full text-[10px] font-black uppercase">✓ {t}</span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-[#F1F5F9]">
              <div><div className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest mb-1">Weekly Premium</div><div className="font-black text-[#0F172A] text-lg">₹{data?.weekly_premium}</div></div>
              <div><div className="text-[#94A3B8] text-[10px] font-black uppercase tracking-widest mb-1">Max Payout/Week</div><div className="font-black text-[#059669] text-lg">₹{data?.max_payout_per_week}</div></div>
            </div>
          </div>
        )}

        {/* Recent Claims */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2 font-black"><FileText size={22} className="text-[#64748B]" /> Recent Activity</h2>
            <button onClick={() => navigate('/claims')} className="text-xs font-black uppercase tracking-widest text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full transition-colors">History <ChevronRight size={14} /></button>
          </div>
          {recentClaims.length === 0 ? (
            <div className="text-center py-10 text-[#94A3B8] text-sm font-medium border border-dashed border-[#F1F5F9] rounded-2xl bg-[#F8FAFC]">No claims yet. Auto-payouts trigger during active shifts.</div>
          ) : (
            <div className="space-y-3">
              {recentClaims.map((c: any) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-[#F1F5F9] rounded-2xl hover:border-[#E2E8F0] transition-all group">
                  <div>
                    <div className="font-black text-[#0F172A] text-sm group-hover:text-[#2563EB] transition-colors">{c.trigger_type} — {c.zone}</div>
                    <div className="text-[10px] text-[#94A3B8] font-bold mt-0.5">{new Date(c.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-[#059669]">₹{c.payout_amount}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-tight ${c.status === 'paid' ? 'bg-emerald-100 text-[#059669]' : 'bg-amber-100 text-amber-700'}`}>{c.status.replace(/_/g,' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
