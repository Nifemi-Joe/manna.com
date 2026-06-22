'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, CreditCard, AlertCircle } from 'lucide-react';
import { formatNaira, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';

interface Invoice {
    id: string;
    month: string;
    total: number;
    status: 'paid' | 'due' | 'overdue';
    pdfUrl?: string;
}

const MOCK_INVOICES: Invoice[] = [
    { id: 'INV-2025-06', month: 'June 2025', total: 847500, status: 'due' },
    { id: 'INV-2025-05', month: 'May 2025', total: 924000, status: 'paid', pdfUrl: '#' },
    { id: 'INV-2025-04', month: 'April 2025', total: 812250, status: 'paid', pdfUrl: '#' },
    { id: 'INV-2025-03', month: 'March 2025', total: 761500, status: 'paid', pdfUrl: '#' },
];

export default function BillingPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => { setInvoices(MOCK_INVOICES); setLoading(false); }, 600);
    }, []);

    if (loading) return (
        <div className="p-6 space-y-4 max-w-3xl">
            <SkeletonCard lines={3} />
            <SkeletonTable rows={4} />
        </div>
    );

    const current = invoices.find((i) => i.status === 'due' || i.status === 'overdue');

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-6 max-w-3xl"
        >
            <div>
                <h1 className="text-heading-s text-[var(--text)]">Billing</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">Invoices and payment history</p>
            </div>

            {/* Current due */}
            {current && (
                <Card className="border-[var(--warning)] bg-amber-50/50">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={18} className="text-[var(--warning)]" />
                            <div>
                                <p className="text-body-s font-semibold text-[var(--text)]">{current.month} invoice due</p>
                                <p className="text-body-s text-[var(--muted)]">{formatNaira(current.total)} outstanding</p>
                            </div>
                        </div>
                        <Button size="sm">Pay now</Button>
                    </CardContent>
                </Card>
            )}

            {/* Monthly summary */}
            <Card>
                <CardHeader>
                    <CardTitle>June 2025 Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Total orders', value: '242' },
                            { label: 'Total amount', value: formatNaira(847500) },
                            { label: 'Credits applied', value: formatNaira(12500) },
                            { label: 'Net due', value: formatNaira(835000) },
                        ].map(({ label, value }) => (
                            <div key={label} className="p-3 bg-[var(--surface-soft)] rounded-xl">
                                <p className="text-label-xs text-[var(--muted)] mb-1">{label.toUpperCase()}</p>
                                <p className="text-heading-s text-[var(--text)]">{value}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 text-body-s text-[var(--muted)]">
                        Note: Detailed billing API endpoint pending. Figures are aggregated from order data.
                    </p>
                </CardContent>
            </Card>

            {/* Invoice list */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-body-s">
                        <thead className="border-b border-[var(--line)]">
                        <tr>
                            {['Month', 'Invoice', 'Total', 'Status', ''].map((h) => (
                                <th key={h} className="p-4 text-left text-label-xs text-[var(--muted)] font-semibold">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--line)]">
                        {invoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                <td className="p-4 font-medium text-[var(--text)]">{inv.month}</td>
                                <td className="p-4 text-[var(--muted)]">{inv.id}</td>
                                <td className="p-4 text-[var(--text)]">{formatNaira(inv.total)}</td>
                                <td className="p-4">
                                    <Badge
                                        variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}
                                    >
                                        {inv.status}
                                    </Badge>
                                </td>
                                <td className="p-4">
                                    {inv.pdfUrl && (
                                        <Button variant="ghost" size="sm" className="gap-1.5">
                                            <Download size={14} />PDF
                                        </Button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Payment method */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard size={16} className="text-[var(--accent)]" />
                        Payment Method
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                    <div>
                        <p className="text-body-s font-medium text-[var(--text)]">Bank transfer (monthly invoice)</p>
                        <p className="text-body-s text-[var(--muted)]">Payment due on the 5th of each month</p>
                    </div>
                    <Button variant="outline" size="sm">Update</Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}