import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

export function Card({ padded, className, ...props }: CardProps) {
  return (
    <div
      className={cn(padded ? "card-padded" : "card", className)}
      {...props}
    />
  );
}

export function EmptyState({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("panel-empty", className)} {...props} />;
}

export function TableShell({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("table-shell", className)} {...props} />;
}
