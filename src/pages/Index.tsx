import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Blocks, Construction, LayoutGrid } from "lucide-react";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="container mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-text1">{t("app.title")}</h1>
          <p className="text-xl text-text3 mt-2">{t("app.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link to="/projects">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{t("menu.projects")}</CardTitle>
                <LayoutGrid className="h-6 w-6 text-text3" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text3">{t("menu.projects.description") || "Жобаларыңызды басқарыңыз және өңдеңіз."}</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/editor">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{t("menu.editor") || "Визуалды Редактор"}</CardTitle>
                <Blocks className="h-6 w-6 text-text3" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text3">{t("menu.editor.description") || "Жаңа бағдарламаны бірден бастаңыз."}</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/constructor">
            <Card className="hover:border-primary transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{t("menu.constructor")}</CardTitle>
                <Construction className="h-6 w-6 text-text3" />
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text3">{t("menu.constructor.description") || "Робот моделін құрастыру."}</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;