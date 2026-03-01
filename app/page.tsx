"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  MapPin,
  Recycle,
  TrendingUp,
  Users,
  ArrowRight,
  Leaf,
  Shield,
  Zap,
  Sparkles,
  Globe,
  BarChart3,
  Truck,
  Camera,
  Award,
  Brain,
  Route,
  TreePine,
  Droplets,
  Star,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MapPin,
    title: "Live Map",
    description: "Interactive map with material pins, collection centers, and real-time prices across your city.",
    gradient: "from-emerald-500 to-teal-500",
    iconBg: "bg-emerald-500",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    borderAccent: "border-l-emerald-500",
  },
  {
    icon: Route,
    title: "Smart Routes",
    description: "Graph-based algorithm groups nearby pickups into optimal routes. Save time, fuel, and CO\u2082.",
    gradient: "from-blue-500 to-indigo-500",
    iconBg: "bg-blue-500",
    accentColor: "text-blue-600 dark:text-blue-400",
    borderAccent: "border-l-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Prices",
    description: "Centers publish prices per kg in MXN. Compare across centers instantly and sell at the best price.",
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500",
    accentColor: "text-amber-600 dark:text-amber-400",
    borderAccent: "border-l-amber-500",
  },
  {
    icon: Brain,
    title: "AI Classifier",
    description: "Take a photo and our AI classifies the material and estimates weight automatically.",
    gradient: "from-violet-500 to-purple-500",
    iconBg: "bg-violet-500",
    accentColor: "text-violet-600 dark:text-violet-400",
    borderAccent: "border-l-violet-500",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Linear regression predicts price trends. Premium demand and comparison charts.",
    gradient: "from-rose-500 to-pink-500",
    iconBg: "bg-rose-500",
    accentColor: "text-rose-600 dark:text-rose-400",
    borderAccent: "border-l-rose-500",
  },
  {
    icon: Award,
    title: "EcoPoints & Rewards",
    description: "Earn points for every kg recycled. Level up and redeem for real rewards.",
    gradient: "from-teal-500 to-cyan-500",
    iconBg: "bg-teal-500",
    accentColor: "text-teal-600 dark:text-teal-400",
    borderAccent: "border-l-teal-500",
  },
];

const steps = [
  { num: "01", title: "List your materials", desc: "Take a photo \u2014 AI classifies it. Set weight and price.", icon: Camera, color: "bg-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-800" },
  { num: "02", title: "Smart grouping", desc: "Nearby pickups are grouped into optimized routes.", icon: Recycle, color: "bg-blue-500", ring: "ring-blue-200 dark:ring-blue-800" },
  { num: "03", title: "Pickup & delivery", desc: "Recyclers follow guided routes. Centers verify materials.", icon: Truck, color: "bg-amber-500", ring: "ring-amber-200 dark:ring-amber-800" },
  { num: "04", title: "Earn & track impact", desc: "Get paid fairly. Track your CO\u2082 savings and EcoPoints.", icon: TrendingUp, color: "bg-violet-500", ring: "ring-violet-200 dark:ring-violet-800" },
];

