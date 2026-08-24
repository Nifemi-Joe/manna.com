'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Plus, Upload, Trash2, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { formatNaira } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

interface OpsMeal {
    id: string;
    name: string;
    description: string;
    price: number;
    mealWindow: 'breakfast' | 'lunch';
    spiceLevel: string;
    imageUrl?: string;
    available: boolean;
}

const mealFormSchema = z.object({
    name: z.string().min(2, 'Name required'),
    description: z.string().optional(),
    price: z.coerce.number().positive('Price required'),
    mealWindow: z.enum(['breakfast', 'lunch']),
    spiceLevel: z.enum(['none', 'mild', 'medium', 'hot']),
});

// price uses z.coerce.number(), so the schema's "input" shape (what the raw
// form field holds, e.g. unknown/string) differs from its "output" shape
// (price: number, after Zod parses it). useForm needs the input shape for
// register/defaultValues/reset, and the output shape for the submit handler.
type MealFormInput = z.input<typeof mealFormSchema>;
type MealFormOutput = z.output<typeof mealFormSchema>;

/**
 * The actual fix for "menu edit UI, not just a seed script" — Ops can
 * add, edit, photograph, and retire meals right here. This is the
 * library the weekly schedule (the existing Ops → Menus page) pulls
 * meals from.
 */
