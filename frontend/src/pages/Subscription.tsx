import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import DemoFab from "@/components/DemoFab";

const plans: Record<string, { name: string; price: number; coverage: string }> = {
  Basic: { name: "Basic Plan", price: 49, coverage: "₹1,500" },
  Standard: { name: "Standard Plan", price: 89, coverage: "₹3,000" },
  Premium: { name: "Premium Plan", price: 149, coverage: "₹5,000" }
};

const Subscription = () => {
  const navigate = useNavigate();
  const [selectedPlanId, setSelectedPlanId] = useState("Standard");
  const [autoRenew, setAutoRenew] = useState(true);
  const [upiId, setUpiId] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "success">("idle");

  useEffect(() => {
    const plan = localStorage.getItem("InsureGig_selected_plan");
    if (plan && plans[plan]) {
      setSelectedPlanId(plan);
    }
  }, []);

  const plan = plans[selectedPlanId];

  const handlePayment = () => {
    if (!upiId) return;
    setStatus("processing");

    // Simulate payment processing flow
    setTimeout(() => {
      setStatus("success");
      
      // Mock successful auth state globally
      localStorage.setItem("InsureGig_user_id", "1");
      localStorage.setItem("InsureGig_name", "Arjun");
      localStorage.setItem("InsureGig_location", "HSR Layout");

      // Redirect visually after showing success
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    }, 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center">
        <Navbar />
        <DemoFab />

        {/* Ambient background glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container max-w-lg py-12 px-6 z-10 w-full">
          
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Analysis
          </button>

          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div 
                key="checkout"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-8">
                  <h1 className="font-display text-3xl font-bold text-foreground">Complete Payment</h1>
                  <p className="text-muted-foreground">Activate your InsureGig coverage</p>
                </div>

                {/* Plan Summary Card */}
                <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-white/5 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-2.5 rounded-xl text-primary">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="font-bold text-lg text-foreground">{plan.name}</h2>
                        <p className="text-sm text-primary font-semibold">Billed Weekly</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10 bg-background/50 p-4 rounded-xl text-sm border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Weekly Premium</span>
                      <span className="font-bold text-foreground">₹{plan.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground font-medium">Income Covered</span>
                      <span className="font-bold text-foreground">Up to {plan.coverage}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Details */}
                <div className="bg-card rounded-[1.5rem] p-6 shadow-xl border border-white/5">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    Payment Method
                    <span className="bg-success/10 text-success text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">UPI Default</span>
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Enter Your UPI ID</label>
                      <input 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)} 
                        className="w-full bg-background border border-white/10 rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-primary transition-colors" 
                        placeholder="arjun98@okaxis" 
                      />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group bg-background/50 p-4 rounded-xl border border-white/5 transition-colors hover:border-white/10">
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${autoRenew ? 'bg-primary text-primary-foreground' : 'bg-muted border border-white/10'}`}>
                        {autoRenew && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <input type="checkbox" checked={autoRenew} onChange={() => setAutoRenew(!autoRenew)} className="hidden" />
                      <div>
                        <p className="text-sm font-bold text-foreground">Auto-renew weekly</p>
                        <p className="text-xs text-muted-foreground">Cancel anytime before next billing</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handlePayment}
                    disabled={!upiId}
                    className="w-full bg-primary text-primary-foreground py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                  >
                    Pay ₹{plan.price} & Activate
                  </button>
                  <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
                    <Shield className="w-3.5 h-3.5" /> 256-bit bank-level security
                  </p>
                </div>
              </motion.div>
            )}

            {/* Processing State */}
            {status === "processing" && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <div className="w-20 h-20 mb-6 bg-primary/10 rounded-full flex items-center justify-center relative">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping" />
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">Processing Payment</h2>
                <p className="text-muted-foreground">Securely connecting to UPI network...</p>
              </motion.div>
            )}

            {/* Success State */}
            {status === "success" && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-24 h-24 mb-6 bg-success/20 rounded-full flex items-center justify-center text-success"
                >
                  <CheckCircle2 className="w-12 h-12 text-success" />
                </motion.div>
                <h2 className="font-display text-3xl font-bold text-foreground mb-2">Payment Successful ✅</h2>
                <p className="text-muted-foreground max-w-[280px]">Your initial premium of ₹{plan.price} has been paid successfully.</p>
                <p className="text-primary font-bold mt-6 tracking-wider uppercase text-sm">Redirecting to Dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default Subscription;
