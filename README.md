# ReciMap — Circular Materials Marketplace

> **Invent for the Planet 2026** | Team SamurAi | Universidad Politecnica de Yucatan

ReciMap connects waste generators, independent recyclers, and collection centers on a live map — creating an efficient marketplace for recyclable materials in Mexico.

## The Problem

Mexico generates **120,000 tons of waste daily**. Only **5% is formally recycled**. The issue isn't that nobody recycles — it's that there's no efficient way to connect supply with demand. Generators throw away valuable materials, recyclers walk blind, and centers operate at half capacity.

## The Solution

A three-sided marketplace where:
- **Generators** (businesses, households) list recyclable materials
- **Recyclers** pick them up using AI-optimized routes
- **Centers** buy at transparent market prices

Revenue model: **60/25/15 split** (recycler / generator / platform) on every transaction.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: PostgreSQL (Neon) + Drizzle ORM
- **Auth**: NextAuth v5 (credentials + JWT)
- **Maps**: Google Maps Platform (markers, routes, geolocation)
- **AI**: OpenAI GPT-4o-mini (photo-based material classification)
- **Real-time**: Ably WebSocket (live listing updates, notifications)
- **Route Optimization**: Custom TSP solver (Haversine + nearest-neighbor + 2-opt)
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion + Lucide icons
- **State**: Zustand + TanStack Query
- **Deploy**: Vercel

## Features

- Interactive map with all listings, centers, and real-time prices
- AI material classification from photos (GPT-4o-mini vision)
- Smart Route Builder with TSP optimization (20-35% distance savings)
- Per-stop pickup flow with photo proof at every stage
- Delivery + payout system with 60/25/15 automated split
- EcoPoints wallet with rewards catalog
- Center dashboard with analytics
- Real-time notifications via WebSocket
- PWA-ready (works offline, minimal data usage)
- Light/dark mode

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your API keys
npm run db:push               # push schema to database
npm run db:seed               # seed demo data
npm run dev                   # start dev server
```

## Demo Accounts

All passwords: `demo123`

| Role | Email |
|------|-------|
| Business | restaurant@demo.com |
| Household | maria@demo.com |
| Recycler | recycler@demo.com |
| Center | center@demo.com |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for JWT signing |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API key |
| `ABLY_API_KEY` | Ably server-side API key |
| `NEXT_PUBLIC_ABLY_KEY` | Ably client-side API key |
| `OPENAI_API_KEY` | OpenAI API key for material classification |

## Architecture

```
app/
  (app)/          # Authenticated app pages (map, listings, batches, wallet, etc.)
  api/            # 16 API routes (listings, batches, centers, transactions, etc.)
components/       # Reusable UI components (app-shell, ai-scanner, etc.)
lib/              # Core utilities (db, auth, ably, store, validations)
```

## SDG Impact

- **SDG 12** — Responsible Consumption: Divert recyclables from landfills
- **SDG 8** — Decent Work: Formalize income for 500k+ informal recyclers
- **SDG 6** — Clean Water: Protect Yucatan's karstic aquifer from leachate

---

Built in 48 hours at Invent for the Planet 2026.
