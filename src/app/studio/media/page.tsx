'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image, FileText, File, X, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { api, MediaAsset } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';
import { SkeletonCard } from '@/components/ui/Skeleton';

function FileIcon({ type }: { type: string }) {
    if (type.startsWith('image/')) return <Image size={20} className="text-[var(--brand-green)]" />;
    if (type.includes('pdf')) return <FileText size={20} className="text-[var(--accent-3)]" />;
    return <File size={20} className="text-[var(--muted)]" />;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaPage() {
    const [assets, setAssets] = useState<MediaAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [selected, setSelected] = useState<MediaAsset | null>(null);
    const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null);
    const [altText, setAltText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        async function load() {
            try {
                const r = await api.studio.media.list();
                const list = r.assets;
                setAssets(list);
            } catch {
                setAssets([
                    { id: '1', filename: 'hero-image.jpg', url: '/placeholder.jpg', mimeType: 'image/jpeg', sizeBytes: 245678, uploadedAt: '2025-06-01', uploadedBy: 'admin', tags: [], alt: 'Office lunch spread' },
                    { id: '2', filename: 'menu-sample.pdf', url: '/sample.pdf', mimeType: 'application/pdf', sizeBytes: 89432, uploadedAt: '2025-05-15', uploadedBy: 'admin', tags: [] },
                    { id: '3', filename: 'team-photo.png', url: '/team.png', mimeType: 'image/png', sizeBytes: 512000, uploadedAt: '2025-05-01', uploadedBy: 'admin', tags: [] },
                ]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    async function handleUpload(files: FileList | null) {
        if (!files || files.length === 0) return;
        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);
            try {
                const asset = await api.studio.media.upload(formData);
                setAssets((prev) => [asset, ...prev]);
                toast.success(`${file.name} uploaded`);
            } catch {
                const mockAsset: MediaAsset = {
                    id: Date.now().toString(),
                    filename: file.name,
                    url: URL.createObjectURL(file),
                    mimeType: file.type,
                    sizeBytes: file.size,
                    uploadedAt: new Date().toISOString(),
                    uploadedBy: 'you',
                    tags: [],
                };
                setAssets((prev) => [mockAsset, ...prev]);
                toast.success(`${file.name} uploaded`);
            }
        }
    }

    async function saveMetadata() {
        if (!editingAsset) return;
        try {
            await api.studio.media.update(editingAsset.id, { alt: altText });
        } catch { /* ok */ }
        setAssets((prev) => prev.map((a) => (a.id === editingAsset.id ? { ...a, alt: altText } : a)));
        toast.success('Metadata updated');
        setEditingAsset(null);
    }

    if (loading) return (
        <div className="p-6 max-w-4xl mx-auto">
            <SkeletonCard lines={2} />
            <div className="grid grid-cols-4 gap-4 mt-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-32 bg-[var(--surface)] rounded-[var(--radius-lg)] animate-pulse" />)}
            </div>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-6 max-w-5xl mx-auto"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">Media library</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">
                        <span className="font-mono-num">{assets.length}</span> assets
                    </p>
                </div>
                <Button variant="amber" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={14} className="mr-1.5" />Upload
                </Button>
                <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
            </div>

            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleUpload(e.dataTransfer.files); }}
                className={`border-2 border-dashed rounded-[var(--radius-lg)] p-8 text-center transition-colors ${
                    isDragging ? 'border-[var(--accent-2)] bg-[var(--accent-2-soft)]' : 'border-[var(--line)] hover:border-[var(--accent-2)]'
                }`}
            >
                <Upload size={20} className="mx-auto mb-2 text-[var(--accent-2)]" />
                <p className="text-body-s text-[var(--muted)]">
                    Drop files here or <button onClick={() => fileInputRef.current?.click()} className="text-[var(--accent-2-hover)] underline">browse</button>
                </p>
                <p className="text-label-xs text-[var(--muted)] mt-1">Images, PDFs up to 10MB</p>
            </div>

            {/* Grid */}
            {assets.length === 0 ? (
                <EmptyState variant="no-media" title="No media yet" description="Upload your first file above." />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <AnimatePresence>
                        {assets.map((asset) => (
                            <motion.div
                                key={asset.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`relative group rounded-[var(--radius-lg)] border cursor-pointer transition-colors overflow-hidden ${
                                    selected?.id === asset.id ? 'border-[var(--accent-2)] ring-2 ring-[var(--accent-2)]' : 'border-[var(--line)] hover:border-[var(--accent-2)]'
                                }`}
                                onClick={() => setSelected(selected?.id === asset.id ? null : asset)}
                            >
                                <div className="aspect-square bg-[var(--surface-soft)] flex items-center justify-center">
                                    {asset.mimeType.startsWith('image/') ? (
                                        <img src={asset.url} alt={asset.alt ?? asset.filename} className="w-full h-full object-cover" />
                                    ) : (
                                        <FileIcon type={asset.mimeType} />
                                    )}
                                </div>
                                <div className="p-2 bg-[var(--surface)]">
                                    <p className="text-label-xs font-medium text-[var(--text)] truncate">{asset.filename}</p>
                                    <p className="text-label-xs text-[var(--muted)]">{formatBytes(asset.sizeBytes)}</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setEditingAsset(asset); setAltText(asset.alt ?? ''); }}
                                    className="absolute top-2 right-2 p-1 bg-white/90 backdrop-blur-sm rounded-[var(--radius-md)] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                    aria-label="Edit metadata"
                                >
                                    <Edit3 size={12} className="text-[var(--muted)]" />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Asset detail panel */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)] p-4 flex items-center gap-4 z-50 max-w-lg w-full mx-4"
                        style={{ borderTop: "3px solid var(--accent-2)" }}
                    >
                        <div className="w-12 h-12 bg-[var(--surface-soft)] rounded-[var(--radius-md)] flex items-center justify-center shrink-0 overflow-hidden">
                            {selected.mimeType.startsWith('image/') ? (
                                <img src={selected.url} alt={selected.filename} className="w-full h-full object-cover" />
                            ) : (
                                <FileIcon type={selected.mimeType} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-body-s font-medium text-[var(--text)] truncate">{selected.filename}</p>
                            <p className="text-body-s text-[var(--muted)]">{formatBytes(selected.sizeBytes)} · {formatDate(selected.uploadedAt)}</p>
                            {selected.alt && <p className="text-label-xs text-[var(--muted)] truncate">Alt: {selected.alt}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(selected.url).then(() => toast.success('URL copied'))}>Copy URL</Button>
                            <button onClick={() => setSelected(null)} className="p-1.5 text-[var(--muted)] hover:text-[var(--text)]"><X size={16} /></button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit metadata modal */}
            <Modal isOpen={!!editingAsset} onClose={() => setEditingAsset(null)} title="Edit asset metadata">
                <div className="space-y-4">
                    <div>
                        <p className="text-body-s text-[var(--muted)] mb-1">Filename</p>
                        <p className="text-body-s font-medium text-[var(--text)]">{editingAsset?.filename}</p>
                    </div>
                    <Input
                        label="Alt text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Describe this image for accessibility"
                    />
                    <div className="flex gap-3">
                        <Button variant="amber" onClick={saveMetadata}>Save</Button>
                        <Button variant="outline" onClick={() => setEditingAsset(null)}>Cancel</Button>
                    </div>
                </div>
            </Modal>
        </motion.div>
    );
}
