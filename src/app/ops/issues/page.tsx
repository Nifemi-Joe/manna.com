'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

type IssueStatus = 'open' | 'in-progress' | 'resolved';
type IssueSeverity = 'low' | 'medium' | 'high';
type IssueType = 'late' | 'missing' | 'wrong' | 'quality' | 'other';

interface Issue {
    id: string;
    date: string;
    company: string;
    employee: string;
    type: IssueType;
    description: string;
    severity: IssueSeverity;
    status: IssueStatus;
    assignedTo?: string;
    creditApplied: boolean;
}

const logIssueSchema = z.object({
    company: z.string().min(1, 'Company required'),
    employee: z.string().min(1, 'Employee required'),
    type: z.enum(['late', 'missing', 'wrong', 'quality', 'other']),
    description: z.string().min(5, 'Describe the issue'),
    severity: z.enum(['low', 'medium', 'high']),
    creditApplied: z.boolean(),
});
type LogIssueForm = z.infer<typeof logIssueSchema>;

const MOCK_ISSUES: Issue[] = [
    { id: '1', date: '2025-06-09', company: 'Acme Corp', employee: 'Adaeze O.', type: 'late', description: 'Delivery arrived 45 mins late.', severity: 'medium', status: 'open', creditApplied: false },
    { id: '2', date: '2025-06-08', company: 'Acme Corp', employee: 'Emeka N.', type: 'wrong', description: 'Received jollof rice instead of fried rice.', severity: 'high', status: 'resolved', creditApplied: true },
    { id: '3', date: '2025-06-07', company: 'Acme Corp', employee: 'Ngozi E.', type: 'missing', description: 'Side of plantain not included.', severity: 'low', status: 'in-progress', creditApplied: false },
];

const STATUS_COLORS: Record<IssueStatus, 'success' | 'warning' | 'danger'> = {
    resolved: 'success',
    'in-progress': 'warning',
    open: 'danger',
};

// Warmer, more legible severity chips than the original gray-blue-red scale
const SEVERITY_COLORS: Record<IssueSeverity, string> = {
    low: 'bg-[var(--brand-green-tint)] text-[var(--brand-green)]',
    medium: 'bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)]',
    high: 'bg-[var(--accent-3-soft)] text-[var(--accent-3)]',
};

export default function IssuesPage() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);
    const [showLog, setShowLog] = useState(false);
    const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('all');

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<LogIssueForm>({
        resolver: zodResolver(logIssueSchema),
        defaultValues: { type: 'late', severity: 'medium', creditApplied: false },
    });

    useEffect(() => {
        setTimeout(() => { setIssues(MOCK_ISSUES); setLoading(false); }, 500);
    }, []);

    async function onLogIssue(data: LogIssueForm) {
        await new Promise((r) => setTimeout(r, 600));
        const newIssue: Issue = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            ...data,
            status: 'open',
        };
        setIssues((prev) => [newIssue, ...prev]);
        reset();
        setShowLog(false);
        toast.success('Issue logged successfully');
    }

    const filtered = issues.filter((i) => statusFilter === 'all' || i.status === statusFilter);

    if (loading) return (
        <div className="p-6">
            <SkeletonTable rows={4} />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-5"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">Issues</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">
                        <span className="font-mono-num">{issues.filter((i) => i.status === 'open').length}</span> open ·{' '}
                        <span className="font-mono-num">{issues.filter((i) => i.status === 'in-progress').length}</span> in progress
                    </p>
                </div>
                <Button variant="coral" size="sm" onClick={() => setShowLog(true)}>
                    <Plus size={14} className="mr-1.5" />Log issue
                </Button>
            </div>

            {/* Status filters */}
            <div className="flex gap-2 bg-[var(--surface)] p-1 rounded-[var(--radius-md)] border border-[var(--line)] w-fit">
                {(['all', 'open', 'in-progress', 'resolved'] as const).map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-[calc(var(--radius-md)-4px)] text-body-s font-medium capitalize transition-colors ${
                            statusFilter === s
                                ? 'bg-[var(--brand-green)] text-white'
                                : 'text-[var(--muted)] hover:text-[var(--text)]'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <Card accent="var(--accent-3)" padding="none">
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <EmptyState
                            variant="empty"
                            title="No issues found"
                            description="No issues match the current filter."
                        />
                    ) : (
                        <div className="overflow-x-auto thin-scroll">
                            <table className="w-full text-body-s">
                                <thead className="border-b border-[var(--line)]">
                                <tr>
                                    {['Date', 'Company', 'Employee', 'Type', 'Severity', 'Status', 'Credit', 'Actions'].map((h) => (
                                        <th key={h} className="p-3 text-left text-label-xs text-[var(--muted)] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--line)]">
                                {filtered.map((issue) => (
                                    <tr key={issue.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                        <td className="p-3 text-[var(--muted)] whitespace-nowrap">{formatDate(issue.date)}</td>
                                        <td className="p-3 text-[var(--text)]">{issue.company}</td>
                                        <td className="p-3 text-[var(--text)]">{issue.employee}</td>
                                        <td className="p-3">
                                            <span className="capitalize text-[var(--muted)]">{issue.type}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-label-xs font-medium capitalize ${SEVERITY_COLORS[issue.severity]}`}>
                                                {issue.severity}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <Badge variant={STATUS_COLORS[issue.status]} dot>
                                                {issue.status}
                                            </Badge>
                                        </td>
                                        <td className="p-3 text-center">
                                            {issue.creditApplied ? (
                                                <span className="text-[var(--success)] text-label-xs font-semibold">Applied</span>
                                            ) : '—'}
                                        </td>
                                        <td className="p-3">
                                            <Button variant="ghost" size="sm">Update</Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Log issue modal */}
            <Modal isOpen={showLog} onClose={() => setShowLog(false)} title="Log issue">
                <form onSubmit={handleSubmit(onLogIssue)} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Company" {...register('company')} error={errors.company?.message} />
                        <Input label="Employee name" {...register('employee')} error={errors.employee?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-body-s text-[var(--muted)] mb-1 block">Issue type</label>
                            <select
                                {...register('type')}
                                className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus:ring-2 focus:ring-[var(--accent-2)]"
                            >
                                <option value="late">Late delivery</option>
                                <option value="missing">Missing item</option>
                                <option value="wrong">Wrong meal</option>
                                <option value="quality">Quality issue</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-body-s text-[var(--muted)] mb-1 block">Severity</label>
                            <select
                                {...register('severity')}
                                className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus:ring-2 focus:ring-[var(--accent-2)]"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="text-body-s text-[var(--muted)] mb-1 block">Description</label>
                        <textarea
                            {...register('description')}
                            rows={3}
                            className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus:ring-2 focus:ring-[var(--accent-2)] resize-none"
                        />
                        {errors.description && (
                            <p className="text-body-s text-[var(--danger)] mt-1">{errors.description.message}</p>
                        )}
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" {...register('creditApplied')} className="rounded border-[var(--line)] accent-[var(--brand-green)]" />
                        <span className="text-body-s text-[var(--text)]">Apply credit to employee's account</span>
                    </label>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" variant="coral" loading={isSubmitting}>Log issue</Button>
                        <Button type="button" variant="outline" onClick={() => setShowLog(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}
