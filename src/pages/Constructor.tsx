import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useWeDo } from "@/hooks/useWeDo";
import { Boxes, Save, FolderOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegoConstructor3D, LegoPart } from "@/components/LegoConstructor3D";
import { PartsPalette } from "@/components/PartsPalette";
import { BlocklyWorkspace } from "@/components/BlocklyWorkspace";
import { toast } from "sonner";

const STORAGE_KEY = "lego_robot_model";

// Default robot model (simple car)
const defaultModel: LegoPart[] = [
  { id: "hub1", type: "hub", position: [0, 0, 0], rotation: [0, 0, 0], color: "#90CAF9" },
  { id: "motor1", type: "motor", position: [-1.5, 0, 0], rotation: [0, 0, 0], color: "#4CAF50" },
  { id: "axle1", type: "axle", position: [-2.5, 0, 0.8], rotation: [0, 0, Math.PI / 2], color: "#666" },
  { id: "wheel1", type: "wheel", position: [-2.5, 0, 1.5], rotation: [Math.PI / 2, 0, 0], color: "#2196F3" },
  { id: "wheel2", type: "wheel", position: [-2.5, 0, 0.1], rotation: [Math.PI / 2, 0, 0], color: "#2196F3" },
  { id: "brick1", type: "brick", position: [1.5, 0, 0], rotation: [0, 0, 0], color: "#F44336", size: [2, 1, 2] },
];

const Constructor = () => {
  const { t } = useLanguage();
  const wedo = useWeDo();
  const [parts, setParts] = useState<LegoPart[]>(defaultModel);
  const [motorSpeed, setMotorSpeed] = useState(0);
  const [ledColor, setLedColor] = useState("#000");
  const [showBlockly, setShowBlockly] = useState(true);

  // Load model from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const loadedParts = JSON.parse(saved);
        setParts(loadedParts);
        toast.success(t("constructor.loaded") || "Model loaded");
      } catch (e) {
        console.error("Failed to load model:", e);
      }
    }
  }, [t]);

  const handleAddPart = (type: LegoPart["type"]) => {
    const newPart: LegoPart = {
      id: `${type}_${Date.now()}`,
      type,
      position: [Math.random() * 4 - 2, 0, Math.random() * 4 - 2],
      rotation: [0, 0, 0],
      color: getDefaultColor(type),
      size: type === "brick" ? [1.5, 1, 1.5] : undefined,
    };
    setParts([...parts, newPart]);
    toast.success(`${type} added`);
  };

  const getDefaultColor = (type: LegoPart["type"]) => {
    switch (type) {
      case "brick": return "#F44336";
      case "motor": return "#4CAF50";
      case "wheel": return "#2196F3";
      case "hub": return "#90CAF9";
      case "axle": return "#666";
      default: return "#999";
    }
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parts));
    toast.success(t("constructor.saved") || "Model saved!");
  };

  const handleLoad = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const loadedParts = JSON.parse(saved);
        setParts(loadedParts);
        toast.success(t("constructor.loaded") || "Model loaded!");
      } catch (e) {
        toast.error("Failed to load model");
      }
    } else {
      toast.info("No saved model found");
    }
  };

  const handleClear = () => {
    if (confirm(t("constructor.confirmClear") || "Clear all parts?")) {
      setParts([]);
      toast.success("Scene cleared");
    }
  };

  const handleReset = () => {
    setParts(defaultModel);
    toast.success("Reset to default model");
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="container mx-auto max-w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Boxes className="w-8 h-8 text-text2" />
            <h1 className="text-2xl font-semibold text-text1">{t("menu.constructor")}</h1>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              {t("control.save") || "Save"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleLoad}>
              <FolderOpen className="w-4 h-4 mr-2" />
              {t("control.load") || "Load"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button
              variant={showBlockly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowBlockly(!showBlockly)}
            >
              {showBlockly ? "Hide" : "Show"} Blockly
            </Button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-12 gap-4 h-[calc(100vh-180px)]">
          {/* Left: Parts Palette */}
          <div className="col-span-2">
            <PartsPalette onAddPart={handleAddPart} />
          </div>

          {/* Middle: 3D Scene */}
          <div className={`${showBlockly ? 'col-span-5' : 'col-span-10'} flex flex-col gap-2`}>
            <div className="flex-1">
              <LegoConstructor3D
                parts={parts}
                motorSpeed={motorSpeed}
                ledColor={ledColor}
                onPartsChange={setParts}
              />
            </div>
            <div className="bg-surface1 border border-border1 rounded-lg p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text3">Parts: {parts.length}</span>
                <span className="text-text3">Motor: {motorSpeed !== 0 ? 'Running' : 'Stopped'}</span>
                <span className="text-text3">LED: <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: ledColor }} /></span>
              </div>
            </div>
          </div>

          {/* Right: Blockly Workspace */}
          {showBlockly && (
            <div className="col-span-5">
              <div className="h-full bg-surface1 border border-border1 rounded-lg p-4">
                <BlocklyWorkspace
                  wedo={wedo}
                  on3DMotorChange={setMotorSpeed}
                  on3DLedChange={setLedColor}
                />
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-4 p-4 bg-surface1 border border-border1 rounded-lg">
          <h3 className="font-semibold text-text1 mb-2">How to use:</h3>
          <ul className="text-sm text-text3 space-y-1">
            <li>1. Click parts on the left to add them to the 3D scene</li>
            <li>2. Use your mouse to rotate (drag) and zoom (scroll) the view</li>
            <li>3. Create your program with Blockly blocks on the right</li>
            <li>4. Click "Run" (▶) in Blockly to see your robot come to life!</li>
            <li>5. Save your robot model for later use</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Constructor;
