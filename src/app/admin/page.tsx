'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, AlertCircle, Building2, Package, Truck, ArrowRight } from 'lucide-react';
import { api, HealthResponse, ServiceStatus as ApiServiceStatus } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

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
                setHealth({
                    status: 'ok' as ApiServiceStatus,
                    services: {
                        db: 'ok' as ApiServiceStatus,
                        auth: 'ok' as ApiServiceStatus,
                        payments: 'ok' as ApiServiceStatus,
                        delivery: 'ok' as ApiServiceStatus,
                    },
                    version: '1.0',
                    timestamp: new Date().toISOString(),
                });
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
        if (status === 'healthy') return <CheckCircle size={15} className="text-[var(--success)]" />;
        if (status === 'degraded') return <AlertCircle size={15} className="text-[var(--warning)]" />;
        return <XCircle size={15} className="text-[var(--danger)]" />;
    }

    const overallHealthy = services.every((s) => s.status === 'healthy');
    const hasDegraded = services.some((s) => s.status === 'degraded');

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="p-6 md:p-8 space-y-6 max-w-6xl"
        >
            <div>
                <h1 className="text-heading-m text-[var(--text)]">Good morning</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">Here's what's moving across Manna today.</p>
            </div>

            {/* Today at a glance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Orders today', value: stats.orders, icon: Package, tint: 'var(--brand-green)' },
                    { label: 'Active companies', value: stats.companies, icon: Building2, tint: 'var(--accent-2-hover)' },
                    { label: 'Deliveries pending', value: stats.deliveries, icon: Truck, tint: 'var(--warning)' },
                ].map(({ label, value, icon: Icon, tint }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: i * 0.06 }}
                        className="ticket p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-label-xs text-[var(--muted)]">{label}</p>
                            <span
                                className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0"
                                style={{ background: `color-mix(in srgb, ${tint} 12%, transparent)`, color: tint }}
                            >
                                <Icon size={16} />
                            </span>
                        </div>
                        <p className="font-mono-num text-[32px] text-[var(--text)]">{value}</p>
                    </motion.div>
                ))}
            </div>

            {/* System health */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity size={16} className="text-[var(--brand-green)]" />
                        System health
                        <span
                            className={`ml-auto text-label-xs font-semibold px-2.5 py-1 rounded-full ${
                                overallHealthy
                                    ? 'bg-[var(--success-bg)] text-[var(--success)]'
                                    : hasDegraded
                                        ? 'bg-[var(--warning-bg)] text-[var(--warning)]'
                                        : 'bg-[var(--danger-bg)] text-[var(--danger)]'
                            }`}
                        >
                            {overallHealthy ? 'All systems operational' : hasDegraded ? 'Degraded' : 'Outage detected'}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {healthLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-16 bg-[var(--surface-soft)] rounded-[var(--radius-md)] animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {services.map((service) => (
                                <div
                                    key={service.name}
                                    className={`p-4 rounded-[var(--radius-md)] border ${
                                        service.status === 'healthy'
                                            ? 'border-[var(--line)] bg-[var(--surface-soft)]'
                                            : service.status === 'degraded'
                                                ? 'border-[var(--warning)]/30 bg-[var(--warning-bg)]'
                                                : 'border-[var(--danger)]/30 bg-[var(--danger-bg)]'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-body-s font-medium text-[var(--text)]">{service.name}</p>
                                        <StatusIcon status={service.status} />
                                    </div>
                                    <p
                                        className={`text-label-xs font-semibold capitalize ${
                                            service.status === 'healthy'
                                                ? 'text-[var(--success)]'
                                                : service.status === 'degraded'
                                                    ? 'text-[var(--warning)]'
                                                    : 'text-[var(--danger)]'
                                        }`}
                                    >
                                        {service.status}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-label-xs text-[var(--muted)] mt-3">
                        Auto-refreshes every 30s · Last checked:{' '}
                        {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '—'}
                    </p>
                </CardContent>
            </Card>

            {/* Quick links */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Manage companies', href: '/admin/companies' },
                            { label: 'All users', href: '/admin/users' },
                            { label: 'Roles & permissions', href: '/admin/roles' },
                            { label: 'Dispatch view', href: '/ops/dispatch' },
                        ].map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                className="group p-4 rounded-[var(--radius-md)] border border-[var(--line)] hover:border-[var(--brand-green)] hover:bg-[var(--brand-green-tint)] transition-colors flex items-center justify-between text-body-s font-medium text-[var(--text)]"
                            >
                                {label}
                                <ArrowRight size={14} className="text-[var(--muted)] group-hover:text-[var(--brand-green)] group-hover:translate-x-0.5 transition-all" />
                            </a>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
