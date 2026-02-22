"use client";

export function NewsletterForm() {
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        type="email"
        placeholder="Introduce tu email"
        className="flex-1 h-11 px-4 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="h-11 px-4 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
      >
        →
      </button>
    </form>
  );
}
