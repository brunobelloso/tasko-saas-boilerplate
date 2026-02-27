"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  UserPlus,
  StickyNote,
  FileSpreadsheet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OrgSwitcher } from "@/components/shared/org-switcher";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/config/site";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];

const orgNav = [
  {
    title: "Notes",
    href: "/dashboard/notes",
    icon: StickyNote,
  },
  {
    title: "Campaigns",
    href: "/dashboard/campaigns",
    icon: FileSpreadsheet,
  },
  {
    title: "Members",
    href: "/dashboard/organization/members",
    icon: Users,
  },
  {
    title: "Invitations",
    href: "/dashboard/organization/invite",
    icon: UserPlus,
  },
  {
    title: "Org Settings",
    href: "/dashboard/organization/settings",
    icon: Building2,
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href);
}

interface DashboardSidebarProps {
  newSubmissionsCount?: number;
}

export function DashboardSidebar({ newSubmissionsCount = 0 }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4 border-b">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-xs font-bold">{siteConfig.name.charAt(0)}</span>
        </div>
        <Link href="/dashboard" className="font-bold text-lg">
          {siteConfig.name}
        </Link>
      </div>

      {/* Org Switcher */}
      <div className="px-3 py-3">
        <OrgSwitcher />
      </div>
      <Separator />

      <ScrollArea className="flex-1 px-3 py-3">
        {/* Organization section */}
        <div>
          <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Organization
          </p>
          <nav className="space-y-0.5">
            {orgNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-sidebar-primary" />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      active ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  />
                  {item.title}
                  {item.title === "Campaigns" && newSubmissionsCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                      {newSubmissionsCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User section */}
        <div className="mt-6">
          <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
            Account
          </p>
          <nav className="space-y-0.5">
            {mainNav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-sidebar-primary" />
                  )}
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      active ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-foreground"
                    )}
                  />
                  {item.title}
                </Link>
              );
            })}
          </nav>
        </div>
      </ScrollArea>
    </div>
  );
}
