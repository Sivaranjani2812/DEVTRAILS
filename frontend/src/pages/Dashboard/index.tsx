import React from 'react';
import ShiftCheckIn from '../../components/ShiftCheckIn';

export default function Dashboard() {
  const workerId = Number(localStorage.getItem('userId')) || 1;

  return (
    <div className="min-h-screen bg-slate-950 p-4 pb-24 text-slate-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <div className="text-sm px-3 py-1 bg-slate-800 rounded-full border border-slate-700">Worker ID: {workerId}</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ShiftCheckIn workerId={workerId} />
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
             <h2 className="text-xl font-bold text-white mb-4">Quick Links</h2>
             <div className="space-y-3">
                 <a href="/policy" className="block p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors font-medium">📜 My Policy</a>
                 <a href="/premium" className="block p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors font-medium">💰 Premium Calculator</a>
                 <a href="/claims" className="block p-4 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors font-medium">📋 Claims Center</a>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
