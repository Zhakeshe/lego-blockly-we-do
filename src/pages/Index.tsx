import { useState, useEffect } from "react";
import { BlocklyWorkspace } from "@/components/BlocklyWorkspace";
import { ControlPanel } from "@/components/ControlPanel";
import { TelemetryPanel } from "@/components/TelemetryPanel";
import { ConsoleLog } from "@/components/ConsoleLog";
import { useWeDo } from "@/hooks/useWeDo";
import { Cpu } from "lucide-react";

const Index = () => {
  const wedo = useWeDo();
  const [logs, setLogs] = useState<Array<{ timestamp: Date; message: string; type: "info" | "error" | "success" | "command" }>>([]);

  useEffect(() => {
    wedo.setLogCallback((message: string, type: "info" | "error" | "success" | "command") => {
      setLogs((prev) => [...prev, { timestamp: new Date(), message, type }]);
    });
  }, [wedo]);

  return (
    <div className="relative min-h-screen bg-bg">
      <div className="site-content relative z-10">
        {/* Header */}
        <header className="border-b border-border1 bg-surface1/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(var(--grad-hero-from))] to-[hsl(var(--grad-hero-to))] flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-bg" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-text1">LEGO WeDo 2.0</h1>
                  <p className="text-xs font-mono text-text4">Visual Programming Platform</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono px-3 py-1.5 rounded-full border ${
                  wedo.status === "Connected" 
                    ? "bg-success/10 border-success/30 text-success" 
                    : wedo.status === "Connecting"
                    ? "bg-warning/10 border-warning/30 text-warning animate-pulse-glow"
                    : "bg-border2 border-border1 text-text4"
                }`}>
                  {wedo.status}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-[1fr,400px] gap-6 h-[calc(100vh-140px)]">
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
    </div>
  );
};

export default Index;
