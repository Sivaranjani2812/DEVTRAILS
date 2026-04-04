import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Clock, CheckCircle2, XCircle } from 'lucide-react';
import ShiftCheckIn from '../../components/ShiftCheckIn';

export default function Policy() {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const workerId = Number(localStorage.getItem('userId')) || 1; // Default to 1 for demo if lost

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/dashboard/${workerId}`);
      setDashboardData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getTriggers = (planName: string) => {
    const defaultTriggers = ['Rain', 'Flood', 'Heat', 'Pollution', 'Zone Shutdown', 'App Outage'];
    let covered = ['Rain'];
    if (planName === 'Standard') covered = ['Rain', 'Flood', 'Heat', 'App Outage'];
    if (planName === 'Premium') covered = defaultTriggers;
    
    return defaultTriggers.map(t => ({
      name: t,
      covered: covered.includes(t)
    }));
  };

  if (!dashboardData) return <div className="p-8 text-white">Loading config...</div>;

  const planName = dashboardData.active_plan || 'No Active Plan';
  const triggers = getTriggers(planName);

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-24 text-slate-200 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white mb-8">Policy Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Plan Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="text-emerald-500 h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold text-white">{planName}</h2>
                  <p className="text-sm text-slate-400">Current active plan</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-6">
               <div className="flex justify-between items-center text-sm">
                 <span className="text-slate-400 flex items-center gap-2"><Clock size={16}/> Next Renewal</span>
                 <span className="font-medium text-white">Sunday (Midnight)</span>
               </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Triggers Covered</h3>
              <div className="grid grid-cols-2 gap-3">
                {triggers.map(t => (
                  <div key={t.name} className="flex items-center gap-2 text-sm">
                    {t.covered ? (
                      <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-slate-600 flex-shrink-0" />
                    )}
                    <span className={t.covered ? "text-slate-200 font-medium" : "text-slate-500"}>{t.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
                <button className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2 rounded-xl transition-colors">
                  Upgrade Plan
                </button>
                <button className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 rounded-xl transition-colors">
                  Pause
                </button>
            </div>
          </div>

          {/* Shift Check In */}
          <ShiftCheckIn workerId={workerId} />
        </div>

        {/* Policy History */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mt-8">
           <h3 className="text-lg font-bold text-white mb-6">Recent Claims</h3>
           {dashboardData.recent_claims?.length > 0 ? (
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm text-slate-300 border-collapse">
                 <thead>
                   <tr className="border-b border-slate-800 text-slate-400">
                     <th className="pb-3 px-4 font-medium">Trigger</th>
                     <th className="pb-3 px-4 font-medium">Zone</th>
                     <th className="pb-3 px-4 font-medium">Amount</th>
                     <th className="pb-3 px-4 font-medium">Status</th>
                   </tr>
                 </thead>
                 <tbody>
                   {dashboardData.recent_claims.map((claim: any) => (
                     <tr key={claim.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                       <td className="py-4 px-4 font-medium">{claim.trigger_type}</td>
                       <td className="py-4 px-4">{claim.zone}</td>
                       <td className="py-4 px-4 text-emerald-400 font-medium">₹{claim.payout_amount}</td>
                       <td className="py-4 px-4">
                         <span className={`px-2 py-1 rounded text-xs ${
                           claim.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' :
                           claim.status === 'fraud_check_pending' ? 'bg-amber-500/20 text-amber-400' :
                           claim.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                           'bg-blue-500/20 text-blue-400'
                         }`}>
                           {claim.status.replace(/_/g, ' ').toUpperCase()}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-slate-800 border-dashed">
               <Shield className="mx-auto h-8 w-8 text-slate-600 mb-2" />
               <p className="text-slate-400">No recent claims history</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
