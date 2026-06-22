'use client';

import { AuthGuard } from '@/components/layout/AuthGuard';
import { AuthProvider } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import {
    Activity,
    Building2,
    Users,
    Shield,
    FileText,
    Truck,
    AlertTriangle,
    LayoutDashboard,
} from 'lucide-react';

const navGroups = [
    {
        label: 'Run Today',
        items: [
            { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/admin/health', label: 'System Health', icon: Activity },
            { href: '/ops/dispatch', label: 'Active Deliveries', icon: Truck },
            { href: '/ops/issues', label: 'Open Issues', icon: AlertTriangle },
        ],
    },
    {
        label: 'Governance',
        items: [
            { href: '/admin/companies', label: 'Companies', icon: Building2 },
            { href: '/admin/users', label: 'Users', icon: Users },
            { href: '/admin/roles', label: 'Roles', icon: Shield },
            { href: '/studio', label: 'Content', icon: FileText },
        ],
    },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <AuthGuard portal="admin">
                <div className="flex h-screen overflow-hidden bg-[var(--surface-soft)]">
                    <Sidebar navGroups={navGroups} portalLabel="Admin" />
                    <div className="flex-1 flex flex-col overflow-hidden">
                        <TopBar />
                        <main className="flex-1 overflow-y-auto">
                            {children}
                        </main>
                    </div>
                </div>
            </AuthGuard>
        </AuthProvider>
    );
}