import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Claims", path: "/claims" },
    { name: "Policy Plan", path: "/policy" },
    { name: "Premium Calc", path: "/premium" },
  ];

  if (!user) return null;

  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "US";

  return (
    <nav className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <Shield className="w-7 h-7 text-[#2563EB] fill-[#2563EB]/10" />
          <span className="font-black text-[20px] text-[#0F172A] tracking-tighter">InsureGig</span>
        </Link>
        
        {/* Middle / Right Side: Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 h-full">
          <div className="flex items-center gap-6 h-full">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`h-full flex items-center text-[11px] font-black uppercase tracking-widest transition-all border-b-2 ${
                    isActive ? "text-[#2563EB] border-[#2563EB]" : "text-[#64748B] border-transparent hover:text-[#0F172A]"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Far Right: Avatar & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-black text-[14px] hover:ring-4 hover:ring-blue-100 transition-all shadow-md shadow-blue-500/20"
            >
              {initials}
            </button>
            
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-[#F1F5F9] overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-5 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                    <p className="font-black text-[#0F172A] text-sm">{user.name || "Worker Account"}</p>
                    <p className="text-[11px] font-bold text-[#64748B] tracking-tight">{user.phone}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={logout}
                      className="w-full text-left px-5 py-3 flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#DC2626] hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-[#0F172A] p-2 hover:bg-[#F8FAFC] rounded-xl transition-colors"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col pt-6 px-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
               <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#2563EB]" />
                  <span className="font-black text-[18px] text-[#0F172A]">InsureGig</span>
               </div>
               <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-[#F8FAFC] rounded-lg">
                  <X className="w-6 h-6 text-[#64748B]" />
               </button>
            </div>

            <div className="flex flex-col gap-2">
              <div className="mb-6 p-4 bg-[#F8FAFC] rounded-2xl border border-[#F1F5F9] flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-black">
                  {initials}
                </div>
                <div>
                  <p className="font-black text-[#0F172A] text-sm">{user.name || "Worker"}</p>
                  <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-tighter">Active Policy</p>
                </div>
              </div>

              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-4 px-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${
                      isActive ? "bg-blue-50 text-[#2563EB]" : "text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <div className="mt-8 pt-8 border-t border-[#F1F5F9]">
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 py-4 px-5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-[#DC2626] hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
