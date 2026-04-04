import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, AlertCircle, RefreshCw, CheckCircle2, Zap, PlayCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const DEMO_TRIGGERS = ['Rain', 'Flood', 'Heat', 'App Outage', 'Zone Shutdown'];
const DEMO_ZONES = ['HSR Layout', 'Koramangala', 'BTM Layout', 'Whitefield'];

export default function Claims() {
  const [claims, setClaims] = useState<any[]>([]);
  const workerId = Number(localStorage.getItem('userId')) || 1;
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchClaims();
    const interval = setInterval(fetchClaims, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await axios.get(`${API}/claims/${workerId}`);
      setClaims(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAppeal = async (claimId: string) => {
    try {
      await axios.post(`${API}/claims/${claimId}/appeal`, {
        reason: 'Automated ML flag incorrect. I was affected by this.',
        additional_info: ''
      });
      toast.success('Appeal submitted for admin review');
      fetchClaims();
    } catch (e) {
      toast.error('Issue filing appeal');
    }
  };

  const handleDemoTrigger = async () => {
    setTriggering(true);
    const trigger = DEMO_TRIGGERS[Math.floor(Math.random() * DEMO_TRIGGERS.length)];
    const zone = DEMO_ZONES[Math.floor(Math.random() * DEMO_ZONES.length)];
    try {
      await axios.post(`${API}/mock/trigger-claim`, {
        worker_id: workerId,
        trigger_type: trigger,
        zone: zone,
        payout_amount: Math.floor(Math.random() * 500) + 200
      });
      toast.success(`🌧 ${trigger} trigger fired in ${zone}! Claim pipeline started.`);
      setTimeout(fetchClaims, 1000);
    } catch (err: any) {
      // Fallback: create a local mock display
      const mockClaim = {
        id: `demo-${Date.now()}`,
        trigger_type: trigger,
        zone,
        payout_amount: Math.floor(Math.random() * 500) + 200,
        status: 'fraud_check_pending',
        created_at: new Date().toISOString(),
        fraud_flags: []
      };
      setClaims(prev => [mockClaim, ...prev]);
      toast.success(`🌧 Demo: ${trigger} triggered in ${zone}!`);
    } finally {
      setTriggering(false);
    }
  };

  const activeClaim = claims.find(c => ['fraud_check_pending', 'silent_hold'].includes(c.status));

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-24 text-slate-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Claims Center</h1>
            <p className="text-slate-400 text-sm">Real-time payout pipeline — auto-triggered during active shifts</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDemoTrigger}
              disabled={triggering}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 shadow-lg shadow-emerald-600/20"
            >
              {triggering ? <RefreshCw size={16} className="animate-spin" /> : <PlayCircle size={16} />}
              Demo Trigger
            </button>
            <button onClick={fetchClaims} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors border border-slate-800">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Claims', value: claims.length, color: 'text-white' },
            { label: 'Paid Out', value: claims.filter(c => c.status === 'paid').length, color: 'text-emerald-400' },
            { label: 'Total ₹', value: `₹${claims.filter(c => c.status === 'paid').reduce((s, c) => s + c.payout_amount, 0)}`, color: 'text-blue-400' },
          ].map(s => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live Active Claim Pipeline */}
        {activeClaim && (
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 shadow-[0_0_40px_-15px_rgba(16,185,129,0.2)] mb-8 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20">
               <div className="h-full bg-emerald-500 w-1/3 animate-[pulse_2s_ease-in-out_infinite]"></div>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              Live Claim Pipeline: {activeClaim.trigger_type} ({activeClaim.zone})
            </h2>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
               
               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-emerald-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-col relative z-10">
                    <CheckCircle2 size={16}/>
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-emerald-500/20 bg-slate-800 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-emerald-400 text-sm">Disruption Detected</h3>
                      <time className="text-xs text-slate-500">{new Date(activeClaim.created_at).toLocaleTimeString()}</time>
                    </div>
                    <p className="text-sm text-slate-300">Trigger API verified 100% impact in {activeClaim.zone}.</p>
                  </div>
               </div>

               <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {activeClaim.status === 'fraud_check_pending' ? (
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-amber-500 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-col relative z-10">
                       <RefreshCw size={16} className="animate-spin"/>
                     </div>
                  ) : (
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-slate-900 bg-amber-600 text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-col relative z-10">
                       <AlertCircle size={16}/>
                     </div>
                  )}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-700 bg-slate-800 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-slate-200 text-sm">Fraud Layer Check</h3>
                      <time className="text-xs text-slate-500 font-mono">Running</time>
                    </div>
                    <p className="text-sm text-slate-400">Verifying check-in timestamps and anomaly boundaries.</p>
                  </div>
               </div>

            </div>
          </div>
        )}

        {/* History Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
           <h2 className="text-lg font-bold text-white mb-6">Claims History</h2>
           {claims.length > 0 ? (
             <div className="space-y-4">
               {claims.map((claim: any) => (
                 <div key={claim.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-800 transition-colors">
                    <div className="flex items-start gap-4">
                       <div className="bg-slate-700 p-3 rounded-lg flex-shrink-0">
                         <FileText className="text-slate-300" size={24}/>
                       </div>
                       <div>
                         <div className="flex items-center gap-2 mb-1">
                           <h3 className="font-bold text-white">{claim.trigger_type} Impact</h3>
                           <span className="text-xs text-slate-500 px-2 py-0.5 bg-slate-900 rounded font-mono">{claim.id}</span>
                         </div>
                         <p className="text-sm text-slate-400">{claim.zone} • {new Date(claim.created_at).toLocaleString()}</p>
                         
                         {/* Display Failure reasons if rejected */}
                         {claim.status === 'rejected' && claim.fraud_flags?.length > 0 && (
                            <div className="mt-2 text-xs text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20">
                              Flags: {claim.fraud_flags.join(', ')}
                            </div>
                         )}
                         {claim.status === 'paid' && claim.time_to_payout_seconds && (
                            <div className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                              <Zap size={12} /> Pipeline completed in {claim.time_to_payout_seconds}s
                            </div>
                         )}
                       </div>
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                       <div className="text-xl font-bold text-slate-200">₹{claim.payout_amount}</div>
                       
                       <div className="flex flex-col items-end gap-2">
                         <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                             claim.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                             claim.status === 'fraud_check_pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                             claim.status === 'rejected' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                             'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                           }`}>
                             {claim.status.replace(/_/g, ' ').toUpperCase()}
                         </span>
                         
                         {claim.status === 'rejected' && (
                           <button 
                             onClick={() => handleAppeal(claim.id)}
                             className="text-xs underline text-slate-400 hover:text-white"
                           >
                              File Appeal
                           </button>
                         )}
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-12 bg-slate-800/20 rounded-xl border border-dashed border-slate-800">
               <FileText className="mx-auto h-10 w-10 text-slate-700 mb-3" />
               <p className="text-white font-semibold mb-1">No claims yet</p>
               <p className="text-slate-500 text-sm mb-4">Click <strong className="text-emerald-400">Demo Trigger</strong> above to simulate a real payout pipeline and watch it process in real-time!</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
