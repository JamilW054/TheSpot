"use client";

import { useId } from "react";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  /** Con borde por defecto; false para estilo sin borde (solo fondo sutil) */
  bordered?: boolean;
}

export function Input({
  label,
  error,
  bordered = true,
  id: idProp,
  className = "",
  disabled = false,
  type = "text",
  placeholder,
  value,
  onChange,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;

  const baseInput =
    "w-full rounded-md bg-background font-medium transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";
  const borderStyle = bordered
    ? "border border-border px-3 py-2"
    : "border-0 border-b border-border bg-muted/30 px-2 py-1.5";
  const errorStyle = error
    ? "border-destructive focus-visible:ring-destructive"
    : "";

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-medium leading-none text-foreground"
        >
          {label}
        </label>
      ) : null}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`${baseInput} ${borderStyle} ${errorStyle} ${className}`.trim()}
        {...props}
      />
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