export default function OpsMealsPage() {
    const [meals, setMeals] = useState<OpsMeal[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [windowFilter, setWindowFilter] = useState<'all' | 'breakfast' | 'lunch'>('all');
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<OpsMeal | null>(null);
    const [retireTarget, setRetireTarget] = useState<OpsMeal | null>(null);
    const [uploadingFor, setUploadingFor] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingUploadMealId = useRef<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<
        MealFormInput,
        unknown,
        MealFormOutput
    >({
        resolver: zodResolver(mealFormSchema),
        defaultValues: { mealWindow: 'lunch', spiceLevel: 'none' },
    });

    async function load() {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/ops/meals?includeUnavailable=true', { credentials: 'include' });
            const data = await res.json();
            setMeals(data.meals ?? []);
        } catch {
            toast.error('Could not load meals');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    const filtered = meals.filter((m) => {
        const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
        const matchWindow = windowFilter === 'all' || m.mealWindow === windowFilter;
        return matchSearch && matchWindow;
    });

    function openCreate() {
        setEditing(null);
        reset({ name: '', description: '', price: 2500, mealWindow: 'lunch', spiceLevel: 'none' });
        setShowForm(true);
    }

    function openEdit(meal: OpsMeal) {
        setEditing(meal);
        reset({ name: meal.name, description: meal.description, price: meal.price, mealWindow: meal.mealWindow, spiceLevel: meal.spiceLevel as any });
        setShowForm(true);
    }

    async function onSubmit(data: MealFormOutput) {
        try {
            const res = await fetch(editing ? `/api/v1/ops/meals/${editing.id}` : '/api/v1/ops/meals', {
                method: editing ? 'PATCH' : 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, dietary: [], allergens: [] }),
            });
            const result = await res.json();
            if (!res.ok) { toast.error(result?.message ?? 'Could not save meal'); return; }
            toast.success(editing ? 'Meal updated' : `"${data.name}" added to the menu`);
            setShowForm(false);
            load();
        } catch {
            toast.error('Could not reach the server');
        }
    }

    function triggerUpload(mealId: string) {
        pendingUploadMealId.current = mealId;
        fileInputRef.current?.click();
    }

    async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        const mealId = pendingUploadMealId.current;
        if (!file || !mealId) return;

        setUploadingFor(mealId);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`/api/v1/ops/meals/${mealId}/image`, { method: 'POST', credentials: 'include', body: formData });
            const result = await res.json();
            if (!res.ok) { toast.error(result?.message ?? 'Upload failed'); return; }
            setMeals((prev) => prev.map((m) => (m.id === mealId ? { ...m, imageUrl: result.meal.imageUrl } : m)));
            toast.success('Photo updated');
        } catch {
            toast.error('Could not reach the server');
        } finally {
            setUploadingFor(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    async function confirmRetire() {
        if (!retireTarget) return;
        try {
            await fetch(`/api/v1/ops/meals/${retireTarget.id}`, { method: 'DELETE', credentials: 'include' });
            setMeals((prev) => prev.map((m) => (m.id === retireTarget.id ? { ...m, available: false } : m)));
            toast.success(`"${retireTarget.name}" retired from the menu`);
            setRetireTarget(null);
        } catch {
            toast.error('Could not retire meal');
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">Meal library</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">Add, edit, and photograph meals — the weekly schedule pulls from here.</p>
                </div>
                <Button variant="amber" size="sm" onClick={openCreate}><Plus size={14} className="mr-1.5" />Add meal</Button>
            </div>

            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search meals…"
                        className="w-full h-10 pl-8 pr-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]"
                    />
                </div>
                <div className="flex gap-1 bg-[var(--surface)] p-1 rounded-[var(--radius-md)] border border-[var(--line)]">
                    {(['all', 'breakfast', 'lunch'] as const).map((w) => (
                        <button
                            key={w}
                            onClick={() => setWindowFilter(w)}
                            className={`px-3 py-1.5 rounded-[calc(var(--radius-md)-4px)] text-body-s font-medium capitalize transition-colors ${
                                windowFilter === w ? 'bg-[var(--brand-green)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            {w}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-56 bg-[var(--surface)] rounded-[var(--radius-lg)] animate-pulse" />)}
                </div>
            ) : filtered.length === 0 ? (
                <Card><CardContent><EmptyState variant="empty" title="No meals found" description="Add your first meal to get started." /></CardContent></Card>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {filtered.map((meal) => (
                        <Card key={meal.id} padding="none" className={!meal.available ? 'opacity-50' : ''}>
                            <CardContent className="p-0">
                                <div className="relative h-28 bg-[var(--surface-soft)]">
                                    {meal.imageUrl ? (
                                        <Image src={meal.imageUrl} alt={meal.name} fill sizes="200px" className="object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-50">🍽️</div>
                                    )}
                                    <button
                                        onClick={() => triggerUpload(meal.id)}
                                        disabled={uploadingFor === meal.id}
                                        className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center text-[var(--accent-2-hover)] hover:bg-[var(--accent-2-soft)] transition-colors"
                                        aria-label="Upload photo"
                                    >
                                        {uploadingFor === meal.id ? <div className="w-3 h-3 border-2 border-[var(--line)] border-t-[var(--accent-2)] rounded-full animate-spin" /> : <Upload size={13} />}
                                    </button>
                                    {!meal.available && <span className="absolute top-2 left-2 text-label-xs px-2 py-0.5 rounded-full bg-white/90 text-[var(--danger)] font-semibold">Retired</span>}
                                </div>
                                <div className="p-3 space-y-2">
                                    <p className="text-body-s font-semibold text-[var(--text)] leading-tight line-clamp-1">{meal.name}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono-num text-[13px] text-[var(--text)]">{formatNaira(meal.price)}</span>
                                        <Badge variant="neutral" className="capitalize text-[10px]">{meal.mealWindow}</Badge>
                                    </div>
                                    <div className="flex gap-1.5 pt-1">
                                        <Button size="sm" variant="outline" className="flex-1 text-[11px] h-7" onClick={() => openEdit(meal)}>Edit</Button>
                                        {meal.available && (
                                            <button onClick={() => setRetireTarget(meal)} className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--danger-bg)] hover:text-[var(--danger)] transition-colors">
                                                <Trash2 size={13} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelected} />

            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? `Edit ${editing.name}` : 'Add meal'}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <Input label="Meal name" {...register('name')} error={errors.name?.message} />
                    <Input label="Description (optional)" {...register('description')} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Price (₦)" type="number" {...register('price')} error={errors.price?.message} />
                        <Select label="Meal window" options={[{ value: 'breakfast', label: 'Breakfast' }, { value: 'lunch', label: 'Lunch' }]} {...register('mealWindow')} />
                    </div>
                    <Select label="Spice level" options={[{ value: 'none', label: 'None' }, { value: 'mild', label: 'Mild' }, { value: 'medium', label: 'Medium' }, { value: 'hot', label: 'Hot' }]} {...register('spiceLevel')} />
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" variant="amber" loading={isSubmitting}>{editing ? 'Save changes' : 'Add meal'}</Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!retireTarget}
                onClose={() => setRetireTarget(null)}
                onConfirm={confirmRetire}
                title={`Retire "${retireTarget?.name}"?`}
                description="This meal won't appear on any menu going forward. Past orders referencing it are unaffected."
                confirmLabel="Retire meal"
                variant="danger"
            />
        </motion.div>
    );
}