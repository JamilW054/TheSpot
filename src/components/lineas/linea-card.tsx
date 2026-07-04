"use client";

import type { Linea } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export interface LineaCardProps {
  linea: Linea;
}

export function LineaCard({ linea }: LineaCardProps) {
  return (
    <Link
      href={`/lineas/${linea.slug}`}
      className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
          <Image
            src={linea.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>
        <CardHeader className="pb-1">
          <h2 className="line-clamp-2 text-base font-semibold leading-tight tracking-tight text-foreground">
            {linea.name}
          </h2>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5 pt-0 text-sm text-muted-foreground">
          <span>
            {linea.items} {linea.items === 1 ? "producto" : "productos"}
          </span>
          <Badge variant={linea.published ? "success" : "default"}>
            {linea.published ? "Publicada" : "Borrador"}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
