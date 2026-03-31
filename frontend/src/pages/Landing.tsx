import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Zap, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Landing = () => {
  const navigate = useNavigate();
  const { user, login, verifyOtp } = useAuth();
  
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setLoading(true);
    const success = await login(`+91${phone}`);
    if (success) {
      setOtpSent(true);
      setTimer(60);
      toast.success("OTP sent successfully!");
    } else {
      toast.error("Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }
    setLoading(true);
    const success = await verifyOtp(`+91${phone}`, otp);
    if (success) {
      toast.success("Login successful!");
      // Navigation is handled by the useEffect above when `user` changes
    } else {
      toast.error("Invalid OTP");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* Left Panel */}
      <div className="w-full md:w-[55%] bg-[#0F172A] text-white p-8 md:p-16 lg:p-24 flex flex-col justify-between">
        <div className="flex items-center gap-2 mb-16 md:mb-0">
          <Shield className="w-8 h-8 text-white" />
          <span className="font-bold text-2xl tracking-tight">InsureGig</span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-xl">
          <h1 className="text-[32px] md:text-[40px] font-[800] leading-tight mb-6">
            Your income deserves a safety net.
          </h1>
          <p className="text-[16px] text-[#94A3B8] leading-relaxed mb-10">
            Parametric insurance built for Zepto & Blinkit delivery partners. Get
            paid when disruptions stop you from working.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#2563EB]" />
              </div>
              <span className="text-[16px] font-medium">
                Zero-touch claims — auto-triggered
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#D97706]" />
              </div>
              <span className="text-[16px] font-medium">
                Payouts in under 60 seconds
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#1E293B] flex items-center justify-center">
                <CalendarDays className="w-6 h-6 text-[#059669]" />
              </div>
              <span className="text-[16px] font-medium">
                Weekly coverage from ₹35
              </span>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-0 pt-8 border-t border-[#1E293B]">
          <p className="text-[#94A3B8] text-[14px]">
            <span className="font-semibold text-white">1,200+</span> workers protected ·{" "}
            <span className="font-semibold text-white">₹4.8L</span> paid out · Powered by
            parametric AI
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full md:w-[45%] bg-white flex items-center justify-center p-8 md:p-12 lg:p-24 relative shadow-[-10px_0_30px_rgba(0,0,0,0.05)] border-l border-[#E2E8F0] z-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-[24px] font-[700] text-[#0F172A] mb-2">
              Welcome back
            </h2>
            <div className="flex items-center gap-2">
              <p className="text-[#64748B] text-[15px]">New here?</p>
              <button
                onClick={() => navigate("/onboarding")}
                className="text-[#2563EB] font-medium text-[15px] hover:text-[#1D4ED8]"
              >
                Register →
              </button>
            </div>
          </div>

          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-[#64748B] font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="input-base pl-14"
                    placeholder="Enter 10-digit number"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full shadow-lg shadow-[#2563EB]/20"
                disabled={loading || phone.length < 10}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-[12px] font-[500] text-[#94A3B8] uppercase tracking-wide mb-2">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="input-base text-center tracking-widest text-lg font-medium"
                  placeholder="• • • • • •"
                  disabled={loading}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary w-full shadow-lg shadow-[#2563EB]/20"
                disabled={loading || otp.length !== 6}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-[#64748B] text-[14px]">
                    Resend OTP in 0:{timer.toString().padStart(2, "0")}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-[#2563EB] font-medium text-[14px]"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          <div className="mt-8 text-center pt-8 border-t border-[#E2E8F0]">
            <Link to="/admin/login" className="text-[#94A3B8] text-[14px] hover:text-[#64748B] font-medium">
              I'm an admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
