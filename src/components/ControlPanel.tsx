import { Bluetooth, BluetoothOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeDoHook } from "@/hooks/useWeDo";
import { toast } from "sonner";

interface ControlPanelProps {
  wedo: WeDoHook;
}

export const ControlPanel = ({ wedo }: ControlPanelProps) => {
  const handleConnect = async () => {
    try {
      await wedo.connect();
      toast.success("Connected to WeDo 2.0");
    } catch (error) {
      toast.error(`Connection failed: ${error}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await wedo.disconnect();
      toast.info("Disconnected from WeDo 2.0");
    } catch (error) {
      toast.error(`Disconnect failed: ${error}`);
    }
  };

  return (
    <div className="bg-surface1 border border-dashed border-border1 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text1 mb-4">Device Control</h3>
      
      <div className="space-y-3">
        {wedo.status === "Disconnected" ? (
          <Button
            onClick={handleConnect}
            className="w-full bg-info hover:bg-info/80 text-white"
          >
            <Bluetooth className="w-4 h-4 mr-2" />
            Connect WeDo
          </Button>
        ) : (
          <Button
            onClick={handleDisconnect}
            variant="outline"
            className="w-full border-border2 hover:bg-surface2"
          >
            <BluetoothOff className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        )}

        <div className="pt-4 border-t border-border2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text3 font-mono">Status:</span>
            <span className={`font-mono font-medium ${
              wedo.status === "Connected" ? "text-success" : 
              wedo.status === "Connecting" ? "text-warning" : 
              "text-text4"
            }`}>
              {wedo.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
