'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronLeft, ChevronRight, GripVertical, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

interface Meal {
    id: string;
    name: string;
    description: string;
    spiceLevel: 0 | 1 | 2 | 3;
    allergens: string[];
    price: number;
    available: boolean;
}

type WeekMenu = Record<string, Meal[]>;

const INITIAL: WeekMenu = {
    Monday: [
        { id: '1', name: 'Jollof Rice & Chicken', description: 'Classic party jollof with smoky grilled chicken.', spiceLevel: 1, allergens: [], price: 3500, available: true },
        { id: '2', name: 'Fried Rice & Turkey', description: 'Nigerian fried rice with tender turkey.', spiceLevel: 0, allergens: [], price: 3500, available: true },
    ],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
};

function SpiceIndicator({ level }: { level: 0 | 1 | 2 | 3 }) {
    return (
        <div className="flex gap-0.5" aria-label={`Spice level ${level} of 3`}>
            {[1, 2, 3].map((n) => (
                <div
                    key={n}
                    className={`w-2 h-2 rounded-full ${n <= level ? 'bg-red-500' : 'bg-[var(--line)]'}`}
                />
            ))}
        </div>
    );
}

export default function MenusPage() {
    const [menu, setMenu] = useState<WeekMenu>(INITIAL);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
    const [showAddMeal, setShowAddMeal] = useState(false);
    const [showPublish, setShowPublish] = useState(false);
    const [newMeal, setNewMeal] = useState<Partial<Meal>>({ spiceLevel: 0, allergens: [], available: true });

    const currentMeals = menu[selectedDay] ?? [];

    function handleAddMeal() {
        if (!newMeal.name || !newMeal.price) {
            toast.error('Name and price are required');
            return;
        }
        const meal: Meal = {
            id: Date.now().toString(),
            name: newMeal.name!,
            description: newMeal.description ?? '',
            spiceLevel: (newMeal.spiceLevel ?? 0) as Meal['spiceLevel'],
            allergens: newMeal.allergens ?? [],
            price: Number(newMeal.price),
            available: true,
        };
        setMenu((prev) => ({ ...prev, [selectedDay]: [...(prev[selectedDay] ?? []), meal] }));
        setNewMeal({ spiceLevel: 0, allergens: [], available: true });
        setShowAddMeal(false);
        toast.success(`"${meal.name}" added to ${selectedDay}`);
    }

    function removeMeal(id: string) {
        setMenu((prev) => ({ ...prev, [selectedDay]: prev[selectedDay].filter((m) => m.id !== id) }));
    }

    function toggleAvailable(id: string) {
        setMenu((prev) => ({
            ...prev,
            [selectedDay]: prev[selectedDay].map((m) =>
                m.id === id ? { ...m, available: !m.available } : m
            ),
        }));
    }

    async function publishMenu() {
        await new Promise((r) => setTimeout(r, 800));
        toast.success('Menu published successfully');
        setShowPublish(false);
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-6 space-y-5"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-heading-s text-[var(--text)]">Weekly Menu</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">Edit this week's meal options</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Eye size={14} className="mr-1.5" />Preview
                    </Button>
                    <Button size="sm" onClick={() => setShowPublish(true)}>Publish Menu</Button>
                </div>
            </div>

            {/* Day tabs */}
            <div className="flex gap-1 bg-[var(--surface-soft)] p-1 rounded-xl w-fit">
                {DAYS.map((day) => {
                    const count = menu[day]?.length ?? 0;
                    return (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-lg text-body-s font-medium transition-colors ${
                                selectedDay === day
                                    ? 'bg-[var(--surface)] shadow-sm text-[var(--text)]'
                                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                            }`}
                        >
                            {day.slice(0, 3)}
                            {count > 0 && (
                                <span className={`ml-1.5 text-label-xs ${selectedDay === day ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>
                  {count}
                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Meal list */}
            <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                    {currentMeals.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="p-8 text-center border-2 border-dashed border-[var(--line)] rounded-xl"
                        >
                            <p className="text-body-m text-[var(--muted)]">No meals for {selectedDay}</p>
                            <p className="text-body-s text-[var(--muted)] mt-1">Add meals below</p>
                        </motion.div>
                    )}
                    {currentMeals.map((meal) => (
                        <motion.div
                            key={meal.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -16 }}
                        >
                            <Card className={!meal.available ? 'opacity-60' : ''}>
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 text-[var(--line)] cursor-grab">
                                            <GripVertical size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-body-s font-semibold text-[var(--text)]">{meal.name}</p>
                                                <SpiceIndicator level={meal.spiceLevel} />
                                                {!meal.available && (
                                                    <span className="text-label-xs text-[var(--muted)] bg-[var(--surface-soft)] px-1.5 py-0.5 rounded">Off</span>
                                                )}
                                            </div>
                                            <p className="text-body-s text-[var(--muted)] truncate">{meal.description}</p>
                                            <p className="text-body-s text-[var(--accent)] font-medium mt-0.5">₦{meal.price.toLocaleString()}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleAvailable(meal.id)}
                                                className="text-body-s"
                                            >
                                                {meal.available ? 'Disable' : 'Enable'}
                                            </Button>
                                            <button
                                                onClick={() => removeMeal(meal.id)}
                                                className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-[var(--danger)] transition-colors"
                                                aria-label="Remove meal"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>

                <button
                    onClick={() => setShowAddMeal(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[var(--line)] rounded-xl text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                    <Plus size={16} />
                    <span className="text-body-s font-medium">Add meal to {selectedDay}</span>
                </button>
            </div>

            {/* Add meal modal */}
            <Modal isOpen={showAddMeal} onClose={() => setShowAddMeal(false)} title={`Add Meal — ${selectedDay}`}>
                <div className="space-y-4">
                    <Input
                        label="Meal name"
                        value={newMeal.name ?? ''}
                        onChange={(e) => setNewMeal((p) => ({ ...p, name: e.target.value }))}
                    />
                    <div>
                        <label className="text-body-s text-[var(--muted)] mb-1 block">Description</label>
                        <textarea
                            value={newMeal.description ?? ''}
                            onChange={(e) => setNewMeal((p) => ({ ...p, description: e.target.value }))}
                            rows={2}
                            className="w-full px-3 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Price (₦)"
                            type="number"
                            value={newMeal.price ?? ''}
                            onChange={(e) => setNewMeal((p) => ({ ...p, price: Number(e.target.value) }))}
                        />
                        <div>
                            <label className="text-body-s text-[var(--muted)] mb-1 block">Spice level (0–3)</label>
                            <select
                                value={newMeal.spiceLevel ?? 0}
                                onChange={(e) => setNewMeal((p) => ({ ...p, spiceLevel: Number(e.target.value) as Meal['spiceLevel'] }))}
                                className="w-full px-3 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                            >
                                {[0, 1, 2, 3].map((n) => (
                                    <option key={n} value={n}>{n === 0 ? '🌿 None' : n === 1 ? '🌶 Mild' : n === 2 ? '🌶🌶 Medium' : '🌶🌶🌶 Hot'}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <Input
                        label="Allergens (comma separated)"
                        value={(newMeal.allergens ?? []).join(', ')}
                        onChange={(e) => setNewMeal((p) => ({ ...p, allergens: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) }))}
                        placeholder="nuts, gluten, dairy"
                    />
                    <div className="flex gap-3 pt-2">
                        <Button onClick={handleAddMeal}>Add Meal</Button>
                        <Button variant="outline" onClick={() => setShowAddMeal(false)}>Cancel</Button>
                    </div>
                </div>
            </Modal>

            {/* Publish confirm */}
            <ConfirmDialog
                isOpen={showPublish}
                onClose={() => setShowPublish(false)}
                onConfirm={publishMenu}
                title="Publish this week's menu?"
                description="Employees will be able to see and order these meals. This cannot be undone without a new publish."
                confirmLabel="Publish"
            />
        </motion.div>
    );
}