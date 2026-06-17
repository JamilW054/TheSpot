"use client";

import { ImagePlus, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
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
  | "color"
  | "image";

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

function ImageUploadField({ field }: { field: ResourceField }) {
  const [url, setUrl] = useState<string>((field.defaultValue as string) ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("scope", "banners");
      const res = await fetch("/api/storage/r2/upload", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url)
        throw new Error(json.error ?? "No se pudo subir.");
      setUrl(json.url);
    } catch (e) {
      setUploadError(
        e instanceof Error ? e.message : "Error al subir la imagen.",
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <span className={labelCls}>{field.label}</span>
      <input type="hidden" name={field.name} value={url} />

      {url ? (
        <div className="relative overflow-hidden rounded-[10px] border border-border bg-muted">
          <Image
            src={url}
            alt="Vista previa"
            width={640}
            height={200}
            className="h-28 w-full object-cover"
            unoptimized={url.startsWith("http")}
          />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
            aria-label="Quitar imagen"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-[10px] border border-dashed border-border bg-muted/40 px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="size-5" aria-hidden />
          )}
          {uploading ? "Subiendo…" : "Subir imagen"}
        </button>
      )}

      {!url && (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading || !!url}
          className="hidden"
          aria-hidden
        />
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      {field.help && (
        <p className="text-[11px] leading-snug text-muted-foreground">
          {field.help}
        </p>
      )}
      {uploadError && (
        <p className="text-[11px] text-destructive">{uploadError}</p>
      )}
    </div>
  );
}

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

  if (field.type === "image") {
    return <ImageUploadField field={field} />;
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
        {field.help ? (
          <p className="text-xs text-muted-foreground">{field.help}</p>
        ) : null}
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
      defaultValue={
        field.defaultValue == null ? "" : String(field.defaultValue)
      }
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
  }, [
    state,
    mode,
    entityLabel,
    listHref,
    showSuccess,
    showError,
    router,
    onSuccess,
  ]);

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
