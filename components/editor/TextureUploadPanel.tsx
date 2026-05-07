"use client";

import {
  deleteTexture,
  getTextureForExport,
  loadTexture,
  saveTexture,
} from "@/lib/texture-storage";
import JSZip from "jszip";
import { Download, ImagePlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/jpg,image/webp";

export interface TextureUploadPanelProps {
  /** Project/design name for storage key: textura_<projectName>.<ext> */
  projectName: string;
  onTextureChange: (url: string | null) => void;
  /** Capture preview canvas for ZIP export (image + texture) */
  getCanvasAsBlob?: () => Promise<Blob | null>;
  /** Texture with design in correct UV zone (1024x1024, for export) */
  getEffectiveTextureBlob?: () => Promise<Blob | null>;
  /** Export design as JSON (canvas elements + metadata) */
  onExportDesignJson?: () => void;
}

export function TextureUploadPanel({
  projectName,
  onTextureChange,
  getCanvasAsBlob,
  getEffectiveTextureBlob,
  onExportDesignJson,
}: TextureUploadPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onTextureChangeRef = useRef(onTextureChange);
  onTextureChangeRef.current = onTextureChange;

  const projectSlug =
    projectName.replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 64) || "proyecto";

  const loadStored = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = await loadTexture(projectName);
      setPreviewUrl(url);
      onTextureChangeRef.current(url);
    } catch {
      setError("Error al cargar la textura");
    } finally {
      setLoading(false);
    }
  }, [projectName]);

  useEffect(() => {
    loadStored();
  }, [loadStored]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/")) return;

      setLoading(true);
      setError(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      try {
        const url = await saveTexture(projectName, file);
        setPreviewUrl(url);
        onTextureChange(url);
      } catch {
        setError("Error al guardar la textura");
      } finally {
        setLoading(false);
      }
    },
    [projectName, onTextureChange, previewUrl],
  );

  const handleRemove = useCallback(async () => {
    if (previewUrl) {
      if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onTextureChange(null);
    setError(null);
    try {
      await deleteTexture(projectName);
    } catch {
      // Ignore delete errors
    }
  }, [previewUrl, onTextureChange, projectName]);

  const [exporting, setExporting] = useState(false);
  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    try {
      if (getEffectiveTextureBlob) {
        const blob = await getEffectiveTextureBlob();
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `textura_${projectSlug}_1024x1024.png`;
          a.click();
          URL.revokeObjectURL(url);
          return;
        }
      }
      const result = await getTextureForExport(projectName);
      if (!result) {
        setError(
          "No hay textura para exportar. Añade elementos en 2D o sube una imagen.",
        );
        return;
      }
      const url = URL.createObjectURL(result.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Error al exportar la textura");
    } finally {
      setExporting(false);
    }
  }, [projectName, projectSlug, getEffectiveTextureBlob]);

  const [exportingZip, setExportingZip] = useState(false);
  const handleExportZip = useCallback(async () => {
    if (!getCanvasAsBlob) return;
    setExportingZip(true);
    setError(null);
    try {
      const [effectiveBlob, canvasBlob] = await Promise.all([
        getEffectiveTextureBlob?.() ??
          getTextureForExport(projectName).then((r) => r?.blob ?? null),
        getCanvasAsBlob(),
      ]);
      if (!effectiveBlob) {
        setError(
          "No hay textura para exportar. Añade elementos en 2D o sube una imagen.",
        );
        return;
      }
      const zip = new JSZip();
      zip.file(`textura_${projectSlug}_1024x1024.png`, effectiveBlob, {
        binary: true,
      });
      // Prefiere captura del canvas si existe; si no, la textura con diseño aplicado
      zip.file("camiseta_con_diseno.png", canvasBlob ?? effectiveBlob, {
        binary: true,
      });
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `diseno_${projectSlug}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Error al crear el ZIP");
    } finally {
      setExportingZip(false);
    }
  }, [projectName, projectSlug, getCanvasAsBlob, getEffectiveTextureBlob]);

  const [urlInput, setUrlInput] = useState("");
  const handleApplyUrl = useCallback(() => {
    const u = urlInput.trim();
    if (!u) return;
    onTextureChange(u);
    setPreviewUrl(u);
    setUrlInput("");
  }, [urlInput, onTextureChange]);

  return (
    <div className="mt-3 flex flex-col gap-3">
      <h3 className="editor-section-title">Textura de la prenda</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Aplica una imagen como textura completa. Puedes subir un archivo o pegar
        una URL.
      </p>
      <div className="flex flex-col gap-2">
        <label className="text-muted-foreground text-xs">
          Pegar URL de imagen
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyUrl()}
            placeholder="https://…"
            className="flex-1 min-w-0 rounded border border-border bg-background px-2 py-1.5 text-sm text-foreground"
            aria-label="URL de la imagen para la textura"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            disabled={!urlInput.trim()}
            className="shrink-0 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>
        <p className="text-muted-foreground text-xs">o sube un archivo:</p>
        <label className="group flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/20 px-4 py-5 text-center transition-colors hover:border-primary/40 hover:bg-muted/40">
          <input
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFile}
            disabled={loading}
            className="hidden"
            aria-label="Subir imagen como diseño"
          />
          <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
            <ImagePlus className="size-5" />
          </span>
          <span className="text-sm font-medium text-foreground">
            {loading ? "Guardando…" : "Seleccionar imagen"}
          </span>
          <span className="text-xs text-muted-foreground">PNG, JPG o WebP</span>
        </label>
        {previewUrl && (
          <div className="flex flex-col gap-2">
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted/10">
              <img
                src={previewUrl}
                alt="Vista previa del diseño"
                className="h-24 w-full object-contain object-center"
              />
              <div className="absolute right-2 top-2 flex flex-wrap gap-1 justify-end">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="rounded-lg bg-destructive/90 px-2 py-1 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive"
                >
                  Quitar
                </button>
              </div>
            </div>
          </div>
        )}
        {(getEffectiveTextureBlob || getCanvasAsBlob || onExportDesignJson) && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-foreground">Exportar</p>
            <div className="flex flex-wrap gap-2">
              {getCanvasAsBlob && (
                <button
                  type="button"
                  onClick={handleExportZip}
                  disabled={exportingZip}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  title="Descargar ZIP: textura + camiseta con diseño"
                >
                  <Download className="size-3.5" />
                  {exportingZip ? "Creando ZIP…" : "Exportar ZIP"}
                </button>
              )}
              {getEffectiveTextureBlob && (
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
                  title="Solo la imagen (textura 1024×1024)"
                >
                  <Download className="size-3.5" />
                  {exporting ? "Exportando…" : "Solo imagen"}
                </button>
              )}
              {onExportDesignJson && (
                <button
                  type="button"
                  onClick={onExportDesignJson}
                  className="flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80 disabled:opacity-50"
                  title="Descargar JSON del diseño (elementos + metadatos)"
                >
                  <Download className="size-3.5" />
                  Exportar JSON
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              ZIP: textura 1024×1024 + captura de vista previa o textura con
              diseño (
              <code className="rounded bg-muted/60 px-1 font-mono">
                diseno_{projectSlug}.zip
              </code>
              ).
            </p>
          </div>
        )}
        {error && (
          <p className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
