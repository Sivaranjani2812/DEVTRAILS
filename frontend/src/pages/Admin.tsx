import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { toast } from "sonner";
import DemoFab from "@/components/DemoFab";
import PageTransition from "@/components/PageTransition";
import { api } from "@/lib/api";

const chartData = [
  { day: "Mon", Revenue: 32000, Payouts: 12000 },
  { day: "Tue", Revenue: 28000, Payouts: 8000 },
  { day: "Wed", Revenue: 35000, Payouts: 22000 },
  { day: "Thu", Revenue: 30000, Payouts: 18000 },
  { day: "Fri", Revenue: 25000, Payouts: 6000 },
  { day: "Sat", Revenue: 38000, Payouts: 28000 },
  { day: "Sun", Revenue: 20000, Payouts: 5000 },
];

const zoneData = [
  { name: "HSR Layout", risk: "HIGH", workers: 23 },
  { name: "Koramangala", risk: "MED", workers: 18 },
  { name: "BTM Layout", risk: "HIGH", workers: 31 },
  { name: "Whitefield", risk: "LOW", workers: 12 },
  { name: "Indiranagar", risk: "MED", workers: 9 },
  { name: "Marathahalli", risk: "LOW", workers: 7 },
];

const recentClaims = [
  { worker: "Arjun K", zone: "HSR Layout", trigger: "Rain", amount: "₹500", status: "Approved", time: "43s" },
  { worker: "Ravi M", zone: "BTM Layout", trigger: "Flood", amount: "₹700", status: "Approved", time: "38s" },
  { worker: "Priya S", zone: "Koramangala", trigger: "Heat", amount: "₹300", status: "Approved", time: "52s" },
  { worker: "Suresh P", zone: "HSR Layout", trigger: "Rain", amount: "₹400", status: "Review", time: "—" },
  { worker: "Meena R", zone: "BTM Layout", trigger: "Outage", amount: "₹300", status: "Rejected", time: "—" },
];

const flagged = [
  { worker: "Vikram S", zone: "Whitefield", trigger: "Rain", amount: "₹500", reason: "GPS mismatch" },
  { worker: "Deepa M", zone: "HSR Layout", trigger: "Outage", amount: "₹300", reason: "Platform was operational" },
  { worker: "Rahul K", zone: "Koramangala", trigger: "Heat", amount: "₹300", reason: "Temperature not confirmed" },
];

const Admin = () => {
  const navigate = useNavigate();
  const [reviewLoading, setReviewLoading] = useState<Record<number, string>>({});

  const handleReview = (idx: number, action: string) => {
    setReviewLoading((p) => ({ ...p, [idx]: action }));
    setTimeout(() => {
      setReviewLoading((p) => { const n = { ...p }; delete n[idx]; return n; });
      toast.success(`Claim ${action}d successfully`);
    }, 1000);
  };

  const handleLogout = () => {
    toast("Logged out");
    navigate("/admin/login");
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-muted">
        {/* Admin-specific header (no worker navbar) */}
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="container flex items-center justify-between h-16">
            <span className="font-display font-bold text-lg text-primary">🛡️ GigShield Admin</span>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </nav>
        <DemoFab />
        <div className="container py-6 max-w-5xl space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl font-bold">Admin Dashboard</h1>
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  try {
                    await api.triggerRain({ location: "HSR Layout", rainfall_mm: 25 });
                    toast.success("Rain triggered! Claims created. 🌧️");
                  } catch (err: any) {
                    toast.error(err.message || "Failed to trigger rain");
                  }
                }}
                className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg hover:opacity-90"
              >
                Trigger Rain (HSR Layout)
              </button>
            </div>
          </div>

          {/* Stats Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Active Workers", value: "2,840", color: "bg-primary" },
              { label: "Active Policies", value: "2,341", color: "bg-success" },
              { label: "Claims This Week", value: "89", color: "bg-accent" },
              { label: "Revenue This Week", value: "₹2,08,000", color: "bg-ring" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-4 card-shadow border border-border">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-display text-xl font-bold mt-1">{s.value}</p>
                <div className={`w-8 h-1 rounded-full mt-2 ${s.color}`} />
              </div>
            ))}
          </div>

          {/* Stats Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Auto Approved", value: "81 (91%)", icon: "✅" },
              { label: "Manual Review", value: "5 (6%)", icon: "⚠️" },
              { label: "Rejected (Fraud)", value: "3 (3%)", icon: "❌" },
              { label: "Avg Payout Time", value: "41 secs", icon: "⚡" },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-xl p-4 card-shadow border border-border">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="font-semibold text-lg mt-1">{s.icon} {s.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-card rounded-xl p-4 card-shadow border border-border">
            <h3 className="font-semibold mb-4">Weekly Revenue vs Payouts</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 88%)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Legend />
                <Bar dataKey="Revenue" fill="hsl(168, 65%, 38%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Payouts" fill="hsl(12, 85%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Live Zones */}
          <div>
            <h3 className="font-semibold mb-3">Live Dark Store Risk Levels</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {zoneData.map((z) => (
                <div key={z.name} className="bg-card rounded-xl p-4 card-shadow border border-border flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{z.name}</p>
                    <p className="text-xs text-muted-foreground">{z.workers} active workers</p>
                  </div>
                  <span className={`text-xs font-bold ${z.risk === "HIGH" ? "text-danger" : z.risk === "MED" ? "text-warning" : "text-success"}`}>
                    {z.risk === "HIGH" ? "🔴" : z.risk === "MED" ? "🟡" : "🟢"} {z.risk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Claims Table */}
          <div className="bg-card rounded-xl card-shadow border border-border overflow-x-auto">
            <h3 className="font-semibold p-4 pb-2">Recent Claims</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2">Worker</th><th className="px-4 py-2">Zone</th><th className="px-4 py-2">Trigger</th>
                <th className="px-4 py-2">Amount</th><th className="px-4 py-2">Status</th><th className="px-4 py-2">Time</th>
              </tr></thead>
              <tbody>
                {recentClaims.map((c, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{c.worker}</td>
                    <td className="px-4 py-3">{c.zone}</td>
                    <td className="px-4 py-3">{c.trigger}</td>
                    <td className="px-4 py-3">{c.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        c.status === "Approved" ? "bg-success/10 text-success" :
                        c.status === "Review" ? "bg-warning/10 text-warning" :
                        "bg-danger/10 text-danger"
                      }`}>{c.status}</span>
                    </td>
                    <td className="px-4 py-3">{c.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fraud Flagged — Admin approval section */}
          <div>
            <h3 className="font-semibold mb-3">⚠️ Requires Manual Review (5)</h3>
            <div className="space-y-3">
              {flagged.map((f, i) => (
                <div key={i} className="bg-card rounded-xl p-4 card-shadow border border-warning/30 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="font-semibold text-sm">{f.worker} — {f.zone}</p>
                    <p className="text-xs text-muted-foreground">{f.trigger} • {f.amount} • {f.reason}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(i, "approve")} disabled={!!reviewLoading[i]} className="bg-success text-success-foreground text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50">
                      {reviewLoading[i] === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Approve"}
                    </button>
                    <button onClick={() => handleReview(i, "reject")} disabled={!!reviewLoading[i]} className="bg-danger text-danger-foreground text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50">
                      {reviewLoading[i] === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Reject"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Admin;
