"use client";

export function NewsletterForm() {
  return (
    <form
      className="flex w-full min-w-[200px] gap-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Introduce tu email"
        className="min-w-0 flex-1 h-10 sm:h-11 pl-3 pr-2 sm:pl-4 sm:pr-3 rounded-full border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Email para el boletín"
      />
      <button
        type="submit"
        className="shrink-0 size-10 sm:size-11 rounded-full border border-border bg-background text-foreground hover:bg-muted transition-colors flex items-center justify-center"
        aria-label="Enviar"
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </form>
  );
}
