'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, MapPin, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { api, type Delivery, type DeliveryStatus } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const STATUSES: Array<DeliveryStatus | 'all'> = ['all', 'scheduled', 'packed', 'dispatched', 'delivered', 'failed'];

const STATUS_VARIANT: Record<DeliveryStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
    scheduled: 'neutral', packed: 'warning', dispatched: 'warning', delivered: 'success', failed: 'danger',
};

/**
 * FIXED: this replaces the old admin sidebar link that pointed at
 * /ops/dispatch — a genuinely different portal with its own layout and
 * sidebar (Dispatch, Packing Lists, Issues, Menus, Meal Library,
 * Analytics), not a "dispatch section" inside admin. Clicking it didn't
 * open a view, it navigated OUT of the admin shell entirely, which is
 * why there was no way back except the browser's back button. This
 * page shows the same delivery data through the same
 * GET /api/v1/ops/deliveries endpoint (your Super Admin role already
 * has deliveries:read/update), but stays inside the Admin layout —
 * sidebar, TopBar, and all — so there's nothing to navigate back FROM.
 */
export default function AdminDispatchPage() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
    const [search, setSearch] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const res = await api.ops.deliveries.list(statusFilter !== 'all' ? { status: statusFilter } : undefined);
            setDeliveries(res.deliveries ?? []);
        } catch {
            toast.error('Could not load deliveries');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [statusFilter]);

    async function updateStatus(id: string, status: DeliveryStatus) {
        setUpdatingId(id);
        try {
            await api.ops.deliveries.update(id, { status });
            setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
            toast.success(`Marked as ${status}`);
        } catch {
            toast.error('Could not update delivery');
        } finally {
            setUpdatingId(null);
        }
    }

    const filtered = deliveries.filter(
        (d) => d.companyName?.toLowerCase().includes(search.toLowerCase()) || d.employeeName?.toLowerCase().includes(search.toLowerCase()) || d.mealName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6 space-y-5 max-w-6xl">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-heading-m text-[var(--text)] flex items-center gap-2">
                        <Truck size={20} className="text-[var(--brand-green)]" />
                        Dispatch
                    </h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">Delivery status across every company — same data as Ops, viewed from here.</p>
                </div>
                <button onClick={load} className="flex items-center gap-1.5 text-body-s text-[var(--muted)] hover:text-[var(--text)] px-3 py-1.5 rounded-[var(--radius-md)] hover:bg-[var(--surface-soft)] transition-colors">
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search company, employee, meal…" className="w-full h-10 pl-8 pr-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]" />
                </div>
                <div className="flex gap-1 bg-[var(--surface)] p-1 rounded-[var(--radius-md)] border border-[var(--line)] flex-wrap">
                    {STATUSES.map((s) => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-[calc(var(--radius-md)-4px)] text-body-s font-medium capitalize transition-colors ${statusFilter === s ? 'bg-[var(--brand-green)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <SkeletonTable rows={8} />
            ) : (
                <Card accent="var(--brand-green)" padding="none">
                    <CardContent className="p-0">
                        {filtered.length === 0 ? (
                            <EmptyState variant="empty" title="No deliveries found" description="Deliveries will show up here as orders are placed." />
                        ) : (
                            <div className="overflow-x-auto thin-scroll">
                                <table className="w-full text-body-s">
                                    <thead className="border-b border-[var(--line)]">
                                        <tr>
                                            {['Company', 'Employee', 'Meal', 'Address', 'Scheduled', 'Status', ''].map((h) => (
                                                <th key={h} className="p-3 text-left text-label-xs text-[var(--muted)]">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--line)]">
                                        {filtered.map((d) => (
                                            <tr key={d.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                                <td className="p-3 text-[var(--text)] font-medium">{d.companyName}</td>
                                                <td className="p-3 text-[var(--muted)]">{d.employeeName}</td>
                                                <td className="p-3 text-[var(--text)]">{d.mealName}</td>
                                                <td className="p-3 text-[var(--muted)]">
                                                    <span className="flex items-center gap-1"><MapPin size={11} className="shrink-0" />{d.deliveryAddress}</span>
                                                </td>
                                                <td className="p-3 text-[var(--muted)]">{formatDate(d.scheduledFor, 'h:mm a')}</td>
                                                <td className="p-3"><Badge variant={STATUS_VARIANT[d.status]} dot>{d.status}</Badge></td>
                                                <td className="p-3">
                                                    <select
                                                        value={d.status}
                                                        disabled={updatingId === d.id}
                                                        onChange={(e) => updateStatus(d.id, e.target.value as DeliveryStatus)}
                                                        className="h-8 px-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s cursor-pointer hover:border-[var(--accent-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)] disabled:opacity-50 capitalize"
                                                    >
                                                        {(['scheduled', 'packed', 'dispatched', 'delivered', 'failed'] as DeliveryStatus[]).map((s) => (
                                                            <option key={s} value={s}>{s}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </motion.div>
    );
}
