'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CalendarX, Plus, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Holiday {
    id: string;
    date: string;
    label: string;
}

function SaveIndicator({ saved }: { saved: boolean }) {
    if (!saved) return null;
    return (
        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1.5 text-body-s text-[var(--success)]">
            <Check size={14} /> Saved
        </motion.span>
    );
}

/**
 * Weekend/holiday enforcement, HR-side: which weekdays are "working
 * days" (a weekly pattern, defaults to Mon-Fri) plus specific one-off
 * dates the company is closed. Both are enforced server-side in
 * routes/employee.ts POST /orders — this page is just the control
 * surface. Wired to the real backend (previously this section was mock
 * local state only).
 */
export default function RulesPage() {
    const [eligibleDays, setEligibleDays] = useState<Set<string>>(new Set());
    const [savingDays, setSavingDays] = useState(false);
    const [savedDays, setSavedDays] = useState(false);
    const [loading, setLoading] = useState(true);

    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [newDate, setNewDate] = useState('');
    const [newLabel, setNewLabel] = useState('');
    const [addingHoliday, setAddingHoliday] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const [daysRes, holidaysRes] = await Promise.all([
                    fetch('/api/v1/hr/eligible-days', { credentials: 'include' }),
                    fetch('/api/v1/hr/holidays', { credentials: 'include' }),
                ]);
                const daysData = await daysRes.json();
                const holidaysData = await holidaysRes.json();
                setEligibleDays(new Set(daysData.eligibleDays ?? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']));
                setHolidays(holidaysData.holidays ?? []);
            } catch {
                toast.error('Could not load working-day settings');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    function toggleDay(day: string) {
        setEligibleDays((prev) => {
            const next = new Set(prev);
            if (next.has(day)) next.delete(day); else next.add(day);
            return next;
        });
    }

    async function saveDays() {
        if (eligibleDays.size === 0) {
            toast.error('At least one working day is required');
            return;
        }
        setSavingDays(true);
        try {
            const res = await fetch('/api/v1/hr/eligible-days', {
                method: 'PATCH',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eligibleDays: Array.from(eligibleDays) }),
            });
            if (!res.ok) throw new Error();
            toast.success('Working days saved');
            setSavedDays(true);
            setTimeout(() => setSavedDays(false), 2000);
        } catch {
            toast.error('Could not save working days');
        } finally {
            setSavingDays(false);
        }
    }

    async function addHoliday() {
        if (!newDate || !newLabel) {
            toast.error('Date and label are required');
            return;
        }
        setAddingHoliday(true);
        try {
            const res = await fetch('/api/v1/hr/holidays', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ date: newDate, label: newLabel }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data?.message ?? 'Could not add holiday'); return; }
            setHolidays((prev) => [...prev, data.holiday].sort((a, b) => a.date.localeCompare(b.date)));
            setNewDate('');
            setNewLabel('');
            toast.success('Holiday added — ordering will be closed that day');
        } catch {
            toast.error('Could not reach the server');
        } finally {
            setAddingHoliday(false);
        }
    }

    async function removeHoliday(id: string) {
        try {
            await fetch(`/api/v1/hr/holidays/${id}`, { method: 'DELETE', credentials: 'include' });
            setHolidays((prev) => prev.filter((h) => h.id !== id));
            toast.success('Holiday removed');
        } catch {
            toast.error('Could not remove holiday');
        }
    }

    if (loading) return <div className="p-6 max-w-2xl"><div className="h-40 bg-[var(--surface)] rounded-[var(--radius-lg)] animate-pulse" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="p-6 space-y-6 max-w-2xl">
            <div>
                <h1 className="text-heading-m text-[var(--text)]">Budget & Rules</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">Configure meal benefits and working days for your team</p>
            </div>

            <Card accent="var(--brand-green)">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar size={16} className="text-[var(--brand-green)]" />
                        Working days
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-body-s text-[var(--muted)]">
                        Employees can only place orders on these days — e.g. turn off Saturday/Sunday so nobody can order for a day nobody's in the office.
                    </p>
                    <div className="grid grid-cols-7 gap-1">
                        {DAYS.map((day) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={`py-2 rounded-lg text-label-xs font-semibold transition-colors ${
                                    eligibleDays.has(day) ? 'bg-[var(--brand-green)] text-white' : 'bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--line)]'
                                }`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button size="sm" variant="amber" onClick={saveDays} loading={savingDays}>Save working days</Button>
                        <SaveIndicator saved={savedDays} />
                    </div>
                </CardContent>
            </Card>

            <Card accent="var(--accent-3)">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarX size={16} className="text-[var(--accent-3)]" />
                        Company holidays
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-body-s text-[var(--muted)]">
                        Specific dates ordering is closed — public holidays, a company shutdown day — independent of the weekly pattern above.
                    </p>

                    <div className="flex gap-2 items-end flex-wrap">
                        <div className="flex-1 min-w-[140px]">
                            <Input label="Date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <Input label="Label (e.g. Independence Day)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
                        </div>
                        <Button variant="amber" onClick={addHoliday} loading={addingHoliday} className="mb-0.5">
                            <Plus size={14} className="mr-1" /> Add
                        </Button>
                    </div>

                    {holidays.length === 0 ? (
                        <p className="text-body-s text-[var(--muted)] text-center py-4">No upcoming holidays set.</p>
                    ) : (
                        <div className="divide-y divide-[var(--line)] border border-[var(--line)] rounded-[var(--radius-md)]">
                            {holidays.map((h) => (
                                <div key={h.id} className="flex items-center justify-between px-3 py-2.5">
                                    <div>
                                        <p className="text-body-s font-medium text-[var(--text)]">{h.label}</p>
                                        <p className="text-label-xs text-[var(--muted)]">{formatDate(h.date)}</p>
                                    </div>
                                    <button onClick={() => removeHoliday(h.id)} className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--danger-bg)] text-[var(--muted)] hover:text-[var(--danger)] transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
