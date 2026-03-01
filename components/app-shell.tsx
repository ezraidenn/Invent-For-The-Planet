"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Map,
  Package,
  Layers,
  Wallet,
  User,
  Bell,
  Leaf,
  DollarSign,
  ClipboardList,
  BarChart3,
  Sun,
  Moon,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import { DebugSwitcher } from "@/components/debug-switcher";
import { PageTransition } from "@/components/motion";
import type { UserRole } from "@/types";

interface AppShellProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    image?: string;
  };
  children: React.ReactNode;
}

const ROLE_COLORS: Record<UserRole, string> = {
  business: "from-blue-500 to-indigo-500",
  household: "from-emerald-500 to-teal-500",
  recycler: "from-amber-500 to-orange-500",
  center: "from-violet-500 to-purple-500",
};

const ROLE_BG: Record<UserRole, string> = {
  business: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
  household: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
  recycler: "bg-amber-500/10 text-amber-500 dark:text-amber-400",
  center: "bg-violet-500/10 text-violet-500 dark:text-violet-400",
};

const ROLE_LABELS: Record<UserRole, string> = {
  business: "Business",
  household: "Household",
  recycler: "Recycler",
  center: "Center",
};

const navItems: Record<
  UserRole,
  { href: string; label: string; icon: React.ElementType }[]
> = {
  business: [
    { href: "/map", label: "Map", icon: Map },
    { href: "/listings", label: "Listings", icon: Package },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/notifications", label: "Alerts", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ],
  household: [
    { href: "/map", label: "Map", icon: Map },
    { href: "/listings", label: "Listings", icon: Package },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/notifications", label: "Alerts", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ],
  recycler: [
    { href: "/map", label: "Map", icon: Map },
    { href: "/batches", label: "Batches", icon: Layers },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/notifications", label: "Alerts", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ],
  center: [
    { href: "/map", label: "Map", icon: Map },
    { href: "/dashboard", label: "Dashboard", icon: ClipboardList },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/prices", label: "Prices", icon: DollarSign },
    { href: "/notifications", label: "Alerts", icon: Bell },
    { href: "/profile", label: "Profile", icon: User },
  ],
};

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const items = navItems[user.role] || navItems.household;
  const unreadCount = useAppStore((s) => s.unreadCount);
  const { theme, setTheme } = useTheme();
  useRealtimeNotifications();

  return (
    <div className="flex overflow-hidden bg-background" style={{ height: 'var(--app-height, 100vh)' }}>
      {/* ──── Desktop Sidebar (lg+) ──── */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[260px] flex-col border-r border-border/50 bg-card/50 backdrop-blur-2xl lg:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border/50 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
            <Leaf className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold tracking-tight">ReciMap</span>
            <p className="text-[10px] leading-none text-muted-foreground">Circular Materials</p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-5">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl bg-primary/[0.08] shadow-sm ring-1 ring-primary/10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <item.icon className={cn("h-[18px] w-[18px]", isActive && "text-primary")} />
                  <span>{item.label}</span>
                </div>
                {item.href === "/notifications" && unreadCount > 0 && (
                  <span className="relative z-10 ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {isActive && (
                  <ChevronRight className="relative z-10 ml-auto h-4 w-4 text-primary/40" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User card + theme toggle */}
        <div className="border-t border-border/50 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-white text-xs font-bold shadow-sm", ROLE_COLORS[user.role])}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <span className={cn("inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-semibold", ROLE_BG[user.role])}>
                {ROLE_LABELS[user.role]}
              </span>
            </div>
            <DebugSwitcher />
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
        </div>
      </aside>

      {/* ──── Main area ──── */}
      <div className="flex flex-1 flex-col lg:pl-[260px]" style={{ height: 'var(--app-height, 100vh)' }}>
        {/* Mobile top bar */}
        <header className="shrink-0 z-40 flex items-center justify-between border-b border-border/50 bg-background px-4 lg:hidden" style={{ minHeight: '3.5rem', paddingTop: 'var(--sai-top, 0px)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
              <Leaf className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">ReciMap</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <DebugSwitcher />
          </div>
        </header>

        {/* Desktop breadcrumb bar */}
        <header className="shrink-0 z-40 hidden h-12 items-center justify-between border-b border-border/50 bg-background px-6 lg:flex">
          <h1 className="text-sm font-medium capitalize text-muted-foreground">
            {pathname.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Dashboard"}
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className={cn("h-2 w-2 rounded-full bg-gradient-to-r", ROLE_COLORS[user.role])} />
            <span>{user.name}</span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <PageTransition>{children}</PageTransition>
        </main>

        {/* ──── Mobile bottom nav ──── */}
        <nav className="shrink-0 z-50 border-t border-border/50 bg-background backdrop-blur-2xl lg:hidden" style={{ paddingBottom: 'var(--sai-bottom, 0px)' }}>
          <div className="flex items-center justify-around">
            {items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-tab"
                      className="absolute -top-px left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full bg-primary shadow-sm shadow-primary/50"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <div className="relative">
                    <item.icon className={cn("h-5 w-5", isActive && "text-primary")} />
                    {item.href === "/notifications" && unreadCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
