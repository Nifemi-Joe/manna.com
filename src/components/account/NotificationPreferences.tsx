'use client';

import { useEffect, useState } from 'react';
import { Bell, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface Preference {
    kind: string;
    label: string;
    emailEnabled: boolean;
    inAppEnabled: boolean;
}

/**
 * "Users and HR should be able to select types of notification they
 * want" — this is that control surface. Drop it into any settings page
 * (already wired into AccountSettingsPage and the employee settings
 * page below); it automatically shows only the notification kinds
 * relevant to whichever portal the signed-in user is in, per
 * NOTIFICATION_KIND_META on the backend.
 */
export function NotificationPreferences() {
    const [preferences, setPreferences] = useState<Preference[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/v1/notification-preferences', { credentials: 'include' })
            .then((r) => r.json())
            .then((data) => setPreferences(data.preferences ?? []))
            .catch(() => toast.error('Could not load notification preferences'))
            .finally(() => setLoading(false));
    }, []);

    function toggle(kind: string, channel: 'emailEnabled' | 'inAppEnabled') {
        setPreferences((prev) => prev.map((p) => (p.kind === kind ? { ...p, [channel]: !p[channel] } : p)));
    }

    async function save() {
        setSaving(true);
        try {
            const res = await fetch('/api/v1/notification-preferences', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preferences: preferences.map((p) => ({ kind: p.kind, emailEnabled: p.emailEnabled, inAppEnabled: p.inAppEnabled })) }),
            });
            if (!res.ok) throw new Error();
            toast.success('Notification preferences saved');
        } catch {
            toast.error('Could not save preferences');
        } finally {
            setSaving(false);
        }
    }

    if (loading) return <div className="h-32 bg-[var(--surface-soft)] rounded-[var(--radius-md)] animate-pulse" />;
    if (preferences.length === 0) return null;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-center text-label-xs text-[var(--muted)] px-1">
                <span />
                <span className="flex items-center gap-1 justify-center w-14"><Bell size={12} /> In-app</span>
                <span className="flex items-center gap-1 justify-center w-14"><Mail size={12} /> Email</span>
            </div>
            {preferences.map((p) => (
                <div key={p.kind} className="grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                    <p className="text-body-s text-[var(--text)]">{p.label}</p>
                    <ToggleSwitch checked={p.inAppEnabled} onChange={() => toggle(p.kind, 'inAppEnabled')} />
                    <ToggleSwitch checked={p.emailEnabled} onChange={() => toggle(p.kind, 'emailEnabled')} />
                </div>
            ))}
            <button
                onClick={save}
                disabled={saving}
                className="text-body-s font-medium px-4 py-2 rounded-[var(--radius-md)] text-white disabled:opacity-60"
                style={{ background: 'var(--accent-2)' }}
            >
                {saving ? 'Saving…' : 'Save notification preferences'}
            </button>
        </div>
    );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
    return (
        <div className="w-14 flex justify-center">
            <button
                role="switch"
                aria-checked={checked}
                onClick={onChange}
                className="relative w-9 h-5 rounded-full transition-colors"
                style={{ background: checked ? 'var(--accent-2)' : 'var(--line-strong)' }}
            >
                <span
                    className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ transform: checked ? 'translateX(1.1rem)' : 'translateX(0.125rem)' }}
                />
            </button>
        </div>
    );
}
