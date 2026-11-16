import {
  BadgeCheck,
  BarChart3,
  MessageCircle,
  Package,
  ShieldCheck,
  Store,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vende en The Spot",
  description:
    "Registra tu tienda en The Spot: publica tus productos, recibe pedidos y cobra directo a tus cuentas. Sin mensualidad.",
};

const STEPS = [
  {
    icon: Store,
    title: "Registra tu tienda",
    text: "Crea tu cuenta y cuéntanos qué vendes. Toma 3 minutos.",
  },
  {
    icon: BadgeCheck,
    title: "Te aprobamos",
    text: "Revisamos que tu tienda cumpla nuestras políticas y te avisamos por correo.",
  },
  {
    icon: Package,
    title: "Sube tus productos",
    text: "Fotos, precios, tallas, colores e inventario desde tu panel.",
  },
  {
    icon: Wallet,
    title: "Vende y cobra",
    text: "Los pedidos te llegan al panel y por WhatsApp. El cliente te paga a ti.",
  },
];

const BENEFITS = [
  {
    icon: Wallet,
    title: "Cobras directo",
    text: "Contra entrega o transferencia a tus propias cuentas bancarias.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp integrado",
    text: "Cada pedido trae un botón para escribirle al cliente al instante.",
  },
  {
    icon: BarChart3,
    title: "Reportes de ventas",
    text: "Ventas, ganancias, productos más vendidos. Exporta en PDF y CSV.",
  },
  {
    icon: ShieldCheck,
    title: "Marketplace confiable",
    text: "Todas las tiendas pasan por revisión: los clientes compran tranquilos.",
  },
];

export default function VenderPage() {
  return (
    <div className="bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-rose-500 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
              The Spot para negocios
            </p>
            <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
              Vende en el marketplace de República Dominicana
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/90">
              Abre tu tienda en The Spot, llega a más clientes y gestiona tus
              pedidos desde un panel hecho para ti. Sin mensualidad.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/vender/registro"
                className="inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-bold text-red-700 shadow-lg transition hover:scale-[1.02]"
              >
                Registrar mi tienda
              </Link>
              <Link
                href="/login?next=/panel"
                className="inline-flex h-12 items-center rounded-full border border-white/60 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {BENEFITS.map((b) => (
              <div
                key={b.title}
                className="rounded-2xl bg-white/10 p-5 backdrop-blur-sm ring-1 ring-white/20"
              >
                <b.icon className="size-6" aria-hidden />
                <p className="mt-3 font-semibold">{b.title}</p>
                <p className="mt-1 text-sm text-white/80">{b.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-black tracking-tight sm:text-3xl">
          ¿Cómo funciona?
        </h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <s.icon className="size-5 text-primary" aria-hidden />
              </div>
              <p className="mt-4 font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20">
        <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-sm">
          <p className="font-semibold text-foreground">Qué no se permite</p>
          <p className="mt-1 text-muted-foreground">
            Contenido sexual o para adultos, armas, drogas, medicamentos
            controlados, réplicas o falsificaciones, animales vivos y cualquier
            producto ilegal en República Dominicana.{" "}
            <Link
              href="/vender/politicas"
              className="font-medium text-primary hover:underline"
            >
              Leer políticas completas
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
