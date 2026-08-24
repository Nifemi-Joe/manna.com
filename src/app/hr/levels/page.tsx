'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users2, Send, TrendingUp, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { formatNaira } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Level {
    id: string;
    name: string;
    dailyAmountLunch: number;
    dailyAmountBreakfast: number | null;
    canOrderForOthers: boolean;
    overspendLimitLunch: number | null;
    overspendLimitBreakfast: number | null;
    employeeCount: number;
}

const levelSchema = z.object({
    name: z.string().min(2, 'Name required'),
    dailyAmountLunch: z.coerce.number().positive('Required'),
    dailyAmountBreakfast: z.string().optional(),
    canOrderForOthers: z.boolean(),
    overspendLimitLunch: z.string().optional(),
    overspendLimitBreakfast: z.string().optional(),
});

// z.coerce.number() gives this schema two different shapes:
// - "input" shape:  what the raw form field holds before Zod parses it (e.g. unknown/string)
// - "output" shape: what you get back after Zod parses/coerces it (dailyAmountLunch: number)
// useForm needs the input shape for register/defaultValues, and the output shape
// for the submit handler — so we pass both as separate generics below.
type LevelFormInput = z.input<typeof levelSchema>;
type LevelFormOutput = z.output<typeof levelSchema>;

export default function LevelsPage() {
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<Level | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Level | null>(null);

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<
        LevelFormInput,
        unknown,
        LevelFormOutput
    >({
        resolver: zodResolver(levelSchema),
        defaultValues: { canOrderForOthers: false },
    });

    async function load() {
        setLoading(true);
        try {
            const res = await fetch('/api/v1/hr/levels', { credentials: 'include' });
            const data = await res.json();
            setLevels(data.levels ?? []);
        } catch {
            toast.error('Could not load levels');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    function openCreate() {
        setEditing(null);
        reset({ name: '', dailyAmountLunch: 3000, dailyAmountBreakfast: '', canOrderForOthers: false, overspendLimitLunch: '', overspendLimitBreakfast: '' });
        setShowForm(true);
    }

    function openEdit(level: Level) {
        setEditing(level);
        reset({
            name: level.name,
            dailyAmountLunch: level.dailyAmountLunch,
            dailyAmountBreakfast: level.dailyAmountBreakfast != null ? String(level.dailyAmountBreakfast) : '',
            canOrderForOthers: level.canOrderForOthers,
            overspendLimitLunch: level.overspendLimitLunch != null ? String(level.overspendLimitLunch) : '',
            overspendLimitBreakfast: level.overspendLimitBreakfast != null ? String(level.overspendLimitBreakfast) : '',
        });
        setShowForm(true);
    }

    async function onSubmit(data: LevelFormOutput) {
        const payload = {
            name: data.name,
            dailyAmountLunch: data.dailyAmountLunch,
            dailyAmountBreakfast: data.dailyAmountBreakfast ? Number(data.dailyAmountBreakfast) : null,
            canOrderForOthers: data.canOrderForOthers,
            overspendLimitLunch: data.overspendLimitLunch ? Number(data.overspendLimitLunch) : null,
            overspendLimitBreakfast: data.overspendLimitBreakfast ? Number(data.overspendLimitBreakfast) : null,
        };

        try {
            const res = await fetch(editing ? `/api/v1/hr/levels/${editing.id}` : '/api/v1/hr/levels', {
                method: editing ? 'PATCH' : 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            if (!res.ok) { toast.error(result?.message ?? 'Could not save level'); return; }
            toast.success(editing ? 'Level updated' : `"${data.name}" level created`);
            setShowForm(false);
            load();
        } catch {
            toast.error('Could not reach the server');
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        try {
            await fetch(`/api/v1/hr/levels/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' });
            toast.success(`"${deleteTarget.name}" removed — affected employees fall back to the company default`);
            setDeleteTarget(null);
            load();
        } catch {
            toast.error('Could not delete level');
        }
    }

    if (loading) return <div className="p-6"><SkeletonTable rows={3} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6 space-y-5 max-w-4xl">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">Staff levels</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1 max-w-lg">
                        Define tiers like "Executive" or "Junior Staff" with their own default allowance. Assign employees to a level
                        from the Employees page — an individual override still beats their level's default.
                    </p>
                </div>
                <Button variant="amber" size="sm" onClick={openCreate}><Plus size={14} className="mr-1.5" />Create level</Button>
            </div>

            {levels.length === 0 ? (
                <Card accent="var(--accent-2)"><CardContent>
                    <EmptyState variant="empty" title="No levels yet" description="Everyone currently uses the company default allowance from Budget & Rules. Create a level to give a group its own limit." />
                </CardContent></Card>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {levels.map((level) => (
                        <Card key={level.id} accent="var(--brand-green)" padding="none">
                            <CardContent className="p-5 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-heading-s text-[var(--text)]">{level.name}</h3>
                                        <p className="text-label-xs text-[var(--muted)] flex items-center gap-1 mt-0.5">
                                            <Users2 size={11} /> {level.employeeCount} employee{level.employeeCount === 1 ? '' : 's'}
                                        </p>
                                    </div>
                                    <button onClick={() => setDeleteTarget(level)} className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--danger-bg)] text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-soft)]">
                                        <p className="text-label-xs text-[var(--muted)]">Lunch</p>
                                        <p className="font-mono-num text-[16px] text-[var(--text)]">{formatNaira(level.dailyAmountLunch)}</p>
                                    </div>
                                    <div className="p-2.5 rounded-[var(--radius-md)] bg-[var(--surface-soft)]">
                                        <p className="text-label-xs text-[var(--muted)]">Breakfast</p>
                                        <p className="font-mono-num text-[16px] text-[var(--text)]">{level.dailyAmountBreakfast != null ? formatNaira(level.dailyAmountBreakfast) : 'Not covered'}</p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-1.5">
                                    {level.canOrderForOthers && (
                                        <span className="inline-flex items-center gap-1 text-label-xs px-2 py-1 rounded-full bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)]">
                                            <Send size={11} /> Can order for colleagues
                                        </span>
                                    )}
                                    {(level.overspendLimitLunch || level.overspendLimitBreakfast) && (
                                        <span className="inline-flex items-center gap-1 text-label-xs px-2 py-1 rounded-full bg-[var(--accent-3-soft)] text-[var(--accent-3)]">
                                            <TrendingUp size={11} />
                                            Overspend up to {formatNaira(Math.max(level.overspendLimitLunch ?? 0, level.overspendLimitBreakfast ?? 0))}
                                        </span>
                                    )}
                                </div>

                                <Button variant="outline" size="sm" fullWidth onClick={() => openEdit(level)}>Edit</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* FIXED: labels shortened, "(optional)" moved to hint text
                below the field instead of being crammed into the
                floating label itself — that's what was wrapping onto
                two lines and colliding with the input border. */}
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? `Edit ${editing.name}` : 'Create staff level'} size="lg">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    <Input label="Level name" hint="e.g. Executive, Senior Staff, Junior Staff" {...register('name')} error={errors.name?.message} />

                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Lunch allowance (₦)" type="number" {...register('dailyAmountLunch')} error={errors.dailyAmountLunch?.message} />
                        <Input label="Breakfast allowance (₦)" hint="Leave blank if not covered" type="number" {...register('dailyAmountBreakfast')} />
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer p-3 rounded-[var(--radius-md)] border border-[var(--line)] hover:border-[var(--accent-2)] transition-colors">
                        <input type="checkbox" {...register('canOrderForOthers')} className="mt-0.5 rounded border-[var(--line)] accent-[var(--brand-green)]" />
                        <div>
                            <p className="text-body-s font-medium text-[var(--text)]">Can order for colleagues</p>
                            <p className="text-body-s text-[var(--muted)]">Employees at this level can place an order for someone else, charged to their own allowance — e.g. covering a guest or a direct report.</p>
                        </div>
                    </label>

                    <div className="p-3 rounded-[var(--radius-md)] bg-[var(--accent-3-soft)] space-y-3">
                        <p className="text-body-s text-[var(--accent-3)] font-medium">Authorized overspend</p>
                        <p className="text-body-s text-[var(--muted)]">
                            If a meal costs more than this level's allowance, the company covers up to this much extra — instead of the employee paying the difference themselves.
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <Input label="Lunch overspend (₦)" hint="Optional" type="number" {...register('overspendLimitLunch')} />
                            <Input label="Breakfast overspend (₦)" hint="Optional" type="number" {...register('overspendLimitBreakfast')} />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button type="submit" variant="amber" loading={isSubmitting}>{editing ? 'Save changes' : 'Create level'}</Button>
                        <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title={`Delete "${deleteTarget?.name}"?`}
                description={`${deleteTarget?.employeeCount ?? 0} employee(s) on this level will fall back to the company default allowance. This can't be undone.`}
                confirmLabel="Delete level"
                variant="danger"
            />
        </motion.div>
    );
}