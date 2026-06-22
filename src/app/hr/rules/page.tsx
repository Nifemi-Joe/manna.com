'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Utensils, Calendar, TrendingUp, ShoppingBag, Check } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

const allowanceSchema = z.object({
    dailyAmount: z.coerce.number().min(100, 'Minimum ₦100').max(50000),
    monthlyCapEnabled: z.boolean(),
    monthlyCap: z.coerce.number().optional(),
});

const topUpSchema = z.object({
    allowTopUps: z.boolean(),
    maxTopUp: z.coerce.number().min(0).max(100000),
});

const orderLimitSchema = z.object({
    maxMealsPerDay: z.coerce.number().min(1).max(5),
    allowAddOns: z.boolean(),
});

type AllowanceForm = z.infer<typeof allowanceSchema>;
type TopUpForm = z.infer<typeof topUpSchema>;
type OrderLimitForm = z.infer<typeof orderLimitSchema>;

function SaveIndicator({ saved }: { saved: boolean }) {
    if (!saved) return null;
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-1.5 text-body-s text-[var(--success)]"
        >
            <Check size={14} />
            Saved
        </motion.span>
    );
}

export default function RulesPage() {
    const [savedSections, setSavedSections] = useState<Set<string>>(new Set());
    const [mealCoverage, setMealCoverage] = useState<Set<string>>(new Set(['Lunch']));
    const [eligibleDays, setEligibleDays] = useState<Set<string>>(
        new Set(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
    );

    function markSaved(section: string) {
        setSavedSections((prev) => new Set([...prev, section]));
        setTimeout(() => setSavedSections((prev) => {
            const next = new Set(prev); next.delete(section); return next;
        }), 2500);
    }

    const allowanceForm = useForm<AllowanceForm>({
        resolver: zodResolver(allowanceSchema) as any,
        defaultValues: { dailyAmount: 3500, monthlyCapEnabled: false, monthlyCap: 70000 },
    });

    const topUpForm = useForm<TopUpForm>({
        resolver: zodResolver(topUpSchema) as any,
        defaultValues: { allowTopUps: true, maxTopUp: 5000 },
    });

    const orderForm = useForm<OrderLimitForm>({
        resolver: zodResolver(orderLimitSchema) as any,
        defaultValues: { maxMealsPerDay: 1, allowAddOns: false },
    });

    async function saveAllowance(data: AllowanceForm) {
        await new Promise((r) => setTimeout(r, 500));
        toast.success('Allowance settings saved');
        markSaved('allowance');
    }

    async function saveMeals() {
        await new Promise((r) => setTimeout(r, 400));
        toast.success('Meal coverage saved');
        markSaved('meals');
    }

    async function saveDays() {
        await new Promise((r) => setTimeout(r, 400));
        toast.success('Eligible days saved');
        markSaved('days');
    }

    async function saveTopUp(data: TopUpForm) {
        await new Promise((r) => setTimeout(r, 500));
        toast.success('Top-up rules saved');
        markSaved('topup');
    }

    async function saveOrderLimits(data: OrderLimitForm) {
        await new Promise((r) => setTimeout(r, 500));
        toast.success('Order limits saved');
        markSaved('orders');
    }

    const watchMonthlyCapEnabled = allowanceForm.watch('monthlyCapEnabled');
    const watchAllowTopUps = topUpForm.watch('allowTopUps');

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-6 max-w-2xl"
        >
            <div>
                <h1 className="text-heading-s text-[var(--text)]">Budget & Rules</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">Configure meal benefits for your team</p>
            </div>

            {/* 1. Allowance */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign size={16} className="text-[var(--accent)]" />
                        Allowance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={allowanceForm.handleSubmit(saveAllowance)} className="space-y-4" noValidate>
                        <Input
                            label="Daily allowance per employee (₦)"
                            type="number"
                            {...allowanceForm.register('dailyAmount')}
                            error={allowanceForm.formState.errors.dailyAmount?.message}
                        />
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                {...allowanceForm.register('monthlyCapEnabled')}
                                className="rounded border-[var(--line)]"
                            />
                            <span className="text-body-s text-[var(--text)]">Enable monthly spending cap</span>
                        </label>
                        {watchMonthlyCapEnabled && (
                            <Input
                                label="Monthly cap (₦)"
                                type="number"
                                {...allowanceForm.register('monthlyCap')}
                            />
                        )}
                        <div className="flex items-center gap-3">
                            <Button type="submit" size="sm" loading={allowanceForm.formState.isSubmitting}>
                                Save allowance
                            </Button>
                            <SaveIndicator saved={savedSections.has('allowance')} />
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* 2. Meal coverage */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Utensils size={16} className="text-[var(--accent)]" />
                        Meal Coverage
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-body-s text-[var(--muted)]">Which meal types does the benefit cover?</p>
                    <div className="flex gap-3 flex-wrap">
                        {MEALS.map((meal) => (
                            <button
                                key={meal}
                                type="button"
                                onClick={() => setMealCoverage((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(meal)) next.delete(meal); else next.add(meal);
                                    return next;
                                })}
                                className={`px-4 py-2 rounded-xl border text-body-s font-medium transition-colors ${
                                    mealCoverage.has(meal)
                                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white'
                                        : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent)]'
                                }`}
                            >
                                {meal}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button size="sm" onClick={saveMeals}>Save coverage</Button>
                        <SaveIndicator saved={savedSections.has('meals')} />
                    </div>
                </CardContent>
            </Card>

            {/* 3. Eligible days */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar size={16} className="text-[var(--accent)]" />
                        Eligible Days
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-7 gap-1">
                        {DAYS.map((day) => (
                            <button
                                key={day}
                                type="button"
                                onClick={() => setEligibleDays((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(day)) next.delete(day); else next.add(day);
                                    return next;
                                })}
                                className={`py-2 rounded-lg text-label-xs font-semibold transition-colors ${
                                    eligibleDays.has(day)
                                        ? 'bg-[var(--accent)] text-white'
                                        : 'bg-[var(--surface-soft)] text-[var(--muted)] hover:bg-[var(--line)]'
                                }`}
                            >
                                {day.slice(0, 3)}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-3">
                        <Button size="sm" onClick={saveDays}>Save days</Button>
                        <SaveIndicator saved={savedSections.has('days')} />
                    </div>
                </CardContent>
            </Card>

            {/* 4. Top-up rules */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-[var(--accent)]" />
                        Top-up Rules
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={topUpForm.handleSubmit(saveTopUp)} className="space-y-4" noValidate>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                {...topUpForm.register('allowTopUps')}
                                className="rounded border-[var(--line)]"
                            />
                            <span className="text-body-s text-[var(--text)]">Allow employees to top up their allowance</span>
                        </label>
                        {watchAllowTopUps && (
                            <Input
                                label="Maximum top-up amount per order (₦)"
                                type="number"
                                {...topUpForm.register('maxTopUp')}
                                error={topUpForm.formState.errors.maxTopUp?.message}
                            />
                        )}
                        <div className="flex items-center gap-3">
                            <Button type="submit" size="sm" loading={topUpForm.formState.isSubmitting}>
                                Save top-up rules
                            </Button>
                            <SaveIndicator saved={savedSections.has('topup')} />
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* 5. Order limits */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-[var(--accent)]" />
                        Order Limits
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={orderForm.handleSubmit(saveOrderLimits)} className="space-y-4" noValidate>
                        <Input
                            label="Max meals per day per employee"
                            type="number"
                            {...orderForm.register('maxMealsPerDay')}
                            error={orderForm.formState.errors.maxMealsPerDay?.message}
                        />
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                {...orderForm.register('allowAddOns')}
                                className="rounded border-[var(--line)]"
                            />
                            <span className="text-body-s text-[var(--text)]">Allow meal add-ons (sides, drinks)</span>
                        </label>
                        <div className="flex items-center gap-3">
                            <Button type="submit" size="sm" loading={orderForm.formState.isSubmitting}>
                                Save order limits
                            </Button>
                            <SaveIndicator saved={savedSections.has('orders')} />
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}