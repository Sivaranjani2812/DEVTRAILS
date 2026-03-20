import { useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import DemoFab from "@/components/DemoFab";
import PageTransition from "@/components/PageTransition";

const claimsByMonth: Record<string, Array<{
  icon: string; trigger: string; date: string; zone: string;
  status: string; amount: string; method: string; time: string; detail: string; tip?: string;
}>> = {
  "March 2026": [
    { icon: "🌧️", trigger: "Heavy Rain", date: "Mar 15, 2026", zone: "HSR Layout Dark Store", status: "approved", amount: "₹500", method: "UPI", time: "43 seconds", detail: "Rainfall detected: 65mm" },
    { icon: "🌊", trigger: "Flood Alert", date: "Mar 10, 2026", zone: "BTM Layout Dark Store", status: "approved", amount: "₹700", method: "UPI", time: "38 seconds", detail: "Official flood warning issued" },
  ],
  "February 2026": [
    { icon: "🌧️", trigger: "Rain", date: "Feb 28, 2026", zone: "Koramangala Dark Store", status: "rejected", amount: "", method: "", time: "", detail: "Reason: No active shift at time of disruption", tip: "Remember to tap Start Shift before beginning work" },
    { icon: "📱", trigger: "Platform Outage", date: "Feb 20, 2026", zone: "HSR Layout Dark Store", status: "review", amount: "", method: "", time: "", detail: "Expected resolution: 24 hours", tip: "Our team is verifying this claim" },
  ],
};

const allClaims = Object.values(claimsByMonth).flat();
const months = Object.keys(claimsByMonth);
const filters = ["All", "Approved ✅", "Review ⚠️", "Rejected ❌"];

const Claims = () => {
  const [active, setActive] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All Months");

  const baseClaims = selectedMonth === "All Months" ? allClaims : (claimsByMonth[selectedMonth] || []);
  const filtered = baseClaims.filter((c) => {
    if (active === "All") return true;
    if (active.includes("Approved")) return c.status === "approved";
    if (active.includes("Review")) return c.status === "review";
    if (active.includes("Rejected")) return c.status === "rejected";
    return true;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-muted">
        <Navbar />
        <DemoFab />
        <div className="container max-w-4xl py-8 space-y-6">
          <h1 className="font-display text-2xl font-bold">My Claims</h1>

          {/* Summary */}
          <div className="gradient-primary text-primary-foreground rounded-xl p-5 flex items-center justify-around text-center">
            <div><p className="font-bold text-xl">₹1,200</p><p className="text-sm opacity-70">Total received</p></div>
            <div><p className="font-bold text-xl">4</p><p className="text-sm opacity-70">Claims</p></div>
            <div className="flex items-center gap-1"><Zap className="w-4 h-4" /><div><p className="font-bold text-xl">41s</p><p className="text-sm opacity-70">Avg time</p></div></div>
          </div>

          {/* Filters + Month */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button key={f} onClick={() => setActive(f)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  active === f ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:bg-muted"
                }`}>{f}</button>
              ))}
            </div>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border border-input rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary">
              <option>All Months</option>
              {months.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Claims List */}
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.length === 0 && (
              <div className="md:col-span-2 text-center py-12 text-muted-foreground">
                <p className="text-4xl mb-2">📋</p>
                <p className="font-medium">No claims found</p>
                <p className="text-sm">Claims will appear here when triggered</p>
              </div>
            )}
            {filtered.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl p-5 card-shadow border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{c.icon}</span>
                    <div>
                      <p className="font-semibold">{c.trigger}</p>
                      <p className="text-xs text-muted-foreground">{c.date} • {c.zone}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    c.status === "approved" ? "bg-success/10 text-success" :
                    c.status === "review" ? "bg-warning/10 text-warning" :
                    "bg-danger/10 text-danger"
                  }`}>
                    {c.status === "approved" ? "✅ Auto Approved" : c.status === "review" ? "⚠️ Under Review" : "❌ Not Covered"}
                  </span>
                </div>
                {c.status === "approved" && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-primary">{c.amount} credited to {c.method}</p>
                    <p className="text-xs text-muted-foreground">Processed in {c.time} ⚡</p>
                    <p className="text-xs text-muted-foreground">{c.detail}</p>
                  </div>
                )}
                {c.status !== "approved" && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground">{c.detail}</p>
                    {c.tip && <p className="text-xs text-accent font-medium mt-1">💡 {c.tip}</p>}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Claims;
