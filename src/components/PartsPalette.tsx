import { Button } from "@/components/ui/button";
import { Boxes, Cog, Circle, Minus, Square } from "lucide-react";

interface PartsPaletteProps {
  onAddPart: (type: "brick" | "motor" | "wheel" | "axle" | "hub") => void;
}

export const PartsPalette = ({ onAddPart }: PartsPaletteProps) => {
  const parts = [
    {
      type: "hub" as const,
      icon: Square,
      label: { en: "Hub", ru: "Хаб", kk: "Хаб" },
      color: "bg-blue-200 hover:bg-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800",
    },
    {
      type: "motor" as const,
      icon: Cog,
      label: { en: "Motor", ru: "Мотор", kk: "Мотор" },
      color: "bg-green-200 hover:bg-green-300 dark:bg-green-900 dark:hover:bg-green-800",
    },
    {
      type: "wheel" as const,
      icon: Circle,
      label: { en: "Wheel", ru: "Колесо", kk: "Дөңгелек" },
      color: "bg-sky-200 hover:bg-sky-300 dark:bg-sky-900 dark:hover:bg-sky-800",
    },
    {
      type: "axle" as const,
      icon: Minus,
      label: { en: "Axle", ru: "Ось", kk: "Ось" },
      color: "bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600",
    },
    {
      type: "brick" as const,
      icon: Boxes,
      label: { en: "Brick", ru: "Кирпич", kk: "Кірпіш" },
      color: "bg-red-200 hover:bg-red-300 dark:bg-red-900 dark:hover:bg-red-800",
    },
  ];

  return (
    <div className="h-full bg-surface1 border border-border1 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-text1 mb-3">LEGO Parts</h3>
      <div className="space-y-2">
        {parts.map((part) => {
          const Icon = part.icon;
          return (
            <Button
              key={part.type}
              variant="outline"
              className={`w-full justify-start ${part.color} border-border1`}
              onClick={() => onAddPart(part.type)}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span className="text-sm">{part.label.en}</span>
            </Button>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-surface2 rounded text-xs text-text3">
        <p className="font-semibold mb-1">Tip:</p>
        <p>Click parts to add them to the 3D scene</p>
      </div>
    </div>
  );
};
