"use client";

import React from "react";
import Link from "next/link";
import { UtensilsCrossed, ClipboardList, Wallet, Settings } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { BottomNav } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MannaLogo } from "@/components/ui/MannaLogo";
import type { NavItem } from "@/components/layout/Sidebar";

const navItems: NavItem[] = [
    { label: "Menu", href: "/employee/menu", icon: UtensilsCrossed },
    { label: "Orders", href: "/employee/orders", icon: ClipboardList },
    { label: "Allowance", href: "/employee/allowance", icon: Wallet },
    { label: "Settings", href: "/employee/settings", icon: Settings },
];

function EmployeeShell({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard portal="employee">
            <div className="min-h-screen bg-[var(--surface-soft)] flex flex-col">
                {/* Desktop top bar */}
                <div className="hidden md:block">
                    <TopBar
                        title="Manna"
                        actions={
                            <nav className="flex items-center gap-1" aria-label="Employee navigation">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-1.5 px-3 h-9 rounded-[var(--radius-md)] text-body-s text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors"
                                    >
                                        <item.icon size={16} aria-hidden="true" />
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        }
                    />
                </div>

                {/* Mobile top bar */}
                <header className="md:hidden sticky top-0 z-40 h-14 flex items-center justify-between px-4 bg-[var(--surface)] border-b border-[var(--line)]">
                    <MannaLogo size="sm" />
                </header>

                {/* Content */}
                <main className="flex-1 pb-20 md:pb-6">
                    {children}
                </main>

                {/* Mobile bottom nav */}
                <div className="md:hidden">
                    <BottomNav items={navItems} />
                </div>
            </div>
        </AuthGuard>
    );
}

export default function EmployeeLayout({
                                           children,
                                       }: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <EmployeeShell>{children}</EmployeeShell>
        </AuthProvider>
    );
}