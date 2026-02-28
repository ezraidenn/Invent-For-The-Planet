"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "motion/react";
import {
  Leaf,
  LogIn,
  Loader2,
  Building2,
  Home,
  Truck,
  Factory,
  MapPin,
  TrendingUp,
  Shield,
  Recycle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const QUICK_USERS = [
  { email: "restaurant@demo.com", name: "Taqueria El Sol", role: "business", icon: Building2, gradient: "from-blue-500 to-indigo-500" },
  { email: "maria@demo.com", name: "Maria Garcia", role: "household", icon: Home, gradient: "from-emerald-500 to-teal-500" },
  { email: "recycler@demo.com", name: "Juan Recolector", role: "recycler", icon: Truck, gradient: "from-amber-500 to-orange-500" },
  { email: "center@demo.com", name: "EcoRecicla Yucatan", role: "center", icon: Factory, gradient: "from-violet-500 to-purple-500" },
];

const SELLING_POINTS = [
  { icon: MapPin, text: "Live interactive map with real-time material pins" },
  { icon: TrendingUp, text: "Compare prices across collection centers" },
  { icon: Recycle, text: "AI-optimized pickup routes save time & fuel" },
  { icon: Shield, text: "Verified impact tracking with EcoPoints" },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [quickLoading, setQuickLoading] = useState<string | null>(null);

  async function quickLogin(userEmail: string) {
    setQuickLoading(userEmail);
    try {
      const result = await signIn("credentials", {
        email: userEmail,
        password: "demo123",
        redirect: false,
      });
      if (result?.error) {
        toast.error("Quick login failed");
      } else {
        toast.success("Welcome!");
        router.push("/map");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setQuickLoading(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        toast.success("Welcome back!");
        router.push("/map");
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* ─── Left: Branding panel (desktop only) ─── */}
      <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 lg:flex lg:flex-col lg:justify-between">
        {/* Decorative elements */}
        <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-white">ReciMap</span>
            </div>

            <h2 className="font-display text-4xl font-bold leading-tight text-white xl:text-5xl">
              The circular economy
              <br />
              <span className="text-emerald-200">starts here.</span>
            </h2>

            <div className="mt-10 space-y-4">
              {SELLING_POINTS.map((point, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
                    <point.icon className="h-4 w-4 text-emerald-100" />
                  </div>
                  <span className="text-sm text-emerald-50/90">{point.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 px-12 pb-8 xl:px-16">
          <p className="text-xs text-emerald-200/60">
            Built for Invent for the Planet Hackathon 2026
          </p>
        </div>
      </div>

      {/* ─── Right: Login form ─── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-8 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold">ReciMap</span>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h1 className="font-display text-2xl font-bold lg:text-3xl">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-xl"
              />
            </div>
            <Button type="submit" className="h-11 w-full gap-2 rounded-xl shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
          </p>

          {/* Quick Login */}
          <div className="mt-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Quick Login (Demo)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {QUICK_USERS.map((user) => {
                const Icon = user.icon;
                const isLoading = quickLoading === user.email;
                return (
                  <motion.button
                    key={user.email}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => quickLogin(user.email)}
                    disabled={!!quickLoading}
                    className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/50 p-3 text-left transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-md disabled:opacity-50"
                  >
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${user.gradient} shadow-sm`}>
                      {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      ) : (
                        <Icon className="h-3.5 w-3.5 text-white" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium">{user.name}</div>
                      <Badge variant="outline" className="mt-0.5 px-1.5 py-0 text-[9px]">
                        {user.role}
                      </Badge>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
