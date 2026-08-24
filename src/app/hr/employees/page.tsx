'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Upload, Search, MoreHorizontal, X, Wallet, Layers } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { formatNaira, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';

interface Level {
    id: string;
    name: string;
}

interface Employee {
    id: string;
    name: string;
    email: string;
    department: string;
    status: 'active' | 'paused' | 'offboarded';
    allowance: number;
    allowanceOverrideLunch: number | null;
    allowanceOverrideBreakfast: number | null;
    levelId: string | null;
    levelName: string | null;
    lastOrder: string | null;
}

const MOCK: Employee[] = [
    { id: '1', name: 'Adaeze Okonkwo', email: 'adaeze@acme.com', department: 'Engineering', status: 'active', allowance: 3500, allowanceOverrideLunch: null, allowanceOverrideBreakfast: null, levelId: null, levelName: null, lastOrder: '2025-06-09' },
    { id: '2', name: 'Emeka Nwosu', email: 'emeka@acme.com', department: 'Product', status: 'active', allowance: 3500, allowanceOverrideLunch: null, allowanceOverrideBreakfast: null, levelId: null, levelName: null, lastOrder: '2025-06-08' },
    { id: '3', name: 'Ngozi Eze', email: 'ngozi@acme.com', department: 'Design', status: 'paused', allowance: 3500, allowanceOverrideLunch: 5000, allowanceOverrideBreakfast: null, levelId: null, levelName: null, lastOrder: '2025-05-30' },
    { id: '4', name: 'Chidi Obi', email: 'chidi@acme.com', department: 'Operations', status: 'active', allowance: 3500, allowanceOverrideLunch: null, allowanceOverrideBreakfast: null, levelId: null, levelName: null, lastOrder: null },
];

const addEmployeeSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email required'),
    department: z.string().min(1, 'Department is required'),
});
type AddEmployeeForm = z.infer<typeof addEmployeeSchema>;

const allowanceSchema = z.object({
    allowanceOverrideLunch: z.string().optional(),
    allowanceOverrideBreakfast: z.string().optional(),
});
type AllowanceForm = z.infer<typeof allowanceSchema>;

