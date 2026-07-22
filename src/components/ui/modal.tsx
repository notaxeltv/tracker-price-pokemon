"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "md" | "lg";
  zIndex?: "default" | "top";
}

export function Modal({
  open,
  onClose,
  children,
  size = "md",
  zIndex = "default",
}: ModalProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        zIndex === "top" ? "modal-overlay-top" : "modal-overlay"
      )}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div
        className={cn(
          size === "lg" ? "modal-panel-lg" : "modal-panel-md"
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface ModalHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  onClose: () => void;
  icon?: ReactNode;
}

export function ModalHeader({
  title,
  description,
  onClose,
  icon,
}: ModalHeaderProps) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 font-semibold text-zinc-100">
          {icon}
          {title}
        </h3>
        {description && (
          <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
        )}
      </div>
      <Button variant="danger-ghost" onClick={onClose} aria-label="Chiudi">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
