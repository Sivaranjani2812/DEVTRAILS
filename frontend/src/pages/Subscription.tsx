import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Check, X, Info, ArrowRight } from "lucide-react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";

export default function Subscription() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [plans, setPlans] = useState<any[]>([]);
  const [riskProfile, setRiskProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activatingInfo, setActivatingInfo] = useState<string | null>(null);
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        setLoading(true);
        // Parallel requests
        const [plansRes, riskRes] = await Promise.all([
          api.get("/api/policies/plans"),
          api.get("/api/workers/risk-profile")
        ]);
        setPlans(plansRes.data);
        setRiskProfile(riskRes.data);
      } catch (err: any) {
        console.error("Policy fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolicyData();
  }, []);

  const handleActivate = async () => {
    if (!selectedPlanId) return;
    try {
      setActivatingInfo(selectedPlanId);
      await api.post("/api/policies/activate", { planId: selectedPlanId, workerId: user?.id });
      toast.success("Coverage activated! Your shield is live.");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Failed to activate policy. Please try again.");
    } finally {
      setActivatingInfo(null);
    }
  };

  const recommendedPlanName = riskProfile?.recommendedPlan || "Standard";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-12">
           <div className="w-1/3 h-8 skeleton mb-4"></div>
           <div className="w-2/3 h-6 skeleton mb-10"></div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-[450px] skeleton rounded-2xl"></div>
              ))}
           </div>
        </main>
      </div>
    );
  }

  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-[32px] md:text-[40px] font-[800] text-[#0F172A] tracking-tight mb-3">Choose your shield</h1>
          <p className="text-[16px] text-[#64748B] max-w-xl mx-auto">
            Based on your risk profile, we recommend the <span className="font-bold text-[#0F172A]">{recommendedPlanName}</span> plan for optimal protection.
          </p>
        </div>

        {/* RISK SUMMARY BAR */}
        {riskProfile && (
          <div className="card-base p-4 mb-8 flex flex-col md:flex-row items-center justify-between border border-[#E2E8F0] shadow-sm bg-white">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
               <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
               <span className="text-[#0F172A] font-[600] text-[14px]">Your premium factors:</span>
               <div className="flex gap-2 flex-wrap">
                 {riskProfile.factors?.map((f: any, idx: number) => (
                    <span key={idx} className="bg-[#F1F5F9] text-[#64748B] text-[12px] px-2.5 py-1 rounded-full font-medium border border-[#E2E8F0]">
                      {f.label} ({f.multiplier})
                    </span>
                 ))}
               </div>
            </div>
            <button className="text-[13px] font-[600] text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1">
              How is this calculated? <Info className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PLAN CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end mb-16">
          {plans.map((plan: any) => {
            const isStandard = plan.name === "Standard";
            const isPremium = plan.name === "Premium";
            
            let cardClasses = "card-base p-6 lg:p-8 flex flex-col bg-white border border-[#E2E8F0] transition-transform";
            if (isStandard) {
              cardClasses = "card-base p-6 lg:p-8 flex flex-col bg-white border-2 border-[#2563EB] relative transform scale-102 lg:-translate-y-4 shadow-[0_20px_40px_rgba(37,99,235,0.1)]";
            }
            
            const btnBaseClasses = "w-full py-3.5 rounded-xl font-[600] text-[15px] transition-colors flex justify-center items-center";
            let btnClasses = `${btnBaseClasses} border-2 border-[#2563EB] text-[#2563EB] hover:bg-[#F8FAFC]`;
            if (isStandard) btnClasses = `${btnBaseClasses} bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-[0_8px_20px_rgba(37,99,235,0.25)]`;
            if (isPremium) btnClasses = `${btnBaseClasses} bg-[#7C3AED] text-white hover:bg-[#6D28D9] shadow-[0_8px_20px_rgba(124,58,237,0.25)]`;

            return (
              <div key={plan.id} className={cardClasses}>
                {isStandard && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#2563EB] text-white text-[12px] font-[700] uppercase tracking-widest px-4 py-1.5 rounded-full whitespace-nowrap shadow-md">
                    Recommended for you
                  </div>
                )}
                
                {/* TOP */}
                <h3 className="text-[20px] font-[800] text-[#0F172A] tracking-tight mb-4">{plan.name}</h3>
                
                {/* PRICE BLOCK */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-[36px] font-[900] tracking-tighter ${isPremium ? 'text-[#7C3AED]' : 'text-[#2563EB]'}`}>
                      ₹{plan.weeklyPremium}
                    </span>
                    <span className="text-[14px] text-[#64748B] font-medium">/week</span>
                  </div>
                  <p className="text-[13px] text-[#94A3B8] font-medium mt-1">~₹{plan.weeklyPremium * 4} per month</p>
                </div>

                {/* COVERAGE LINE */}
                <div className="bg-[#F8FAFC] rounded-xl p-4 mb-6 border border-[#E2E8F0]">
                  <p className="text-[14px] font-[700] text-[#0F172A] mb-1">{plan.coveragePercent}% of your weekly income</p>
                  <p className="text-[12px] text-[#64748B] font-medium flex justify-between">
                    <span>Max payout:</span>
                    <span className="font-bold text-[#0F172A]">₹{plan.maxPayout || plan.weeklyPremium * 120}</span>
                  </p>
                </div>

                <div className="h-px w-full bg-[#E2E8F0] mb-6"></div>

                {/* TRIGGERS LIST */}
                <div className="flex-1 mb-8 space-y-3.5">
                  {["Heavy rain", "Extreme heat", "Severe AQI", "App downtime", "Curfew/strike", "Order volume collapse"].map((trigger, idx) => {
                    const isCovered = plan.triggers?.includes(trigger);
                    return (
                      <div key={idx} className="flex items-center gap-3">
                        {isCovered ? (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isPremium ? 'bg-[#EDE9FE] text-[#7C3AED]' : 'bg-[#D1FAE5] text-[#059669]'}`}>
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 flex items-center justify-center opacity-50">
                            <X className="w-4 h-4 text-[#94A3B8]" />
                          </div>
                        )}
                        <span className={`text-[14px] font-[500] ${isCovered ? 'text-[#0F172A]' : 'text-[#94A3B8] line-through decoration-[#94A3B8]/30'}`}>
                          {trigger}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* BOTTOM */}
                <button 
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={btnClasses}
                >
                  {selectedPlanId === plan.id ? "Selected" : "Select plan"}
                </button>
              </div>
            );
          })}
        </div>

        {/* PREMIUM CALCULATOR */}
        {selectedPlan && riskProfile && (
          <div className="card-base p-8 bg-white max-w-4xl mx-auto border border-[#E2E8F0] shadow-md animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-[18px] font-[800] text-[#0F172A] mb-6">Your exact premium breakdown</h2>
            
            <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
              {/* Fake base assumption */}
              <div className="flex flex-col items-center">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-[700] text-[16px] px-6 py-3 rounded-2xl shadow-sm">
                  Base ₹35
                </div>
                <span className="text-[12px] text-[#64748B] font-medium mt-2 uppercase tracking-wide">Starting</span>
              </div>
              
              <span className="text-[#94A3B8] font-bold">×</span>

              {riskProfile.factors?.map((f: any, idx: number) => (
                <React.Fragment key={idx}>
                  <div className="flex flex-col items-center">
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-[700] text-[16px] px-6 py-3 rounded-2xl shadow-sm">
                      {f.label.split(" ")[0]} {f.multiplier}
                    </div>
                    <span className="text-[12px] text-[#64748B] font-medium mt-2 uppercase tracking-wide">Factor</span>
                  </div>
                  {idx < riskProfile.factors.length - 1 && <span className="text-[#94A3B8] font-bold">×</span>}
                </React.Fragment>
              ))}

              <span className="text-[#2563EB] font-bold w-10 flex justify-center"><ArrowRight className="w-5 h-5" /></span>

              <div className="flex flex-col items-center">
                <div className="bg-[#DBEAFE] border border-[#BFDBFE] text-[#1D4ED8] font-[900] text-[20px] px-8 py-3 rounded-2xl shadow-[0_4px_12px_rgba(37,99,235,0.15)]">
                  ₹{selectedPlan.weeklyPremium}/week
                </div>
                <span className="text-[12px] text-[#2563EB] font-[700] mt-2 uppercase tracking-wide">Final Cost</span>
              </div>
            </div>

            <div className="flex justify-center gap-8 mb-8 pb-8 border-b border-[#E2E8F0]">
              <div className="text-center">
                <p className="text-[12px] text-[#64748B] font-[600] uppercase tracking-wide">Annual cost</p>
                <p className="text-[16px] text-[#0F172A] font-[800]">₹{selectedPlan.weeklyPremium * 52}</p>
              </div>
              <div className="w-px bg-[#E2E8F0]"></div>
              <div className="text-center">
                <p className="text-[12px] text-[#64748B] font-[600] uppercase tracking-wide">Annual max coverage</p>
                <p className="text-[16px] text-[#059669] font-[800]">₹{(selectedPlan.maxPayout || selectedPlan.weeklyPremium * 120) * 52}</p>
              </div>
            </div>

            <button 
              onClick={handleActivate}
              disabled={activatingInfo !== null}
              className={`w-full max-w-md mx-auto flex items-center justify-center gap-2 py-4 rounded-xl font-[700] text-[16px] transition-all shadow-[0_10px_20px_rgba(37,99,235,0.2)] ${
                activatingInfo ? "opacity-75 cursor-not-allowed bg-[#94A3B8] text-white" : "bg-[#2563EB] text-white hover:bg-[#1D4ED8] hover:-translate-y-0.5"
              }`}
            >
              {activatingInfo ? "Activating Shield..." : `Activate ${selectedPlan.name} coverage — ₹${selectedPlan.weeklyPremium}/week`}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
