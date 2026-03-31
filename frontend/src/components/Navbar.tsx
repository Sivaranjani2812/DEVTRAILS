import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Shield, Menu, X, User as UserIcon, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWorker } from "../context/WorkerContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { policy } = useWorker();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Claims", path: "/claims" },
    { name: "Policies", path: "/subscription" },
  ];

  if (!user) return null; // Only show for logged in users, or adapt as needed.

  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "US";

  return (
    <nav className="h-16 bg-white border-b border-[#E2E8F0] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        
        {/* Left Side: Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#2563EB]" />
          <span className="font-bold text-[18px] text-[#0F172A]">InsureGig</span>
        </Link>
        
        {/* Middle / Right Side: Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 h-full">
          <div className="flex items-center gap-6 h-full">
            {navLinks.map((link) => {
              const isActive = location.pathname.includes(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`h-full flex items-center text-[14px] font-medium transition-colors border-b-2 ${
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
              className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-semibold text-[14px] hover:ring-2 hover:ring-[#DBEAFE] transition-all"
            >
              {initials}
            </button>
            
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#E2E8F0] overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E2E8F0]">
                  <p className="font-semibold text-[#0F172A]">{user.name || "User"}</p>
                  <p className="text-[12px] text-[#64748B]">{user.phone}</p>
                  {policy && policy.status === "ACTIVE" && (
                    <span className="mt-2 status-badge bg-[#D1FAE5] text-[#059669]">
                      {policy.name || "Active"} Plan
                    </span>
                  )}
                </div>
                <div className="py-2">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="px-4 py-2 flex items-center gap-2 text-sm text-[#0F172A] hover:bg-[#F8FAFC]"
                  >
                    <UserIcon className="w-4 h-4" /> Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-[#DC2626] hover:bg-[#FEE2E2]"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-[#0F172A] p-2"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => setMobileMenuOpen(false)} 
          />
          <div className="relative w-64 bg-white h-full shadow-xl flex flex-col pt-16 px-4">
            <button
              className="absolute top-4 right-4 text-[#0F172A]"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col gap-4">
              <div className="pb-4 border-b border-[#E2E8F0] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-semibold">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-[#0F172A]">{user.name}</p>
                  {policy && policy.status === "ACTIVE" && (
                    <span className="text-[12px] font-medium text-[#059669]">Active Plan</span>
                  )}
                </div>
              </div>

              {navLinks.map((link) => {
                const isActive = location.pathname.includes(link.path);
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block py-3 px-4 rounded-lg font-medium transition-colors ${
                      isActive ? "bg-[#DBEAFE] text-[#2563EB]" : "text-[#64748B]"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
              
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-3 px-4 rounded-lg font-medium text-[#64748B]"
              >
                Profile
              </Link>
              
              <button
                onClick={logout}
                className="block w-full text-left py-3 px-4 rounded-lg font-medium text-[#DC2626]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
