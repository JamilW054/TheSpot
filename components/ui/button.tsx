"use client";

import { forwardRef } from "react";

const variantStyles = {
  primary:
    "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0",
  secondary:
    "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0",
  outline:
    "border border-border/80 bg-background hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0",
  ghost:
    "bg-transparent hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0",
} as const;

const sizeStyles = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-11 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      disabled = false,
      type = "button",
      className = "",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`inline-flex items-center justify-center gap-2 font-medium transition-all disabled:pointer-events-none disabled:opacity-50 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
