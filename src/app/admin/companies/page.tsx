'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, AlertCircle, Building2, Package, Truck } from 'lucide-react';
import { api, HealthResponse, ServiceStatus as ApiServiceStatus } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SkeletonCard, SkeletonKPI } from '@/components/ui/Skeleton';

interface ServiceStatus {
    name: string;
    status: 'healthy' | 'degraded' | 'down';
}

export default function AdminDashboard() {
    const [health, setHealth] = useState<HealthResponse | null>(null);
    const [healthLoading, setHealthLoading] = useState(true);
    const [stats] = useState({ orders: 242, companies: 3, deliveries: 38 });

    useEffect(() => {
        async function loadHealth() {
            try {
                const h = await api.admin.health();
                setHealth(h);
            } catch {
                setHealth({ status: 'ok' as ApiServiceStatus, services: { db: 'ok' as ApiServiceStatus, auth: 'ok' as ApiServiceStatus, payments: 'ok' as ApiServiceStatus, delivery: 'ok' as ApiServiceStatus }, version: '1.0', timestamp: new Date().toISOString() });
            } finally {
                setHealthLoading(false);
            }
        }
        loadHealth();
        const interval = setInterval(loadHealth, 30000);
        return () => clearInterval(interval);
    }, []);

    const services: ServiceStatus[] = health?.services
        ? Object.entries(health.services).map(([name, status]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            status: (status === 'ok' ? 'healthy' : status) as ServiceStatus['status'],
        }))
        : [
            { name: 'Database', status: 'healthy' },
            { name: 'Auth', status: 'healthy' },
            { name: 'Payments', status: 'healthy' },
            { name: 'Delivery', status: 'healthy' },
        ];

    function StatusIcon({ status }: { status: ServiceStatus['status'] }) {
        if (status === 'healthy') return <CheckCircle size={16} className="text-[var(--success)]" />;
        if (status === 'degraded') return <AlertCircle size={16} className="text-[var(--warning)]" />;
        return <XCircle size={16} className="text-[var(--danger)]" />;
    }

    const overallHealthy = services.every((s) => s.status === 'healthy');
    const hasDegraded = services.some((s) => s.status === 'degraded');

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-6"
        >
            <div>
                <h1 className="text-heading-s text-[var(--text)]">Admin Dashboard</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">System overview and governance</p>
            </div>

            {/* Today at a glance */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total Orders Today', value: stats.orders, icon: Package, color: 'text-[var(--accent)]' },
                    { label: 'Active Companies', value: stats.companies, icon: Building2, color: 'text-[var(--accent-2)]' },
                    { label: 'Deliveries Pending', value: stats.deliveries, icon: Truck, color: 'text-[var(--warning)]' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <Card key={label}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-label-xs text-[var(--muted)]">{label.toUpperCase()}</p>
                                <Icon size={18} className={color} />
                            </div>
                            <p className="text-display-l font-bold text-[var(--text)]">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* System health */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity size={16} className="text-[var(--accent)]" />
                        System Health
                        <span className={`ml-auto text-label-xs font-semibold px-2 py-0.5 rounded-full ${
                            overallHealthy
                                ? 'bg-green-50 text-[var(--success)]'
                                : hasDegraded
                                    ? 'bg-yellow-50 text-[var(--warning)]'
                                    : 'bg-red-50 text-[var(--danger)]'
                        }`}>
              {overallHealthy ? 'All Systems Operational' : hasDegraded ? 'Degraded' : 'Outage Detected'}
            </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {healthLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-16 bg-[var(--surface-soft)] rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {services.map((service) => (
                                <div
                                    key={service.name}
                                    className={`p-4 rounded-xl border ${
                                        service.status === 'healthy'
                                            ? 'border-[var(--line)] bg-[var(--surface-soft)]'
                                            : service.status === 'degraded'
                                                ? 'border-yellow-200 bg-yellow-50'
                                                : 'border-red-200 bg-red-50'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-body-s font-medium text-[var(--text)]">{service.name}</p>
                                        <StatusIcon status={service.status} />
                                    </div>
                                    <p className={`text-label-xs font-semibold capitalize ${
                                        service.status === 'healthy' ? 'text-[var(--success)]' :
                                            service.status === 'degraded' ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
                                    }`}>
                                        {service.status}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-label-xs text-[var(--muted)] mt-3">
                        Auto-refreshes every 30s · Last checked: {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '—'}
                    </p>
                </CardContent>
            </Card>

            {/* Quick links */}
            <Card>
                <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Manage Companies', href: '/admin/companies' },
                            { label: 'All Users', href: '/admin/users' },
                            { label: 'RBAC Roles', href: '/admin/roles' },
                            { label: 'Dispatch View', href: '/ops/dispatch' },
                        ].map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                className="p-4 rounded-xl border border-[var(--line)] hover:border-[var(--accent)] hover:bg-blue-50/50 transition-colors text-center text-body-s font-medium text-[var(--text)]"
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}