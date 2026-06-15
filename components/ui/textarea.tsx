"use client";

import { useId } from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  help?: string;
  error?: string;
  bordered?: boolean;
}

export function Textarea({
  label,
  help,
  error,
  bordered = true,
  id: idProp,
  className = "",
  disabled = false,
  value,
  onChange,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;

  const baseTextarea =
    "w-full min-h-24 rounded-xl bg-background/90 font-medium text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50";
  const borderStyle = bordered
    ? "border border-border/80 px-3 py-2.5"
    : "border-0 border-b border-border bg-muted/30 px-2 py-1.5";
  const errorStyle = error ? "border-destructive focus-visible:ring-destructive" : "";

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="text-sm font-medium leading-none text-foreground">
          {label}
        </label>
      ) : null}
      <textarea
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`${baseTextarea} ${borderStyle} ${errorStyle} ${className}`.trim()}
        {...props}
      />
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