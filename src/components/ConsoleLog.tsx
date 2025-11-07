import { useEffect, useRef } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  timestamp: Date;
  message: string;
  type: "info" | "error" | "success" | "command";
}

interface ConsoleLogProps {
  logs: LogEntry[];
}

export const ConsoleLog = ({ logs }: ConsoleLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-error";
      case "success":
        return "text-success";
      case "command":
        return "text-info";
      default:
        return "text-text3";
    }
  };

  const getLogPrefix = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "✗";
      case "success":
        return "✓";
      case "command":
        return "→";
      default:
        return "•";
    }
  };

  return (
    <div className="bg-surface1 border border-dashed border-border1 rounded-lg p-6 flex flex-col max-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-text3" />
          <h3 className="text-lg font-semibold text-text1">Console</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          disabled={logs.length === 0}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 h-[180px]">
        <div ref={scrollRef} className="space-y-1 font-mono text-xs">
          {logs.length === 0 ? (
            <div className="text-text4 text-center py-8">No logs yet...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex gap-2 py-1">
                <span className="text-text5 flex-shrink-0">
                  {log.timestamp.toLocaleTimeString()}
                </span>
                <span className={`${getLogColor(log.type)} flex-shrink-0`}>
                  {getLogPrefix(log.type)}
                </span>
                <span className={getLogColor(log.type)}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
