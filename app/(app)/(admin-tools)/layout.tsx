import { RequireAuth } from "@/components/auth";

/**
 * Rutas solo para administradores (editor, líneas, guía, recursos, soporte).
 */
export default function AdminToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <RequireAuth requireAdmin>{children}</RequireAuth>;
}
