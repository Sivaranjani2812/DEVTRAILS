import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

const zonesData: Record<string, { rain: string; temp: string; aqi: string; status: string }> = {
  "HSR Layout": { rain: "0mm", temp: "32°C", aqi: "70", status: "CLEAR ☀️" },
  "Koramangala": { rain: "0mm", temp: "31°C", aqi: "65", status: "CLEAR ☀️" },
  "BTM Layout": { rain: "0mm", temp: "33°C", aqi: "68", status: "CLEAR ☀️" },
};

const scenarios = [
  { label: "☀️ Clear Weather", rain: "0mm", temp: "32°C", aqi: "70", status: "CLEAR ☀️", color: "bg-success" },
  { label: "🌦️ Moderate Rain 25mm", rain: "25mm", temp: "27°C", aqi: "75", status: "MODERATE 🌦️", color: "bg-primary" },
  { label: "🌧️ Heavy Rain 65mm", rain: "65mm", temp: "22°C", aqi: "70", status: "DISRUPTION ACTIVE 🔴", color: "bg-accent" },
  { label: "🌊 Flood Alert 120mm", rain: "120mm", temp: "20°C", aqi: "80", status: "DISRUPTION ACTIVE 🔴", color: "bg-danger" },
  { label: "🌡️ Extreme Heat 47°C", rain: "0mm", temp: "47°C", aqi: "90", status: "DISRUPTION ACTIVE 🔴", color: "bg-danger" },
  { label: "😷 Severe Pollution AQI 350", rain: "0mm", temp: "30°C", aqi: "350", status: "DISRUPTION ACTIVE 🔴", color: "bg-purple-600" },
  { label: "🚫 Zone Shutdown / Bandh", rain: "0mm", temp: "30°C", aqi: "70", status: "DISRUPTION ACTIVE 🔴", color: "bg-danger" },
  { label: "📱 Platform Outage — Zepto", rain: "0mm", temp: "30°C", aqi: "70", status: "DISRUPTION ACTIVE 🔴", color: "bg-foreground/80" },
];

const workers = ["Arjun K", "Ravi M", "Suresh P", "Priya S", "Meena R"];

const Demo = () => {
  const [selectedZone, setSelectedZone] = useState("HSR Layout");
  const [weather, setWeather] = useState(zonesData["HSR Layout"]);
  const [claims, setClaims] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerScenario = (s: typeof scenarios[0]) => {
    setWeather({ rain: s.rain, temp: s.temp, aqi: s.aqi, status: s.status });
    toast.success(`✅ ${s.label.slice(2)} triggered in ${selectedZone}\nClaims auto-generating in 30 seconds...`);

    if (s.status.includes("DISRUPTION")) {
      setClaims([]);
      let idx = 0;
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (idx >= 3) { clearInterval(timerRef.current!); return; }
        const w = workers[idx];
        setClaims((prev) => [...prev, `Claim created for ${w} — ₹500 ⚡`]);
        idx++;
      }, 500);
    }
  };

  const reset = () => {
    setWeather(zonesData[selectedZone]);
    setClaims([]);
    if (timerRef.current) clearInterval(timerRef.current);
    toast("🔄 All zones reset to clear");
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-foreground text-primary-foreground">
        <Navbar />
        <div className="container max-w-4xl py-8 space-y-6">
          <div>
            <h1 className="font-display text-3xl font-bold">🎬 Demo Control Panel</h1>
            <p className="text-sm opacity-70">Simulate weather events for demo purposes</p>
          </div>

          {/* Zone Selector */}
          <div className="flex gap-2">
            {Object.keys(zonesData).map((z) => (
              <button
                key={z}
                onClick={() => { setSelectedZone(z); setWeather(zonesData[z]); setClaims([]); }}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedZone === z ? "bg-primary text-primary-foreground" : "bg-primary-foreground/10 text-primary-foreground/70 hover:bg-primary-foreground/20"
                }`}
              >
                {z}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Scenarios */}
            <div>
              <h3 className="font-semibold mb-3">Trigger Scenarios</h3>
              <div className="grid grid-cols-2 gap-2">
                {scenarios.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => triggerScenario(s)}
                    className={`${s.color} text-primary-foreground px-4 py-3 rounded-lg text-sm font-semibold text-left hover:opacity-90 transition-opacity`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Weather + Claims */}
            <div className="space-y-6">
              <div className="bg-primary-foreground/10 rounded-xl p-5">
                <h3 className="font-semibold mb-3">Live Weather — {selectedZone}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs opacity-60">Rainfall</p><p className="font-bold text-lg">{weather.rain} 🌧️</p></div>
                  <div><p className="text-xs opacity-60">Temperature</p><p className="font-bold text-lg">{weather.temp}</p></div>
                  <div><p className="text-xs opacity-60">AQI</p><p className="font-bold text-lg">{weather.aqi}</p></div>
                  <div><p className="text-xs opacity-60">Status</p><p className="font-bold text-sm">{weather.status}</p></div>
                </div>
              </div>

              <div className="bg-primary-foreground/10 rounded-xl p-5">
                <h3 className="font-semibold mb-3">Claims Feed</h3>
                {claims.length === 0 && <p className="text-sm opacity-50">Trigger a scenario to see claims...</p>}
                <div className="space-y-2">
                  <AnimatePresence>
                    {claims.map((c, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-success/20 text-success rounded-lg px-3 py-2 text-sm font-medium">
                        {c}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Reset */}
          <button onClick={reset} className="w-full bg-primary-foreground/10 text-primary-foreground py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary-foreground/20 transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset All Zones to Clear
          </button>
        </div>
      </div>
    </PageTransition>
  );
};

export default Demo;
