'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatNaira } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';

interface Invoice {
    id: string;
    period: string; // "YYYY-MM"
    total: number;
    status: 'paid' | 'due';
    dueDate: string;
}

interface BillingData {
    currentDue: number;
    currentMonth: string;
    invoices: Invoice[];
}

function monthLabel(ym: string) {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function BillingPage() {
    const [data, setData] = useState<BillingData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/v1/hr/billing', { credentials: 'include' });
                const json = await res.json();
                setData(json);
            } catch {
                toast.error('Could not load billing data');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return (
        <div className="p-6 space-y-4 max-w-3xl">
            <SkeletonCard lines={3} />
            <SkeletonTable rows={4} />
        </div>
    );

    if (!data) return null;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-3xl">
            <div>
                <h1 className="text-heading-m text-[var(--text)]">Billing</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">
                    Your company invoice — one line per month, covering everything your employees' allowances paid for.
                    Anything they paid extra out of pocket doesn't appear here — that settled instantly with them via Paystack.
                </p>
            </div>

            {data.currentDue > 0 && (
                <Card accent="var(--warning)">
                    <CardContent className="p-4 flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} className="text-[var(--warning)]" />
                            <div>
                                <p className="text-body-s font-semibold text-[var(--text)]">{monthLabel(data.currentMonth)} — accruing</p>
                                <p className="text-body-s text-[var(--muted)] font-mono-num">{formatNaira(data.currentDue)} so far this month</p>
                            </div>
                        </div>
                        <Button size="sm" variant="amber">Contact billing</Button>
                    </CardContent>
                </Card>
            )}

            <Card accent="var(--brand-green)">
                <CardHeader><CardTitle>Invoice history</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {data.invoices.length === 0 ? (
                        <p className="p-6 text-center text-body-s text-[var(--muted)]">No invoices yet — they're generated automatically once a month closes.</p>
                    ) : (
                        <table className="w-full text-body-s">
                            <thead className="border-b border-[var(--line)]">
                            <tr>
                                {['Month', 'Invoice', 'Total', 'Status', 'Due'].map((h) => (
                                    <th key={h} className="p-4 text-left text-label-xs text-[var(--muted)]">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--line)]">
                            {data.invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                    <td className="p-4 font-medium text-[var(--text)]">{monthLabel(inv.period)}</td>
                                    <td className="p-4 text-[var(--muted)] font-mono-num">{inv.id}</td>
                                    <td className="p-4 text-[var(--text)] font-mono-num">{formatNaira(inv.total)}</td>
                                    <td className="p-4"><Badge variant={inv.status === 'paid' ? 'success' : 'warning'}>{inv.status}</Badge></td>
                                    <td className="p-4 text-[var(--muted)]">{inv.dueDate}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            <Card accent="var(--accent-2)">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard size={16} className="text-[var(--accent-2-hover)]" />
                        How billing works
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-body-s text-[var(--muted)]">
                    <p>• Your company is billed only for the portion of each order covered by an employee's allowance.</p>
                    <p>• Anything an employee pays beyond their allowance goes straight through Paystack to us — it never touches your invoice.</p>
                    <p>• Invoices close monthly and are due within 7 days.</p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
