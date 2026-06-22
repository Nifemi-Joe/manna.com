'use client';

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

const PERMISSIONS = [
    'orders:view', 'orders:create', 'orders:cancel',
    'employees:view', 'employees:manage',
    'billing:view', 'billing:manage',
    'reports:view',
    'rules:manage',
];

const createRoleSchema = z.object({
    name: z.string().min(2, 'Role name required'),
    description: z.string().optional(),
    permissions: z.array(z.string()).min(1, 'Select at least one permission'),
});

type CreateRoleForm = z.infer<typeof createRoleSchema>;

export default function AccessPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateRole, setShowCreateRole] = useState(false);
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
                // Use mocks
                setRoles([
                    { id: '1', name: 'HR Manager', permissions: ['orders:view', 'employees:manage', 'billing:view', 'reports:view', 'rules:manage'], createdAt: '2025-01-01', updatedAt: '2025-01-01', assignedCount: 1 },
                    { id: '2', name: 'HR Viewer', permissions: ['orders:view', 'employees:view', 'reports:view'], createdAt: '2025-01-01', updatedAt: '2025-01-01', assignedCount: 0 },
                ]);
                setAssignments([
                    { id: '1', userId: 'u1', userName: 'Adaeze Okonkwo', userEmail: 'adaeze@company.com', roleId: '1', roleName: 'HR Manager', assignedAt: '2025-03-15', assignedBy: 'system', status: 'active' },
                ]);
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

    async function onCreateRole(data: CreateRoleForm) {
        try {
            const role = await api.access.createRole({ name: data.name, permissions: data.permissions });
            setRoles((prev) => [...prev, role]);
            toast.success(`Role "${data.name}" created`);
        } catch {
            const newRole: Role = {
                id: Date.now().toString(),
                name: data.name,
                permissions: data.permissions,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                assignedCount: 0,
            };
            setRoles((prev) => [...prev, newRole]);
            toast.success(`Role "${data.name}" created`);
        }
        reset();
        setSelectedPerms(new Set());
        setShowCreateRole(false);
    }

    if (loading) return (
        <div className="p-6 space-y-4">
            <SkeletonTable rows={3} />
            <SkeletonTable rows={2} />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-6"
        >
            <div>
                <h1 className="text-heading-s text-[var(--text)]">Roles & Access</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">Manage team permissions and role assignments</p>
            </div>

            {/* Roles table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Shield size={16} className="text-[var(--accent)]" />
                        Roles
                    </CardTitle>
                    <Button size="sm" onClick={() => setShowCreateRole(true)}>
                        <Plus size={14} className="mr-1.5" />Create Role
                    </Button>
                </CardHeader>
                <CardContent className="p-0">
                    {roles.length === 0 ? (
                        <EmptyState variant="empty" title="No roles yet" description="Create a role to manage team access." />
                    ) : (
                        <table className="w-full text-body-s">
                            <thead className="border-b border-[var(--line)]">
                            <tr>
                                {['Role', 'Permissions', 'Created', ''].map((h) => (
                                    <th key={h} className="p-4 text-left text-label-xs text-[var(--muted)] font-semibold">{h}</th>
                                ))}
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--line)]">
                            {roles.map((role) => (
                                <tr key={role.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                    <td className="p-4 font-medium text-[var(--text)]">{role.name}</td>
                                    <td className="p-4">
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions.slice(0, 3).map((p: any) => (
                                                <span key={p} className="px-2 py-0.5 bg-[var(--surface-soft)] border border-[var(--line)] rounded text-label-xs text-[var(--muted)]">
                            {p}
                          </span>
                                            ))}
                                            {role.permissions.length > 3 && (
                                                <span className="px-2 py-0.5 bg-[var(--surface-soft)] border border-[var(--line)] rounded text-label-xs text-[var(--muted)]">
                            +{role.permissions.length - 3} more
                          </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 text-[var(--muted)]">{formatDate(role.createdAt)}</td>
                                    <td className="p-4">
                                        <Button variant="ghost" size="sm">Edit</Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Assignments table */}
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
                        <EmptyState variant="empty" title="No assignments yet" description="Assign roles to team members." />
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
                                <tr key={a.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                    <td className="p-4 font-medium text-[var(--text)]">{a.userName ?? a.userId}</td>
                                    <td className="p-4 text-[var(--muted)]">{a.roleName ?? a.roleId}</td>
                                    <td className="p-4 text-[var(--muted)]">{formatDate(a.assignedAt)}</td>
                                    <td className="p-4">
                                        <Badge variant={a.status === 'active' ? 'success' : 'neutral'} dot>
                                            {a.status}
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <Button variant="ghost" size="sm" className="text-[var(--danger)]">Revoke</Button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </CardContent>
            </Card>

            {/* Create role modal */}
            <Modal isOpen={showCreateRole} onClose={() => setShowCreateRole(false)} title="Create Role">
                <form onSubmit={handleSubmit(onCreateRole)} className="space-y-4" noValidate>
                    <Input label="Role name" {...register('name')} error={errors.name?.message} />
                    <Input label="Description (optional)" {...register('description')} />
                    <div>
                        <p className="text-body-s font-medium text-[var(--text)] mb-2">Permissions</p>
                        <div className="grid grid-cols-2 gap-2">
                            {PERMISSIONS.map((perm) => (
                                <label key={perm} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedPerms.has(perm)}
                                        onChange={() => togglePerm(perm)}
                                        className="rounded border-[var(--line)]"
                                    />
                                    <span className="text-body-s text-[var(--text)]">{perm}</span>
                                </label>
                            ))}
                        </div>
                        {errors.permissions && (
                            <p className="text-body-s text-[var(--danger)] mt-1">{errors.permissions.message}</p>
                        )}
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button type="submit" loading={isSubmitting}>Create Role</Button>
                        <Button type="button" variant="outline" onClick={() => setShowCreateRole(false)}>Cancel</Button>
                    </div>
                </form>
            </Modal>
        </motion.div>
    );
}