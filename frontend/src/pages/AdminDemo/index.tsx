import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { RefreshCw, Play, ShieldAlert, CloudRain, Thermometer, Wind, AlertOctagon, Smartphone } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminDemo() {
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/admin/system-status`);
      setSystemStatus(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const simulateTrigger = async (type: string, zone: string) => {
    setLoading(true);
    try {
      if (type === 'App Outage') {
         await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/admin/simulate-outage?platform=zepto&duration_minutes=60`);
      } else {
         await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/admin/simulate-trigger?trigger_type=${type}&zone=${zone}&city=Bangalore`);
      }
      
      const time = new Date().toLocaleTimeString();
      setLogs(prev => [`${time} · TRIGGER EVENT FIRED · ${type} in ${zone}`, ...prev]);
      toast.success(`${type} triggered safely.`);
      setRefreshKey(prev => prev + 1); // trigger refresh
    } catch (e) {
      toast.error(`Failed to trigger ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const clearOutage = async () => {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/mock/platform-status`, { platform: "zepto", status: "operational"});
      // Note: Endpoint for manual clear doesn't exist natively in mock.py for simplification, we just mock UI clears here
  }

  const buttons = [
    { label: "Simulate Rain (HSR Layout)", type: "Rain", zone: "HSR Layout", icon: CloudRain, color: "text-blue-400", bg: "bg-blue-400/10 hover:bg-blue-400/20", border: "border-blue-400/30" },
    { label: "Simulate Flood (Bangalore)", type: "Flood", zone: "Bangalore", icon: ShieldAlert, color: "text-cyan-400", bg: "bg-cyan-400/10 hover:bg-cyan-400/20", border: "border-cyan-400/30" },
    { label: "Simulate Heat Wave", type: "Heat", zone: "Koramangala", icon: Thermometer, color: "text-rose-500", bg: "bg-rose-500/10 hover:bg-rose-500/20", border: "border-rose-500/30" },
    { label: "Simulate AQI Spike", type: "Pollution", zone: "Whitefield", icon: Wind, color: "text-amber-500", bg: "bg-amber-500/10 hover:bg-amber-500/20", border: "border-amber-500/30" },
    { label: "Zone Shutdown (Section 144)", type: "Zone Shutdown", zone: "BTM Layout", icon: AlertOctagon, color: "text-red-500", bg: "bg-red-500/10 hover:bg-red-500/20", border: "border-red-500/30" },
    { label: "App Outage (Zepto)", type: "App Outage", zone: "All", icon: Smartphone, color: "text-indigo-400", bg: "bg-indigo-400/10 hover:bg-indigo-400/20", border: "border-indigo-400/30" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-200">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded uppercase tracking-widest font-bold">Admin Demo</span>
              Insuregig Control Panel
            </h1>
            <p className="text-slate-400 mt-2">Zero-touch pipeline hackathon demonstrator</p>
          </div>
          <div className="text-right">
             <div className="text-xs text-slate-500 mb-1">System Health</div>
             <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-sm font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Modules Online
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          {/* Controls Column */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-xl font-bold text-white mb-4">Trigger Simulations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               {buttons.map((btn, i) => {
                 const Icon = btn.icon;
                 return (
                   <button 
                     key={i}
                     disabled={loading}
                     onClick={() => simulateTrigger(btn.type, btn.zone)}
                     className={`border ${btn.border} ${btn.bg} rounded-xl p-6 text-left group transition-all disabled:opacity-50 active:scale-95`}
                   >
                     <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-slate-900 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform ${btn.color}`}>
                           <Icon size={24} />
                        </div>
                        <div>
                           <h3 className={`font-bold text-lg text-white mb-1`}>{btn.label}</h3>
                           <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                             <Play size={10} className="fill-current"/> RUN SEQUENCE
                           </p>
                        </div>
                     </div>
                   </button>
                 )
               })}
            </div>

            {/* Live Pipeline Feed */}
            <div className="bg-[#0c1322] border border-slate-800 rounded-xl overflow-hidden shadow-2xl mt-8">
              <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-xs text-slate-400 font-mono">
                <span>TERMINAL_OUTPUT / PIPELINE_LOGS</span>
                <span className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div> Live
                </span>
              </div>
              <div className="h-64 p-4 overflow-y-auto font-mono text-xs space-y-2">
                 {logs.length === 0 ? (
                   <div className="text-slate-600 italic">No events generated yet...</div>
                 ) : (
                   logs.map((log, i) => (
                     <div key={i} className={`
                       ${log.includes('FIRED') ? 'text-amber-400' : ''}
                       ${log.includes('Fraud check: PASS') ? 'text-emerald-400' : ''}
                       ${log.includes('Fraud check: REJECT') ? 'text-red-400' : ''}
                       ${log.includes('Paid') ? 'text-cyan-400' : ''}
                       text-slate-300
                     `}>
                       <span className="text-slate-600 mr-2">[{i.toString().padStart(3, '0')}]</span>
                       {log}
                     </div>
                   ))
                 )}
              </div>
            </div>
          </div>

          {/* Status Column */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
               <h2 className="text-lg font-bold text-white mb-4">Global Network Status</h2>
               
               {systemStatus ? (
                 <div className="space-y-4">
                   <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                     <span className="text-slate-400 text-sm">Rain Detectors</span>
                     <span className="text-sm font-medium">{systemStatus.rain}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                     <span className="text-slate-400 text-sm">NDMA Flood Monitor</span>
                     <span className="text-sm font-medium">{systemStatus.flood}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                     <span className="text-slate-400 text-sm">TomTom Traffic</span>
                     <span className="text-sm font-medium">{systemStatus.zone_shutdown}</span>
                   </div>
                   <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                     <span className="text-slate-400 text-sm">AQI Stations</span>
                     <span className="text-sm font-medium">{systemStatus.aqi}</span>
                   </div>
                   <div className="flex justify-between items-center pt-1">
                     <span className="text-slate-400 text-sm">Gig Platforms Status</span>
                     <span className={`text-sm font-bold ${systemStatus.platforms.includes('OUTAGE') ? 'text-red-500' : 'text-emerald-500'}`}>
                       {systemStatus.platforms}
                     </span>
                   </div>
                 </div>
               ) : (
                 <div className="text-center py-6">
                    <RefreshCw className="animate-spin text-slate-600 mx-auto" />
                 </div>
               )}
             </div>

             <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
               <h3 className="text-blue-400 font-bold mb-2">Hackathon Note</h3>
               <p className="text-sm text-blue-200/70">
                 Triggering an event here bypasses the 30-minute APScheduler cron and injects the event directly into the auto_create_claims pipeline. You should see Logs immediately flow within seconds.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
