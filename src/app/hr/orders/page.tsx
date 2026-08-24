'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { formatNaira, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface HrOrder {
    id: string;
    recipientName: string;
    payerName: string;
    isDelegated: boolean;
    mealName: string;
    mealWindow: 'breakfast' | 'lunch';
    date: string;
    status: string;
    totalAmount: number;
    allowanceCovered: number;
    overspendCovered: number;
    employeePaid: number;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    pending: 'warning', confirmed: 'neutral', packed: 'neutral', dispatched: 'neutral',
    delivered: 'success', cancelled: 'danger', failed: 'danger',
};

export default function HrOrdersPage() {
    const [orders, setOrders] = useState<HrOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/v1/hr/orders', { credentials: 'include' });
                const data = await res.json();
                setOrders(data.orders ?? []);
            } catch {
                toast.error('Could not load orders');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = orders.filter(
        (o) => o.recipientName?.toLowerCase().includes(search.toLowerCase()) || o.payerName?.toLowerCase().includes(search.toLowerCase()) || o.mealName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="p-6"><SkeletonTable rows={6} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6 space-y-5 max-w-6xl">
            <div>
                <h1 className="text-heading-m text-[var(--text)]">Orders</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">
                    <span className="font-mono-num">{orders.length}</span> orders — including who ordered on behalf of whom, and any authorized overspend used
                </p>
            </div>

            <div className="relative max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or meal…"
                    className="w-full h-10 pl-8 pr-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]"
                />
            </div>

            <Card accent="var(--brand-green)" padding="none">
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <EmptyState variant="empty" title="No orders found" description="Orders placed by employees will show up here." />
                    ) : (
                        <div className="overflow-x-auto thin-scroll">
                            <table className="w-full text-body-s">
                                <thead className="border-b border-[var(--line)]">
                                <tr>
                                    {['Employee', 'Meal', 'Window', 'Date', 'Status', 'Total', 'Allowance covered', 'Employee paid'].map((h) => (
                                        <th key={h} className="p-3 text-left text-label-xs text-[var(--muted)]">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--line)]">
                                {filtered.map((o) => (
                                    <tr key={o.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                        <td className="p-3">
                                            <p className="font-medium text-[var(--text)]">{o.recipientName}</p>
                                            {/* THE ACTUAL FIX: delegated orders now clearly show who
                                                    placed it and paid, instead of looking like a normal
                                                    self-order with no indication anything unusual happened. */}
                                            {o.isDelegated && (
                                                <p className="text-label-xs text-[var(--accent-2-hover)] flex items-center gap-1 mt-0.5">
                                                    <ArrowRightLeft size={10} /> Ordered by {o.payerName}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-3 text-[var(--text)]">{o.mealName}</td>
                                        <td className="p-3 text-[var(--muted)] capitalize">{o.mealWindow}</td>
                                        <td className="p-3 text-[var(--muted)]">{formatDate(o.date)}</td>
                                        <td className="p-3"><Badge variant={STATUS_VARIANT[o.status] ?? 'neutral'} dot>{o.status}</Badge></td>
                                        <td className="p-3 text-[var(--text)] font-mono-num">{formatNaira(o.totalAmount)}</td>
                                        <td className="p-3 font-mono-num">
                                            <span className="text-[var(--success)]">{formatNaira(o.allowanceCovered)}</span>
                                            {o.overspendCovered > 0 && (
                                                <span className="inline-flex items-center gap-1 ml-2 text-label-xs px-1.5 py-0.5 rounded-full bg-[var(--accent-3-soft)] text-[var(--accent-3)] font-sans font-semibold">
                                                        <TrendingUp size={10} /> +{formatNaira(o.overspendCovered)} overspend
                                                    </span>
                                            )}
                                        </td>
                                        <td className="p-3 font-mono-num">
                                            {o.employeePaid > 0 ? <span className="text-[var(--accent-3)]">{formatNaira(o.employeePaid)}</span> : <span className="text-[var(--muted)]">—</span>}
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
