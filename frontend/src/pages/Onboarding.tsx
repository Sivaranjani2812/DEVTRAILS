import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Check, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import DemoFab from "@/components/DemoFab";
import PageTransition from "@/components/PageTransition";
import { api } from "@/lib/api";
import { toast } from "sonner";

const cities = ["Bangalore", "Chennai", "Mumbai", "Hyderabad", "Delhi", "Pune", "Other"];
const platforms = ["Zepto", "Blinkit", "Swiggy Instamart", "Big Basket"];
const allZones = [
  "HSR Layout", "Koramangala", "BTM Layout", "Whitefield", "Indiranagar",
  "Marathahalli", "Jayanagar", "JP Nagar", "Electronic City", "Hebbal",
  "Yelahanka", "Banashankari",
];
const daysOptions = ["3–4 days", "5–6 days", "7 days (every day)"];
const shiftOptions = ["Morning (6am–2pm)", "Afternoon (12pm–8pm)", "Evening (4pm–12am)", "Night (10pm–6am)", "Mixed / No fixed shift"];
const savingsOptions = ["No savings at all", "Less than ₹2,000", "₹2,000 – ₹5,000", "More than ₹5,000"];
const weatherFreqOptions = ["Rarely (1–2 times/month)", "Sometimes (3–5 times/month)", "Often (6–10 times/month)", "Very often (10+ times/month)"];
const lossReasons = ["Heavy rain", "Flooding", "Extreme heat", "Bandh or curfew", "App going down", "Severe pollution"];

const TOTAL_STEPS = 3;

