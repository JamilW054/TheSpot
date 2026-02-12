import type { HTMLAttributes } from "react";

const cardBase =
  "rounded-lg border border-border bg-card text-card-foreground shadow-sm";

export function Card({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`${cardBase} ${className}`.trim()} {...props} />;
}

export function CardHeader({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-4 pb-2 ${className}`.trim()}
      {...props}
    />
  );
}

export function CardTitle({
  className = "",
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={`text-lg font-semibold leading-none tracking-tight ${className}`.trim()}
      {...props}
    />
  );
}

export function CardDescription({
  className = "",
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`text-sm text-muted-foreground ${className}`.trim()}
      {...props}
    />
  );
}

export function CardContent({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pt-0 ${className}`.trim()} {...props} />;
}

export function CardFooter({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex items-center p-4 pt-0 ${className}`.trim()}
      {...props}
    />
  );
}
