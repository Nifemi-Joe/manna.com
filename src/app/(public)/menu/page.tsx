'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Leaf, AlertCircle, Filter, ArrowRight, Loader2 } from 'lucide-react';

interface Meal {
    id: string;
    name: string;
    description: string;
    price: number;
    spiceLevel: 'none' | 'mild' | 'medium' | 'hot';
    dietary: Array<{ id: string; label: string } | string>;
    allergens: string[];
    imageUrl?: string;
    mealWindow: 'breakfast' | 'lunch';
}

interface WeekDay {
    date: string;
    dayName: string;
    lunch: Meal[];
    breakfast: Meal[];
}

type DietaryFilter = 'all' | 'vegan' | 'halal' | 'spice-free' | 'gluten-free';

const BRAND_GRADIENTS = [
    'linear-gradient(135deg, var(--accent-2) 0%, #E8A23D 100%)',
    'linear-gradient(135deg, var(--brand-green) 0%, #2F6E58 100%)',
    'linear-gradient(135deg, var(--accent-3) 0%, #E8703F 100%)',
    'linear-gradient(135deg, #2F6E58 0%, var(--brand-green-dark) 100%)',
    'linear-gradient(135deg, #E8A23D 0%, var(--accent-3) 100%)',
    'linear-gradient(135deg, var(--brand-green) 0%, var(--accent-2) 100%)',
];

const TAG_LABELS: Record<string, string> = { vegan: 'Vegan', halal: 'Halal', 'spice-free': 'Spice-free', 'gluten-free': 'Gluten-free' };
const TAG_STYLES: Record<string, string> = {
    vegan: 'bg-[var(--brand-green-tint)] text-[var(--brand-green)]',
    halal: 'bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)]',
    'spice-free': 'bg-[var(--surface-soft)] text-[var(--muted)]',
    'gluten-free': 'bg-[var(--accent-3-soft)] text-[var(--accent-3)]',
};

function dietaryLabel(tag: { id: string; label: string } | string): string {
    return typeof tag === 'string' ? (TAG_LABELS[tag] ?? tag) : tag.label;
}
function dietaryKey(tag: { id: string; label: string } | string): string {
    return typeof tag === 'string' ? tag : tag.id;
}

function SpiceIndicator({ level }: { level: Meal['spiceLevel'] }) {
    const dots = level === 'hot' ? 3 : level === 'medium' ? 2 : level === 'mild' ? 1 : 0;
    if (dots === 0) return null;
    return (
        <div className="flex items-center gap-0.5" aria-label={`Spice level ${dots} of 3`}>
            {[1, 2, 3].map((i) => (
                <Flame key={i} className="w-3 h-3" style={{ color: i <= dots ? 'var(--accent-3)' : 'var(--line)' }} />
            ))}
        </div>
    );
}

