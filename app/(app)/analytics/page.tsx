"use client";

import { useState } from "react";
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
  ComposedChart,
  Line,
  ReferenceLine,
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
  CandlestickChart,
  LineChart,
  ShieldAlert,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MATERIAL_LABELS, MATERIAL_COLORS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const RANGES = ["1W", "1M", "3M", "6M", "1Y"] as const;

const TREND_CONFIG = {
  rising: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  falling: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500/10" },
  stable: { icon: Minus, color: "text-amber-500", bg: "bg-amber-500/10" },
};

const SIGNAL_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  overbought: { label: "Overbought", color: "text-red-500", bg: "bg-red-500/10" },
  oversold: { label: "Oversold", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  neutral: { label: "Neutral", color: "text-amber-500", bg: "bg-amber-500/10" },
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-1.5 text-[11px] font-medium text-muted-foreground">{label}</p>
      {payload.filter((e: any) => e.value != null).map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full" style={{ background: entry.color || entry.stroke }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-bold">{typeof entry.value === "number" ? entry.value.toFixed(2) : entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [range, setRange] = useState<string>("3M");
  const [selectedMat, setSelectedMat] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<"price" | "bollinger" | "rsi" | "macd">("price");

  const { data, isLoading } = useQuery({
    queryKey: ["analytics", range],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?range=${range}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Analyzing market data...</p>
        </div>
      </div>
    );
  }

  const overview = data?.overview || {};
  const materials = data?.materials || {};
  const demandRanking = data?.demandRanking || [];
  const bestPrices = data?.bestPrices || {};

  const matKeys = Object.keys(materials).sort((a, b) =>
    (materials[b].daily?.length || 0) - (materials[a].daily?.length || 0)
  );
  const activeMat = selectedMat && materials[selectedMat] ? selectedMat : matKeys[0];
  const matData = activeMat ? materials[activeMat] : null;

  // Build main chart data
  const mainChartData = matData ? [
    ...matData.daily.map((d: any, i: number) => ({
      date: d.date.slice(5),
      price: d.price,
      ema7: matData.indicators.ema7[i]?.value,
      ema21: matData.indicators.ema21[i]?.value,
      bbUpper: matData.indicators.bollinger[i]?.upper,
      bbLower: matData.indicators.bollinger[i]?.lower,
      bbSma: matData.indicators.bollinger[i]?.sma,
      isForecast: false,
    })),
    ...matData.forecast.map((f: any) => ({
      date: f.date.slice(5),
      price: f.price,
      forecastUpper: f.upper,
      forecastLower: f.lower,
      isForecast: true,
    })),
  ] : [];

  const rsiData = matData?.indicators?.rsi?.map((r: any) => ({
    date: r.date.slice(5),
    rsi: r.value,
  })) || [];

  const macdData = matData?.indicators?.macd?.map((m: any) => ({
    date: m.date.slice(5),
    macd: m.macd,
    signal: m.signal,
    histogram: m.histogram,
  })) || [];

  const demandChartData = demandRanking.slice(0, 8).map((d: any, i: number) => ({
    name: (MATERIAL_LABELS[d.material] || d.material).slice(0, 10),
    kg: Math.round(d.totalKg * 10) / 10,
    fill: MATERIAL_COLORS[d.material] || "#64748b",
  }));

  const overviewCards = [
    { label: "Transactions", value: overview.totalTransactions?.toString() || "0", icon: Activity, gradient: "from-emerald-500 to-teal-500" },
    { label: "Kg Processed", value: `${((overview.totalKgProcessed || 0) / 1000).toFixed(1)}t`, icon: Scale, gradient: "from-blue-500 to-cyan-500" },
    { label: "Revenue", value: formatCurrency(overview.totalRevenue || 0), icon: DollarSign, gradient: "from-amber-500 to-orange-500" },
    { label: "Materials", value: (overview.activeMaterials || 0).toString(), icon: BarChart3, gradient: "from-violet-500 to-purple-500" },
  ];

  return (
    <div className="space-y-5 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25">
          <Brain className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold lg:text-2xl">Market Analytics</h1>
          <p className="text-xs text-muted-foreground">Real-time predictions &amp; technical indicators</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {overviewCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-border/50">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className="font-display text-sm font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Material selector chips */}
      {matKeys.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {matKeys.map(mat => {
            const m = materials[mat];
            const isActive = mat === activeMat;
            return (
              <button
                key={mat}
                onClick={() => setSelectedMat(mat)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "ring-2 ring-primary shadow-sm"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
                style={isActive ? {
                  backgroundColor: (MATERIAL_COLORS[mat] || "#64748b") + "15",
                  color: MATERIAL_COLORS[mat] || "#64748b",
                } : undefined}
              >
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: MATERIAL_COLORS[mat] || "#64748b" }} />
                {MATERIAL_LABELS[mat] || mat}
                <span className={cn("text-[10px]", m.pctChange > 0 ? "text-emerald-500" : m.pctChange < 0 ? "text-red-500" : "text-muted-foreground")}>
                  {m.pctChange > 0 ? "+" : ""}{m.pctChange}%
                </span>
              </button>
            );
          })}
        </div>
      )}

      {matData && (
        <div className="grid gap-5 lg:grid-cols-5">
          {/* Main chart area */}
          <div className="space-y-4 lg:col-span-3">
            {/* Material header + inline controls */}
            <Card className="sticky top-0 z-20 border-border/50">
              <CardContent className="space-y-3 p-4">
                {/* Price header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded-full" style={{ backgroundColor: MATERIAL_COLORS[activeMat!] || "#64748b" }} />
                    <div>
                      <h2 className="font-display text-lg font-bold">{MATERIAL_LABELS[activeMat!] || activeMat}</h2>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>H: {formatCurrency(matData.high)}</span>
                        <span>L: {formatCurrency(matData.low)}</span>
                        <span>{matData.daily.length} days</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl font-bold">{formatCurrency(matData.currentPrice)}<span className="text-sm font-normal text-muted-foreground">/kg</span></p>
                    <div className={cn("flex items-center justify-end gap-1 text-sm font-bold",
                      matData.pctChange > 0 ? "text-emerald-500" : matData.pctChange < 0 ? "text-red-500" : "text-muted-foreground"
                    )}>
                      {matData.pctChange > 0 ? <ArrowUpRight className="h-4 w-4" /> : matData.pctChange < 0 ? <ArrowDownRight className="h-4 w-4" /> : null}
                      {matData.pctChange > 0 ? "+" : ""}{matData.pctChange}%
                    </div>
                  </div>
                </div>
                {/* Chart mode tabs + time range — all inline */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-0.5">
                    {([
                      { key: "price", label: "Price", icon: LineChart },
                      { key: "bollinger", label: "Bollinger", icon: CandlestickChart },
                      { key: "rsi", label: "RSI", icon: Activity },
                      { key: "macd", label: "MACD", icon: BarChart3 },
                    ] as const).map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setChartMode(tab.key)}
                        className={cn(
                          "flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
                          chartMode === tab.key
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <tab.icon className="h-3 w-3" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/30 p-0.5">
                    {RANGES.map(r => (
                      <button
                        key={r}
                        onClick={() => setRange(r)}
                        className={cn(
                          "rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all",
                          range === r
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Price + EMA chart */}
            {chartMode === "price" && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={mainChartData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="gradPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={MATERIAL_COLORS[activeMat!] || "#10b981"} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={MATERIAL_COLORS[activeMat!] || "#10b981"} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradFc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="forecastUpper" stroke="none" fill="url(#gradFc)" />
                        <Area type="monotone" dataKey="forecastLower" stroke="none" fill="transparent" />
                        <Area type="monotone" dataKey="price" stroke={MATERIAL_COLORS[activeMat!] || "#10b981"} strokeWidth={2} fill="url(#gradPrice)" name="Price" />
                        <Line type="monotone" dataKey="ema7" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="EMA 7" />
                        <Line type="monotone" dataKey="ema21" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 2" dot={false} name="EMA 21" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: MATERIAL_COLORS[activeMat!] || "#10b981" }} /><span className="text-muted-foreground">Price</span></div>
                    <div className="flex items-center gap-1"><div className="h-0.5 w-4 rounded bg-blue-500" /><span className="text-muted-foreground">EMA 7</span></div>
                    <div className="flex items-center gap-1"><div className="h-0.5 w-4 rounded bg-amber-500" /><span className="text-muted-foreground">EMA 21</span></div>
                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-violet-500" /><span className="text-muted-foreground">Forecast</span></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Bollinger Bands chart */}
            {chartMode === "bollinger" && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={mainChartData.filter((d: any) => !d.isForecast)} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                        <defs>
                          <linearGradient id="bbFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.1} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                        <Tooltip content={<ChartTooltip />} />
                        <Area type="monotone" dataKey="bbUpper" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" fill="url(#bbFill)" name="BB Upper" />
                        <Area type="monotone" dataKey="bbLower" stroke="#8b5cf6" strokeWidth={1} strokeDasharray="3 3" fill="transparent" name="BB Lower" />
                        <Line type="monotone" dataKey="bbSma" stroke="#8b5cf6" strokeWidth={1} dot={false} name="BB SMA" />
                        <Line type="monotone" dataKey="price" stroke={MATERIAL_COLORS[activeMat!] || "#10b981"} strokeWidth={2} dot={false} name="Price" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full" style={{ backgroundColor: MATERIAL_COLORS[activeMat!] }} /><span className="text-muted-foreground">Price</span></div>
                    <div className="flex items-center gap-1"><div className="h-0.5 w-4 rounded bg-violet-500" /><span className="text-muted-foreground">Bollinger ±2σ</span></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* RSI chart */}
            {chartMode === "rsi" && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={rsiData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip content={<ChartTooltip />} />
                        <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.6} />
                        <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.6} />
                        <ReferenceLine y={50} stroke="hsl(var(--border))" strokeDasharray="2 2" />
                        <Area type="monotone" dataKey="rsi" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradPrice)" name="RSI" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded-full bg-violet-500" /><span className="text-muted-foreground">RSI(14)</span></div>
                    <div className="flex items-center gap-1"><div className="h-0.5 w-3 rounded bg-red-500" /><span className="text-muted-foreground">Overbought (70)</span></div>
                    <div className="flex items-center gap-1"><div className="h-0.5 w-3 rounded bg-emerald-500" /><span className="text-muted-foreground">Oversold (30)</span></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* MACD chart */}
            {chartMode === "macd" && (
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={macdData} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} />
                        <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <ReferenceLine y={0} stroke="hsl(var(--border))" />
                        <Bar dataKey="histogram" name="Histogram" radius={[2, 2, 0, 0]}>
                          {macdData.map((d: any, i: number) => (
                            <Cell key={i} fill={d.histogram >= 0 ? "#10b981" : "#ef4444"} fillOpacity={0.6} />
                          ))}
                        </Bar>
                        <Line type="monotone" dataKey="macd" stroke="#3b82f6" strokeWidth={1.5} dot={false} name="MACD" />
                        <Line type="monotone" dataKey="signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="Signal" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-2 flex items-center justify-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1"><div className="h-0.5 w-4 rounded bg-blue-500" /><span className="text-muted-foreground">MACD(12,26)</span></div>
                    <div className="flex items-center gap-1"><div className="h-0.5 w-4 rounded bg-amber-500" /><span className="text-muted-foreground">Signal(9)</span></div>
                    <div className="flex items-center gap-1"><div className="h-2 w-2 rounded bg-emerald-500/60" /><span className="text-muted-foreground">Histogram</span></div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Demand chart */}
            {demandChartData.length > 0 && (
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-blue-500" />
                    Material Demand (kg listed)
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={demandChartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} barCategoryGap="20%">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.4} vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="kg" radius={[4, 4, 0, 0]} name="Kg">
                          {demandChartData.map((e: any, i: number) => (
                            <Cell key={i} fill={e.fill} fillOpacity={0.75} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right sidebar */}
          <div className="space-y-4 lg:col-span-2">
            {/* Trading signals */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <ShieldAlert className="h-4 w-4 text-violet-500" />
                  Trading Signals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {matKeys.map(mat => {
                    const m = materials[mat];
                    const trendCfg = TREND_CONFIG[m.trend as keyof typeof TREND_CONFIG] || TREND_CONFIG.stable;
                    const sigCfg = SIGNAL_CONFIG[m.signal] || SIGNAL_CONFIG.neutral;
                    const TrendIcon = trendCfg.icon;
                    return (
                      <button
                        key={mat}
                        onClick={() => setSelectedMat(mat)}
                        className={cn(
                          "flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all",
                          mat === activeMat ? "border-primary/30 bg-primary/5" : "border-border/50 bg-muted/20 hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: MATERIAL_COLORS[mat] || "#64748b" }} />
                          <div>
                            <p className="text-xs font-semibold">{MATERIAL_LABELS[mat] || mat}</p>
                            <p className="text-[10px] text-muted-foreground">{formatCurrency(m.currentPrice)}/kg</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={cn("text-[9px] border-0", sigCfg.bg, sigCfg.color)}>
                            {sigCfg.label}
                          </Badge>
                          <div className={cn("flex items-center gap-0.5 text-xs font-bold", trendCfg.color)}>
                            {m.pctChange > 0 ? "+" : ""}{m.pctChange}%
                          </div>
                          <div className={cn("flex h-6 w-6 items-center justify-center rounded-md", trendCfg.bg)}>
                            <TrendIcon className={cn("h-3 w-3", trendCfg.color)} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active material detail */}
            {matData && (
              <Card className="border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Sparkles className="h-4 w-4 text-violet-500" />
                    7-Day Forecast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1.5">
                    {matData.forecast.map((f: any) => (
                      <div key={f.date} className="flex items-center justify-between rounded-lg bg-muted/20 px-3 py-1.5 text-xs">
                        <span className="text-muted-foreground">{f.date}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{formatCurrency(f.lower)}</span>
                          <span className="font-bold">{formatCurrency(f.price)}</span>
                          <span className="text-[10px] text-muted-foreground">{formatCurrency(f.upper)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-center text-[10px] text-muted-foreground">
                    {matData.confidence}% confidence • Linear regression + Bollinger bands
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Best Market Prices */}
            <Card className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-amber-500" />
                  Best Prices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  {Object.entries(bestPrices).map(([mat, info]: any) => (
                    <div key={mat} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: MATERIAL_COLORS[mat] || "#64748b" }} />
                        <span className="text-xs font-medium">{MATERIAL_LABELS[mat] || mat}</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-500">{formatCurrency(info.price)}/kg</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