const stats = [
  { value: "48,500+", label: "Kg Recycled", icon: Recycle, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", iconColor: "text-emerald-500" },
  { value: "12", label: "Collection Centers", icon: MapPin, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-500" },
  { value: "10+", label: "Material Types", icon: BarChart3, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", iconColor: "text-amber-500" },
  { value: "121+", label: "Tons CO\u2082 Avoided", icon: Globe, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-900/30", iconColor: "text-violet-500" },
];

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden bg-background" style={{ minHeight: 'var(--app-height, 100vh)' }}>
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-2xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-foreground">ReciMap</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden text-muted-foreground hover:text-foreground sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600">
                <Sparkles className="h-3.5 w-3.5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        {/* Rich multi-color decorative blobs */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-20 h-[600px] w-[600px] rounded-full bg-emerald-100/60 dark:bg-emerald-900/20 blur-[120px]" />
          <div className="absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-blue-100/40 dark:bg-blue-900/15 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-amber-50/60 dark:bg-amber-900/10 blur-[100px]" />
          <div className="absolute right-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-violet-50/50 dark:bg-violet-900/10 blur-[100px]" />
          {/* Decorative dots — multicolor */}
          <div className="absolute left-[8%] top-[20%] h-3 w-3 rounded-full bg-emerald-400/40" />
          <div className="absolute right-[12%] top-[15%] h-4 w-4 rounded-full bg-blue-400/30" />
          <div className="absolute left-[20%] bottom-[25%] h-5 w-5 rounded-full bg-amber-400/25" />
          <div className="absolute right-[25%] bottom-[18%] h-2.5 w-2.5 rounded-full bg-violet-500/30" />
          <div className="absolute left-[55%] top-[12%] h-6 w-6 rounded-full bg-rose-300/20" />
          <div className="absolute left-[75%] bottom-[30%] h-3.5 w-3.5 rounded-full bg-teal-400/25" />
          <div className="absolute left-[40%] top-[8%] h-2 w-2 rounded-full bg-pink-400/30" />
        </div>

        <div className="container flex flex-col items-center gap-8 pb-20 pt-20 text-center md:pb-28 md:pt-28 lg:pt-36">
          {/* Pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Circular Economy Marketplace
          </motion.div>

          {/* Main heading with italic serif accent */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl font-display text-4xl font-extrabold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Every kilogram counts.{" "}
            <br className="hidden sm:block" />
            <span className="font-serif italic bg-gradient-to-r from-emerald-600 via-teal-500 to-blue-500 bg-clip-text text-transparent">
              Map. Recycle. Earn.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl"
          >
            Connect waste generators with recyclers and collection centers on a live map.
            Real-time prices, optimized routes, and verified impact.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/register">
              <Button size="lg" className="gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-white shadow-xl shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600">
                Start Recycling
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="rounded-full border-border px-8 text-foreground hover:bg-muted hover:text-foreground">
                I have an account
              </Button>
            </Link>
          </motion.div>

          {/* Stats — each with unique color */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="mt-8 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.08 }}
                className="rounded-2xl border border-border bg-background/80 p-4 text-center shadow-sm backdrop-blur-sm"
              >
                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                <p className={`font-display text-xl font-bold sm:text-2xl ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute right-0 top-1/4 -z-10 h-[400px] w-[400px] rounded-full bg-blue-50/50 dark:bg-blue-950/10 blur-[120px]" />
        <div className="absolute left-0 bottom-1/4 -z-10 h-[350px] w-[350px] rounded-full bg-amber-50/40 dark:bg-amber-950/10 blur-[100px]" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            {/* Decorative line + label */}
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-400" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Platform</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-400" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl">
              Everything you need for{" "}
              <span className="font-serif italic text-emerald-600 dark:text-emerald-400">circular materials</span>
            </h2>
            <p className="mt-4 text-muted-foreground lg:text-lg">
              A complete platform connecting every actor in the recycling value chain.
            </p>
          </motion.div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:p-8 border-l-4 ${feature.borderAccent}`}
              >
                <div className={`relative mb-4 inline-flex rounded-xl ${feature.iconBg} p-2.5 shadow-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className={`relative font-display text-lg font-semibold ${feature.accentColor}`}>{feature.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works — DARK SECTION ─── */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 dark:from-slate-950 dark:via-slate-950 dark:to-black text-white">
        {/* Decorative color blobs on dark */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-0 h-[400px] w-[400px] rounded-full bg-emerald-600/10 blur-[120px]" />
          <div className="absolute right-0 bottom-0 h-[350px] w-[350px] rounded-full bg-blue-600/10 blur-[100px]" />
          <div className="absolute left-1/2 top-1/3 h-[250px] w-[250px] rounded-full bg-amber-500/8 blur-[80px]" />
        </div>
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-emerald-400/50" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">Process</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-emerald-400/50" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight lg:text-4xl xl:text-5xl">
              Four{" "}
              <span className="font-serif italic text-emerald-400">simple</span>{" "}
              steps
            </h2>
            <p className="mt-4 text-slate-400 lg:text-lg">
              From listing to earning — the full flow in minutes.
            </p>
          </motion.div>

          <div className="relative mt-16 flex flex-col items-center gap-8 lg:mt-20">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex w-full max-w-xl items-center gap-5 rounded-2xl border border-slate-800 bg-slate-800/50 p-5 backdrop-blur-sm transition-all hover:border-slate-700 hover:bg-slate-800/80"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${step.color} ring-4 ${step.ring} shadow-lg transition-transform group-hover:scale-110`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{step.num}</span>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-0.5 text-sm text-slate-400">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Impact Section ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-emerald-50/30 dark:via-emerald-950/10 to-transparent" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-teal-400" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600 dark:text-teal-400">Impact</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-teal-400" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl">
              Real, measurable{" "}
              <span className="font-serif italic text-teal-600 dark:text-teal-400">environmental impact</span>
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TreePine, value: "824", label: "Trees Saved", sub: "~17 per ton recycled", iconBg: "bg-emerald-500", cardBg: "bg-emerald-50 dark:bg-emerald-950/30", borderColor: "border-emerald-200 dark:border-emerald-800", valueColor: "text-emerald-700 dark:text-emerald-300", labelColor: "text-emerald-600 dark:text-emerald-400" },
              { icon: Droplets, value: "169,750L", label: "Water Saved", sub: "~3.5L per kg", iconBg: "bg-blue-500", cardBg: "bg-blue-50 dark:bg-blue-950/30", borderColor: "border-blue-200 dark:border-blue-800", valueColor: "text-blue-700 dark:text-blue-300", labelColor: "text-blue-600 dark:text-blue-400" },
              { icon: Zap, value: "116,400", label: "kWh Conserved", sub: "~2.4 kWh per kg", iconBg: "bg-amber-500", cardBg: "bg-amber-50 dark:bg-amber-950/30", borderColor: "border-amber-200 dark:border-amber-800", valueColor: "text-amber-700 dark:text-amber-300", labelColor: "text-amber-600 dark:text-amber-400" },
              { icon: Shield, value: "48.5t", label: "Landfill Avoided", sub: "digitally verified", iconBg: "bg-violet-500", cardBg: "bg-violet-50 dark:bg-violet-950/30", borderColor: "border-violet-200 dark:border-violet-800", valueColor: "text-violet-700 dark:text-violet-300", labelColor: "text-violet-600 dark:text-violet-400" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group rounded-2xl border ${item.borderColor} ${item.cardBg} p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${item.iconBg} shadow-lg`}>
                  <item.icon className="h-6 w-6 text-white" />
                </div>
                <p className={`font-display text-2xl font-bold lg:text-3xl ${item.valueColor}`}>{item.value}</p>
                <p className={`text-sm font-medium ${item.labelColor}`}>{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground/70">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Roles Section — Colorful cards ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute right-0 top-0 -z-10 h-[400px] w-[400px] rounded-full bg-rose-50/40 dark:bg-rose-950/10 blur-[120px]" />
        <div className="absolute left-0 bottom-0 -z-10 h-[350px] w-[350px] rounded-full bg-violet-50/40 dark:bg-violet-950/10 blur-[100px]" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-violet-400" />
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">Roles</span>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-violet-400" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              Who can use{" "}
              <span className="font-serif italic text-violet-600 dark:text-violet-400">ReciMap</span>?
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, title: "Households", desc: "List your recyclables, earn EcoPoints, and measure your environmental impact.", iconBg: "bg-emerald-500", ring: "ring-emerald-100 dark:ring-emerald-900", accentBorder: "hover:border-emerald-400 dark:hover:border-emerald-600" },
              { icon: Recycle, title: "Businesses", desc: "Get rid of cardboard, oil, and waste. Schedule pickups easily.", iconBg: "bg-blue-500", ring: "ring-blue-100 dark:ring-blue-900", accentBorder: "hover:border-blue-400 dark:hover:border-blue-600" },
              { icon: Truck, title: "Recyclers", desc: "Claim batches, follow optimized routes, and earn per delivery.", iconBg: "bg-amber-500", ring: "ring-amber-100 dark:ring-amber-900", accentBorder: "hover:border-amber-400 dark:hover:border-amber-600" },
              { icon: MapPin, title: "Centers", desc: "Publish prices, receive materials, and manage transactions.", iconBg: "bg-violet-500", ring: "ring-violet-100 dark:ring-violet-900", accentBorder: "hover:border-violet-400 dark:hover:border-violet-600" },
            ].map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${role.accentBorder}`}
              >
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${role.iconBg} ring-4 ${role.ring} shadow-lg transition-transform group-hover:scale-110`}>
                  <role.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{role.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{role.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonial / Quote ─── */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-emerald-50 via-background to-blue-50 dark:from-emerald-950/20 dark:via-background dark:to-blue-950/20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mx-auto mb-6 flex justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="font-serif text-2xl italic leading-relaxed text-foreground/80 sm:text-3xl lg:text-4xl">
              &ldquo;Tu basura de hoy es la{" "}
              <span className="not-italic font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                comida de mañana
              </span>
              &rdquo;
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white shadow-lg">
                <Heart className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Household Circular Systems</p>
                <p className="text-xs text-muted-foreground">ReciMap &bull; Invent for the Planet 2026</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/50 dark:bg-emerald-900/15 blur-[150px]" />
        <div className="absolute right-0 top-0 -z-10 h-[300px] w-[300px] rounded-full bg-violet-100/30 dark:bg-violet-900/10 blur-[100px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container"
        >
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 dark:from-emerald-950/40 via-background to-teal-50 dark:to-teal-950/30 p-10 text-center shadow-2xl shadow-emerald-100/50 dark:shadow-emerald-900/20 sm:p-14 lg:p-20">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/25">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground lg:text-4xl xl:text-5xl">
              Ready to make an{" "}
              <span className="font-serif italic text-emerald-600 dark:text-emerald-400">impact</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground lg:text-lg">
              Join the circular economy. Whether you generate waste, collect it, or process it — ReciMap connects you.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-8 text-white shadow-xl shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-600">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="rounded-full border-border px-8 text-foreground hover:bg-muted hover:text-foreground">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border bg-muted/50 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-600">
              <Leaf className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-medium text-foreground/70">ReciMap 2026</span>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Built for Invent for the Planet &bull; Tecnol&oacute;gico de Monterrey
          </p>
        </div>
      </footer>
    </div>
  );
}
