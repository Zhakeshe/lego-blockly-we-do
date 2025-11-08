import { NavLink } from "@/components/NavLink";
import { useLanguage } from "@/contexts/LanguageContext";
import { Map, Boxes, Brain, FolderOpen } from "lucide-react";

export const NavigationMenu = () => {
  const { t } = useLanguage();

  const menuItems = [
    { to: "/", label: t("menu.main"), icon: Brain },
    { to: "/projects", label: t("menu.projects"), icon: FolderOpen },
    { to: "/visual", label: t("menu.visual"), icon: Map },
    { to: "/constructor", label: t("menu.constructor"), icon: Boxes },
  ];

  return (
    <nav className="flex items-center gap-2">
      {menuItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-full border border-border2 bg-surface2 text-text2 transition-all hover:bg-surface3 hover:border-borderH1"
          activeClassName="bg-gradient-to-br from-[hsl(var(--grad-hero-from))] to-[hsl(var(--grad-hero-to))] text-bg border-transparent font-semibold"
        >
          <item.icon className="w-3.5 h-3.5" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};
