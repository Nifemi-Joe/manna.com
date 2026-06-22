import React from "react";
import { cn } from "@/lib/utils";

type IllustrationKey =
    | "empty"
    | "no-orders"
    | "no-employees"
    | "no-deliveries"
    | "no-content"
    | "no-media"
    | "error";

function getIllustration(key: IllustrationKey) {
    const illus: Record<IllustrationKey, React.ReactNode> = {
        empty: (
            <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="20" y="20" width="80" height="50" rx="6" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
                <rect x="32" y="32" width="40" height="4" rx="2" fill="var(--line)"/>
                <rect x="32" y="42" width="56" height="3" rx="1.5" fill="var(--line-strong)"/>
                <rect x="32" y="50" width="48" height="3" rx="1.5" fill="var(--line-strong)"/>
                <circle cx="88" cy="22" r="12" fill="var(--accent)"/>
                <path d="M84 22l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        ),
        "no-orders": (
            <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="25" y="15" width="70" height="55" rx="6" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
                <path d="M45 35 L75 35M45 45 L65 45" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="60" cy="55" r="10" fill="var(--accent)"/>
                <path d="M57 55l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="38" y="20" width="44" height="8" rx="3" fill="var(--brand-green)"/>
                <rect x="44" y="23" width="32" height="2" rx="1" fill="white" opacity="0.6"/>
            </svg>
        ),
        "no-employees": (
            <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="50" cy="30" r="14" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
                <path d="M26 65c0-13.3 10.7-24 24-24h0c13.3 0 24 10.7 24 24" stroke="var(--line)" strokeWidth="1.5" fill="none"/>
                <circle cx="82" cy="30" r="10" fill="var(--accent)"/>
                <path d="M79 30h6M82 27v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        "no-deliveries": (
            <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="15" y="30" width="65" height="38" rx="4" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
                <path d="M80 44h12l8 10v14H80V44z" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
                <circle cx="35" cy="70" r="6" fill="var(--accent)"/>
                <circle cx="90" cy="70" r="6" fill="var(--accent)"/>
                <path d="M25 42h30" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M25 50h20" stroke="var(--line-strong)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
        "no-content": (
            <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="20" y="10" width="80" height="65" rx="5" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
                <rect x="32" y="22" width="56" height="4" rx="2" fill="var(--accent)" opacity="0.4"/>
                <rect x="32" y="32" width="48" height="3" rx="1.5" fill="var(--line)"/>
                <rect x="32" y="40" width="52" height="3" rx="1.5" fill="var(--line)"/>
                <rect x="32" y="48" width="36" height="3" rx="1.5" fill="var(--line)"/>
                <circle cx="88" cy="62" r="10" fill="var(--accent-2)"/>
                <path d="M85 62h6M88 59v6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
        ),
        "no-media": (
            <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <rect x="15" y="15" width="40" height="32" rx="4" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
                <circle cx="28" cy="28" r="5" fill="var(--line)"/>
                <path d="M15 38l12-10 10 8 8-6 10 8" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                <rect x="65" y="15" width="40" height="32" rx="4" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
                <circle cx="85" cy="31" r="12" fill="var(--accent)" opacity="0.15"/>
                <path d="M82 31h6M85 28v6" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="15" y="55" width="90" height="10" rx="3" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
            </svg>
        ),
        error: (
            <svg viewBox="0 0 120 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="60" cy="38" r="28" fill="var(--surface-soft)" stroke="var(--line)" strokeWidth="1.5"/>
                <path d="M60 26v14" stroke="var(--danger)" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="60" cy="48" r="2" fill="var(--danger)"/>
                <path d="M40 65 L20 72 L28 52" stroke="var(--line)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
        ),
    };
    return illus[key] ?? illus["empty"];
}

export interface EmptyStateProps {
    /** Key of built-in illustration — also accepted as `variant` */
    illustration?: IllustrationKey;
    /** Alias for illustration (used by most pages) */
    variant?: IllustrationKey;
    /** Primary heading text — also accepted as `title` */
    heading?: string;
    /** Alias for heading */
    title?: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export function EmptyState({
                               illustration,
                               variant,
                               heading,
                               title,
                               description,
                               action,
                               className,
                           }: EmptyStateProps) {
    const resolvedIllustration: IllustrationKey = illustration ?? variant ?? "empty";
    const resolvedHeading = heading ?? title ?? "";

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center text-center py-16 px-8 gap-4",
                className
            )}
        >
            <div className="w-32 h-24" aria-hidden="true">
                {getIllustration(resolvedIllustration)}
            </div>
            <div className="space-y-2 max-w-xs">
                <h3 className="text-heading-s text-[var(--text)]">{resolvedHeading}</h3>
                {description && (
                    <p className="text-body-s text-[var(--muted)]">{description}</p>
                )}
            </div>
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}