"use client";

import Link from "next/link";
import Image from "next/image";
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
  ChevronRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MapPin,
    title: "Live Map",
    description: "Interactive map with material pins, collection centers, and real-time prices across your city.",
    iconBg: "bg-emerald-500",
    accentColor: "text-emerald-600 dark:text-emerald-400",
    borderAccent: "border-l-emerald-500",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Route,
    title: "Smart Routes",
    description: "Graph-based algorithm groups nearby pickups into optimal routes. Save time, fuel, and CO\u2082.",
    iconBg: "bg-blue-500",
    accentColor: "text-blue-600 dark:text-blue-400",
    borderAccent: "border-l-blue-500",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Prices",
    description: "Centers publish prices per kg in MXN. Compare across centers instantly and sell at the best price.",
    iconBg: "bg-amber-500",
    accentColor: "text-amber-600 dark:text-amber-400",
    borderAccent: "border-l-amber-500",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: Brain,
    title: "AI Classifier",
    description: "Take a photo and our AI classifies the material and estimates weight automatically.",
    iconBg: "bg-violet-500",
    accentColor: "text-violet-600 dark:text-violet-400",
    borderAccent: "border-l-violet-500",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Linear regression predicts price trends. Premium demand and comparison charts.",
    iconBg: "bg-rose-500",
    accentColor: "text-rose-600 dark:text-rose-400",
    borderAccent: "border-l-rose-500",
    gradient: "from-rose-500 to-pink-500",
  },
  {
    icon: Award,
    title: "EcoPoints & Rewards",
    description: "Earn points for every kg recycled. Level up and redeem for real rewards.",
    iconBg: "bg-teal-500",
    accentColor: "text-teal-600 dark:text-teal-400",
    borderAccent: "border-l-teal-500",
    gradient: "from-teal-500 to-cyan-500",
  },
];

const steps = [
  { num: "01", title: "List your materials", desc: "Take a photo \u2014 AI classifies it. Set weight and price.", icon: Camera, color: "bg-emerald-500", ring: "ring-emerald-200 dark:ring-emerald-800" },
  { num: "02", title: "Smart grouping", desc: "Nearby pickups are grouped into optimized routes.", icon: Recycle, color: "bg-blue-500", ring: "ring-blue-200 dark:ring-blue-800" },
  { num: "03", title: "Pickup & delivery", desc: "Recyclers follow guided routes. Centers verify materials.", icon: Truck, color: "bg-amber-500", ring: "ring-amber-200 dark:ring-amber-800" },
  { num: "04", title: "Earn & track impact", desc: "Get paid fairly. Track your CO\u2082 savings and EcoPoints.", icon: TrendingUp, color: "bg-violet-500", ring: "ring-violet-200 dark:ring-violet-800" },
];

const stats = [
  { value: "48,500+", label: "Kg Recycled", icon: Recycle, color: "text-white", bg: "bg-emerald-500", iconColor: "text-white/80" },
  { value: "12", label: "Collection Centers", icon: MapPin, color: "text-white", bg: "bg-blue-500", iconColor: "text-white/80" },
  { value: "10+", label: "Material Types", icon: BarChart3, color: "text-white", bg: "bg-amber-500", iconColor: "text-white/80" },
  { value: "121+", label: "Tons CO\u2082 Avoided", icon: Globe, color: "text-white", bg: "bg-violet-500", iconColor: "text-white/80" },
];

