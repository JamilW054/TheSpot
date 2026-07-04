"use client";

import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export interface SelectMenuOption {
  value: string;
  label: string;
}

export interface SelectMenuProps {
  options: SelectMenuOption[];
  /** Controlled value */
  value?: string;
  /** Uncontrolled default */
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  /** Native form field name (renders a hidden input) */
  name?: string;
  label?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export function SelectMenu({
  options,
  value: controlledValue,
  defaultValue = "",
  onChange,
  placeholder = "Seleccionar…",
  name,
  label,
  disabled = false,
  id: idProp,
  className = "",
}: SelectMenuProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
  } | null>(null);
  const [internalValue, setInternalValue] = useState(
    controlledValue ?? defaultValue,
  );

  // Sync controlled value
  useEffect(() => {
    if (controlledValue !== undefined) setInternalValue(controlledValue);
  }, [controlledValue]);

  // El menú se renderiza en un portal con posición `fixed` para que ningún
  // ancestro con `overflow-hidden` (p.ej. la tarjeta de la tabla) lo recorte.
  // Si no hay espacio suficiente debajo del trigger (filas al final de una
  // lista larga), el menú se abre hacia arriba en su lugar.
  const updateCoords = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const estimatedMenuHeight = Math.min(options.length * 40 + 8, 232);
    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;
    const openUp =
      spaceBelow < estimatedMenuHeight + 8 && spaceAbove > spaceBelow;
    setCoords(
      openUp
        ? { bottom: window.innerHeight - r.top + 4, left: r.left, width: r.width }
        : { top: r.bottom + 4, left: r.left, width: r.width },
    );
  }, [options.length]);

  useLayoutEffect(() => {
    if (!open) return;
    updateCoords();
    window.addEventListener("scroll", updateCoords, true);
    window.addEventListener("resize", updateCoords);
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [open, updateCoords]);

  // Close on outside click (trigger y menú viven en árboles DOM distintos).
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (containerRef.current?.contains(t)) return;
      if (menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  function handleSelect(val: string) {
    setInternalValue(val);
    onChange?.(val);
    setOpen(false);
  }

  const selectedOption = options.find((o) => o.value === internalValue);
  const displayLabel = selectedOption?.label;

  return (
    <div ref={containerRef} className={`relative space-y-1.5 ${className}`}>
      {label ? (
        <label
          htmlFor={id}
          className="block text-[13px] font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}

      {/* Hidden input for form submission */}
      {name ? <input type="hidden" name={name} value={internalValue} /> : null}

      {/* Trigger */}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between gap-2 rounded-[10px] border bg-background px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${
          open
            ? "border-primary ring-2 ring-primary/20 text-foreground"
            : "border-border text-foreground hover:border-primary/40"
        }`}
      >
        <span
          className={`truncate ${!displayLabel ? "text-muted-foreground" : ""}`}
        >
          {displayLabel ?? placeholder}
        </span>
        <ChevronDown
          className={`size-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {/* Dropdown (portal con posición fixed para no quedar recortado) */}
      {open &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label={label}
            style={{
              position: "fixed",
              ...(coords.top !== undefined
                ? { top: coords.top }
                : { bottom: coords.bottom }),
              left: coords.left,
              width: coords.width,
            }}
            className="z-60 overflow-hidden rounded-lg border border-border bg-card shadow-2xl"
          >
            <div className="max-h-56 overflow-y-auto py-1">
              {/* Empty option */}
              {options.length === 0 && (
                <p className="px-4 py-3 text-sm text-muted-foreground">
                  Sin opciones
                </p>
              )}
              {options.map((opt) => {
                const isSelected = opt.value === internalValue;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt.value)}
                    className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm text-left transition-colors hover:bg-muted/50 ${
                      isSelected ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {/* Radio circle */}
                    <span
                      className={`flex size-4.5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-border bg-transparent"
                      }`}
                      aria-hidden
                    >
                      {isSelected && (
                        <span className="size-1.75 rounded-full bg-primary-foreground" />
                      )}
                    </span>
                    <span className={isSelected ? "font-medium" : ""}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
