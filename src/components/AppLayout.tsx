import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-bg">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col w-full">
          <header className="h-12 flex items-center border-b border-border1 bg-surface1/80 backdrop-blur-sm sticky top-0 z-50">
            <SidebarTrigger className="ml-2" />
          </header>
          
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
