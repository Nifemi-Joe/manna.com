import React from "react";
import { cn } from "@/lib/utils";
import type { OrderStatus, DeliveryStatus, ContentStatus } from "@/lib/api";

export type BadgeVariant =
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
    size?: BadgeSize;
    dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
    default: "bg-[var(--accent)]/10 text-[var(--accent)]",
    success:
        "bg-[var(--success-bg)] text-[var(--success)] border border-[var(--success)]/20",
    warning:
        "bg-[var(--warning-bg)] text-[var(--warning)] border border-[var(--warning)]/20",
    danger:
        "bg-[var(--danger-bg)] text-[var(--danger)] border border-[var(--danger)]/20",
    info: "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20",
    neutral: "bg-[var(--surface-soft)] text-[var(--muted)] border border-[var(--line)]",
};

const dotColors: Record<BadgeVariant, string> = {
    default: "bg-[var(--accent)]",
    success: "bg-[var(--success)]",
    warning: "bg-[var(--warning)]",
    danger: "bg-[var(--danger)]",
    info: "bg-[var(--accent)]",
    neutral: "bg-[var(--muted)]",
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: "text-[11px] px-2 py-0.5 gap-1",
    md: "text-[12px] px-2.5 py-1 gap-1.5",
};

export function Badge({
                          variant = "default",
                          size = "md",
                          dot = true,
                          className,
                          children,
                          ...props
                      }: BadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center font-semibold rounded-full",
                "font-[var(--font-sans)]",
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            {...props}
        >
      {dot && (
          <span
              className={cn("rounded-full shrink-0 w-1.5 h-1.5", dotColors[variant])}
              aria-hidden="true"
          />
      )}
            {children}
    </span>
    );
}

// ─── Semantic status badge helpers ────────────────────────

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
    const config: Record<OrderStatus, { variant: BadgeVariant; label: string }> =
        {
            pending: { variant: "warning", label: "Pending" },
            confirmed: { variant: "info", label: "Confirmed" },
            packed: { variant: "info", label: "Packed" },
            dispatched: { variant: "default", label: "Dispatched" },
            delivered: { variant: "success", label: "Delivered" },
            cancelled: { variant: "neutral", label: "Cancelled" },
            failed: { variant: "danger", label: "Failed" },
        };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
}

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus }) {
    const config: Record<
        DeliveryStatus,
        { variant: BadgeVariant; label: string }
    > = {
        scheduled: { variant: "neutral", label: "Scheduled" },
        packed: { variant: "warning", label: "Packed" },
        dispatched: { variant: "info", label: "Dispatched" },
        delivered: { variant: "success", label: "Delivered" },
        failed: { variant: "danger", label: "Failed" },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
}

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
    const config: Record<ContentStatus, { variant: BadgeVariant; label: string }> =
        {
            draft: { variant: "neutral", label: "Draft" },
            published: { variant: "success", label: "Published" },
            unpublished_changes: { variant: "warning", label: "Unpublished changes" },
        };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
}