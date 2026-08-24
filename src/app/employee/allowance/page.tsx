'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, CreditCard, Info } from 'lucide-react';
import { api, AllowanceInfo } from '@/lib/api';
import { formatNaira, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { BarChart } from '@/components/charts/BarChart';

interface TopUp {
    id: string;
    date: string;
    amount: number;
    reference: string;
    status: 'completed' | 'pending' | 'failed';
}

interface AllowancePageData {
    allowance: AllowanceInfo;
    monthlySpend: { label: string; value: number }[];
    topUps: TopUp[];
}

const TOPUP_STYLES: Record<TopUp['status'], string> = {
    completed: 'bg-[var(--success-bg)] text-[var(--success)]',
    pending: 'bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)]',
    failed: 'bg-[var(--danger-bg)] text-[var(--danger)]',
};

export default function AllowancePage() {
    const [data, setData] = useState<AllowancePageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const allowance = await api.employee.allowance();
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                const monthlySpend = months.map((label) => ({
                    label,
                    value: Math.floor(Math.random() * 80000) + 20000,
                }));
                setData({ allowance, monthlySpend, topUps: [] });
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load allowance');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="page-wash min-h-full p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
                <SkeletonCard lines={3} />
                <SkeletonCard lines={2} />
                <SkeletonTable rows={4} />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="page-wash min-h-full p-4 md:p-6 max-w-2xl mx-auto">
                <EmptyState
                    variant="error"
                    title="Couldn't load allowance"
                    description={error ?? 'Something went wrong. Please try again.'}
                    action={<Button size="sm" onClick={() => window.location.reload()}>Retry</Button>}
                />
            </div>
        );
    }

    const { allowance, monthlySpend, topUps } = data;
    const usedPercent = Math.min(100, ((allowance.used ?? 0) / (allowance.daily ?? 1)) * 100);

    return (
        <div className="page-wash min-h-full">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 md:p-6 space-y-6 max-w-2xl mx-auto"
            >
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">My allowance</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">Track your meal benefits and top-up history</p>
                </div>

                {/* Balance card — richer gradient + blur accents instead of flat brand-green */}
                <Card variant="default" className="relative overflow-hidden border-0" padding="none">
                    <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(135deg, var(--brand-green), var(--brand-green-dark))" }}
                        aria-hidden="true"
                    />
                    <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-[var(--accent-2)]/20 blur-2xl" aria-hidden="true" />
                    <CardContent className="relative p-5 text-white">
                        <p className="text-label-xs text-white/60 mb-1">Available today</p>
                        <p className="text-display-l font-bold text-white font-mono-num">{formatNaira(allowance.remaining ?? 0)}</p>
                        <div className="mt-3">
                            <div className="flex justify-between text-body-s text-white/70 mb-1">
                                <span className="font-mono-num">Used: {formatNaira(allowance.used ?? 0)}</span>
                                <span className="font-mono-num">Daily limit: {formatNaira(allowance.daily ?? 0)}</span>
                            </div>
                            <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${usedPercent}%` }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                    className="h-full rounded-full"
                                    style={{ background: "linear-gradient(90deg, var(--accent-2), var(--accent-3))" }}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Allowance rules */}
                <Card accent="var(--accent-2)">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info size={16} className="text-[var(--accent-2-hover)]" />
                            Your benefit plan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-[var(--surface-soft)] rounded-[var(--radius-md)]">
                                <p className="text-label-xs text-[var(--muted)] mb-1">Daily allowance</p>
                                <p className="text-heading-s text-[var(--text)] font-mono-num">{formatNaira(allowance.daily ?? 0)}</p>
                            </div>
                            <div className="p-3 bg-[var(--surface-soft)] rounded-[var(--radius-md)]">
                                <p className="text-label-xs text-[var(--muted)] mb-1">Meal type</p>
                                <p className="text-heading-s text-[var(--text)] capitalize">{allowance.mealType ?? 'Lunch'}</p>
                            </div>
                            <div className="p-3 bg-[var(--surface-soft)] rounded-[var(--radius-md)] col-span-2">
                                <p className="text-label-xs text-[var(--muted)] mb-1">Eligible days</p>
                                <div className="flex gap-2 mt-1">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
                                        <span key={day} className="px-2 py-0.5 bg-[var(--brand-green)] text-white rounded text-label-xs">
                                            {day}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly spend chart */}
                <Card accent="var(--brand-green)">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp size={16} className="text-[var(--brand-green)]" />
                            Monthly spend
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart data={monthlySpend} height={160} formatValue={(v) => `₦${Math.round(v / 1000)}k`} />
                    </CardContent>
                </Card>

                {/* Top-up history */}
                <Card accent="var(--accent-3)">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard size={16} className="text-[var(--accent-3)]" />
                            Top-up history
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topUps.length === 0 ? (
                            <EmptyState
                                variant="empty"
                                title="No top-ups yet"
                                description="When you top up your allowance, transactions will appear here."
                            />
                        ) : (
                            <div className="divide-y divide-[var(--line)]">
                                {topUps.map((t) => (
                                    <div key={t.id} className="py-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-body-s text-[var(--text)] font-medium font-mono-num">{formatNaira(t.amount)}</p>
                                            <p className="text-body-s text-[var(--muted)]">{formatDate(t.date)} · {t.reference}</p>
                                        </div>
                                        <span className={`text-label-xs font-medium px-2 py-0.5 rounded-full ${TOPUP_STYLES[t.status]}`}>
                                            {t.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
