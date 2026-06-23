"use client";

import { Bell, Check } from "lucide-react";
import { useState, useTransition } from "react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/lib/actions/notifications";
import type { UserNotification } from "@/lib/db/notifications";
import { formatDate } from "@/lib/format-date";

const TYPE_LABEL: Record<string, string> = {
  order: "Pedido",
  delivery: "Envío",
  promo: "Promoción",
  payment: "Pago",
  system: "Sistema",
};

export function NotificacionesContent({
  initial,
}: {
  initial: UserNotification[];
}) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();

  const unread = items.filter((n) => !n.isRead).length;

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    startTransition(() => {
      void markNotificationReadAction(id);
    });
  }

  function markAll() {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    startTransition(() => {
      void markAllNotificationsReadAction();
    });
  }

  if (items.length === 0) {
    return (
      <div className="animate-scale-in rounded-[14px] border border-border bg-card p-12 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
          <Bell className="size-8 text-muted-foreground" aria-hidden />
        </div>
        <h2 className="text-base font-semibold text-foreground">
          Sin notificaciones
        </h2>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
          Cuando tengas novedades sobre tus pedidos o promociones exclusivas
          aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {unread > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {unread} sin leer
          </span>
          <button
            type="button"
            onClick={markAll}
            className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Check className="size-3.5" aria-hidden />
            Marcar todas como leídas
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((n) => {
          const inner = (
            <div
              className={`flex gap-3 rounded-[14px] border p-4 transition-colors ${
                n.isRead
                  ? "border-border bg-card"
                  : "border-primary/40 bg-primary/5"
              }`}
            >
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  n.isRead
                    ? "bg-muted/60 text-muted-foreground"
                    : "bg-primary/15 text-primary"
                }`}
              >
                <Bell className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {n.title}
                  </p>
                  <span className="rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {TYPE_LABEL[n.type] ?? n.type}
                  </span>
                  {!n.isRead && (
                    <span className="ml-auto size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1.5 text-[11px] text-muted-foreground/70">
                  {formatDate(n.createdAt)}
                </p>
              </div>
            </div>
          );

          return (
            <li key={n.id}>
              {n.linkPath ? (
                <a
                  href={n.linkPath}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className="block"
                >
                  {inner}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => !n.isRead && markRead(n.id)}
                  className="block w-full text-left"
                >
                  {inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
