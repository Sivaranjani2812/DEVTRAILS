import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = "Email is required";
    if (!password.trim()) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Logged in as admin ✅");
      navigate("/admin");
    }, 1500);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-2xl text-primary">InsureGig</span>
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage claims and workers</p>
          </div>

          <form onSubmit={handleLogin} className="bg-card rounded-2xl p-8 card-shadow-lg border border-border space-y-5">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-2">
              <Lock className="w-6 h-6 text-primary" />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@insuregig.in"
              />
              {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-input rounded-lg px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              This portal is for InsureGig administrators only.
            </p>
          </form>
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminLogin;
