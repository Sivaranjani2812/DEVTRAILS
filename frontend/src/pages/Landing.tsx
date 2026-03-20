import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Eye, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import DemoFab from "@/components/DemoFab";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

const triggers = [
  { icon: "🌧️", title: "Heavy Rain", desc: "≥20mm rainfall", payout: "₹400–700" },
  { icon: "🌊", title: "Flood Alert", desc: "Official warning", payout: "₹700" },
  { icon: "🌡️", title: "Extreme Heat", desc: "≥45°C", payout: "₹300" },
  { icon: "😷", title: "Severe Pollution", desc: "AQI ≥300", payout: "₹250" },
  { icon: "🚫", title: "Zone Shutdown", desc: "Bandh / curfew", payout: "₹500" },
  { icon: "📱", title: "Platform Outage", desc: "App downtime", payout: "₹300" },
];

const stats = [
  { value: "₹400", label: "avg payout" },
  { value: "< 60s", label: "processing" },
  { value: "6", label: "triggers covered" },
];

const Landing = () => (
  <PageTransition>
    <div className="min-h-screen bg-background">
      <Navbar />
      <DemoFab />

      {/* Hero */}
      <section className="gradient-primary text-primary-foreground">
        <div className="container py-16 md:py-24 text-center">
          <motion.h1 {...fade()} className="font-display text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Rain shouldn't stop<br />your income
          </motion.h1>
          <motion.p {...fade(0.1)} className="text-primary-foreground/80 text-base md:text-lg max-w-lg mx-auto mb-8">
            Automatic income protection for Zepto, Blinkit, Swiggy Instamart & Big Basket delivery workers
          </motion.p>
          <motion.div {...fade(0.2)} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/onboarding"
              className="inline-flex items-center justify-center bg-accent text-accent-foreground font-semibold px-6 py-3 rounded-lg text-base hover:opacity-90 transition-opacity"
            >
              Get Protected Now
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center border-2 border-primary-foreground/30 text-primary-foreground font-semibold px-6 py-3 rounded-lg text-base hover:bg-primary-foreground/10 transition-colors"
            >
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* Platform Logos */}
      <section className="container py-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">Trusted by workers on</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {["Zepto", "Blinkit", "Swiggy Instamart", "Big Basket"].map((p) => (
            <span key={p} className="bg-accent/10 text-accent font-semibold text-sm px-4 py-1.5 rounded-full">
              {p}
            </span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-muted py-12 md:py-16">
        <div className="container">
          <motion.h2 {...fade()} className="font-display text-2xl font-bold text-center mb-10">How It Works</motion.h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: FileText, title: "Sign up in 2 minutes", desc: "Enter your details and select your dark stores" },
              { icon: Eye, title: "We watch your zone 24/7", desc: "Real-time weather & disruption monitoring" },
              { icon: Zap, title: "Rain hits? Money in 60 seconds", desc: "Instant payout to your UPI" },
            ].map((step, i) => (
              <motion.div key={i} {...fade(i * 0.1)} className="bg-card rounded-xl p-6 text-center card-shadow">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="gradient-primary text-primary-foreground py-6">
        <div className="container grid grid-cols-3 gap-4 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-primary-foreground/70">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Triggers */}
      <section className="container py-12 md:py-16">
        <motion.h2 {...fade()} className="font-display text-2xl font-bold text-center mb-2">What We Cover</motion.h2>
        <p className="text-center text-muted-foreground text-sm mb-8">6 parametric triggers, automatic payouts</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
          {triggers.map((t, i) => (
            <motion.div key={i} {...fade(i * 0.05)} className="bg-card border border-border rounded-xl p-4 card-shadow hover:card-shadow-lg transition-shadow">
              <div className="text-2xl mb-2">{t.icon}</div>
              <h3 className="font-semibold text-sm">{t.title}</h3>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
              <p className="text-sm font-bold text-accent mt-2">{t.payout}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section className="bg-muted py-12">
        <div className="container max-w-xl">
          <motion.div {...fade()} className="bg-card rounded-2xl p-6 md:p-8 card-shadow-lg text-center">
            <p className="text-lg italic text-foreground mb-4">
              "Velachery floods every monsoon. I lost ₹8,000 last season. GigShield credited ₹700 to my UPI before I even got home."
            </p>
            <p className="font-semibold text-sm">Arjun K</p>
            <p className="text-xs text-muted-foreground">Zepto delivery partner, Bangalore</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="gradient-primary text-primary-foreground py-8">
        <div className="container text-center">
          <p className="font-display font-bold text-lg mb-1">🛡️ GigShield</p>
          <p className="text-sm text-primary-foreground/70">Protecting gig workers, one trigger at a time.</p>
        </div>
      </footer>
    </div>
  </PageTransition>
);

export default Landing;
