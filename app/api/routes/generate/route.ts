import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listings, centers, users } from "@/lib/db/schema";
import { eq, and, inArray, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth";

// ══════════════════════════════════════════════════════════════════════
// Smart Route Generator — Graph-based route planning with constraints
// ══════════════════════════════════════════════════════════════════════
// Given the recycler's current location, material preferences, capacity
// limits, and available time, this endpoint:
// 1. Fetches all available (scheduled) listings matching filters
// 2. Scores each listing by proximity, weight efficiency, pricing
// 3. Builds a candidate set respecting maxKg and time constraints
// 4. Optimizes the route order via nearest-neighbor + 2-opt
// 5. Returns the optimized route with predictions (stops, kg, time, earnings)

// ─── Constants ──────────────────────────────────────────────────────
const AVG_URBAN_SPEED_KMH = 25; // Mérida urban average
const AVG_STOP_TIME_MIN = 8;    // Average time at each stop (park, weigh, photo, load)
const FUEL_COST_PER_KM = 2.5;   // MXN estimated
const DEFAULT_MAX_KG = 500;
const DEFAULT_MAX_HOURS = 4;
const MAX_LISTINGS_SCAN = 300;

// ─── Haversine distance (km) ────────────────────────────────────────
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function drivingMinutes(distKm: number): number {
  return (distKm / AVG_URBAN_SPEED_KMH) * 60;
}

// ─── Scoring function ───────────────────────────────────────────────
// Higher score = more attractive stop
interface ScoredListing {
  id: string;
  lat: number;
  lng: number;
  materialType: string;
  estimatedKg: number;
  pricingMode: string;
  pricePerKg: number | null;
  address: string | null;
  userName: string;
  userId: string;
  distanceKm: number;
  score: number;
}

function scoreListing(
  listing: any,
  originLat: number,
  originLng: number,
  preferredMaterials: string[],
): ScoredListing {
  const dist = haversine(originLat, originLng, listing.latitude, listing.longitude);
  const kg = listing.estimatedKg || 0;

  // Base score: kg per km of distance (weight efficiency)
  let score = kg / Math.max(dist, 0.1);

  // Proximity bonus — closer stops are cheaper to reach
  if (dist < 2) score *= 1.8;
  else if (dist < 5) score *= 1.4;
  else if (dist < 10) score *= 1.1;

  // Material preference bonus
  if (preferredMaterials.length > 0 && preferredMaterials.includes(listing.materialType)) {
    score *= 2.0;
  }

  // Free material bonus (no cost to recycler)
  if (listing.pricingMode === "free") {
    score *= 1.5;
  }

  // High-volume bonus
  if (kg >= 50) score *= 1.3;
  else if (kg >= 20) score *= 1.15;

  return {
    id: listing.id,
    lat: Number(listing.latitude),
    lng: Number(listing.longitude),
    materialType: listing.materialType,
    estimatedKg: kg,
    pricingMode: listing.pricingMode,
    pricePerKg: listing.pricePerKg,
    address: listing.address,
    userName: listing.userName || "Unknown",
    userId: listing.userId,
    distanceKm: Math.round(dist * 100) / 100,
    score: Math.round(score * 100) / 100,
  };
}

// ─── Greedy route builder with constraints ──────────────────────────
// Selects stops one-by-one, always picking the best reachable next stop
// while respecting kg and time limits
interface RouteStop {
  id: string;
  listingId: string;
  lat: number;
  lng: number;
  materialType: string;
  estimatedKg: number;
  pricingMode: string;
  pricePerKg: number | null;
  address: string | null;
  userName: string;
  userId: string;
  order: number;
  segmentKm: number;
  segmentMin: number;
  cumulativeKm: number;
  cumulativeMin: number;
  cumulativeKg: number;
}

function buildConstrainedRoute(
  candidates: ScoredListing[],
  originLat: number,
  originLng: number,
  maxKg: number,
  maxMinutes: number,
  nearestCenterDist: number, // km to nearest center from a rough midpoint, used for return estimate
): RouteStop[] {
  const selected: RouteStop[] = [];
  const used = new Set<string>();
  let curLat = originLat;
  let curLng = originLng;
  let totalKm = 0;
  let totalMin = 0;
  let totalKg = 0;

  // Reserve time for return to center (~estimated)
  const returnBufferMin = drivingMinutes(nearestCenterDist) + 10; // 10 min buffer at center

  while (candidates.length > used.size) {
    let bestIdx = -1;
    let bestScore = -1;
    let bestDist = Infinity;

    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      if (used.has(c.id)) continue;

      const dist = haversine(curLat, curLng, c.lat, c.lng);
      const driveMin = drivingMinutes(dist);
      const stopMin = driveMin + AVG_STOP_TIME_MIN;

      // Check constraints
      if (totalKg + c.estimatedKg > maxKg) continue;
      if (totalMin + stopMin + returnBufferMin > maxMinutes) continue;

      // Score = base listing score / distance from current position
      // This prefers high-value nearby stops
      const dynamicScore = c.score / Math.max(dist, 0.05);

      if (dynamicScore > bestScore) {
        bestScore = dynamicScore;
        bestIdx = i;
        bestDist = dist;
      }
    }

    if (bestIdx < 0) break; // No more feasible stops

    const pick = candidates[bestIdx];
    used.add(pick.id);

    const segKm = Math.round(bestDist * 100) / 100;
    const segMin = Math.round(drivingMinutes(bestDist) * 10) / 10;
    totalKm += bestDist;
    totalMin += drivingMinutes(bestDist) + AVG_STOP_TIME_MIN;
    totalKg += pick.estimatedKg;

    selected.push({
      id: `stop-${selected.length + 1}`,
      listingId: pick.id,
      lat: pick.lat,
      lng: pick.lng,
      materialType: pick.materialType,
      estimatedKg: pick.estimatedKg,
      pricingMode: pick.pricingMode,
      pricePerKg: pick.pricePerKg,
      address: pick.address,
      userName: pick.userName,
      userId: pick.userId,
      order: selected.length + 1,
      segmentKm: segKm,
      segmentMin: segMin,
      cumulativeKm: Math.round(totalKm * 100) / 100,
      cumulativeMin: Math.round(totalMin * 10) / 10,
      cumulativeKg: Math.round(totalKg * 10) / 10,
    });

    curLat = pick.lat;
    curLng = pick.lng;
  }

  return selected;
}

