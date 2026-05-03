"use client";

import { useCallback, useState } from "react";
import { PageLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type UploadResult = {
  ok: true;
  key: string;
  url: string | null;
  hint?: string;
};

export default function AdminMediosPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const onFile = useCallback(async (file: File) => {
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/storage/r2/upload", {
        method: "POST",
        body: fd,
      });
      const text = await res.text();
      let body: unknown;
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        body = { error: text || `HTTP ${res.status}` };
      }
      const parsed = body as {
        ok?: boolean;
        error?: string;
        key?: string;
        url?: string | null;
        hint?: string;
      };
      if (!res.ok) {
        setError(parsed.error ?? `Error ${res.status}`);
        return;
      }
      if (parsed.ok && typeof parsed.key === "string") {
        setResult({
          ok: true,
          key: parsed.key,
          url:
            typeof parsed.url === "string" ? parsed.url : (parsed.url ?? null),
          hint: parsed.hint,
        });
        return;
      }
      setError("Respuesta inesperada del servidor.");
    } catch {
      setError("No se pudo completar la subida.");
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <PageLayout
      title="Medios (Cloudflare R2)"
      description="Sube imágenes al bucket configurado en el servidor. Requiere claves R2 en variables de entorno."
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Subir imagen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              PNG, JPEG o WebP, máximo 5 MB. Las rutas quedan bajo{" "}
              <code className="rounded bg-muted px-1 text-xs">
                uploads/&lt;tu-user-id&gt;/…
              </code>
              .
            </p>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={busy}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void onFile(f);
              }}
            />
            {busy ? (
              <p className="text-sm text-muted-foreground">Subiendo…</p>
            ) : null}
            {error ? (
              <p
                className="text-sm text-destructive whitespace-pre-wrap"
                role="alert"
              >
                {error}
              </p>
            ) : null}
          </CardContent>
        </Card>

        {result ? (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Última subida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">Key: </span>
                <code className="break-all rounded bg-muted px-1 text-xs">
                  {result.key}
                </code>
              </div>
              {result.url ? (
                <div className="space-y-2">
                  <span className="font-medium text-muted-foreground">
                    URL pública:{" "}
                  </span>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-primary underline-offset-4 hover:underline"
                  >
                    {result.url}
                  </a>
                  <div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        void navigator.clipboard.writeText(result.url ?? "")
                      }
                    >
                      Copiar URL
                    </Button>
                  </div>
                  {/* biome-ignore lint/performance/noImgElement: URL dinámica R2; dominio puede no estar en remotePatterns */}
                  <img
                    src={result.url}
                    alt="Vista previa"
                    className="mt-2 max-h-48 max-w-full rounded-md border border-border object-contain"
                  />
                </div>
              ) : (
                <p className="text-muted-foreground">
                  No hay URL pública en la respuesta.
                  {result.hint
                    ? ` ${result.hint}`
                    : " Configura R2_PUBLIC_BASE_URL en el servidor."}
                </p>
              )}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </PageLayout>
  );
}