function MealCard({ meal, gradient, visible }: { meal: Meal; gradient: string; visible: boolean }) {
    if (!visible) return null;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            whileHover={{ y: -4 }}
            className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow"
        >
            <div className="h-28 relative">
                {meal.imageUrl ? (
                    <Image src={meal.imageUrl} alt={meal.name} fill sizes="(max-width: 768px) 50vw, 320px" className="object-cover" />
                ) : (
                    <div className="absolute inset-0" style={{ background: gradient }}>
                        <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-90 drop-shadow" aria-hidden="true">🍽️</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" aria-hidden="true" />
                    </div>
                )}
                {meal.dietary.some((d) => dietaryKey(d) === 'vegan') && (
                    <div className="absolute top-2 right-2 bg-white text-[var(--brand-green)] rounded-full p-1 shadow-sm">
                        <Leaf className="w-3 h-3" />
                    </div>
                )}
                {meal.imageUrl && (
                    <span className="absolute bottom-2 left-2 text-label-xs px-2 py-0.5 rounded-full bg-white/90 text-[var(--brand-green)] font-semibold">
                        Actual photo
                    </span>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-body-s font-semibold text-[var(--text)] leading-snug">{meal.name}</h3>
                    <SpiceIndicator level={meal.spiceLevel} />
                </div>
                <p className="text-body-s text-[var(--muted)] line-clamp-2 mb-3">{meal.description || 'A Manna favorite.'}</p>
                <div className="flex flex-wrap gap-1">
                    {meal.dietary.map((tag) => (
                        <span key={dietaryKey(tag)} className={`text-label-xs px-2 py-0.5 rounded-full ${TAG_STYLES[dietaryKey(tag)] ?? 'bg-[var(--surface-soft)] text-[var(--muted)]'}`}>
                            {dietaryLabel(tag)}
                        </span>
                    ))}
                    {meal.allergens.length > 0 && (
                        <span className="text-label-xs px-2 py-0.5 rounded-full bg-[var(--danger-bg)] text-[var(--danger)] flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />{meal.allergens.join(', ')}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function MenuSamplePage() {
    const [days, setDays] = useState<WeekDay[]>([]);
    const [activeDate, setActiveDate] = useState<string | null>(null);
    const [filter, setFilter] = useState<DietaryFilter>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        fetch('/api/v1/public/menu/week')
            .then((r) => r.json())
            .then((data) => {
                setDays(data.days ?? []);
                if (data.days?.length > 0) setActiveDate(data.days[0].date);
            })
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const activeDay = days.find((d) => d.date === activeDate);
    const visible = (meal: Meal) => filter === 'all' || meal.dietary.some((d) => dietaryKey(d) === filter);

    // Snacks & drinks are drawn from the breakfast window — same
    // convention Ops uses across the app (see seed-full-menu.ts) —
    // deduped across all days since they're typically offered daily.
    const snacksAndDrinks = Array.from(
        new Map(days.flatMap((d) => d.breakfast).map((m) => [m.id, m])).values()
    );

    const filters: Array<{ key: DietaryFilter; label: string }> = [
        { key: 'all', label: 'All' },
        { key: 'vegan', label: 'Vegan' },
        { key: 'halal', label: 'Halal' },
        { key: 'spice-free', label: 'Spice-free' },
        { key: 'gluten-free', label: 'Gluten-free' },
    ];

    return (
        <div className="page-wash min-h-screen">
            <div
                className="text-white text-center py-2.5 text-body-s font-medium"
                style={{ background: "linear-gradient(90deg, var(--brand-green), var(--brand-green-dark))" }}
            >
                This is a live sample of our current menu — real weekly menus are available after your company signs up.
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <p className="text-label-xs text-[var(--accent-2-hover)] mb-2">This week's menu</p>
                    <h1 className="text-display-l text-[var(--text)] mb-3">Something new every day.</h1>
                    <p className="text-body-l text-[var(--muted)] max-w-xl mx-auto">
                        Fresh Nigerian and continental meals prepared daily. Menus rotate weekly based on season and availability.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex items-center justify-center py-24 gap-2 text-[var(--muted)]">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-body-s">Loading this week's menu…</span>
                    </div>
                ) : error || days.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="text-body-m text-[var(--muted)]">No menu is published right now — check back soon, or request a pilot to get your own weekly menu.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <div className="flex gap-1 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] p-1 flex-wrap">
                                {days.map((day) => {
                                    const active = activeDate === day.date;
                                    return (
                                        <button
                                            key={day.date}
                                            onClick={() => setActiveDate(day.date)}
                                            className="px-3 py-1.5 rounded-[var(--radius-md)] text-body-s font-medium transition-all"
                                            style={active ? { background: 'var(--brand-green)', color: 'white' } : { color: 'var(--muted)' }}
                                        >
                                            <span className="hidden sm:inline">{day.dayName}</span>
                                            <span className="sm:hidden">{day.dayName.slice(0, 3)}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Filter className="w-4 h-4 text-[var(--muted)]" />
                                {filters.map(({ key, label }) => {
                                    const active = filter === key;
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setFilter(key)}
                                            className="text-label-xs px-3 py-1.5 rounded-full border transition-all"
                                            style={active ? { background: 'var(--accent-2)', color: 'white', borderColor: 'var(--accent-2)' } : { background: 'var(--surface)', color: 'var(--muted)', borderColor: 'var(--line)' }}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeDate}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.18 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                            >
                                {(activeDay?.lunch ?? []).map((meal, i) => (
                                    <MealCard key={meal.id} meal={meal} gradient={BRAND_GRADIENTS[i % BRAND_GRADIENTS.length]} visible={visible(meal)} />
                                ))}
                            </motion.div>
                        </AnimatePresence>

                        {snacksAndDrinks.length > 0 && (
                            <div className="mt-16">
                                <p className="text-label-xs text-[var(--accent-2-hover)] mb-2">Also available every day</p>
                                <h2 className="text-heading-m text-[var(--text)] mb-6">Snacks & drinks</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {snacksAndDrinks.map((item, i) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            whileHover={{ y: -4 }}
                                            className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow"
                                        >
                                            <div className="relative h-36">
                                                {item.imageUrl ? (
                                                    <Image src={item.imageUrl} alt={item.name} fill sizes="(max-width: 768px) 100vw, 340px" className="object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0" style={{ background: BRAND_GRADIENTS[i % BRAND_GRADIENTS.length] }}>
                                                        <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-90" aria-hidden="true">🍽️</span>
                                                    </div>
                                                )}
                                                <span className="absolute top-2 right-2 text-label-xs px-2 py-0.5 rounded-full bg-white/90 text-[var(--accent-2-hover)] font-semibold">
                                                    ₦{item.price.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="p-4">
                                                <h3 className="text-body-s font-semibold text-[var(--text)] mb-1">{item.name}</h3>
                                                <p className="text-body-s text-[var(--muted)]">{item.description || 'A Manna favorite.'}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative mt-16 rounded-[var(--radius-xl)] p-8 text-center text-white overflow-hidden"
                    style={{ background: "linear-gradient(135deg, var(--brand-green), var(--brand-green-dark))" }}
                >
                    <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-[var(--accent-2)]/15 blur-2xl" aria-hidden="true" />
                    <h2 className="text-heading-m mb-2 relative">Want this for your team?</h2>
                    <p className="text-body-m text-white/70 mb-6 relative max-w-md mx-auto">
                        Get fresh daily meals delivered to your office. Menus customised by your team's preferences.
                    </p>
                    <a
                        href="/#pilot-form"
                        className="relative inline-flex items-center gap-2 bg-white text-[var(--brand-green)] font-semibold px-6 py-3 rounded-[var(--radius-md)] hover:bg-[var(--surface-soft)] transition-colors text-body-s"
                    >
                        Request a pilot <ArrowRight size={15} />
                    </a>
                </motion.div>
            </div>
        </div>
    );
}