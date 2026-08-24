"use client";

import React, { useState } from "react";
import { LayoutDashboard, Building2, Users, Shield, Truck, UserPlus, ShoppingBag } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar, type NavGroup } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MannaLogo } from "@/components/ui/MannaLogo";

const navGroups: NavGroup[] = [
    {
        items: [
            { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
            { label: "Leads", href: "/admin/leads", icon: UserPlus },
            { label: "Companies", href: "/admin/companies", icon: Building2 },
            { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
            // FIXED: now points at /admin/dispatch (lives inside THIS
            // layout) instead of /ops/dispatch (a different portal's
            // layout entirely) — clicking it no longer takes you out of
            // the admin sidebar with no way back.
            { label: "Dispatch", href: "/admin/dispatch", icon: Truck },
            { label: "Users", href: "/admin/users", icon: Users },
            { label: "Roles & permissions", href: "/admin/roles", icon: Shield },
        ],
    },
];

function AdminShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <AuthGuard portal="admin">
            <div className="flex h-screen bg-[var(--surface-soft)] overflow-hidden">
                <Sidebar
                    groups={navGroups}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed((c) => !c)}
                    logo={collapsed ? <MannaLogo size="sm" variant="inverted" iconOnly /> : <MannaLogo size="sm" variant="inverted" />}
                />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <TopBar title="Admin" />
                    <main className="page-wash flex-1 overflow-y-auto">{children}</main>
                </div>
            </div>
        </AuthGuard>
    );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AdminShell>{children}</AdminShell>
        </AuthProvider>
    );
}
