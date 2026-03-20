import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CloudLightning, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import DemoFab from "@/components/DemoFab";

const slides = [
  {
    title: "Shiftsafe",
    subtitle: "Welcome to the future of income protection",
    desc: "Smart parametric insurance built exclusively for delivery partners.",
    icon: <Shield className="w-40 h-40 text-primary drop-shadow-xl" />,
    bg: "bg-accent/10"
  },
  {
    title: "Weather the Storm",
    subtitle: "24/7 Zone Monitoring",
    desc: "We automatically track rain, floods, and gridlocks in your delivery zones.",
    icon: <CloudLightning className="w-40 h-40 text-accent drop-shadow-xl" />,
    bg: "bg-primary/5"
  },
  {
    title: "Instant Payouts",
    subtitle: "Zero Paperwork",
    desc: "No claims to file. When a disruption hits, money reaches your UPI in 60 seconds flat.",
    icon: <Zap className="w-40 h-40 text-warning drop-shadow-xl" />,
    bg: "bg-warning/10"
  },
  {
    title: "Ready to Ride?",
    subtitle: "Protect your income today",
    desc: "Sign up in under 2 minutes and take control of your financial security.",
    icon: <CheckCircle2 className="w-40 h-40 text-success drop-shadow-xl" />,
    bg: "bg-success/10"
  }
];

const Landing = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate("/login");
    }
  };

  return (
    <PageTransition>
      <div className={`min-h-screen transition-colors duration-700 flex flex-col items-center justify-center relative overflow-hidden ${slides[currentSlide].bg}`}>
        <DemoFab />
        
        {/* Background glow effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-white/40 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md px-6 z-10 flex flex-col h-[80vh] justify-between">
          
          {/* Progress Indication */}
          <div className="flex gap-2 justify-center pt-8">
            {slides.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide ? "w-8 bg-primary" : "w-2 bg-primary/20"}`}
              />
            ))}
          </div>

          {/* Slide Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1, y: -20 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <motion.div 
                  initial={{ y: 0 }} 
                  animate={{ y: [-10, 10, -10] }} 
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="mb-10 bg-white p-8 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                >
                  {slides[currentSlide].icon}
                </motion.div>
                
                <h1 className="font-display text-4xl font-bold text-foreground mb-2">
                  {slides[currentSlide].title}
                </h1>
                <h2 className="text-lg font-bold text-primary mb-4">
                  {slides[currentSlide].subtitle}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-[280px]">
                  {slides[currentSlide].desc}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Button */}
          <div className="pb-8 w-full">
            <button 
              onClick={nextSlide}
              className="w-full bg-primary text-white py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              {currentSlide === slides.length - 1 ? "Get Started" : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="mt-6 text-center">
              <Link to="/login" className="text-primary font-bold hover:underline">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Landing;
