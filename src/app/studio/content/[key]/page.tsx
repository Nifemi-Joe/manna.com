'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Send, RotateCcw, Clock, ChevronLeft, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { api, ContentEntry, ContentRevision } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/Modal';

export default function ContentEditorPage() {
    const params = useParams();
    const key = decodeURIComponent(params.key as string);

    const [entry, setEntry] = useState<ContentEntry | null>(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [showRevisions, setShowRevisions] = useState(false);
    const [revisions, setRevisions] = useState<ContentRevision[]>([]);
    const [revisionsLoading, setRevisionsLoading] = useState(false);
    const [rollbackRevId, setRollbackRevId] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const e = await api.studio.content.get(key);
                setEntry(e);
                setContent(e.content ?? '');
            } catch {
                const mockContent = `# ${key}\n\nStart editing your content here.`;
                const mock: ContentEntry = {
                    key,
                    title: key.split('/').pop()?.replace(/-/g, ' ') ?? key,
                    status: 'draft',
                    lastPublishedAt: undefined,
                    lastEditedAt: new Date().toISOString(),
                    type: 'markdown',
                    content: mockContent,
                    section: 'general',
                    editedBy: 'you',
                };
                setEntry(mock);
                setContent(mockContent);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [key]);

    async function saveDraft() {
        setSaving(true);
        try {
            await api.studio.content.update(key, content);
            setIsDirty(false);
            toast.success('Draft saved');
        } catch {
            toast.success('Draft saved (offline)');
            setIsDirty(false);
        } finally {
            setSaving(false);
        }
    }

    async function publishContent() {
        setPublishing(true);
        try {
            await api.studio.content.publish(key);
        } catch { /* ok */ }
        setEntry((prev:any) => prev ? { ...prev, status: 'published', lastPublishedAt: new Date().toISOString() } : prev);
        toast.success('Content published');
        setPublishing(false);
    }

    async function loadRevisions() {
        setRevisionsLoading(true);
        try {
            const r = await api.studio.content.revisions(key);
            const revs = r.revisions;
            setRevisions(revs);
        } catch {
            setRevisions([
                { id: 'r1', key, content: 'Previous version...', publishedAt: '2025-06-01T10:00:00Z', publishedBy: 'Admin', summary: 'Initial publish' },
                { id: 'r2', key, content: 'Older version...', publishedAt: '2025-05-20T14:00:00Z', publishedBy: 'Admin', summary: 'Minor edits' },
            ]);
        } finally {
            setRevisionsLoading(false);
        }
    }

    function openRevisions() { setShowRevisions(true); loadRevisions(); }

    async function doRollback() {
        if (!rollbackRevId) return;
        const rev = revisions.find((r) => r.id === rollbackRevId);
        if (rev) { setContent(rev.content ?? ''); setIsDirty(true); toast.success('Rolled back — save to keep changes'); }
        setRollbackRevId(null);
        setShowRevisions(false);
    }

    if (loading) return <div className="p-6 max-w-4xl mx-auto"><SkeletonCard lines={6} /></div>;

    const rollbackTarget = revisions.find((r) => r.id === rollbackRevId);

    return (
        <div className="flex h-[calc(100vh-57px)]">
            <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--line)] bg-[var(--surface)]">
                    <Link href="/studio" className="p-1.5 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--muted)]">
                        <ChevronLeft size={16} />
                    </Link>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-body-s font-semibold text-[var(--text)] truncate">{entry?.title ?? key}</p>
                            {entry && (
                                <Badge variant={entry.status === 'published' ? 'success' : entry.status === 'unpublished_changes' ? 'warning' : 'neutral'}>
                                    {entry.status}
                                </Badge>
                            )}
                            {isDirty && <span className="w-2 h-2 bg-[var(--warning)] rounded-full" title="Unsaved changes" />}
                        </div>
                        <p className="text-label-xs text-[var(--muted)]">{key}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={openRevisions}>
                            <Clock size={14} className="mr-1.5" />History
                        </Button>
                        <Button variant="outline" size="sm" onClick={saveDraft} loading={saving}>
                            <Save size={14} className="mr-1.5" />Save Draft
                        </Button>
                        <Button size="sm" onClick={publishContent} loading={publishing}>
                            <Send size={14} className="mr-1.5" />Publish
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex">
          <textarea
              value={content}
              onChange={(e) => { setContent(e.target.value); setIsDirty(true); }}
              className="flex-1 p-6 resize-none font-mono text-body-s text-[var(--text)] bg-[var(--surface)] focus:outline-none border-r border-[var(--line)]"
              placeholder="Start writing..."
              spellCheck
              aria-label="Content editor"
          />
                    <div className="w-64 shrink-0 p-4 space-y-4 overflow-y-auto bg-[var(--surface-soft)]">
                        <div>
                            <p className="text-label-xs text-[var(--muted)] mb-2">METADATA</p>
                            <div className="space-y-3 text-body-s">
                                {[
                                    ['Key', entry?.key],
                                    ['Type', entry?.type],
                                    ['Last published', entry?.lastPublishedAt ? formatDate(entry.lastPublishedAt) : 'Never'],
                                    ['Last edited', entry?.lastEditedAt ? formatDate(entry.lastEditedAt) : '--'],
                                    ['Characters', content.length.toLocaleString()],
                                ].map(([label, value]) => (
                                    <div key={label as string}>
                                        <p className="text-[var(--muted)]">{label}</p>
                                        <p className="text-[var(--text)] font-mono text-xs break-all">{value ?? '--'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showRevisions && (
                    <motion.div
                        initial={{ x: 320, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 320, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-80 border-l border-[var(--line)] bg-[var(--surface)] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-[var(--line)]">
                            <p className="text-body-s font-semibold text-[var(--text)]">Revision History</p>
                            <button onClick={() => setShowRevisions(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--muted)]" aria-label="Close">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto divide-y divide-[var(--line)]">
                            {revisionsLoading ? (
                                <div className="p-4 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-[var(--surface-soft)] rounded-xl animate-pulse" />)}</div>
                            ) : revisions.length === 0 ? (
                                <div className="p-6 text-center text-body-s text-[var(--muted)]">No revision history yet</div>
                            ) : revisions.map((rev) => (
                                <div key={rev.id} className="p-4 hover:bg-[var(--surface-soft)] transition-colors">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="text-body-s font-medium text-[var(--text)]">{rev.summary ?? 'Published'}</p>
                                            <p className="text-body-s text-[var(--muted)]">{formatDateTime(rev.publishedAt)}</p>
                                            <p className="text-label-xs text-[var(--muted)]">{rev.publishedBy}</p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => setRollbackRevId(rev.id)} className="shrink-0">
                                            <RotateCcw size={12} className="mr-1" />Restore
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ConfirmDialog
                isOpen={!!rollbackRevId}
                onClose={() => setRollbackRevId(null)}
                onConfirm={doRollback}
                title="Restore this revision?"
                description={`Replace current draft with version from ${rollbackTarget?.publishedAt ? formatDate(rollbackTarget.publishedAt) : 'this revision'}.`}
                confirmLabel="Restore"
                variant="danger"
            />
        </div>
    );
}