'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Search, ShoppingBag, Users2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatNaira, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Company {
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: 'active' | 'suspended' | 'churned';
    address: string;
    city: string;
    employeeCount: number;
    orderCount: number;
    lifetimeSpend: number;
    createdAt: string;
}

const PLAN_TINT: Record<string, string> = {
    pilot: 'var(--accent-2)',
    starter: 'var(--brand-green)',
    growth: 'var(--accent-3)',
    enterprise: 'var(--brand-green-dark)',
};

export default function AdminCompaniesPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/v1/admin/companies', { credentials: 'include' });
                const data = await res.json();
                setCompanies(data.companies ?? []);
            } catch {
                toast.error('Could not load companies');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = companies.filter(
        (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase())
    );

    const totals = companies.reduce(
        (acc, c) => ({ orders: acc.orders + c.orderCount, spend: acc.spend + c.lifetimeSpend, employees: acc.employees + c.employeeCount }),
        { orders: 0, spend: 0, employees: 0 }
    );

    if (loading) return <div className="p-6"><SkeletonTable rows={5} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6 space-y-5 max-w-6xl">
            <div>
                <h1 className="text-heading-m text-[var(--text)]">Companies</h1>
                <p className="text-body-s text-[var(--muted)] mt-1"><span className="font-mono-num">{companies.length}</span> companies on the platform</p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Total orders (all-time)', value: totals.orders, tint: 'var(--brand-green)' },
                    { label: 'Lifetime spend', value: formatNaira(totals.spend), tint: 'var(--accent-2-hover)' },
                    { label: 'Total employees', value: totals.employees, tint: 'var(--accent-3)' },
                ].map(({ label, value, tint }) => (
                    <Card key={label} accent={tint} padding="none">
                        <CardContent className="p-4">
                            <p className="text-label-xs text-[var(--muted)] mb-1">{label}</p>
                            <p className="font-mono-num text-[24px]" style={{ color: tint }}>{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="relative max-w-xs">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search companies…"
                    className="w-full h-10 pl-8 pr-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]"
                />
            </div>

            <Card accent="var(--brand-green)" padding="none">
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <EmptyState variant="empty" title="No companies found" description="Approve a pilot lead to onboard your first company." />
                    ) : (
                        <div className="overflow-x-auto thin-scroll">
                            <table className="w-full text-body-s">
                                <thead className="border-b border-[var(--line)]">
                                <tr>
                                    {['Company', 'Plan', 'Status', 'Employees', 'Orders', 'Lifetime spend', 'Since'].map((h) => (
                                        <th key={h} className="p-3 text-left text-label-xs text-[var(--muted)]">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--line)]">
                                {filtered.map((c) => (
                                    <tr key={c.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                        <td className="p-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--brand-green-tint)] text-[var(--brand-green)] flex items-center justify-center shrink-0">
                                                    <Building2 size={14} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-[var(--text)]">{c.name}</p>
                                                    <p className="text-[var(--muted)]">{c.city}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                                <span
                                                    className="text-label-xs px-2 py-0.5 rounded-full capitalize"
                                                    style={{ background: `color-mix(in srgb, ${PLAN_TINT[c.plan] ?? 'var(--muted)'} 14%, transparent)`, color: PLAN_TINT[c.plan] ?? 'var(--muted)' }}
                                                >
                                                    {c.plan}
                                                </span>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={c.status === 'active' ? 'success' : c.status === 'suspended' ? 'warning' : 'neutral'} dot>{c.status}</Badge>
                                        </td>
                                        <td className="p-3 text-[var(--text)]">
                                            <span className="flex items-center gap-1.5 font-mono-num"><Users2 size={13} className="text-[var(--muted)]" />{c.employeeCount}</span>
                                        </td>
                                        <td className="p-3 text-[var(--text)]">
                                            <span className="flex items-center gap-1.5 font-mono-num"><ShoppingBag size={13} className="text-[var(--muted)]" />{c.orderCount}</span>
                                        </td>
                                        <td className="p-3 text-[var(--text)] font-mono-num">{formatNaira(c.lifetimeSpend)}</td>
                                        <td className="p-3 text-[var(--muted)]">{formatDate(c.createdAt)}</td>
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
