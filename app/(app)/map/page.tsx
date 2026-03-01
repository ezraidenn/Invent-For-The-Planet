"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import {
  Package,
  MapPin,
  Filter,
  Loader2,
  RefreshCw,
  Navigation,
  ShieldCheck,
  X,
  Gift,
  Tag,
  Check,
  Eye,
  EyeOff,
  Zap,
  Route,
  Clock,
  Weight,
  Fuel,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Truck,
  Play,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MATERIAL_COLORS, MATERIAL_LABELS, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import { formatKg, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";
import type { MaterialType } from "@/types";

// ─── Google Maps dark mode style ──────────────────────────────
const DARK_MAP_STYLES: any[] = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
  { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
  { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
  { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
  { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
];

// ─── SVG marker builders ─────────────────────────────────────
// Each material gets a unique colored pin with its initial letter
function listingMarkerSvg(color: string, letter: string, isFree: boolean): string {
  const border = isFree ? "%2322c55e" : "%23ffffff";
  const badge = isFree
    ? `<circle cx="22" cy="6" r="6" fill="%2322c55e" stroke="white" stroke-width="1.5"/><text x="22" y="9.5" text-anchor="middle" font-size="8" font-weight="bold" fill="white">F</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="${encodeURIComponent(color)}" stroke="${border}" stroke-width="2"/><circle cx="14" cy="13" r="8" fill="white" fill-opacity="0.95"/><text x="14" y="17" text-anchor="middle" font-size="11" font-weight="bold" fill="${encodeURIComponent(color)}" font-family="sans-serif">${letter}</text>${badge}</svg>`;
}

function centerMarkerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><rect x="2" y="2" width="32" height="32" rx="8" fill="%2316a34a" stroke="white" stroke-width="2.5"/><text x="18" y="24" text-anchor="middle" font-size="20" fill="white">♻</text></svg>`;
}

function userMarkerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="%233b82f6" stroke="white" stroke-width="3"/><circle cx="10" cy="10" r="3" fill="white"/></svg>`;
}

// Material first letter for pin label
const MAT_LETTER: Record<string, string> = {
  cardboard: "C", pet: "P", aluminum: "Al", glass: "G", paper: "Pa",
  cooking_oil: "O", electronics: "E", metal_scrap: "M", wood: "W", other: "?",
};

interface ListingMarker {
  id: string;
  materialType: MaterialType;
  estimatedKg: number;
  latitude: number;
  longitude: number;
  status: string;
  pricingMode: string;
  pricePerKg: number | null;
  address: string | null;
  userName: string;
}

interface CenterMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  isVerified: boolean;
}

interface CenterPrice {
  materialType: string;
  pricePerKg: number;
}

export default function MapPage() {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [selectedListing, setSelectedListing] = useState<ListingMarker | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<CenterMarker | null>(null);
  const [showListings, setShowListings] = useState(true);
  const [showCenters, setShowCenters] = useState(true);
  const [materialFilter, setMaterialFilter] = useState<Set<string>>(new Set());
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "for_sale">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_MAP_CENTER);
  const [hasRealLocation, setHasRealLocation] = useState(false);

  // ─── Smart Route Builder state ──────────────────────────────
  const [showRouteBuilder, setShowRouteBuilder] = useState(false);
  const [rbMaterials, setRbMaterials] = useState<Set<string>>(new Set());
  const [rbMaxKg, setRbMaxKg] = useState("200");
  const [rbMaxHours, setRbMaxHours] = useState("4");
  const [rbPricing, setRbPricing] = useState<"all" | "free" | "for_sale">("all");
  const [rbRadiusKm, setRbRadiusKm] = useState("20");
  const [rbGenerating, setRbGenerating] = useState(false);
  const [rbResult, setRbResult] = useState<any>(null);
  const [rbCreating, setRbCreating] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setHasRealLocation(true);
        },
        () => {}
      );
    }
  }, []);

  const { data: listings, isLoading: listingsLoading, refetch: refetchListings } = useQuery({
    queryKey: ["map-listings"],
    queryFn: async () => {
      const res = await fetch("/api/listings?status=scheduled&limit=200");
      if (!res.ok) return [];
      return res.json() as Promise<ListingMarker[]>;
    },
  });

  const { data: centers, isLoading: centersLoading } = useQuery({
    queryKey: ["map-centers"],
    queryFn: async () => {
      const res = await fetch("/api/centers");
      if (!res.ok) return [];
      return res.json() as Promise<CenterMarker[]>;
    },
  });

  const handleListingClick = useCallback((listing: ListingMarker) => {
    setSelectedListing(listing);
    setSelectedCenter(null);
  }, []);

  const [centerPrices, setCenterPrices] = useState<CenterPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  const handleCenterClick = useCallback(async (center: CenterMarker) => {
    setSelectedCenter(center);
    setSelectedListing(null);
    setLoadingPrices(true);
    try {
      const res = await fetch(`/api/centers/${center.id}/prices`);
      if (res.ok) setCenterPrices(await res.json());
      else setCenterPrices([]);
    } catch { setCenterPrices([]); }
    finally { setLoadingPrices(false); }
  }, []);

  const isLoading = listingsLoading || centersLoading;

  const toggleMaterial = (mat: string) => {
    setMaterialFilter((prev) => {
      const next = new Set(prev);
      if (next.has(mat)) next.delete(mat); else next.add(mat);
      return next;
    });
  };

  const filteredListings = useMemo(() => {
    return listings?.filter((l) => {
      if (materialFilter.size > 0 && !materialFilter.has(l.materialType)) return false;
      if (pricingFilter === "free" && l.pricingMode !== "free") return false;
      if (pricingFilter === "for_sale" && l.pricingMode !== "for_sale") return false;
      return true;
    });
  }, [listings, materialFilter, pricingFilter]);

  const materialCounts: Record<string, number> = {};
  const freeCount = listings?.filter(l => l.pricingMode === "free").length || 0;
  const saleCount = listings?.filter(l => l.pricingMode === "for_sale").length || 0;
  listings?.forEach((l) => {
    materialCounts[l.materialType] = (materialCounts[l.materialType] || 0) + 1;
  });

  // Pre-build marker icons
  const markerIcons = useMemo(() => {
    const icons: Record<string, any> = {};
    for (const [mat, color] of Object.entries(MATERIAL_COLORS)) {
      const letter = MAT_LETTER[mat] || "?";
      icons[`${mat}_free`] = {
        url: "data:image/svg+xml;charset=UTF-8," + listingMarkerSvg(color, letter, true),
        scaledSize: { width: 28, height: 36 } as any,
        anchor: { x: 14, y: 36 } as any,
      };
      icons[`${mat}_sale`] = {
        url: "data:image/svg+xml;charset=UTF-8," + listingMarkerSvg(color, letter, false),
        scaledSize: { width: 28, height: 36 } as any,
        anchor: { x: 14, y: 36 } as any,
      };
    }
    icons.center = {
      url: "data:image/svg+xml;charset=UTF-8," + centerMarkerSvg(),
      scaledSize: { width: 36, height: 36 } as any,
    };
    icons.user = {
      url: "data:image/svg+xml;charset=UTF-8," + userMarkerSvg(),
      scaledSize: { width: 20, height: 20 } as any,
      anchor: { x: 10, y: 10 } as any,
    };
    return icons;
  }, []);

  // ─── Smart Route Builder functions ────────────────────────────
  const toggleRbMaterial = (mat: string) => {
    setRbMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(mat)) next.delete(mat); else next.add(mat);
      return next;
    });
  };

  const generateRoute = async () => {
    setRbGenerating(true);
    setRbResult(null);
    try {
      const res = await fetch("/api/routes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: userLocation.lat,
          lng: userLocation.lng,
          materials: rbMaterials.size > 0 ? Array.from(rbMaterials) : undefined,
          maxKg: parseFloat(rbMaxKg) || 200,
          maxHours: parseFloat(rbMaxHours) || 4,
          pricingMode: rbPricing,
          radiusKm: parseFloat(rbRadiusKm) || 20,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }
      const data = await res.json();
      setRbResult(data);
      if (data.stops?.length === 0) {
        toast.info("No listings match your criteria. Try wider filters.");
      } else {
        toast.success(`Route generated: ${data.stops.length} stops, ${data.predictions.totalTimeFormatted}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRbGenerating(false);
    }
  };

  const createBatchFromRoute = async () => {
    if (!rbResult?.listingIds?.length) return;
    setRbCreating(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingIds: rbResult.listingIds,
          optimizedRoute: rbResult.optimizedRoute,
          autoClaim: true,
          estimatedEarnings: rbResult.predictions.estimatedEarnings,
          zone: rbResult.center?.name || "Auto-generated",
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create batch");
      }
      const batch = await res.json();
      toast.success("Route created and claimed! Redirecting...");
      router.push(`/batches/${batch.id}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRbCreating(false);
    }
  };

  // Route preview marker SVG (numbered, different style)
  const routePreviewMarkerSvg = (num: number) =>
    `data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40"><path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" fill="%236366f1" stroke="white" stroke-width="2.5"/><circle cx="16" cy="15" r="10" fill="white"/><text x="16" y="19" text-anchor="middle" font-size="12" font-weight="bold" fill="%236366f1" font-family="sans-serif">${num}</text></svg>`;

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* ─── Filter bar ─── */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto">
          <Button
            variant={showFilters ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1 shrink-0"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {(materialFilter.size > 0 || pricingFilter !== "all") && (
              <Badge variant="secondary" className="ml-0.5 h-4 min-w-[16px] px-1 text-[9px]">
                {materialFilter.size + (pricingFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>

          <div className="h-5 w-px bg-border shrink-0" />

          <Button
            variant={showListings ? "default" : "outline"}
            size="sm"
            onClick={() => setShowListings(!showListings)}
            className="gap-1 shrink-0"
          >
            {showListings ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Listings ({filteredListings?.length || 0})
          </Button>
          <Button
            variant={showCenters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCenters(!showCenters)}
            className="gap-1 shrink-0"
          >
            {showCenters ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Centers ({centers?.length || 0})
          </Button>

          <div className="h-5 w-px bg-border shrink-0" />

          <Button
            variant={showRouteBuilder ? "default" : "outline"}
            size="sm"
            onClick={() => { setShowRouteBuilder(!showRouteBuilder); setShowFilters(false); }}
            className={cn("gap-1 shrink-0", showRouteBuilder && "bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 hover:from-indigo-600 hover:to-purple-600")}
          >
            <Zap className="h-3.5 w-3.5" />
            Smart Route
          </Button>

          <div className="flex-1" />

          <span className="hidden sm:inline text-[11px] text-muted-foreground shrink-0">
            <strong className="text-foreground">{formatKg((filteredListings || []).reduce((s, l) => s + (l.estimatedKg || 0), 0))}</strong> available
          </span>

          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => refetchListings()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* ─── Expanded filters panel ─── */}
        {showFilters && (
          <div className="border-t px-3 py-2.5 space-y-2.5">
            {/* Pricing filter */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Pricing</p>
              <div className="flex gap-1.5">
                {([
                  { key: "all" as const, label: "All", icon: Package, count: listings?.length || 0 },
                  { key: "free" as const, label: "Free", icon: Gift, count: freeCount },
                  { key: "for_sale" as const, label: "For Sale", icon: Tag, count: saleCount },
                ] as const).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setPricingFilter(opt.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all border",
                      pricingFilter === opt.key
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border/50 hover:bg-muted/50"
                    )}
                  >
                    <opt.icon className="h-3 w-3" />
                    {opt.label}
                    <span className="text-[9px] opacity-70">({opt.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Material checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Materials</p>
                {materialFilter.size > 0 && (
                  <button onClick={() => setMaterialFilter(new Set())} className="text-[10px] text-destructive hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {Object.entries(materialCounts).sort((a, b) => b[1] - a[1]).map(([mat, count]) => {
                  const isActive = materialFilter.size === 0 || materialFilter.has(mat);
                  const color = MATERIAL_COLORS[mat] || "#64748b";
                  return (
                    <button
                      key={mat}
                      onClick={() => toggleMaterial(mat)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all text-left",
                        materialFilter.has(mat)
                          ? "border-current shadow-sm"
                          : materialFilter.size === 0
                          ? "border-border/50 bg-background hover:bg-muted/30"
                          : "border-border/30 bg-muted/20 text-muted-foreground/50 hover:bg-muted/40"
                      )}
                      style={materialFilter.has(mat) ? { borderColor: color, backgroundColor: color + "10", color } : undefined}
                    >
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border" style={{ borderColor: color, backgroundColor: materialFilter.has(mat) ? color : "transparent" }}>
                        {materialFilter.has(mat) && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color, opacity: isActive ? 1 : 0.3 }} />
                      <span className="truncate">{MATERIAL_LABELS[mat] || mat}</span>
                      <span className="ml-auto text-[9px] opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border/30">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Legend:</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-white" />
                <span>= Free</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="h-3 w-3 rounded-full border-2 border-white bg-amber-500 shadow-sm" />
                <span>= For Sale</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="h-3 w-3 rounded bg-emerald-600" />
                <span>= Center ♻</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="h-3 w-3 rounded-full bg-blue-500 border border-white" />
                <span>= You</span>
              </div>
            </div>
          </div>
        )}

        {/* ─── Smart Route Builder Panel ─── */}
        {showRouteBuilder && (
          <div className="border-t bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 max-h-[60vh] overflow-y-auto">
            <div className="px-3 py-3 space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">Smart Route Builder</p>
                  <p className="text-[10px] text-muted-foreground">AI-powered route generation with graph optimization</p>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={() => { setShowRouteBuilder(false); setRbResult(null); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {!hasRealLocation && (
                <div className="flex items-center gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-800/30 p-2 text-xs text-amber-700 dark:text-amber-300">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  Enable location access for best results. Using default: Mérida center.
                </div>
              )}

              {/* Material filter */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Materials {rbMaterials.size > 0 ? `(${rbMaterials.size} selected)` : "(all)"}
                </p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(MATERIAL_LABELS).map(([mat, label]) => {
                    const color = MATERIAL_COLORS[mat] || "#64748b";
                    const isActive = rbMaterials.has(mat);
                    return (
                      <button
                        key={mat}
                        onClick={() => toggleRbMaterial(mat)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition-all",
                          isActive
                            ? "shadow-sm"
                            : "border-border/40 bg-background text-muted-foreground hover:bg-muted/30"
                        )}
                        style={isActive ? { borderColor: color, backgroundColor: color + "15", color } : undefined}
                      >
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: color, opacity: isActive ? 1 : 0.4 }} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Constraints row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                    <Weight className="h-3 w-3" /> Max kg
                  </label>
                  <Input type="number" value={rbMaxKg} onChange={(e) => setRbMaxKg(e.target.value)} className="h-8 text-xs" min="10" max="2000" step="10" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" /> Max hours
                  </label>
                  <Input type="number" value={rbMaxHours} onChange={(e) => setRbMaxHours(e.target.value)} className="h-8 text-xs" min="0.5" max="12" step="0.5" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                    <Route className="h-3 w-3" /> Radius km
                  </label>
                  <Input type="number" value={rbRadiusKm} onChange={(e) => setRbRadiusKm(e.target.value)} className="h-8 text-xs" min="1" max="100" step="1" />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1 mb-1">
                    <Tag className="h-3 w-3" /> Pricing
                  </label>
                  <select
                    value={rbPricing}
                    onChange={(e) => setRbPricing(e.target.value as any)}
                    className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                  >
                    <option value="all">All</option>
                    <option value="free">Free only</option>
                    <option value="for_sale">For sale only</option>
                  </select>
                </div>
              </div>

              {/* Generate button */}
              <Button
                className="w-full gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
                onClick={generateRoute}
                disabled={rbGenerating}
              >
                {rbGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                {rbGenerating ? "Generating optimal route..." : "Generate Smart Route"}
              </Button>

              {/* ─── Results ─── */}
              {rbResult && rbResult.stops?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  {/* Predictions grid */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { icon: MapPin, value: String(rbResult.predictions.totalStops), label: "Stops", color: "text-indigo-500" },
                      { icon: Weight, value: `${rbResult.predictions.totalKg}kg`, label: "Total", color: "text-emerald-500" },
                      { icon: Clock, value: rbResult.predictions.totalTimeFormatted, label: "Time", color: "text-amber-500" },
                      { icon: Route, value: `${rbResult.predictions.totalDistanceKm}km`, label: "Distance", color: "text-blue-500" },
                    ].map((s, i) => (
                      <div key={i} className="rounded-lg bg-background/80 border border-border/40 p-2 text-center">
                        <s.icon className={cn("mx-auto mb-0.5 h-3.5 w-3.5", s.color)} />
                        <p className="text-xs font-bold">{s.value}</p>
                        <p className="text-[8px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Earnings estimate */}
                  <div className="rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200/40 dark:border-emerald-800/30 p-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                        <div>
                          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">Est. Earnings (60%)</p>
                          <p className="text-[10px] text-muted-foreground">Fuel: ~{formatCurrency(rbResult.predictions.estimatedFuelCost)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(rbResult.predictions.estimatedEarnings)}</p>
                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">
                          Profit: ~{formatCurrency(rbResult.predictions.estimatedProfit)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stops preview (compact) */}
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                      Route stops ({rbResult.stops.length})
                    </p>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {rbResult.stops.map((stop: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 rounded-md bg-background/60 border border-border/30 px-2 py-1.5">
                          <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-[9px] font-bold text-white">
                            {i + 1}
                          </div>
                          <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: MATERIAL_COLORS[stop.materialType] || "#888" }} />
                          <span className="text-[10px] font-medium truncate flex-1">
                            {MATERIAL_LABELS[stop.materialType] || stop.materialType} — {stop.estimatedKg}kg
                          </span>
                          <span className="text-[9px] text-muted-foreground shrink-0">{stop.segmentKm}km</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center destination */}
                  {rbResult.center && (
                    <div className="flex items-center gap-2 rounded-lg bg-background/60 border border-border/30 p-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500 text-xs">♻</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium truncate">{rbResult.center.name}</p>
                        <p className="text-[9px] text-muted-foreground">
                          Return: {rbResult.predictions.returnToCenter.distanceKm}km · {Math.round(rbResult.predictions.returnToCenter.durationMin)}min
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Create batch button */}
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                    onClick={createBatchFromRoute}
                    disabled={rbCreating}
                  >
                    {rbCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                    {rbCreating ? "Creating route..." : "Accept & Start Route"}
                  </Button>

                  <p className="text-[9px] text-center text-muted-foreground">
                    {rbResult.candidatesScanned} listings scanned · {rbResult.algorithm}
                  </p>
                </motion.div>
              )}

              {/* No results message */}
              {rbResult && rbResult.stops?.length === 0 && (
                <div className="text-center py-4">
                  <Package className="mx-auto h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">No listings match your criteria</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-1">Try increasing radius, time, or removing material filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Map ─── */}
      <div className="relative flex-1" style={{ minHeight: 0, minWidth: 0 }}>
        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/50">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Google Maps API key not configured</p>
          </div>
        ) : (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}>
          <Map
            defaultCenter={userLocation}
            defaultZoom={DEFAULT_MAP_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, minHeight: '400px' }}
            styles={isDark ? DARK_MAP_STYLES as any : undefined}
          >
            {/* Listing markers — color-coded by material */}
            {showListings &&
              filteredListings?.map((listing) => {
                const key = `${listing.materialType}_${listing.pricingMode === "free" ? "free" : "sale"}`;
                return (
                  <Marker
                    key={listing.id}
                    position={{ lat: listing.latitude, lng: listing.longitude }}
                    onClick={() => handleListingClick(listing)}
                    title={`${MATERIAL_LABELS[listing.materialType] || listing.materialType} · ${listing.estimatedKg}kg · ${listing.pricingMode === "free" ? "FREE" : formatCurrency(listing.pricePerKg || 0) + "/kg"}`}
                    icon={markerIcons[key] || undefined}
                  />
                );
              })}

            {/* Center markers — green recycling squares */}
            {showCenters &&
              centers?.map((center) => (
                <Marker
                  key={center.id}
                  position={{ lat: center.latitude, lng: center.longitude }}
                  onClick={() => handleCenterClick(center)}
                  title={`♻ ${center.name}`}
                  icon={markerIcons.center}
                />
              ))}

            {/* User location — blue dot */}
            <Marker position={userLocation} title="Your location" icon={markerIcons.user} />

            {/* Route preview markers (from Smart Route Builder) */}
            {rbResult?.stops?.map((stop: any, i: number) => (
              <Marker
                key={`rb-${i}`}
                position={{ lat: stop.lat, lng: stop.lng }}
                title={`Stop ${i + 1}: ${MATERIAL_LABELS[stop.materialType] || stop.materialType} — ${stop.estimatedKg}kg`}
                icon={{
                  url: routePreviewMarkerSvg(i + 1),
                  scaledSize: { width: 32, height: 40 } as any,
                  anchor: { x: 16, y: 40 } as any,
                }}
                zIndex={1000 + i}
              />
            ))}

            {/* Route center destination marker */}
            {rbResult?.center && (
              <Marker
                position={{ lat: rbResult.center.lat, lng: rbResult.center.lng }}
                title={`♻ ${rbResult.center.name} (destination)`}
                icon={markerIcons.center}
                zIndex={2000}
              />
            )}
          </Map>
        </APIProvider>
        )}
      </div>

      {/* ─── Selected listing panel ─── */}
      {selectedListing && (
        <div className="absolute bottom-16 left-2 right-2 z-20 sm:left-4 sm:right-4 lg:bottom-6 lg:right-6 lg:left-auto lg:w-96">
          <Card className="border-border/50 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                    style={{ backgroundColor: (MATERIAL_COLORS[selectedListing.materialType] || "#64748b") + "15" }}
                  >
                    <span className="text-sm font-bold" style={{ color: MATERIAL_COLORS[selectedListing.materialType] || "#64748b" }}>
                      {MAT_LETTER[selectedListing.materialType] || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{MATERIAL_LABELS[selectedListing.materialType] || selectedListing.materialType}</p>
                    <p className="text-[11px] text-muted-foreground">by {selectedListing.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    className={cn("text-[10px]",
                      selectedListing.pricingMode === "free"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    )}
                    variant="outline"
                  >
                    {selectedListing.pricingMode === "free" ? (
                      <><Gift className="mr-1 h-3 w-3" /> Free</>
                    ) : (
                      <><Tag className="mr-1 h-3 w-3" /> {formatCurrency(selectedListing.pricePerKg || 0)}/kg</>
                    )}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedListing(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div className="rounded-lg bg-muted/40 px-2.5 py-1">
                  <p className="text-[9px] text-muted-foreground">Weight</p>
                  <p className="text-xs font-bold">{formatKg(selectedListing.estimatedKg)}</p>
                </div>
                {selectedListing.address && (
                  <p className="flex-1 truncate text-[11px] text-muted-foreground">
                    <MapPin className="mr-0.5 inline h-3 w-3" />
                    {selectedListing.address}
                  </p>
                )}
                <Button
                  size="sm"
                  className="gap-1 shrink-0"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedListing.latitude},${selectedListing.longitude}`, "_blank")}
                >
                  <Navigation className="h-3 w-3" />
                  Go
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Selected center panel ─── */}
      {selectedCenter && (
        <div className="absolute bottom-16 left-2 right-2 z-20 sm:left-4 sm:right-4 lg:bottom-6 lg:right-6 lg:left-auto lg:w-96">
          <Card className="border-border/50 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                    <span className="text-lg">♻</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{selectedCenter.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{selectedCenter.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedCenter.isVerified && (
                    <Badge className="gap-0.5 bg-emerald-500/10 text-emerald-500 text-[9px]" variant="outline">
                      <ShieldCheck className="h-2.5 w-2.5" /> Verified
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedCenter(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Buy prices — clean 2-col grid */}
              <div className="mt-2">
                <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Buy Prices</p>
                {loadingPrices ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                ) : centerPrices.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">No prices published</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {centerPrices.filter((p: CenterPrice) => p.pricePerKg > 0).map((price: CenterPrice) => (
                      <div
                        key={price.materialType}
                        className="flex items-center gap-1.5 rounded-md border border-border/40 bg-muted/30 px-2 py-1.5"
                      >
                        <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: MATERIAL_COLORS[price.materialType] || "#64748b" }} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-medium">{MATERIAL_LABELS[price.materialType] || price.materialType}</p>
                          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(price.pricePerKg)}/kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                size="sm"
                className="mt-3 w-full gap-1.5"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.latitude},${selectedCenter.longitude}`, "_blank")}
              >
                <Navigation className="h-3 w-3" />
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
