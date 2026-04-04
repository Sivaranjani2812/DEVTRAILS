import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import Landing from "./pages/Landing";
import Login from "./pages/Login/index";
import Onboarding from "./pages/Onboarding/index";
import Dashboard from "./pages/Dashboard/index";
import Policy from "./pages/Policy/index";
import PremiumCalculator from "./pages/PremiumCalculator/index";
import Claims from "./pages/Claims/index";
import AdminDemo from "./pages/AdminDemo/index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { WorkerProvider } from "./context/WorkerContext";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <WorkerProvider>
        <TooltipProvider>
          <Toaster position="bottom-right" toastOptions={{
            success: { duration: 4000, style: { background: '#059669', color: 'white' } },
            error: { duration: 6000, style: { background: '#DC2626', color: 'white' } },
          }} />
          <BrowserRouter>
            <Navbar />
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/policy" element={<Policy />} />
                <Route path="/premium" element={<PremiumCalculator />} />
                <Route path="/claims" element={<Claims />} />
                <Route path="/admin" element={<AdminDemo />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </WorkerProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
