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
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: MapPin,
    title: "Live Map",
    description: "Interactive map with material pins, collection centers, and real-time prices across your city.",
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800 hover:border-emerald-400",
  },
  {
    icon: Route,
    title: "Optimized Routes",
    description: "Graph-based algorithm groups nearby pickups into optimal routes. Save time, fuel, and CO\u2082.",
    gradient: "from-teal-500 to-cyan-500",
    bg: "bg-teal-50 dark:bg-teal-950/30",
    border: "border-teal-200 dark:border-teal-800 hover:border-teal-400",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Prices",
    description: "Centers publish prices per kg in MXN. Compare across centers instantly and sell at the best price.",
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800 hover:border-amber-400",
  },
  {
    icon: Brain,
    title: "AI Classifier",
    description: "Take a photo and our AI classifies the material and estimates weight automatically with GPT-4o.",
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800 hover:border-violet-400",
  },
  {
    icon: BarChart3,
    title: "Predictive Analytics",
    description: "Linear regression predicts price trends. Premium demand and comparison charts.",
    gradient: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800 hover:border-blue-400",
  },
  {
    icon: Award,
    title: "EcoPoints & Rewards",
    description: "Earn points for every kg recycled. Level up and redeem for real rewards.",
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-pink-50 dark:bg-pink-950/30",
    border: "border-pink-200 dark:border-pink-800 hover:border-pink-400",
  },
];

const steps = [
  { num: "01", title: "List your materials", desc: "Take a photo \u2014 AI classifies it. Set weight and price.", icon: Camera, color: "from-emerald-500 to-green-600" },
  { num: "02", title: "Smart grouping", desc: "Nearby pickups are grouped into optimized routes.", icon: Recycle, color: "from-teal-500 to-cyan-600" },
  { num: "03", title: "Pickup & delivery", desc: "Recyclers follow guided routes. Centers verify materials.", icon: Truck, color: "from-blue-500 to-indigo-600" },
  { num: "04", title: "Earn & track impact", desc: "Get paid fairly. Track your CO\u2082 savings and EcoPoints.", icon: TrendingUp, color: "from-violet-500 to-purple-600" },
];

