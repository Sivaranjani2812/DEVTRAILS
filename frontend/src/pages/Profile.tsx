import { useNavigate } from "react-router-dom";
import { User, Phone, MapPin, Shield, CreditCard, LogOut, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import DemoFab from "@/components/DemoFab";

const Profile = () => {
  const navigate = useNavigate();
  
  // Fetch from localStorage or use defaults
  const name = localStorage.getItem("InsureGig_name") || "Arjun K";
  const location = localStorage.getItem("InsureGig_location") || "HSR Layout";
  const plan = localStorage.getItem("InsureGig_selected_plan") || "Standard Plan";
  const phone = "9876543210"; // Currently mock, since it's just a demo representation
  const upiId = "arjun98@okaxis";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center">
        <Navbar />
        <DemoFab />

        {/* Ambient background glows */}
        <div className="absolute top-[0] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[0] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="container max-w-lg py-12 px-6 z-10 w-full mt-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          <div className="text-center space-y-2 mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your account and coverage details</p>
          </div>

          <div className="space-y-6">
            {/* User Details */}
            <div className="bg-card rounded-[2rem] p-6 shadow-xl border border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-foreground">{name}</h2>
                  <span className="bg-success/10 text-success text-[10px] uppercase font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Active Protection
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-background/50 border border-white/5">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">+91 {phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm p-3 rounded-xl bg-background/50 border border-white/5">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{location}</span>
                </div>
              </div>
            </div>

            {/* Coverage & Payment */}
            <h3 className="font-bold text-foreground text-lg px-2 mt-8 mb-4">Coverage Details</h3>
            
            <div className="bg-card rounded-[1.5rem] p-6 shadow-xl border border-white/5 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Current Plan</p>
                    <p className="font-bold text-sm text-foreground">{plan}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20">Upgrade</button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Payout UPI</p>
                    <p className="font-bold text-sm text-foreground">{upiId}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-success">Verified</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-8">
              <button 
                onClick={handleLogout}
                className="w-full bg-danger/10 text-danger border border-danger/20 py-4 rounded-full font-bold text-sm hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-2 group"
              >
                <LogOut className="w-4 h-4" />
                Sign Out / Reset Demo
              </button>
              <p className="text-center text-xs text-muted-foreground mt-4">
                InsureGig App v1.2.0
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Profile;
