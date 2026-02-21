"use client";

import { hexToHsl, hslToHex } from "@/lib/color-utils";
import { useCallback, useEffect, useRef, useState } from "react";

const HUE_SPECTRUM =
  "linear-gradient(to right, #ff0000, #ff8800, #ffff00, #88ff00, #00ff00, #00ff88, #00ffff, #0088ff, #0000ff, #8800ff, #ff00ff, #ff0088, #ff0000)";

const PRESETS = [
  "#ffffff",
  "#f5f5f5",
  "#e5e5e5",
  "#a3a3a3",
  "#525252",
  "#262626",
  "#0a0a0a",
  "#1e3a5f",
  "#312e81",
  "#4c1d95",
  "#701a75",
  "#831843",
  "#881337",
  "#9f1239",
  "#b91c1c",
  "#c2410c",
  "#ea580c",
  "#ca8a04",
  "#65a30d",
  "#15803d",
  "#0f766e",
  "#0e7490",
  "#0369a1",
  "#2563eb",
];

export interface GarmentColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
  /** Optional label for a11y */
  label?: string;
}

export function GarmentColorPicker({
  value,
  onChange,
  label = "Color de la prenda",
}: GarmentColorPickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const hsl = hexToHsl(value);
  const [h, setH] = useState(hsl.h);
  const [s, setS] = useState(hsl.s);
  const [l, setL] = useState(hsl.l);
  const [hexInput, setHexInput] = useState(value);
  const isDragging = useRef<"sl" | "h" | null>(null);

  const syncFromHex = useCallback((hex: string) => {
    const parsed = hex.replace(/^#/, "").trim();
    if (/^[0-9A-Fa-f]{6}$/.test(parsed)) {
      const full = `#${parsed}`;
      const { h: hh, s: ss, l: ll } = hexToHsl(full);
      setH(hh);
      setS(ss);
      setL(ll);
      setHexInput(full);
      onChange(full);
    } else {
      setHexInput(hex);
    }
  }, [onChange]);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const padding = 8;
    setPosition({
      top: rect.bottom + padding,
      left: Math.max(padding, Math.min(rect.left, window.innerWidth - 280)),
    });
  }, [open]);

  useEffect(() => {
    const { h: hh, s: ss, l: ll } = hexToHsl(value);
    setH(hh);
    setS(ss);
    setL(ll);
    setHexInput(value);
  }, [value]);

  const updateFromHsl = useCallback(
    (hh: number, ss: number, ll: number) => {
      setH(hh);
      setS(ss);
      setL(ll);
      const hex = hslToHex(hh, ss, ll);
      setHexInput(hex);
      onChange(hex);
    },
    [onChange]
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDownOutside = (e: MouseEvent) => {
      const trigger = triggerRef.current;
      const popover = popoverRef.current;
      if (
        trigger?.contains(e.target as Node) ||
        popover?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    const t = setTimeout(() => {
      document.addEventListener("mousedown", onPointerDownOutside);
    }, 0);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", onPointerDownOutside);
    };
  }, [open]);

  const slSize = 200;
  const hueBarHeight = 12;

  const handleSlPointer = useCallback(
    (clientX: number, clientY: number) => {
      const popover = popoverRef.current;
      if (!popover) return;
      const rect = popover.querySelector("[data-sl-area]")?.getBoundingClientRect();
      if (!rect) return;
      const x = (clientX - rect.left) / rect.width;
      const y = (clientY - rect.top) / rect.height;
      const newS = Math.max(0, Math.min(100, x * 100));
      const newL = Math.max(0, Math.min(100, (1 - y) * 100));
      updateFromHsl(h, newS, newL);
    },
    [h, updateFromHsl]
  );

  const handleHuePointer = useCallback(
    (clientX: number) => {
      const popover = popoverRef.current;
      if (!popover) return;
      const rect = popover.querySelector("[data-hue-bar]")?.getBoundingClientRect();
      if (!rect) return;
      const x = (clientX - rect.left) / rect.width;
      const newH = Math.max(0, Math.min(360, x * 360));
      updateFromHsl(newH, s, l);
    },
    [s, l, updateFromHsl]
  );

  useEffect(() => {
    if (isDragging.current === null) return;
    const move = (e: PointerEvent) => {
      e.preventDefault();
      if (isDragging.current === "sl") handleSlPointer(e.clientX, e.clientY);
      if (isDragging.current === "h") handleHuePointer(e.clientX);
    };
    const up = () => {
      isDragging.current = null;
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };
    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
    return () => {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);
    };
  }, [handleSlPointer, handleHuePointer]);

  const slPointerStyle = {
    left: `${(s / 100) * 100}%`,
    top: `${100 - (l / 100) * 100}%`,
    transform: "translate(-50%, -50%)",
  };

  return (
    <div className="flex items-center gap-3">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-border shadow-inner ring-1 ring-black/5 transition-all hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        style={{ backgroundColor: value }}
        aria-label={label}
        aria-expanded={open ? "true" : "false"}
        aria-haspopup="dialog"
      />
      {open && (
        <div
          ref={popoverRef}
          className="fixed z-100 origin-top-left color-picker-popover"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div
            className="rounded-2xl border border-border bg-card shadow-2xl ring-1 ring-black/5 dark:ring-white/5"
            style={{
              background: "color-mix(in srgb, var(--card) 98%, transparent)",
              backdropFilter: "blur(12px)",
            }}
          >
            <div className="p-3">
              <div
                data-sl-area
                className="relative cursor-crosshair select-none overflow-hidden rounded-xl border border-border shadow-inner"
                style={{
                  width: slSize,
                  height: slSize,
                  background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent), hsl(${h}, 100%, 50%)`,
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                  isDragging.current = "sl";
                  handleSlPointer(e.clientX, e.clientY);
                }}
              >
                <div
                  className="absolute z-10 size-5 rounded-full border-2 border-white shadow-lg ring-2 ring-black/20"
                  style={{
                    ...slPointerStyle,
                    backgroundColor: hslToHex(h, s, l),
                  }}
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div
                  data-hue-bar
                  className="relative h-3 flex-1 cursor-pointer select-none overflow-hidden rounded-full border border-border shadow-inner"
                  style={{ background: HUE_SPECTRUM }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                    isDragging.current = "h";
                    handleHuePointer(e.clientX);
                  }}
                >
                  <div
                    className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-2 ring-black/30"
                    style={{
                      left: `${(h / 360) * 100}%`,
                      transform: "translate(-50%, -50%)",
                      backgroundColor: hslToHex(h, 100, 50),
                    }}
                  />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  onBlur={() => syncFromHex(hexInput)}
                  onKeyDown={(e) => e.key === "Enter" && syncFromHex(hexInput)}
                  className="h-9 flex-1 rounded-lg border border-border bg-background px-3 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="#ffffff"
                  aria-label="Código hex"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      const { h, s, l } = hexToHsl(preset);
                      updateFromHsl(h, s, l);
                      setOpen(false);
                    }}
                    className="size-6 rounded-lg border-2 border-border shadow-sm transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ backgroundColor: preset }}
                    title={preset}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
