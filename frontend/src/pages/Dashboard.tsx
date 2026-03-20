import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Check, AlertTriangle, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import DemoFab from "@/components/DemoFab";
import PageTransition from "@/components/PageTransition";
import { api } from "@/lib/api";

const zones = [
  { name: "HSR Layout", risk: "HIGH", color: "text-danger", rain: "65mm", temp: "26°C", aqi: "88", note: "Heavy rain expected 3pm" },
  { name: "Koramangala", risk: "MEDIUM", color: "text-warning", rain: "18mm", temp: "28°C", aqi: "92", note: "Light rain possible" },
  { name: "BTM Layout", risk: "HIGH", color: "text-danger", rain: "72mm", temp: "25°C", aqi: "85", note: "Flood alert active" },
];

const forecast = [
  { day: "Mon", icon: "🌧️", risk: "HIGH" },
  { day: "Tue", icon: "☀️", risk: "LOW" },
  { day: "Wed", icon: "🌧️", risk: "HIGH" },
  { day: "Thu", icon: "🌧️", risk: "MED" },
  { day: "Fri", icon: "☀️", risk: "LOW" },
  { day: "Sat", icon: "🌧️", risk: "HIGH" },
  { day: "Sun", icon: "☀️", risk: "LOW" },
];

type ClaimItem = { date: string; trigger: string; zone: string; status: string; amount: string; time: string };

const claimsByMonth: Record<string, ClaimItem[]> = {
  "March 2026": [
    { date: "Mar 15", trigger: "Heavy Rain", zone: "HSR Layout", status: "approved", amount: "₹500", time: "43 secs" },
    { date: "Mar 10", trigger: "Flood Alert", zone: "BTM Layout", status: "approved", amount: "₹700", time: "38 secs" },
  ],
  "February 2026": [
    { date: "Feb 28", trigger: "Rain", zone: "Koramangala", status: "rejected", amount: "", time: "" },
    { date: "Feb 20", trigger: "Platform Outage", zone: "HSR Layout", status: "review", amount: "", time: "" },
  ],
};

