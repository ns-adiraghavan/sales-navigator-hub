import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import {
  LayoutDashboard, Users, Building2, Calendar, GitBranch, MessageSquare, Shield, Menu, X, ChevronLeft, ChevronRight, Bell, Zap,
} from "lucide-react";
import { SidebarNavLink } from "@/components/SidebarNavLink";
import { useApp } from "@/context/AppContext";
import { useNudges } from "@/hooks/useNudges";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/actions", label: "Pending Actions", icon: Zap },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/companies", label: "Companies", icon: Building2 },
  { to: "/meetings", label: "Meetings", icon: Calendar },
  { to: "/pipeline", label: "Pipeline", icon: GitBranch },
  { to: "/chat", label: "Chat with Data", icon: MessageSquare },
];

const adminNavItems = [
  { to: "/admin", label: "Admin", icon: Shield },
];

const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, setCurrentUser, users } = useApp();
  const nudges = useNudges();
  const nudgeCount = nudges.length;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:relative z-50 flex flex-col h-full bg-sidebar transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-60",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center shrink-0">
                <GitBranch size={14} className="text-white" />
              </div>
              <span className="font-bold text-sidebar-accent-foreground text-sm truncate">SalesOps Pro</span>
            </div>
          )}
          {collapsed && (
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center mx-auto">
              <GitBranch size={14} className="text-white" />
            </div>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <div key={item.to} className="relative">
              <SidebarNavLink
                to={item.to}
                icon={item.icon}
                label={item.label}
                collapsed={collapsed}
                end={item.to === "/"}
              />
              {/* Nudge badge on Pending Actions nav item */}
              {item.to === "/actions" && nudgeCount > 0 && (
                <span
                  className={cn(
                    "absolute top-1.5 flex items-center justify-center rounded-full bg-destructive text-white text-xs font-bold leading-none",
                    collapsed ? "right-1 w-4 h-4 text-[10px]" : "right-3 min-w-[18px] h-[18px] px-1"
                  )}
                >
                  {nudgeCount > 9 ? "9+" : nudgeCount}
                </span>
              )}
            </div>
          ))}

          {(currentUser.role === "admin" || currentUser.role === "management") && (
            <>
              <div className={cn("my-3 border-t border-sidebar-border", collapsed && "mx-2")} />
              {adminNavItems.map((item) => (
                <SidebarNavLink key={item.to} to={item.to} icon={item.icon} label={item.label} collapsed={collapsed} />
              ))}
            </>
          )}
        </nav>

        {/* User profile */}
        <div className="border-t border-sidebar-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn("flex items-center gap-2 w-full rounded-lg p-2 hover:bg-sidebar-accent/60 transition-colors text-left", collapsed && "justify-center")}>
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                    {currentUser.avatar || currentUser.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-sidebar-accent-foreground truncate">{currentUser.name}</p>
                    <p className="text-xs text-sidebar-foreground truncate capitalize">{currentUser.role}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <DropdownMenuSeparator />
              <p className="px-2 py-1 text-xs text-muted-foreground font-medium">Switch user</p>
              {users.map((u) => (
                <DropdownMenuItem key={u.id} onClick={() => setCurrentUser(u)} className="gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">{u.avatar}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{u.name}</span>
                  {u.id === currentUser.id && <Badge variant="outline" className="ml-auto text-xs py-0 h-4">You</Badge>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full items-center justify-center shadow-sm hover:bg-muted transition-colors z-10"
        >
          {collapsed ? <ChevronRight size={12} className="text-muted-foreground" /> : <ChevronLeft size={12} className="text-muted-foreground" />}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-16 flex items-center gap-4 px-4 md:px-6 bg-card border-b border-border shrink-0">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            {/* Bell with nudge badge */}
            <div className="relative">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                <Bell size={16} />
              </Button>
              {nudgeCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-destructive text-white text-[10px] font-bold leading-none pointer-events-none">
                  {nudgeCount > 9 ? "9+" : nudgeCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                  {currentUser.avatar}
                </AvatarFallback>
              </Avatar>
               <div className="hidden sm:block">
                 <p className="text-xs font-semibold leading-tight">{currentUser.name}</p>
                 <Badge
                   variant="outline"
                   className={`text-xs h-4 px-1 capitalize ${
                     currentUser.role === "admin"
                       ? "border-destructive/30 text-destructive bg-destructive/10"
                       : currentUser.role === "management"
                       ? "border-blue-300 text-blue-700 bg-blue-50"
                       : currentUser.role === "sales"
                       ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                       : "border-amber-300 text-amber-700 bg-amber-50"
                   }`}
                 >
                  {{ bd: "Business Dev", sales: "Sales Team", management: "Management", admin: "Admin" }[currentUser.role]}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto flex flex-col min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
