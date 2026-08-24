"use client";

import React, { useState } from "react";
import { Truck, Package, AlertCircle, CalendarDays, BarChart2, UtensilsCrossed } from "lucide-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Sidebar, type NavGroup } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { MannaLogo } from "@/components/ui/MannaLogo";
import { formatDate } from "@/lib/utils";

const navGroups: NavGroup[] = [
    {
        items: [
            { label: "Dispatch", href: "/ops/dispatch", icon: Truck },
            { label: "Packing Lists", href: "/ops/packing", icon: Package },
            { label: "Issues", href: "/ops/issues", icon: AlertCircle },
            { label: "Menus", href: "/ops/menus", icon: CalendarDays },
            // NEW: meal library — add/edit/photograph meals directly
            { label: "Meal Library", href: "/ops/meals", icon: UtensilsCrossed },
            { label: "Analytics", href: "/ops/analytics", icon: BarChart2 },
        ],
    },
];

function OpsShell({ children }: { children: React.ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const today = formatDate(new Date());

    return (
        <AuthGuard portal="ops">
            <div className="flex h-screen overflow-hidden">
                <Sidebar
                    groups={navGroups}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed((c) => !c)}
                    logo={collapsed ? <MannaLogo size="sm" variant="inverted" iconOnly /> : <MannaLogo size="sm" variant="inverted" />}
                />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <TopBar title="Ops Centre" subtitle={today} />
                    <main className="page-wash flex-1 overflow-y-auto p-5">{children}</main>
                </div>
            </div>
        </AuthGuard>
    );
}

export default function OpsLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <OpsShell>{children}</OpsShell>
        </AuthProvider>
    );
}
