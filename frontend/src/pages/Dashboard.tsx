import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useWorker } from "../context/WorkerContext";
import { Zap, Calendar, Shield, Activity, RefreshCw } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Bar, Line } from "recharts";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { format } from "date-fns";

export default function Dashboard() {
  const { profile, policy, loading: workerLoading } = useWorker();
  
  const [claims, setClaims] = useState<any[]>([]);
  const [liveTriggers, setLiveTriggers] = useState<any[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  
  const [loadingClaims, setLoadingClaims] = useState(true);
  const [loadingTriggers, setLoadingTriggers] = useState(true);
  const [loadingEarnings, setLoadingEarnings] = useState(true);
  const [loadingPayouts, setLoadingPayouts] = useState(true);

  const fetchDashboardData = () => {
    setLoadingClaims(true);
    setLoadingTriggers(true);
    setLoadingEarnings(true);
    setLoadingPayouts(true);

    api.get("/api/workers/claims?limit=3")
      .then(res => setClaims(res.data))
      .catch(() => setClaims([]))
      .finally(() => setLoadingClaims(false));

    api.get("/api/triggers/live")
      .then(res => setLiveTriggers(res.data))
      .catch(() => setLiveTriggers([]))
      .finally(() => setLoadingTriggers(false));
      
    api.get("/api/workers/earnings-history")
      .then(res => setEarningsHistory(res.data))
      .catch(() => setEarningsHistory([]))
      .finally(() => setLoadingEarnings(false));

    api.get("/api/workers/payout-history")
      .then(res => setPayoutHistory(res.data))
      .catch(() => setPayoutHistory([]))
      .finally(() => setLoadingPayouts(false));
  };

  useEffect(() => {
    if (!workerLoading && profile) {
      fetchDashboardData();
    }
  }, [workerLoading, profile]);

  if (workerLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          <div className="h-20 skeleton w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-32 skeleton rounded-2xl"></div>
            <div className="h-32 skeleton rounded-2xl"></div>
            <div className="h-32 skeleton rounded-2xl"></div>
            <div className="h-32 skeleton rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const protectedAmount = claims.reduce((acc, c) => acc + (c.status === "Approved" || c.status === "Auto Approved" ? c.amount : 0), 0);
  const coveragePercent = policy ? policy.coveragePercent || 75 : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* TOP GREETING BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-[24px] font-[800] text-[#0F172A]">Good morning, {profile?.name || "Worker"}</h1>
            <p className="text-[14px] text-[#64748B]">
              {policy ? `${policy.name} plan · Active until ${policy.validUntil ? format(new Date(policy.validUntil), 'MMM d, yyyy') : 'N/A'}` : "No active policy"}
            </p>
          </div>
          {policy && policy.status === "ACTIVE" && (
            <div className="bg-[#DBEAFE] text-[#1D4ED8] px-4 py-2 rounded-xl border border-[#BFDBFE] mt-4 md:mt-0 shadow-sm flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#2563EB]" />
              <span className="font-semibold text-[14px]">This week: {coveragePercent}% protected</span>
            </div>
          )}
        </div>

        {/* ROW 1 — 4 STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="card-base p-5 flex flex-col justify-between">
            <h3 className="text-[14px] font-[600] text-[#64748B] mb-2 uppercase tracking-wide">Coverage status</h3>
            {policy ? (
              <div>
                <span className={`status-badge mb-1 ${policy.status === "ACTIVE" ? "bg-[#D1FAE5] text-[#059669]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
                  {policy.status}
                </span>
                <p className="text-[12px] text-[#94A3B8] font-medium mt-1">{policy.name} Plan • Val {policy.startDate ? format(new Date(policy.startDate), 'MMM d') : ''}-{policy.endDate ? format(new Date(policy.endDate), 'MMM d') : ''}</p>
              </div>
            ) : (
              <div>
                <span className="status-badge bg-[#FEE2E2] text-[#DC2626]">INACTIVE</span>
                <Link to="/subscription" className="text-[12px] block text-[#2563EB] font-medium mt-1 hover:underline">Get Covered →</Link>
              </div>
            )}
          </div>

          <div className="card-base p-5 flex flex-col justify-between">
            <h3 className="text-[14px] font-[600] text-[#64748B] mb-2 uppercase tracking-wide">Weekly premium</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[28px] font-[800] text-[#0F172A] leading-none">₹{profile?.weeklyPremium || 0}</p>
                <p className="text-[12px] text-[#94A3B8] font-medium mt-1">Auto-renews Next Monday</p>
              </div>
              <Calendar className="w-6 h-6 text-[#94A3B8]" />
            </div>
          </div>

          <div className="card-base p-5 flex flex-col justify-between">
            <h3 className="text-[14px] font-[600] text-[#64748B] mb-2 uppercase tracking-wide">Protected this month</h3>
            <div>
              <p className="text-[28px] font-[800] text-[#059669] leading-none">₹{protectedAmount}</p>
              <p className="text-[12px] text-[#94A3B8] font-medium mt-1">{claims.length} disruptions covered</p>
            </div>
          </div>

          <div className="card-base p-5 flex flex-col justify-between border-l-4 border-l-[#D97706]">
            <h3 className="text-[14px] font-[600] text-[#64748B] mb-2 uppercase tracking-wide">Avg payout time</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[28px] font-[800] text-[#0F172A] leading-none">42s</p>
                <p className="text-[12px] text-[#94A3B8] font-medium mt-1">Fully automated</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#D97706]" />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          
          {/* LEFT 60% (3 cols out of 5) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Earnings Chart */}
            <div className="card-base p-6">
              <h2 className="text-[16px] font-[700] text-[#0F172A] mb-6">Earnings protection history</h2>
              {loadingEarnings ? (
                <div className="h-[250px] w-full skeleton"></div>
              ) : earningsHistory.length === 0 ? (
                <div className="h-[250px] w-full flex flex-col items-center justify-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
                  <Activity className="w-8 h-8 text-[#94A3B8] mb-2" />
                  <p className="text-[#0F172A] font-[600]">Start working to see your earnings chart</p>
                  <p className="text-[#64748B] text-[13px] mt-1">Your data will appear here soon.</p>
                </div>
              ) : (
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earningsHistory} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorProtected" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#059669" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                      <YAxis tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                        itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                        labelStyle={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="actualEarnings" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorEarnings)" />
                      <Area type="monotone" dataKey="protectedAmount" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorProtected)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Recent Claims */}
            <div className="card-base p-0 overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
                <h2 className="text-[16px] font-[700] text-[#0F172A]">Recent claims</h2>
                <Link to="/claims" className="text-[13px] font-[600] text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                  View all claims →
                </Link>
              </div>
              
              {loadingClaims ? (
                <div className="p-6 space-y-4">
                  <div className="h-16 skeleton w-full rounded-xl"></div>
                  <div className="h-16 skeleton w-full rounded-xl"></div>
                </div>
              ) : claims.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <div className="w-12 h-12 bg-[#DBEAFE] rounded-full flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <h3 className="text-[#0F172A] font-[700] mb-2 text-[15px]">No claims yet — that's great!</h3>
                  <p className="text-[#64748B] text-[13px] max-w-sm">When a disruption hits your area, a parametric trigger will instantly create a claim here automatically.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E2E8F0]">
                  {claims.slice(0, 3).map((claim, idx) => (
                    <div key={idx} className="p-5 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#F1F5F9] flex items-center justify-center">
                          <Activity className="w-5 h-5 text-[#64748B]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-[600] text-[#0F172A]">{claim.triggerName}</p>
                          <p className="text-[12px] text-[#94A3B8]">{claim.date ? format(new Date(claim.date), 'MMM d, h:mm a') : 'Unknown time'}</p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[14px] font-[700] text-[#0F172A] mb-1">
                          {claim.amount ? `₹${claim.amount}` : '-'}
                        </span>
                        <span className={`status-badge !text-[11px] !py-0.5 ${
                          claim.status?.includes("Approved") ? "bg-[#D1FAE5] text-[#059669]" :
                          claim.status?.includes("Review") ? "bg-[#FEF3C7] text-[#D97706]" :
                          "bg-[#FEE2E2] text-[#DC2626]"
                        }`}>
                          {claim.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>

          {/* RIGHT 40% (2 cols out of 5) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-base p-0 overflow-hidden h-full flex flex-col border-t-4 border-t-[#2563EB]">
              <div className="px-6 py-5 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
                <div>
                  <h2 className="text-[16px] font-[700] text-[#0F172A] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#2563EB]" /> Live system monitor
                  </h2>
                  <p className="text-[11px] text-[#94A3B8] uppercase tracking-wider font-[600] mt-1">
                    Last polled: {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <button onClick={fetchDashboardData} className="w-8 h-8 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#64748B] hover:text-[#2563EB] hover:bg-[#F8FAFC] transition-all" title="Refresh Triggers">
                  <RefreshCw className={`w-4 h-4 ${loadingTriggers ? "animate-spin text-[#2563EB]" : ""}`} />
                </button>
              </div>

              <div className="flex-1 p-0 flex flex-col">
                {loadingTriggers ? (
                  <div className="p-6 space-y-5">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-4 items-center">
                         <div className="w-2 h-2 rounded-full skeleton"></div>
                         <div className="flex-1 h-8 skeleton rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : liveTriggers.length === 0 ? (
                  <div className="p-10 text-center flex-1 flex flex-col justify-center bg-[#F8FAFC]">
                     <Shield className="w-8 h-8 text-[#94A3B8] mx-auto mb-3 opacity-50" />
                     <p className="text-[#0F172A] font-[600] text-[14px]">Triggers offline</p>
                     <p className="text-[#64748B] text-[12px] mt-1">Showing cached structural layout without data.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E2E8F0] flex-1">
                    {liveTriggers.map((t, idx) => {
                      const isCritical = t.status === "critical" || t.status === "danger";
                      const isWarning = t.status === "warning";
                      
                      return (
                        <div key={idx} className="p-5 flex flex-col gap-2 hover:bg-[#F8FAFC] transition-colors relative">
                          <div className="flex justify-between items-start">
                             <div className="flex items-center gap-3">
                                <span className={`w-2.5 h-2.5 rounded-full shadow-sm animate-pulse
                                  ${isCritical ? 'bg-[#DC2626] shadow-[#DC2626]/40' : 
                                    isWarning ? 'bg-[#D97706] shadow-[#D97706]/40' : 
                                    'bg-[#059669] shadow-[#059669]/40'}`} 
                                />
                                <span className="text-[14px] font-[600] text-[#0F172A]">{t.name}</span>
                             </div>
                             <span className={`status-badge !text-[10px] !py-0.5 uppercase tracking-widest
                               ${isCritical ? "bg-[#FEE2E2] text-[#DC2626]" : 
                                 isWarning ? "bg-[#FEF3C7] text-[#D97706]" : 
                                 "bg-[#D1FAE5] text-[#059669]"}`}>
                               {t.status}
                             </span>
                          </div>
                          
                          <div className="flex justify-between items-center ml-5.5 mt-1">
                             <span className="text-[20px] font-[800] text-[#0F172A] tracking-tight">{t.value}</span>
                             <span className="text-[11px] text-[#94A3B8] font-[500] uppercase">Threshold: {t.threshold}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ROW 3 — Full Width Timeline */}
        <div className="card-base p-6">
          <div className="mb-6">
            <h2 className="text-[16px] font-[700] text-[#0F172A]">Historical performance timeline</h2>
            <p className="text-[13px] text-[#64748B] mt-1">Premiums paid vs. Payouts received over the last 6 months.</p>
          </div>

          {loadingPayouts ? (
            <div className="h-[300px] w-full skeleton rounded-xl"></div>
          ) : payoutHistory.length === 0 ? (
            <div className="h-[300px] w-full flex flex-col items-center justify-center bg-[#F8FAFC] rounded-xl border border-dashed border-[#CBD5E1]">
               <Activity className="w-8 h-8 text-[#94A3B8] mb-2" />
               <p className="text-[#0F172A] font-[600]">No timeline data found</p>
            </div>
          ) : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={payoutHistory} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} />
                  <YAxis tick={{fontSize: 12, fill: '#64748B'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}
                    itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                  />
                  <Bar dataKey="payouts" barSize={32} fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="premium" stroke="#059669" strokeWidth={3} dot={{r:4, fill: '#059669', strokeWidth: 2, stroke: '#FFF'}} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        
      </main>
    </div>
  );
}
