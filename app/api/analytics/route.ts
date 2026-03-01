import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { centerPrices, priceHistory, transactions, listings } from "@/lib/db/schema";
import { desc, sql, gte } from "drizzle-orm";

// ══════════════════════════════════════════════════════════════
// Advanced Financial Models — Crypto-grade analytics engine
// ══════════════════════════════════════════════════════════════

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0 };
  let sX = 0, sY = 0, sXY = 0, sX2 = 0;
  for (const p of points) { sX += p.x; sY += p.y; sXY += p.x * p.y; sX2 += p.x * p.x; }
  const slope = (n * sXY - sX * sY) / (n * sX2 - sX * sX);
  const intercept = (sY - slope * sX) / n;
  return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept };
}

function calcEMA(prices: number[], period: number): number[] {
  if (!prices.length) return [];
  const k = 2 / (period + 1);
  const ema = [prices[0]];
  for (let i = 1; i < prices.length; i++) ema.push(prices[i] * k + ema[i - 1] * (1 - k));
  return ema.map(v => Math.round(v * 100) / 100);
}

function calcSMA(prices: number[], period: number): (number | null)[] {
  return prices.map((_, i) => {
    if (i < period - 1) return null;
    const s = prices.slice(i - period + 1, i + 1);
    return Math.round((s.reduce((a, b) => a + b, 0) / period) * 100) / 100;
  });
}

function calcBollinger(prices: number[], period: number = 20) {
  const p = Math.min(period, Math.max(2, Math.floor(prices.length / 2)));
  const sma = calcSMA(prices, p);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (sma[i] === null) { upper.push(null); lower.push(null); continue; }
    const sl = prices.slice(Math.max(0, i - p + 1), i + 1);
    const mean = sma[i]!;
    const std = Math.sqrt(sl.reduce((s, v) => s + (v - mean) ** 2, 0) / sl.length);
    upper.push(Math.round((mean + 2 * std) * 100) / 100);
    lower.push(Math.round((mean - 2 * std) * 100) / 100);
  }
  return { sma, upper, lower };
}

function calcRSI(prices: number[], period: number = 14): (number | null)[] {
  const p = Math.min(period, Math.max(2, Math.floor(prices.length / 2)));
  if (prices.length < p + 1) return prices.map(() => null);
  const rsi: (number | null)[] = [];
  let gains = 0, losses = 0;
  for (let i = 1; i <= p; i++) {
    const d = prices[i] - prices[i - 1];
    if (d > 0) gains += d; else losses -= d;
  }
  for (let i = 0; i < p; i++) rsi.push(null);
  let aG = gains / p, aL = losses / p;
  rsi.push(Math.round(100 - 100 / (1 + (aL === 0 ? 100 : aG / aL))));
  for (let i = p + 1; i < prices.length; i++) {
    const d = prices[i] - prices[i - 1];
    aG = (aG * (p - 1) + (d > 0 ? d : 0)) / p;
    aL = (aL * (p - 1) + (d < 0 ? -d : 0)) / p;
    rsi.push(Math.round(100 - 100 / (1 + (aL === 0 ? 100 : aG / aL))));
  }
  return rsi;
}

function calcMACD(prices: number[]) {
  const ema12 = calcEMA(prices, 12);
  const ema26 = calcEMA(prices, 26);
  const macdLine = ema12.map((v, i) => Math.round((v - ema26[i]) * 100) / 100);
  const signal = calcEMA(macdLine, 9);
  const histogram = macdLine.map((v, i) => Math.round((v - signal[i]) * 100) / 100);
  return { macdLine, signal, histogram };
}

function buildCandlesticks(records: { date: string; price: number }[]) {
  const byDate: Record<string, number[]> = {};
  for (const r of records) { if (!byDate[r.date]) byDate[r.date] = []; byDate[r.date].push(r.price); }
  return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, p]) => ({
    date,
    open: p[0],
    high: Math.max(...p),
    low: Math.min(...p),
    close: p[p.length - 1],
    volume: p.length,
  }));
}

function getDateCutoff(range: string): Date {
  const d = new Date();
  switch (range) {
    case "1D": d.setDate(d.getDate() - 1); break;
    case "1W": d.setDate(d.getDate() - 7); break;
    case "1M": d.setMonth(d.getMonth() - 1); break;
    case "3M": d.setMonth(d.getMonth() - 3); break;
    case "6M": d.setMonth(d.getMonth() - 6); break;
    case "1Y": d.setFullYear(d.getFullYear() - 1); break;
    default: d.setMonth(d.getMonth() - 3);
  }
  return d;
}

