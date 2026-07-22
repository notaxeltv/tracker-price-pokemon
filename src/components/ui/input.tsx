import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, LabelHTMLAttributes, SelectHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("input", className)} {...props} />;
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("select", className)} {...props} />;
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("label", className)} {...props} />;
}

export function LabelSm({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("label-sm", className)} {...props} />;
}
