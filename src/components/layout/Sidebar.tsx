"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: number;
}

export interface NavGroup {
    label?: string;
    items: NavItem[];
}

interface SidebarProps {
    groups?: NavGroup[];
    /** Alias for groups */
    navGroups?: NavGroup[];
    logo?: React.ReactNode;
    footer?: React.ReactNode;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    className?: string;
    /** Display-only portal name; ignored in rendering */
    portalLabel?: string;
}

export function Sidebar({
                            groups: groupsProp,
                            navGroups,
                            logo,
                            footer,
                            collapsed = false,
                            className,
                        }: SidebarProps) {
    const groups = groupsProp ?? navGroups ?? [];
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "flex flex-col h-full bg-[var(--surface)] border-r border-[var(--line)]",
                "transition-[width] duration-200 ease-out overflow-hidden",
                collapsed ? "w-16" : "w-64",
                className
            )}
            aria-label="Primary navigation"
        >
            {/* Logo */}
            {logo && (
                <div className="h-16 flex items-center px-4 border-b border-[var(--line)] shrink-0">
                    {logo}
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
                {groups.map((group, gi) => (
                    <div key={gi} className="mb-4">
                        {group.label && !collapsed && (
                            <p className="text-label-xs text-[var(--muted)] px-4 pb-2 pt-1">
                                {group.label}
                            </p>
                        )}
                        {group.items.map((item) => {
                            const isActive =
                                pathname === item.href ||
                                (item.href !== "/" && pathname.startsWith(item.href));
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    title={collapsed ? item.label : undefined}
                                    className={cn(
                                        "flex items-center gap-3 mx-2 px-3 py-2.5 rounded-[var(--radius-md)]",
                                        "text-body-s font-medium transition-colors duration-[120ms]",
                                        "focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                                        isActive
                                            ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                                            : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <Icon
                                        size={18}
                                        className="shrink-0"
                                        aria-hidden="true"
                                    />
                                    {!collapsed && (
                                        <>
                                            <span className="flex-1 truncate">{item.label}</span>
                                            {item.badge != null && item.badge > 0 && (
                                                <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center">
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

            {/* Footer */}
            {footer && !collapsed && (
                <div className="shrink-0 border-t border-[var(--line)] p-4">{footer}</div>
            )}
        </aside>
    );
}

// ─── Mobile bottom nav (Employee portal) ─────────────────
interface BottomNavProps {
    items: NavItem[];
}

export function BottomNav({ items }: BottomNavProps) {
    const pathname = usePathname();

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-40 h-[72px] bg-[var(--surface)] border-t border-[var(--line)] safe-area-pb"
            aria-label="Primary navigation"
        >
            <div className="flex h-full items-center">
                {items.map((item) => {
                    const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 py-2",
                                "transition-colors duration-[120ms] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--accent)]",
                                isActive ? "text-[var(--accent)]" : "text-[var(--muted)]"
                            )}
                            aria-current={isActive ? "page" : undefined}
                        >
                            <Icon size={22} aria-hidden="true" />
                            <span className="text-[10px] font-semibold leading-none">
                {item.label}
              </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}