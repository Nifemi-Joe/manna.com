"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    Users,
    Shield,
    Truck,
    Bell,
} from "lucide-react";
import { MannaLogo } from "@/components/ui/MannaLogo";

const NAV = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/companies", label: "Companies", icon: Building2 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/roles", label: "Roles & permissions", icon: Shield },
    { href: "/ops/dispatch", label: "Dispatch", icon: Truck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen flex bg-[var(--surface-soft)] font-[var(--font-sans)]">
            {/* Sidebar */}
            <aside className="hidden md:flex w-60 shrink-0 flex-col bg-[var(--brand-green-dark)] text-white">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <Link href="/admin">
                        <MannaLogo size="sm" variant="inverted" />
                    </Link>
                </div>

                <nav className="flex-1 px-3 py-5 space-y-0.5" aria-label="Admin navigation">
                    {NAV.map((item) => {
                        const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-md)] text-body-s transition-colors ${
                                    active
                                        ? "bg-white/10 text-white font-medium"
                                        : "text-white/60 hover:text-white hover:bg-white/5"
                                }`}
                            >
                                <Icon size={16} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <p className="text-label-xs text-white/30">Manna Ops · v1.0</p>
                </div>
            </aside>

            {/* Main column */}
            <div className="flex-1 min-w-0 flex flex-col">
                <header className="h-16 shrink-0 bg-[var(--surface)] border-b border-[var(--line)] flex items-center justify-between px-6">
                    <p className="text-heading-s text-[var(--text)]">
                        {NAV.find((n) => (n.exact ? pathname === n.href : pathname?.startsWith(n.href)))?.label ?? "Admin"}
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            className="relative w-9 h-9 rounded-full bg-[var(--surface-soft)] border border-[var(--line)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                            aria-label="Notifications"
                        >
                            <Bell size={16} />
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
                        </button>
                        <div className="w-9 h-9 rounded-full bg-[var(--brand-green-tint)] text-[var(--brand-green)] flex items-center justify-center text-body-s font-semibold">
                            A
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
        </div>
    );
}
