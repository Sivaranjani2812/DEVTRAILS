import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import DemoFab from "@/components/DemoFab";

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    
    setLoading(true);
    // Simulate sending OTP
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
      toast.success("OTP sent securely to your device");
    }, 1000);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join("").length !== 4) {
      toast.error("Please enter the 4-digit OTP");
      return;
    }

    setLoading(true);
    // Simulate verification
    setTimeout(() => {
      setLoading(false);
      // We route them to Onboarding to answer questions
      navigate("/onboarding");
    }, 1500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center">
        <DemoFab />

        {/* Ambient background glows */}
        <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="container max-w-sm py-20 px-6 z-10 w-full flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {step === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-card rounded-[2rem] p-8 card-shadow border border-white/50"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground">Get Started</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter your phone number to sign up or log in securely.
                  </p>
                </div>

                <form onSubmit={handlePhoneSubmit} className="space-y-6">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Mobile Number</label>
                    <div className="flex bg-muted/50 rounded-xl overflow-hidden border border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
                      <span className="flex items-center justify-center px-4 border-r border-input text-sm font-semibold text-muted-foreground bg-white/50">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className="w-full px-4 py-3 text-sm bg-transparent focus:outline-none font-bold tracking-wide"
                        placeholder="98765 43210"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || phone.length !== 10}
                    className="w-full bg-primary text-white rounded-full py-4 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-card rounded-[2rem] p-8 card-shadow border border-white/50"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl text-success font-bold">✓</span>
                  </div>
                  <h1 className="font-display text-2xl font-bold text-foreground">Verify OTP</h1>
                  <p className="text-sm text-muted-foreground mt-2">
                    Enter the 4-digit code sent to<br/><strong className="text-foreground">+91 {phone}</strong>
                  </p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-8">
                  <div className="flex justify-center gap-3">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        className="w-14 h-14 text-center text-2xl font-display font-bold bg-muted/50 border border-input rounded-2xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary focus:bg-white transition-all shadow-sm"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otp.join("").length !== 4}
                    className="w-full bg-primary text-white rounded-full py-4 text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:-translate-y-0 disabled:hover:shadow-none"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify & Sign Up"}
                    {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                  
                  <p className="text-center text-xs font-semibold text-primary cursor-pointer hover:underline">
                    Resend Code
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
