"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Truck,
  Play,
  CheckCircle2,
  XCircle,
  Navigation,
  Clock,
  Weight,
  Route,
  Zap,
  TrendingDown,
  Fuel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { DEFAULT_MAP_CENTER, STATUS_COLORS, MATERIAL_LABELS } from "@/lib/constants";
import { formatKg } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RouteOptResult {
  stops: { id: string; lat: number; lng: number; label: string; type: string; order: number; cumulativeKm: number; cumulativeMin: number; materialType?: string; estimatedKg?: number }[];
  totalDistanceKm: number;
  totalDurationMin: number;
  savings: { naiveDistanceKm: number; optimizedDistanceKm: number; savedKm: number; savedPercent: number };
}

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [activeStop, setActiveStop] = useState<number>(0);
  const [routeOpt, setRouteOpt] = useState<RouteOptResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const { data: batch, isLoading } = useQuery({
    queryKey: ["batch", id],
    queryFn: async () => {
      const res = await fetch(`/api/batches/${id}`);
      if (!res.ok) throw new Error("Failed to load batch");
      return res.json();
    },
  });

  // Run route optimization when batch loads
  useEffect(() => {
    if (!batch?.listings?.length) return;
    const listingIds = batch.listings.map((l: any) => l.id);
    if (listingIds.length < 2) return;

    setOptimizing(true);
    fetch("/api/routes/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingIds }),
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setRouteOpt(data); })
      .catch(() => {})
      .finally(() => setOptimizing(false));
  }, [batch]);

  const actionMutation = useMutation({
    mutationFn: async (action: string) => {
      const res = await fetch(`/api/batches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }
      return res.json();
    },
    onSuccess: (_, action) => {
      queryClient.invalidateQueries({ queryKey: ["batch", id] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      const msgs: Record<string, string> = {
        claim: "Batch claimed! You can now start the route.",
        start: "Route started! Follow the stops.",
        complete: "Batch completed! Head to the collection center.",
        cancel: "Batch cancelled.",
      };
      toast.success(msgs[action] || "Done");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Batch not found</p>
        <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const route: { lat: number; lng: number; listingId?: string; order: number }[] =
    batch.optimizedRoute || [];
  const mapCenter =
    route.length > 0
      ? { lat: route[0].lat, lng: route[0].lng }
      : DEFAULT_MAP_CENTER;

  // Use optimized stops if available, otherwise fall back to batch route
  const displayStops = routeOpt?.stops || route.map((s, i) => ({
    ...s, id: `stop-${i}`, label: `Stop ${i + 1}`, type: "pickup" as const,
    order: i + 1, cumulativeKm: 0, cumulativeMin: 0,
  }));

  // Find matching listing for a stop
  const getListingForStop = (stop: any) => {
    if (stop.materialType) return stop;
    const lid = route.find(r => r.order === stop.order)?.listingId;
    return batch.listings?.find((l: any) => l.id === lid);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-base font-bold">
            Batch #{batch.id.slice(0, 8)}
          </h1>
          <p className="text-xs text-muted-foreground">{batch.zone}</p>
        </div>
        <Badge className={cn("text-xs", STATUS_COLORS[batch.status] || "")} variant="secondary">
          {batch.status}
        </Badge>
      </div>

      {/* Map with route */}
      <div className="h-52 shrink-0">
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}>
          <Map
            defaultCenter={mapCenter}
            defaultZoom={14}
            mapId="recimap-batch"
            gestureHandling="greedy"
            disableDefaultUI
            className="h-full w-full"
            colorScheme={isDark ? "DARK" : "LIGHT"}
          >
            {route.map((stop, i) => (
              <AdvancedMarker
                key={i}
                position={{ lat: stop.lat, lng: stop.lng }}
                onClick={() => setActiveStop(i)}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold shadow-lg transition-all",
                    i === activeStop
                      ? "scale-125 border-emerald-400 bg-emerald-500 text-white"
                      : i < activeStop && batch.status === "in_progress"
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-white bg-background text-foreground"
                  )}
                >
                  {i + 1}
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-px border-b bg-muted/50">
        {[
          { icon: MapPin, value: String(batch.stopsCount), label: "Stops" },
          { icon: Weight, value: formatKg(batch.totalEstimatedKg || 0), label: "Total" },
          { icon: Route, value: routeOpt ? `${routeOpt.totalDistanceKm} km` : "—", label: "Distance" },
          { icon: Clock, value: routeOpt ? `${routeOpt.totalDurationMin} min` : batch.scheduledTime || "--:--", label: routeOpt ? "Est. time" : batch.scheduledDate || "Time" },
        ].map((s, i) => (
          <div key={i} className="flex flex-col items-center bg-background py-2.5">
            <s.icon className="mb-0.5 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-bold">{s.value}</span>
            <span className="text-[10px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Route Optimization Card */}
      {(routeOpt || optimizing) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="border-b border-border/50 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 px-4 py-3"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-emerald-500 to-teal-500">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-xs font-bold">Optimized Route — Graph Algorithm</span>
            {optimizing && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          </div>
          {routeOpt && (
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-background/60 p-2 text-center">
                <TrendingDown className="mx-auto mb-0.5 h-3.5 w-3.5 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-500">-{routeOpt.savings.savedKm} km</p>
                <p className="text-[9px] text-muted-foreground">Saved vs. naive</p>
              </div>
              <div className="rounded-lg bg-background/60 p-2 text-center">
                <Route className="mx-auto mb-0.5 h-3.5 w-3.5 text-teal-500" />
                <p className="text-sm font-bold text-teal-500">{routeOpt.savings.savedPercent}%</p>
                <p className="text-[9px] text-muted-foreground">More efficient</p>
              </div>
              <div className="rounded-lg bg-background/60 p-2 text-center">
                <Fuel className="mx-auto mb-0.5 h-3.5 w-3.5 text-cyan-500" />
                <p className="text-sm font-bold text-cyan-500">~{Math.round(routeOpt.totalDistanceKm * 0.12)}L</p>
                <p className="text-[9px] text-muted-foreground">Est. fuel</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Stops list */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2 p-4">
          <h2 className="text-sm font-semibold">Route Stops</h2>
          {displayStops.map((stop: any, i: number) => {
            const listing = getListingForStop(stop);
            const matLabel = listing?.materialType ? (MATERIAL_LABELS as any)[listing.materialType] || listing.materialType : null;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    i === activeStop && "ring-2 ring-emerald-500/60"
                  )}
                  onClick={() => setActiveStop(i)}
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        stop.type === "dropoff"
                          ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
                          : i < activeStop && batch.status === "in_progress"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {i < activeStop && batch.status === "in_progress" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : stop.type === "dropoff" ? (
                        <MapPin className="h-4 w-4" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">
                          {stop.type === "dropoff" ? "Collection Center" : `Stop ${i + 1}`}
                        </p>
                        {matLabel && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {matLabel}
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {stop.label || `${stop.lat?.toFixed(4)}, ${stop.lng?.toFixed(4)}`}
                      </p>
                      {stop.cumulativeKm > 0 && (
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                          {stop.cumulativeKm} km · {stop.cumulativeMin} min cumulative
                          {listing?.estimatedKg ? ` · ${listing.estimatedKg}kg` : ""}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        const lat = stop.lat || route[i]?.lat;
                        const lng = stop.lng || route[i]?.lng;
                        if (lat && lng) {
                          window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
                        }
                      }}
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4">
        {batch.status === "available" && (
          <Button
            className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
            onClick={() => actionMutation.mutate("claim")}
            disabled={actionMutation.isPending}
          >
            {actionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            Claim This Batch
          </Button>
        )}
        {batch.status === "assigned" && (
          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
              onClick={() => actionMutation.mutate("start")}
              disabled={actionMutation.isPending}
            >
              <Play className="h-4 w-4" />
              Start Route
            </Button>
            <Button
              variant="outline"
              onClick={() => actionMutation.mutate("cancel")}
              disabled={actionMutation.isPending}
            >
              <XCircle className="h-4 w-4" />
            </Button>
          </div>
        )}
        {batch.status === "in_progress" && (
          <Button
            className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
            onClick={() => actionMutation.mutate("complete")}
            disabled={actionMutation.isPending}
          >
            {actionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Complete Batch
          </Button>
        )}
        {batch.status === "completed" && (
          <div className="text-center text-sm text-muted-foreground">
            <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-green-500" />
            Batch completed
          </div>
        )}
      </div>
    </div>
  );
}
