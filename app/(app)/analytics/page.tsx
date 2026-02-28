"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Activity,
  Brain,
  DollarSign,
  Scale,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MATERIAL_LABELS, MATERIAL_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";

const CHART_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

const TREND_CONFIG = {
  rising: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Rising" },
  falling: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10", label: "Falling" },
  stable: { icon: Minus, color: "text-amber-500", bg: "bg-amber-500/10", label: "Stable" },
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-1 text-[11px] font-medium text-muted-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.color }} />
          <span className="font-semibold">{formatCurrency(entry.value)}/kg</span>
        </div>
      ))}
    </div>
  );
}

function PredictionTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const isForecast = entry?.payload?.isForecast;
  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        {isForecast && <Sparkles className="h-3 w-3 text-violet-400" />}
        <p className="text-[11px] font-medium text-muted-foreground">
          {isForecast ? "Predicted" : "Historical"} &mdash; {label}
        </p>
      </div>
      <p className="mt-1 text-sm font-bold">{formatCurrency(entry.value)}/kg</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Crunching numbers...</p>
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const predictions = data?.predictions || {};
  const demandRanking = data?.demandRanking || [];
  const bestPrices = data?.bestPrices || {};
  const priceComparison = data?.priceComparison || {};

  // Build chart data for the main prediction chart (pick top material with most data)
  const topMaterial = Object.entries(predictions).sort(
    (a: any, b: any) => (b[1].historical?.length || 0) - (a[1].historical?.length || 0)
  )[0];

  const predictionChartData = topMaterial
    ? [
        ...(topMaterial[1] as any).historical.map((h: any) => ({
          date: h.date.slice(5),
          price: h.price,
          isForecast: false,
        })),
        ...(topMaterial[1] as any).forecast.map((f: any) => ({
          date: f.date.slice(5),
          price: f.price,
          isForecast: true,
        })),
      ]
    : [];

  // Demand chart data
  const demandChartData = demandRanking.slice(0, 8).map((d: any, i: number) => ({
    name: (MATERIAL_LABELS[d.material] || d.material).slice(0, 10),
    kg: Math.round(d.totalKg * 10) / 10,
    fill: CHART_COLORS[i % CHART_COLORS.length],
  }));

  // Price comparison data (flatten for chart)
  const comparisonData = Object.entries(bestPrices).map(([mat, info]: any) => ({
    material: (MATERIAL_LABELS[mat] || mat).slice(0, 10),
    price: info.price,
    color: MATERIAL_COLORS[mat] || "#64748b",
  }));

  const overviewCards = [
    { label: "Transactions", value: overview.totalTransactions?.toString() || "0", icon: Activity, gradient: "from-emerald-500 to-teal-500", change: "+12%" },
    { label: "Kg Processed", value: `${(overview.totalKgProcessed / 1000).toFixed(1)}t`, icon: Scale, gradient: "from-blue-500 to-cyan-500", change: "+8%" },
    { label: "Revenue", value: formatCurrency(overview.totalRevenue || 0), icon: DollarSign, gradient: "from-amber-500 to-orange-500", change: "+15%" },
    { label: "Materials", value: (overview.activeMaterials || 0).toString(), icon: BarChart3, gradient: "from-violet-500 to-purple-500", change: "Active" },
  ];

  return (
    <div className="container max-w-6xl space-y-6 py-6 lg:py-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold lg:text-3xl">Analytics & Predictions</h1>
            <p className="text-sm text-muted-foreground">
              AI-powered market insights and price forecasting
            </p>
          </div>
        </div>
      </motion.div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {overviewCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
          >
            <Card className="overflow-hidden border-border/50">
              <CardContent className="p-4 lg:p-5">
                <div className="flex items-center justify-between">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/20">
                    {stat.change}
                  </Badge>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">{stat.label}</p>
                <p className="truncate font-display text-lg font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Left: Charts */}
        <div className="space-y-6 lg:col-span-3">
          {/* Price Prediction Chart */}
          {topMaterial && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Sparkles className="h-4 w-4 text-violet-500" />
                      Price Prediction
                    </CardTitle>
                    <Badge className="gap-1 bg-violet-500/10 text-violet-500 border-0">
                      <Brain className="h-3 w-3" />
                      {MATERIAL_LABELS[topMaterial[0]] || topMaterial[0]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Linear regression forecast &mdash; {(topMaterial[1] as any).confidence}% confidence
                  </p>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={predictionChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradHistory" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradForecast" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<PredictionTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="price"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#gradHistory)"
                          dot={(props: any) => {
                            if (props.payload?.isForecast) {
                              return <circle cx={props.cx} cy={props.cy} r={4} fill="#8b5cf6" stroke="#fff" strokeWidth={2} />;
                            }
                            return <circle cx={props.cx} cy={props.cy} r={3} fill="#10b981" stroke="none" />;
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-6 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Historical</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-violet-500" />
                      <span className="text-muted-foreground">Predicted (7 days)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Material Demand Chart */}
          {demandChartData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Target className="h-4 w-4 text-blue-500" />
                    Material Demand
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">Total kilograms listed by material type</p>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={demandChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (!active || !payload?.length) return null;
                            return (
                              <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
                                <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
                                <p className="text-sm font-bold">{payload[0].value} kg</p>
                              </div>
                            );
                          }}
                        />
                        <Bar dataKey="kg" radius={[6, 6, 0, 0]}>
                          {demandChartData.map((entry: any, i: number) => (
                            <Cell key={i} fill={entry.fill} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-6 lg:col-span-2">
          {/* Material Trends */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.35 }}>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Price Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(predictions).map(([mat, pred]: any) => {
                    const cfg = TREND_CONFIG[pred.trend as keyof typeof TREND_CONFIG] || TREND_CONFIG.stable;
                    const TrendIcon = cfg.icon;
                    const lastPrice = pred.historical?.length > 0 ? pred.historical[pred.historical.length - 1].price : 0;
                    const forecastPrice = pred.forecast?.length > 0 ? pred.forecast[pred.forecast.length - 1].price : lastPrice;
                    const diff = forecastPrice - lastPrice;

                    return (
                      <div
                        key={mat}
                        className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: MATERIAL_COLORS[mat] || "#64748b" }}
                          />
                          <div>
                            <p className="text-xs font-semibold">{MATERIAL_LABELS[mat] || mat}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatCurrency(lastPrice)}/kg now
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className={`flex items-center gap-0.5 text-xs font-bold ${cfg.color}`}>
                              {diff > 0 ? <ArrowUpRight className="h-3 w-3" /> : diff < 0 ? <ArrowDownRight className="h-3 w-3" /> : null}
                              {diff > 0 ? "+" : ""}{formatCurrency(Math.abs(diff))}
                            </div>
                            <p className="text-[9px] text-muted-foreground">{pred.confidence}% conf.</p>
                          </div>
                          <div className={`flex h-6 w-6 items-center justify-center rounded-md ${cfg.bg}`}>
                            <TrendIcon className={`h-3 w-3 ${cfg.color}`} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(predictions).length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">No trend data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Best Prices */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.45 }}>
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Best Market Prices
                </CardTitle>
                <p className="text-xs text-muted-foreground">Highest buy price per material across all centers</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(bestPrices).map(([mat, info]: any) => (
                    <div
                      key={mat}
                      className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: MATERIAL_COLORS[mat] || "#64748b" }}
                        />
                        <span className="text-xs font-semibold">{MATERIAL_LABELS[mat] || mat}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-500">
                        {formatCurrency(info.price)}/kg
                      </span>
                    </div>
                  ))}
                  {Object.keys(bestPrices).length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">No prices available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Price Comparison */}
          {comparisonData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.55 }}>
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <DollarSign className="h-4 w-4 text-cyan-500" />
                    Price Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.5} horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="material" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={70} />
                        <Bar dataKey="price" radius={[0, 4, 4, 0]} barSize={16}>
                          {comparisonData.map((entry: any, i: number) => (
                            <Cell key={i} fill={entry.color} fillOpacity={0.75} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
