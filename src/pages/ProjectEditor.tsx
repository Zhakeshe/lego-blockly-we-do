import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { BlocklyWorkspace } from "@/components/BlocklyWorkspace";
import { ControlPanel } from "@/components/ControlPanel";
import { TelemetryPanel } from "@/components/TelemetryPanel";
import { ConsoleLog } from "@/components/ConsoleLog";
import { useWeDo } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ProjectEditor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const wedo = useWeDo();
  const { t } = useLanguage();
  const [logs, setLogs] = useState<Array<{
    timestamp: Date;
    message: string;
    type: "info" | "error" | "success" | "command";
  }>>([]);

  // Load project data and set up logging
  useEffect(() => {
    // Check if a project is loaded, otherwise redirect
    const currentProjectId = localStorage.getItem("current_project_id");
    if (!currentProjectId || currentProjectId !== projectId) {
      // In a real app, you would load the project from a database here
      // For now, we rely on Projects.tsx to set localStorage before navigating
      toast.error(t("error.projectNotFound") || "Жоба табылмады немесе жүктелмеді.");
      navigate("/projects");
      return;
    }

    // Set up logging
    wedo.setLogCallback((message: string, type: "info" | "error" | "success" | "command") => {
      setLogs(prev => [...prev, {
        timestamp: new Date(),
        message,
        type
      }]);
    });
  }, [wedo, projectId, navigate, t]);

  const handleBack = () => {
    navigate("/projects");
  };

  return (
    <div className="relative bg-bg min-h-screen">
      <div className="site-content relative z-10">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-6 h-full">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-text1">{t("menu.editor") || "Визуалды Редактор"}</h1>
                <p className="text-sm text-text3 mt-1">{t("editor.project")}: {projectId}</p>
              </div>
            </div>
            <span className={`text-xs font-mono px-3 py-1.5 rounded-full border ${wedo.status === "Connected" ? "bg-success/10 border-success/30 text-success" : wedo.status === "Connecting" ? "bg-warning/10 border-warning/30 text-warning animate-pulse-glow" : "bg-border2 border-border1 text-text4"}`}>
              {t(`status.${wedo.status.toLowerCase()}`)}
            </span>
          </div>

          {/* Full-screen layout for editor */}
          <div className="grid lg:grid-cols-[1fr,400px] gap-6 h-[calc(100vh-180px)]">
            {/* Left: Blockly Workspace (takes up 1fr) */}
            <div className="flex flex-col gap-4 h-full">
              <BlocklyWorkspace wedo={wedo} />
            </div>

            {/* Right: Control Panel, Telemetry, Console (fixed 400px) */}
            <div className="flex flex-col gap-4 h-full">
              <ControlPanel wedo={wedo} />
              <TelemetryPanel wedo={wedo} />
              <ConsoleLog logs={logs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
