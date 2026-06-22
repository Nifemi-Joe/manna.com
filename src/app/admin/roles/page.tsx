'use client';

// System-wide RBAC management — mirrors /hr/access but covers all portals
// Re-uses same patterns, just with broader permission scope

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api, Role, RoleAssignment } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const ALL_PERMISSIONS = [
    // Orders
    'orders:view', 'orders:create', 'orders:cancel', 'orders:manage',
    // Employees
    'employees:view', 'employees:manage',
    // Billing
    'billing:view', 'billing:manage',
    // Reports
    'reports:view', 'reports:export',
    // Rules
    'rules:view', 'rules:manage',
    // Admin
    'companies:manage', 'users:manage', 'roles:manage',
    // Ops
    'deliveries:view', 'deliveries:manage', 'issues:manage',
    // Content
    'content:view', 'content:publish', 'content:manage',
    // System
    'system:health', 'system:admin',
];

const createRoleSchema = z.object({
    name: z.string().min(2, 'Role name required'),
    description: z.string().optional(),
    permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});
type CreateRoleForm = z.infer<typeof createRoleSchema>;

const PERM_GROUPS: Record<string, string[]> = {
    Orders: ['orders:view', 'orders:create', 'orders:cancel', 'orders:manage'],
    Employees: ['employees:view', 'employees:manage'],
    Billing: ['billing:view', 'billing:manage'],
    Reports: ['reports:view', 'reports:export'],
    Ops: ['deliveries:view', 'deliveries:manage', 'issues:manage'],
    Admin: ['companies:manage', 'users:manage', 'roles:manage', 'system:health', 'system:admin'],
    Content: ['content:view', 'content:publish', 'content:manage'],
};

