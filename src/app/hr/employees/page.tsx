'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Upload, Search, MoreHorizontal, X } from 'lucide-react';
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

interface Employee {
    id: string;
    name: string;
    email: string;
    department: string;
    status: 'active' | 'paused' | 'offboarded';
    allowance: number;
    lastOrder: string | null;
}

const MOCK: Employee[] = [
    { id: '1', name: 'Adaeze Okonkwo', email: 'adaeze@acme.com', department: 'Engineering', status: 'active', allowance: 3500, lastOrder: '2025-06-09' },
    { id: '2', name: 'Emeka Nwosu', email: 'emeka@acme.com', department: 'Product', status: 'active', allowance: 3500, lastOrder: '2025-06-08' },
    { id: '3', name: 'Ngozi Eze', email: 'ngozi@acme.com', department: 'Design', status: 'paused', allowance: 3500, lastOrder: '2025-05-30' },
    { id: '4', name: 'Chidi Obi', email: 'chidi@acme.com', department: 'Operations', status: 'active', allowance: 3500, lastOrder: null },
];

const addEmployeeSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email required'),
    department: z.string().min(1, 'Department is required'),
});
type AddEmployeeForm = z.infer<typeof addEmployeeSchema>;

const STATUS_FILTER = ['all', 'active', 'paused', 'offboarded'] as const;

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTER)[number]>('all');
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [showCsv, setShowCsv] = useState(false);
    const [removeId, setRemoveId] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AddEmployeeForm>({
        resolver: zodResolver(addEmployeeSchema),
    });

    useEffect(() => {
        setTimeout(() => { setEmployees(MOCK); setLoading(false); }, 600);
    }, []);

    const filtered = employees.filter((e) => {
        const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
            e.email.toLowerCase().includes(search.toLowerCase()) ||
            e.department.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchSearch && matchStatus;
    });

    async function onAddEmployee(data: AddEmployeeForm) {
        await new Promise((r) => setTimeout(r, 800));
        const newEmp: Employee = {
            id: Date.now().toString(),
            name: data.name,
            email: data.email,
            department: data.department,
            status: 'active',
            allowance: 3500,
            lastOrder: null,
        };
        setEmployees((prev) => [newEmp, ...prev]);
        reset();
        setShowAddPanel(false);
        toast.success(`${data.name} added successfully`);
    }

    function toggleSelect(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    }

    function handleBulkAction(action: 'activate' | 'pause' | 'remove') {
        if (action === 'remove') {
            setEmployees((prev) => prev.filter((e) => !selected.has(e.id)));
        } else {
            const newStatus = action === 'activate' ? 'active' : 'paused';
            setEmployees((prev) =>
                prev.map((e) => selected.has(e.id) ? { ...e, status: newStatus } : e)
            );
        }
        setSelected(new Set());
        toast.success(`${selected.size} employee(s) updated`);
    }

    function handleConfirmRemove() {
        if (!removeId) return;
        setEmployees((prev) => prev.filter((e) => e.id !== removeId));
        setRemoveId(null);
        toast.success('Employee removed');
    }

    function handleFileDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) toast.info(`CSV upload: ${file.name} — API endpoint not yet available`);
    }

    if (loading) return (
        <div className="p-6 space-y-4">
            <div className="h-8 w-48 bg-[var(--surface-soft)] rounded animate-pulse" />
            <SkeletonTable rows={5} />
        </div>
    );

    return (
        <div className="p-6 flex gap-6">
            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-heading-s text-[var(--text)]">Employees</h1>
                        <p className="text-body-s text-[var(--muted)]">{employees.length} total</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCsv(true)}>
                            <Upload size={14} className="mr-1.5" />Upload CSV
                        </Button>
                        <Button size="sm" onClick={() => setShowAddPanel(true)}>
                            <UserPlus size={14} className="mr-1.5" />Add Employee
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px] max-w-xs">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search employees…"
                            className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-1">
                        {STATUS_FILTER.map((s) => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={`px-3 py-1.5 rounded-lg text-body-s font-medium capitalize transition-colors ${
                                    statusFilter === s
                                        ? 'bg-[var(--accent)] text-white'
                                        : 'bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--line)]'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Bulk action bar */}
                <AnimatePresence>
                    {selected.size > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="flex items-center gap-3 p-3 bg-[var(--accent)] text-white rounded-xl"
                        >
                            <span className="text-body-s font-medium">{selected.size} selected</span>
                            <div className="flex gap-2 ml-auto">
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => handleBulkAction('activate')}>Activate</Button>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20" onClick={() => handleBulkAction('pause')}>Pause</Button>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 text-red-200 hover:text-white" onClick={() => handleBulkAction('remove')}>Remove</Button>
                                <button onClick={() => setSelected(new Set())} className="p-1 hover:bg-white/20 rounded">
                                    <X size={16} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {filtered.length === 0 ? (
                            <EmptyState
                                variant="no-employees"
                                title="No employees found"
                                description="Try adjusting your search or filters."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-body-s">
                                    <thead className="border-b border-[var(--line)]">
                                    <tr>
                                        <th className="p-3 w-10">
                                            <input
                                                type="checkbox"
                                                checked={selected.size === filtered.length && filtered.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelected(new Set(filtered.map((e) => e.id)));
                                                    else setSelected(new Set());
                                                }}
                                                className="rounded border-[var(--line)]"
                                                aria-label="Select all"
                                            />
                                        </th>
                                        {['Name', 'Department', 'Status', 'Daily Allowance', 'Last Order', ''].map((h) => (
                                            <th key={h} className="p-3 text-left text-label-xs text-[var(--muted)] font-semibold">{h}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--line)]">
                                    {filtered.map((emp) => (
                                        <tr key={emp.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                            <td className="p-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selected.has(emp.id)}
                                                    onChange={() => toggleSelect(emp.id)}
                                                    className="rounded border-[var(--line)]"
                                                    aria-label={`Select ${emp.name}`}
                                                />
                                            </td>
                                            <td className="p-3">
                                                <p className="font-medium text-[var(--text)]">{emp.name}</p>
                                                <p className="text-[var(--muted)]">{emp.email}</p>
                                            </td>
                                            <td className="p-3 text-[var(--muted)]">{emp.department}</td>
                                            <td className="p-3">
                                                <Badge
                                                    variant={emp.status === 'active' ? 'success' : emp.status === 'paused' ? 'warning' : 'neutral'}
                                                    dot
                                                >
                                                    {emp.status}
                                                </Badge>
                                            </td>
                                            <td className="p-3 text-[var(--text)]">{formatNaira(emp.allowance)}</td>
                                            <td className="p-3 text-[var(--muted)]">
                                                {emp.lastOrder ? formatDate(emp.lastOrder) : '—'}
                                            </td>
                                            <td className="p-3">
                                                <button
                                                    onClick={() => setRemoveId(emp.id)}
                                                    className="p-1.5 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                                                    aria-label="More options"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add employee slide-in panel */}
            <AnimatePresence>
                {showAddPanel && (
                    <motion.div
                        initial={{ x: 32, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 32, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-80 shrink-0"
                    >
                        <Card>
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-heading-s text-[var(--text)]">Add Employee</h2>
                                    <button onClick={() => setShowAddPanel(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-soft)] text-[var(--muted)]">
                                        <X size={16} />
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit(onAddEmployee)} className="space-y-3" noValidate>
                                    <Input label="Full name" {...register('name')} error={errors.name?.message} />
                                    <Input label="Email address" type="email" {...register('email')} error={errors.email?.message} />
                                    <Input label="Department" {...register('department')} error={errors.department?.message} />
                                    <Button type="submit" fullWidth loading={isSubmitting}>Add Employee</Button>
                                </form>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* CSV upload modal */}
            <Modal isOpen={showCsv} onClose={() => setShowCsv(false)} title="Upload Employees CSV">
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleFileDrop}
                    className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                        isDragging ? 'border-[var(--accent)] bg-blue-50' : 'border-[var(--line)] hover:border-[var(--accent)]'
                    }`}
                >
                    <Upload size={24} className="mx-auto mb-3 text-[var(--muted)]" />
                    <p className="text-body-m font-medium text-[var(--text)] mb-1">Drop your CSV here</p>
                    <p className="text-body-s text-[var(--muted)] mb-4">or click to browse</p>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        Browse file
                    </Button>
                    <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) toast.info(`CSV upload: ${f.name} — backend endpoint not yet available`);
                    }} />
                </div>
                <p className="mt-3 text-body-s text-[var(--muted)]">
                    Expected columns: name, email, department. Max 500 rows.
                </p>
            </Modal>

            {/* Confirm remove */}
            <ConfirmDialog
                isOpen={!!removeId}
                onClose={() => setRemoveId(null)}
                onConfirm={handleConfirmRemove}
                title="Remove employee?"
                description="This will offboard the employee and stop their meal benefits."
                confirmLabel="Remove"
                variant="danger"
            />
        </div>
    );
}