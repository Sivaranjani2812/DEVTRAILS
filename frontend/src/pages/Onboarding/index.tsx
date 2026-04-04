import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Camera, ShieldAlert, ArrowRight, ArrowLeft, Shield } from "lucide-react";
import toast from "react-hot-toast";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const steps = ["Personal", "Work", "Risk", "KYC"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "", 
    city: "Bengaluru",
    zone: "",
    platform: "Zepto",
    hoursPerDay: 8,
    dailyEarnings: 1000,
    upi_id: "",
    platformId: "",
    selectedPlan: "Standard"
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("insure_gig_user");
    if (storedUser) {
        setFormData(prev => ({ ...prev, phone: JSON.parse(storedUser).phone }));
    }
  }, []);

  const handleNext = () => setCurrentStep((p) => Math.min(p + 1, 4));
  const handleBack = () => setCurrentStep((p) => Math.max(p - 1, 1));

  useEffect(() => {
    if (currentStep === 3 && !riskData) {
      setLoading(true);
      setTimeout(async () => {
        try {
          const res = await axios.post(`${API}/workers/risk-profile`, {
            city: formData.city,
            zone: formData.zone,
            hoursPerDay: formData.hoursPerDay,
            dailyEarnings: formData.dailyEarnings,
            platform: formData.platform
          });
          setRiskData(res.data);
          setFormData(prev => ({ ...prev, selectedPlan: res.data.recommendedPlan }));
        } catch (err) {
          console.warn("API failed, using fallback risk data");
          setRiskData({
            score: 78,
            level: "Moderate",
            factors: [
              { label: `${formData.city} Zone`, multiplier: "1.2x", icon: "map" },
              { label: `${formData.hoursPerDay} hrs/day`, multiplier: "1.1x", icon: "clock" },
              { label: formData.platform, multiplier: "1.0x", icon: "star" }
            ],
            recommendedPlan: "Standard"
          });
        } finally {
          setLoading(false);
        }
      }, 1000);
    }
  }, [currentStep, riskData, formData]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        phone: formData.phone,
        city: formData.city,
        zone: formData.zone || "HSR Layout",
        platform: formData.platform,
        weekly_income: formData.dailyEarnings * 6,
        selected_plan: formData.selectedPlan,
        upi_id: formData.upi_id || "worker@upi",
        device_fingerprint: navigator.userAgent
      };

      const res = await axios.post(`${API}/workers/register-simple`, payload);
      
      // Update local storage to mark as onboarded
      const savedUser = localStorage.getItem("insure_gig_user");
      if (savedUser) {
          const userObj = JSON.parse(savedUser);
          userObj.onboarded = true;
          userObj.id = res.data.worker_id;
          localStorage.setItem("insure_gig_user", JSON.stringify(userObj));
          localStorage.setItem("userId", res.data.worker_id);
          setUser(userObj);
      }
      
      toast.success("Registration complete! Policy activated.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIcon = (num: number) => {
    if (currentStep > num) return <Check className="w-4 h-4 text-white" />;
    return <span className={`text-[12px] font-bold ${currentStep === num ? "text-white" : "text-[#94A3B8]"}`}>{num}</span>;
  };

  const platforms = ["Zepto", "Blinkit", "Both"];
  const cities = ["Bengaluru", "Mumbai", "Delhi", "Chennai", "Hyderabad"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-8 font-sans">
      <div className="w-full max-w-[560px] mx-auto px-4 pb-12">
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#E2E8F0] -z-10 rounded"></div>
          {steps.map((label, i) => {
            const num = i + 1;
            const isActive = currentStep === num;
            const isDone = currentStep > num;
            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive || isDone ? "bg-[#2563EB]" : "bg-white border-2 border-[#E2E8F0]"}`}>
                  {renderStepIcon(num)}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-[#0F172A]" : "text-[#94A3B8]"}`}>{label}</span>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-sm overflow-hidden">
          {currentStep === 1 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-2xl font-black text-[#0F172A] mb-2">Basic Details</h2>
              <p className="text-sm text-[#64748B] mb-8">Let's get your profile started.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">Full Name</label>
                  <input type="text" className="w-full h-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 text-[#0F172A] font-semibold outline-none focus:border-[#2563EB] transition-colors" placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                   <label className="block text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">City</label>
                  <div className="grid grid-cols-2 gap-3">
                    {cities.map(c => (
                      <button key={c} onClick={() => setFormData({...formData, city: c})} className={`h-12 rounded-xl border flex items-center justify-center font-bold text-sm transition-all ${formData.city === c ? "border-[#2563EB] bg-[#DBEAFE]/40 text-[#2563EB]" : "border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]"}`}>{c}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">Delivery Platform</label>
                  <div className="flex gap-3">
                    {platforms.map(p => (
                      <button key={p} onClick={() => setFormData({...formData, platform: p})} className={`flex-1 h-12 rounded-xl border flex items-center justify-center font-bold text-sm transition-all ${formData.platform === p ? "border-[#2563EB] bg-[#DBEAFE]/40 text-[#2563EB]" : "border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]"}`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-2xl font-black text-[#0F172A] mb-2">Work Habits</h2>
              <p className="text-sm text-[#64748B] mb-8">This helps calculate your disruption risk.</p>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[11px] font-black text-[#94A3B8] uppercase tracking-widest">Working Hours / Day</label>
                    <span className="text-sm font-black text-[#2563EB]">{formData.hoursPerDay} hrs</span>
                  </div>
                  <input type="range" min={4} max={14} step={1} value={formData.hoursPerDay} onChange={e => setFormData({...formData, hoursPerDay: parseInt(e.target.value)})} className="w-full accent-[#2563EB]" />
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">Delivery Zone (Optional)</label>
                   <input type="text" className="w-full h-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 text-[#0F172A] font-semibold outline-none focus:border-[#2563EB] transition-colors" placeholder="e.g. HSR Layout, Indiranagar" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} />
                </div>

                <div>
                   <label className="block text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">Average Daily Income</label>
                   <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-center">
                        <span className="text-3xl font-black text-[#059669]">₹{formData.dailyEarnings}</span>
                        <input type="range" min={300} max={2500} step={50} value={formData.dailyEarnings} onChange={e => setFormData({...formData, dailyEarnings: parseInt(e.target.value)})} className="w-full accent-[#059669] mt-4" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-2xl font-black text-[#0F172A] mb-2">Risk Profile</h2>
              <p className="text-sm text-[#64748B] mb-8">Generated by GigShield's actuarial model.</p>

              {loading || !riskData ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                   <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-sm font-bold text-[#64748B]">Analyzing hyper-local weather data...</p>
                </div>
              ) : (
                <div className="space-y-6">
                    <div className="flex items-center gap-6 bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                        <div className="w-24 h-24 relative flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" data={[{ value: riskData.score, fill: "#2563EB" }]} startAngle={90} endAngle={-270}>
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-[#0F172A]">{riskData.score}</span>
                            </div>
                        </div>
                        <div>
                            <div className={`text-xs font-black uppercase tracking-widest ${riskData.level === 'High' ? 'text-red-500' : 'text-[#059669]'}`}>{riskData.level} Risk Profile</div>
                            <h3 className="text-lg font-black text-[#0F172A]">Plan Suggestion: {riskData.recommendedPlan}</h3>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                         {riskData.factors.map((f: any, i: number) => (
                             <div key={i} className="flex items-center justify-between p-3 bg-white border border-[#F1F5F9] rounded-xl text-sm font-bold">
                                <span className="text-[#64748B]">{f.label}</span>
                                <span className="text-[#2563EB]">{f.multiplier} impact</span>
                             </div>
                         ))}
                    </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
               <h2 className="text-2xl font-black text-[#0F172A] mb-2">Final Step</h2>
               <p className="text-sm text-[#64748B] mb-8">Setup your instant payout account.</p>

               <div className="space-y-6">
                 <div>
                    <label className="block text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">UPI ID (For Instant Payouts)</label>
                    <input type="text" className="w-full h-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 text-[#0F172A] font-black outline-none focus:border-[#2563EB] transition-colors" placeholder="number@upi" value={formData.upi_id} onChange={e => setFormData({...formData, upi_id: e.target.value})} />
                 </div>
                 
                 <div>
                    <label className="block text-[11px] font-black text-[#94A3B8] uppercase tracking-widest mb-2">Worker Platform ID</label>
                    <input type="text" className="w-full h-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 text-[#0F172A] font-black outline-none focus:border-[#2563EB] transition-colors" placeholder="e.g. ZEP-45892" value={formData.platformId} onChange={e => setFormData({...formData, platformId: e.target.value})} />
                 </div>

                 <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
                    <Shield className="text-[#2563EB] flex-shrink-0" size={20} />
                    <p className="text-[11px] text-[#2563EB] font-bold leading-relaxed">By clicking complete, you agree to the parametric payout terms. No manual claims needed — we monitor the weather & platform status for you.</p>
                 </div>
               </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-10">
            {currentStep > 1 && (
              <button disabled={loading} onClick={handleBack} className="h-12 px-6 font-bold text-[#64748B] hover:text-[#0F172A] transition-colors flex items-center gap-2">
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <div className="ml-auto">
                {currentStep < 4 ? (
                    <button disabled={loading || !formData.name} onClick={handleNext} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-12 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        Forward <ArrowRight size={16} />
                    </button>
                ) : (
                    <button disabled={loading} onClick={handleSubmit} className="bg-[#059669] hover:bg-[#047857] text-white font-black h-12 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
                        {loading ? "Activating..." : "Finish & Activate Policy"}
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
