'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonTable } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/Modal';
import { toast } from 'sonner';

type UserPortal = 'employee' | 'hr' | 'ops' | 'admin';
type UserStatus = 'active' | 'suspended';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    portal: UserPortal;
    company?: string;
    status: UserStatus;
    lastActive: string;
}

const MOCK: AdminUser[] = [
    { id: '1', name: 'Adaeze Okonkwo', email: 'adaeze@acme.com', portal: 'employee', company: 'Acme Corp', status: 'active', lastActive: '2025-06-09' },
    { id: '2', name: 'Chidi HR', email: 'chidi.hr@acme.com', portal: 'hr', company: 'Acme Corp', status: 'active', lastActive: '2025-06-09' },
    { id: '3', name: 'Ops Manager', email: 'ops@manna.ng', portal: 'ops', status: 'active', lastActive: '2025-06-09' },
    { id: '4', name: 'Suspended User', email: 'user@example.com', portal: 'employee', company: 'TechBridge Ltd', status: 'suspended', lastActive: '2025-04-01' },
];

const PORTAL_COLORS: Record<UserPortal, 'info' | 'success' | 'warning' | 'danger'> = {
    employee: 'info',
    hr: 'success',
    ops: 'warning',
    admin: 'danger',
};

export default function UsersPage() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [portalFilter, setPortalFilter] = useState<UserPortal | 'all'>('all');
    const [suspendId, setSuspendId] = useState<string | null>(null);

    useEffect(() => {
        setTimeout(() => {
            setUsers(MOCK);
            setLoading(false);
        }, 500);
    }, []);

    const filtered = users.filter((u) => {
        const matchSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
        const matchPortal = portalFilter === 'all' || u.portal === portalFilter;
        return matchSearch && matchPortal;
    });

    function handleSuspend() {
        if (!suspendId) return;
        setUsers((prev) =>
            prev.map((u) => (u.id === suspendId ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' } : u))
        );
        toast.success('User status updated');
        setSuspendId(null);
    }

    const targetUser = users.find((u) => u.id === suspendId);

    if (loading)
        return (
            <div className="p-6 md:p-8">
                <SkeletonTable rows={5} />
            </div>
        );

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="p-6 md:p-8 space-y-5 max-w-6xl"
        >
            <div>
                <h1 className="text-heading-m text-[var(--text)]">Users</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">
                    <span className="font-mono-num">{users.length}</span> users across all portals
                </p>
            </div>

            <div className="flex gap-3 flex-wrap items-center">
                <div className="relative max-w-xs flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users…"
                        className="w-full h-10 pl-9 pr-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]"
                    />
                </div>
                <div className="flex gap-1 bg-[var(--surface-soft)] p-1 rounded-[var(--radius-md)] border border-[var(--line)]">
                    {(['all', 'employee', 'hr', 'ops', 'admin'] as const).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPortalFilter(p)}
                            className={`px-3 py-1.5 rounded-[calc(var(--radius-md)-4px)] text-body-s font-medium capitalize transition-colors ${
                                portalFilter === p
                                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)]'
                                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    {filtered.length === 0 ? (
                        <EmptyState variant="empty" title="No users found" description="No users match your search." />
                    ) : (
                        <div className="overflow-x-auto thin-scroll">
                            <table className="w-full text-body-s">
                                <thead className="border-b border-[var(--line)]">
                                <tr>
                                    {['User', 'Portal', 'Company', 'Status', 'Last active', 'Actions'].map((h) => (
                                        <th key={h} className="p-4 text-left text-label-xs text-[var(--muted)]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--line)]">
                                {filtered.map((user) => (
                                    <tr key={user.id} className="hover:bg-[var(--surface-soft)] transition-colors">
                                        <td className="p-4">
                                            <p className="font-medium text-[var(--text)]">{user.name}</p>
                                            <p className="text-[var(--muted)]">{user.email}</p>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant={PORTAL_COLORS[user.portal]} className="capitalize">
                                                {user.portal}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-[var(--muted)]">{user.company ?? '—'}</td>
                                        <td className="p-4">
                                            <Badge variant={user.status === 'active' ? 'success' : 'danger'} dot>
                                                {user.status}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-[var(--muted)]">{formatDate(user.lastActive)}</td>
                                        <td className="p-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSuspendId(user.id)}
                                                className={user.status === 'active' ? 'text-[var(--danger)]' : 'text-[var(--success)]'}
                                            >
                                                {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ConfirmDialog
                isOpen={!!suspendId}
                onClose={() => setSuspendId(null)}
                onConfirm={handleSuspend}
                title={targetUser?.status === 'active' ? 'Suspend user?' : 'Reactivate user?'}
                description={
                    targetUser?.status === 'active'
                        ? `${targetUser?.name} will lose access to the platform immediately.`
                        : `${targetUser?.name} will regain access to their portal.`
                }
                confirmLabel={targetUser?.status === 'active' ? 'Suspend' : 'Reactivate'}
                variant={targetUser?.status === 'active' ? 'danger' : 'default'}
            />
        </motion.div>
    );
}
