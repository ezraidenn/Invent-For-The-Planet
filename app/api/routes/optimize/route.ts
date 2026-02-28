import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listings, centers } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";

// ══════════════════════════════════════════════════════════════════════
// Graph-based Route Optimizer — Greedy Nearest Neighbor TSP
// ══════════════════════════════════════════════════════════════════════
// Uses Haversine distance to compute edge weights between nodes (stops),
// then applies nearest-neighbor heuristic + optional 2-opt improvement
// to find a near-optimal collection route.

interface Node {
  id: string;
  lat: number;
  lng: number;
  label: string;
  type: "pickup" | "dropoff";
  materialType?: string;
  estimatedKg?: number;
}

interface Edge {
  from: string;
  to: string;
  distanceKm: number;
  durationMin: number;
}

interface OptimizedRoute {
  stops: (Node & { order: number; cumulativeKm: number; cumulativeMin: number })[];
  totalDistanceKm: number;
  totalDurationMin: number;
  graph: { nodes: Node[]; edges: Edge[] };
  savings: { naiveDistanceKm: number; optimizedDistanceKm: number; savedKm: number; savedPercent: number };
}

// Haversine distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate driving time: ~30 km/h urban average in Mérida
function estimateDuration(distKm: number): number {
  return Math.round((distKm / 30) * 60 * 10) / 10; // minutes, 1 decimal
}

// Build complete weighted graph (adjacency matrix as edge list)
function buildGraph(nodes: Node[]): Edge[] {
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dist = haversine(nodes[i].lat, nodes[i].lng, nodes[j].lat, nodes[j].lng);
      const dur = estimateDuration(dist);
      edges.push({ from: nodes[i].id, to: nodes[j].id, distanceKm: Math.round(dist * 100) / 100, durationMin: dur });
      edges.push({ from: nodes[j].id, to: nodes[i].id, distanceKm: Math.round(dist * 100) / 100, durationMin: dur });
    }
  }
  return edges;
}

// Nearest-neighbor TSP starting from node 0, ending at dropoff
function nearestNeighborTSP(nodes: Node[], edges: Edge[]): string[] {
  // Build adjacency lookup
  const distMap = new Map<string, number>();
  for (const e of edges) {
    distMap.set(`${e.from}->${e.to}`, e.distanceKm);
  }

  const getDist = (a: string, b: string) => distMap.get(`${a}->${b}`) ?? Infinity;

  // Separate pickups and dropoff
  const pickups = nodes.filter(n => n.type === "pickup");
  const dropoffs = nodes.filter(n => n.type === "dropoff");

  // Start from first pickup, visit all pickups, end at dropoff
  const visited = new Set<string>();
  const route: string[] = [];

  // If we have a start node (recycler position or first pickup)
  let current = pickups[0]?.id;
  if (!current) return dropoffs.map(d => d.id);

  visited.add(current);
  route.push(current);

  // Greedy nearest neighbor for remaining pickups
  while (visited.size < pickups.length) {
    let nearest = "";
    let nearestDist = Infinity;
    for (const p of pickups) {
      if (!visited.has(p.id)) {
        const d = getDist(current, p.id);
        if (d < nearestDist) {
          nearestDist = d;
          nearest = p.id;
        }
      }
    }
    if (nearest) {
      visited.add(nearest);
      route.push(nearest);
      current = nearest;
    } else break;
  }

  // Add dropoff(s) at the end — pick nearest center
  if (dropoffs.length > 0) {
    let nearestDropoff = dropoffs[0].id;
    let nearestDist = Infinity;
    for (const d of dropoffs) {
      const dist = getDist(current, d.id);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestDropoff = d.id;
      }
    }
    route.push(nearestDropoff);
  }

  return route;
}

