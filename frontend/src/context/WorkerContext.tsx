import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";

type WorkerProfile = {
  id: string;
  name: string;
  phone: string;
  city?: string;
  zone?: string;
  platform?: string;
  weeklyPremium?: number;
};

type ActivePolicy = {
  id: string;
  planId: string;
  name: string;
  startDate: string;
  endDate: string;
  validUntil: string;
  status: "ACTIVE" | "INACTIVE";
};

interface WorkerContextType {
  profile: WorkerProfile | null;
  policy: ActivePolicy | null;
  loading: boolean;
  refetchUser: () => Promise<void>;
}

const WorkerContext = createContext<WorkerContextType | undefined>(undefined);

export const WorkerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [policy, setPolicy] = useState<ActivePolicy | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkerData = async () => {
    if (!user || user.role !== "worker") {
      setProfile(null);
      setPolicy(null);
      setLoading(false);
      return;
    }

    try {
      // Parallel requests pattern
      // GET /api/workers/me gives worker profile
      const profRes = await api.get("/api/workers/me");
      setProfile(profRes.data);
      
      try {
        const polRes = await api.get("/api/workers/coverage");
        setPolicy(polRes.data);
      } catch (err) {
        setPolicy(null); // No active coverage maybe
      }
    } catch (err) {
      console.error("Failed to fetch worker profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerData();
  }, [user]);

  return (
    <WorkerContext.Provider value={{ profile, policy, loading, refetchUser: fetchWorkerData }}>
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorker = () => {
  const context = useContext(WorkerContext);
  if (context === undefined) {
    throw new Error("useWorker must be used within a WorkerProvider");
  }
  return context;
};
