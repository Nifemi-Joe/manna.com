'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRightLeft, AlertTriangle, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { formatNaira, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface AdminOrder {
    id: string;
    recipientName: string;
    payerName: string;
    isDelegated: boolean;
    companyName: string;
    mealName: string;
    quantity: number;
    mealWindow: 'breakfast' | 'lunch';
    date: string;
    status: string;
    totalAmount: number;
    allowanceCovered: number;
    overspendCovered: number;
    employeePaid: number;
    needsSwap: boolean;
}

const STATUSES = ['pending', 'confirmed', 'packed', 'dispatched', 'delivered', 'cancelled', 'failed'] as const;

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    pending: 'warning', confirmed: 'neutral', packed: 'neutral', dispatched: 'neutral',
    delivered: 'success', cancelled: 'danger', failed: 'danger',
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    async function load() {
        setLoading(true);
        try {
            const qs = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
            const res = await fetch(`/api/v1/admin/orders${qs}`, { credentials: 'include' });
            const data = await res.json();
            setOrders(data.orders ?? []);
        } catch {
            toast.error('Could not load orders');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [statusFilter]);

    async function changeStatus(orderId: string, newStatus: string) {
        setUpdatingId(orderId);
        try {
            const res = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) {
                const data = await res.json();
                toast.error(data?.message ?? 'Could not update status');
                return;
            }
            setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
            toast.success(`Marked as ${newStatus}`);
        } catch {
            toast.error('Could not reach the server');
        } finally {
            setUpdatingId(null);
        }
    }

    const filtered = orders.filter(
        (o) => o.recipientName?.toLowerCase().includes(search.toLowerCase()) || o.mealName?.toLowerCase().includes(search.toLowerCase()) || o.companyName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-6"><SkeletonTable rows={8} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6 space-y-5 max-w-7xl">
            <div>
                <h1 className="text-heading-m text-[var(--text)]">All orders</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">Every order across every company — change status here to notify the employee automatically.</p>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee, meal, company…" className="w-full h-10 pl-8 pr-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]" />
                </div>
                <div className="flex gap-1 bg-[var(--surface)] p-1 rounded-[var(--radius-md)] border border-[var(--line)] flex-wrap">
                    {['all', ...STATUSES].map((s) => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-[calc(var(--radius-md)-4px)] text-body-s font-medium capitalize transition-colors ${statusFilter === s ? 'bg-[var(--brand-green)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <Card accent="var(--brand-green)" padding="none">
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <EmptyState variant="empty" title="No orders found" description="Orders placed across all companies will show up here." />
                    ) : (
                        <div className="overflow-x-auto thin-scroll">
                            <table className="w-full text-body-s">
                                <thead className="border-b border-[var(--line)]">
                                    <tr>
                                        {['Employee', 'Company', 'Meal', 'Date', 'Total', 'Status', ''].map((h) => (
                                            <th key={h} className="p-3 text-left text-label-xs text-[var(--muted)]">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--line)]">
                                    {filtered.map((o) => (
                                        <tr key={o.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                            <td className="p-3">
                                                <p className="font-medium text-[var(--text)]">{o.recipientName}</p>
                                                {o.isDelegated && (
                                                    <p className="text-label-xs text-[var(--accent-2-hover)] flex items-center gap-1 mt-0.5">
                                                        <ArrowRightLeft size={10} /> Ordered by {o.payerName}
                                                    </p>
                                                )}
                                                {o.needsSwap && (
                                                    <p className="text-label-xs text-[var(--accent-3)] flex items-center gap-1 mt-0.5">
                                                        <AlertTriangle size={10} /> Awaiting swap
                                                    </p>
                                                )}
                                            </td>
                                            <td className="p-3 text-[var(--muted)]">{o.companyName}</td>
                                            <td className="p-3 text-[var(--text)]">{o.mealName}{o.quantity > 1 ? ` ×${o.quantity}` : ''}</td>
                                            <td className="p-3 text-[var(--muted)]">{formatDate(o.date)}</td>
                                            <td className="p-3 text-[var(--text)] font-mono-num">{formatNaira(o.totalAmount)}</td>
                                            <td className="p-3"><Badge variant={STATUS_VARIANT[o.status] ?? 'neutral'} dot>{o.status}</Badge></td>
                                            <td className="p-3">
                                                <div className="relative inline-block">
                                                    <select
                                                        value={o.status}
                                                        disabled={updatingId === o.id}
                                                        onChange={(e) => changeStatus(o.id, e.target.value)}
                                                        className="h-8 pl-2 pr-7 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s appearance-none cursor-pointer hover:border-[var(--accent-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)] disabled:opacity-50 capitalize"
                                                    >
                                                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                                                    </select>
                                                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
