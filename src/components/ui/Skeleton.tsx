import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "text" | "block" | "circle" | "input";
}

export function Skeleton({ variant = "block", className, ...props }: SkeletonProps) {
    const base =
        "animate-pulse bg-gradient-to-r from-[var(--line)] via-[var(--line-strong)]/40 to-[var(--line)] bg-[length:400%_100%]";

    const styles: Record<string, string> = {
        text: "h-4 rounded w-full",
        block: "rounded-[var(--radius-lg)]",
        circle: "rounded-full",
        input: "h-[56px] rounded-[var(--radius-md)] w-full",
    };

    return (
        <div
            className={cn(base, styles[variant], className)}
            aria-hidden="true"
            role="status"
            aria-label="Loading..."
            {...props}
        />
    );
}

// ─── Preset skeleton layouts ──────────────────────────────

export function SkeletonCard({ lines }: { lines?: number } = {}) {
    const lineCount = lines ?? 3;
    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton variant="circle" className="w-10 h-10 shrink-0" />
                <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-40" />
                    <Skeleton variant="text" className="w-24 h-3" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton variant="text" />
                <Skeleton variant="text" className="w-4/5" />
                <Skeleton variant="text" className="w-3/5" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
            {/* Header */}
            <div className="flex gap-4 px-6 py-4 border-b border-[var(--line)] bg-[var(--surface-soft)]">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} variant="text" className="h-3" style={{ flex: i === 0 ? 2 : 1 }} />
                ))}
            </div>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, r) => (
                <div
                    key={r}
                    className="flex gap-4 px-6 py-4 border-b border-[var(--line)] last:border-0"
                >
                    {Array.from({ length: cols }).map((_, c) => (
                        <Skeleton
                            key={c}
                            variant="text"
                            className="h-4"
                            style={{ flex: c === 0 ? 2 : 1, opacity: 1 - r * 0.1 }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonKPI() {
    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 space-y-3">
            <Skeleton variant="text" className="w-24 h-3" />
            <Skeleton variant="text" className="w-20 h-8" />
            <Skeleton variant="text" className="w-32 h-3" />
        </div>
    );
}

export function SkeletonMealCard() {
    return (
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden">
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-3">
                <Skeleton variant="text" className="w-3/4" />
                <Skeleton variant="text" className="w-full h-3" />
                <Skeleton variant="text" className="w-4/5 h-3" />
                <div className="flex gap-2 pt-1">
                    <Skeleton variant="text" className="w-16 h-5 rounded-full" />
                    <Skeleton variant="text" className="w-12 h-5 rounded-full" />
                </div>
                <Skeleton className="h-10 w-full rounded-[var(--radius-md)]" />
            </div>
        </div>
    );
}