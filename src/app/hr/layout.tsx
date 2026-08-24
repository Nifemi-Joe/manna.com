"use client";

import React, { useState } from "react";
import { LayoutDashboard, ShoppingBag, Users, Sliders, Receipt, BarChart2, Shield, Layers } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar, type NavGroup } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MannaLogo } from "@/components/ui/MannaLogo";
import { useAuth } from "@/contexts/AuthContext";

const navGroups: NavGroup[] = [
    {
        items: [
            { label: "Dashboard", href: "/hr/dashboard", icon: LayoutDashboard },
            { label: "Orders", href: "/hr/orders", icon: ShoppingBag },
            { label: "Employees", href: "/hr/employees", icon: Users },
            // NEW: staff levels management
            { label: "Staff Levels", href: "/hr/levels", icon: Layers },
        ],
    },
    {
        label: "Configuration",
        items: [
            { label: "Budget & Rules", href: "/hr/rules", icon: Sliders },
            { label: "Billing", href: "/hr/billing", icon: Receipt },
            { label: "Reports", href: "/hr/reports", icon: BarChart2 },
            { label: "Roles & Access", href: "/hr/access", icon: Shield },
        ],
    },
];

function HRShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();

    return (
        <AuthGuard portal="hr">
            <div className="flex h-screen bg-[var(--surface-soft)] overflow-hidden">
                <Sidebar
                    groups={navGroups}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed((c) => !c)}
                    logo={collapsed ? <MannaLogo size="sm" variant="inverted" iconOnly /> : <MannaLogo size="sm" variant="inverted" />}
                />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <TopBar title={user?.companyName ?? "HR Portal"} subtitle="HR & Admin" />
                    <main className="page-wash flex-1 overflow-y-auto p-6">{children}</main>
                </div>
            </div>
        </AuthGuard>
    );
}

export default function HRLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <HRShell>{children}</HRShell>
        </AuthProvider>
    );
}