const Dashboard = () => {
  const [shiftActive, setShiftActive] = useState(false);
  const [selectedStore, setSelectedStore] = useState("HSR Layout");
  const [loadingShift, setLoadingShift] = useState(false);
  const [claimsMonth, setClaimsMonth] = useState("March 2026");
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("InsureGig_user_id");
  const userName = localStorage.getItem("InsureGig_name") || "Worker";
  const userLocation = localStorage.getItem("InsureGig_location") || "HSR Layout";

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const data = await api.getDashboard(Number(userId));
        setUserData(data);
      } catch (err: any) {
        toast.error("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 10 seconds for demo purposes to see claim updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const startShift = () => {
    setLoadingShift(true);
    setTimeout(() => {
      setShiftActive(true);
      setLoadingShift(false);
      toast.success("Shift started 🟢");
    }, 1200);
  };

  const endShift = () => {
    setShiftActive(false);
    toast("Shift ended");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full">
          <Navbar />
          <DemoFab />
          
          <motion.div 
            initial="hidden" animate="show" 
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
            className="container max-w-6xl py-10 space-y-8"
          >
            {/* Greeting */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="flex items-center justify-between">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Hey {userName} 👋</h1>
              <div className="bg-white/50 backdrop-blur-md p-3 rounded-full shadow-sm cursor-pointer hover:bg-white transition-all">
                <Bell className="w-5 h-5 text-primary" />
              </div>
            </motion.div>

            {/* Top row: Coverage + Location + Alert */}
            <div className="grid lg:grid-cols-3 gap-6">
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="gradient-primary text-primary-foreground rounded-[2rem] p-8 shadow-2xl shadow-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-20">
                  <Shield className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-6 h-6" />
                    <span className="font-semibold text-lg uppercase tracking-wide">Coverage {userData?.policy_status || "INACTIVE"}</span>
                    {userData?.policy_status === "ACTIVE" && <Check className="w-5 h-5 bg-accent text-primary rounded-full p-1" />}
                  </div>
                  <p className="text-xl font-bold mb-1">{userData?.active_plan?.replace("_", " ") || "No Active Plan"}</p>
                  <p className="opacity-90 font-medium">₹{(userData?.coverage || 0).toLocaleString()} protected</p>
                  <div className="mt-6 pt-6 border-t border-white/20">
                    <p className="text-sm opacity-80 font-medium">Next Billing: {userData?.next_billing_date ? new Date(userData.next_billing_date).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>
              </motion.div>

              {/* Current Location */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="bg-white rounded-[2rem] p-7 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-2 mb-4">
                  <div className="bg-primary/10 p-2 rounded-xl text-primary">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-lg">Current Location</span>
                </div>
                <p className="text-foreground font-medium mb-1">📍 {userLocation}, Bangalore</p>
                <p className="text-sm text-muted-foreground">Monitoring weather disruptions in your area</p>
                <div className="mt-5 bg-muted/50 rounded-2xl h-24 flex items-center justify-center text-sm font-medium text-muted-foreground border border-white/50 backdrop-blur-sm">
                  🗺️ Map view — HSR Layout sector
                </div>
              </motion.div>

              {/* Alert Card */}
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="bg-gradient-to-br from-accent/20 to-accent/5 rounded-[2rem] p-7 flex flex-col justify-center gap-4 relative overflow-hidden border border-accent/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 rounded-full blur-3xl" />
                <div className="bg-accent/30 w-12 h-12 rounded-full flex items-center justify-center z-10">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                </div>
                <div className="z-10">
                  <p className="text-lg leading-snug">
                    <span className="font-bold text-primary">⚠️ High risk expected</span> in HSR Layout at 3pm. Your coverage is active and ready.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Weather Risk Cards */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <h2 className="font-bold text-xl mb-4 px-2">Your Dark Stores Today</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {zones.map((z) => (
                  <motion.div whileHover={{ y: -5 }} key={z.name} className="bg-white rounded-[1.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <p className="font-bold text-lg">{z.name}</p>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${z.risk === "HIGH" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                        {z.risk === "HIGH" ? "🔴" : "🟡"} {z.risk}
                      </span>
                    </div>
                    <div className="bg-muted/30 rounded-xl p-4 space-y-2 text-sm font-medium text-muted-foreground mb-4">
                      <div className="flex justify-between"><span className="flex items-center gap-2">🌧️ Rain</span> <span className="text-foreground">{z.rain}</span></div>
                      <div className="flex justify-between"><span className="flex items-center gap-2">🌡️ Temp</span> <span className="text-foreground">{z.temp}</span></div>
                      <div className="flex justify-between"><span className="flex items-center gap-2">💨 AQI</span> <span className="text-foreground">{z.aqi}</span></div>
                    </div>
                    <p className="text-sm font-semibold text-primary">{z.note}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Middle row: Shift + Forecast */}
            <div className="grid lg:grid-cols-2 gap-6">
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="font-bold text-xl mb-6">Start Your Shift</h3>
                <div className="space-y-3 mb-6">
                  {zones.map((z) => (
                    <label key={z.name} className={`flex items-center gap-4 cursor-pointer p-4 rounded-xl border-2 transition-all ${selectedStore === z.name ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/30 hover:bg-muted/50'}`}>
                      <input type="radio" name="store" value={z.name} checked={selectedStore === z.name} onChange={(e) => setSelectedStore(e.target.value)} className="w-5 h-5 accent-primary" />
                      <span className="font-medium">{z.name}</span>
                      <span className={`text-xs font-bold ml-auto px-2 py-1 rounded-md ${z.risk === "HIGH" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"}`}>
                        {z.risk}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mb-6 flex-wrap">
                  {["Zepto", "Blinkit", "Instamart", "Big Basket"].map((p) => (
                    <span key={p} className="bg-accent/20 text-primary text-xs font-bold px-3 py-1.5 rounded-full">✓ {p}</span>
                  ))}
                </div>
                {!shiftActive ? (
                  <button onClick={startShift} disabled={loadingShift} className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 relative overflow-hidden">
                    {loadingShift ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Start Shift — Activate Coverage"}
                    {!loadingShift && <div className="absolute inset-0 bg-white/20 w-1/2 h-full skew-x-12 -translate-x-full hover:animate-[slide_1s_ease-in-out]" />}
                  </button>
                ) : (
                  <button onClick={endShift} className="w-full bg-accent text-primary border-2 border-primary/20 py-4 rounded-full font-bold text-lg hover:shadow-md transition-all">
                    Shift Active 🛡️ | End Shift
                  </button>
                )}
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h3 className="font-bold text-xl mb-6">This Week's Risk Forecast</h3>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                  {forecast.map((d, i) => (
                    <motion.div whileHover={{ scale: 1.05 }} key={d.day + i} className="rounded-2xl p-4 flex flex-col items-center justify-center bg-muted/40 transition-all hover:bg-muted/80">
                      <p className="text-sm font-medium text-muted-foreground mb-2">{d.day}</p>
                      <p className="text-2xl mb-3 drop-shadow-sm">{d.icon}</p>
                      <div className={`w-2 h-2 rounded-full mb-1 ${d.risk === "HIGH" ? "bg-danger" : d.risk === "MED" ? "bg-warning" : "bg-[#10B981]"}`} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Claims by Month */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl">Claims Activity</h3>
                  <div className="relative">
                    <select value={claimsMonth} onChange={(e) => setClaimsMonth(e.target.value)} className="appearance-none bg-white border border-border shadow-sm rounded-full pl-5 pr-10 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer">
                      {Object.keys(claimsByMonth).map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground text-xs">▼</div>
                  </div>
                </div>
                <div className="space-y-4">
                  {(userData?.recent_claims || []).map((c: any, i: number) => (
                     <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-white rounded-[1.5rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col sm:flex-row justify-between sm:items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all">
                       <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                       <div>
                         <div className="flex items-center gap-3 mb-1">
                           <span className="text-sm font-bold bg-muted/50 px-3 py-1 rounded-full">{new Date(c.created_at).toLocaleDateString()}</span>
                           <span className="font-bold text-foreground text-lg">{c.trigger_type}</span>
                         </div>
                         <p className="text-sm text-muted-foreground font-medium ml-1">ID: {c.id}</p>
                       </div>
                       <div className="text-left sm:text-right">
                         <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase mb-2 ${c.status === "PAID" || c.status === "APPROVED" ? "bg-[#10B981]/10 text-[#10B981]" : c.status === "PENDING" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"}`}>
                           {c.status === "PAID" ? "Paid out" : c.status === "APPROVED" ? "Approved" : c.status === "PENDING" ? "Processing" : "Rejected"}
                         </span>
                         {c.status === "PAID" ? (
                           <p className="text-base font-bold text-primary">₹{c.payout_amount || 500} credited ⚡</p>
                         ) : c.status === "PENDING" ? (
                           <p className="text-sm text-muted-foreground font-medium">Auto-verifying dataset...</p>
                         ) : null}
                       </div>
                     </motion.div>
                   ))}
                   {(!userData?.recent_claims || userData.recent_claims.length === 0) && (
                     <div className="bg-white/50 backdrop-blur border border-dashed rounded-[1.5rem] p-10 text-center text-muted-foreground font-medium">
                       No claims activity found for this period.
                     </div>
                   )}
                 </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                {[
                  { label: "Total received", value: `₹${userData?.total_payout_received || 0}`, icon: "💰" },
                  { label: "Coverage limit", value: `₹${userData?.coverage || 0}`, icon: "🛡️" },
                  { label: "Claims sync", value: "Real-time", icon: "🔄" },
                  { label: "Status", value: "Active", icon: "✨" },
                ].map((s) => (
                  <motion.div whileHover={{ y: -3 }} key={s.label} className="bg-white rounded-[1.5rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border-b-4 border-b-transparent hover:border-b-primary transition-all flex flex-col h-full justify-between gap-4">
                    <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-lg">{s.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{s.label}</p>
                      <p className="font-bold text-xl">{s.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
