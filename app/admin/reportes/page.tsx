"use client";

import { BarChart2 } from "lucide-react";
import Link from "next/link";

export default function AdminReportesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
        Reportes
      </h1>
      <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/80 p-8 text-center">
        <BarChart2 className="mx-auto size-12 text-zinc-500" aria-hidden />
        <p className="mt-3 text-sm text-zinc-400">
          Próximamente: informes de pedidos, ingresos y actividad.
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}
