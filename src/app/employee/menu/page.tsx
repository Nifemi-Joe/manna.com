"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Flame, Leaf, CheckCircle, AlertCircle, X, ChevronRight } from "lucide-react";
import { api, ApiError, type DayMenu, type Meal, type AllowanceInfo } from "@/lib/api";
import { useCountdown } from "@/hooks/useCountdown";
import { formatNaira, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SkeletonMealCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SpiceDots = { label: string; dots: number; color: string };
const spiceMap: Record<string, SpiceDots> = {
    none:   { label: "No spice", dots: 0, color: "bg-[var(--line)]" },
    mild:   { label: "Mild",     dots: 1, color: "bg-green-400" },
    medium: { label: "Medium",   dots: 2, color: "bg-amber-400" },
    hot:    { label: "Hot",      dots: 3, color: "bg-red-400" },
};

export default function EmployeeMenuPage() {
    const [menu, setMenu] = useState<DayMenu | null>(null);
    const [allowance, setAllowance] = useState<AllowanceInfo | null>(null);
    const [orderedMealId, setOrderedMealId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
    const [orderStep, setOrderStep] = useState<"confirm" | "topup" | "success" | null>(null);
    const [orderLoading, setOrderLoading] = useState(false);

    const countdown = useCountdown(menu?.cutoffTime ?? null);

    useEffect(() => {
        const today = new Date().toISOString().split("T")[0];

        Promise.all([
            api.employee.menus(),
            // Allowance is derived from access/me in a real app — mocked here
            fetch("/api/v1/employee/allowance", { credentials: "include" })
                .then((r) => r.ok ? r.json() : null)
                .catch(() => null),
        ])
            .then(([menuData, allowanceData]) => {
                const todayMenu = menuData.days.find((d:any) => d.date === today) ?? menuData.days[0];
                setMenu(todayMenu ?? null);
                setAllowance(
                    allowanceData ?? {
                        dailyAmount: 3000,
                        remaining: 3000,
                        used: 0,
                        resetAt: new Date(Date.now() + 86400000).toISOString(),
                    }
                );
            })
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load today's menu");
            })
            .finally(() => setLoading(false));
    }, []);

    const openOrderFlow = (meal: Meal) => {
        if (orderedMealId) return;
        setSelectedMeal(meal);
        setOrderStep("confirm");
    };

    const handlePlaceOrder = async () => {
        if (!selectedMeal || !menu) return;
        setOrderLoading(true);
        try {
            const res = await api.employee.orders.place({
                mealId: selectedMeal.id,
                date: menu.date,
            });
            if (res.requiresTopUp && res.paymentUrl) {
                setOrderStep("topup");
            } else {
                setOrderedMealId(selectedMeal.id);
                setOrderStep("success");
            }
        } catch (err: any) {
            toast.error(err instanceof ApiError ? err.message : "Order failed. Try again.");
            setOrderStep(null);
        } finally {
            setOrderLoading(false);
        }
    };

    const closeModal = () => {
        setOrderStep(null);
        setSelectedMeal(null);
    };

    return (
        <div className="max-w-2xl md:max-w-4xl mx-auto px-4 py-6 space-y-6">
            {/* Allowance card */}
            {allowance && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--brand-green)] rounded-[var(--radius-xl)] p-5 text-white"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-label-xs text-white/60">Today&apos;s allowance</p>
                            <p className="text-display-l mt-1">{formatNaira(allowance.remaining)}</p>
                            <p className="text-body-s text-white/60 mt-0.5">
                                {formatNaira(allowance.used)} used of {formatNaira(allowance.dailyAmount)}
                            </p>
                        </div>
                        {allowance.remaining === 0 && (
                            <div className="bg-white/15 rounded-[var(--radius-md)] px-3 py-1.5 text-[12px] font-semibold">
                                Top up to order
                            </div>
                        )}
                    </div>
                    {/* Progress bar */}
                    <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white rounded-full transition-[width] duration-500"
                            style={{ width: `${Math.min(100, (allowance.used / allowance.dailyAmount) * 100)}%` }}
                        />
                    </div>
                </motion.div>
            )}

            {/* Cutoff countdown */}
            {menu && !countdown.expired && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[var(--warning-bg)] rounded-[var(--radius-lg)] border border-[var(--warning)]/20">
                    <Clock size={16} className="text-[var(--warning)] shrink-0" aria-hidden="true" />
                    <p className="text-body-s text-[var(--warning)] font-medium">
                        Order by {formatDate(menu.cutoffTime, "h:mm a")} —{" "}
                        <strong>{countdown.formatted}</strong>
                    </p>
                </div>
            )}

            {countdown.expired && menu && (
                <div className="flex items-center gap-2 px-4 py-3 bg-[var(--danger-bg)] rounded-[var(--radius-lg)] border border-[var(--danger)]/20">
                    <AlertCircle size={16} className="text-[var(--danger)] shrink-0" aria-hidden="true" />
                    <p className="text-body-s text-[var(--danger)] font-medium">
                        Ordering is closed for today. Next menu available tomorrow.
                    </p>
                </div>
            )}

            {/* Page heading */}
            <div>
                <h1 className="text-heading-s text-[var(--text)]">
                    {menu ? `${formatDate(menu.date, "EEEE, d MMM")} Menu` : "Today's Menu"}
                </h1>
                {menu && (
                    <p className="text-body-s text-[var(--muted)] mt-1">
                        {menu.meals.length} meals available
                    </p>
                )}
            </div>

            {/* Error */}
            {error && (
                <EmptyState
                    illustration="error"
                    heading="Couldn't load today's menu"
                    description={error}
                    action={
                        <Button variant="outline" onClick={() => window.location.reload()}>
                            Try again
                        </Button>
                    }
                />
            )}

            {/* Meal grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <SkeletonMealCard key={i} />
                    ))}
                </div>
            ) : menu?.meals.length === 0 ? (
                <EmptyState
                    illustration="no-orders"
                    heading="No meals scheduled today"
                    description="Check back tomorrow for the next menu."
                />
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {menu?.meals.map((meal: any) => (
                        <MealCard
                            key={meal.id}
                            meal={meal}
                            isOrdered={orderedMealId === meal.id}
                            isClosed={countdown.expired}
                            onOrder={() => openOrderFlow(meal)}
                        />
                    ))}
                </div>
            )}

            {/* Order sheet */}
            <AnimatePresence>
                {orderStep && selectedMeal && (
                    <OrderSheet
                        meal={selectedMeal}
                        allowance={allowance}
                        step={orderStep}
                        loading={orderLoading}
                        onConfirm={handlePlaceOrder}
                        onClose={closeModal}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Meal Card ────────────────────────────────────────────
function MealCard({
                      meal,
                      isOrdered,
                      isClosed,
                      onOrder,
                  }: {
    meal: Meal;
    isOrdered: boolean;
    isClosed: boolean;
    onOrder: () => void;
}) {
    const spice = spiceMap[meal.spiceLevel] ?? spiceMap.none;

    return (
        <motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--line)] overflow-hidden flex flex-col"
        >
            {/* Image placeholder */}
            <div className="h-36 bg-gradient-to-br from-[var(--brand-green)]/15 to-[var(--accent)]/10 relative shrink-0">
        <span className="absolute inset-0 flex items-center justify-center text-3xl opacity-30" aria-hidden="true">
          🍽️
        </span>
                <div className="absolute top-2 right-2">
                    {isOrdered && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-[var(--success)] text-white text-[10px] font-bold">
              <CheckCircle size={10} aria-hidden="true" /> Ordered
            </span>
                    )}
                </div>
            </div>

            <div className="p-3 flex flex-col gap-2 flex-1">
                <h3 className="text-[13px] font-semibold text-[var(--text)] leading-tight line-clamp-2">
                    {meal.name}
                </h3>
                <p className="text-[11px] text-[var(--muted)] line-clamp-2 flex-1">
                    {meal.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                    {meal.dietary.map((d: any) => (
                        <span
                            key={d.id}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[var(--brand-green)]/10 text-[var(--brand-green)] text-[9px] font-semibold"
                        >
              <Leaf size={8} aria-hidden="true" /> {d.label}
            </span>
                    ))}
                    {meal.spiceLevel !== "none" && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-semibold">
              <Flame size={8} aria-hidden="true" /> {spice.label}
            </span>
                    )}
                </div>

                <div className="flex items-center justify-between mt-1">
          <span className="text-[13px] font-bold text-[var(--text)]">
            {formatNaira(meal.price)}
          </span>
                    <Button
                        size="sm"
                        variant={isOrdered ? "ghost" : "filled"}
                        disabled={isOrdered || isClosed || !meal.available}
                        onClick={onOrder}
                        className="text-[11px] h-7 px-2.5"
                    >
                        {isOrdered ? "Ordered ✓" : isClosed ? "Closed" : "Order"}
                    </Button>
                </div>
            </div>
        </motion.article>
    );
}

