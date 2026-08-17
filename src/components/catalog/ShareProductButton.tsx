"use client";

import { Check, Copy, Link2, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ShareProductButtonProps {
  url: string;
  title: string;
  className?: string;
  size?: "sm" | "md";
}

export function ShareProductButton({
  url,
  title,
  className = "",
  size = "md",
}: ShareProductButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const links = [
    {
      label: "Facebook",
      icon: <span className="text-sm font-black">f</span>,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: "X (Twitter)",
      icon: <span className="text-sm font-black">𝕏</span>,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      label: "Telegram",
      icon: <Link2 className="size-4" />,
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback silencioso: el navegador no soporta clipboard API.
    }
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share({ title, url });
      setOpen(false);
    } catch {
      // El usuario canceló el share sheet nativo — no es un error real.
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Compartir producto"
        title="Compartir"
        className={`flex items-center justify-center rounded-full bg-background/70 text-muted-foreground backdrop-blur-sm transition-all hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          size === "sm" ? "size-7" : "size-9"
        } ${className}`}
      >
        <Share2 className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl"
        >
          {canNativeShare && (
            <button
              type="button"
              role="menuitem"
              onClick={handleNativeShare}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Share2 className="size-4 text-primary" aria-hidden />
              Más opciones para compartir
            </button>
          )}

          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <span className="flex size-4 items-center justify-center">
                {link.icon}
              </span>
              {link.label}
            </a>
          ))}

          <div className="my-1 h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            onClick={handleCopy}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className="size-4 text-green-500" aria-hidden />
                ¡Enlace copiado!
              </>
            ) : (
              <>
                <Copy className="size-4 text-muted-foreground" aria-hidden />
                Copiar enlace
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
