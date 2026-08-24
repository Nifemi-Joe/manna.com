'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, FileText, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { api, ContentEntry } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface GroupedContent {
    section: string;
    entries: ContentEntry[];
}

// Rotating section-header colors so a long content list doesn't read as
// one undifferentiated block
const SECTION_COLORS = ['var(--brand-green)', 'var(--accent-2-hover)', 'var(--accent-3)'];

function groupBySection(entries: ContentEntry[]): GroupedContent[] {
    const map = new Map<string, ContentEntry[]>();
    for (const entry of entries) {
        const section = entry.key.split('/')[0] ?? 'general';
        if (!map.has(section)) map.set(section, []);
        map.get(section)!.push(entry);
    }
    return Array.from(map.entries()).map(([section, entries]) => ({ section, entries }));
}

function StatusBadge({ status }: { status: ContentEntry['status'] }) {
    const config = {
        published: { variant: 'success' as const, label: 'Published' },
        draft: { variant: 'neutral' as const, label: 'Draft' },
        unpublished_changes: { variant: 'warning' as const, label: 'Unpublished changes' },
    };
    const c = config[status] ?? config.draft;
    return <Badge variant={c.variant}>{c.label}</Badge>;
}

export default function StudioPage() {
    const [groups, setGroups] = useState<GroupedContent[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try {
            const r = await api.studio.content.list();
            setGroups(groupBySection(r.entries));
        } catch {
            const mock: ContentEntry[] = [
                { key: 'landing/hero', title: 'Hero Section', status: 'published' as const, lastPublishedAt: '2025-06-01', lastEditedAt: '2025-06-05', type: 'markdown' as const, section: 'landing', content: '', editedBy: 'admin' },
                { key: 'landing/cta', title: 'CTA Section', status: 'unpublished_changes' as const, lastPublishedAt: '2025-05-20', lastEditedAt: '2025-06-09', type: 'markdown' as const, section: 'landing', content: '', editedBy: 'admin' },
                { key: 'landing/benefits', title: 'Benefits Grid', status: 'draft' as const, lastPublishedAt: undefined, lastEditedAt: '2025-06-09', type: 'markdown' as const, section: 'landing', content: '', editedBy: 'admin' },
                { key: 'faq/hr', title: 'HR FAQs', status: 'published' as const, lastPublishedAt: '2025-05-01', lastEditedAt: '2025-05-01', type: 'json' as const, section: 'faq', content: '[]', editedBy: 'admin' },
                { key: 'faq/employee', title: 'Employee FAQs', status: 'published' as const, lastPublishedAt: '2025-05-01', lastEditedAt: '2025-05-01', type: 'json' as const, section: 'faq', content: '[]', editedBy: 'admin' },
                { key: 'email/welcome', title: 'Welcome Email', status: 'draft' as const, lastPublishedAt: undefined, lastEditedAt: '2025-06-08', type: 'text' as const, section: 'email', content: '', editedBy: 'admin' },
            ];
            setGroups(groupBySection(mock));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    if (loading) return (
        <div className="p-6 space-y-4 max-w-3xl mx-auto">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-6 max-w-3xl mx-auto"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">Content Studio</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">Manage all site and email content</p>
                </div>
                <button
                    onClick={load}
                    className="p-2 rounded-[var(--radius-md)] hover:bg-[var(--accent-2-soft)] hover:text-[var(--accent-2-hover)] text-[var(--muted)] transition-colors"
                    aria-label="Refresh"
                >
                    <RefreshCw size={16} />
                </button>
            </div>

            {groups.length === 0 ? (
                <EmptyState variant="no-content" title="No content entries" description="Content entries will appear here once created." />
            ) : (
                <div className="space-y-6">
                    {groups.map(({ section, entries }, gi) => {
                        const color = SECTION_COLORS[gi % SECTION_COLORS.length];
                        return (
                            <div key={section}>
                                <div className="flex items-center gap-2 mb-2 px-1">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                                    <h2 className="text-label-xs font-semibold uppercase tracking-widest" style={{ color }}>
                                        {section}
                                    </h2>
                                </div>
                                <div
                                    className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] divide-y divide-[var(--line)] overflow-hidden"
                                    style={{ borderTop: `3px solid ${color}` }}
                                >
                                    {entries.map((entry) => (
                                        <Link
                                            key={entry.key}
                                            href={`/studio/content/${encodeURIComponent(entry.key)}`}
                                            className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--surface-soft)] transition-colors group"
                                        >
                                            <FileText size={16} className="text-[var(--muted)] shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-body-s font-medium text-[var(--text)]">{entry.title ?? entry.key}</p>
                                                <p className="text-body-s text-[var(--muted)] truncate">
                                                    {entry.key} · {entry.type}
                                                    {entry.lastEditedAt && ` · Edited ${formatDate(entry.lastEditedAt)}`}
                                                </p>
                                            </div>
                                            <StatusBadge status={entry.status} />
                                            <ChevronRight size={14} className="text-[var(--line-strong)] group-hover:text-[var(--muted)] transition-colors shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}
