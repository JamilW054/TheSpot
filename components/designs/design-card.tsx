"use client";

import type { Design } from "@/types";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";

export interface DesignCardProps {
  design: Design;
}

export function DesignCard({ design }: DesignCardProps) {
  return (
    <Link href={`/mis-disenos/${design.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg">
      <Card className="overflow-hidden transition-shadow hover:shadow-md h-full flex flex-col">
        <div className="relative aspect-4/3 w-full bg-muted overflow-hidden">
          {design.coverImage?.trim() ? (
            <Image
              src={design.coverImage}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized={design.coverImage.includes("placehold.co")}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
              Sin imagen
            </div>
          )}
        </div>
        <CardHeader className="pb-1">
          <h2 className="text-base font-semibold leading-tight tracking-tight text-foreground line-clamp-2">
            {design.name}
          </h2>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-muted-foreground">
          Actualizado: {design.updated}
        </CardContent>
      </Card>
    </Link>
  );
}
