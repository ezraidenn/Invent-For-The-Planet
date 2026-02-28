"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import {
  User,
  Phone,
  MapPin,
  LogOut,
  Loader2,
  Save,
  Sun,
  Moon,
  Shield,
  Star,
  Leaf,
  Scale,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { toast } from "sonner";
import { getInitials, formatKg } from "@/lib/utils";

const ROLE_LABELS: Record<string, string> = {
  business: "Business",
  household: "Household",
  recycler: "Recycler",
  center: "Center",
};

const ROLE_GRADIENTS: Record<string, string> = {
  business: "from-blue-500 to-indigo-500",
  household: "from-emerald-500 to-teal-500",
  recycler: "from-amber-500 to-orange-500",
  center: "from-violet-500 to-purple-500",
};

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [initialized, setInitialized] = useState(false);

  if (user && !initialized) {
    setName(user.name || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          phone: phone || undefined,
          address: address || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me"] });
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Failed to update profile"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const roleGradient = ROLE_GRADIENTS[user?.role] || "from-emerald-500 to-teal-500";

  return (
    <div className="container max-w-2xl space-y-6 py-6 lg:py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold lg:text-3xl">My Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your information and preferences</p>
      </motion.div>

      {/* User hero card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="overflow-hidden">
          <div className={`h-20 bg-gradient-to-r ${roleGradient} opacity-90`} />
          <CardContent className="-mt-10 flex flex-col items-center gap-3 pb-6 text-center sm:flex-row sm:items-end sm:text-left">
            <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className={`bg-gradient-to-br ${roleGradient} text-xl font-bold text-white`}>
                {getInitials(user?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2">
              <h2 className="font-display text-xl font-bold">{user?.name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge className={`bg-gradient-to-r ${roleGradient} text-white`}>
                  {ROLE_LABELS[user?.role] || user?.role}
                </Badge>
                {user?.isVerified && (
                  <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    <Shield className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats cards */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Rating", value: user?.rating > 0 ? user.rating.toFixed(1) : "—", sub: user?.totalRatings > 0 ? `${user.totalRatings} ratings` : "no ratings", icon: Star, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-500/10" },
            { label: "EcoPoints", value: (user?.ecoPoints || 0).toLocaleString(), sub: `Level: ${user?.level || "bronze"}`, icon: Leaf, gradient: "from-emerald-500 to-teal-500", bg: "bg-emerald-500/10" },
            { label: "Recycled", value: formatKg(user?.totalKg || 0), sub: "total accumulated", icon: Scale, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-500/10" },
          ].map((stat) => (
            <Card key={stat.label} className="text-center">
              <CardContent className="p-4">
                <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} shadow-sm`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
                <p className="font-display text-lg font-bold">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                <p className="text-[10px] text-muted-foreground/70">{stat.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Edit form */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Award className="h-5 w-5 text-primary" />
              Edit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Name
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                Phone
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+52 999 123 4567"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-xs font-medium">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                Address
              </Label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Your address"
              />
            </div>
            <Button
              className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:from-emerald-600 hover:to-teal-600"
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme toggle */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                  {theme === "dark" ? (
                    <Moon className="h-4 w-4 text-violet-500" />
                  ) : (
                    <Sun className="h-4 w-4 text-amber-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {theme === "dark" ? "Dark interface active" : "Light interface active"}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sign out */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
        <Button
          variant="outline"
          className="w-full gap-2 border-red-200 text-destructive hover:bg-red-50 hover:text-destructive dark:border-red-900/50 dark:hover:bg-red-950/30"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
