import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Zap, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function PremiumCalculator() {
  const [data, setData] = useState({
    platformsCount: 1,
    daysPerWeek: 5,
    shiftTiming: 'Morning'
  });

  const [premiumData, setPremiumData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    recalculate();
  }, [data]);

  const recalculate = async () => {
    setLoading(true);
    const shiftMap: Record<string, number> = { 'Morning': 0, 'Evening': 1, 'Night': 2 };
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/premium/calculate`, {
        zone_rain_frequency_2yr: 0.15,
        zone_flood_events_2yr: 1,
        zone_heat_days_2yr: 10,
        zone_avg_aqi: 150.0,
        platforms_count: data.platformsCount,
        days_per_week: data.daysPerWeek,
        shift_timing_encoded: shiftMap[data.shiftTiming],
        weekly_income: 4000,
        savings_encoded: 1, // Medium
        disruption_frequency_encoded: 1 // Sometimes
      });
      setPremiumData(response.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getGaugeColor = (score: number) => {
    if (score <= 30) return '#10b981'; // emerald
    if (score <= 65) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const gaugeData = premiumData ? [
    { name: 'Score', value: premiumData.risk_score },
    { name: 'Remainder', value: 100 - premiumData.risk_score }
  ] : [];

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-24 text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dynamic Premium Scorer</h1>
          <p className="text-slate-400">See how your work patterns affect your risk pool</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                <h3 className="text-xl font-bold text-white mb-4">Risk Factors</h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3">Platforms working on</label>
                  <div className="flex gap-2">
                    {[1, 2, 3].map(n => (
                      <button key={n} 
                        onClick={() => setData(p => ({...p, platformsCount: n}))}
                         className={`flex-1 py-3 rounded-xl font-bold transition-all ${data.platformsCount === n ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-slate-400">Days per week</label>
                    <span className="text-emerald-400 font-bold">{data.daysPerWeek}</span>
                  </div>
                  <input type="range" min="1" max="7" value={data.daysPerWeek} 
                    onChange={e => setData(p => ({...p, daysPerWeek: parseInt(e.target.value)}))} 
                    className="w-full accent-emerald-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3">Shift Timing</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Morning', 'Evening', 'Night'].map(shift => (
                      <button key={shift} 
                         onClick={() => setData(p => ({...p, shiftTiming: shift}))}
                         className={`py-2 rounded-xl text-sm font-medium transition-all ${data.shiftTiming === shift ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                        {shift}
                      </button>
                    ))}
                  </div>
                </div>
             </div>

             {/* What If Simulator suggestions */}
             <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 text-indigo-300 font-semibold mb-3">
                  <Zap size={18} />
                  What-if Simulator
                </div>
                {data.shiftTiming === 'Night' && (
                  <p className="text-sm text-indigo-200">✨ Switching to Morning shift drops your score by ~12 pts and could downgrade your premium tier.</p>
                )}
                {data.platformsCount === 3 && (
                  <p className="text-sm text-indigo-200 mt-2">✨ Limiting to 2 platforms reduces exposure multiplier safely.</p>
                )}
                {data.shiftTiming !== 'Night' && data.platformsCount < 3 && (
                  <p className="text-sm text-indigo-200">✨ You are running an optimized work profile. Your multiplier is low!</p>
                )}
             </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Gauge Card */}
               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center relative min-h-[300px]">
                 {loading && <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-[1px] flex items-center justify-center z-10"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}
                 
                 <h3 className="absolute top-6 left-6 text-slate-400 font-semibold">Live Risk Score</h3>
                 
                 {premiumData && (
                   <div className="w-full h-[200px] mt-8 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={gaugeData}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={80}
                            outerRadius={110}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell key="cell-0" fill={getGaugeColor(premiumData.risk_score)} />
                            <Cell key="cell-1" fill="#1e293b" />
                          </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                        <span className="text-5xl font-black" style={{color: getGaugeColor(premiumData.risk_score)}}>
                          {premiumData.risk_score}
                        </span>
                        <span className="text-sm font-bold tracking-wider uppercase mt-1" style={{color: getGaugeColor(premiumData.risk_score)}}>
                          {premiumData.risk_label} RISK
                        </span>
                     </div>
                   </div>
                 )}
               </div>

               {/* Recommendation Card */}
               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col min-h-[300px]">
                 <h3 className="text-slate-400 font-semibold mb-4">Recommendation</h3>
                 
                 {premiumData && (
                   <div className="flex-1 flex flex-col gap-4">
                      <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5 relative overflow-hidden group">
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
                        <div className="flex items-center gap-2 mb-2">
                           <CheckCircle className="text-emerald-500 w-5 h-5" />
                           <span className="font-bold text-white capitalize">{premiumData.recommended_plan} Plan</span>
                        </div>
                        <div className="text-sm text-slate-400">Optimum coverage for your risk pool</div>
                        <div className="mt-4 text-3xl font-bold text-emerald-400">₹{premiumData.premium_amount}<span className="text-sm font-normal text-slate-500"> /wk</span></div>
                      </div>

                      {premiumData.premium_amount > premiumData.budget_premium && (
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
                           <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />
                           <div>
                             <h4 className="text-amber-500 font-semibold text-sm">Budget Warning</h4>
                             <p className="text-xs text-amber-200/70 mt-1">
                               This exceeds your stated budget. The best plan within budget is the 
                               <span className="font-bold px-1 capitalize">{premiumData.budget_plan}</span> plan at ₹{premiumData.budget_premium}/wk.
                             </p>
                           </div>
                        </div>
                      )}
                   </div>
                 )}
               </div>
            </div>

            {/* Score Breakdown */}
             <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
               <h3 className="text-slate-400 font-semibold mb-6 flex items-center gap-2">
                 <Info size={18}/>
                 Score Breakdown
               </h3>
               
               {premiumData && premiumData.score_breakdown && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    {Object.entries(premiumData.score_breakdown).map(([factor, details]: any) => (
                      <div key={factor} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0 md:last:border-b-0">
                         <span className="text-sm text-slate-300">{factor}</span>
                         <div className="flex items-center gap-3">
                           <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                             <div className="h-full bg-slate-500" style={{width: `${Math.min((details.points / 30) * 100, 100)}%`}}></div>
                           </div>
                           <span className="text-sm font-mono text-emerald-400 w-8 text-right">+{details.points}</span>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
