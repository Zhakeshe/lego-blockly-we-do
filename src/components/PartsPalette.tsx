import { Cube, Cog, Circle, Minus, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { LegoPart } from "./LegoConstructor3D";

interface PartsPaletteProps {
  onAddPart: (type: LegoPart["type"]) => void;
}

const partTemplates = {
  brick: {
    icon: Cube,
    color: "#F44336",
    label: "Brick",
    labelKk: "Кірпіш",
    labelRu: "Кирпич",
  },
  motor: {
    icon: Cog,
    color: "#4CAF50",
    label: "Motor",
    labelKk: "Қозғалтқыш",
    labelRu: "Мотор",
  },
  wheel: {
    icon: Circle,
    color: "#2196F3",
    label: "Wheel",
    labelKk: "Дөңгелек",
    labelRu: "Колесо",
  },
  axle: {
    icon: Minus,
    color: "#666",
    label: "Axle",
    labelKk: "Ось",
    labelRu: "Ось",
  },
  hub: {
    icon: Box,
    color: "#90CAF9",
    label: "WeDo Hub",
    labelKk: "WeDo Хаб",
    labelRu: "WeDo Хаб",
  },
};

export const PartsPalette = ({ onAddPart }: PartsPaletteProps) => {
  const { language, t } = useLanguage();

  const getLabel = (template: typeof partTemplates.brick) => {
    if (language === "kk") return template.labelKk;
    if (language === "ru") return template.labelRu;
    return template.label;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">{t("constructor.parts") || "Parts / Детали"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.entries(partTemplates).map(([type, template]) => {
          const Icon = template.icon;
          return (
            <Button
              key={type}
              variant="outline"
              className="w-full justify-start"
              onClick={() => onAddPart(type as LegoPart["type"])}
            >
              <Icon className="w-4 h-4 mr-2" style={{ color: template.color }} />
              {getLabel(template)}
            </Button>
          );
        })}

        <div className="pt-4 border-t border-border1 mt-4">
          <p className="text-xs text-text3 mb-2">{t("constructor.instructions") || "Click to add parts to the scene"}</p>
          <div className="text-xs text-text4 space-y-1">
            <p>• Drag to rotate view</p>
            <p>• Scroll to zoom</p>
            <p>• Click part to select</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
