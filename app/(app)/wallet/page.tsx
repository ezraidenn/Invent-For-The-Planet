"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import {
  Wallet,
  Leaf,
  Scale,
  TrendingUp,
  Award,
  Loader2,
  ArrowUpRight,
  TreePine,
  Droplets,
  Zap,
  Trash2,
  Gift,
  ShoppingBag,
  Globe,
  Star,
  Check,
  Sparkles,
  CreditCard,
  Heart,
  BadgeCheck,
  Rocket,
  Crown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatKg, formatCO2, formatCurrency } from "@/lib/utils";
import { LEVELS } from "@/lib/constants";

const REWARDS_CATALOG = [
  { id: "oxxo-50", name: "OXXO Card $50", desc: "Redeem at any OXXO nationwide", cost: 500, category: "gift_cards", icon: CreditCard, gradient: "from-red-500 to-orange-500" },
  { id: "oxxo-100", name: "OXXO Card $100", desc: "Digital voucher for $100 MXN", cost: 950, category: "gift_cards", icon: CreditCard, gradient: "from-red-500 to-orange-500" },
  { id: "amazon-100", name: "Amazon Card $100", desc: "Amazon Mexico gift card", cost: 1000, category: "gift_cards", icon: ShoppingBag, gradient: "from-amber-500 to-yellow-500" },
  { id: "amazon-250", name: "Amazon Card $250", desc: "Best savings per point", cost: 2300, category: "gift_cards", icon: ShoppingBag, gradient: "from-amber-500 to-yellow-500" },
  { id: "uber-50", name: "Uber Coupon $50", desc: "Ride or Uber Eats", cost: 500, category: "gift_cards", icon: Rocket, gradient: "from-gray-700 to-gray-900" },
  { id: "coppel-200", name: "Coppel Card $200", desc: "Shop online or in-store", cost: 1800, category: "gift_cards", icon: CreditCard, gradient: "from-blue-500 to-indigo-500" },
  { id: "tree-plant", name: "Plant a Tree", desc: "We plant a tree in your name", cost: 300, category: "impact", icon: TreePine, gradient: "from-emerald-500 to-green-600" },
  { id: "ocean-cleanup", name: "Clean 1kg of Ocean", desc: "Partnership with Ocean Cleanup MX", cost: 750, category: "impact", icon: Globe, gradient: "from-cyan-500 to-blue-500" },
  { id: "school-donation", name: "School Donation", desc: "Recyclable materials for schools", cost: 400, category: "impact", icon: Heart, gradient: "from-pink-500 to-rose-500" },
  { id: "recycler-badge", name: "Eco-Hero Badge", desc: "Exclusive badge on your profile", cost: 200, category: "perks", icon: BadgeCheck, gradient: "from-violet-500 to-purple-500" },
  { id: "premium-month", name: "ReciMap Premium", desc: "1 month of premium features", cost: 1500, category: "perks", icon: Crown, gradient: "from-amber-400 to-amber-600" },
  { id: "priority-pickup", name: "Priority Pickup", desc: "Your next pickup goes first in line", cost: 100, category: "perks", icon: Sparkles, gradient: "from-teal-500 to-emerald-500" },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "gift_cards", label: "Gift Cards" },
  { id: "impact", label: "Impact" },
  { id: "perks", label: "Perks" },
];

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState<"wallet" | "rewards">("wallet");
  const [activeCategory, setActiveCategory] = useState("all");
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user-me"],
    queryFn: async () => {
      const res = await fetch("/api/users/me");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: transactions } = useQuery({
    queryKey: ["my-transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const handleRedeem = async (rewardId: string) => {
    setRedeeming(rewardId);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      if (res.ok) {
        setRedeemed(rewardId);
        queryClient.invalidateQueries({ queryKey: ["user-me"] });
        setTimeout(() => setRedeemed(null), 3000);
      }
    } catch {
      // silently fail
    } finally {
      setRedeeming(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const ecoPoints = user?.ecoPoints || 0;
  const totalKg = user?.totalKg || 0;
  const level = LEVELS.find(
    (l) => ecoPoints >= l.minPoints && ecoPoints <= l.maxPoints
  ) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const progress = nextLevel
    ? ((ecoPoints - level.minPoints) / (nextLevel.minPoints - level.minPoints)) * 100
    : 100;

  const totalEarnings =
    transactions?.reduce((sum: number, tx: any) => sum + (tx.totalAmount || 0), 0) || 0;

  const filteredRewards = activeCategory === "all"
    ? REWARDS_CATALOG
    : REWARDS_CATALOG.filter((r) => r.category === activeCategory);

  const txCount = transactions?.length || 0;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "recently";

  const statCards = [
    { label: "EcoPoints", value: ecoPoints.toLocaleString(), sub: `${level.name} tier`, icon: Leaf, gradient: "from-emerald-500 to-teal-500" },
    { label: "Total Recycled", value: formatKg(totalKg), sub: `across ${txCount} deliveries`, icon: Scale, gradient: "from-blue-500 to-cyan-500" },
    { label: "CO₂ Avoided", value: formatCO2(totalKg), sub: `since ${joinedDate}`, icon: TrendingUp, gradient: "from-violet-500 to-purple-500" },
    { label: "Earnings", value: formatCurrency(totalEarnings), sub: `${txCount} transactions`, icon: Wallet, gradient: "from-amber-500 to-orange-500" },
  ];

  const impactCards = [
    {
      label: "Trees Saved", value: Math.max(1, Math.round(totalKg * 0.017)).toString(), sub: "~17 trees per ton recycled", icon: TreePine,
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/20",
      iconBg: "bg-white dark:bg-emerald-900/60 shadow-sm shadow-emerald-200/50 dark:shadow-none",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      labelColor: "text-gray-600 dark:text-gray-400",
      valueColor: "text-gray-900 dark:text-white",
      subColor: "text-gray-400 dark:text-gray-500",
      border: "border border-emerald-200/60 dark:border-emerald-800/30",
    },
    {
      label: "Water Saved", value: `${Math.round(totalKg * 3.5).toLocaleString()}L`, sub: "~3.5L per kg recycled", icon: Droplets,
      bg: "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/20",
      iconBg: "bg-white dark:bg-blue-900/60 shadow-sm shadow-blue-200/50 dark:shadow-none",
      iconColor: "text-blue-500 dark:text-blue-400",
      labelColor: "text-gray-600 dark:text-gray-400",
      valueColor: "text-gray-900 dark:text-white",
      subColor: "text-gray-400 dark:text-gray-500",
      border: "border border-blue-200/60 dark:border-blue-800/30",
    },
    {
      label: "Energy Saved", value: `${Math.round(totalKg * 2.4).toLocaleString()} kWh`, sub: "~2.4 kWh per kg recycled", icon: Zap,
      bg: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/40 dark:to-yellow-950/20",
      iconBg: "bg-white dark:bg-amber-900/60 shadow-sm shadow-amber-200/50 dark:shadow-none",
      iconColor: "text-amber-500 dark:text-amber-400",
      labelColor: "text-gray-600 dark:text-gray-400",
      valueColor: "text-gray-900 dark:text-white",
      subColor: "text-gray-400 dark:text-gray-500",
      border: "border border-amber-200/60 dark:border-amber-800/30",
    },
    {
      label: "Landfill Avoided", value: formatKg(totalKg), sub: "kept out of landfills", icon: Trash2,
      bg: "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/40 dark:to-purple-950/20",
      iconBg: "bg-white dark:bg-purple-900/60 shadow-sm shadow-purple-200/50 dark:shadow-none",
      iconColor: "text-violet-500 dark:text-violet-400",
      labelColor: "text-gray-600 dark:text-gray-400",
      valueColor: "text-gray-900 dark:text-white",
      subColor: "text-gray-400 dark:text-gray-500",
      border: "border border-violet-200/60 dark:border-violet-800/30",
    },
  ];

  return (
    <div className="container max-w-6xl space-y-6 py-6 lg:py-8">
      {/* Header with tabs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold lg:text-3xl">My Wallet</h1>
            <p className="text-sm text-muted-foreground">
              Your recycling impact, earnings & rewards
            </p>
          </div>
          <div className="flex rounded-lg border bg-muted/50 p-1">
            <button
              onClick={() => setActiveTab("wallet")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "wallet"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Wallet className="h-4 w-4" />
              Wallet
            </button>
            <button
              onClick={() => setActiveTab("rewards")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "rewards"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Gift className="h-4 w-4" />
              Rewards
            </button>
          </div>
        </div>
      </motion.div>

      {/* EcoPoints hero card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent">
          <CardContent className="p-5 lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                  <Leaf className="h-7 w-7 text-white" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">My EcoPoints</p>
                  <p className="font-display text-3xl font-bold text-emerald-600 dark:text-emerald-400 lg:text-4xl">
                    {ecoPoints.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className="bg-gradient-to-r from-primary to-emerald-600 px-3 py-1 font-display text-sm text-white">
                  {level.name}
                </Badge>
                {nextLevel && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Next level</p>
                    <p className="text-sm font-semibold">{nextLevel.name} — {(nextLevel.minPoints - ecoPoints).toLocaleString()} pts</p>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4">
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "wallet" ? (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
              {statCards.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                >
                  <Card className="overflow-hidden border-border/50">
                    <CardContent className="p-4 lg:p-5">
                      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}>
                        <stat.icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                      <p className="truncate font-display text-lg font-bold lg:text-xl">{stat.value}</p>
                      {stat.sub && <p className="mt-0.5 text-[10px] text-muted-foreground/70">{stat.sub}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Two-column layout */}
            <div className="grid gap-6 lg:grid-cols-5">
              <div className="space-y-6 lg:col-span-3">
                {/* Recent transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!transactions || transactions.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <Wallet className="mb-3 h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">No transactions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.slice(0, 10).map((tx: any, i: number) => (
                          <motion.div
                            key={tx.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                                  <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {formatKg(tx.totalKg)} delivered
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {tx.completedAt
                                      ? new Date(tx.completedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
                                      : "Pending"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                {tx.totalAmount > 0 && (
                                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                    +{formatCurrency(tx.totalAmount)}
                                  </p>
                                )}
                                <p className="text-[11px] text-primary">
                                  +{tx.ecoPointsAwarded} pts
                                </p>
                              </div>
                            </div>
                            <Separator className="mt-3" />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right column — Impact */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-5 w-5 text-emerald-500" />
                      Environmental Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                      {impactCards.map((card, i) => (
                        <motion.div
                          key={card.label}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: i * 0.08 }}
                          className={`rounded-xl p-4 ${card.bg} ${card.border}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                              <card.icon className={`h-5 w-5 ${card.iconColor}`} />
                            </div>
                            <div>
                              <p className={`text-[11px] font-medium ${card.labelColor}`}>{card.label}</p>
                              <p className={`font-display text-xl font-bold ${card.valueColor}`}>
                                {card.value}
                              </p>
                            </div>
                          </div>
                          <p className={`mt-2 text-[10px] ${card.subColor}`}>{card.sub}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rewards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* How it works */}
            <Card className="border-dashed">
              <CardContent className="p-4 lg:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    <Star className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">How it works</h3>
                    <p className="text-sm text-muted-foreground">
                      Earn EcoPoints by recycling materials. Every kilogram recycled earns you points based on material type.
                      Redeem your points for gift cards, contribute to the environment, or unlock exclusive perks.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                    activeCategory === cat.id
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/25"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Rewards grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredRewards.map((reward, i) => {
                const canAfford = ecoPoints >= reward.cost;
                const isRedeeming = redeeming === reward.id;
                const justRedeemed = redeemed === reward.id;

                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <Card className={`group relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                      justRedeemed ? "ring-2 ring-emerald-500" : ""
                    }`}>
                      {justRedeemed && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm"
                        >
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg">
                            <Check className="h-7 w-7 text-white" />
                          </div>
                          <p className="mt-3 font-display text-lg font-bold text-emerald-600 dark:text-emerald-400">Redeemed!</p>
                          <p className="text-sm text-muted-foreground">Check your notifications</p>
                        </motion.div>
                      )}
                      <CardContent className="p-4 lg:p-5">
                        <div className="flex items-start justify-between">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${reward.gradient} shadow-md transition-transform group-hover:scale-110`}>
                            <reward.icon className="h-5 w-5 text-white" />
                          </div>
                          <Badge variant="secondary" className="text-xs font-semibold">
                            {reward.cost.toLocaleString()} pts
                          </Badge>
                        </div>
                        <div className="mt-3">
                          <h3 className="font-display text-sm font-bold">{reward.name}</h3>
                          <p className="mt-0.5 text-xs text-muted-foreground">{reward.desc}</p>
                        </div>
                        <Button
                          size="sm"
                          className={`mt-4 w-full ${
                            canAfford
                              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30"
                              : ""
                          }`}
                          variant={canAfford ? "default" : "outline"}
                          disabled={!canAfford || isRedeeming}
                          onClick={() => handleRedeem(reward.id)}
                        >
                          {isRedeeming ? (
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                          ) : canAfford ? (
                            <Gift className="mr-2 h-3 w-3" />
                          ) : null}
                          {isRedeeming ? "Redeeming..." : canAfford ? "Redeem" : `Need ${(reward.cost - ecoPoints).toLocaleString()} more pts`}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