// ─── 2-opt improvement on selected route ────────────────────────────
function twoOptImprove(stops: RouteStop[], originLat: number, originLng: number): RouteStop[] {
  if (stops.length <= 2) return stops;

  const dist = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) =>
    haversine(a.lat, a.lng, b.lat, b.lng);

  let best = [...stops];
  const origin = { lat: originLat, lng: originLng };

  const totalDist = (route: RouteStop[]) => {
    let d = dist(origin, route[0]);
    for (let i = 0; i < route.length - 1; i++) d += dist(route[i], route[i + 1]);
    return d;
  };

  let bestDist = totalDist(best);
  let improved = true;
  let iter = 0;

  while (improved && iter < 80) {
    improved = false;
    iter++;
    for (let i = 0; i < best.length - 1; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const candidate = [
          ...best.slice(0, i),
          ...best.slice(i, j + 1).reverse(),
          ...best.slice(j + 1),
        ];
        const candidateDist = totalDist(candidate);
        if (candidateDist < bestDist - 0.001) {
          best = candidate;
          bestDist = candidateDist;
          improved = true;
        }
      }
    }
  }

  // Recalculate cumulative metrics after reorder
  let cumKm = 0;
  let cumMin = 0;
  let cumKg = 0;
  let prevLat = originLat;
  let prevLng = originLng;

  return best.map((stop, idx) => {
    const segDist = haversine(prevLat, prevLng, stop.lat, stop.lng);
    const segDrive = drivingMinutes(segDist);
    cumKm += segDist;
    cumMin += segDrive + AVG_STOP_TIME_MIN;
    cumKg += stop.estimatedKg;
    prevLat = stop.lat;
    prevLng = stop.lng;

    return {
      ...stop,
      order: idx + 1,
      segmentKm: Math.round(segDist * 100) / 100,
      segmentMin: Math.round(segDrive * 10) / 10,
      cumulativeKm: Math.round(cumKm * 100) / 100,
      cumulativeMin: Math.round(cumMin * 10) / 10,
      cumulativeKg: Math.round(cumKg * 10) / 10,
    };
  });
}

