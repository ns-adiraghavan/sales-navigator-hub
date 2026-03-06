import React from "react";
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarNavLinkProps extends NavLinkProps {
  icon?: React.ElementType;
  label: string;
  collapsed?: boolean;
}

export const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({
  to,
  icon: Icon,
  label,
  collapsed,
  className,
  ...props
}) => {
  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
          collapsed && "justify-center px-2",
          className as string
        )
      }
      {...props}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
          )}
          {Icon && (
            <Icon
              size={18}
              className={cn(
                "shrink-0 transition-colors",
                isActive ? "text-primary" : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
              )}
            />
          )}
          {!collapsed && <span className="truncate">{label}</span>}
        </>
      )}
    </RouterNavLink>
  );
};
