"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { UtensilsCrossed, ClipboardList, Wallet, Settings, Loader2 } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { TopBar } from "@/components/layout/TopBar";
import { MannaLogo } from "@/components/ui/MannaLogo";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

const navItems: NavItem[] = [
    { label: "Menu", href: "/employee/menu", icon: UtensilsCrossed },
    { label: "Orders", href: "/employee/orders", icon: ClipboardList },
    { label: "Allowance", href: "/employee/allowance", icon: Wallet },
    { label: "Settings", href: "/employee/settings", icon: Settings },
];

/**
 * Same instant-feedback pattern as the HR/Ops/Admin sidebar's
 * per-link spinner (see components/layout/Sidebar.tsx) — clicking a
 * nav item shows a spinner on THAT item immediately, rather than
 * nothing happening until the new route finishes loading. Previously
 * this nav used plain <Link> with zero visual feedback, which is
 * exactly what made "menu → orders → settings" clicks feel broken.
 */
function useNavPending() {
    const pathname = usePathname();
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [pendingHref, setPendingHref] = useState<string | null>(null);

    useEffect(() => setPendingHref(null), [pathname]);

    function handleClick(e: React.MouseEvent, href: string) {
        if (href === pathname) return;
        e.preventDefault();
        setPendingHref(href);
        startTransition(() => router.push(href));
    }

    return { pathname, pendingHref, handleClick };
}

function DesktopNav() {
    const { pathname, pendingHref, handleClick } = useNavPending();

    return (
        <nav className="flex items-center gap-1" aria-label="Employee navigation">
            {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href);
                const isLoading = pendingHref === item.href;
                const Icon = item.icon;
                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => handleClick(e, item.href)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-md)] text-body-s transition-colors",
                            isActive ? "bg-[var(--brand-green-tint)] text-[var(--brand-green)] font-medium" : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]"
                        )}
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Icon size={16} aria-hidden="true" />}
                        {item.label}
                    </Link>
                );
            })}
        </nav>
    );
}

function MobileBottomNav() {
    const { pathname, pendingHref, handleClick } = useNavPending();

    return (
        <nav
            className="fixed bottom-3 left-3 right-3 z-40 rounded-[var(--radius-xl)] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--line)] shadow-[var(--shadow-lg)] safe-area-pb"
            aria-label="Employee navigation"
        >
            <div className="flex h-[68px] items-center px-2 gap-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href);
                    const isLoading = pendingHref === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={(e) => handleClick(e, item.href)}
                            className={cn(
                                "flex-1 flex flex-col items-center justify-center gap-1 py-2 rounded-[var(--radius-lg)] transition-all duration-200",
                                isActive ? "text-white" : "text-[var(--muted)] hover:text-[var(--text)]"
                            )}
                            style={isActive ? { background: "linear-gradient(135deg, var(--accent-2), var(--accent-3))" } : undefined}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" aria-hidden="true" /> : <Icon size={20} aria-hidden="true" />}
                            <span className="text-[10px] font-semibold leading-none">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}

function EmployeeShell({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard portal="employee">
            <div className="min-h-screen bg-[var(--surface-soft)] flex flex-col">
                <div className="hidden md:block">
                    <TopBar title="Manna" actions={<DesktopNav />} />
                </div>

                <header className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-[var(--surface)]/90 backdrop-blur-md border-b border-[var(--line)]">
                    <MannaLogo size="sm" />
                </header>

                <main className="flex-1 pb-24 md:pb-6">{children}</main>

                <div className="md:hidden">
                    <MobileBottomNav />
                </div>
            </div>
        </AuthGuard>
    );
}

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <EmployeeShell>{children}</EmployeeShell>
        </AuthProvider>
    );
}
