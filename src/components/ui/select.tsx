"use client";

import { ChevronDown } from "lucide-react";
import { useId } from "react";

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  help?: string;
  error?: string;
}

export function Select({
  label,
  help,
  error,
  id: idProp,
  className = "",
  disabled = false,
  children,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={id}
          className="block text-[13px] font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}
      <div className="relative">
        <select
          id={id}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`w-full appearance-none rounded-[10px] border ${
            error ? "border-destructive" : "border-border"
          } bg-background px-3 py-2.5 pr-9 text-sm font-medium text-foreground shadow-sm transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : help ? (
        <p className="text-xs text-muted-foreground">{help}</p>
      ) : null}
    </div>
  );
}
