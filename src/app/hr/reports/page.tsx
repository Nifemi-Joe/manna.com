'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface Issue {
    id: string;
    date: string;
    company: string;
    employee: string;
    type: string;
    status: 'open' | 'in-progress' | 'resolved';
    resolution?: string;
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 600);
    }, []);

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

    const participationData = months.map((label, i) => ({
        label,
        value: 60 + i * 5 + Math.floor(Math.random() * 8),
    }));

    const spendSeries = [{
        label: 'Actual Spend',
        data: months.map((_, i) => 750000 + i * 30000 + Math.floor(Math.random() * 50000)),
        color: 'var(--accent)',
    }, {
        label: 'Budget',
        data: months.map(() => 900000),
        color: 'var(--line-strong)',
    }];

    const topMeals = [
        { label: 'Jollof Rice & Chicken', value: 87 },
        { label: 'Fried Rice & Turkey', value: 64 },
        { label: 'Egusi Soup & Eba', value: 51 },
        { label: 'Grilled Tilapia', value: 43 },
        { label: 'Moi Moi & Pap', value: 38 },
    ];

    const issues: Issue[] = [
        { id: '1', date: '2025-06-09', company: 'Acme Corp', employee: 'Adaeze O.', type: 'Late delivery', status: 'open' },
        { id: '2', date: '2025-06-08', company: 'Acme Corp', employee: 'Chidi O.', type: 'Wrong meal', status: 'resolved', resolution: 'Credit applied' },
        { id: '3', date: '2025-06-05', company: 'Acme Corp', employee: 'Emeka N.', type: 'Missing item', status: 'in-progress' },
    ];

    if (loading) return (
        <div className="p-6 space-y-4">
            <SkeletonCard lines={2} />
            <SkeletonCard lines={4} />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-6"
        >
            <div>
                <h1 className="text-heading-s text-[var(--text)]">Reports</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">Participation, spend and issue analytics</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Participation */}
                <Card>
                    <CardHeader>
                        <CardTitle>Participation Rate (%)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={participationData}
                            height={180}
                            formatValue={(v) => `${v}%`}
                        />
                    </CardContent>
                </Card>

                {/* Spend vs budget */}
                <Card>
                    <CardHeader>
                        <CardTitle>Spend vs Budget (₦)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <LineChart
                            series={spendSeries}
                            labels={months}
                            height={180}
                            formatValue={(v) => `₦${Math.round(v / 1000)}k`}
                        />
                    </CardContent>
                </Card>

                {/* Top meals */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Top 5 Meals Ordered</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={topMeals}
                            height={200}
                            horizontal
                            formatValue={(v) => `${v} orders`}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Issues log */}
            <Card>
                <CardHeader>
                    <CardTitle>Issues Log</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-body-s">
                        <thead className="border-b border-[var(--line)]">
                        <tr>
                            {['Date', 'Employee', 'Issue Type', 'Status', 'Resolution'].map((h) => (
                                <th key={h} className="p-4 text-left text-label-xs text-[var(--muted)] font-semibold">{h}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--line)]">
                        {issues.map((issue) => (
                            <tr key={issue.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                <td className="p-4 text-[var(--muted)]">{formatDate(issue.date)}</td>
                                <td className="p-4 font-medium text-[var(--text)]">{issue.employee}</td>
                                <td className="p-4 text-[var(--muted)]">{issue.type}</td>
                                <td className="p-4">
                                    <Badge
                                        variant={issue.status === 'resolved' ? 'success' : issue.status === 'in-progress' ? 'warning' : 'danger'}
                                        dot
                                    >
                                        {issue.status}
                                    </Badge>
                                </td>
                                <td className="p-4 text-[var(--muted)]">{issue.resolution ?? '—'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </motion.div>
    );
}