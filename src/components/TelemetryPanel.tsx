import { Move, Gauge, Lightbulb, CircleDot, Disc3 } from "lucide-react";
import { WeDoHook } from "@/hooks/useWeDo";
import { useLanguage } from "@/contexts/LanguageContext";

interface TelemetryPanelProps {
  wedo: WeDoHook;
}

export const TelemetryPanel = ({ wedo }: TelemetryPanelProps) => {
  const { t } = useLanguage();
  const { telemetry } = wedo;

  const metrics = [
    {
      icon: Move,
      label: t("telemetry.motion"),
      value: telemetry.motion.toString(),
      color: "text-info",
    },
    {
      icon: Gauge,
      label: t("telemetry.tilt"),
      value: telemetry.tilt,
      color: "text-accentWarm",
    },
    {
      icon: Lightbulb,
      label: t("telemetry.light"),
      value: `${telemetry.light}%`,
      color: "text-warning",
    },
    {
      icon: CircleDot,
      label: t("telemetry.button"),
      value: telemetry.hubButton ? "Pressed" : "Released",
      color: telemetry.hubButton ? "text-success" : "text-text4",
    },
    {
      icon: Disc3,
      label: t("telemetry.led"),
      value: telemetry.ledColor,
      color: "text-accentWarm2",
    },
  ];

  return (
    <div className="bg-surface1 border border-dashed border-border1 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text1 mb-4">{t("telemetry.title")}</h3>
      
      <div className="space-y-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 bg-surface2 rounded-lg border border-border2"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${metric.color}`} />
                <span className="text-sm text-text3 font-mono">{metric.label}</span>
              </div>
              <span className={`text-sm font-mono font-medium ${metric.color}`}>
                {metric.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
