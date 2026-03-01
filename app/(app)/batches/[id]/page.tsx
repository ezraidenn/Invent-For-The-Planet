"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
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
  Camera,
  Scale,
  Star,
  ChevronRight,
  Package,
  Building2,
  DollarSign,
  Upload,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { DEFAULT_MAP_CENTER, STATUS_COLORS, MATERIAL_LABELS, MATERIAL_COLORS } from "@/lib/constants";
import { formatKg, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

// Stop status progression
const STOP_FLOW = ["pending", "arrived", "weighed", "photographed", "confirmed"] as const;
type StopStatus = (typeof STOP_FLOW)[number];

const STOP_LABELS: Record<StopStatus, string> = {
  pending: "Pending",
  arrived: "Arrived",
  weighed: "Weighed",
  photographed: "Photo taken",
  confirmed: "Confirmed",
};

const STOP_COLORS: Record<StopStatus, string> = {
  pending: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  arrived: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  weighed: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  photographed: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
};

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

  // Per-stop action state
  const [weighInput, setWeighInput] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [stopActing, setStopActing] = useState(false);

  // Delivery state
  const [deliveryPhase, setDeliveryPhase] = useState<"stops" | "select_center" | "delivery_photo" | "summary" | "rating">("stops");
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [deliveryPhoto, setDeliveryPhoto] = useState("");
  const [deliveryResult, setDeliveryResult] = useState<any>(null);
  const [rating, setRating] = useState(0);

  const { data: batch, isLoading, refetch } = useQuery({
    queryKey: ["batch", id],
    queryFn: async () => {
      const res = await fetch(`/api/batches/${id}`);
      if (!res.ok) throw new Error("Failed to load batch");
      return res.json();
    },
  });

  const { data: centersData } = useQuery({
    queryKey: ["centers-for-delivery"],
    queryFn: async () => {
      const res = await fetch("/api/centers");
      if (!res.ok) return [];
      return res.json();
    },
    enabled: deliveryPhase === "select_center",
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
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setRouteOpt(data); })
      .catch(() => {})
      .finally(() => setOptimizing(false));
  }, [batch]);

  // Batch-level actions
  const actionMutation = useMutation({
    mutationFn: async (payload: { action: string; [key: string]: any }) => {
      const res = await fetch(`/api/batches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Action failed");
      }
      return res.json();
    },
    onSuccess: (data, payload) => {
      queryClient.invalidateQueries({ queryKey: ["batch", id] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      const msgs: Record<string, string> = {
        claim: "Batch claimed! You can now start the route.",
        start: "Route started! Follow the stops one by one.",
        cancel: "Batch cancelled.",
      };
      if (msgs[payload.action]) toast.success(msgs[payload.action]);
      if (payload.action === "deliver") {
        setDeliveryResult(data.transaction || data);
        setDeliveryPhase("summary");
        toast.success("Delivery complete! Materials sold.");
      }
      if (payload.action === "rate") {
        toast.success("Rating submitted! Thank you.");
        router.push("/batches");
      }
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Stop-level actions
  const stopAction = useCallback(
    async (stopIndex: number, action: string, data?: Record<string, any>) => {
      setStopActing(true);
      try {
        const res = await fetch(`/api/batches/${id}/stops`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stopIndex, action, data }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Stop action failed");
        }
        const result = await res.json();
        await refetch();

        const actionLabels: Record<string, string> = {
          arrive: "Arrived at stop!",
          weigh: `Weighed: ${data?.actualKg}kg`,
          photo: "Photo proof uploaded!",
          confirm: "Pickup confirmed!",
        };
        toast.success(actionLabels[action] || "Done");

        // Reset inputs
        setWeighInput("");
        setPhotoUrl("");

        // If all confirmed, prompt for delivery
        if (result.progress?.allConfirmed) {
          toast.success("All stops confirmed! Ready to deliver to center.", { duration: 4000 });
          setDeliveryPhase("select_center");
        }

        return result;
      } catch (err: any) {
        toast.error(err.message);
      } finally {
        setStopActing(false);
      }
    },
    [id, refetch]
  );

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

  const route: any[] = batch.optimizedRoute || [];
  const mapCenter = route.length > 0 ? { lat: route[0].lat, lng: route[0].lng } : DEFAULT_MAP_CENTER;

  // Use optimized stops if available
  const displayStops = routeOpt?.stops || route.map((s: any, i: number) => ({
    ...s, id: `stop-${i}`, label: `Stop ${i + 1}`, type: "pickup" as const,
    order: i + 1, cumulativeKm: 0, cumulativeMin: 0,
  }));

  // Get listing for a stop
  const getListingForStop = (stop: any, i: number) => {
    if (stop.materialType) return stop;
    const lid = route[i]?.listingId;
    return batch.listings?.find((l: any) => l.id === lid);
  };

  // Get stop status from route data
  const getStopStatus = (i: number): StopStatus => {
    return route[i]?.stopStatus || "pending";
  };

  // Check if all stops are confirmed
  const confirmedCount = route.filter((s: any) => s.stopStatus === "confirmed").length;
  const allConfirmed = confirmedCount === route.length && route.length > 0;

  // Find first non-confirmed stop
  const nextStopIndex = route.findIndex((s: any) => s.stopStatus !== "confirmed");

  // ─── RENDER ────────────────────────────────────────────────────

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border/50 bg-background/80 backdrop-blur-sm px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => {
          if (deliveryPhase !== "stops" && deliveryPhase !== "summary" && deliveryPhase !== "rating") {
            setDeliveryPhase("stops");
          } else {
            router.back();
          }
        }}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-base font-bold">
            {deliveryPhase === "select_center" ? "Select Center" :
             deliveryPhase === "delivery_photo" ? "Delivery Photo" :
             deliveryPhase === "summary" ? "Delivery Summary" :
             deliveryPhase === "rating" ? "Rate Experience" :
             `Batch #${batch.id.slice(0, 8)}`}
          </h1>
          <p className="text-xs text-muted-foreground">
            {deliveryPhase === "stops" ? batch.zone || `${route.length} stops` : ""}
          </p>
        </div>
        <Badge className={cn("text-xs", STATUS_COLORS[batch.status] || "")} variant="secondary">
          {batch.status}
        </Badge>
      </div>

      {/* ─── STOPS PHASE ─── */}
      {deliveryPhase === "stops" && (
        <>
          {/* Map with route */}
          <div className="h-44 shrink-0">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || ""}>
              <Map defaultCenter={mapCenter} defaultZoom={14} gestureHandling="greedy" disableDefaultUI className="h-full w-full">
                {route.map((stop: any, i: number) => {
                  const status = getStopStatus(i);
                  return (
                    <Marker
                      key={i}
                      position={{ lat: stop.lat, lng: stop.lng }}
                      onClick={() => setActiveStop(i)}
                      label={{
                        text: status === "confirmed" ? "✓" : String(i + 1),
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "12px",
                      }}
                    />
                  );
                })}
              </Map>
            </APIProvider>
          </div>

          {/* Progress bar */}
          {batch.status === "in_progress" && (
            <div className="border-b bg-muted/30 px-4 py-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-medium">Progress</span>
                <span className="text-muted-foreground">{confirmedCount}/{route.length} stops confirmed</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${route.length > 0 ? (confirmedCount / route.length) * 100 : 0}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {/* Stats bar */}
          <div className="grid grid-cols-4 gap-px border-b bg-muted/50">
            {[
              { icon: MapPin, value: String(batch.stopsCount), label: "Stops" },
              { icon: Weight, value: formatKg(batch.totalEstimatedKg || 0), label: "Est. kg" },
              { icon: Route, value: routeOpt ? `${routeOpt.totalDistanceKm} km` : "—", label: "Distance" },
              { icon: Clock, value: routeOpt ? `${routeOpt.totalDurationMin} min` : "—", label: "Est. time" },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center bg-background py-2">
                <s.icon className="mb-0.5 h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-bold">{s.value}</span>
                <span className="text-[9px] text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Route Optimization Card */}
          {(routeOpt || optimizing) && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="border-b border-border/50 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 px-4 py-2.5">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-emerald-500 to-teal-500">
                  <Zap className="h-3 w-3 text-white" />
                </div>
                <span className="text-[11px] font-bold">Optimized Route</span>
                {optimizing && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                {routeOpt && (
                  <span className="ml-auto text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    -{routeOpt.savings.savedKm}km saved ({routeOpt.savings.savedPercent}%)
                  </span>
                )}
              </div>
            </motion.div>
          )}

          {/* Stops list with per-stop actions */}
          <div className="flex-1 overflow-auto">
            <div className="space-y-2 p-3">
              {displayStops.map((stop: any, i: number) => {
                const listing = getListingForStop(stop, i);
                const matLabel = listing?.materialType ? (MATERIAL_LABELS as any)[listing.materialType] || listing.materialType : null;
                const matColor = listing?.materialType ? (MATERIAL_COLORS as any)[listing.materialType] : null;
                const status = getStopStatus(i);
                const isActive = i === activeStop;
                const isNext = i === nextStopIndex;

                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card
                      className={cn(
                        "transition-all overflow-hidden",
                        isActive && "ring-2 ring-primary/50 shadow-md",
                        status === "confirmed" && "opacity-75"
                      )}
                      onClick={() => setActiveStop(i)}
                    >
                      <CardContent className="p-0">
                        {/* Stop header */}
                        <div className="flex items-center gap-3 p-3">
                          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            status === "confirmed"
                              ? "bg-emerald-500 text-white"
                              : isNext && batch.status === "in_progress"
                              ? "bg-gradient-to-br from-blue-500 to-indigo-500 text-white animate-pulse"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {status === "confirmed" ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">Stop {i + 1}</p>
                              {matLabel && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={matColor ? { borderColor: matColor, color: matColor } : undefined}>
                                  {matLabel}
                                </Badge>
                              )}
                              <Badge className={cn("ml-auto text-[9px] px-1.5 py-0", STOP_COLORS[status])}>
                                {STOP_LABELS[status]}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {listing?.estimatedKg ? `${listing.estimatedKg}kg estimated` : ""}
                              {route[i]?.actualKg ? ` → ${route[i].actualKg}kg actual` : ""}
                            </p>
                          </div>

                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => {
                            e.stopPropagation();
                            const lat = stop.lat || route[i]?.lat;
                            const lng = stop.lng || route[i]?.lng;
                            if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
                          }}>
                            <Navigation className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Per-stop action panel (only when in_progress and this stop is active) */}
                        {batch.status === "in_progress" && isActive && status !== "confirmed" && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t bg-muted/30 px-3 py-3"
                          >
                            {/* Step progress indicator */}
                            <div className="flex items-center gap-1 mb-3">
                              {STOP_FLOW.map((step, si) => {
                                const currentIdx = STOP_FLOW.indexOf(status);
                                const isCompleted = si <= currentIdx;
                                const isCurrent = si === currentIdx + 1;
                                return (
                                  <div key={step} className="flex items-center gap-1">
                                    <div className={cn("h-2 w-2 rounded-full", isCompleted ? "bg-emerald-500" : isCurrent ? "bg-blue-500 animate-pulse" : "bg-gray-300 dark:bg-gray-600")} />
                                    {si < STOP_FLOW.length - 1 && <div className={cn("h-px w-4", isCompleted ? "bg-emerald-500" : "bg-gray-300 dark:bg-gray-600")} />}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Action buttons based on current stop status */}
                            {status === "pending" && (
                              <Button
                                className="w-full gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                                size="sm"
                                onClick={() => stopAction(i, "arrive")}
                                disabled={stopActing}
                              >
                                {stopActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                                I&apos;ve Arrived
                              </Button>
                            )}

                            {status === "arrived" && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium flex items-center gap-1.5">
                                  <Scale className="h-3.5 w-3.5 text-amber-500" />
                                  Enter actual weight (kg)
                                </p>
                                <div className="flex gap-2">
                                  <Input
                                    type="number"
                                    placeholder={`Est: ${listing?.estimatedKg || 0}kg`}
                                    value={weighInput}
                                    onChange={(e) => setWeighInput(e.target.value)}
                                    className="h-9 text-sm"
                                    step="0.1"
                                    min="0.1"
                                  />
                                  <Button
                                    className="gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                                    size="sm"
                                    onClick={() => {
                                      const kg = parseFloat(weighInput);
                                      if (!kg || kg <= 0) { toast.error("Enter a valid weight"); return; }
                                      stopAction(i, "weigh", { actualKg: kg });
                                    }}
                                    disabled={stopActing || !weighInput}
                                  >
                                    {stopActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Weight className="h-3.5 w-3.5" />}
                                    Confirm
                                  </Button>
                                </div>
                              </div>
                            )}

                            {status === "weighed" && (
                              <div className="space-y-2">
                                <p className="text-xs font-medium flex items-center gap-1.5">
                                  <Camera className="h-3.5 w-3.5 text-purple-500" />
                                  Upload photo proof of material
                                </p>
                                <div className="flex gap-2">
                                  <Input
                                    type="text"
                                    placeholder="Photo URL (camera/upload)"
                                    value={photoUrl}
                                    onChange={(e) => setPhotoUrl(e.target.value)}
                                    className="h-9 text-sm"
                                  />
                                  <Button
                                    className="gap-1.5 bg-purple-500 hover:bg-purple-600 text-white"
                                    size="sm"
                                    onClick={() => {
                                      if (!photoUrl.trim()) { toast.error("Enter photo URL"); return; }
                                      stopAction(i, "photo", { photoUrl: photoUrl.trim() });
                                    }}
                                    disabled={stopActing || !photoUrl.trim()}
                                  >
                                    {stopActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                    Upload
                                  </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground">Photo is sent to the generator as proof of weight and material.</p>
                              </div>
                            )}

                            {status === "photographed" && (
                              <Button
                                className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                                size="sm"
                                onClick={() => stopAction(i, "confirm")}
                                disabled={stopActing}
                              >
                                {stopActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                Confirm Pickup — {route[i]?.actualKg}kg of {matLabel}
                              </Button>
                            )}
                          </motion.div>
                        )}

                        {/* Confirmed stop summary */}
                        {status === "confirmed" && route[i]?.actualKg && (
                          <div className="border-t bg-emerald-50/50 dark:bg-emerald-950/20 px-3 py-2 flex items-center gap-2 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                            <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                              Picked up {route[i].actualKg}kg
                            </span>
                            {route[i].photoUrl && (
                              <a href={route[i].photoUrl} target="_blank" className="ml-auto text-blue-500 hover:underline">View photo</a>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* ─── SELECT CENTER PHASE ─── */}
      {deliveryPhase === "select_center" && (
        <div className="flex-1 overflow-auto p-4 space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/30">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-sm text-emerald-800 dark:text-emerald-200">All {route.length} stops confirmed! Select a center to deliver.</p>
          </div>

          <h3 className="text-sm font-semibold">Nearby Centers</h3>
          {centersData?.map((center: any) => (
            <Card
              key={center.id}
              className={cn("cursor-pointer transition-all hover:shadow-md",
                selectedCenterId === center.id && "ring-2 ring-emerald-500"
              )}
              onClick={() => setSelectedCenterId(center.id)}
            >
              <CardContent className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                  <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{center.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{center.address}</p>
                </div>
                {center.isVerified && <Badge className="text-[9px] bg-emerald-100 text-emerald-700">Verified</Badge>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ─── DELIVERY PHOTO PHASE ─── */}
      {deliveryPhase === "delivery_photo" && (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="text-center py-6">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center mb-3">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold">Delivery Photo</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Take a photo of the materials being weighed/delivered at the center.<br />
              This photo is sent to each generator as proof.
            </p>
          </div>
          <Input
            type="text"
            placeholder="Paste delivery photo URL"
            value={deliveryPhoto}
            onChange={(e) => setDeliveryPhoto(e.target.value)}
            className="h-11"
          />
          <p className="text-[11px] text-muted-foreground text-center">
            The photo proves that the material was actually delivered and weighed at the center.
          </p>
        </div>
      )}

      {/* ─── SUMMARY PHASE ─── */}
      {deliveryPhase === "summary" && deliveryResult && (
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <div className="text-center py-4">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto h-16 w-16 rounded-full bg-emerald-500 flex items-center justify-center mb-3">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </motion.div>
            <h3 className="text-xl font-bold">Delivery Complete!</h3>
            <p className="text-sm text-muted-foreground mt-1">Materials delivered and sold successfully.</p>
          </div>

          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="text-sm font-semibold">Payout Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Gross value (center paid)</span>
                  <span className="font-medium">{formatCurrency(deliveryResult.grossAmount || 0)}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-blue-500" /> You (transporter 60%)</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(deliveryResult.transporterPayout || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5"><Package className="h-3.5 w-3.5 text-amber-500" /> Generators (25%)</span>
                  <span className="font-medium">{formatCurrency(deliveryResult.generatorsPayout || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5 text-purple-500" /> ReciMap (15%)</span>
                  <span className="font-medium">{formatCurrency(deliveryResult.platformFee || 0)}</span>
                </div>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total weight delivered</span>
                <span className="font-medium">{formatKg(deliveryResult.totalKg || 0)}</span>
              </div>
            </CardContent>
          </Card>

          {deliveryResult.items?.length > 0 && (
            <Card>
              <CardContent className="p-4 space-y-2">
                <h4 className="text-sm font-semibold">Per Material</h4>
                {deliveryResult.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: (MATERIAL_COLORS as any)[item.materialType] || "#888" }} />
                      {(MATERIAL_LABELS as any)[item.materialType] || item.materialType}
                    </span>
                    <span>{item.kg}kg × {formatCurrency(item.pricePerKg)}/kg = <strong>{formatCurrency(item.subtotal)}</strong></span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── RATING PHASE ─── */}
      {deliveryPhase === "rating" && (
        <div className="flex-1 overflow-auto p-4 space-y-6">
          <div className="text-center py-6">
            <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-bold">Rate this experience</h3>
            <p className="text-sm text-muted-foreground mt-1">How was the overall pickup and delivery?</p>
          </div>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                <Star className={cn("h-10 w-10 transition-colors", s <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-600")} />
              </button>
            ))}
          </div>
          <p className="text-center text-sm font-medium">
            {rating === 0 ? "Tap to rate" : rating <= 2 ? "Could be better" : rating <= 3 ? "Good" : rating === 4 ? "Great!" : "Excellent!"}
          </p>
        </div>
      )}

      {/* ─── BOTTOM ACTIONS ─── */}
      <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4">
        {deliveryPhase === "stops" && (
          <>
            {batch.status === "available" && (
              <Button className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                onClick={() => actionMutation.mutate({ action: "claim" })} disabled={actionMutation.isPending}>
                {actionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                Claim This Batch
              </Button>
            )}
            {batch.status === "assigned" && (
              <div className="flex gap-2">
                <Button className="flex-1 gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  onClick={() => actionMutation.mutate({ action: "start" })} disabled={actionMutation.isPending}>
                  <Play className="h-4 w-4" /> Start Route
                </Button>
                <Button variant="outline" onClick={() => actionMutation.mutate({ action: "cancel" })} disabled={actionMutation.isPending}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            )}
            {batch.status === "in_progress" && allConfirmed && (
              <Button className="w-full gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white shadow-lg"
                onClick={() => setDeliveryPhase("select_center")}>
                <Building2 className="h-4 w-4" /> Deliver to Center
              </Button>
            )}
            {batch.status === "in_progress" && !allConfirmed && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                <AlertCircle className="h-4 w-4" />
                Confirm all stops before delivering ({confirmedCount}/{route.length})
              </div>
            )}
            {batch.status === "completed" && (
              <div className="text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-green-500" />
                Batch completed
              </div>
            )}
          </>
        )}

        {deliveryPhase === "select_center" && (
          <Button className="w-full gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg"
            onClick={() => { if (!selectedCenterId) { toast.error("Select a center"); return; } setDeliveryPhase("delivery_photo"); }}
            disabled={!selectedCenterId}>
            <ChevronRight className="h-4 w-4" /> Continue to Photo Proof
          </Button>
        )}

        {deliveryPhase === "delivery_photo" && (
          <Button className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
            onClick={() => {
              actionMutation.mutate({
                action: "deliver",
                centerId: selectedCenterId,
                deliveryPhotoUrl: deliveryPhoto || null,
              });
            }}
            disabled={actionMutation.isPending}>
            {actionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Confirm Delivery & Calculate Payout
          </Button>
        )}

        {deliveryPhase === "summary" && (
          <Button className="w-full gap-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg"
            onClick={() => setDeliveryPhase("rating")}>
            <Star className="h-4 w-4" /> Rate Experience
          </Button>
        )}

        {deliveryPhase === "rating" && (
          <Button className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
            onClick={() => { if (rating === 0) { toast.error("Select a rating"); return; } actionMutation.mutate({ action: "rate", rating }); }}
            disabled={actionMutation.isPending || rating === 0}>
            {actionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Submit Rating & Finish
          </Button>
        )}
      </div>
    </div>
  );
}
