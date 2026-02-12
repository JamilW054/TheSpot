"use client";

import { forwardRef } from "react";

const variantStyles = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  secondary:
    "bg-secondary text-secondary-foreground hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  outline:
    "border-2 border-border bg-transparent hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ghost:
    "bg-transparent hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
} as const;

const sizeStyles = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-10 px-4 text-base rounded-md",
  lg: "h-12 px-6 text-lg rounded-lg",
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
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`inline-flex items-center justify-center font-medium transition-opacity disabled:opacity-50 disabled:pointer-events-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