const stats = [
  { value: "48,500+", label: "Kg Recycled", icon: Recycle },
  { value: "12", label: "Collection Centers", icon: MapPin },
  { value: "10+", label: "Material Types", icon: BarChart3 },
  { value: "121+", label: "Tons CO\u2082 Avoided", icon: Globe },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-background">
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
        {/* Decorative background blobs — colorful greens on white */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-40 -top-20 h-[600px] w-[600px] rounded-full bg-emerald-100/70 dark:bg-emerald-900/20 blur-[120px]" />
          <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-teal-100/60 dark:bg-teal-900/15 blur-[120px]" />
          <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-cyan-50/80 dark:bg-cyan-900/10 blur-[100px]" />
          {/* Subtle green grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "linear-gradient(rgba(16,185,129,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.4) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          {/* Floating leaf accents */}
          <div className="absolute left-[10%] top-[15%] h-3 w-3 rounded-full bg-emerald-400/30" />
          <div className="absolute right-[15%] top-[25%] h-4 w-4 rounded-full bg-teal-400/25" />
          <div className="absolute left-[25%] bottom-[20%] h-5 w-5 rounded-full bg-green-400/20" />
          <div className="absolute right-[30%] bottom-[15%] h-2 w-2 rounded-full bg-emerald-500/35" />
          <div className="absolute left-[60%] top-[10%] h-6 w-6 rounded-full bg-teal-300/20" />
        </div>

        <div className="container flex flex-col items-center gap-8 pb-20 pt-20 text-center md:pb-28 md:pt-28 lg:pt-36">
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

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl font-display text-4xl font-extrabold tracking-tight text-balance text-foreground sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Every kilogram counts.{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
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

          {/* Stats row */}
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
                className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-background/80 p-4 text-center shadow-sm backdrop-blur-sm"
              >
                <stat.icon className="mx-auto mb-2 h-5 w-5 text-emerald-600" />
                <p className="font-display text-xl font-bold text-foreground sm:text-2xl">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute right-0 top-1/2 -z-10 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-emerald-50 dark:bg-emerald-950/20 blur-[120px]" />
        <div className="absolute left-0 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-teal-50 dark:bg-teal-950/15 blur-[100px]" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-600">Platform</span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl">
              Everything you need for{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">circular materials</span>
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
                className={`group relative overflow-hidden rounded-2xl border ${feature.border} ${feature.bg} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:p-8`}
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-[0.15] blur-3xl transition-opacity group-hover:opacity-[0.25]" />
                <div className={`relative mb-4 inline-flex rounded-xl bg-gradient-to-br ${feature.gradient} p-2.5 shadow-lg`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="relative font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50/50 dark:from-emerald-950/10 via-transparent to-transparent" />
        <div className="absolute left-0 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-green-50 dark:bg-green-950/15 blur-[120px]" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-600">Process</span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl">
              Four simple steps
            </h2>
            <p className="mt-4 text-muted-foreground lg:text-lg">
              From listing to earning — the full flow in minutes.
            </p>
          </motion.div>

          <div className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4">
            {/* Connector line */}
            <div className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-emerald-300 to-transparent lg:block" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative text-center"
              >
                <div className="relative z-10 mx-auto mb-5 flex h-[68px] w-[68px] items-center justify-center rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-background shadow-lg shadow-emerald-100 dark:shadow-emerald-900/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-emerald-400 group-hover:shadow-xl group-hover:shadow-emerald-200/50">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color}`}>
                    <step.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-emerald-500">{step.num}</span>
                <h3 className="font-display text-base font-semibold text-foreground lg:text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Impact Section ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-emerald-50/40 dark:via-emerald-950/10 to-transparent" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-600">Impact</span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl xl:text-5xl">
              Real, measurable{" "}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">environmental impact</span>
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: TreePine, value: "824", label: "Trees Saved", sub: "~17 per ton recycled", card: "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 hover:shadow-emerald-200/50", iconBg: "from-emerald-500 to-emerald-600", labelColor: "text-emerald-700 dark:text-emerald-400", valueColor: "text-emerald-900 dark:text-emerald-200" },
              { icon: Droplets, value: "169,750L", label: "Water Saved", sub: "~3.5L per kg", card: "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 hover:shadow-blue-200/50", iconBg: "from-blue-500 to-blue-600", labelColor: "text-blue-700 dark:text-blue-400", valueColor: "text-blue-900 dark:text-blue-200" },
              { icon: Zap, value: "116,400 kWh", label: "Energy Conserved", sub: "~2.4 kWh per kg", card: "border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 hover:shadow-amber-200/50", iconBg: "from-amber-500 to-amber-600", labelColor: "text-amber-700 dark:text-amber-400", valueColor: "text-amber-900 dark:text-amber-200" },
              { icon: Shield, value: "48.5t", label: "Landfill Avoided", sub: "digitally verified", card: "border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 hover:shadow-purple-200/50", iconBg: "from-purple-500 to-purple-600", labelColor: "text-purple-700 dark:text-purple-400", valueColor: "text-purple-900 dark:text-purple-200" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={`group rounded-2xl border p-6 text-center transition-all hover:-translate-y-1 hover:shadow-lg ${item.card}`}
              >
                <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.iconBg} shadow-lg`}>
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

      {/* ─── Roles Section ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-teal-50/30 dark:via-teal-950/10 to-transparent" />
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <span className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-600">Roles</span>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              Who can use ReciMap?
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, title: "Households", desc: "List your recyclables, earn EcoPoints, and measure your environmental impact.", gradient: "from-emerald-500 to-green-600" },
              { icon: Recycle, title: "Businesses", desc: "Get rid of cardboard, oil, and waste. Schedule pickups easily.", gradient: "from-teal-500 to-cyan-600" },
              { icon: Truck, title: "Recyclers", desc: "Claim batches, follow optimized routes, and earn per delivery.", gradient: "from-blue-500 to-indigo-600" },
              { icon: MapPin, title: "Collection Centers", desc: "Publish prices, receive materials, and manage transactions.", gradient: "from-violet-500 to-purple-600" },
            ].map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-lg hover:shadow-emerald-100/50 dark:hover:shadow-emerald-900/20"
              >
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} shadow-lg transition-transform group-hover:scale-110`}>
                  <role.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{role.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{role.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-24 lg:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-emerald-50/50 dark:via-emerald-950/10 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/60 dark:bg-emerald-900/15 blur-[150px]" />

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
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">impact</span>?
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
            Built for Invent for the Planet &bull; Universidad Polit&eacute;cnica de Yucat&aacute;n
          </p>
        </div>
      </footer>
    </div>
  );
}
