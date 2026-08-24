'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NotificationPreferences } from './NotificationPreferences';

/**
 * UPDATED: the Notifications card now renders the real, wired
 * NotificationPreferences component (per-kind, per-channel toggles)
 * instead of the two hardcoded mock switches that existed before.
 */
export function AccountSettingsPage({ portalLabel }: { portalLabel: string }) {
    const { currentUser, logout } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    function handleSave() {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }, 500);
    }

    return (
        <div className="page-wash min-h-full">
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 space-y-6 max-w-xl mx-auto"
            >
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">Settings</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">{portalLabel} account preferences</p>
                </div>

                <Card accent="var(--brand-green)">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User size={16} className="text-[var(--brand-green)]" />
                            Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-heading-s font-semibold shrink-0"
                                style={{ background: "linear-gradient(135deg, var(--brand-green), var(--brand-green-dark))" }}
                            >
                                {currentUser?.name?.charAt(0) ?? '?'}
                            </div>
                            <div>
                                <p className="text-body-m font-medium text-[var(--text)]">{currentUser?.name ?? '—'}</p>
                                <p className="text-body-s text-[var(--muted)]">{currentUser?.email ?? '—'}</p>
                            </div>
                        </div>
                        <Input label="Display name" defaultValue={currentUser?.name ?? ''} />
                    </CardContent>
                </Card>

                <Card accent="var(--accent-2)">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell size={16} className="text-[var(--accent-2-hover)]" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <NotificationPreferences />
                    </CardContent>
                </Card>

                <Card accent="var(--accent-3)">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield size={16} className="text-[var(--accent-3)]" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-body-s text-[var(--muted)] mb-3">
                            Manna uses magic links and one-time codes — no password needed.
                        </p>
                        <Button variant="outline" size="sm">Send new sign-in link</Button>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-3">
                    <Button variant="amber" onClick={handleSave} loading={saving}>
                        {saved ? 'Saved!' : 'Save changes'}
                    </Button>
                    <Button variant="ghost" onClick={logout} className="text-[var(--danger)] hover:bg-[var(--danger-bg)] flex items-center gap-2">
                        <LogOut size={16} />
                        Sign out
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
