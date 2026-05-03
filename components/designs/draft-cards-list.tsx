"use client";

import { FileEdit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAuth } from "@/lib/auth-context";
import type { EditorDraftMeta } from "@/lib/editor-drafts";
import {
  getAllDraftMetaFromLocal,
  removeDraftFromLocal,
} from "@/lib/editor-drafts";

function formatDraftDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffM = Math.floor(diffMs / 60000);
  if (diffM < 1) return "Ahora";
  if (diffM < 60) return `Hace ${diffM} min`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `Hace ${diffH} h`;
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DraftCardsList() {
  const { user, isLoading } = useAuth();
  const [drafts, setDrafts] = useState<EditorDraftMeta[]>([]);

  useEffect(() => {
    setDrafts(getAllDraftMetaFromLocal());
  }, []);

  const handleRemove = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeDraftFromLocal(id);
    setDrafts(getAllDraftMetaFromLocal());
  };

  if (isLoading || user?.role !== "admin") return null;
  if (drafts.length === 0) return null;

  return (
    <section className="mb-8" aria-labelledby="drafts-heading">
      <h2
        id="drafts-heading"
        className="text-lg font-semibold text-foreground mb-3"
      >
        Borradores recientes
      </h2>
      <p className="text-sm text-muted-foreground mb-4">
        Proyectos editados que se guardan automáticamente en este dispositivo.
        Ábrelos para seguir editando.
      </p>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {drafts.map((draft) => (
          <Link
            key={draft.id}
            href={`/editor?draft=${encodeURIComponent(draft.id)}`}
            className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
          >
            <Card className="overflow-hidden transition-shadow hover:shadow-md h-full flex flex-col">
              <div className="relative aspect-4/3 w-full bg-muted/50 flex items-center justify-center">
                <FileEdit
                  className="size-10 text-muted-foreground"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, draft.id)}
                  className="absolute top-2 right-2 rounded-lg p-1.5 bg-background/80 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  aria-label={`Eliminar borrador ${draft.name}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
              <CardHeader className="pb-1">
                <h3 className="text-base font-semibold leading-tight tracking-tight text-foreground line-clamp-2">
                  {draft.name || "Sin título"}
                </h3>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">
                {formatDraftDate(draft.updatedAt)}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
