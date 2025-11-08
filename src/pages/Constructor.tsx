import { useLanguage } from "@/contexts/LanguageContext";
import { Boxes } from "lucide-react";

const Constructor = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="container mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Boxes className="w-8 h-8 text-text2" />
          <h1 className="text-2xl font-semibold text-text1">{t("menu.constructor")}</h1>
        </div>
        <div className="bg-surface1 border border-dashed border-border1 rounded-lg p-12 text-center">
          <p className="text-text3 text-lg">Coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default Constructor;
