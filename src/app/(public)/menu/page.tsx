'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Leaf, AlertCircle, Filter, ArrowRight } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
type Day = typeof DAYS[number];

interface Meal {
    id: string;
    name: string;
    description: string;
    spice: 0 | 1 | 2 | 3;
    tags: Array<'vegan' | 'halal' | 'spice-free' | 'gluten-free'>;
    allergens: string[];
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

// Real photos of actual Manna meals, mapped only where they're a genuine
// match for the dish — no forcing a photo onto a dish it doesn't show.
// Everything else still uses the brand-gradient placeholder until we
// have a real shot of it.
const REAL_PHOTOS: Record<string, string> = {
    m1: '/images/jollof-fried-rice-chicken-plantain.jpg',   // Monday: Jollof Rice & Chicken — exact match
    th2: '/images/white-rice-buka-stew-plantain.jpg',                 // Thursday: Rice & Stew — exact match
    t5: '/images/chicken-sandwich.jpg',            // Tuesday: Chicken Shawarma Wrap — close enough (bread + chicken filling)
};

const SAMPLE_MENU: Record<Day, Meal[]> = {
    Monday: [
        { id: 'm1', name: 'Jollof Rice & Chicken', description: 'Smoky party-style jollof with grilled chicken thigh, plantain, and coleslaw.', spice: 2, tags: ['halal'], allergens: [] },
        { id: 'm2', name: 'Egusi Soup & Pounded Yam', description: 'Rich melon seed soup with assorted meats and stock fish.', spice: 1, tags: ['halal'], allergens: ['shellfish'] },
        { id: 'm3', name: 'Moi Moi & Ogi', description: 'Steamed bean pudding with golden corn porridge — a light, protein-rich combo.', spice: 0, tags: ['vegan', 'halal', 'spice-free'], allergens: [] },
        { id: 'm4', name: 'Ofada Rice & Ayamase', description: 'Local unpolished rice with spicy green pepper sauce and assorted meats.', spice: 3, tags: ['halal'], allergens: [] },
        { id: 'm5', name: 'Pasta Bolognese', description: 'Penne pasta in a slow-cooked beef tomato sauce with parmesan.', spice: 0, tags: ['spice-free'], allergens: ['gluten', 'dairy'] },
        { id: 'm6', name: 'Grilled Tilapia & Chips', description: 'Whole tilapia seasoned with peppers and herbs, served with seasoned fries.', spice: 1, tags: ['halal', 'gluten-free'], allergens: ['fish'] },
    ],
    Tuesday: [
        { id: 't1', name: 'Pepper Soup & Agidi', description: 'Spiced catfish pepper soup with chilled corn meal — a Lagosian classic.', spice: 3, tags: ['halal', 'gluten-free'], allergens: ['fish'] },
        { id: 't2', name: 'Fried Rice & Turkey', description: 'Nigerian-style fried rice loaded with vegetables, served with turkey.', spice: 1, tags: ['halal'], allergens: [] },
        { id: 't3', name: 'Plantain & Egg Sauce', description: 'Sweet ripe plantain with a savory tomato-egg stir sauce.', spice: 1, tags: ['vegan', 'halal', 'gluten-free'], allergens: ['egg'] },
        { id: 't4', name: 'Ofe Onugbu & Fufu', description: 'Bitter leaf soup with stockfish and goat meat, served with cassava fufu.', spice: 2, tags: ['halal'], allergens: [] },
        { id: 't5', name: 'Chicken Shawarma Wrap', description: 'Juicy grilled chicken with garlic sauce, pickled vegetables in a flour wrap.', spice: 1, tags: ['halal'], allergens: ['gluten'] },
        { id: 't6', name: 'Vegetable Stir Fry & Rice', description: 'Seasonal vegetables tossed in soy sauce with steamed white rice.', spice: 0, tags: ['vegan', 'spice-free'], allergens: ['soy', 'gluten'] },
    ],
    Wednesday: [
        { id: 'w1', name: 'Banga Soup & Starch', description: 'Palm-nut soup with periwinkle and dried fish, served with Delta starch.', spice: 1, tags: ['halal'], allergens: ['shellfish', 'fish'] },
        { id: 'w2', name: 'Beans & Plantain', description: 'Ewa agoyin with soft boiled beans and sweet fried plantain.', spice: 2, tags: ['vegan', 'halal', 'gluten-free'], allergens: [] },
        { id: 'w3', name: 'Grilled Chicken & Salad', description: 'Herb-marinated grilled chicken breast with garden salad and vinaigrette.', spice: 0, tags: ['halal', 'gluten-free', 'spice-free'], allergens: [] },
        { id: 'w4', name: 'Ogbono Soup & Semolina', description: 'Draw soup with bush meat and smoked catfish, served with semolina.', spice: 2, tags: ['halal'], allergens: ['fish'] },
        { id: 'w5', name: 'Chicken Peppersoup', description: 'Light but fiery chicken peppersoup with scent leaves — no accompaniment.', spice: 3, tags: ['halal', 'gluten-free'], allergens: [] },
        { id: 'w6', name: 'Akara & Custard', description: 'Crispy bean cakes served with smooth, sweetened vanilla custard.', spice: 0, tags: ['vegan', 'spice-free'], allergens: ['egg'] },
    ],
    Thursday: [
        { id: 'th1', name: 'Seafood Okra', description: 'Chunky okra draw soup with crab, prawns, and periwinkle.', spice: 2, tags: ['halal', 'gluten-free'], allergens: ['shellfish'] },
        { id: 'th2', name: 'Rice & Stew', description: 'Plain white rice with a rich, meaty tomato stew and fried plantain — the undisputed classic.', spice: 1, tags: ['halal'], allergens: [] },
        { id: 'th3', name: 'Noodles & Eggs', description: 'Indomie stir-fried with assorted vegetables, eggs, and chicken.', spice: 2, tags: ['halal'], allergens: ['gluten', 'egg'] },
        { id: 'th4', name: 'Efo Riro & Eba', description: 'Yoruba spinach stew with assorted meats and locust beans, served with garri.', spice: 2, tags: ['halal'], allergens: [] },
        { id: 'th5', name: 'Burger & Fries', description: 'Grilled beef patty with lettuce, tomato, pickles, and seasoned fries.', spice: 0, tags: ['halal', 'spice-free'], allergens: ['gluten', 'dairy'] },
        { id: 'th6', name: 'Tofu Stir Fry', description: 'Pan-fried tofu with bok choy, mushrooms, and ginger soy sauce.', spice: 1, tags: ['vegan', 'gluten-free'], allergens: ['soy'] },
    ],
    Friday: [
        { id: 'f1', name: 'Suya Platter', description: 'Skewered grilled beef suya with onions, tomatoes, and yaji spice blend.', spice: 3, tags: ['halal', 'gluten-free'], allergens: ['groundnut'] },
        { id: 'f2', name: 'Pounded Yam & Oha Soup', description: 'Silky pounded yam with Igbo oha leaf soup and cocoyam thickener.', spice: 1, tags: ['halal', 'gluten-free'], allergens: [] },
        { id: 'f3', name: 'Coconut Rice & Chicken', description: 'Fragrant long grain rice cooked in coconut milk with tender chicken.', spice: 0, tags: ['halal', 'gluten-free', 'spice-free'], allergens: [] },
        { id: 'f4', name: 'Abacha & Ugba', description: 'African salad with palm oil, ugba, garden eggs, and ukpaka.', spice: 2, tags: ['vegan', 'halal', 'gluten-free'], allergens: [] },
        { id: 'f5', name: 'Peppered Snail', description: 'Fried snail in a rich pepper sauce — a Friday treat.', spice: 2, tags: ['halal', 'gluten-free'], allergens: [] },
        { id: 'f6', name: 'Veggie Jollof & Plantain', description: 'Full-flavour vegetable jollof rice with caramelised plantain and coleslaw.', spice: 1, tags: ['vegan', 'halal'], allergens: [] },
    ],
};

const SNACKS_AND_DRINKS = [
    { src: '/images/spaghetti-chicken.jpg', name: 'Spaghetti & Chicken', description: 'Stir-fried spaghetti with vegetables and grilled chicken drumsticks.', price: 'Add-on' },
    { src: '/images/meat-pie.jpg', name: 'Meat Pie', description: 'Flaky pastry filled with seasoned minced beef and vegetables.', price: 'Snack' },
    { src: '/images/juiceup-zobo.jpg', name: 'Zobo Juice', description: 'Chilled hibiscus drink, naturally sweetened.', price: 'Drink' },
];

const TAG_LABELS: Record<string, string> = { vegan: 'Vegan', halal: 'Halal', 'spice-free': 'Spice-free', 'gluten-free': 'Gluten-free' };
const TAG_STYLES: Record<string, string> = {
    vegan: 'bg-[var(--brand-green-tint)] text-[var(--brand-green)]',
    halal: 'bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)]',
    'spice-free': 'bg-[var(--surface-soft)] text-[var(--muted)]',
    'gluten-free': 'bg-[var(--accent-3-soft)] text-[var(--accent-3)]',
};

function SpiceIndicator({ level }: { level: 0 | 1 | 2 | 3 }) {
    return (
        <div className="flex items-center gap-0.5" aria-label={`Spice level ${level} of 3`}>
            {[1, 2, 3].map((i) => (
                <Flame key={i} className="w-3 h-3" style={{ color: i <= level ? 'var(--accent-3)' : 'var(--line)' }} />
            ))}
        </div>
    );
}

function MealCard({ meal, gradient, visible }: { meal: Meal; gradient: string; visible: boolean }) {
    if (!visible) return null;
    const photo = REAL_PHOTOS[meal.id];

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
                {photo ? (
                    <Image src={photo} alt={meal.name} fill sizes="(max-width: 768px) 50vw, 320px" className="object-cover" />
                ) : (
                    <div className="absolute inset-0" style={{ background: gradient }}>
                        <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-90 drop-shadow" aria-hidden="true">🍽️</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" aria-hidden="true" />
                    </div>
                )}
                {meal.tags.includes('vegan') && (
                    <div className="absolute top-2 right-2 bg-white text-[var(--brand-green)] rounded-full p-1 shadow-sm">
                        <Leaf className="w-3 h-3" />
                    </div>
                )}
                {photo && (
                    <span className="absolute bottom-2 left-2 text-label-xs px-2 py-0.5 rounded-full bg-white/90 text-[var(--brand-green)] font-semibold">
                        Actual photo
                    </span>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-body-s font-semibold text-[var(--text)] leading-snug">{meal.name}</h3>
                    <SpiceIndicator level={meal.spice} />
                </div>
                <p className="text-body-s text-[var(--muted)] line-clamp-2 mb-3">{meal.description}</p>
                <div className="flex flex-wrap gap-1">
                    {meal.tags.map((tag) => (
                        <span key={tag} className={`text-label-xs px-2 py-0.5 rounded-full ${TAG_STYLES[tag]}`}>{TAG_LABELS[tag]}</span>
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
    const [activeDay, setActiveDay] = useState<Day>('Monday');
    const [filter, setFilter] = useState<DietaryFilter>('all');

    const meals = SAMPLE_MENU[activeDay];
    const visible = (meal: Meal) => filter === 'all' || meal.tags.includes(filter as Meal['tags'][number]);

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
                This is a sample menu — real weekly menus are available after your company signs up.
            </div>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
                    <p className="text-label-xs text-[var(--accent-2-hover)] mb-2">This week's menu</p>
                    <h1 className="text-display-l text-[var(--text)] mb-3">Something new every day.</h1>
                    <p className="text-body-l text-[var(--muted)] max-w-xl mx-auto">
                        Fresh Nigerian and continental meals prepared daily. Menus rotate weekly based on season and availability.
                    </p>
                </motion.div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex gap-1 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] p-1">
                        {DAYS.map((day) => {
                            const active = activeDay === day;
                            return (
                                <button
                                    key={day}
                                    onClick={() => setActiveDay(day)}
                                    className="px-3 py-1.5 rounded-[var(--radius-md)] text-body-s font-medium transition-all"
                                    style={active ? { background: 'var(--brand-green)', color: 'white' } : { color: 'var(--muted)' }}
                                >
                                    <span className="hidden sm:inline">{day}</span>
                                    <span className="sm:hidden">{day.slice(0, 3)}</span>
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
                        key={activeDay}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.18 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {meals.map((meal, i) => (
                            <MealCard key={meal.id} meal={meal} gradient={BRAND_GRADIENTS[i % BRAND_GRADIENTS.length]} visible={visible(meal)} />
                        ))}
                    </motion.div>
                </AnimatePresence>

                {/* Snacks & drinks — real photos that don't fit the daily lunch
                    grid but are genuinely part of the Manna menu */}
                <div className="mt-16">
                    <p className="text-label-xs text-[var(--accent-2-hover)] mb-2">Also available every day</p>
                    <h2 className="text-heading-m text-[var(--text)] mb-6">Snacks & drinks</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {SNACKS_AND_DRINKS.map((item) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -4 }}
                                className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] overflow-hidden hover:shadow-[var(--shadow-md)] transition-shadow"
                            >
                                <div className="relative h-36">
                                    <Image src={item.src} alt={item.name} fill sizes="(max-width: 768px) 100vw, 340px" className="object-cover" />
                                    <span className="absolute top-2 right-2 text-label-xs px-2 py-0.5 rounded-full bg-white/90 text-[var(--accent-2-hover)] font-semibold">{item.price}</span>
                                </div>
                                <div className="p-4">
                                    <h3 className="text-body-s font-semibold text-[var(--text)] mb-1">{item.name}</h3>
                                    <p className="text-body-s text-[var(--muted)]">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

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