export default function AdminRolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

    const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<CreateRoleForm>({
        resolver: zodResolver(createRoleSchema),
        defaultValues: { permissions: [] },
    });

    useEffect(() => {
        async function load() {
            try {
                const [r, a] = await Promise.all([api.access.listRoles(), api.access.listAssignments()]);
                setRoles(r);
                setAssignments(a);
            } catch {
                setRoles([
                    { id: '1', name: 'Super Admin', permissions: ALL_PERMISSIONS, createdAt: '2025-01-01', updatedAt: '2025-01-01', assignedCount: 0 },
                    { id: '2', name: 'Ops Lead', permissions: ['deliveries:view', 'deliveries:manage', 'issues:manage', 'orders:view'], createdAt: '2025-01-01', updatedAt: '2025-01-01', assignedCount: 0 },
                ]);
                setAssignments([]);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function togglePerm(perm: string) {
        setSelectedPerms((prev) => {
            const next = new Set(prev);
            if (next.has(perm)) next.delete(perm); else next.add(perm);
            setValue('permissions', Array.from(next));
            return next;
        });
    }

    function toggleGroup(group: string) {
        const perms = PERM_GROUPS[group];
        const allSelected = perms.every((p) => selectedPerms.has(p));
        setSelectedPerms((prev) => {
            const next = new Set(prev);
            if (allSelected) perms.forEach((p) => next.delete(p));
            else perms.forEach((p) => next.add(p));
            setValue('permissions', Array.from(next));
            return next;
        });
    }

    async function onCreateRole(data: CreateRoleForm) {
        try {
            const role = await api.access.createRole({ name: data.name, permissions: data.permissions });
            setRoles((prev) => [...prev, role]);
        } catch {
            const newRole: Role = { id: Date.now().toString(), name: data.name, permissions: data.permissions, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), assignedCount: 0 };
            setRoles((prev) => [...prev, newRole]);
        }
        toast.success(`Role "${data.name}" created`);
        reset(); setSelectedPerms(new Set()); setShowCreate(false);
    }

    if (loading) return <div className="p-6 space-y-4"><SkeletonTable rows={3} /></div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-6"
        >
            <div>
                <h1 className="text-heading-s text-[var(--text)]">Roles & Permissions</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">System-wide access control</p>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Shield size={16} className="text-[var(--accent)]" />
                        All Roles
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowCreate(true)}>
                        <Plus size={14} className="mr-1.5" />Create Role
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {roles.length === 0 ? (
                        <EmptyState variant="empty" title="No roles" description="Create your first role." />
                    ) : (
                        <table className="w-full text-body-s">
                            <thead className="border-b border-[var(--line)]">
                            <tr>
                                {['Role', 'Permissions', 'Assigned Users', 'Created', ''].map((h) => (
                                    <th key={h} className="p-4 text-left text-label-xs text-[var(--muted)] font-semibold">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--line)]">
                            {roles.map((role) => {
                                const assigned = assignments.filter((a) => a.roleId === role.id).length;
                                return (
                                    <tr key={role.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                        <td className="p-4 font-semibold text-[var(--text)]">{role.name}</td>
                                        <td className="p-4">
                                            <div className="flex flex-wrap gap-1 max-w-xs">
                                                {role.permissions.slice(0, 4).map((p) => (
                                                    <span key={p} className="px-1.5 py-0.5 bg-[var(--surface-soft)] border border-[var(--line)] rounded text-label-xs text-[var(--muted)]">{p}</span>
                                                ))}
                                                {role.permissions.length > 4 && (
                                                    <span className="px-1.5 py-0.5 bg-[var(--surface-soft)] border border-[var(--line)] rounded text-label-xs text-[var(--muted)]">+{role.permissions.length - 4}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-[var(--muted)]">{assigned}</td>
                                        <td className="p-4 text-[var(--muted)]">{formatDate(role.createdAt)}</td>
                                        <td className="p-4 flex gap-2">
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Assignments */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users size={16} className="text-[var(--accent)]" />
                        Role Assignments
                    </CardTitle>
                    <Button size="sm" variant="outline">Assign Role</Button>
                </CardHeader>
                <CardContent className="p-0">
                    {assignments.length === 0 ? (
                        <EmptyState variant="empty" title="No assignments" description="Assign roles to users above." />
                    ) : (
                        <table className="w-full text-body-s">
                            <thead className="border-b border-[var(--line)]">
                            <tr>
                                {['User', 'Role', 'Assigned', 'Status', ''].map((h) => (
                                    <th key={h} className="p-4 text-left text-label-xs text-[var(--muted)] font-semibold">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--line)]">
                            {assignments.map((a) => (
                                <tr key={a.id} className="hover:bg-[var(--surface-soft)]">
                                    <td className="p-4 font-medium text-[var(--text)]">{a.userName ?? a.userId}</td>
                                    <td className="p-4 text-[var(--muted)]">{a.roleName ?? a.roleId}</td>
                                    <td className="p-4 text-[var(--muted)]">{formatDate(a.assignedAt)}</td>
                                    <td className="p-4"><Badge variant={a.status === 'active' ? 'success' : 'neutral'} dot>{a.status}</Badge></td>
                                    <td className="p-4"><Button variant="ghost" size="sm" className="text-[var(--danger)]">Revoke</Button></td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Create role modal */}
            <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Role" size="lg">
                <form onSubmit={handleSubmit(onCreateRole)} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-3">
                        <Input label="Role name" {...register('name')} error={errors.name?.message} />
                        <Input label="Description (optional)" {...register('description')} />
                    </div>
                    <div>
                        <p className="text-body-s font-semibold text-[var(--text)] mb-3">Permissions</p>
                        <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                            {Object.entries(PERM_GROUPS).map(([group, perms]) => {
                                const allSelected = perms.every((p) => selectedPerms.has(p));
                                return (
                                    <div key={group}>
                                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                                            <input
                                                type="checkbox"
                                                checked={allSelected}
                                                onChange={() => toggleGroup(group)}
                                                className="rounded border-[var(--line)]"
                                            />
                                            <span className="text-body-s font-semibold text-[var(--text)]">{group}</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-1 ml-6">
                                            {perms.map((perm) => (
                                                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPerms.has(perm)}
                                                        onChange={() => togglePerm(perm)}
                                                        className="rounded border-[var(--line)]"
                                                    />
                                                    <span className="text-body-s text-[var(--muted)]">{perm}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.permissions && <p className="text-body-s text-[var(--danger)] mt-1">{errors.permissions.message}</p>}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" loading={isSubmitting}>Create Role</Button>
                        <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}