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

  const userId = localStorage.getItem("gigshield_user_id");
  const userName = localStorage.getItem("gigshield_name") || "Worker";
  const userLocation = localStorage.getItem("gigshield_location") || "HSR Layout";

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
      <div className="min-h-screen bg-muted">
        <Navbar />
        <DemoFab />
        <div className="container max-w-6xl py-8 space-y-6">
          {/* Greeting */}
          <div className="flex items-center justify-between">
            <h1 className="font-display text-2xl font-bold">Hey {userName} 👋</h1>
            <Bell className="w-5 h-5 text-muted-foreground" />
          </div>

          {/* Top row: Coverage + Location + Alert */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="gradient-primary text-primary-foreground rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5" />
                <span className="font-semibold text-lg uppercase">Coverage {userData?.policy_status || "INACTIVE"}</span>
                {userData?.policy_status === "ACTIVE" && <Check className="w-4 h-4" />}
              </div>
              <p className="opacity-80">Plan: {userData?.active_plan?.replace("_", " ") || "No Active Plan"}</p>
              <p className="opacity-80">Coverage: ₹{(userData?.coverage || 0).toLocaleString()} protected</p>
              <p className="text-sm opacity-60 mt-2">Next Billing: {userData?.next_billing_date ? new Date(userData.next_billing_date).toLocaleDateString() : "N/A"}</p>
            </div>

            {/* Current Location */}
            <div className="bg-card rounded-2xl p-5 card-shadow border border-border">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-semibold">Current Location</span>
              </div>
              <p className="text-sm text-muted-foreground mb-1">📍 {userLocation}, Bangalore</p>
              <p className="text-xs text-muted-foreground">Monitoring weather disruptions in your area</p>
              <div className="mt-3 bg-muted rounded-lg h-24 flex items-center justify-center text-xs text-muted-foreground border border-border">
                🗺️ Map view — HSR Layout sector
              </div>
            </div>

            <div className="bg-accent/10 border border-accent/30 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <p className="text-sm">
                <span className="font-semibold">⚠️ Heavy rain expected</span> in HSR Layout at 3pm. Your coverage is ready ✅
              </p>
            </div>
          </div>

          {/* Weather Risk Cards */}
          <div>
            <h2 className="font-semibold text-lg mb-3">Your Dark Stores Today</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {zones.map((z) => (
                <div key={z.name} className="bg-card rounded-xl p-5 card-shadow border border-border">
                  <p className="font-semibold mb-1">{z.name}</p>
                  <span className={`text-xs font-bold ${z.color}`}>
                    {z.risk === "HIGH" ? "🔴" : "🟡"} {z.risk} RISK
                  </span>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>🌧️ Rain: {z.rain}</p>
                    <p>🌡️ Temp: {z.temp}</p>
                    <p>💨 AQI: {z.aqi}</p>
                  </div>
                  <p className="text-sm mt-3 font-medium text-foreground">{z.note}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Middle row: Shift + Forecast */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl p-6 card-shadow border border-border">
              <h3 className="font-semibold text-lg mb-4">Start Your Shift</h3>
              <div className="space-y-2 mb-4">
                {zones.map((z) => (
                  <label key={z.name} className="flex items-center gap-3 cursor-pointer">
                    <input type="radio" name="store" value={z.name} checked={selectedStore === z.name} onChange={(e) => setSelectedStore(e.target.value)} className="accent-primary" />
                    <span className="text-sm">{z.name}</span>
                    <span className={`text-xs font-bold ml-auto ${z.color}`}>
                      {z.risk === "HIGH" ? "🔴" : "🟡"} {z.risk}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {["Zepto", "Blinkit", "Instamart", "Big Basket"].map((p) => (
                  <span key={p} className="bg-primary/10 text-primary text-xs font-medium px-2.5 py-1 rounded-md">✅ {p}</span>
                ))}
              </div>
              {!shiftActive ? (
                <button onClick={startShift} disabled={loadingShift} className="w-full bg-success text-success-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                  {loadingShift ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Start Shift — Activate Coverage"}
                </button>
              ) : (
                <button onClick={endShift} className="w-full bg-success/10 text-success border border-success py-3 rounded-lg font-semibold text-sm">
                  Shift Active 🟢 | End Shift
                </button>
              )}
            </div>

            <div className="bg-card rounded-xl p-6 card-shadow border border-border">
              <h3 className="font-semibold text-lg mb-4">This Week's Risk Forecast</h3>
              <div className="grid grid-cols-7 gap-2">
                {forecast.map((d) => (
                  <div key={d.day} className="rounded-lg p-3 text-center bg-muted border border-border">
                    <p className="text-xs text-muted-foreground">{d.day}</p>
                    <p className="text-xl my-2">{d.icon}</p>
                    <p className={`text-xs font-bold ${d.risk === "HIGH" ? "text-danger" : d.risk === "MED" ? "text-warning" : "text-success"}`}>{d.risk}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Claims by Month */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">Claims History</h3>
                <select value={claimsMonth} onChange={(e) => setClaimsMonth(e.target.value)} className="border border-input rounded-lg px-3 py-1.5 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary">
                  {Object.keys(claimsByMonth).map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="space-y-3">
                {(userData?.recent_claims || []).map((c: any, i: number) => (
                   <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl p-4 card-shadow border border-border">
                     <div className="flex items-center justify-between mb-1">
                       <p className="text-sm font-semibold">{new Date(c.created_at).toLocaleDateString()} — {c.trigger_type}</p>
                       <span className={`text-xs font-bold uppercase ${c.status === "PAID" || c.status === "APPROVED" ? "text-success" : c.status === "PENDING" ? "text-warning" : "text-danger"}`}>
                         {c.status === "PAID" ? "✅ Paid" : c.status === "APPROVED" ? "✅ Approved" : c.status === "PENDING" ? "⏳ Pending" : "❌ Rejected"}
                       </span>
                     </div>
                     <p className="text-xs text-muted-foreground">Claim ID: {c.id}</p>
                     {c.status === "PAID" ? (
                       <p className="text-sm font-semibold text-primary mt-1">₹{c.payout_amount || 500} credited • Instant Payout ⚡</p>
                     ) : c.status === "PENDING" ? (
                       <p className="text-xs text-muted-foreground mt-1">Processing automated fraud check...</p>
                     ) : (
                       <p className="text-xs text-muted-foreground mt-1">Status: {c.status}</p>
                     )}
                   </motion.div>
                 ))}
                 {(!userData?.recent_claims || userData.recent_claims.length === 0) && (
                   <p className="text-sm text-muted-foreground italic">No claims history yet.</p>
                 )}
               </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {[
                { label: "Total received", value: `₹${userData?.total_payout_received || 0} 💰` },
                { label: "Claims this month", value: "Real-time sync 🔄" },
                { label: "Income protected", value: `₹${userData?.coverage || 0} 🛡️` },
                { label: "Member since", value: "Verified 📅" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 card-shadow border border-border text-center">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-semibold text-sm mt-1">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Dashboard;
