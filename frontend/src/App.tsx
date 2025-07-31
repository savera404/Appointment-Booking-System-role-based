
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DataProvider, useData } from "@/contexts/DataContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";
import Index from "./pages/Index";
import PatientsPage from "./pages/PatientsPage";
import DoctorsPage from "./pages/DoctorsPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ChatPage from "./pages/ChatPage";
import VoiceNotePage from "./pages/VoiceNotePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: ('admin' | 'patient')[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Admin Only Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>;
};

// Patient Only Route Component
const PatientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ProtectedRoute allowedRoles={['patient']}>{children}</ProtectedRoute>;
};

const AppContent = () => {
  const { loading } = useData();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (authLoading || loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/patients" element={<AdminRoute><PatientsPage /></AdminRoute>} />
            <Route path="/doctors" element={<AdminRoute><DoctorsPage /></AdminRoute>} />
            <Route path="/availability" element={<AdminRoute><AvailabilityPage /></AdminRoute>} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/chat" element={<PatientRoute><ChatPage /></PatientRoute>} />
            <Route path="/voice-note" element={<PatientRoute><VoiceNotePage /></PatientRoute>} />
            <Route path="/voice-note/:id" element={<PatientRoute><VoiceNotePage /></PatientRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <DataProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
