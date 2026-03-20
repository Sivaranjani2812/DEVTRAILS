import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, CloudRain, Briefcase, Zap, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import DemoFab from "@/components/DemoFab";

const plans = [
  { id: "Basic", name: "Basic Plan", price: 49, coverage: "₹1,500" },
  { id: "Standard", name: "Standard Plan", price: 89, coverage: "₹3,000", isRecommended: true },
  { id: "Premium", name: "Premium Plan", price: 149, coverage: "₹5,000" },
];

const RiskAnalysis = () => {
  const navigate = useNavigate();
  const [score, setScore] = useState(0);
  const targetScore = 78;
  const [selectedPlan, setSelectedPlan] = useState("Standard");

  useEffect(() => {
    // Animate score counter
    const duration = 1500;
    const steps = 60;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setScore(Math.round((targetScore / steps) * currentStep));
      if (currentStep >= steps) clearInterval(timer);
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const handleActivate = () => {
    // Proceed to subscription/payment flow. We pass the plan in state or localStorage
    localStorage.setItem("Shiftsafe_selected_plan", selectedPlan);
    navigate("/subscription");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center">
        <Navbar />
        <DemoFab />

        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container max-w-4xl py-12 px-6 z-10 space-y-8 mt-10">
          
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl font-bold text-foreground">AI Risk Analysis</h1>
            <p className="text-muted-foreground">Evaluating your exposure to weather disruptions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* Left: Score & Factors */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="bg-card rounded-[2rem] p-8 shadow-2xl border border-white/5 flex flex-col justify-center relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />
              
              <div className="text-center mb-8">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Risk Score</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted" />
                    <motion.circle 
                      initial={{ strokeDasharray: "440", strokeDashoffset: "440" }}
                      animate={{ strokeDashoffset: 440 - (440 * score) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="10" fill="transparent" 
                      className="text-warning stroke-current"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute font-display font-bold text-5xl text-foreground">
                    {score}
                  </div>
                </div>
                <div className="mt-4">
                  <span className="bg-warning/10 text-warning px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">
                    MEDIUM-HIGH RISK
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-background rounded-xl p-4 flex gap-4 items-center border border-white/5">
                  <div className="bg-primary/20 p-2 rounded-lg text-primary"><Briefcase className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Work Pattern</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">Frequent night shifts elevate exposure</p>
                  </div>
                </div>
                <div className="bg-background rounded-xl p-4 flex gap-4 items-center border border-white/5">
                  <div className="bg-danger/20 p-2 rounded-lg text-danger"><CloudRain className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Zone Risk</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">HSR Layout prone to gridlocks in rain</p>
                  </div>
                </div>
                <div className="bg-background rounded-xl p-4 flex gap-4 items-center border border-white/5">
                  <div className="bg-warning/20 p-2 rounded-lg text-warning"><AlertTriangle className="w-5 h-5" /></div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Financial Vulnerability</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">Sole earner with limited buffer</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Plan Recommendation */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }}
            >
              <h3 className="font-bold text-xl mb-4 text-foreground px-2">Recommended Protection</h3>
              <div className="space-y-4">
                {plans.map((plan) => (
                  <div 
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer rounded-[1.5rem] p-6 transition-all border-2 relative overflow-hidden ${
                      selectedPlan === plan.id 
                        ? "bg-card border-primary shadow-lg shadow-primary/20" 
                        : "bg-card/50 border-transparent hover:bg-card hover:border-white/10"
                    }`}
                  >
                    {plan.isRecommended && (
                      <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                        AI RECOMMENDED
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-foreground">{plan.name}</h4>
                          {selectedPlan === plan.id && <Check className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Coverage up to {plan.coverage}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-2xl text-foreground">₹{plan.price}</p>
                        <p className="text-xs text-muted-foreground">/week</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <button 
                  onClick={handleActivate}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group"
                >
                  <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Activate Plan →
                </button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Powered by Shiftsafe AI Engine
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default RiskAnalysis;
