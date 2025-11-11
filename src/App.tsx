import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Projects from "./pages/Projects";
import Visual from "./pages/Visual";
import Constructor from "./pages/Constructor";
import ProjectEditor from "./pages/ProjectEditor";
import NotFound from "./pages/NotFound";

// ЖАҢА: 3D Simulator
import IntegratedSimulator from "./pages/IntegratedSimulator";
import { Robot3DProvider } from "./contexts/Robot3DContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Robot3DProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/editor/:projectId" element={<ProjectEditor />} />
              <Route path="/constructor" element={<Constructor />} />
              <Route path="/visual" element={<IntegratedSimulator />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </TooltipProvider>
    </Robot3DProvider>
  </QueryClientProvider>
);

export default App;