const Onboarding = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Removed automatic redirect to dashboard so questions can be viewed during the demo funnel.
  }, []);

  // Step 1 - Identity
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Step 2 - Work Setup
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [zoneSearch, setZoneSearch] = useState("");
  const [workDays, setWorkDays] = useState("");
  const [shift, setShift] = useState("");

  // Step 3 - Earnings & Budget
  const [earnings, setEarnings] = useState(4200);
  const [budget, setBudget] = useState(49);

  // Step 4 - Risk Profile
  const [savings, setSavings] = useState("");
  const [weatherFreq, setWeatherFreq] = useState("");
  const [lossHistory, setLossHistory] = useState<string[]>([]);

  // Step 5 - UPI
  const [upiId, setUpiId] = useState("");

  // ML calculation
  const [calculating, setCalculating] = useState(false);
  const [premium, setPremium] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [recommendedPlan, setRecommendedPlan] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);

  const togglePlatform = (p: string) =>
    setSelectedPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const toggleZone = (z: string) => {
    if (selectedZones.includes(z)) setSelectedZones((prev) => prev.filter((x) => x !== z));
    else if (selectedZones.length < 5) setSelectedZones((prev) => [...prev, z]);
  };

  const toggleLoss = (r: string) =>
    setLossHistory((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!/^\d{10}$/.test(phone)) e.phone = "Enter valid 10-digit number";
    if (!city) e.city = "Select a city";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (selectedPlatforms.length === 0) e.platforms = "Select at least one platform";
    if (selectedZones.length === 0) e.zones = "Select at least one zone";
    if (!workDays) e.workDays = "Select work days";
    if (!shift) e.shift = "Select your shift";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep4 = () => {
    const e: Record<string, string> = {};
    if (!savings) e.savings = "Select an option";
    if (!weatherFreq) e.weatherFreq = "Select an option";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep5 = () => {
    const e: Record<string, string> = {};
    if (!upiId.trim() || !upiId.includes("@")) e.upi = "Enter a valid UPI ID (e.g. name@upi)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    setErrors({});
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setCalculating(true);
    // Simulate calculating ML risk
    setTimeout(() => {
      setCalculating(false);
      navigate("/risk");
    }, 1500);
  };

  const activateCoverage = async () => {
    if (!userId || !recommendedPlan) return;
    setActivating(true);

    try {
      const planResp = await api.selectPlan({ user_id: userId, selected_plan: recommendedPlan });
      await api.pay({ user_id: userId });

      localStorage.setItem("Shiftsafe_user_id", userId.toString());
      localStorage.setItem("Shiftsafe_name", name);

      toast.success("Coverage activated! 🚀");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Activation failed");
    } finally {
      setActivating(false);
    }
  };

  const filteredZones = allZones.filter((z) => z.toLowerCase().includes(zoneSearch.toLowerCase()));

  return (
    <PageTransition>
      <div className="min-h-screen bg-muted">
        <DemoFab />
        <div className="container max-w-2xl py-10">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex-1">
                <div className={`h-2 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-border"}`} />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-6">Step {step} of {TOTAL_STEPS}</p>

          <AnimatePresence mode="wait">
            {/* STEP 1 — Identity */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl font-bold mb-6">Identity</h2>
                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">What's your name?</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Enter your name" />
                    {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Your phone number?</label>
                    <div className="flex">
                      <span className="bg-muted border border-input border-r-0 rounded-l-lg px-4 py-3 text-sm text-muted-foreground">+91</span>
                      <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} className="w-full border border-input rounded-r-lg px-4 py-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary" placeholder="98765 43210" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">We'll send an OTP to verify</p>
                    {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Which city do you work in?</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {cities.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCity(c)}
                          className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                            city === c ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input text-foreground hover:border-primary"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    {errors.city && <p className="text-xs text-danger mt-1">{errors.city}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2 — Work Setup */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl font-bold mb-6">Work Setup</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Which platforms do you work on?</label>
                    <div className="flex gap-3 flex-wrap">
                      {platforms.map((p) => (
                        <button key={p} onClick={() => togglePlatform(p)} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          selectedPlatforms.includes(p) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input text-foreground hover:border-primary"
                        }`}>
                          {selectedPlatforms.includes(p) && <Check className="w-4 h-4" />}
                          {p}
                        </button>
                      ))}
                    </div>
                    {errors.platforms && <p className="text-xs text-danger mt-1">{errors.platforms}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Which dark stores do you work from? <span className="text-muted-foreground">(up to 5)</span></label>
                    <div className="relative mb-3">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input value={zoneSearch} onChange={(e) => setZoneSearch(e.target.value)} className="w-full border border-input rounded-lg pl-10 pr-4 py-3 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary" placeholder="Search by area name..." />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filteredZones.map((z) => (
                        <button key={z} onClick={() => toggleZone(z)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          selectedZones.includes(z) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input text-foreground hover:border-primary"
                        }`}>
                          {selectedZones.includes(z) && <Check className="w-3.5 h-3.5" />}
                          {z}
                        </button>
                      ))}
                    </div>
                    {errors.zones && <p className="text-xs text-danger mt-1">{errors.zones}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">How many days do you work per week?</label>
                    <div className="flex gap-2 flex-wrap">
                      {daysOptions.map((d) => (
                        <button key={d} onClick={() => setWorkDays(d)} className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          workDays === d ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input text-foreground hover:border-primary"
                        }`}>{d}</button>
                      ))}
                    </div>
                    {errors.workDays && <p className="text-xs text-danger mt-1">{errors.workDays}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">What shift do you usually work?</label>
                    <div className="flex gap-2 flex-wrap">
                      {shiftOptions.map((s) => (
                        <button key={s} onClick={() => setShift(s)} className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          shift === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input text-foreground hover:border-primary"
                        }`}>{s}</button>
                      ))}
                    </div>
                    {errors.shift && <p className="text-xs text-danger mt-1">{errors.shift}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — Earnings & Budget */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl font-bold mb-6">Earnings & Budget</h2>
                <div className="space-y-8">
                  <div className="bg-card rounded-xl p-6 card-shadow">
                    <label className="text-sm font-medium mb-4 block">What are your average weekly earnings across all platforms?</label>
                    <div className="text-center mb-4">
                      <span className="font-display text-4xl font-bold text-primary">₹{earnings.toLocaleString("en-IN")}</span>
                      <span className="text-sm text-muted-foreground">/week</span>
                    </div>
                    <input type="range" min={1000} max={8000} step={100} value={earnings} onChange={(e) => setEarnings(Number(e.target.value))} className="w-full accent-primary" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>₹1,000</span><span>₹8,000</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Include earnings from all platforms combined</p>
                  </div>

                  <div className="bg-card rounded-xl p-6 card-shadow">
                    <label className="text-sm font-medium mb-4 block">How much can you afford to pay per week for insurance?</label>
                    <div className="text-center mb-4">
                      <span className="font-display text-4xl font-bold text-accent">₹{budget}</span>
                      <span className="text-sm text-muted-foreground">/week</span>
                    </div>
                    <input type="range" min={0} max={200} step={1} value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full accent-accent" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>₹0</span><span>₹200</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Be honest — we'll find the best plan within your budget</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4 — Risk Profile */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl font-bold mb-6">Risk Profile</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Do you have any emergency savings?</label>
                    <div className="flex gap-2 flex-wrap">
                      {savingsOptions.map((s) => (
                        <button key={s} onClick={() => setSavings(s)} className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          savings === s ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input text-foreground hover:border-primary"
                        }`}>{s}</button>
                      ))}
                    </div>
                    {errors.savings && <p className="text-xs text-danger mt-1">{errors.savings}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">How often does weather currently affect your work?</label>
                    <div className="flex gap-2 flex-wrap">
                      {weatherFreqOptions.map((w) => (
                        <button key={w} onClick={() => setWeatherFreq(w)} className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          weatherFreq === w ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input text-foreground hover:border-primary"
                        }`}>{w}</button>
                      ))}
                    </div>
                    {errors.weatherFreq && <p className="text-xs text-danger mt-1">{errors.weatherFreq}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Have you ever lost income because of: <span className="text-muted-foreground">(select all that apply)</span></label>
                    <div className="flex gap-2 flex-wrap">
                      {lossReasons.map((r) => (
                        <button key={r} onClick={() => toggleLoss(r)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                          lossHistory.includes(r) ? "bg-primary text-primary-foreground border-primary" : "bg-card border-input text-foreground hover:border-primary"
                        }`}>
                          {lossHistory.includes(r) && <Check className="w-3.5 h-3.5" />}
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5 — UPI Details */}
            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="font-display text-2xl font-bold mb-6">UPI Details</h2>
                <div className="bg-card rounded-xl p-6 card-shadow space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Your UPI ID for instant payouts ⚡</label>
                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary" placeholder="name@upi" />
                    {errors.upi && <p className="text-xs text-danger mt-1">{errors.upi}</p>}
                    <div className="mt-3 text-xs text-muted-foreground space-y-1">
                      <p>Examples: 9876543210@paytm, name@ybl, name@okaxis</p>
                      <p>This is where we send your claim payouts instantly ⚡</p>
                    </div>
                  </div>
                </div>

                {/* ML Premium Result */}
                {calculating && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center gap-2 py-8 mt-6">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Our ML model is calculating your personalized premium...</span>
                  </motion.div>
                )}

                {premium !== null && !calculating && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="gradient-primary text-primary-foreground rounded-xl p-6 mt-6">
                    <p className="text-sm opacity-80 mb-1">Your personalized premium</p>
                    <p className="text-3xl font-display font-bold">₹{premium}/week</p>
                    <p className="text-sm opacity-80 mt-2">Calculated based on your earnings, location risk, work pattern and budget</p>
                    <button onClick={activateCoverage} disabled={activating} className="mt-4 w-full bg-accent text-accent-foreground rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center">
                      {activating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Activate Coverage →"}
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button onClick={() => { setStep(step - 1); setErrors({}); setPremium(null); }} className="flex-1 border border-input bg-card rounded-lg py-3 text-sm font-semibold hover:bg-muted transition-colors">
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button onClick={handleNext} className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-opacity">
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={calculating} className="flex-1 bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {calculating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Calculate My Protection →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Onboarding;
