"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Bell,
  Loader2,
  CheckCheck,
  Package,
  DollarSign,
  Truck,
  AlertCircle,
  Info,
  Gift,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const typeConfig: Record<string, { icon: React.ElementType; gradient: string; bg: string }> = {
  listing: { icon: Package, gradient: "from-blue-500 to-indigo-500", bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  price: { icon: DollarSign, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  batch: { icon: Truck, gradient: "from-teal-500 to-cyan-500", bg: "bg-teal-500/10 text-teal-600 dark:text-teal-400" },
  alert: { icon: AlertCircle, gradient: "from-red-500 to-rose-500", bg: "bg-red-500/10 text-red-600 dark:text-red-400" },
  reward: { icon: Gift, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  system: { icon: Info, gradient: "from-gray-500 to-slate-500", bg: "bg-gray-500/10 text-gray-600 dark:text-gray-400" },
};

const defaultConfig = { icon: Sparkles, gradient: "from-violet-500 to-purple-500", bg: "bg-violet-500/10 text-violet-600 dark:text-violet-400" };

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
  });

  const markOneRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const unreadCount =
    notifications?.filter((n: any) => !n.isRead).length || 0;

  return (
    <div className="container max-w-3xl space-y-6 py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold lg:text-3xl">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center py-20 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <Bell className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h3 className="mt-4 font-display text-lg font-semibold">No notifications</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            You&apos;ll be notified about pickups, deliveries, price changes, and redeemed rewards
          </p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif: any, i: number) => {
            const config = typeConfig[notif.type] || defaultConfig;
            const Icon = config.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md",
                    !notif.isRead && "border-primary/20 bg-primary/[0.03]"
                  )}
                  onClick={() => {
                    if (!notif.isRead) markOneRead.mutate(notif.id);
                  }}
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        !notif.isRead
                          ? `bg-gradient-to-br ${config.gradient} text-white shadow-sm`
                          : config.bg
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p
                        className={cn(
                          "text-sm",
                          !notif.isRead ? "font-semibold" : "font-medium text-muted-foreground"
                        )}
                      >
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notif.body}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground/70">
                        {timeAgo(notif.createdAt)}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
