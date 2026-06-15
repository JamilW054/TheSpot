"use client";

import { Bell, Globe, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { adminCreateNotification, adminDeleteNotification } from "@/lib/actions/admin-crud";
import { ResourceDeleteButton } from "./resource-delete-button";
import { NotificationForm } from "./notification-form";

interface NotificationRow {
  id: string;
  title: string;
  body: string;
  type: string;
  target: string;
  link_path?: string | null;
  created_at: string;
}

interface UserOption {
  id: string;
  display: string;
}

interface Props {
  initialRows: NotificationRow[];
  users: UserOption[];
}

function getInitial(display: string) {
  return display.trim().charAt(0).toUpperCase();
}

export function NotificacionesManager({ initialRows, users }: Props) {
  const router = useRouter();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | undefined>(undefined);
  const formKeyRef = useRef(0);
  const [formKey, setFormKey] = useState(0);
  const [previewRow, setPreviewRow] = useState<NotificationRow | null>(null);
  const [userSearch, setUserSearch] = useState("");

  const filteredUsers = users.filter((u) =>
    u.display.toLowerCase().includes(userSearch.toLowerCase()),
  );

  const openBroadcast = useCallback(() => {
    formKeyRef.current += 1;
    setFormKey(formKeyRef.current);
    setTargetUserId(undefined);
    setDrawerOpen(true);
  }, []);

  const openForUser = useCallback((userId: string) => {
    formKeyRef.current += 1;
    setFormKey(formKeyRef.current);
    setTargetUserId(userId);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const handleSuccess = useCallback(() => {
    closeDrawer();
    router.refresh();
  }, [closeDrawer, router]);

  const targetUserDisplay = targetUserId
    ? (users.find((u) => u.id === targetUserId)?.display ?? "Usuario")
    : undefined;

  const btnCls =
    "inline-flex size-8 items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <>
      {/* ── Header actions ── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={openBroadcast}
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <Globe className="size-4" aria-hidden />
          Notificación global
        </button>
      </div>

      {/* ── Historial ── */}
      <section className="mb-8">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Historial
        </h2>
        {initialRows.length === 0 ? (
          <div className="rounded-[14px] border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
            No hay notificaciones todavía.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[14px] border border-border">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Título", "Tipo", "Destinatario", "Fecha", "Acciones"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-[13px] font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {initialRows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="px-4 py-3 font-medium text-sm">{row.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant="default">{row.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {row.target === "broadcast" ? (
                        <span className="text-muted-foreground">Todos</span>
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">
                          {users.find((u) => u.id === row.target)?.display ??
                            row.target.slice(0, 8) + "…"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(row.created_at).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewRow(row)}
                          className={btnCls}
                          aria-label="Ver detalles"
                          title="Ver detalles"
                        >
                          <Bell className="size-3.5" aria-hidden />
                        </button>
                        <ResourceDeleteButton
                          action={adminDeleteNotification}
                          id={row.id}
                          title="¿Eliminar notificación?"
                          description="Se eliminará del historial."
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Usuarios ── */}
      <section>
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Usuarios ({users.length})
        </h2>
        <div className="rounded-[14px] border border-border bg-card">
          {/* Search */}
          <div className="border-b border-border p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden />
              <Input
                type="search"
                placeholder="Buscar usuario..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* List */}
          {filteredUsers.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No se encontraron usuarios.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {filteredUsers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20"
                >
                  {/* Avatar */}
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[13px] font-bold text-primary">
                    {getInitial(u.display)}
                  </span>
                  {/* Name */}
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                    {u.display}
                  </span>
                  {/* Bell button */}
                  <button
                    type="button"
                    onClick={() => openForUser(u.id)}
                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-transparent px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    aria-label={`Enviar notificación a ${u.display}`}
                    title={`Notificar a ${u.display}`}
                  >
                    <Bell className="size-3.5" aria-hidden />
                    Notificar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* ── Drawer ── */}
      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={targetUserDisplay ? `Notificar a ${targetUserDisplay}` : "Notificación global"}
      >
        <NotificationForm
          key={formKey}
          action={adminCreateNotification}
          users={users}
          defaultTargetUserId={targetUserId}
          onSuccess={handleSuccess}
          onCancel={closeDrawer}
        />
      </Drawer>

      {/* ── Preview modal ── */}
      {previewRow && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop closes modal */}
          <div
            aria-hidden="true"
            onClick={() => setPreviewRow(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />
          <div className="relative z-10 w-full max-w-sm rounded-[14px] border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <p className="text-[15px] font-semibold text-foreground">Notificación</p>
              <button
                type="button"
                onClick={() => setPreviewRow(null)}
                className="flex size-8 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="space-y-4 p-5">
              {[
                { label: "Título", value: previewRow.title },
                { label: "Mensaje", value: previewRow.body },
                { label: "Tipo", value: previewRow.type },
                {
                  label: "Destinatario",
                  value:
                    previewRow.target === "broadcast"
                      ? "Todos los usuarios"
                      : (users.find((u) => u.id === previewRow.target)?.display ?? previewRow.target),
                },
                { label: "Enlace", value: previewRow.link_path ?? "—" },
                {
                  label: "Fecha",
                  value: new Date(previewRow.created_at).toLocaleString("es-ES"),
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label}
                  </p>
                  <p className="text-sm text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
