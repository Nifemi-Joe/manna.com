import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    label?: string;
}

const sizeMap = {
    sm: 16,
    md: 24,
    lg: 40,
};

export function Spinner({ size = "md", className, label = "Loading..." }: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label={label}
            className={cn("inline-flex items-center justify-center text-[var(--accent)]", className)}
        >
      <Loader2
          size={sizeMap[size]}
          className="animate-spin"
          aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
    );
}

export function PageSpinner() {
    return (
        <div className="flex items-center justify-center min-h-64">
            <Spinner size="lg" />
        </div>
    );
}