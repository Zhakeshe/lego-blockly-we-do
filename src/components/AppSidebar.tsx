import { Brain, FolderOpen, Map, Boxes, Sun, Moon } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
export function AppSidebar() {
  const {
    state
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const {
    t
  } = useLanguage();
  const {
    theme,
    setTheme
  } = useTheme();
  const menuItems = [{
    to: "/",
    label: t("menu.main"),
    icon: Brain
  }, {
    to: "/projects",
    label: t("menu.projects"),
    icon: FolderOpen
  }, {
    to: "/visual",
    label: t("menu.visual"),
    icon: Map
  }, {
    to: "/constructor",
    label: t("menu.constructor"),
    icon: Boxes
  }];
  const isActive = (path: string) => currentPath === path;
  const isCollapsed = state === "collapsed";
  return <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border1">
        <div className="flex items-center gap-2 px-4 py-3">
          {!isCollapsed && <>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(var(--grad-hero-from))] to-[hsl(var(--grad-hero-to))] flex items-center justify-center">
                <span className="text-sm font-bold text-bg">S7</span>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text1">S7 Robotics</h2>
                <p className="text-xs text-text4">{t("app.subtitle")}</p>
              </div>
            </>}
          {isCollapsed && <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-[hsl(var(--grad-hero-from))] to-[hsl(var(--grad-hero-to))] flex items-center justify-center">
              <span className="text-sm font-bold text-bg">W</span>
            </div>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel className="text-text3 px-4">
              {t("menu.main")}
            </SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(item => <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.to} end className="flex items-center gap-3 px-4 py-2.5 text-text2 hover:bg-surface3 hover:text-text1 transition-colors" activeClassName="bg-gradient-to-r from-[hsl(var(--grad-hero-from))]/10 to-[hsl(var(--grad-hero-to))]/10 text-text1 font-medium border-l-2 border-[hsl(var(--grad-hero-from))]">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border1 p-4">
        <div className={`flex ${isCollapsed ? 'flex-col' : 'flex-row'} gap-2`}>
          <Button variant="outline" size={isCollapsed ? "icon" : "sm"} onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="flex-1">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {!isCollapsed && <span className="ml-2">{theme === "dark" ? "Light" : "Dark"}</span>}
          </Button>
          {!isCollapsed && <LanguageSwitcher />}
        </div>
      </SidebarFooter>
    </Sidebar>;
}