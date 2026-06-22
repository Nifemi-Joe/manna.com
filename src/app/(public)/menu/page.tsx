'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Leaf, AlertCircle, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
type Day = typeof DAYS[number];

interface Meal {
    id: string;
    name: string;
    description: string;
    spice: 0 | 1 | 2 | 3;
    tags: Array<'vegan' | 'halal' | 'spice-free' | 'gluten-free'>;
    allergens: string[];
    gradient: string;
}

type DietaryFilter = 'all' | 'vegan' | 'halal' | 'spice-free' | 'gluten-free';

const SAMPLE_MENU: Record<Day, Meal[]> = {
    Monday: [
        { id: 'm1', name: 'Jollof Rice & Chicken', description: 'Smoky party-style jollof with grilled chicken thigh, plantain, and coleslaw.', spice: 2, tags: ['halal'], allergens: [], gradient: 'from-orange-400 to-red-500' },
        { id: 'm2', name: 'Egusi Soup & Pounded Yam', description: 'Rich melon seed soup with assorted meats and stock fish.', spice: 1, tags: ['halal'], allergens: ['shellfish'], gradient: 'from-yellow-500 to-orange-400' },
        { id: 'm3', name: 'Moi Moi & Ogi', description: 'Steamed bean pudding with golden corn porridge — a light, protein-rich combo.', spice: 0, tags: ['vegan', 'halal', 'spice-free'], allergens: [], gradient: 'from-amber-300 to-yellow-400' },
        { id: 'm4', name: 'Ofada Rice & Ayamase', description: 'Local unpolished rice with spicy green pepper sauce and assorted meats.', spice: 3, tags: ['halal'], allergens: [], gradient: 'from-green-600 to-emerald-500' },
        { id: 'm5', name: 'Pasta Bolognese', description: 'Penne pasta in a slow-cooked beef tomato sauce with parmesan.', spice: 0, tags: ['spice-free'], allergens: ['gluten', 'dairy'], gradient: 'from-red-400 to-rose-500' },
        { id: 'm6', name: 'Grilled Tilapia & Chips', description: 'Whole tilapia seasoned with peppers and herbs, served with seasoned fries.', spice: 1, tags: ['halal', 'gluten-free'], allergens: ['fish'], gradient: 'from-cyan-400 to-blue-500' },
    ],
    Tuesday: [
        { id: 't1', name: 'Pepper Soup & Agidi', description: 'Spiced catfish pepper soup with chilled corn meal — a Lagosian classic.', spice: 3, tags: ['halal', 'gluten-free'], allergens: ['fish'], gradient: 'from-red-500 to-orange-600' },
        { id: 't2', name: 'Fried Rice & Turkey', description: 'Nigerian-style fried rice loaded with vegetables, served with turkey.', spice: 1, tags: ['halal'], allergens: [], gradient: 'from-lime-400 to-green-500' },
        { id: 't3', name: 'Plantain & Egg Sauce', description: 'Sweet ripe plantain with a savory tomato-egg stir sauce.', spice: 1, tags: ['vegan', 'halal', 'gluten-free'], allergens: ['egg'], gradient: 'from-yellow-400 to-amber-500' },
        { id: 't4', name: 'Ofe Onugbu & Fufu', description: 'Bitter leaf soup with stockfish and goat meat, served with cassava fufu.', spice: 2, tags: ['halal'], allergens: [], gradient: 'from-emerald-600 to-teal-500' },
        { id: 't5', name: 'Chicken Shawarma Wrap', description: 'Juicy grilled chicken with garlic sauce, pickled vegetables in a flour wrap.', spice: 1, tags: ['halal'], allergens: ['gluten'], gradient: 'from-amber-400 to-orange-500' },
        { id: 't6', name: 'Vegetable Stir Fry & Rice', description: 'Seasonal vegetables tossed in soy sauce with steamed white rice.', spice: 0, tags: ['vegan', 'spice-free'], allergens: ['soy', 'gluten'], gradient: 'from-green-400 to-emerald-400' },
    ],
    Wednesday: [
        { id: 'w1', name: 'Banga Soup & Starch', description: 'Palm-nut soup with periwinkle and dried fish, served with Delta starch.', spice: 1, tags: ['halal'], allergens: ['shellfish', 'fish'], gradient: 'from-orange-500 to-amber-600' },
        { id: 'w2', name: 'Beans & Plantain', description: 'Ewa agoyin with soft boiled beans and sweet fried plantain.', spice: 2, tags: ['vegan', 'halal', 'gluten-free'], allergens: [], gradient: 'from-brown-400 to-amber-500' },
        { id: 'w3', name: 'Grilled Chicken & Salad', description: 'Herb-marinated grilled chicken breast with garden salad and vinaigrette.', spice: 0, tags: ['halal', 'gluten-free', 'spice-free'], allergens: [], gradient: 'from-green-300 to-teal-400' },
        { id: 'w4', name: 'Ogbono Soup & Semolina', description: 'Draw soup with bush meat and smoked catfish, served with semolina.', spice: 2, tags: ['halal'], allergens: ['fish'], gradient: 'from-amber-600 to-orange-700' },
        { id: 'w5', name: 'Chicken Peppersoup', description: 'Light but fiery chicken peppersoup with scent leaves — no accompaniment.', spice: 3, tags: ['halal', 'gluten-free'], allergens: [], gradient: 'from-red-400 to-orange-500' },
        { id: 'w6', name: 'Akara & Custard', description: 'Crispy bean cakes served with smooth, sweetened vanilla custard.', spice: 0, tags: ['vegan', 'spice-free'], allergens: ['egg'], gradient: 'from-yellow-300 to-amber-400' },
    ],
    Thursday: [
        { id: 'th1', name: 'Seafood Okra', description: 'Chunky okra draw soup with crab, prawns, and periwinkle.', spice: 2, tags: ['halal', 'gluten-free'], allergens: ['shellfish'], gradient: 'from-green-500 to-teal-600' },
        { id: 'th2', name: 'Rice & Stew', description: 'Plain white rice with a rich, meaty tomato stew — the undisputed classic.', spice: 1, tags: ['halal'], allergens: [], gradient: 'from-red-400 to-orange-400' },
        { id: 'th3', name: 'Noodles & Eggs', description: 'Indomie stir-fried with assorted vegetables, eggs, and chicken.', spice: 2, tags: ['halal'], allergens: ['gluten', 'egg'], gradient: 'from-yellow-400 to-orange-400' },
        { id: 'th4', name: 'Efo Riro & Eba', description: 'Yoruba spinach stew with assorted meats and locust beans, served with garri.', spice: 2, tags: ['halal'], allergens: [], gradient: 'from-green-600 to-lime-500' },
        { id: 'th5', name: 'Burger & Fries', description: 'Grilled beef patty with lettuce, tomato, pickles, and seasoned fries.', spice: 0, tags: ['halal', 'spice-free'], allergens: ['gluten', 'dairy'], gradient: 'from-amber-500 to-yellow-500' },
        { id: 'th6', name: 'Tofu Stir Fry', description: 'Pan-fried tofu with bok choy, mushrooms, and ginger soy sauce.', spice: 1, tags: ['vegan', 'gluten-free'], allergens: ['soy'], gradient: 'from-teal-400 to-cyan-500' },
    ],
    Friday: [
        { id: 'f1', name: 'Suya Platter', description: 'Skewered grilled beef suya with onions, tomatoes, and yaji spice blend.', spice: 3, tags: ['halal', 'gluten-free'], allergens: ['groundnut'], gradient: 'from-red-600 to-orange-600' },
        { id: 'f2', name: 'Pounded Yam & Oha Soup', description: 'Silky pounded yam with Igbo oha leaf soup and cocoyam thickener.', spice: 1, tags: ['halal', 'gluten-free'], allergens: [], gradient: 'from-green-500 to-emerald-600' },
        { id: 'f3', name: 'Coconut Rice & Chicken', description: 'Fragrant long grain rice cooked in coconut milk with tender chicken.', spice: 0, tags: ['halal', 'gluten-free', 'spice-free'], allergens: [], gradient: 'from-yellow-200 to-amber-300' },
        { id: 'f4', name: 'Abacha & Ugba', description: 'African salad with palm oil, ugba, garden eggs, and ukpaka.', spice: 2, tags: ['vegan', 'halal', 'gluten-free'], allergens: [], gradient: 'from-orange-400 to-amber-500' },
        { id: 'f5', name: 'Peppered Snail', description: 'Fried snail in a rich pepper sauce — a Friday treat.', spice: 2, tags: ['halal', 'gluten-free'], allergens: [], gradient: 'from-stone-500 to-gray-600' },
        { id: 'f6', name: 'Veggie Jollof & Plantain', description: 'Full-flavour vegetable jollof rice with caramelised plantain and coleslaw.', spice: 1, tags: ['vegan', 'halal'], allergens: [], gradient: 'from-orange-400 to-red-400' },
    ],
};

