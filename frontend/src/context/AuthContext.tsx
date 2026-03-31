import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

type User = {
  id: string;
  name?: string;
  phone: string;
  role: "worker" | "admin";
  onboarded: boolean;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (phone: string, role?: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("insure_gig_user");
      return saved ? JSON.parse(saved) : null;
    } catch (err) {
      console.error("Failed to parse saved user", err);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem("insure_gig_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
      localStorage.setItem("insure_gig_user", JSON.stringify(res.data));
    } catch (err) {
      console.error("Failed to fetch user", err);
      setUser(null);
      localStorage.removeItem("insure_gig_token");
      localStorage.removeItem("insure_gig_user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = async (phone: string, role = "worker") => {
    try {
      await api.post("/api/auth/send-otp", { phone, role });
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      const res = await api.post("/api/auth/verify-otp", { phone, otp });
      const { access_token, user } = res.data;
      localStorage.setItem("insure_gig_token", access_token);
      localStorage.setItem("insure_gig_user", JSON.stringify(user));
      setUser(user);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("insure_gig_token");
    localStorage.removeItem("insure_gig_user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, verifyOtp, logout, refetchUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
