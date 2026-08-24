'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, Download, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface PackingItem {
    employeeName: string;
    meal: string;
    tags: string[];
    notes?: string;
}

interface MealGroup {
    mealName: string;
    items: PackingItem[];
}

interface CompanyGroup {
    company: string;
    address: string;
    totalItems: number;
    meals: MealGroup[];
}

const MOCK: CompanyGroup[] = [
    {
        company: 'Acme Corp',
        address: '14 Broad Street, Lagos Island',
        totalItems: 8,
        meals: [
            {
                mealName: 'Jollof Rice & Chicken',
                items: [
                    { employeeName: 'Adaeze Okonkwo', meal: 'Jollof Rice & Chicken', tags: [] },
                    { employeeName: 'Emeka Nwosu', meal: 'Jollof Rice & Chicken', tags: ['spice-free'] },
                    { employeeName: 'Tolu Balogun', meal: 'Jollof Rice & Chicken', tags: [] },
                ],
            },
            {
                mealName: 'Fried Rice & Turkey',
                items: [
                    { employeeName: 'Ngozi Eze', meal: 'Fried Rice & Turkey', tags: ['halal'] },
                    { employeeName: 'Chidi Obi', meal: 'Fried Rice & Turkey', tags: [] },
                ],
            },
            {
                mealName: 'Egusi Soup & Eba',
                items: [
                    { employeeName: 'Funmi Adeyemi', meal: 'Egusi Soup & Eba', tags: ['vegan'] },
                    { employeeName: 'Sola Martins', meal: 'Egusi Soup & Eba', tags: [] },
                    { employeeName: 'Kemi Adesanya', meal: 'Egusi Soup & Eba', tags: [] },
                ],
            },
        ],
    },
];

// Warmer palette than the original blue/green/yellow-100 set, tied to the
// brand accents instead of generic Tailwind grays
const TAG_COLORS: Record<string, string> = {
    vegan: 'bg-[var(--brand-green-tint)] text-[var(--brand-green)]',
    halal: 'bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)]',
    'spice-free': 'bg-[var(--surface-soft)] text-[var(--muted)] border border-[var(--line)]',
};

export default function PackingPage() {
    const [groups, setGroups] = useState<CompanyGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    useEffect(() => {
        setTimeout(() => { setGroups(MOCK); setLoading(false); }, 600);
    }, []);

    function toggleCollapse(company: string) {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(company)) next.delete(company); else next.add(company);
            return next;
        });
    }

    if (loading) return (
        <div className="p-6 space-y-4">
            <SkeletonCard lines={4} />
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
            <div className="flex items-center justify-between print:hidden">
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">Packing lists</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">
                        <span className="font-mono-num">{groups.reduce((acc, g) => acc + g.totalItems, 0)}</span> total items for today
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => window.print()}>
                        <Printer size={14} className="mr-1.5" />Print
                    </Button>
                    <Button variant="amber" size="sm">
                        <Download size={14} className="mr-1.5" />Export CSV
                    </Button>
                </div>
            </div>

            {groups.length === 0 ? (
                <EmptyState
                    variant="empty"
                    title="No packing lists"
                    description="Packing lists will appear once orders have been placed."
                />
            ) : (
                groups.map((group) => {
                    const isCollapsed = collapsed.has(group.company);
                    return (
                        <Card key={group.company} accent="var(--brand-green)" padding="none" className="print:shadow-none print:border">
                            <CardContent className="p-0">
                                {/* Company header */}
                                <button
                                    className="w-full flex items-center justify-between p-4 hover:bg-[var(--surface-soft)] transition-colors print:hidden"
                                    onClick={() => toggleCollapse(group.company)}
                                >
                                    <div className="text-left">
                                        <p className="text-body-m font-semibold text-[var(--text)]">{group.company}</p>
                                        <p className="text-body-s text-[var(--muted)]">{group.address}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-label-xs font-semibold font-mono-num bg-[var(--brand-green)] text-white px-2 py-0.5 rounded-full">
                                            {group.totalItems} items
                                        </span>
                                        {isCollapsed ? <ChevronRight size={16} className="text-[var(--muted)]" /> : <ChevronDown size={16} className="text-[var(--muted)]" />}
                                    </div>
                                </button>

                                {/* Print-always header */}
                                <div className="hidden print:flex items-center justify-between p-4 border-b border-[var(--line)]">
                                    <div>
                                        <p className="font-bold text-lg">{group.company}</p>
                                        <p className="text-sm text-gray-600">{group.address}</p>
                                    </div>
                                    <p className="font-semibold">{group.totalItems} items</p>
                                </div>

                                {!isCollapsed && (
                                    <div className="divide-y divide-[var(--line)]">
                                        {group.meals.map((mealGroup) => (
                                            <div key={mealGroup.mealName} className="p-4">
                                                <p className="text-body-s font-semibold text-[var(--text)] mb-3">
                                                    {mealGroup.mealName}
                                                    <span className="ml-2 text-label-xs text-[var(--muted)] font-normal font-mono-num">
                                                        × {mealGroup.items.length}
                                                    </span>
                                                </p>
                                                <div className="space-y-1.5">
                                                    {mealGroup.items.map((item, i) => (
                                                        <div key={i} className="flex items-center gap-3 text-body-s">
                                                            <span className="w-5 h-5 bg-[var(--surface-soft)] border border-[var(--line)] rounded flex items-center justify-center text-label-xs print:border-black" />
                                                            <span className="text-[var(--text)]">{item.employeeName}</span>
                                                            {item.tags.map((tag) => (
                                                                <span key={tag} className={`px-1.5 py-0.5 rounded text-label-xs font-medium ${TAG_COLORS[tag] ?? 'bg-[var(--surface-soft)] text-[var(--muted)]'}`}>
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {item.notes && (
                                                                <span className="text-[var(--muted)] italic">{item.notes}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })
            )}

            <style jsx global>{`
                @media print {
                    .print\\:hidden { display: none !important; }
                    body { font-size: 12px; }
                }
            `}</style>
        </motion.div>
    );
}
