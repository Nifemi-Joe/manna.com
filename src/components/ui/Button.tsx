import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export type ButtonVariant = "filled" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leadingIcon?: React.ReactNode;
    /** Alias for leadingIcon */
    icon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
    filled: [
        "bg-[var(--accent)] text-white",
        "hover:bg-[var(--accent-hover)]",
        "active:bg-[var(--accent-hover)]",
        "disabled:bg-[var(--line)] disabled:text-[var(--muted)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
    ].join(" "),
    outline: [
        "bg-transparent text-[var(--accent)] border border-[var(--accent)]",
        "hover:bg-[var(--accent)]/8",
        "active:bg-[var(--accent)]/12",
        "disabled:border-[var(--line)] disabled:text-[var(--muted)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
    ].join(" "),
    ghost: [
        "bg-transparent text-[var(--text)]",
        "hover:bg-[var(--surface-soft)]",
        "active:bg-[var(--line)]",
        "disabled:text-[var(--muted)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
    ].join(" "),
    danger: [
        "bg-[var(--danger)] text-white",
        "hover:bg-[#8a1e1e]",
        "active:bg-[#7a1a1a]",
        "disabled:bg-[var(--line)] disabled:text-[var(--muted)]",
        "focus-visible:ring-2 focus-visible:ring-[var(--danger)] focus-visible:ring-offset-2",
    ].join(" "),
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-8 px-3 text-[13px] font-medium gap-1.5 rounded-[var(--radius-md)]",
    md: "h-10 px-4 text-[14px] font-semibold gap-2 rounded-[var(--radius-md)]",
    lg: "h-12 px-6 text-[16px] font-semibold gap-2 rounded-[var(--radius-md)]",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "filled",
            size = "md",
            loading = false,
            leadingIcon,
            icon,
            trailingIcon,
            fullWidth = false,
            className,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const resolvedLeadingIcon = leadingIcon ?? icon;
        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center",
                    "font-[var(--font-sans)] transition-all duration-[160ms] ease-out",
                    "cursor-pointer disabled:cursor-not-allowed",
                    "select-none whitespace-nowrap",
                    variantStyles[variant],
                    sizeStyles[size],
                    fullWidth && "w-full",
                    className
                )}
                disabled={isDisabled}
                aria-busy={loading}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2
                            className="animate-spin shrink-0"
                            size={size === "sm" ? 14 : size === "lg" ? 18 : 16}
                            aria-hidden="true"
                        />
                        <span>{children}</span>
                    </>
                ) : (
                    <>
                        {leadingIcon && (
                            <span className="shrink-0" aria-hidden="true">
                {resolvedLeadingIcon}
              </span>
                        )}
                        <span>{children}</span>
                        {trailingIcon && (
                            <span className="shrink-0" aria-hidden="true">
                {trailingIcon}
              </span>
                        )}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = "Button";