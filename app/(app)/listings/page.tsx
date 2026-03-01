"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { motion } from "motion/react";
import {
  Plus,
  Package,
  Loader2,
  Trash2,
  Clock,
  MapPin,
  Crosshair,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { AIScanner } from "@/components/ai-scanner";
import { Separator } from "@/components/ui/separator";
import { MATERIAL_LABELS, MATERIAL_COLORS, STATUS_COLORS } from "@/lib/constants";
import { formatKg, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const MERIDA_CENTER = { lat: 20.9674, lng: -89.6235 };
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

export default function ListingsPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [materialType, setMaterialType] = useState("");
  const [estimatedKg, setEstimatedKg] = useState("");
  const [pricingMode, setPricingMode] = useState("free");
  const [pricePerKg, setPricePerKg] = useState("");
  const [description, setDescription] = useState("");
  const [pinLat, setPinLat] = useState(MERIDA_CENTER.lat);
  const [pinLng, setPinLng] = useState(MERIDA_CENTER.lng);
  const [locatingGPS, setLocatingGPS] = useState(false);
  const [mapCenter, setMapCenter] = useState(MERIDA_CENTER);
  const [mapZoom, setMapZoom] = useState(13);

  const goToMyLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported by your browser");
      return;
    }
    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPinLat(lat);
        setPinLng(lng);
        setMapCenter({ lat, lng });
        setMapZoom(16);
        setLocatingGPS(false);
        toast.success("Location found!");
      },
      () => {
        setLocatingGPS(false);
        toast.error("Could not get your location. Drag the pin manually.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const { data: listings, isLoading } = useQuery({
    queryKey: ["my-listings"],
    queryFn: async () => {
      const res = await fetch(`/api/listings?userId=${session?.user?.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!session?.user?.id,
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create listing");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      toast.success("Listing created!");
      setOpen(false);
      resetForm();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-listings"] });
      toast.success("Listing deleted");
    },
    onError: () => {
      toast.error("Failed to delete listing");
    },
  });

  function resetForm() {
    setMaterialType("");
    setEstimatedKg("");
    setPricingMode("free");
    setPricePerKg("");
    setDescription("");
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!materialType || !estimatedKg) {
      toast.error("Material type and weight are required");
      return;
    }

    createMutation.mutate({
      materialType,
      estimatedKg: parseFloat(estimatedKg),
      pricingMode,
      pricePerKg: pricingMode === "for_sale" ? parseFloat(pricePerKg) : undefined,
      description: description || undefined,
      latitude: pinLat,
      longitude: pinLng,
    });
  }

  return (
    <div className="container max-w-5xl space-y-6 py-6 lg:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-bold lg:text-3xl">My Listings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your recyclable material listings
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Listing
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
              <DialogDescription>Add a recyclable material listing with location and details.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <AIScanner
                onResult={(result) => {
                  setMaterialType(result.materialType);
                  setEstimatedKg(String(result.estimatedKg));
                  if (result.description) setDescription(result.description);
                }}
              />
              <div className="relative">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  or fill manually
                </span>
              </div>
              <div className="space-y-2">
                <Label>Material Type</Label>
                <Select value={materialType} onValueChange={setMaterialType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MATERIAL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: MATERIAL_COLORS[value] }}
                          />
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estimated Weight (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="e.g. 5.0"
                  value={estimatedKg}
                  onChange={(e) => setEstimatedKg(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Pricing</Label>
                <Select value={pricingMode} onValueChange={setPricingMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (donation)</SelectItem>
                    <SelectItem value="for_sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {pricingMode === "for_sale" && (
                <div className="space-y-2">
                  <Label>Price per kg (MXN)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 3.50"
                    value={pricePerKg}
                    onChange={(e) => setPricePerKg(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Input
                  placeholder="Any details about the material"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Location picker with map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5 text-xs font-medium">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    Pickup Location
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1 px-2 text-[10px]"
                    onClick={goToMyLocation}
                    disabled={locatingGPS}
                  >
                    {locatingGPS ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Crosshair className="h-3 w-3" />
                    )}
                    My Location
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">Drag the pin to set the exact pickup location</p>
                {MAPS_KEY ? (
                  <div className="relative h-48 w-full overflow-hidden rounded-lg border">
                    <APIProvider apiKey={MAPS_KEY}>
                      <Map
                        center={mapCenter}
                        zoom={mapZoom}
                        onCameraChanged={(ev) => {
                          setMapCenter(ev.detail.center);
                          setMapZoom(ev.detail.zoom);
                        }}
                        gestureHandling="greedy"
                        disableDefaultUI
                        mapId="listing-picker"
                        style={{ width: "100%", height: "100%" }}
                        clickableIcons={false}
                        onClick={(ev) => {
                          if (ev.detail.latLng) {
                            setPinLat(ev.detail.latLng.lat);
                            setPinLng(ev.detail.latLng.lng);
                          }
                        }}
                      >
                        <AdvancedMarker
                          position={{ lat: pinLat, lng: pinLng }}
                          draggable
                          onDragEnd={(ev) => {
                            if (ev.latLng) {
                              setPinLat(ev.latLng.lat());
                              setPinLng(ev.latLng.lng());
                            }
                          }}
                        >
                          <div className="flex flex-col items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/40 ring-2 ring-white">
                              <MapPin className="h-4 w-4 text-white" />
                            </div>
                            <div className="h-2 w-2 rounded-full bg-emerald-500/50 mt-0.5" />
                          </div>
                        </AdvancedMarker>
                      </Map>
                    </APIProvider>
                  </div>
                ) : (
                  <div className="flex h-32 items-center justify-center rounded-lg border border-dashed bg-muted/30">
                    <p className="text-xs text-muted-foreground">Maps API key not configured</p>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground text-center">
                  📍 {pinLat.toFixed(5)}, {pinLng.toFixed(5)}
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="mr-2 h-4 w-4" />
                )}
                Create Listing
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Listings grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !listings || listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="text-lg font-medium">No listings yet</h3>
          <p className="text-sm text-muted-foreground">
            Create your first listing to start recycling
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing: any, i: number) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
            <Link href={`/listings/${listing.id}`}>
            <Card className="cursor-pointer overflow-hidden border-border/50 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-black/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          MATERIAL_COLORS[listing.materialType] || "#64748b",
                      }}
                    />
                    <CardTitle className="text-base">
                      {MATERIAL_LABELS[listing.materialType] ||
                        listing.materialType}
                    </CardTitle>
                  </div>
                  <Badge
                    className={cn(
                      "text-xs",
                      STATUS_COLORS[listing.status] || ""
                    )}
                    variant="secondary"
                  >
                    {listing.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Weight</span>
                  <span className="font-medium">
                    {formatKg(listing.estimatedKg)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pricing</span>
                  <span className="font-medium">
                    {listing.pricingMode === "free"
                      ? "Free"
                      : formatCurrency(listing.pricePerKg || 0) + "/kg"}
                  </span>
                </div>
                {listing.createdAt && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </div>
                )}
                {listing.status === "scheduled" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    className="mt-2 w-full gap-1"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteMutation.mutate(listing.id); }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                )}
              </CardContent>
            </Card>
            </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
