"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Layers,
  Loader2,
  MapPin,
  Package,
  Play,
  CheckCircle2,
  XCircle,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { STATUS_COLORS } from "@/lib/constants";
import { formatKg } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function BatchesPage() {
  const queryClient = useQueryClient();

  const { data: availableBatches, isLoading: loadingAvailable } = useQuery({
    queryKey: ["batches", "available"],
    queryFn: async () => {
      const res = await fetch("/api/batches?status=available");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: myBatches, isLoading: loadingMy } = useQuery({
    queryKey: ["batches", "mine"],
    queryFn: async () => {
      const res = await fetch("/api/batches");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
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
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      const messages: Record<string, string> = {
        claim: "Batch claimed! Check your route.",
        start: "Route started. Good luck!",
        complete: "Batch completed!",
        cancel: "Batch cancelled.",
      };
      toast.success(messages[action] || "Done");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function BatchCard({ batch, showActions }: { batch: any; showActions: boolean }) {
    return (
      <Link href={`/batches/${batch.id}`}>
      <Card className="cursor-pointer border-border/50 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl hover:shadow-black/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-primary" />
              Batch #{batch.id.slice(0, 8)}
            </CardTitle>
            <Badge
              className={cn("text-xs", STATUS_COLORS[batch.status] || "")}
              variant="secondary"
            >
              {batch.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Stops</span>
            <span className="font-medium">{batch.stopsCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated weight</span>
            <span className="font-medium">{formatKg(batch.totalEstimatedKg || 0)}</span>
          </div>
          {batch.zone && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              {batch.zone}
            </div>
          )}
          {batch.scheduledDate && (
            <div className="text-xs text-muted-foreground">
              Scheduled: {batch.scheduledDate} {batch.scheduledTime || ""}
            </div>
          )}

          {showActions && (
            <div className="flex gap-2 pt-2">
              {batch.status === "available" && (
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); actionMutation.mutate({ id: batch.id, action: "claim" }); }}
                  disabled={actionMutation.isPending}
                >
                  <Truck className="h-3.5 w-3.5" />
                  Claim
                </Button>
              )}
              {batch.status === "assigned" && (
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); actionMutation.mutate({ id: batch.id, action: "start" }); }}
                  disabled={actionMutation.isPending}
                >
                  <Play className="h-3.5 w-3.5" />
                  Start Route
                </Button>
              )}
              {batch.status === "in_progress" && (
                <Button
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); actionMutation.mutate({ id: batch.id, action: "complete" }); }}
                  disabled={actionMutation.isPending}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Complete
                </Button>
              )}
              {(batch.status === "assigned" || batch.status === "available") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); actionMutation.mutate({ id: batch.id, action: "cancel" }); }}
                  disabled={actionMutation.isPending}
                >
                  <XCircle className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </Link>
    );
  }

  return (
    <div className="container max-w-5xl space-y-6 py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-bold lg:text-3xl">Batches</h1>
        <p className="text-sm text-muted-foreground">
          Claim pickup batches and manage your collection routes
        </p>
      </motion.div>

      <Tabs defaultValue="available">
        <TabsList className="w-full">
          <TabsTrigger value="available" className="flex-1">
            Available
          </TabsTrigger>
          <TabsTrigger value="mine" className="flex-1">
            My Batches
          </TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          {loadingAvailable ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !availableBatches || availableBatches.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No available batches</h3>
              <p className="text-sm text-muted-foreground">
                Check back later for new pickup routes
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {availableBatches.map((b: any) => (
                <BatchCard key={b.id} batch={b} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="mine" className="space-y-4">
          {loadingMy ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : !myBatches || myBatches.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Layers className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No batches yet</h3>
              <p className="text-sm text-muted-foreground">
                Claim an available batch to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {myBatches.map((b: any) => (
                <BatchCard key={b.id} batch={b} showActions={true} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
