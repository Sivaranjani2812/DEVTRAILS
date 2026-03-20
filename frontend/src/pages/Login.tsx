import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Phone } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const response = await api.login(phone);
      localStorage.setItem("gigshield_user_id", response.user_id.toString());
      localStorage.setItem("gigshield_name", response.name);
      localStorage.setItem("gigshield_location", response.location);
      
      toast.success(`Welcome back, ${response.name}!`);
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "User not found. Please sign up first.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-muted">
        <Navbar />
        <div className="container max-w-md py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 card-shadow border border-border"
          >
            <div className="text-center mb-8">
              <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
              <p className="text-sm text-muted-foreground mt-2">
                Enter your phone number to access your protection dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
                <div className="flex">
                  <span className="bg-muted border border-input border-r-0 rounded-l-lg px-4 py-3 text-sm text-muted-foreground">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full border border-input rounded-r-lg px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="98765 43210"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continue →"}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-sm text-muted-foreground">
                Don't have protection yet?{" "}
                <Link to="/onboarding" className="text-primary font-semibold hover:underline">
                  Sign up here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Login;
