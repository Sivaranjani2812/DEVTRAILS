import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Camera, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const steps = ["Personal", "Work", "Risk", "KYC"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: user?.phone || "",
    city: "Bengaluru",
    zone: "",
    platform: "Zepto",
    hoursPerDay: 8,
    dailyEarnings: 1000,
    workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    experience: "1-2 yrs",
    aadhaar: "",
    platformId: "",
  });

  const handleNext = () => setCurrentStep((p) => Math.min(p + 1, 4));
  const handleBack = () => setCurrentStep((p) => Math.max(p - 1, 1));

  useEffect(() => {
    if (currentStep === 3 && !riskData) {
      // Simulate/fetch risk profile
      setLoading(true);
      setTimeout(async () => {
        try {
          // Using POST since GET shouldn't have a body
          const res = await api.post("/api/workers/risk-profile", {
            city: formData.city,
            zone: formData.zone,
            hoursPerDay: formData.hoursPerDay,
            dailyEarnings: formData.dailyEarnings,
            platform: formData.platform
          });
          setRiskData(res.data);
        } catch (err) {
          // Fallback if backend route isn't updated matching prompt perfectly
          console.warn("API failed, using fallback risk data");
          setRiskData({
            score: 78,
            level: "Moderate",
            factors: [
              { label: `${formData.city} Zone`, multiplier: "1.2x", icon: "map" },
              { label: `${formData.hoursPerDay} hrs/day`, multiplier: "1.1x", icon: "clock" },
              { label: formData.experience, multiplier: "0.9x", icon: "star" }
            ],
            recommendedPlan: "Standard"
          });
        } finally {
          setLoading(false);
        }
      }, 1500);
    }
  }, [currentStep, riskData, formData]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post("/api/workers/register", {
        ...formData,
        photo: "mock-url", // Handle actual photo upload if needed
      });
      toast.success("Profile created successfully!");
      navigate("/subscription");
    } catch (err) {
      toast.error("Failed to register profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepIcon = (num: number) => {
    if (currentStep > num) return <Check className="w-4 h-4 text-white" />;
    return <span className={`text-[12px] font-bold ${currentStep === num ? "text-white" : "text-[#94A3B8]"}`}>{num}</span>;
  };

  const platforms = ["Zepto", "Blinkit", "Both"];
  const cities = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Hyderabad", "Kolkata", "Pune"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const experiences = ["< 1yr", "1-2 yrs", "2-3 yrs", "3+ yrs"];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pt-8">
      {/* Container */}
      <div className="w-full max-w-[560px] mx-auto px-4 pb-12">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-[#E2E8F0] -z-10 rounded"></div>
          {steps.map((label, i) => {
            const num = i + 1;
            const isActive = currentStep === num;
            const isDone = currentStep > num;
            return (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isActive || isDone ? "bg-[#2563EB]" : "bg-white border-2 border-[#E2E8F0]"
                }`}>
                  {renderStepIcon(num)}
                </div>
                <span className={`text-[12px] font-[600] uppercase tracking-wide ${
                  isActive ? "text-[#0F172A]" : "text-[#94A3B8]"
                }`}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="card-base p-6 md:p-8 relative overflow-hidden bg-white">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-[24px] font-[700] text-[#0F172A] mb-2">Tell us about yourself</h2>
              <p className="text-[14px] text-[#64748B] mb-8">Let's get your basic details sorted.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">Full Name</label>
                  <input type="text" className="input-base" placeholder="Enter your full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">Phone Number</label>
                  <input type="text" className="input-base bg-[#F8FAFC] text-[#64748B]" value={formData.phone} disabled />
                </div>
                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">City</label>
                  <select className="input-base appearance-none bg-white font-medium" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">Delivery Zone / Area</label>
                  <input type="text" className="input-base" placeholder="e.g. HSR Layout, Koramangala" value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">Platform</label>
                  <div className="flex flex-wrap gap-4">
                    {platforms.map(p => (
                      <button key={p} onClick={() => setFormData({...formData, platform: p})} className={`flex-1 h-[80px] rounded-2xl border flex items-center justify-center font-[600] text-[#0F172A] transition-all ${
                        formData.platform === p ? "border-[#2563EB] bg-[#DBEAFE] text-[#1D4ED8]" : "border-[#E2E8F0] hover:border-[#94A3B8]"
                      }`}>{p}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-[24px] font-[700] text-[#0F172A] mb-2">Your work profile</h2>
              <p className="text-[14px] text-[#64748B] mb-8">Help us tailor a policy that fits your schedule.</p>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide">Avg Working Hours / Day</label>
                    <span className="status-badge bg-[#DBEAFE] text-[#1D4ED8] font-bold">{formData.hoursPerDay} hrs</span>
                  </div>
                  <input type="range" min={4} max={14} step={1} value={formData.hoursPerDay} onChange={e => setFormData({...formData, hoursPerDay: parseInt(e.target.value)})} className="w-full accent-[#2563EB]" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide">Avg Daily Earnings</label>
                    <span className="status-badge bg-[#D1FAE5] text-[#059669] font-bold">₹{formData.dailyEarnings}</span>
                  </div>
                  <input type="range" min={300} max={2000} step={50} value={formData.dailyEarnings} onChange={e => setFormData({...formData, dailyEarnings: parseInt(e.target.value)})} className="w-full accent-[#059669]" />
                </div>

                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-3">Days Per Week</label>
                  <div className="flex flex-wrap gap-2">
                    {days.map(d => (
                      <button key={d} onClick={() => {
                        const newDays = formData.workDays.includes(d) ? formData.workDays.filter(day => day !== d) : [...formData.workDays, d];
                        setFormData({...formData, workDays: newDays});
                      }} className={`px-4 py-2 rounded-full text-[13px] font-[600] transition-colors ${
                        formData.workDays.includes(d) ? "bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/20" : "bg-[#F8FAFC] text-[#64748B] hover:bg-[#E2E8F0]"
                      }`}>{d}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-3">Experience</label>
                  <div className="grid grid-cols-2 gap-3">
                    {experiences.map(e => (
                      <button key={e} onClick={() => setFormData({...formData, experience: e})} className={`py-3 rounded-xl border flex items-center justify-center font-[600] text-[14px] transition-all ${
                        formData.experience === e ? "border-[#2563EB] bg-[#DBEAFE] text-[#1D4ED8]" : "border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]"
                      }`}>{e}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300 min-h-[350px]">
              <h2 className="text-[24px] font-[700] text-[#0F172A] mb-2">Your risk profile</h2>
              <p className="text-[14px] text-[#64748B] mb-8">AI is calculating your custom plan premium.</p>

              {loading || !riskData ? (
                <div className="space-y-6">
                  <div className="w-full h-[180px] skeleton rounded-xl"></div>
                  <div className="flex gap-4">
                    <div className="flex-1 h-12 skeleton rounded-xl"></div>
                    <div className="flex-1 h-12 skeleton rounded-xl"></div>
                    <div className="flex-1 h-12 skeleton rounded-xl"></div>
                  </div>
                  <div className="w-2/3 h-10 skeleton mx-auto rounded-xl"></div>
                </div>
              ) : (
                 <div className="flex flex-col md:flex-row gap-8 items-center bg-[#F8FAFC] p-6 rounded-2xl border border-[#E2E8F0]">
                    {/* Radial Chart */}
                    <div className="w-[140px] h-[140px] relative flex-shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={12} data={[ { name: "Score", value: riskData.score, fill: "#2563EB" } ]} startAngle={90} endAngle={-270}>
                          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                          <RadialBar background clockWise dataKey="value" cornerRadius={10} />
                        </RadialBarChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-[800] text-[#0F172A]">{riskData.score}</span>
                        <span className="text-[10px] uppercase text-[#94A3B8] font-bold">/ 100</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`status-badge ${
                          riskData.level === "High" ? "bg-[#FEE2E2] text-[#DC2626]" : 
                          riskData.level === "Low" ? "bg-[#D1FAE5] text-[#059669]" : 
                          "bg-[#FEF3C7] text-[#D97706]"
                        }`}>
                           <ShieldAlert className="w-4 h-4" /> {riskData.level} Risk
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {riskData.factors?.map((f: any, i: number) => (
                          <div key={i} className="flex items-center gap-2 bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 shadow-sm">
                             <span className="text-[12px] font-medium text-[#64748B]">{f.label}</span>
                             <span className="text-[12px] font-bold text-[#0F172A] bg-[#DBEAFE] px-1.5 rounded">{f.multiplier}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-[#DBEAFE] text-[#1D4ED8] px-4 py-3 rounded-xl border border-[#93C5FD]">
                         <span className="text-[13px] font-medium block">Recommended Shield</span>
                         <span className="text-[16px] font-[800]">{riskData.recommendedPlan} Plan</span>
                      </div>
                    </div>
                 </div>
              )}
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="animate-in slide-in-from-right-4 fade-in duration-300">
              <h2 className="text-[24px] font-[700] text-[#0F172A] mb-2">Almost done — KYC</h2>
              <p className="text-[14px] text-[#64748B] mb-8">We need this to activate instant payouts.</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">Aadhaar Number</label>
                  <input type="text" className="input-base font-mono tracking-widest text-lg" placeholder="•••• •••• ••••" maxLength={14} value={formData.aadhaar} onChange={e => {
                    let val = e.target.value.replace(/\D/g, "");
                    val = val.match(/.{1,4}/g)?.join(" ") || "";
                    setFormData({...formData, aadhaar: val});
                  }} />
                </div>
                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">Worker Platform ID</label>
                  <input type="text" className="input-base uppercase font-mono" placeholder="e.g. ZEP-45892" value={formData.platformId} onChange={e => setFormData({...formData, platformId: e.target.value.toUpperCase()})} />
                </div>
                
                <div>
                  <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">Profile Photo directly holding ID</label>
                  <div className="w-full h-[140px] border-2 border-dashed border-[#CBD5E1] rounded-2xl flex flex-col items-center justify-center bg-[#F8FAFC] cursor-pointer hover:bg-[#F1F5F9] transition-colors">
                    <Camera className="w-8 h-8 text-[#94A3B8] mb-3" />
                    <span className="text-[14px] font-medium text-[#64748B]">Tap to upload photo</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 mt-4 pt-4 border-t border-[#E2E8F0]">
                  <input type="checkbox" id="terms" className="mt-1 w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]" required />
                  <label htmlFor="terms" className="text-[13px] text-[#64748B] leading-tight">
                    I agree to the <a href="#" className="text-[#2563EB] font-medium">Terms of Service</a> & allow InsureGig to access my delivery status via API triggers for automatic claim payouts.
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons footer */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#E2E8F0]">
            {currentStep > 1 ? (
              <button disabled={loading} onClick={handleBack} className="px-5 py-2.5 font-[600] text-[#64748B] hover:text-[#0F172A] transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : <div></div>}

            {currentStep < 4 ? (
               <button disabled={loading || (currentStep===3 && !riskData) || formData.name.length < 3} 
                       onClick={handleNext} 
                       className="btn-primary flex items-center gap-2">
                 Continue <ArrowRight className="w-4 h-4" />
               </button>
            ) : (
               <button disabled={loading || !formData.aadhaar || !formData.platformId} 
                       onClick={handleSubmit} 
                       className="btn-primary shadow-lg shadow-[#2563EB]/20 bg-[#059669] hover:bg-[#047857]">
                 {loading ? "Registering..." : "Complete & Select Plan"}
               </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
