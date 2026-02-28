"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MATERIAL_LABELS, MATERIAL_COLORS } from "@/lib/constants";
import { toast } from "sonner";

interface ClassificationResult {
  materialType: string;
  confidence: number;
  estimatedKg: number;
  description: string;
}

interface AIScannerProps {
  onResult: (result: ClassificationResult) => void;
}

export function AIScanner({ onResult }: AIScannerProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Convert to base64 and classify
    setLoading(true);
    setResult(null);

    try {
      const base64Reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        base64Reader.onload = () => {
          const base64String = (base64Reader.result as string).split(",")[1];
          resolve(base64String);
        };
        base64Reader.readAsDataURL(file);
      });

      const res = await fetch("/api/ai/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });

      if (!res.ok) {
        throw new Error("Classification failed");
      }

      const data = await res.json();
      setResult(data);
      onResult(data);
      toast.success(`Detected: ${MATERIAL_LABELS[data.materialType] || data.materialType}`);
    } catch {
      toast.error("Failed to classify image. Try again or select manually.");
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview ? (
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 border-dashed py-8"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <Camera className="h-5 w-5" />
          Take Photo or Upload Image
        </Button>
      ) : (
        <Card className="overflow-hidden">
          <div className="relative">
            <img
              src={preview}
              alt="Material preview"
              className="h-48 w-full object-cover"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              onClick={reset}
            >
              <X className="h-4 w-4" />
            </Button>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="flex items-center gap-2 rounded-lg bg-background px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm font-medium">Analyzing...</span>
                </div>
              </div>
            )}
          </div>
          {result && (
            <CardContent className="pt-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">AI Classification</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge
                  style={{
                    backgroundColor: MATERIAL_COLORS[result.materialType] + "20",
                    color: MATERIAL_COLORS[result.materialType],
                    borderColor: MATERIAL_COLORS[result.materialType],
                  }}
                  className="border"
                >
                  {MATERIAL_LABELS[result.materialType] || result.materialType}
                </Badge>
                <Badge variant="outline">{result.confidence}% confident</Badge>
                <Badge variant="outline">~{result.estimatedKg}kg</Badge>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                {result.description}
              </p>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
}
