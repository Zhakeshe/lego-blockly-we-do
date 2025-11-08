import { useState, useEffect } from "react";
import { BlocklyWorkspace } from "@/components/BlocklyWorkspace";
import { ControlPanel } from "@/components/ControlPanel";
import { TelemetryPanel } from "@/components/TelemetryPanel";
import { ConsoleLog } from "@/components/ConsoleLog";
import { useWeDo } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";
const Index = () => {
  const wedo = useWeDo();
  const { t } = useLanguage();
  const [logs, setLogs] = useState<Array<{
    timestamp: Date;
    message: string;
    type: "info" | "error" | "success" | "command";
  }>>([]);
  useEffect(() => {
    wedo.setLogCallback((message: string, type: "info" | "error" | "success" | "command") => {
      setLogs(prev => [...prev, {
        timestamp: new Date(),
        message,
        type
      }]);
    });
  }, [wedo]);
  return <div className="relative bg-bg">
      <div className="site-content relative z-10">
        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text1">{t("app.title")}</h1>
              <p className="text-sm text-text3 mt-1">{t("app.subtitle")}</p>
            </div>
            <span className={`text-xs font-mono px-3 py-1.5 rounded-full border ${wedo.status === "Connected" ? "bg-success/10 border-success/30 text-success" : wedo.status === "Connecting" ? "bg-warning/10 border-warning/30 text-warning animate-pulse-glow" : "bg-border2 border-border1 text-text4"}`}>
              {t(`status.${wedo.status.toLowerCase()}`)}
            </span>
          </div>

          <div className="grid lg:grid-cols-[1fr,400px] gap-6 h-[calc(100vh-180px)]">
            {/* Left: Blockly Workspace */}
            <div className="flex flex-col gap-4">
              <BlocklyWorkspace wedo={wedo} />
            </div>

            {/* Right: Control Panel */}
            <div className="flex flex-col gap-4">
              <ControlPanel wedo={wedo} />
              <TelemetryPanel wedo={wedo} />
              <ConsoleLog logs={logs} />
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;