// 2-opt local improvement (for pickup portion only)
function twoOptImprove(route: string[], distMap: Map<string, number>, maxIter = 100): string[] {
  const getDist = (a: string, b: string) => distMap.get(`${a}->${b}`) ?? Infinity;
  const totalDist = (r: string[]) => {
    let d = 0;
    for (let i = 0; i < r.length - 1; i++) d += getDist(r[i], r[i + 1]);
    return d;
  };

  let best = [...route];
  let bestDist = totalDist(best);
  let improved = true;
  let iter = 0;

  while (improved && iter < maxIter) {
    improved = false;
    iter++;
    for (let i = 1; i < best.length - 2; i++) {
      for (let j = i + 1; j < best.length - 1; j++) {
        const candidate = [...best.slice(0, i), ...best.slice(i, j + 1).reverse(), ...best.slice(j + 1)];
        const candidateDist = totalDist(candidate);
        if (candidateDist < bestDist - 0.001) {
          best = candidate;
          bestDist = candidateDist;
          improved = true;
        }
      }
    }
  }

  return best;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { listingIds, centerId, startLat, startLng } = body;

    if (!listingIds?.length) {
      return NextResponse.json({ error: "No listings provided" }, { status: 400 });
    }

    // Fetch listing data
    const listingData = await db
      .select()
      .from(listings)
      .where(inArray(listings.id, listingIds));

    if (listingData.length === 0) {
      return NextResponse.json({ error: "No valid listings found" }, { status: 404 });
    }

    // Build nodes
    const nodes: Node[] = [];

    // Add pickup nodes from listings
    for (const l of listingData) {
      if (l.latitude && l.longitude) {
        nodes.push({
          id: `pickup-${l.id}`,
          lat: Number(l.latitude),
          lng: Number(l.longitude),
          label: `${l.materialType} — ${l.estimatedKg}kg`,
          type: "pickup",
          materialType: l.materialType,
          estimatedKg: Number(l.estimatedKg) || 0,
        });
      }
    }

    // Add dropoff node (center)
    if (centerId) {
      const [center] = await db.select().from(centers).where(eq(centers.id, centerId)).limit(1);
      if (center && center.latitude && center.longitude) {
        nodes.push({
          id: `dropoff-${center.id}`,
          lat: Number(center.latitude),
          lng: Number(center.longitude),
          label: center.name,
          type: "dropoff",
        });
      }
    }

    if (nodes.filter(n => n.type === "pickup").length === 0) {
      return NextResponse.json({ error: "No geolocated listings" }, { status: 400 });
    }

    // Build graph
    const edges = buildGraph(nodes);
    const distMap = new Map<string, number>();
    for (const e of edges) {
      distMap.set(`${e.from}->${e.to}`, e.distanceKm);
    }

    // Solve TSP with nearest neighbor
    let routeOrder = nearestNeighborTSP(nodes, edges);

    // Apply 2-opt improvement
    routeOrder = twoOptImprove(routeOrder, distMap);

    // Calculate naive distance (original listing order)
    const naiveOrder = nodes.map(n => n.id);
    let naiveDist = 0;
    for (let i = 0; i < naiveOrder.length - 1; i++) {
      naiveDist += distMap.get(`${naiveOrder[i]}->${naiveOrder[i + 1]}`) ?? 0;
    }

    // Build optimized stops with cumulative metrics
    let cumKm = 0;
    let cumMin = 0;
    const stops = routeOrder.map((nodeId, idx) => {
      const node = nodes.find(n => n.id === nodeId)!;
      if (idx > 0) {
        const prevId = routeOrder[idx - 1];
        const segDist = distMap.get(`${prevId}->${nodeId}`) ?? 0;
        cumKm += segDist;
        cumMin += estimateDuration(segDist);
      }
      return {
        ...node,
        order: idx + 1,
        cumulativeKm: Math.round(cumKm * 100) / 100,
        cumulativeMin: Math.round(cumMin * 10) / 10,
      };
    });

    const totalDistanceKm = Math.round(cumKm * 100) / 100;
    const totalDurationMin = Math.round(cumMin * 10) / 10;
    const savedKm = Math.round((naiveDist - cumKm) * 100) / 100;

    const result: OptimizedRoute = {
      stops,
      totalDistanceKm,
      totalDurationMin,
      graph: { nodes, edges: edges.filter(e => {
        // Only return edges used in the route for cleaner visualization
        for (let i = 0; i < routeOrder.length - 1; i++) {
          if (e.from === routeOrder[i] && e.to === routeOrder[i + 1]) return true;
        }
        return false;
      })},
      savings: {
        naiveDistanceKm: Math.round(naiveDist * 100) / 100,
        optimizedDistanceKm: totalDistanceKm,
        savedKm: Math.max(0, savedKm),
        savedPercent: naiveDist > 0 ? Math.round((savedKm / naiveDist) * 10000) / 100 : 0,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Route optimizer error:", error);
    return NextResponse.json({ error: "Failed to optimize route" }, { status: 500 });
  }
}