const TAG_LABELS: Record<string, string> = {
    vegan: 'Vegan',
    halal: 'Halal',
    'spice-free': 'Spice-free',
    'gluten-free': 'Gluten-free',
};

function SpiceIndicator({ level }: { level: 0 | 1 | 2 | 3 }) {
    return (
        <div className="flex items-center gap-0.5" aria-label={`Spice level ${level} of 3`}>
            {[1, 2, 3].map((i) => (
                <Flame
                    key={i}
                    className={`w-3 h-3 ${i <= level ? 'text-orange-500' : 'text-[var(--line)]'}`}
                />
            ))}
        </div>
    );
}

function MealCard({ meal, visible }: { meal: Meal; visible: boolean }) {
    if (!visible) return null;
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[var(--surface)] rounded-xl border border-[var(--line)] overflow-hidden hover:shadow-md transition-shadow"
        >
            <div className={`h-28 bg-gradient-to-br ${meal.gradient} relative`}>
                {meal.tags.includes('vegan') && (
                    <div className="absolute top-2 right-2 bg-[var(--accent-2)] text-white rounded-full p-1">
                        <Leaf className="w-3 h-3" />
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="body-s font-semibold text-[var(--text)] leading-snug">{meal.name}</h3>
                    <SpiceIndicator level={meal.spice} />
                </div>
                <p className="body-s text-[var(--muted)] line-clamp-2 mb-3">{meal.description}</p>
                <div className="flex flex-wrap gap-1">
                    {meal.tags.map((tag) => (
                        <span
                            key={tag}
                            className={`label-xs px-2 py-0.5 rounded-full ${
                                tag === 'vegan'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : tag === 'halal'
                                        ? 'bg-blue-50 text-blue-700'
                                        : tag === 'spice-free'
                                            ? 'bg-gray-100 text-gray-600'
                                            : 'bg-amber-50 text-amber-700'
                            }`}
                        >
              {TAG_LABELS[tag]}
            </span>
                    ))}
                    {meal.allergens.length > 0 && (
                        <span className="label-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" />
                            {meal.allergens.join(', ')}
            </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default function MenuSamplePage() {
    const [activeDay, setActiveDay] = useState<Day>('Monday');
    const [filter, setFilter] = useState<DietaryFilter>('all');

    const meals = SAMPLE_MENU[activeDay];
    const visible = (meal: Meal) =>
        filter === 'all' || meal.tags.includes(filter as Meal['tags'][number]);

    const filters: Array<{ key: DietaryFilter; label: string }> = [
        { key: 'all', label: 'All' },
        { key: 'vegan', label: 'Vegan' },
        { key: 'halal', label: 'Halal' },
        { key: 'spice-free', label: 'Spice-free' },
        { key: 'gluten-free', label: 'Gluten-free' },
    ];

    return (
        <div className="min-h-screen bg-[var(--surface-soft)]">
            {/* Sample banner */}
            <div className="bg-[var(--accent)] text-white text-center py-2.5 body-s font-medium">
                This is a sample menu — real weekly menus are available after your company signs up.
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="heading-m text-[var(--brand-green)] mb-3">This week's menu</h1>
                    <p className="body-l text-[var(--muted)] max-w-xl mx-auto">
                        Fresh Nigerian and continental meals prepared daily. Menus rotate weekly based on season
                        and availability.
                    </p>
                </motion.div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    {/* Day tabs */}
                    <div className="flex gap-1 bg-[var(--surface)] border border-[var(--line)] rounded-lg p-1">
                        {DAYS.map((day) => (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={`px-3 py-1.5 rounded-md body-s font-medium transition-all ${
                                    activeDay === day
                                        ? 'bg-[var(--accent)] text-white shadow-sm'
                                        : 'text-[var(--muted)] hover:text-[var(--text)]'
                                }`}
                            >
                                <span className="hidden sm:inline">{day}</span>
                                <span className="sm:hidden">{day.slice(0, 3)}</span>
                            </button>
                        ))}
                    </div>

                    {/* Dietary filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-4 h-4 text-[var(--muted)]" />
                        {filters.map(({ key, label }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`label-xs px-3 py-1.5 rounded-full border transition-all ${
                                    filter === key
                                        ? 'bg-[var(--text)] text-white border-[var(--text)]'
                                        : 'bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:border-[var(--text)]'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Meal grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeDay}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.18 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {meals.map((meal) => (
                            <MealCard key={meal.id} meal={meal} visible={visible(meal)} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-16 bg-[var(--brand-green)] rounded-2xl p-8 text-center text-white"
                >
                    <h2 className="heading-s mb-2">Want this for your team?</h2>
                    <p className="body-m text-green-100 mb-6">
                        Get fresh daily meals delivered to your office. Menus customised by your team's
                        preferences.
                    </p>
                    <a
                        href="/#pilot"
                        className="inline-block bg-white text-[var(--brand-green)] font-semibold px-6 py-3 rounded-lg hover:bg-green-50 transition-colors body-s"
                    >
                        Request a Pilot
                    </a>
                </motion.div>
            </div>
        </div>
    );
}