export default function Home() {
  return (
    <div className="flex flex-col overflow-x-hidden bg-background" style={{ minHeight: 'var(--app-height, 100vh)' }}>
      {/* ─── Sticky Header ─── */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-emerald-900/90 backdrop-blur-2xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 shadow-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">ReciMap</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden text-white/70 hover:text-white hover:bg-white/10 sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="gap-1.5 rounded-full bg-white px-5 text-emerald-800 font-semibold shadow-lg hover:bg-emerald-50">
                <Sparkles className="h-3.5 w-3.5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          HERO — Full green gradient banner with visual elements
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-700 text-white">
        {/* Background pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        {/* Glow blobs */}
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-emerald-400/20 blur-[150px]" />
        <div className="absolute -right-40 bottom-0 h-[500px] w-[500px] rounded-full bg-teal-300/15 blur-[120px]" />
        <div className="absolute left-1/2 top-1/4 h-[300px] w-[300px] rounded-full bg-green-300/10 blur-[80px]" />
        {/* Floating dots */}
        <div className="absolute left-[8%] top-[15%] h-3 w-3 rounded-full bg-white/20 animate-pulse" />
        <div className="absolute right-[12%] top-[25%] h-4 w-4 rounded-full bg-emerald-300/30 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute left-[25%] bottom-[20%] h-5 w-5 rounded-full bg-teal-300/20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute right-[20%] bottom-[25%] h-2.5 w-2.5 rounded-full bg-white/25 animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute left-[70%] top-[10%] h-6 w-6 rounded-full bg-green-200/15 animate-pulse" style={{ animationDelay: '1.5s' }} />

        <div className="container relative pb-16 pt-16 md:pb-24 md:pt-24 lg:pt-28">
          <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">
            {/* Left text */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-300 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-300" />
                </span>
                Circular Economy Marketplace
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-6 max-w-2xl font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl"
              >
                Every kilogram counts.{" "}
                <br className="hidden sm:block" />
                <span className="font-serif italic text-emerald-200">
                  Map. Recycle. Earn.
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg lg:text-xl"
              >
                Connect waste generators with recyclers and collection centers on a live map.
                Real-time prices, optimized routes, and verified impact.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-col gap-3 sm:flex-row lg:justify-start justify-center"
              >
                <Link href="/register">
                  <Button size="lg" className="gap-2 rounded-full bg-white px-8 text-emerald-800 font-bold shadow-xl shadow-black/15 hover:bg-emerald-50">
                    Start Recycling
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="rounded-full border-white/30 px-8 text-white hover:bg-white/10 hover:text-white">
                    I have an account
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right — app preview card */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative flex-shrink-0"
            >
              <div className="relative rounded-3xl border border-white/20 bg-white/10 p-3 shadow-2xl backdrop-blur-xl" style={{ width: 300 }}>
                <div className="rounded-2xl bg-white p-4 shadow-inner">
                  {/* Mock app UI */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Leaf className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 w-16 rounded bg-gray-200" />
                      <div className="mt-1 h-2 w-10 rounded bg-gray-100" />
                    </div>
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
                      <MapPin className="h-3 w-3 text-emerald-600" />
                    </div>
                  </div>
                  {/* Map mockup */}
                  <div className="relative mb-3 h-36 rounded-xl bg-gradient-to-br from-emerald-100 via-teal-50 to-blue-50 overflow-hidden">
                    <div className="absolute inset-0 opacity-30" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cpath d='M0 0h100v100H0z' fill='%2322c55e' fill-opacity='.03'/%3E%3Cpath d='M20 20h1v60h-1zM40 20h1v60h-1zM60 20h1v60h-1zM80 20h1v60h-1zM20 20v1h60v-1zM20 40v1h60v-1zM20 60v1h60v-1zM20 80v1h60v-1z' fill='%2322c55e' fill-opacity='.15'/%3E%3C/svg%3E")`,
                    }} />
                    {/* Map pins */}
                    <div className="absolute top-6 left-8 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow-lg" />
                    <div className="absolute top-14 left-16 h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
                    <div className="absolute top-10 right-12 h-4 w-4 rounded-full bg-amber-500 border-2 border-white shadow-lg" />
                    <div className="absolute bottom-8 left-1/2 h-5 w-5 rounded-full bg-violet-500 border-2 border-white shadow-lg" />
                    <div className="absolute top-20 right-8 h-3.5 w-3.5 rounded-full bg-rose-500 border-2 border-white shadow-lg" />
                    {/* Route line mockup */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 260 144">
                      <path d="M40 30 L76 62 L130 76 L200 48" fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />
                    </svg>
                  </div>
                  {/* Mini cards */}
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg bg-emerald-50 p-2 text-center">
                      <div className="text-xs font-bold text-emerald-700">48.5t</div>
                      <div className="text-[9px] text-emerald-500">Recycled</div>
                    </div>
                    <div className="flex-1 rounded-lg bg-blue-50 p-2 text-center">
                      <div className="text-xs font-bold text-blue-700">12</div>
                      <div className="text-[9px] text-blue-500">Centers</div>
                    </div>
                    <div className="flex-1 rounded-lg bg-amber-50 p-2 text-center">
                      <div className="text-xs font-bold text-amber-700">$22/kg</div>
                      <div className="text-[9px] text-amber-500">Aluminum</div>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -right-4 -top-4 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                  +5 EcoPoints ⭐
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats row — colored cards on the green hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-14 grid w-full grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.55 + i * 0.08 }}
                className={`rounded-2xl ${stat.bg} p-4 text-center shadow-lg`}
              >
                <stat.icon className={`mx-auto mb-1.5 h-5 w-5 ${stat.iconColor}`} />
                <p className={`font-display text-xl font-bold sm:text-2xl ${stat.color}`}>{stat.value}</p>
                <p className="text-[11px] text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BANNER — Full width photo banner with green overlay
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-16 lg:py-20">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="container relative flex flex-col items-center gap-6 text-center text-white md:flex-row md:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-xl backdrop-blur-sm">
            <Recycle className="h-10 w-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Closing the loop — from waste to <span className="font-serif italic text-emerald-200">food</span>
            </h2>
            <p className="mt-2 max-w-2xl text-white/70">
              Your cardboard becomes food packaging. Your PET becomes greenhouse fiber.
              Your banana peels become compost that grows next week&apos;s harvest.
            </p>
          </div>
          <Link href="/register" className="shrink-0">
            <Button size="lg" className="gap-2 rounded-full bg-white px-8 font-bold text-emerald-800 shadow-xl hover:bg-emerald-50">
              Join Now <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — on soft green bg
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 bg-gradient-to-b from-emerald-50/80 via-background to-background dark:from-emerald-950/20 lg:py-32">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
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
                {/* Colored top bar glow */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient}`} />
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

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS — DARK GREEN SECTION (not slate)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2322c55e' stroke-width='1'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Ccircle cx='40' cy='40' r='15'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="absolute -left-20 top-0 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-[120px]" />
          <div className="absolute right-0 bottom-0 h-[350px] w-[350px] rounded-full bg-teal-500/10 blur-[100px]" />
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
              <span className="font-serif italic text-emerald-300">simple</span>{" "}
              steps
            </h2>
            <p className="mt-4 text-emerald-200/50 lg:text-lg">
              From listing to earning — the full flow in minutes.
            </p>
          </motion.div>

          <div className="relative mt-16 flex flex-col items-center gap-6 lg:mt-20">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex w-full max-w-xl items-center gap-5 rounded-2xl border border-emerald-800/50 bg-emerald-900/40 p-5 backdrop-blur-sm transition-all hover:border-emerald-700/60 hover:bg-emerald-900/60"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${step.color} ring-4 ${step.ring} shadow-lg transition-transform group-hover:scale-110`}>
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">{step.num}</span>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-0.5 text-sm text-emerald-200/40">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          BANNER 2 — Circular economy visual strip
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 py-12 lg:py-16">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 5A25 25 0 1 1 5 30' fill='none' stroke='%23fff' stroke-width='1.5'/%3E%3C/svg%3E")`,
        }} />
        <div className="container relative">
          <div className="flex items-center justify-center gap-4 overflow-x-auto py-2 text-white sm:gap-8">
            {[
              { emoji: "🏠", label: "Your Home" },
              { emoji: "📱", label: "ReciMap" },
              { emoji: "🚛", label: "Pickup" },
              { emoji: "🏭", label: "Center" },
              { emoji: "🌿", label: "Compost" },
              { emoji: "🌾", label: "Crops" },
              { emoji: "🍎", label: "Food" },
              { emoji: "🏠", label: "Your Home" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-6 shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-2xl sm:text-3xl">{item.emoji}</span>
                  <span className="text-[10px] sm:text-xs font-semibold text-white/70">{item.label}</span>
                </div>
                {i < 7 && (
                  <ArrowRight className="h-4 w-4 text-white/40 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          IMPACT SECTION — on light green
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 bg-gradient-to-b from-background via-emerald-50/50 to-background dark:via-emerald-950/10 lg:py-32">
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

      {/* ═══════════════════════════════════════════════════════
          ROLES — Gradient colored cards
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32">
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
              { icon: Users, title: "Households", desc: "List your recyclables, earn EcoPoints, and measure your environmental impact.", gradient: "from-emerald-500 to-teal-600" },
              { icon: Recycle, title: "Businesses", desc: "Get rid of cardboard, oil, and waste. Schedule pickups easily.", gradient: "from-blue-500 to-indigo-600" },
              { icon: Truck, title: "Recyclers", desc: "Claim batches, follow optimized routes, and earn per delivery.", gradient: "from-amber-500 to-orange-600" },
              { icon: MapPin, title: "Centers", desc: "Publish prices, receive materials, and manage transactions.", gradient: "from-violet-500 to-purple-600" },
            ].map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${role.gradient} p-6 text-center text-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl`}
              >
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                <div className="relative">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 shadow-lg transition-transform group-hover:scale-110">
                    <role.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold">{role.title}</h3>
                  <p className="mt-2 text-sm text-white/75">{role.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          QUOTE — Green banner
          ═══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 py-20 text-white lg:py-28">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />
        <div className="container relative">
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
            <blockquote className="font-serif text-2xl italic leading-relaxed text-white/90 sm:text-3xl lg:text-4xl">
              &ldquo;Tu basura de hoy es la{" "}
              <span className="not-italic font-bold text-emerald-200">
                comida de mañana
              </span>
              &rdquo;
            </blockquote>
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-bold shadow-lg backdrop-blur-sm">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold">Household Circular Systems</p>
                <p className="text-xs text-white/50">ReciMap &bull; Invent for the Planet 2026</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          CTA — with strong visual presence
          ═══════════════════════════════════════════════════════ */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/50 dark:bg-emerald-900/15 blur-[150px]" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container"
        >
          <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-10 text-center text-white shadow-2xl sm:p-14 lg:p-20">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 shadow-xl backdrop-blur-sm">
              <Leaf className="h-8 w-8 text-white" />
            </div>
            <h2 className="font-display text-3xl font-bold lg:text-4xl xl:text-5xl">
              Ready to make an{" "}
              <span className="font-serif italic text-emerald-200">impact</span>?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/65 lg:text-lg">
              Join the circular economy. Whether you generate waste, collect it, or process it — ReciMap connects you.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="gap-2 rounded-full bg-white px-8 font-bold text-emerald-800 shadow-xl hover:bg-emerald-50">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="rounded-full border-white/30 px-8 text-white hover:bg-white/10 hover:text-white">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 py-8">
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