export async function GET(request: NextRequest) {
  try {
    const range = request.nextUrl.searchParams.get("range") || "3M";
    const cutoff = getDateCutoff(range);

    const allPrices = await db.select().from(centerPrices);
    const history = await db.select().from(priceHistory)
      .where(gte(priceHistory.recordedAt, cutoff))
      .orderBy(desc(priceHistory.recordedAt));

    const txStats = await db.select({
      totalTx: sql<number>`count(*)`,
      totalKg: sql<number>`coalesce(sum(${transactions.totalKg}), 0)`,
      totalAmount: sql<number>`coalesce(sum(${transactions.totalAmount}), 0)`,
    }).from(transactions).where(gte(transactions.createdAt, cutoff));

    const listingStats = await db.select({
      materialType: listings.materialType,
      count: sql<number>`count(*)`,
      totalKg: sql<number>`coalesce(sum(${listings.estimatedKg}), 0)`,
    }).from(listings).where(gte(listings.createdAt, cutoff)).groupBy(listings.materialType);

    // Best price per material
    const priceMap: Record<string, { centerId: string; price: number }[]> = {};
    for (const p of allPrices) {
      if (p.pricePerKg > 0) {
        const m = p.materialType;
        if (!priceMap[m]) priceMap[m] = [];
        priceMap[m].push({ centerId: p.centerId, price: Number(p.pricePerKg) });
      }
    }

    // Group history by material → daily averages
    const matHist: Record<string, { date: string; price: number }[]> = {};
    for (const h of history) {
      const m = h.materialType;
      if (!m) continue;
      if (!matHist[m]) matHist[m] = [];
      matHist[m].push({ date: new Date(h.recordedAt!).toISOString().split("T")[0], price: Number(h.pricePerKg) });
    }

    // Build advanced analytics per material
    const materials: Record<string, any> = {};

    for (const [mat, rawHist] of Object.entries(matHist)) {
      // Daily averages
      const byDate: Record<string, number[]> = {};
      for (const h of rawHist) {
        if (!byDate[h.date]) byDate[h.date] = [];
        byDate[h.date].push(h.price);
      }
      const daily = Object.entries(byDate)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, ps]) => ({
          date,
          price: Math.round((ps.reduce((a, b) => a + b, 0) / ps.length) * 100) / 100,
        }));

      if (daily.length < 3) continue;

      const closes = daily.map(d => d.price);

      // Technical indicators
      const ema7 = calcEMA(closes, 7);
      const ema21 = calcEMA(closes, 21);
      const bollinger = calcBollinger(closes);
      const rsi = calcRSI(closes);
      const macd = calcMACD(closes);
      const candles = buildCandlesticks(rawHist);

      // Forecast (7 days via regression)
      const pts = daily.map((h, i) => ({ x: i, y: h.price }));
      const { slope, intercept } = linearRegression(pts);
      const lastDate = new Date(daily[daily.length - 1].date);
      const lastBB = bollinger.upper[bollinger.upper.length - 1];
      const lastBBL = bollinger.lower[bollinger.lower.length - 1];
      const bbWidth = (lastBB && lastBBL) ? (lastBB - lastBBL) / 2 : closes[closes.length - 1] * 0.05;

      const forecast: { date: string; price: number; upper: number; lower: number }[] = [];
      for (let d = 1; d <= 7; d++) {
        const fd = new Date(lastDate);
        fd.setDate(fd.getDate() + d);
        const predicted = Math.max(0.1, slope * (pts.length + d - 1) + intercept);
        const uncertainty = bbWidth * (1 + d * 0.15);
        forecast.push({
          date: fd.toISOString().split("T")[0],
          price: Math.round(predicted * 100) / 100,
          upper: Math.round((predicted + uncertainty) * 100) / 100,
          lower: Math.round(Math.max(0.01, predicted - uncertainty) * 100) / 100,
        });
      }

      const trend = slope > 0.05 ? "rising" : slope < -0.05 ? "falling" : "stable";
      const confidence = Math.min(95, 40 + daily.length * 2);
      const lastRSI = rsi.filter(v => v !== null).pop() || 50;
      const signal = (lastRSI as number) > 70 ? "overbought" : (lastRSI as number) < 30 ? "oversold" : "neutral";

      // % change
      const firstPrice = closes[0];
      const lastPrice = closes[closes.length - 1];
      const pctChange = firstPrice > 0 ? Math.round(((lastPrice - firstPrice) / firstPrice) * 10000) / 100 : 0;

      materials[mat] = {
        daily,
        candles,
        forecast,
        indicators: {
          ema7: daily.map((d, i) => ({ date: d.date, value: ema7[i] })),
          ema21: daily.map((d, i) => ({ date: d.date, value: ema21[i] })),
          bollinger: daily.map((d, i) => ({
            date: d.date,
            sma: bollinger.sma[i],
            upper: bollinger.upper[i],
            lower: bollinger.lower[i],
          })),
          rsi: daily.map((d, i) => ({ date: d.date, value: rsi[i] })),
          macd: daily.map((d, i) => ({
            date: d.date,
            macd: macd.macdLine[i],
            signal: macd.signal[i],
            histogram: macd.histogram[i],
          })),
        },
        trend,
        confidence,
        signal,
        pctChange,
        currentPrice: lastPrice,
        high: Math.max(...closes),
        low: Math.min(...closes),
      };
    }

    // Demand ranking
    const demandRanking = listingStats
      .map(ls => ({ material: ls.materialType, listings: Number(ls.count), totalKg: Number(ls.totalKg) }))
      .sort((a, b) => b.totalKg - a.totalKg);

    // Best prices
    const bestPrices: Record<string, { price: number; centerId: string }> = {};
    for (const [mat, entries] of Object.entries(priceMap)) {
      const best = entries.sort((a, b) => b.price - a.price)[0];
      if (best) bestPrices[mat] = { price: best.price, centerId: best.centerId };
    }

    return NextResponse.json({
      range,
      overview: {
        totalTransactions: Number(txStats[0]?.totalTx || 0),
        totalKgProcessed: Number(txStats[0]?.totalKg || 0),
        totalRevenue: Number(txStats[0]?.totalAmount || 0),
        activeMaterials: Object.keys(priceMap).length,
      },
      materials,
      demandRanking,
      bestPrices,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