const STATUS_FILTER = ['all', 'active', 'paused', 'offboarded'] as const;

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [levels, setLevels] = useState<Level[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTER)[number]>('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [showCsv, setShowCsv] = useState(false);
    const [removeId, setRemoveId] = useState<string | null>(null);
    const [editingAllowanceFor, setEditingAllowanceFor] = useState<Employee | null>(null);
    // Tracks which row's level dropdown is mid-save, so we can show a
    // tiny inline spinner without blocking the whole table.
    const [savingLevelFor, setSavingLevelFor] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddEmployeeForm>({ resolver: zodResolver(addEmployeeSchema) });
    const allowanceForm = useForm<AllowanceForm>({ resolver: zodResolver(allowanceSchema) });

    useEffect(() => {
        setTimeout(() => { setEmployees(MOCK); setLoading(false); }, 600);

        // Real fetch — load the levels HR has created so they can be
        // assigned per employee below.
        fetch('/api/v1/hr/levels', { credentials: 'include' })
            .then((r) => r.json())
            .then((data) => setLevels((data.levels ?? []).map((l: any) => ({ id: l.id, name: l.name }))))
            .catch(() => {});
    }, []);

    const filtered = employees.filter((e) => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchSearch && matchStatus;
    });

    async function onAddEmployee(data: AddEmployeeForm) {
        await new Promise((r) => setTimeout(r, 800));
        const newEmp: Employee = { id: Date.now().toString(), name: data.name, email: data.email, department: data.department, status: 'active', allowance: 3500, allowanceOverrideLunch: null, allowanceOverrideBreakfast: null, levelId: null, levelName: null, lastOrder: null };
        setEmployees((prev) => [newEmp, ...prev]);
        reset();
        setShowAddPanel(false);
        toast.success(`${data.name} added successfully`);
    }

    // THIS is how you assign an employee to a staff level — pick one
    // from this dropdown right in the table. Wired to the real backend:
    // PATCH /api/v1/hr/employees/:id/level (built earlier, never had a
    // frontend control until now). Selecting "No level" clears it back
    // to the company default.
    async function onLevelChange(emp: Employee, levelId: string) {
        setSavingLevelFor(emp.id);
        try {
            const res = await fetch(`/api/v1/hr/employees/${emp.id}/level`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ levelId: levelId || null }),
            });
            if (!res.ok) throw new Error();
            const levelName = levels.find((l) => l.id === levelId)?.name ?? null;
            setEmployees((prev) => prev.map((e) => (e.id === emp.id ? { ...e, levelId: levelId || null, levelName } : e)));
            toast.success(levelId ? `${emp.name} assigned to ${levelName}` : `${emp.name} cleared to company default`);
        } catch {
            toast.error('Could not update level');
        } finally {
            setSavingLevelFor(null);
        }
    }

    function openAllowanceEdit(emp: Employee) {
        setEditingAllowanceFor(emp);
        allowanceForm.reset({
            allowanceOverrideLunch: emp.allowanceOverrideLunch != null ? String(emp.allowanceOverrideLunch) : '',
            allowanceOverrideBreakfast: emp.allowanceOverrideBreakfast != null ? String(emp.allowanceOverrideBreakfast) : '',
        });
    }

    async function onSaveAllowance(data: AllowanceForm) {
        if (!editingAllowanceFor) return;
        try {
            const res = await fetch(`/api/v1/hr/employees/${editingAllowanceFor.id}/allowance`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    allowanceOverrideLunch: data.allowanceOverrideLunch ? Number(data.allowanceOverrideLunch) : null,
                    allowanceOverrideBreakfast: data.allowanceOverrideBreakfast ? Number(data.allowanceOverrideBreakfast) : null,
                }),
            });
            if (!res.ok) throw new Error();
            setEmployees((prev) =>
                prev.map((e) =>
                    e.id === editingAllowanceFor.id
                        ? { ...e, allowanceOverrideLunch: data.allowanceOverrideLunch ? Number(data.allowanceOverrideLunch) : null, allowanceOverrideBreakfast: data.allowanceOverrideBreakfast ? Number(data.allowanceOverrideBreakfast) : null }
                        : e
                )
            );
            toast.success(`Allowance updated for ${editingAllowanceFor.name}`);
            setEditingAllowanceFor(null);
        } catch {
            toast.error('Could not update allowance');
        }
    }

    function toggleSelect(id: string) {
        setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
    }

    function handleBulkAction(action: 'activate' | 'pause' | 'remove') {
        if (action === 'remove') setEmployees((prev) => prev.filter((e) => !selected.has(e.id)));
        else setEmployees((prev) => prev.map((e) => (selected.has(e.id) ? { ...e, status: action === 'activate' ? 'active' : 'paused' } : e)));
        setSelected(new Set());
        toast.success(`${selected.size} employee(s) updated`);
    }

    function handleConfirmRemove() {
        if (!removeId) return;
        setEmployees((prev) => prev.filter((e) => e.id !== removeId));
        setRemoveId(null);
        toast.success('Employee removed');
    }

    async function uploadFile(file: File) {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch('/api/v1/hr/employees/bulk-upload', { method: 'POST', credentials: 'include', body: formData });
            const data = await res.json();
            if (!res.ok) { toast.error(data?.message ?? 'Upload failed'); return; }
            toast.success(`${data.summary.created} employee(s) added`);
            setShowCsv(false);
        } catch {
            toast.error('Could not reach the server');
        } finally {
            setUploading(false);
        }
    }

    if (loading) return <div className="space-y-4"><div className="h-8 w-48 bg-[var(--surface)] rounded animate-pulse" /><SkeletonTable rows={5} /></div>;

    return (
        <div className="flex gap-6">
            <div className="flex-1 min-w-0 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-heading-m text-[var(--text)]">Employees</h1>
                        <p className="text-body-s text-[var(--muted)]"><span className="font-mono-num">{employees.length}</span> total</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCsv(true)}><Upload size={14} className="mr-1.5" />Upload CSV/Excel</Button>
                        <Button variant="amber" size="sm" onClick={() => setShowAddPanel(true)}><UserPlus size={14} className="mr-1.5" />Add employee</Button>
                    </div>
                </div>

                {levels.length === 0 && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-[var(--accent-2-soft)] rounded-[var(--radius-lg)] text-[var(--accent-2-hover)] text-body-s">
                        <Layers size={16} className="shrink-0" />
                        You haven't created any staff levels yet — everyone uses the company default allowance. Create one on the
                        <a href="/hr/levels" className="underline font-medium">Staff Levels</a> page to start assigning them here.
                    </div>
                )}

                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees…" className="w-full h-10 pl-8 pr-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]" />
                    </div>
                    <div className="flex gap-1 bg-[var(--surface)] p-1 rounded-[var(--radius-md)] border border-[var(--line)]">
                        {STATUS_FILTER.map((s) => (
                            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-[calc(var(--radius-md)-4px)] text-body-s font-medium capitalize transition-colors ${statusFilter === s ? 'bg-[var(--brand-green)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {selected.size > 0 && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-center gap-3 p-3 text-white rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]" style={{ background: "linear-gradient(135deg, var(--brand-green), var(--brand-green-dark))" }}>
                            <span className="text-body-s font-medium font-mono-num">{selected.size} selected</span>
                            <div className="flex gap-2 ml-auto">
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/15" onClick={() => handleBulkAction('activate')}>Activate</Button>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/15" onClick={() => handleBulkAction('pause')}>Pause</Button>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/15" onClick={() => handleBulkAction('remove')}>Remove</Button>
                                <button onClick={() => setSelected(new Set())} className="p-1 hover:bg-white/15 rounded"><X size={16} /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <Card accent="var(--brand-green)" padding="none">
                    <CardContent className="p-0">
                        {filtered.length === 0 ? (
                            <EmptyState variant="no-employees" title="No employees found" description="Try adjusting your search or filters." />
                        ) : (
                            <div className="overflow-x-auto thin-scroll">
                                <table className="w-full text-body-s">
                                    <thead className="border-b border-[var(--line)]">
                                    <tr>
                                        <th className="p-3 w-10">
                                            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map((e) => e.id)) : new Set())} className="rounded border-[var(--line)] accent-[var(--brand-green)]" />
                                        </th>
                                        {['Name', 'Department', 'Level', 'Status', 'Allowance', 'Last order', ''].map((h) => (
                                            <th key={h} className="p-3 text-left text-label-xs text-[var(--muted)]">{h}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--line)]">
                                    {filtered.map((emp) => {
                                        const hasOverride = emp.allowanceOverrideLunch != null || emp.allowanceOverrideBreakfast != null;
                                        return (
                                            <tr key={emp.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                                <td className="p-3">
                                                    <input type="checkbox" checked={selected.has(emp.id)} onChange={() => toggleSelect(emp.id)} className="rounded border-[var(--line)] accent-[var(--brand-green)]" />
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-medium text-[var(--text)]">{emp.name}</p>
                                                    <p className="text-[var(--muted)]">{emp.email}</p>
                                                </td>
                                                <td className="p-3 text-[var(--muted)]">{emp.department}</td>
                                                <td className="p-3">
                                                    {/* THE ANSWER: assign a level right here. */}
                                                    <div className="relative inline-block">
                                                        <select
                                                            value={emp.levelId ?? ''}
                                                            onChange={(e) => onLevelChange(emp, e.target.value)}
                                                            disabled={savingLevelFor === emp.id}
                                                            className="h-8 pl-2 pr-7 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s appearance-none cursor-pointer hover:border-[var(--accent-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)] disabled:opacity-50"
                                                        >
                                                            <option value="">No level</option>
                                                            {levels.map((l) => (
                                                                <option key={l.id} value={l.id}>{l.name}</option>
                                                            ))}
                                                        </select>
                                                        {savingLevelFor === emp.id && (
                                                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 border-2 border-[var(--line)] border-t-[var(--accent-2)] rounded-full animate-spin" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={emp.status === 'active' ? 'success' : emp.status === 'paused' ? 'warning' : 'neutral'} dot>{emp.status}</Badge>
                                                </td>
                                                <td className="p-3">
                                                    <button onClick={() => openAllowanceEdit(emp)} className="flex items-center gap-1.5 text-[var(--text)] font-mono-num hover:text-[var(--accent-2-hover)] transition-colors">
                                                        {formatNaira(emp.allowanceOverrideLunch ?? emp.allowance)}
                                                        {hasOverride && <span className="text-label-xs px-1.5 py-0.5 rounded-full bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)] font-sans font-semibold">Custom</span>}
                                                    </button>
                                                </td>
                                                <td className="p-3 text-[var(--muted)]">{emp.lastOrder ? formatDate(emp.lastOrder) : '—'}</td>
                                                <td className="p-3">
                                                    <button onClick={() => setRemoveId(emp.id)} className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--danger)] transition-colors" aria-label="More options">
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AnimatePresence>
                {showAddPanel && (
                    <motion.div initial={{ x: 32, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 32, opacity: 0 }} transition={{ duration: 0.2 }} className="w-80 shrink-0">
                        <Card accent="var(--accent-2)">
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-heading-s text-[var(--text)]">Add employee</h2>
                                    <button onClick={() => setShowAddPanel(false)} className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--surface-soft)] text-[var(--muted)]"><X size={16} /></button>
                                </div>
                                <form onSubmit={handleSubmit(onAddEmployee)} className="space-y-3" noValidate>
                                    <Input label="Full name" {...register('name')} error={errors.name?.message} />
                                    <Input label="Email address" type="email" {...register('email')} error={errors.email?.message} />
                                    <Input label="Department" {...register('department')} error={errors.department?.message} />
                                    <Button type="submit" variant="amber" fullWidth loading={isSubmitting}>Add employee</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FIXED: shortened labels + hint text, same as the Levels
                modal — this is the other place the wrap-and-collide
                bug showed up. */}
            <Modal isOpen={!!editingAllowanceFor} onClose={() => setEditingAllowanceFor(null)} title={`Allowance — ${editingAllowanceFor?.name ?? ''}`}>
                <form onSubmit={allowanceForm.handleSubmit(onSaveAllowance)} className="space-y-4" noValidate>
                    <div className="flex items-start gap-2.5 p-3 rounded-[var(--radius-md)] bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)]">
                        <Wallet size={16} className="shrink-0 mt-0.5" />
                        <p className="text-body-s">Leave a field blank to use their level's default (or the company default, if they have no level) instead of a custom amount.</p>
                    </div>
                    <Input label="Lunch allowance (₦)" hint="Optional — overrides level/company default" type="number" {...allowanceForm.register('allowanceOverrideLunch')} />
                    <Input label="Breakfast allowance (₦)" hint="Optional — overrides level/company default" type="number" {...allowanceForm.register('allowanceOverrideBreakfast')} />
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" variant="amber" loading={allowanceForm.formState.isSubmitting}>Save</Button>
                        <Button type="button" variant="outline" onClick={() => setEditingAllowanceFor(null)}>Cancel</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={showCsv} onClose={() => setShowCsv(false)} title="Upload employees">
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) uploadFile(f); }}
                    className={`border-2 border-dashed rounded-[var(--radius-lg)] p-10 text-center transition-colors ${isDragging ? 'border-[var(--accent-2)] bg-[var(--accent-2-soft)]' : 'border-[var(--line)] hover:border-[var(--accent-2)]'}`}
                >
                    {uploading ? <div className="w-8 h-8 mx-auto mb-3 border-2 border-[var(--line)] border-t-[var(--accent-2)] rounded-full animate-spin" /> : <Upload size={24} className="mx-auto mb-3 text-[var(--accent-2)]" />}
                    <p className="text-body-m font-medium text-[var(--text)] mb-1">{uploading ? 'Uploading…' : 'Drop your CSV or Excel file here'}</p>
                    <p className="text-body-s text-[var(--muted)] mb-4">or click to browse</p>
                    <Button variant="outline" size="sm" disabled={uploading} onClick={() => fileInputRef.current?.click()}>Browse file</Button>
                    <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }} />
                </div>
                <p className="mt-3 text-body-s text-[var(--muted)]">
                    Columns: <code className="text-[var(--text)]">name, email, department, allowance_lunch, allowance_breakfast, phone</code>. Max 500 rows.
                </p>
            </Modal>

            <ConfirmDialog isOpen={!!removeId} onClose={() => setRemoveId(null)} onConfirm={handleConfirmRemove} title="Remove employee?" description="This will offboard the employee and stop their meal benefits." confirmLabel="Remove" variant="danger" />
        </div>
    );
}