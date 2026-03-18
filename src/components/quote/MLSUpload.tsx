import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ── Types ──

export interface MLSMappedData {
  propertyType?: string;
  yearBuilt?: string;
  sqft?: string;
  units?: string;
  storeys?: string;
  constructionType?: string;
  heatingType?: string;
  roofType?: string;
  basement?: string;
  replacementCost?: string;
  listPrice?: string;
  salePrice?: string;
  address?: string;
  bedrooms?: string;
  bathrooms?: string;
  lotSize?: string;
}

export interface MLSExtractionResult {
  mapped: MLSMappedData;
  confidence: number;
  rawFields: Record<string, string>;
}

// ── Full-page MLS Upload ──

interface MLSUploadProps {
  onExtracted: (result: MLSExtractionResult) => void;
  onSkip: () => void;
}

export function MLSUpload({ onExtracted, onSkip }: MLSUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const result = await extractMLSData(file);
      toast({ title: "MLS data extracted", description: "Property fields have been auto-filled from your listing sheet." });
      onExtracted(result);
    } catch (err: any) {
      setError(err.message || "Failed to extract data from MLS sheet.");
    } finally {
      setLoading(false);
    }
  }, [file, onExtracted, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl mb-2">Upload your MLS listing sheet</h2>
        <p className="text-muted-foreground">
          Upload the MLS listing PDF or image and we'll auto-fill your property details. You can also skip this step.
        </p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-accent/50 transition-colors cursor-pointer"
        onClick={() => document.getElementById("mls-file-input")?.click()}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="w-8 h-8 text-accent" />
            <div className="text-left">
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="ml-2 text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">Drop your MLS sheet here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG — max 10 MB</p>
          </>
        )}
        <input
          id="mls-file-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button
          variant="hero"
          className="flex-1"
          disabled={!file || loading}
          onClick={handleUpload}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Extract & Auto-Fill
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onSkip} disabled={loading}>
          Skip
        </Button>
      </div>
    </div>
  );
}

// ── Inline MLS Upload (compact, for property details step) ──

interface MLSUploadInlineProps {
  onExtracted: (result: MLSExtractionResult) => void;
}

export function MLSUploadInline({ onExtracted }: MLSUploadInlineProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setLoading(true);
    setError(null);

    try {
      const result = await extractMLSData(f);
      toast({ title: "MLS data extracted", description: "Fields updated from your listing sheet." });
      setDone(true);
      onExtracted(result);
    } catch (err: any) {
      setError(err.message || "Extraction failed.");
    } finally {
      setLoading(false);
    }
  }, [onExtracted, toast]);

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-4 py-3 mb-4">
        <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
        <span className="text-xs text-accent font-medium">
          MLS listing data applied — review fields below.
        </span>
      </div>
    );
  }


  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-xl border border-dashed bg-card/50 p-4 mb-4 transition-colors ${dragging ? "border-accent bg-accent/5" : "border-border"}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Have an MLS listing sheet?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag & drop your PDF or image here, or click to browse. We'll auto-fill fields using AI extraction.
          </p>

          {loading && (
            <div className="flex items-center gap-2 mt-3 text-accent text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Extracting property data...</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 mt-3 text-destructive text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && (
            <div className="mt-3">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload MLS Sheet
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared extraction logic ──

async function extractMLSData(file: File): Promise<MLSExtractionResult> {
  // Convert file to base64
  const base64 = await fileToBase64(file);
  const mimeType = file.type || "application/pdf";

  const { data, error } = await supabase.functions.invoke("extract-mls", {
    body: { fileBase64: base64, mimeType, fileName: file.name },
  });

  if (error) throw new Error(error.message || "Extraction service unavailable.");
  if (!data?.mapped) throw new Error("No property data could be extracted.");

  return data as MLSExtractionResult;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip data URL prefix
      const base64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
