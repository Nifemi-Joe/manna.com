"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: number;
    /**
     * FIXED: set this true for any "index" link whose href is a parent
     * path of its siblings (e.g. Dashboard at /admin, with Leads at
     * /admin/leads, Companies at /admin/companies, etc). Without this,
     * isActive used to test `pathname.startsWith(item.href)`, and
     * "/admin/leads" genuinely does start with "/admin" — so Dashboard
     * lit up as active on every nested admin page. exact:true forces
     * that link to only match the exact pathname.
     */
    exact?: boolean;
}

export interface NavGroup {
    label?: string;
    items: NavItem[];
}

interface SidebarProps {
    groups?: NavGroup[];
    navGroups?: NavGroup[];
    logo?: React.ReactNode;
    footer?: React.ReactNode;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    className?: string;
    portalLabel?: string;
}

function isItemActive(item: NavItem, pathname: string): boolean {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function Sidebar({
    groups: groupsProp,
    navGroups,
    logo,
    footer,
    collapsed = false,
    onToggleCollapse,
    className,
}: SidebarProps) {
    const groups = groupsProp ?? navGroups ?? [];
    const pathname = usePathname() ?? "";
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    useEffect(() => setPendingHref(null), [pathname]);

    function handleNavClick(e: React.MouseEvent, href: string) {
        if (href === pathname) return;
        e.preventDefault();
        setPendingHref(href);
        startTransition(() => router.push(href));
    }

    return (
        <aside
            className={cn(
                "relative flex flex-col h-full bg-[var(--brand-green-dark)] text-white",
                "transition-[width] duration-200 ease-out overflow-visible",
                collapsed ? "w-16" : "w-64",
                className
            )}
            aria-label="Primary navigation"
        >
            {logo && (
                <div className="h-16 flex items-center px-4 border-b border-white/10 shrink-0 overflow-hidden relative z-0">
                    {logo}
                </div>
            )}

            <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 thin-scroll">
                {groups.map((group, gi) => (
                    <div key={gi} className="mb-4">
                        {group.label && !collapsed && (
                            <p className="text-label-xs text-white/35 px-4 pb-2 pt-1 whitespace-nowrap">{group.label}</p>
                        )}
                        {group.items.map((item) => {
                            const isActive = isItemActive(item, pathname);
                            const isLoading = pendingHref === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={(e) => handleNavClick(e, item.href)}
                                    title={collapsed ? item.label : undefined}
                                    className={cn(
                                        "relative flex items-center gap-3 mx-2 px-3 py-2.5 rounded-[var(--radius-md)]",
                                        "text-body-s font-medium transition-colors duration-[120ms]",
                                        "focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]",
                                        isActive ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {/* Always rendered, opacity-toggled instead of
                                        conditionally mounted — a conditionally
                                        mounted absolute element popping in/out on
                                        every render is what read as a "glitch" on
                                        hover/navigation; animating opacity instead
                                        is smooth and has no mount/unmount jump. */}
                                    <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full transition-opacity duration-150"
                                        style={{ background: "var(--accent-2)", opacity: isActive ? 1 : 0 }}
                                        aria-hidden="true"
                                    />
                                    {isLoading ? (
                                        <Loader2 size={18} className="shrink-0 animate-spin text-[var(--accent-2)]" aria-hidden="true" />
                                    ) : (
                                        <Icon size={18} className="shrink-0" aria-hidden="true" />
                                    )}
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1 truncate">{item.label}</span>
                                            {item.badge != null && item.badge > 0 && !isLoading && (
                                                <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[var(--accent-2)] text-white text-[10px] font-bold flex items-center justify-center">
                                                    {item.badge > 99 ? "99+" : item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {footer && !collapsed && <div className="shrink-0 border-t border-white/10 p-4">{footer}</div>}

            {/* FIXED: previously anchored at top-6 (24px from the top),
                which sat inside the same visual band as the logo header,
                overlapping it on hover and causing two hover targets to
                fight for the same pixels. Now centered vertically on the
                header itself (h-16 / 64px), a fixed, non-overlapping
                position independent of nav content below it. */}
            {onToggleCollapse && (
                <button
                    onClick={onToggleCollapse}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                    className="absolute top-8 -right-3 w-6 h-6 rounded-full bg-[var(--surface)] border border-[var(--line)] shadow-[var(--shadow-sm)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--line-strong)] transition-colors z-20"
                >
                    {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
                </button>
            )}
        </aside>
    );
}

// ─── Mobile bottom nav (Employee portal) ─────────────────
interface BottomNavProps {
    items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
    const pathname = usePathname() ?? "";

    return (
        <nav
            className="fixed bottom-3 left-3 right-3 z-40 rounded-[var(--radius-xl)] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--line)] shadow-[var(--shadow-lg)] safe-area-pb"
            aria-label="Primary navigation"
        >
            <div className="flex h-[68px] items-center px-2 gap-1">
                {items.map((item) => {
                    const isActive = isItemActive(item, pathname);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-[var(--radius-lg)]",
                                "transition-all duration-200 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent-2)]",
                                isActive ? "text-white" : "text-[var(--muted)] hover:text-[var(--text)]"
                            )}
                            style={isActive ? { background: "linear-gradient(135deg, var(--accent-2), var(--accent-3))" } : undefined}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon size={20} aria-hidden="true" />
                            <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
