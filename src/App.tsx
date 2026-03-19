import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import LeadsPage from "@/pages/LeadsPage";
import CompaniesPage from "@/pages/CompaniesPage";
import MeetingsPage from "@/pages/MeetingsPage";
import PipelinePage from "@/pages/PipelinePage";
import ChatPage from "@/pages/ChatPage";
import AdminPage from "@/pages/AdminPage";
import PendingActionsPage from "@/pages/PendingActionsPage";
import DevReferencePage from "@/pages/DevReferencePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/actions" element={<PendingActionsPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/companies" element={<CompaniesPage />} />
              <Route path="/meetings" element={<MeetingsPage />} />
              <Route path="/pipeline" element={<PipelinePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/dev-reference" element={<DevReferencePage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
