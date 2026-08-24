'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { BarChart } from '@/components/charts/BarChart';
import { LineChart } from '@/components/charts/LineChart';
import { SkeletonCard } from '@/components/ui/Skeleton';

/**
 * No dedicated platform-wide analytics endpoint exists yet (ops.ts has
 * per-company packing/delivery data, but nothing aggregated across all
 * companies over time) — this renders with realistic mock data in the
 * same shape a real endpoint should return, so swapping in a real fetch
 * later is a one-function change, not a rebuild.
 */
export default function OpsAnalyticsPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 500);
    }, []);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const onTimeRate = days.map((label, i) => ({ label, value: 88 + Math.floor(Math.random() * 10) - (i === 3 ? 6 : 0) }));

    const deliverySeries = [
        { label: 'Delivered on time', data: days.map(() => 32 + Math.floor(Math.random() * 12)), color: 'var(--brand-green)' },
        { label: 'Delivered late', data: days.map(() => Math.floor(Math.random() * 4)), color: 'var(--accent-3)' },
    ];

    const topMeals = [
        { label: 'Jollof Rice & Chicken', value: 142 },
        { label: 'Rice & Buka Stew', value: 98 },
        { label: 'Fried Rice & Turkey', value: 81 },
        { label: 'Suya Platter', value: 67 },
        { label: 'Egusi & Pounded Yam', value: 54 },
    ];

    const kpis = [
        { label: 'On-time rate (7d)', value: '94%', icon: <CheckCircle2 size={18} />, tint: 'var(--brand-green)', tintSoft: 'var(--brand-green-tint)' },
        { label: 'Avg. delivery time', value: '38m', icon: <Clock size={18} />, tint: 'var(--accent-2-hover)', tintSoft: 'var(--accent-2-soft)' },
        { label: 'Deliveries today', value: '38', icon: <Truck size={18} />, tint: 'var(--accent-3)', tintSoft: 'var(--accent-3-soft)' },
        { label: 'Participation trend', value: '+6%', icon: <TrendingUp size={18} />, tint: 'var(--brand-green)', tintSoft: 'var(--brand-green-tint)' },
    ];

    if (loading) return <div className="space-y-4"><SkeletonCard lines={2} /><SkeletonCard lines={4} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-6 max-w-6xl">
            <div>
                <h1 className="text-heading-m text-[var(--text)]">Analytics</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">Delivery performance across all companies</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <Card key={kpi.label} accent={kpi.tint} padding="none">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-label-xs text-[var(--muted)]">{kpi.label}</p>
                                <span className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0" style={{ background: kpi.tintSoft, color: kpi.tint }}>
                                    {kpi.icon}
                                </span>
                            </div>
                            <p className="font-mono-num text-[26px]" style={{ color: kpi.tint }}>{kpi.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card accent="var(--brand-green)">
                    <CardHeader><CardTitle>On-time delivery rate</CardTitle></CardHeader>
                    <CardContent>
                        <BarChart data={onTimeRate} height={180} formatValue={(v) => `${v}%`} />
                    </CardContent>
                </Card>

                <Card accent="var(--accent-3)">
                    <CardHeader><CardTitle>On-time vs late</CardTitle></CardHeader>
                    <CardContent>
                        <LineChart series={deliverySeries} labels={days} height={180} formatValue={(v) => `${v}`} />
                    </CardContent>
                </Card>

                <Card accent="var(--accent-2)" className="lg:col-span-2">
                    <CardHeader><CardTitle>Top meals ordered (platform-wide)</CardTitle></CardHeader>
                    <CardContent>
                        <BarChart data={topMeals} height={200} horizontal formatValue={(v) => `${v} orders`} />
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
