import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayCircle, StopCircle, MapPin, Activity } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ShiftCheckIn({ workerId }: { workerId: number }) {
  const [activeShift, setActiveShift] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('');
  const [timer, setTimer] = useState("00:00:00");

  useEffect(() => {
    fetchActiveShift();
  }, [workerId]);

  useEffect(() => {
    if (!activeShift) return;
    const interval = setInterval(() => {
      const checkInTime = new Date(activeShift.checkin_time).getTime();
      const now = new Date().getTime();
      const diff = now - checkInTime;
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff / (1000 * 60)) % 60).toString().padStart(2, '0');
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      setTimer(`${h}:${m}:${s}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeShift]);

  const fetchActiveShift = async () => {
    try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/shifts/active/${workerId}`);
        setActiveShift(res.data);
        if (res.data) {
           setSelectedZone(res.data.dark_store_zone);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const startShift = async () => {
    if (!selectedZone) return toast.error("Select a dark store zone first");
    try {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/shifts/checkin`, {
            worker_id: workerId,
            dark_store_zone: selectedZone,
            device_fingerprint: navigator.userAgent
        });
        setActiveShift(res.data);
        toast.success("Shift Started. You are now covered!");
    } catch (e) {
        toast.error("Failed to start shift");
    }
  };

  const endShift = async () => {
    try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/shifts/checkout`, {
            worker_id: workerId
        });
        setActiveShift(null);
        toast.success("Shift ended safely.");
    } catch (e) {
        toast.error("Failed to end shift");
    }
  };

  if (loading) return <div className="text-slate-400 p-4 border border-slate-800 rounded-xl bg-slate-900 animate-pulse">Loading shift status...</div>;

  return (
    <div className="border border-slate-800 rounded-2xl bg-slate-900 p-6 shadow-xl relative overflow-hidden">
        {/* Glow effect if active */}
        {activeShift && (
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none"></div>
        )}

        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className={activeShift ? "text-emerald-500" : "text-slate-500"} />
                Shift Status
            </h2>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${activeShift ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                {activeShift ? "COVERAGE ACTIVE" : "INACTIVE"}
                {activeShift && <span className="ml-2 inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>}
            </div>
        </div>

        {!activeShift ? (
            <div className="space-y-4">
                <div>
                   <label className="block text-sm text-slate-400 mb-2">Where are you working today?</label>
                   <select 
                        value={selectedZone} 
                        onChange={e => setSelectedZone(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-emerald-500"
                    >
                        <option value="">Select Zone</option>
                        <option value="HSR Layout">HSR Layout</option>
                        <option value="Koramangala">Koramangala</option>
                        <option value="BTM Layout">BTM Layout</option>
                        <option value="Whitefield">Whitefield</option>
                    </select>
                </div>
                
                <button 
                    onClick={startShift}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                    <PlayCircle size={24} />
                    START SHIFT TO ACTIVATE COVERAGE
                </button>
            </div>
        ) : (
             <div className="space-y-6">
                 <div className="flex items-start justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700 border-l-4 border-l-emerald-500">
                    <div>
                        <div className="flex items-center gap-1 text-slate-300 mb-1">
                            <MapPin size={16} className="text-emerald-500" />
                            <span className="font-semibold">{activeShift.dark_store_zone}</span>
                        </div>
                        <p className="text-sm text-slate-400">Monitoring 6 triggers dynamically.</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-mono text-emerald-400 leading-none">{timer}</div>
                        <div className="text-xs text-slate-500 mt-1">Duration</div>
                    </div>
                 </div>

                 <button 
                    onClick={endShift}
                    className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-red-400 hover:text-red-300"
                >
                    <StopCircle size={20} />
                    END SHIFT
                </button>
             </div>
        )}
    </div>
  );
}
