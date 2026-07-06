"use client";

import { Check, Copy, Link2, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Ícono de WhatsApp (lucide no lo incluye). */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      role="img"
    >
      <title>WhatsApp</title>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.39a9.9 9.9 0 0 0 4.76 1.21h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 1.67c2.24 0 4.35.87 5.94 2.46a8.26 8.26 0 0 1 2.43 5.88c0 4.57-3.72 8.29-8.29 8.29a8.3 8.3 0 0 1-4.22-1.15l-.3-.18-3.13.82.84-3.05-.2-.31a8.22 8.22 0 0 1-1.26-4.4c0-4.58 3.72-8.36 8.29-8.36h.04Zm-4.7 4.4c-.16 0-.43.06-.66.31-.22.25-.86.84-.86 2.05 0 1.2.88 2.37 1 2.53.13.17 1.75 2.67 4.3 3.74.6.25 1.07.41 1.44.52.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.19.21-.58.21-1.08.15-1.19-.06-.1-.23-.17-.48-.29-.25-.13-1.48-.73-1.71-.81-.23-.09-.4-.13-.56.12-.17.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.44.12-.14.16-.25.24-.41.08-.17.04-.31-.02-.44-.06-.12-.55-1.36-.77-1.86-.2-.48-.4-.42-.56-.42Z" />
    </svg>
  );
}

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
      label: "WhatsApp",
      icon: <WhatsAppIcon className="size-4" />,
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
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
