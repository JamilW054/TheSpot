"use client";

import { Globe, Loader2, Save, User, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";
import type { adminCreateNotification } from "@/lib/actions/admin-crud";

type NotifActionState = { ok?: true; error?: string };

interface UserOption {
  id: string;
  display: string;
}

interface NotificationFormProps {
  action: typeof adminCreateNotification;
  users: UserOption[];
  /** When set the notification targets this user; absent = broadcast */
  defaultTargetUserId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const labelCls = "block text-[13px] font-medium text-foreground mb-1.5";

const TYPE_OPTIONS = [
  { value: "system", label: "Sistema" },
  { value: "promo", label: "Promoción" },
  { value: "order", label: "Pedido" },
  { value: "delivery", label: "Entrega" },
];

export function NotificationForm({
  action,
  users,
  defaultTargetUserId,
  onSuccess,
  onCancel,
}: NotificationFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [state, formAction, pending] = useActionState<
    NotifActionState | undefined,
    FormData
  >(action, undefined);

  const isUser = Boolean(defaultTargetUserId);
  const targetUser = defaultTargetUserId
    ? (users.find((u) => u.id === defaultTargetUserId) ?? null)
    : null;

  const seenState = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seenState.current) return;
    seenState.current = state;
    if (state.ok) {
      showSuccess("Notificación enviada.", () => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.replace("/admin/notificaciones");
          router.refresh();
        }
      });
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, showSuccess, showError, router, onSuccess]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Hidden targeting fields */}
      <input type="hidden" name="target_mode" value={isUser ? "user" : "broadcast"} />
      {isUser && defaultTargetUserId && (
        <input type="hidden" name="target_user_id" value={defaultTargetUserId} />
      )}

      {/* ── Destinatario (read-only badge) ── */}
      <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 ${
        isUser
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-muted/30"
      }`}>
        {isUser ? (
          <User className="size-4 shrink-0 text-primary" aria-hidden />
        ) : (
          <Globe className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        )}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Destinatario
          </p>
          <p className="truncate text-sm font-medium text-foreground">
            {isUser ? (targetUser?.display ?? defaultTargetUserId) : "Todos los usuarios"}
          </p>
        </div>
      </div>

      {/* ── Tipo + Contenido ── */}
      <section className="rounded-[14px] border border-border bg-card p-5 space-y-5">
        <div className="relative">
          <SelectMenu
            id="notif-type"
            name="type"
            label="Tipo"
            defaultValue="system"
            options={TYPE_OPTIONS}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notif-title" className={labelCls}>
            Título <span className="text-destructive">*</span>
          </label>
          <Input
            id="notif-title"
            name="title"
            type="text"
            required
            placeholder="Ej. ¡Tu pedido está en camino!"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notif-body" className={labelCls}>
            Mensaje <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="notif-body"
            name="body"
            rows={4}
            required
            placeholder="Escribe el mensaje que recibirán los usuarios..."
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="notif-link" className={labelCls}>
            Enlace{" "}
            <span className="font-normal text-muted-foreground">(opcional)</span>
          </label>
          <Input id="notif-link" name="link_path" type="text" placeholder="/catalogo" />
          <p className="text-xs text-muted-foreground">
            Ruta interna, p. ej. /catalogo o /mis-pedidos.
          </p>
        </div>
      </section>

      {/* ── Acciones ── */}
      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-[10px] bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {isUser ? "Enviar notificación" : "Enviar a todos"}
        </button>
        <button
          type="button"
          onClick={() =>
            onCancel ? onCancel() : router.push("/admin/notificaciones")
          }
          className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-transparent px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
          Cancelar
        </button>
      </div>
    </form>
  );
}