// ─── Main endpoint ──────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      lat,             // Recycler's current latitude (required)
      lng,             // Recycler's current longitude (required)
      materials,       // string[] — filter by material types (optional)
      maxKg,           // number — max kg capacity (default 500)
      maxHours,        // number — max hours available (default 4)
      pricingMode,     // "all" | "free" | "for_sale" (default "all")
      radiusKm,        // number — max search radius in km (default 30)
      centerId,        // string — preferred center (optional, auto-selects nearest)
    } = body;

    if (!lat || !lng) {
      return NextResponse.json({ error: "Current location (lat, lng) required" }, { status: 400 });
    }

    const effectiveMaxKg = maxKg || DEFAULT_MAX_KG;
    const effectiveMaxMin = (maxHours || DEFAULT_MAX_HOURS) * 60;
    const effectiveRadius = radiusKm || 30;

    // 1. Fetch all available listings
    const conditions: any[] = [eq(listings.status, "scheduled" as any), isNull(listings.batchId)];
    if (materials?.length) {
      conditions.push(inArray(listings.materialType, materials));
    }

    const allListings = await db
      .select({
        id: listings.id,
        materialType: listings.materialType,
        estimatedKg: listings.estimatedKg,
        pricingMode: listings.pricingMode,
        pricePerKg: listings.pricePerKg,
        latitude: listings.latitude,
        longitude: listings.longitude,
        address: listings.address,
        userId: listings.userId,
        userName: users.name,
      })
      .from(listings)
      .leftJoin(users, eq(listings.userId, users.id))
      .where(and(...conditions))
      .limit(MAX_LISTINGS_SCAN);

    // 2. Filter by pricing mode
    let filtered = allListings;
    if (pricingMode === "free") {
      filtered = filtered.filter(l => l.pricingMode === "free");
    } else if (pricingMode === "for_sale") {
      filtered = filtered.filter(l => l.pricingMode === "for_sale");
    }

    // 3. Filter by radius and score
    const preferredMaterials = materials || [];
    const scored = filtered
      .map(l => scoreListing(l, lat, lng, preferredMaterials))
      .filter(s => s.distanceKm <= effectiveRadius)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      return NextResponse.json({
        stops: [],
        predictions: { totalStops: 0, totalKg: 0, totalDistanceKm: 0, totalTimeMin: 0, estimatedEarnings: 0 },
        message: "No listings found matching your criteria within range",
      });
    }

    // 4. Find nearest center for return estimate
    const allCenters = await db.select().from(centers);
    let targetCenter = centerId
      ? allCenters.find(c => c.id === centerId)
      : null;

    // Auto-select nearest center to midpoint of scored listings
    if (!targetCenter && allCenters.length > 0) {
      const midLat = scored.reduce((s, l) => s + l.lat, lat) / (scored.length + 1);
      const midLng = scored.reduce((s, l) => s + l.lng, lng) / (scored.length + 1);
      let nearest = allCenters[0];
      let nearestDist = Infinity;
      for (const c of allCenters) {
        if (c.latitude && c.longitude) {
          const d = haversine(midLat, midLng, Number(c.latitude), Number(c.longitude));
          if (d < nearestDist) {
            nearestDist = d;
            nearest = c;
          }
        }
      }
      targetCenter = nearest;
    }

    const centerDistKm = targetCenter?.latitude && targetCenter?.longitude
      ? haversine(lat, lng, Number(targetCenter.latitude), Number(targetCenter.longitude))
      : 10; // fallback estimate

    // 5. Build constrained route with greedy selection
    let route = buildConstrainedRoute(scored, lat, lng, effectiveMaxKg, effectiveMaxMin, centerDistKm);

    // 6. Apply 2-opt improvement
    if (route.length >= 3) {
      route = twoOptImprove(route, lat, lng);
    }

    // 7. Calculate predictions
    const totalKg = route.reduce((s, r) => s + r.estimatedKg, 0);
    const totalKm = route.length > 0 ? route[route.length - 1].cumulativeKm : 0;
    const totalMin = route.length > 0 ? route[route.length - 1].cumulativeMin : 0;

    // Add return trip to center
    const returnKm = route.length > 0 && targetCenter?.latitude && targetCenter?.longitude
      ? haversine(route[route.length - 1].lat, route[route.length - 1].lng, Number(targetCenter.latitude), Number(targetCenter.longitude))
      : 0;
    const returnMin = drivingMinutes(returnKm);
    const grandTotalKm = Math.round((totalKm + returnKm) * 100) / 100;
    const grandTotalMin = Math.round((totalMin + returnMin + 10) * 10) / 10; // +10 for center unload

    // Estimate earnings (rough: based on average center prices)
    // We'd need center prices for exact calc, use rough MXN estimates
    const AVG_PRICES: Record<string, number> = {
      cardboard: 2.5, pet: 7, aluminum: 25, glass: 1, paper: 2,
      cooking_oil: 8, electronics: 20, metal_scrap: 12, wood: 1.5, other: 3,
    };
    let grossEstimate = 0;
    for (const stop of route) {
      grossEstimate += stop.estimatedKg * (AVG_PRICES[stop.materialType] || 3);
    }
    const transporterEarnings = Math.round(grossEstimate * 0.60 * 100) / 100;
    const fuelCost = Math.round(grandTotalKm * FUEL_COST_PER_KM * 100) / 100;

    // 8. Build optimized route for batch creation
    const optimizedRoute = route.map((stop, i) => ({
      lat: stop.lat,
      lng: stop.lng,
      listingId: stop.listingId,
      order: i,
      stopStatus: "pending",
    }));

    return NextResponse.json({
      stops: route,
      optimizedRoute,
      listingIds: route.map(r => r.listingId),
      center: targetCenter ? {
        id: targetCenter.id,
        name: targetCenter.name,
        lat: Number(targetCenter.latitude),
        lng: Number(targetCenter.longitude),
        address: targetCenter.address,
      } : null,
      predictions: {
        totalStops: route.length,
        totalKg: Math.round(totalKg * 10) / 10,
        totalDistanceKm: grandTotalKm,
        totalTimeMin: grandTotalMin,
        totalTimeFormatted: `${Math.floor(grandTotalMin / 60)}h ${Math.round(grandTotalMin % 60)}m`,
        estimatedGross: Math.round(grossEstimate * 100) / 100,
        estimatedEarnings: transporterEarnings,
        estimatedFuelCost: fuelCost,
        estimatedProfit: Math.round((transporterEarnings - fuelCost) * 100) / 100,
        returnToCenter: {
          distanceKm: Math.round(returnKm * 100) / 100,
          durationMin: Math.round(returnMin * 10) / 10,
        },
      },
      filters: {
        materials: preferredMaterials,
        maxKg: effectiveMaxKg,
        maxHours: maxHours || DEFAULT_MAX_HOURS,
        pricingMode: pricingMode || "all",
        radiusKm: effectiveRadius,
        origin: { lat, lng },
      },
      candidatesScanned: scored.length,
      algorithm: "greedy-nearest-neighbor + 2-opt",
    });
  } catch (error) {
    console.error("POST /api/routes/generate error:", error);
    return NextResponse.json({ error: "Failed to generate route" }, { status: 500 });
  }
}