// ─── Order bottom sheet / modal ────────────────────────────
function OrderSheet({
                        meal,
                        allowance,
                        step,
                        loading,
                        onConfirm,
                        onClose,
                    }: {
    meal: Meal;
    allowance: AllowanceInfo | null;
    step: "confirm" | "topup" | "success";
    loading: boolean;
    onConfirm: () => void;
    onClose: () => void;
}) {
    const price = meal.price;
    const covered = Math.min(price, allowance?.remaining ?? 0);
    const topUp = Math.max(0, price - covered);

    return (
        <>
            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 bg-black/40 z-40 md:flex md:items-center md:justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            />

            {/* Sheet */}
            <motion.div
                className={cn(
                    "fixed z-50 bg-[var(--surface)] shadow-[var(--shadow-xl)]",
                    "bottom-0 left-0 right-0 rounded-t-[var(--radius-xl)] p-6",
                    "md:relative md:rounded-[var(--radius-xl)] md:max-w-md md:mx-auto md:bottom-auto md:left-auto md:right-auto"
                )}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label="Order confirmation"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--surface-soft)] text-[var(--muted)] transition-colors"
                    aria-label="Close"
                >
                    <X size={18} />
                </button>

                <AnimatePresence mode="wait">
                    {step === "confirm" && (
                        <motion.div
                            key="confirm"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="space-y-5"
                        >
                            <div>
                                <h2 className="text-heading-s text-[var(--text)]">Confirm order</h2>
                                <p className="text-body-s text-[var(--muted)] mt-1">{meal.name}</p>
                            </div>

                            {/* Price breakdown */}
                            <div className="bg-[var(--surface-soft)] rounded-[var(--radius-lg)] p-4 space-y-2">
                                <div className="flex justify-between text-body-s">
                                    <span className="text-[var(--muted)]">Meal price</span>
                                    <span className="text-[var(--text)] font-medium">{formatNaira(price)}</span>
                                </div>
                                <div className="flex justify-between text-body-s">
                                    <span className="text-[var(--muted)]">Company covers</span>
                                    <span className="text-[var(--success)] font-medium">−{formatNaira(covered)}</span>
                                </div>
                                {topUp > 0 && (
                                    <div className="flex justify-between text-body-s border-t border-[var(--line)] pt-2 mt-2">
                                        <span className="text-[var(--text)] font-semibold">You pay</span>
                                        <span className="text-[var(--text)] font-bold">{formatNaira(topUp)}</span>
                                    </div>
                                )}
                                {topUp === 0 && (
                                    <div className="flex justify-between text-body-s border-t border-[var(--line)] pt-2 mt-2">
                                        <span className="text-[var(--success)] font-semibold">Fully covered</span>
                                        <span className="text-[var(--success)] font-bold">₦0</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button variant="ghost" fullWidth onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button variant="filled" fullWidth loading={loading} onClick={onConfirm}>
                                    {topUp > 0 ? `Pay ${formatNaira(topUp)}` : "Confirm order"}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-4 py-4"
                        >
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10, stiffness: 200, delay: 0.1 }}
                                className="w-16 h-16 rounded-full bg-[var(--success-bg)] flex items-center justify-center mx-auto"
                            >
                                <CheckCircle size={32} className="text-[var(--success)]" />
                            </motion.div>
                            <div>
                                <h2 className="text-heading-s text-[var(--text)]">Order placed!</h2>
                                <p className="text-body-s text-[var(--muted)] mt-1">
                                    {meal.name} · Arriving today at lunch
                                </p>
                            </div>
                            <Button variant="filled" fullWidth onClick={onClose}>
                                Done
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    );
}