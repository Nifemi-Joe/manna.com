import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "soft" | "bordered";
    padding?: "none" | "sm" | "md" | "lg";
    hover?: boolean;
    /**
     * Adds a 3px colored bar along the card's top edge. Pass a CSS color
     * (a token like "var(--brand-green)", "var(--accent-2)", or
     * "var(--accent-3)") to give the card a category color at a glance —
     * e.g. green for HR/finance cards, gold for menu/order cards, coral
     * for anything needing attention. This is the fastest way to break
     * up a page that's all identical white boxes.
     */
    accent?: string;
}

const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
};

const variantStyles = {
    default:
        "bg-[var(--surface)] border border-[var(--line)] shadow-[var(--shadow-sm)]",
    soft: "bg-[var(--surface-soft)] border border-[var(--line)]",
    bordered: "bg-[var(--surface)] border-2 border-[var(--line-strong)]",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = "default",
            padding = "md",
            hover = false,
            accent,
            className,
            children,
            style,
            ...props
        },
        ref
    ) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "relative rounded-[var(--radius-lg)] overflow-hidden",
                    variantStyles[variant],
                    paddingStyles[padding],
                    hover &&
                    "transition-all duration-[160ms] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 cursor-pointer",
                    className
                )}
                style={accent ? { borderTop: `3px solid ${accent}`, ...style } : style}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = "Card";

// ─── Card sub-components ───────────────────────────────────
export const CardHeader = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex flex-col gap-1 pb-4", className)}
        {...props}
    />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
    <h3
        ref={ref}
        className={cn("text-heading-s text-[var(--text)]", className)}
        {...props}
    >
        {children}
    </h3>
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-body-s text-[var(--muted)]", className)}
        {...props}
    />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("flex items-center pt-4 mt-4 border-t border-[var(--line)]", className)}
        {...props}
    />
));
CardFooter.displayName = "CardFooter";
