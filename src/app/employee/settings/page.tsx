'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
    const { currentUser, logout } = useAuth();
    const [notifMeals, setNotifMeals] = useState(true);
    const [notifOrders, setNotifOrders] = useState(true);
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
                className="p-4 md:p-6 space-y-6 max-w-xl mx-auto"
            >
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">Settings</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">Manage your account preferences</p>
                </div>

                {/* Profile */}
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
                        <p className="text-body-s text-[var(--muted)]">
                            To update your email, contact your HR administrator.
                        </p>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card accent="var(--accent-2)">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell size={16} className="text-[var(--accent-2-hover)]" />
                            Notifications
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[
                            { label: 'Daily menu reminders', sub: "Get notified when today's menu is ready", value: notifMeals, set: setNotifMeals },
                            { label: 'Order updates', sub: 'Order status and delivery notifications', value: notifOrders, set: setNotifOrders },
                        ].map(({ label, sub, value, set }) => (
                            <div key={label} className="flex items-center justify-between">
                                <div>
                                    <p className="text-body-s font-medium text-[var(--text)]">{label}</p>
                                    <p className="text-body-s text-[var(--muted)]">{sub}</p>
                                </div>
                                <button
                                    role="switch"
                                    aria-checked={value}
                                    onClick={() => set(!value)}
                                    className="relative w-10 h-6 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]"
                                    style={{ background: value ? 'var(--accent-2)' : 'var(--line-strong)' }}
                                >
                                    <span
                                        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                                        style={{ transform: value ? 'translateX(1rem)' : 'translateX(0.125rem)' }}
                                    />
                                </button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Security */}
                <Card accent="var(--accent-3)">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield size={16} className="text-[var(--accent-3)]" />
                            Security
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-body-s text-[var(--muted)] mb-3">
                            Manna uses magic links — no password needed. Links expire after 15 minutes.
                        </p>
                        <Button variant="outline" size="sm">
                            Send new magic link
                        </Button>
                    </CardContent>
                </Card>

                <div className="flex items-center gap-3">
                    <Button variant="amber" onClick={handleSave} loading={saving}>
                        {saved ? 'Saved!' : 'Save changes'}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={logout}
                        className="text-[var(--danger)] hover:bg-[var(--danger-bg)] flex items-center gap-2"
                    >
                        <LogOut size={16} />
                        Sign out
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
