import React, { useState, useEffect } from "react";
import { Search, ShieldAlert, Zap, Clock, ShieldCheck, Filter } from "lucide-react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { format } from "date-fns";

export default function Claims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const fetchClaims = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = `/api/workers/claims?`;
      if (activeFilter !== "All") query += `status=${activeFilter}&`;
      if (selectedMonth) query += `month=${selectedMonth}&`;
      if (search) query += `search=${search}`;
      
      const res = await api.get(query);
      setClaims(res.data);
    } catch (err: any) {
      setError(err.message || "Failed to load claims");
      setClaims([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only debounce fetch if user is typing a search, otherwise immediate
    const timeout = setTimeout(() => {
      fetchClaims();
    }, search ? 500 : 0);
    return () => clearTimeout(timeout);
  }, [activeFilter, selectedMonth, search]);

  const approvedClaims = claims.filter(c => c.status === "Auto Approved" || c.status === "Approved");
  const totalReceived = approvedClaims.reduce((acc, c) => acc + (c.amount || 0), 0);
  const reviewCount = claims.filter(c => c.status === "Under Review" || c.status === "Processing").length;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* HEADER SECTION */}
        <div className="mb-8">
          <h1 className="text-[24px] font-[800] text-[#0F172A] mb-1">My Claims</h1>
          <p className="text-[14px] text-[#64748B]">All disruption payouts and their status</p>
        </div>

        {/* SUMMARY STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card-base p-6 border-l-4 border-l-[#059669]">
            <h3 className="text-[13px] font-[600] text-[#64748B] mb-2 uppercase tracking-wide">Total received</h3>
            <p className="text-[28px] font-[800] text-[#059669] leading-tight flex items-center gap-2">
              ₹{totalReceived} <ShieldCheck className="w-6 h-6 text-[#059669]" />
            </p>
            <p className="text-[13px] text-[#94A3B8] font-medium mt-1">{approvedClaims.length} approved claims</p>
          </div>

          <div className="card-base p-6 border-l-4 border-l-[#2563EB]">
            <h3 className="text-[13px] font-[600] text-[#64748B] mb-2 uppercase tracking-wide">Claims count</h3>
            <p className="text-[28px] font-[800] text-[#0F172A] leading-tight">{claims.length}</p>
            <p className="text-[13px] text-[#94A3B8] font-medium mt-1">{approvedClaims.length} approved · {reviewCount} in review</p>
          </div>

          <div className="card-base p-6 border-l-4 border-l-[#D97706]">
            <h3 className="text-[13px] font-[600] text-[#64748B] mb-2 uppercase tracking-wide">Avg processing time</h3>
            <p className="text-[28px] font-[800] text-[#0F172A] leading-tight flex items-center gap-2">
              42s <Zap className="w-6 h-6 text-[#D97706]" />
            </p>
            <p className="text-[13px] text-[#94A3B8] font-medium mt-1">Fully automated pipeline</p>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 hide-scrollbar items-center">
            {["All", "Auto Approved", "Under Review", "Not Covered"].map(filter => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)}
                className={`flex-shrink-0 px-4 py-2 rounded-full font-[500] text-[13px] transition-all flex items-center gap-2 ${
                  activeFilter === filter 
                    ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/20" 
                    : "bg-white border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]"
                }`}
              >
                {filter}
                {/* Simulated count pill */}
                {activeFilter !== filter && (
                  <span className="bg-[#E2E8F0] text-[#64748B] text-[10px] px-2 py-0.5 rounded-full font-[700]">
                    -
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
             <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <select 
                  className="input-base pl-10 cursor-pointer appearance-none bg-white min-w-[140px]" 
                  value={selectedMonth} 
                  onChange={e => setSelectedMonth(e.target.value)}
                >
                  <option value="">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                </select>
             </div>
             
             <div className="relative flex-1 max-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input 
                  type="text" 
                  placeholder="Search claims..." 
                  className="input-base pl-10 w-full bg-white" 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* CONTENT STATES */}
        {error ? (
          <div className="card-base border-[#FEE2E2] bg-[#FEF2F2] p-8 text-center max-w-lg mx-auto">
             <ShieldAlert className="w-10 h-10 text-[#DC2626] mx-auto mb-3" />
             <h3 className="text-[16px] font-[700] text-[#991B1B] mb-1">Couldn't load claims</h3>
             <p className="text-[13px] text-[#DC2626] mb-4">{error}</p>
             <button onClick={fetchClaims} className="bg-white border border-[#FECACA] text-[#B91C1C] px-6 py-2 rounded-lg font-medium hover:bg-[#FEE2E2] transition-colors">
               Retry Connection
             </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card-base p-5 h-[160px] skeleton rounded-2xl"></div>
            ))}
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-2xl max-w-2xl mx-auto shadow-sm">
             <div className="w-16 h-16 bg-[#DBEAFE] rounded-full flex flex-col items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-[#2563EB]" />
             </div>
             <h2 className="text-[18px] font-[700] text-[#0F172A] mb-2">No claims yet</h2>
             <p className="text-[14px] text-[#64748B] mb-6 max-w-sm mx-auto leading-relaxed">
               When a disruption is detected in your zone while your policy is active, a claim is auto-created here.
             </p>
             <button className="text-[#2563EB] font-[600] bg-[#DBEAFE] px-6 py-2.5 rounded-full hover:bg-[#BFDBFE] transition-colors" onClick={() => window.location.href='/dashboard'}>
               View active triggers →
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {claims.map((claim, idx) => {
              // Status Color Mapping
              const isApproved = claim.status === "Auto Approved" || claim.status === "Approved";
              const isReview = claim.status === "Under Review";
              const isProcessing = claim.status === "Processing";
              const isDenied = claim.status === "Not Covered";
              
              let borderColor = "border-[#E2E8F0]";
              let badgeBg = "bg-[#F1F5F9]";
              let badgeText = "text-[#64748B]";
              let amountColor = "text-[#0F172A]";
              
              if (isApproved) {
                borderColor = "border-l-4 border-l-[#059669] border-[#E2E8F0]";
                badgeBg = "bg-[#D1FAE5]"; badgeText = "text-[#059669]";
                amountColor = "text-[#059669]";
              } else if (isReview) {
                borderColor = "border-l-4 border-l-[#D97706] border-[#E2E8F0]";
                badgeBg = "bg-[#FEF3C7]"; badgeText = "text-[#D97706]";
                amountColor = "text-[#0F172A]";
              } else if (isProcessing) {
                borderColor = "border-l-4 border-l-[#2563EB] border-[#E2E8F0]";
                badgeBg = "bg-[#DBEAFE]"; badgeText = "text-[#2563EB]";
              } else if (isDenied) {
                borderColor = "border-l-4 border-l-[#DC2626] border-[#E2E8F0]";
                badgeBg = "bg-[#FEE2E2]"; badgeText = "text-[#DC2626]";
                amountColor = "text-[#DC2626]";
              }

              return (
                <div key={claim.id || idx} className={`bg-white border ${borderColor} rounded-2xl p-5 hover:shadow-[0_10px_25px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-0.5 relative group`}>
                   <div className="absolute inset-y-0 left-0 w-1 bg-[#2563EB] opacity-0 group-hover:opacity-100 rounded-l-2xl transition-opacity"></div>
                   
                   {/* TOP ROW */}
                   <div className="flex justify-between items-start mb-4">
                     <div className="flex gap-3 items-center">
                        <div className="w-10 h-10 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] shadow-sm flex items-center justify-center">
                           <ShieldAlert className="w-5 h-5 text-[#64748B]" />
                        </div>
                        <div>
                           <h3 className="text-[15px] font-[700] text-[#0F172A] leading-tight">{claim.triggerName}</h3>
                           <p className="text-[12px] text-[#94A3B8] font-medium mt-0.5">{claim.location || "System Region"}</p>
                        </div>
                     </div>
                     <span className={`status-badge !text-[11px] uppercase tracking-wide px-3 py-1 ${badgeBg} ${badgeText}`}>
                       {claim.status}
                     </span>
                   </div>

                   {/* MIDDLE ROW */}
                   <div className="mb-4">
                     {isApproved ? (
                       <p className={`text-[15px] font-[600] ${amountColor}`}>₹{claim.amount} credited to UPI account</p>
                     ) : isDenied ? (
                       <p className="text-[14px] font-[500] text-[#D97706]">{claim.reason || "Threshold rules not met for this event."}</p>
                     ) : (
                       <p className="text-[14px] font-[500] text-[#2563EB] flex items-center gap-2">
                         Verifying claim <span className="flex gap-0.5"><span className="w-1 h-1 bg-[#2563EB] rounded-full animate-bounce"></span><span className="w-1 h-1 bg-[#2563EB] rounded-full animate-bounce delay-75"></span><span className="w-1 h-1 bg-[#2563EB] rounded-full animate-bounce delay-150"></span></span>
                       </p>
                     )}
                   </div>

                   {/* BOTTOM ROW */}
                   <div className="flex items-end justify-between border-t border-[#E2E8F0] pt-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-[12px] font-[600]">
                         {isApproved && <><Zap className="w-4 h-4 text-[#94A3B8]" /> <span className="text-[#64748B]">Processed in {claim.processedIn || "45s"}</span></>}
                         {isReview && <><Clock className="w-4 h-4 text-[#94A3B8]" /> <span className="text-[#64748B]">Expected: {claim.expectedIn || "6 hrs"}</span></>}
                      </div>
                      <div className="px-3 py-1 bg-[#F8FAFC] text-[#64748B] text-[11px] font-[700] rounded-full uppercase border border-[#E2E8F0]">
                        {claim.date ? format(new Date(claim.date), 'dd MMM yyyy') : 'Unknown Date'}
                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
