import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Página no encontrada</h1>
      <p className="text-muted-foreground">El recurso que buscas no existe o ha sido movido.</p>
      <Link
        href="/mis-disenos"
        className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Volver a Mis diseños
      </Link>
    </div>
  );
}
