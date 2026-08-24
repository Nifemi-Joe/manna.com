'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Mail, User, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

interface Lead {
    id: string;
    companyName: string;
    contactName: string;
    email: string;
    teamSize: string;
    status: 'new' | 'contacted' | 'approved' | 'declined';
    notes?: string;
    approvedCompanyId?: string;
    createdAt: string;
    updatedAt: string;
}

const STATUS_CONFIG: Record<Lead['status'], { variant: 'success' | 'warning' | 'danger' | 'neutral'; icon: React.ReactNode }> = {
    new: { variant: 'warning', icon: <Clock size={11} /> },
    contacted: { variant: 'neutral', icon: <Mail size={11} /> },
    approved: { variant: 'success', icon: <CheckCircle2 size={11} /> },
    declined: { variant: 'danger', icon: <XCircle size={11} /> },
};

const approveSchema = z.object({
    plan: z.enum(['pilot', 'starter', 'growth', 'enterprise']),
    dailyAmountLunch: z.coerce.number().positive(),
    dailyAmountBreakfast: z.coerce.number().positive().optional().or(z.literal('')),
    address: z.string().min(3, 'Delivery address required'),
    city: z.string().min(2),
    hrName: z.string().min(2, "HR contact's name required"),
    hrEmail: z.string().email('Valid HR email required'),
});

