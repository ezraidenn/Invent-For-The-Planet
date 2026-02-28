import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { centerPrices, priceHistory, transactions, listings } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";

// Simple linear regression for price prediction
function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y || 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return { slope: isNaN(slope) ? 0 : slope, intercept: isNaN(intercept) ? 0 : intercept };
}

export async function GET() {
  try {
    // 1. Get all current prices across all centers
    const allPrices = await db.select().from(centerPrices);

    // 2. Get price history for trends
    const history = await db
      .select()
      .from(priceHistory)
      .orderBy(desc(priceHistory.recordedAt));

    // 3. Get transaction stats
    const txStats = await db
      .select({
        totalTx: sql<number>`count(*)`,
        totalKg: sql<number>`coalesce(sum(${transactions.totalKg}), 0)`,
        totalAmount: sql<number>`coalesce(sum(${transactions.totalAmount}), 0)`,
      })
      .from(transactions);

    // 4. Get listing stats by material
    const listingStats = await db
      .select({
        materialType: listings.materialType,
        count: sql<number>`count(*)`,
        totalKg: sql<number>`coalesce(sum(${listings.estimatedKg}), 0)`,
      })
      .from(listings)
      .groupBy(listings.materialType);

    // 5. Build price comparison across centers (best price per material)
    const priceMap: Record<string, { centerName: string; centerId: string; price: number }[]> = {};
    for (const p of allPrices) {
      if (p.pricePerKg > 0) {
        const mat = p.materialType;
        if (!priceMap[mat]) priceMap[mat] = [];
        priceMap[mat].push({
          centerName: "",
          centerId: p.centerId,
          price: Number(p.pricePerKg),
        });
      }
    }

    // 6. Build price predictions (7-day forecast per material)
    const materialHistory: Record<string, { date: string; price: number }[]> = {};
    for (const h of history) {
      const mat = h.materialType;
      if (!mat) continue;
      if (!materialHistory[mat]) materialHistory[mat] = [];
      materialHistory[mat].push({
        date: new Date(h.recordedAt!).toISOString().split("T")[0],
        price: Number(h.pricePerKg),
      });
    }

    const predictions: Record<string, { historical: { date: string; price: number }[]; forecast: { date: string; price: number }[]; trend: string; confidence: number }> = {};

    for (const [mat, hist] of Object.entries(materialHistory)) {
      // Sort by date ascending
      const sorted = hist.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Build regression points
      const points = sorted.map((h, i) => ({ x: i, y: h.price }));
      const { slope, intercept } = linearRegression(points);

      // Generate 7-day forecast
      const lastDate = sorted.length > 0 ? new Date(sorted[sorted.length - 1].date) : new Date();
      const forecast: { date: string; price: number }[] = [];
      for (let d = 1; d <= 7; d++) {
        const futureDate = new Date(lastDate);
        futureDate.setDate(futureDate.getDate() + d);
        const predictedPrice = Math.max(0.1, slope * (points.length + d - 1) + intercept);
        forecast.push({
          date: futureDate.toISOString().split("T")[0],
          price: Math.round(predictedPrice * 100) / 100,
        });
      }

      // Determine trend
      const trend = slope > 0.05 ? "rising" : slope < -0.05 ? "falling" : "stable";

      // Confidence based on data points available
      const confidence = Math.min(95, 40 + sorted.length * 8);

      predictions[mat] = {
        historical: sorted,
        forecast,
        trend,
        confidence,
      };
    }

    // 7. Material demand ranking
    const demandRanking = listingStats
      .map((ls) => ({
        material: ls.materialType,
        listings: Number(ls.count),
        totalKg: Number(ls.totalKg),
      }))
      .sort((a, b) => b.totalKg - a.totalKg);

    // 8. Best price per material
    const bestPrices: Record<string, { price: number; centerId: string }> = {};
    for (const [mat, entries] of Object.entries(priceMap)) {
      const best = entries.sort((a, b) => b.price - a.price)[0];
      if (best) bestPrices[mat] = { price: best.price, centerId: best.centerId };
    }

    return NextResponse.json({
      overview: {
        totalTransactions: Number(txStats[0]?.totalTx || 0),
        totalKgProcessed: Number(txStats[0]?.totalKg || 0),
        totalRevenue: Number(txStats[0]?.totalAmount || 0),
        activeMaterials: Object.keys(priceMap).length,
      },
      predictions,
      demandRanking,
      bestPrices,
      priceComparison: priceMap,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
