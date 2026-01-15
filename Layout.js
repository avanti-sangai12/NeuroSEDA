import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Brain, 
  Activity, 
  Settings, 
  BarChart3, 
  Zap,
  Circle
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Neural Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Activity,
    gradient: "from-cyan-400 to-blue-500"
  },
  {
    title: "Workflows",
    url: createPageUrl("Workflows"),
    icon: Zap,
    gradient: "from-purple-400 to-pink-500"
  },
  {
    title: "Analytics",
    url: createPageUrl("Analytics"),
    icon: BarChart3,
    gradient: "from-green-400 to-emerald-500"
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
    gradient: "from-orange-400 to-red-500"
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <style>
          {`
            :root {
              --sidebar-background: 0 0% 4%;
              --sidebar-foreground: 240 5% 84%;
              --sidebar-primary: 224 71% 4%;
              --sidebar-primary-foreground: 210 20% 98%;
              --sidebar-accent: 216 34% 17%;
              --sidebar-accent-foreground: 210 20% 98%;
              --sidebar-border: 216 34% 17%;
              --sidebar-ring: 216 34% 17%;
            }
            
            .neural-glow {
              box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            }
            
            .pulse-dot {
              animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}
        </style>
        
        <Sidebar className="border-r border-slate-800/50 backdrop-blur-xl">
          <SidebarHeader className="border-b border-slate-800/50 p-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center neural-glow">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full pulse-dot"></div>
              </div>
              <div>
                <h2 className="font-bold text-xl bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  NeuroSEDA
                </h2>
                <p className="text-xs text-slate-400 font-medium">Behavioral Intelligence</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`group hover:bg-slate-800/50 transition-all duration-300 rounded-xl p-3 ${
                          location.pathname === item.url 
                            ? 'bg-slate-800/50 shadow-lg shadow-cyan-500/20' 
                            : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${item.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <item.icon className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium text-slate-200 group-hover:text-white transition-colors">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-8">
              <div className="px-3 py-4 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">System Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Signal Capture</span>
                    <div className="flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                      <span className="text-green-400 font-medium">Active</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">AI Engine</span>
                    <div className="flex items-center gap-1">
                      <Circle className="w-2 h-2 fill-blue-400 text-blue-400" />
                      <span className="text-blue-400 font-medium">Processing</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Workflows</span>
                    <span className="text-slate-300 font-medium">3 Active</span>
                  </div>
                </div>
              </div>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-800 p-2 rounded-lg transition-colors" />
              <h1 className="text-xl font-semibold text-white">NeuroSEDA</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}