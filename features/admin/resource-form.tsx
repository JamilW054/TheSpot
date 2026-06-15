"use client";

import { Loader2, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectMenu } from "@/components/ui/select-menu";
import { Textarea } from "@/components/ui/textarea";
import { useAdminFeedback } from "@/contexts/admin-feedback-context";

export type ResourceActionState = { ok?: true; error?: string };

export type ResourceFieldType =
  | "text"
  | "textarea"
  | "number"
  | "money"
  | "checkbox"
  | "url"
  | "select"
  | "datetime"
  | "color";

export interface ResourceFieldOption {
  value: string;
  label: string;
}

export interface ResourceField {
  name: string;
  label: string;
  type: ResourceFieldType;
  required?: boolean;
  placeholder?: string;
  defaultValue?: string | number | boolean | null;
  options?: ResourceFieldOption[];
  help?: string;
  /** Ancho en la rejilla (1 = media columna, 2 = completa). Default 2. */
  colSpan?: 1 | 2;
  min?: number;
  max?: number;
  step?: number;
}

interface ResourceFormProps {
  mode: "create" | "edit";
  fields: ResourceField[];
  action: (
    prev: ResourceActionState | undefined,
    formData: FormData,
  ) => Promise<ResourceActionState>;
  idFieldName?: string;
  idValue?: string;
  listHref?: string;
  entityLabel: string;
  children?: ReactNode;
  /** Drawer mode: called on success instead of navigating to listHref. */
  onSuccess?: () => void;
  /** Drawer mode: called on cancel instead of navigating to listHref. */
  onCancel?: () => void;
}

const labelCls = "block text-[13px] font-medium text-foreground mb-1.5";

function FieldControl({ field }: { field: ResourceField }) {
  const id = `rf-${field.name}`;

  if (field.type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={field.defaultValue === true}
          className="size-4 rounded border-border accent-primary"
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <Textarea
        id={id}
        name={field.name}
        rows={4}
        required={field.required}
        label={field.label}
        help={field.help}
        placeholder={field.placeholder}
        defaultValue={(field.defaultValue as string) ?? ""}
      />
    );
  }

  if (field.type === "select") {
    const opts = field.required
      ? (field.options ?? [])
      : [{ value: "", label: "—" }, ...(field.options ?? [])];
    return (
      <div className="relative">
        <SelectMenu
          id={id}
          name={field.name}
          label={field.label}
          defaultValue={(field.defaultValue as string) ?? ""}
          options={opts}
          placeholder="Seleccionar…"
        />
        {field.help ? (
          <p className="mt-1.5 text-xs text-muted-foreground">{field.help}</p>
        ) : null}
      </div>
    );
  }

  if (field.type === "color") {
    return (
      <div className="space-y-1.5">
        <label htmlFor={id} className={labelCls}>
          {field.label}
        </label>
        <div className="flex items-center gap-3">
          <input
            id={id}
            name={field.name}
            type="color"
            defaultValue={(field.defaultValue as string) || "#000000"}
            className="size-10 cursor-pointer rounded-[10px] border border-border bg-[#0c0c0e] p-1"
          />
          <span className="text-xs text-muted-foreground">
            {(field.defaultValue as string) || "#000000"}
          </span>
        </div>
        {field.help ? <p className="text-xs text-muted-foreground">{field.help}</p> : null}
      </div>
    );
  }

  const inputType =
    field.type === "money"
      ? "text"
      : field.type === "number"
        ? "number"
        : field.type === "url"
          ? "url"
          : field.type === "datetime"
            ? "datetime-local"
            : "text";

  return (
    <Input
        id={id}
        label={field.label}
      help={field.help}
        name={field.name}
        type={inputType}
        required={field.required}
        placeholder={field.placeholder}
        inputMode={field.type === "money" ? "decimal" : undefined}
        min={field.min}
        max={field.max}
        step={field.step}
        defaultValue={field.defaultValue == null ? "" : String(field.defaultValue)}
      />
  );
}

export function ResourceForm({
  mode,
  fields,
  action,
  idFieldName,
  idValue,
  listHref = "",
  entityLabel,
  children,
  onSuccess,
  onCancel,
}: ResourceFormProps) {
  const router = useRouter();
  const { showSuccess, showError } = useAdminFeedback();
  const [state, formAction, pending] = useActionState<
    ResourceActionState | undefined,
    FormData
  >(action, undefined);

  const seenState = useRef<typeof state>(undefined);
  useEffect(() => {
    if (!state || state === seenState.current) return;
    seenState.current = state;
    if (state.ok) {
      showSuccess(
        mode === "create"
          ? `Se creó ${entityLabel} correctamente.`
          : `Se guardó ${entityLabel} correctamente.`,
        () => {
          if (onSuccess) {
            onSuccess();
          } else {
            router.replace(listHref);
            router.refresh();
          }
        },
      );
    } else if (state.error) {
      showError(state.error);
    }
  }, [state, mode, entityLabel, listHref, showSuccess, showError, router, onSuccess]);

  return (
    <form action={formAction} className="space-y-6">
      {mode === "edit" && idFieldName && idValue ? (
        <input type="hidden" name={idFieldName} value={idValue} />
      ) : null}

      <section className="rounded-[14px] border border-border bg-card p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.name}
              className={field.colSpan === 1 ? "" : "sm:col-span-2"}
            >
              <FieldControl field={field} />
            </div>
          ))}
        </div>
      </section>

      {children}

      <div className="flex flex-wrap items-center gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={pending} variant="primary" size="md">
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {mode === "create" ? "Crear" : "Guardar cambios"}
        </Button>
        <Button
          type="button"
          onClick={() => (onCancel ? onCancel() : router.push(listHref))}
          variant="outline"
          size="md"
        >
          <X className="size-4" aria-hidden />
          Cancelar
        </Button>
      </div>
    </form>
  );
}
