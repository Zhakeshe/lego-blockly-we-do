import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";

export const LanguageSwitcher = () => {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: "kk" as const, label: "ҚАЗ" },
    { code: "ru" as const, label: "РУС" },
    { code: "en" as const, label: "ENG" },
  ];

  return (
    <div className="flex gap-1">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          variant={language === lang.code ? "default" : "outline"}
          size="sm"
          className="text-xs font-mono px-2 py-1 h-7"
        >
          {lang.label}
        </Button>
      ))}
    </div>
  );
};
