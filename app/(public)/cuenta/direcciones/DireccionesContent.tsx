"use client";

import { useState } from "react";
import { MapPin, Plus, Pencil, Trash2, Star, Check, Loader2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import type { Address, AddressInput } from "@/lib/db/addresses";

interface FormState {
  label: string;
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

const EMPTY_FORM: FormState = {
  label: "",
  fullName: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  phone: "",
  isDefault: false,
};

const inputClass =
  "mt-1 w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60 transition-colors";
const labelClass = "block text-xs font-medium text-muted-foreground";

function toAddressInput(f: FormState): AddressInput {
  return {
    label: f.label.trim() || null,
    fullName: f.fullName.trim(),
    addressLine1: f.addressLine1.trim(),
    addressLine2: f.addressLine2.trim() || null,
    city: f.city.trim(),
    postalCode: f.postalCode.trim(),
    phone: f.phone.trim() || null,
    isDefault: f.isDefault,
    countryCode: "DO",
  };
}

function fromAddress(a: Address): FormState {
  return {
    label: a.label ?? "",
    fullName: a.fullName,
    addressLine1: a.addressLine1,
    addressLine2: a.addressLine2 ?? "",
    city: a.city,
    postalCode: a.postalCode,
    phone: a.phone ?? "",
    isDefault: a.isDefault,
  };
}

function AddressFormFields({
  form,
  onChange,
}: {
  form: FormState;
  onChange: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Etiqueta (opcional)</label>
          <input
            type="text"
            value={form.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className={inputClass}
            placeholder="Casa, Trabajo…"
            maxLength={30}
          />
        </div>
        <div>
          <label className={labelClass}>
            Nombre completo <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={form.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            className={inputClass}
            placeholder="Juan Pérez"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Dirección <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          required
          value={form.addressLine1}
          onChange={(e) => onChange({ addressLine1: e.target.value })}
          className={inputClass}
          placeholder="Calle, número, sector…"
        />
      </div>

      <div>
        <label className={labelClass}>Línea 2 (opcional)</label>
        <input
          type="text"
          value={form.addressLine2}
          onChange={(e) => onChange({ addressLine2: e.target.value })}
          className={inputClass}
          placeholder="Apartamento, piso, residencial…"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            Ciudad <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={form.city}
            onChange={(e) => onChange({ city: e.target.value })}
            className={inputClass}
            placeholder="Santo Domingo"
          />
        </div>
        <div>
          <label className={labelClass}>
            Código postal <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            required
            value={form.postalCode}
            onChange={(e) => onChange({ postalCode: e.target.value })}
            className={inputClass}
            placeholder="10100"
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Teléfono</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => onChange({ phone: e.target.value })}
          className={inputClass}
          placeholder="+1 (809) 000-0000"
        />
      </div>

      <button
        type="button"
        onClick={() => onChange({ isDefault: !form.isDefault })}
        className="flex items-center gap-3 w-full rounded-[10px] border border-border bg-background px-3.5 py-2.5 text-sm text-foreground transition-colors hover:border-primary/40"
      >
        <div
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors ${
            form.isDefault ? "border-primary bg-primary" : "border-border"
          }`}
        >
          {form.isDefault && (
            <Check className="size-3 text-primary-foreground" />
          )}
        </div>
        Usar como dirección predeterminada
      </button>
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  deleting,
  settingDefault,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  deleting: boolean;
  settingDefault: boolean;
}) {
  return (
    <div className="animate-slide-up rounded-[14px] border border-border bg-card p-4 transition-colors hover:border-border/70">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {address.label && (
            <span className="rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-foreground">
              {address.label}
            </span>
          )}
          {address.isDefault && (
            <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
              <Star className="size-3 fill-primary" aria-hidden />
              Predeterminada
            </span>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
            aria-label="Editar"
          >
            <Pencil className="size-3.5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={deleting}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-40"
            aria-label="Eliminar"
          >
            {deleting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      <p className="text-sm font-semibold text-foreground">{address.fullName}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        {address.addressLine1}
        {address.addressLine2 && `, ${address.addressLine2}`}
      </p>
      <p className="text-sm text-muted-foreground">
        {address.city}, {address.postalCode}
      </p>
      {address.phone && (
        <p className="mt-0.5 text-xs text-muted-foreground">{address.phone}</p>
      )}

      {!address.isDefault && (
        <button
          type="button"
          onClick={onSetDefault}
          disabled={settingDefault}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-40"
        >
          {settingDefault ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Star className="size-3" />
          )}
          Establecer como predeterminada
        </button>
      )}
    </div>
  );
}

export function DireccionesContent({
  initialAddresses,
}: {
  initialAddresses: Address[];
}) {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);

  function openAdd() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setDrawerOpen(true);
  }

  function openEdit(address: Address) {
    setEditId(address.id);
    setForm(fromAddress(address));
    setFormError(null);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditId(null);
    setFormError(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    const input = toAddressInput(form);

    try {
      if (editId) {
        const res = await fetch(`/api/addresses/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? "Error al actualizar");
        }
        const updated: Address = await res.json();
        setAddresses((prev) => prev.map((a) => (a.id === editId ? updated : a)));
      } else {
        const res = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error((err as { error?: string }).error ?? "Error al crear");
        }
        const created: Address = await res.json();
        if (created.isDefault) {
          setAddresses((prev) => [
            created,
            ...prev.map((a) => ({ ...a, isDefault: false })),
          ]);
        } else {
          setAddresses((prev) => [created, ...prev]);
        }
      }
      closeDrawer();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (editId === id) closeDrawer();
    } catch {
      // ignore
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSetDefault(id: string) {
    setSettingDefaultId(id);
    try {
      await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _action: "set_default" }),
      });
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      );
    } catch {
      // ignore
    } finally {
      setSettingDefaultId(null);
    }
  }

  return (
    <>
      <div className="space-y-3">
        {addresses.length === 0 && (
          <div className="animate-scale-in rounded-[14px] border border-border bg-card p-12 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted/60">
              <MapPin className="size-8 text-muted-foreground" aria-hidden />
            </div>
            <h2 className="text-base font-semibold text-foreground">
              Sin direcciones guardadas
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
              Agrega una dirección para agilizar tus futuras compras.
            </p>
          </div>
        )}

        {addresses.map((address) => (
          <AddressCard
            key={address.id}
            address={address}
            onEdit={() => openEdit(address)}
            onDelete={() => handleDelete(address.id)}
            onSetDefault={() => handleSetDefault(address.id)}
            deleting={deletingId === address.id}
            settingDefault={settingDefaultId === address.id}
          />
        ))}

        <button
          type="button"
          onClick={openAdd}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] border border-dashed border-border py-4 text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="size-4" aria-hidden />
          Agregar dirección
        </button>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editId ? "Editar dirección" : "Nueva dirección"}
        width="md"
      >
        <form onSubmit={handleSubmit} className="flex h-full flex-col gap-6">
          <AddressFormFields
            form={form}
            onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          />

          {formError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {formError}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-[10px] bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60 disabled:pointer-events-none"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? "Guardando…" : editId ? "Guardar cambios" : "Agregar"}
            </button>
            <button
              type="button"
              onClick={closeDrawer}
              disabled={saving}
              className="rounded-[10px] px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Drawer>
    </>
  );
}