// `dailyAmountLunch`/`dailyAmountBreakfast` use z.coerce, so the "input" shape
// (what the form fields hold, e.g. strings from number inputs) differs from the
// "output" shape (what comes out after Zod parses/coerces it). RHF needs both:
// - TFieldValues (1st generic)   -> input shape, used by register/defaultValues
// - TTransformedValues (3rd generic) -> output shape, used by the submit handler
type ApproveFormInput = z.input<typeof approveSchema>;
type ApproveFormOutput = z.output<typeof approveSchema>;

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<Lead['status'] | 'all'>('all');
    const [approvingLead, setApprovingLead] = useState<Lead | null>(null);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<
        ApproveFormInput,
        unknown,
        ApproveFormOutput
    >({
        resolver: zodResolver(approveSchema),
        defaultValues: { plan: 'pilot', dailyAmountLunch: 2500, city: 'Lagos' },
    });

    async function load() {
        setLoading(true);
        try {
            const res = await fetch(
                `/api/v1/admin/leads${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`,
                { credentials: 'include' }
            );
            const data = await res.json();
            setLeads(data.leads ?? []);
        } catch {
            toast.error('Could not load leads');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [statusFilter]);

    function openApprove(lead: Lead) {
        setApprovingLead(lead);
        reset({
            plan: 'pilot',
            dailyAmountLunch: 2500,
            dailyAmountBreakfast: undefined,
            address: '',
            city: 'Lagos',
            hrName: lead.contactName,
            hrEmail: lead.email,
        });
    }

    async function onApprove(data: ApproveFormOutput) {
        if (!approvingLead) return;
        try {
            const res = await fetch(`/api/v1/admin/leads/${approvingLead.id}/approve`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    dailyAmountBreakfast: data.dailyAmountBreakfast === '' ? undefined : data.dailyAmountBreakfast,
                }),
            });
            const result = await res.json();
            if (!res.ok) {
                toast.error(result?.message ?? 'Could not approve lead');
                return;
            }
            toast.success(result?.message ?? `${approvingLead.companyName} onboarded`);
            setApprovingLead(null);
            load();
        } catch {
            toast.error('Could not reach the server');
        }
    }

    async function updateStatus(lead: Lead, status: 'contacted' | 'declined') {
        try {
            await fetch(`/api/v1/admin/leads/${lead.id}`, {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            toast.success(`Marked as ${status}`);
            load();
        } catch {
            toast.error('Could not update lead');
        }
    }

    const filters: Array<{ key: Lead['status'] | 'all'; label: string }> = [
        { key: 'all', label: 'All' },
        { key: 'new', label: 'New' },
        { key: 'contacted', label: 'Contacted' },
        { key: 'approved', label: 'Approved' },
        { key: 'declined', label: 'Declined' },
    ];

    if (loading) return <div className="p-6"><SkeletonTable rows={5} /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6 space-y-5 max-w-5xl">
            <div>
                <h1 className="text-heading-m text-[var(--text)]">Pilot leads</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">Companies that requested a pilot from the landing page</p>
            </div>

            <div className="flex gap-1 bg-[var(--surface)] p-1 rounded-[var(--radius-md)] border border-[var(--line)] w-fit">
                {filters.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => setStatusFilter(key)}
                        className={`px-3 py-1.5 rounded-[calc(var(--radius-md)-4px)] text-body-s font-medium transition-colors ${
                            statusFilter === key ? 'bg-[var(--brand-green)] text-white' : 'text-[var(--muted)] hover:text-[var(--text)]'
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <Card accent="var(--accent-2)" padding="none">
                <CardContent className="p-0">
                    {leads.length === 0 ? (
                        <EmptyState variant="empty" title="No leads" description="Pilot requests from the landing page will show up here." />
                    ) : (
                        <div className="divide-y divide-[var(--line)]">
                            {leads.map((lead) => {
                                const cfg = STATUS_CONFIG[lead.status];
                                return (
                                    <div key={lead.id} className="p-4 flex items-center gap-4 hover:bg-[var(--surface-soft)] transition-colors">
                                        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--brand-green-tint)] text-[var(--brand-green)] flex items-center justify-center shrink-0">
                                            <Building2 size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-body-s font-semibold text-[var(--text)]">{lead.companyName}</p>
                                                <Badge variant={cfg.variant} className="flex items-center gap-1">{cfg.icon}{lead.status}</Badge>
                                            </div>
                                            <p className="text-body-s text-[var(--muted)] flex items-center gap-3 flex-wrap mt-0.5">
                                                <span className="flex items-center gap-1"><User size={11} />{lead.contactName}</span>
                                                <span className="flex items-center gap-1"><Mail size={11} />{lead.email}</span>
                                                <span className="flex items-center gap-1"><Users size={11} />{lead.teamSize}</span>
                                            </p>
                                        </div>
                                        <p className="text-label-xs text-[var(--muted)] shrink-0 hidden sm:block">{formatDate(lead.createdAt)}</p>
                                        <div className="flex gap-2 shrink-0">
                                            {lead.status === 'new' && (
                                                <Button size="sm" variant="ghost" onClick={() => updateStatus(lead, 'contacted')}>Mark contacted</Button>
                                            )}
                                            {lead.status !== 'approved' && lead.status !== 'declined' && (
                                                <>
                                                    <Button size="sm" variant="amber" onClick={() => openApprove(lead)}>Approve</Button>
                                                    <Button size="sm" variant="ghost" className="text-[var(--danger)]" onClick={() => updateStatus(lead, 'declined')}>Decline</Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={!!approvingLead}
                onClose={() => setApprovingLead(null)}
                title={`Onboard ${approvingLead?.companyName ?? ''}`}
                description="This creates the company, seeds its allowance rule, creates the HR account, and emails them a sign-in link."
                size="lg"
            >
                <form onSubmit={handleSubmit(onApprove)} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-body-s text-[var(--muted)] mb-1 block">Plan</label>
                            <select {...register('plan')} className="w-full px-3 py-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus:ring-2 focus:ring-[var(--accent-2)]">
                                <option value="pilot">Pilot</option>
                                <option value="starter">Starter</option>
                                <option value="growth">Growth</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>
                        <Input label="City" {...register('city')} error={errors.city?.message} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Daily lunch allowance (₦)" type="number" {...register('dailyAmountLunch')} error={errors.dailyAmountLunch?.message} />
                        <Input label="Daily breakfast allowance (₦, optional)" type="number" {...register('dailyAmountBreakfast')} />
                    </div>
                    <Input label="Delivery address" {...register('address')} error={errors.address?.message} />
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="HR contact name" {...register('hrName')} error={errors.hrName?.message} />
                        <Input label="HR sign-in email" type="email" {...register('hrEmail')} error={errors.hrEmail?.message} />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" variant="amber" loading={isSubmitting}>Onboard & send welcome email</Button>
                        <Button type="button" variant="outline" onClick={() => setApprovingLead(null)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}