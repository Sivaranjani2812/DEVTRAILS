import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Zap, CheckCircle, Info, Shield, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const PLANS = [
  {
    id: 'basic',
    name: 'Basic Shield',
    price: 49,
    triggers: ['Rain'],
    maxPayout: '₹400/week',
    color: 'border-[#E2E8F0]',
    badge: '',
    tagline: 'Essential rain cover'
  },
  {
    id: 'standard',
    name: 'Standard Guard',
    price: 89,
    triggers: ['Rain', 'Flood', 'Heat', 'App Outage'],
    maxPayout: '₹700/week',
    color: 'border-[#2563EB]',
    badge: 'RECOMMENDED',
    tagline: 'Best value for most workers'
  },
  {
    id: 'premium',
    name: 'Premium Fort',
    price: 149,
    triggers: ['Rain', 'Flood', 'Heat', 'Pollution', 'Zone Shutdown', 'App Outage'],
    maxPayout: '₹1000/week',
    color: 'border-amber-500',
    badge: 'ALL RISKS',
    tagline: 'Full 6-trigger protection'
  }
];

export default function PremiumCalculator() {
  const navigate = useNavigate();
  const [data, setData] = useState({ platformsCount: 1, daysPerWeek: 5, shiftTiming: 'Morning' });
  const [premiumData, setPremiumData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [activePlanId, setActivePlanId] = useState<string | null>(null);
  const workerId = Number(localStorage.getItem('userId')) || 1;

  useEffect(() => { recalculate(); }, [data]);

  useEffect(() => {
    // Check if worker already has a policy
    axios.get(`${API}/workers/dashboard/${workerId}`)
      .then(r => { if (r.data.plan_id) setActivePlanId(r.data.plan_id); })
      .catch(() => {});
  }, [workerId]);

  const recalculate = async () => {
    setLoading(true);
    const shiftMap: Record<string, number> = { 'Morning': 0, 'Evening': 1, 'Night': 2 };
    try {
      const response = await axios.post(`${API}/premium/calculate`, {
        zone_rain_frequency_2yr: 0.15,
        zone_flood_events_2yr: 1,
        zone_heat_days_2yr: 10,
        zone_avg_aqi: 150.0,
        platforms_count: data.platformsCount,
        days_per_week: data.daysPerWeek,
        shift_timing_encoded: shiftMap[data.shiftTiming],
        weekly_income: 4000,
        savings_encoded: 1,
        disruption_frequency_encoded: 1
      });
      setPremiumData(response.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSubscribe = async (planId: string) => {
    setSubscribing(planId);
    try {
      await axios.post(`${API}/policies/subscribe`, {
        worker_id: workerId,
        plan_id: planId
      });
      setActivePlanId(planId);
      toast.success(`🎉 Subscribed to ${PLANS.find(p => p.id === planId)?.name}! You're now covered.`);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to subscribe';
      toast.error(msg);
    } finally {
      setSubscribing(null);
    }
  };

  const getGaugeColor = (score: number) => score <= 30 ? '#10B981' : score <= 65 ? '#F59E0B' : '#EF4444';
  const gaugeData = premiumData ? [
    { name: 'Score', value: premiumData.risk_score },
    { name: 'Remainder', value: 100 - premiumData.risk_score }
  ] : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 pb-24 text-[#0F172A] font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-3xl font-black text-[#0F172A] mb-1">Premium Calculator</h1>
            <p className="text-[#64748B] font-medium">Adjust your work profile to see your personalised risk score and pick a plan.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#64748B] hover:text-[#2563EB] transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
        </div>

        {/* Controls + Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 space-y-8 shadow-sm">
              <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Risk Factor Customization</h3>

              <div>
                <label className="block text-[11px] font-black text-[#64748B] uppercase tracking-widest mb-4">Platforms working on</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(n => (
                    <button key={n} onClick={() => setData(p => ({...p, platformsCount: n}))}
                      className={`flex-1 py-3 rounded-xl font-black transition-all ${data.platformsCount === n ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1]'}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[11px] font-black text-[#64748B] uppercase tracking-widest">Days per week</label>
                  <span className="text-[#059669] font-black">{data.daysPerWeek}</span>
                </div>
                <input type="range" min="1" max="7" value={data.daysPerWeek}
                  onChange={e => setData(p => ({...p, daysPerWeek: parseInt(e.target.value)}))}
                  className="w-full accent-[#059669] h-2 bg-[#F1F5F9] rounded-lg appearance-none cursor-pointer" />
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#64748B] uppercase tracking-widest mb-4">Shift Timing</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Morning', 'Evening', 'Night'].map(shift => (
                    <button key={shift} onClick={() => setData(p => ({...p, shiftTiming: shift}))}
                      className={`py-2 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${data.shiftTiming === shift ? 'bg-[#2563EB] text-white' : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1]'}`}>
                      {shift}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-[#2563EB] font-black text-xs uppercase tracking-widest mb-2"><Zap size={14} /> Optimization Tip</div>
              {data.shiftTiming === 'Night' && <p className="text-[11px] text-blue-700 font-bold leading-relaxed">Switching from Night to Morning reduces your environmental risk score by ~15% due to lower exposure to extreme weather incidents.</p>}
              {data.platformsCount === 3 && <p className="text-[11px] text-blue-700 font-bold leading-relaxed mt-2">Working for 3+ platforms increases multi-app disruption risk. Limiting active platforms can lower your premium.</p>}
              {data.shiftTiming !== 'Night' && data.platformsCount < 3 && <p className="text-[11px] text-blue-700 font-bold leading-relaxed">Your current work profile is highly optimized for low volatility and steady insurance premiums.</p>}
            </div>
          </div>

          {/* Gauge + Breakdown */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col items-center justify-center relative min-h-[300px] shadow-sm">
                {loading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-3xl"><div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div></div>}
                <h3 className="absolute top-5 left-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">Actuarial Risk Score</h3>
                {premiumData && (
                  <div className="w-full h-[200px] mt-6 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={gaugeData} cx="50%" cy="100%" startAngle={180} endAngle={0} innerRadius={80} outerRadius={110} paddingAngle={0} dataKey="value" stroke="none">
                          <Cell key="c0" fill={getGaugeColor(premiumData.risk_score)} />
                          <Cell key="c1" fill="#F1F5F9" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                      <span className="text-5xl font-black" style={{color: getGaugeColor(premiumData.risk_score)}}>{premiumData.risk_score}</span>
                      <span className="text-[10px] font-black tracking-widest uppercase mt-1" style={{color: getGaugeColor(premiumData.risk_score)}}>{premiumData.risk_label} RISK PROFILE</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 flex flex-col min-h-[300px] shadow-sm">
                <h3 className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest mb-6 border-b border-[#F1F5F9] pb-4">Actuarial Weighting</h3>
                {premiumData?.score_breakdown && (
                  <div className="space-y-4 flex-1">
                    {Object.entries(premiumData.score_breakdown).map(([factor, details]: any) => (
                      <div key={factor} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                            <span className="text-[#64748B] uppercase tracking-tight">{factor}</span>
                            <span className="text-[#0F172A] font-black">+{details.points} pts</span>
                        </div>
                        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                            <div className="h-full bg-[#2563EB]" style={{width: `${Math.min((details.points / 30) * 100, 100)}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Plan Cards */}
        <div>
          <div className="flex flex-col gap-1 mb-8">
            <span className="text-[11px] font-black text-[#2563EB] uppercase tracking-widest">Ready to Protect Your Income?</span>
            <h2 className="text-2xl font-black text-[#0F172A]">Compare Tailored Guard Plans</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => {
              const isActive = activePlanId === plan.id;
              const isRecommended = premiumData?.recommended_plan?.toLowerCase() === plan.id;
              return (
                <div key={plan.id} className={`relative border-2 rounded-3xl p-8 flex flex-col transition-all shadow-sm ${isActive ? 'border-[#059669] bg-emerald-50/30' : isRecommended ? 'border-[#2563EB] bg-white ring-4 ring-blue-50' : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1]'}`}>
                  {plan.badge && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${plan.id === 'standard' ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/20' : 'bg-amber-500 text-white'}`}>
                      {isActive ? '✓ ACTIVE POLICY' : plan.badge}
                    </div>
                  )}
                  {isActive && !plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-[#059669] text-white">✓ ACTIVE POLICY</div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-black text-[#0F172A]">{plan.name}</h3>
                    <p className="text-[#64748B] text-xs font-bold mt-1 uppercase tracking-tighter">{plan.tagline}</p>
                  </div>

                  <div className="mb-8">
                    <span className="text-5xl font-black text-[#0F172A]">₹{plan.price}</span>
                    <span className="text-[#94A3B8] font-bold text-sm">/week</span>
                  </div>

                  <div className="space-y-3 mb-8 flex-1 border-t border-[#F1F5F9] pt-6">
                    {plan.triggers.map(t => (
                      <div key={t} className="flex items-center gap-3 text-sm font-bold">
                        <CheckCircle size={16} className="text-[#059669] flex-shrink-0" />
                        <span className="text-[#475569]">{t} Disruption</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-3 text-sm mt-4 pt-4 border-t border-[#F1F5F9]">
                      <Star size={16} className="text-[#F59E0B] flex-shrink-0" />
                      <span className="text-[#F59E0B] font-black uppercase text-[10px] tracking-widest">Max Payout: {plan.maxPayout}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => !isActive && handleSubscribe(plan.id)}
                    disabled={isActive || subscribing === plan.id}
                    className={`w-full py-4 rounded-2xl font-black transition-all text-sm uppercase tracking-widest ${
                      isActive
                        ? 'bg-emerald-100 text-[#059669] cursor-default'
                        : isRecommended
                        ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-lg shadow-blue-500/30'
                        : 'bg-[#0F172A] hover:bg-black text-white'
                    } disabled:opacity-60`}
                  >
                    {subscribing === plan.id ? (
                      <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> VERIFYING...</span>
                    ) : isActive ? '✓ SUBSCRIBED' : `Get ${plan.id}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white border border-[#E2E8F0] rounded-2xl p-6 text-sm shadow-sm">
          <Info size={18} className="text-[#2563EB] flex-shrink-0 mt-0.5" />
          <p className="text-[#64748B] font-medium leading-relaxed">
            <strong className="text-[#0F172A]">Parametric Guarantee:</strong> Payouts are triggered automatically via GigShield Engine when weather or platform conditions breach defined actuarial thresholds. No human intervention or manual claims needed.
          </p>
        </div>
      </div>
    </div>
  );
}
