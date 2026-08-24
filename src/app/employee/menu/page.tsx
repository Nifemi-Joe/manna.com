"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock, Flame, Leaf, CheckCircle, AlertCircle, X, Info, Send,
    ShoppingBag, Plus, Minus, Trash2,
} from "lucide-react";
import { api, ApiError, type DayMenu, type Meal } from "@/lib/api";
import { useCountdown } from "@/hooks/useCountdown";
import { formatNaira, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { SkeletonMealCard } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AllowanceInfoExtended {
    dailyAmount: number;
    daily?: number;
    remaining: number;
    used: number;
    resetAt: string;
    mealType?: string;
    overspendLimit?: number;
    canOrderForOthers?: boolean;
}

interface Colleague {
    id: string;
    name: string;
    email: string;
}

interface CartLine {
    meal: Meal;
    quantity: number;
}

type SpiceDots = { label: string; dots: number; color: string };
const spiceMap: Record<string, SpiceDots> = {
    none: { label: "No spice", dots: 0, color: "bg-[var(--line)]" },
    mild: { label: "Mild", dots: 1, color: "bg-[var(--success)]" },
    medium: { label: "Medium", dots: 2, color: "bg-[var(--accent-2)]" },
    hot: { label: "Hot", dots: 3, color: "bg-[var(--accent-3)]" },
};

const CARD_GRADIENTS = [
    "linear-gradient(135deg, var(--brand-green) 0%, #2F6E58 100%)",
    "linear-gradient(135deg, var(--accent-2) 0%, #E8A23D 100%)",
    "linear-gradient(135deg, var(--accent-3) 0%, #E8703F 100%)",
    "linear-gradient(135deg, #2F6E58 0%, var(--brand-green-dark) 100%)",
];

export default function EmployeeMenuPage() {
    const [menu, setMenu] = useState<DayMenu | null>(null);
    const [mealWindow, setMealWindow] = useState<"breakfast" | "lunch">("lunch");
    const [isFallback, setIsFallback] = useState(false);
    const [allowance, setAllowance] = useState<AllowanceInfoExtended | null>(null);
    const [colleagues, setColleagues] = useState<Colleague[]>([]);
    const [orderForId, setOrderForId] = useState<string>("me");
    const [orderedMealIds, setOrderedMealIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [cart, setCart] = useState<Map<string, CartLine>>(new Map());
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutStep, setCheckoutStep] = useState<"review" | "topup" | "success" | null>(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [lastCheckoutResult, setLastCheckoutResult] = useState<any>(null);

    const countdown = useCountdown(menu?.cutoffTime ?? null);

    function loadMenu() {
        setLoading(true);
        setError(null);
        Promise.all([
            api.employee.menus(),
            api.employee.allowance(),
            fetch("/api/v1/employee/colleagues", { credentials: "include" }).then((r) => (r.ok ? r.json() : { colleagues: [] })),
        ])
            .then(([menuData, allowanceData, colleaguesData]) => {
                const dayData: any = (menuData as any).days?.[0];
                setMenu(dayData ?? null);
                setMealWindow((menuData as any).mealWindow ?? "lunch");
                setIsFallback((menuData as any).isFallback ?? false);
                setAllowance(allowanceData as AllowanceInfoExtended);
                setColleagues(colleaguesData.colleagues ?? []);
            })
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load today's menu");
            })
            .finally(() => setLoading(false));
    }

    useEffect(() => { loadMenu(); }, []);

    function addToCart(meal: Meal) {
        setCart((prev) => {
            const next = new Map(prev);
            const existing = next.get(meal.id);
            next.set(meal.id, { meal, quantity: (existing?.quantity ?? 0) + 1 });
            return next;
        });
    }

    function decrementInCart(mealId: string) {
        setCart((prev) => {
            const next = new Map(prev);
            const existing = next.get(mealId);
            if (!existing) return next;
            if (existing.quantity <= 1) {
                next.delete(mealId);
            } else {
                next.set(mealId, { ...existing, quantity: existing.quantity - 1 });
            }
            return next;
        });
    }

    function removeFromCart(mealId: string) {
        setCart((prev) => {
            const next = new Map(prev);
            next.delete(mealId);
            return next;
        });
    }

    const cartLines = useMemo(() => Array.from(cart.values()), [cart]);
    const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
    const cartSubtotal = cartLines.reduce((sum, l) => sum + l.meal.price * l.quantity, 0);

    const preview = useMemo(() => {
        const remaining = allowance?.remaining ?? 0;
        const overspendLimit = allowance?.overspendLimit ?? 0;
        let runningUsed = 0;
        let runningOverspendUsed = 0;
        let allowanceCovered = 0;
        let overspendCovered = 0;

        for (const line of cartLines) {
            const lineTotal = line.meal.price * line.quantity;
            const remainingBase = Math.max(0, remaining - runningUsed);
            const coveredByBase = Math.min(lineTotal, remainingBase);
            const remainingOverspend = Math.max(0, overspendLimit - runningOverspendUsed);
            const coveredByOverspend = Math.min(lineTotal - coveredByBase, remainingOverspend);

            runningUsed += coveredByBase;
            runningOverspendUsed += coveredByOverspend;
            allowanceCovered += coveredByBase + coveredByOverspend;
            overspendCovered += coveredByOverspend;
        }

        const employeePaid = cartSubtotal - allowanceCovered;
        return { allowanceCovered, overspendCovered, employeePaid: Math.max(0, employeePaid) };
    }, [cartLines, cartSubtotal, allowance]);

    const handleCheckout = async () => {
        if (!menu || cartLines.length === 0) return;
        setCheckoutLoading(true);
        try {
            const res = await fetch("/api/v1/orders/cart", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    date: menu.date,
                    items: cartLines.map((l) => ({ mealId: l.meal.id, quantity: l.quantity })),
                    onBehalfOfUserId: orderForId !== "me" ? orderForId : undefined,
                }),
            });
            const data = await res.json();

            if (!res.ok) {
                if (data?.availableMeals) {
                    setMenu((prev) => (prev ? { ...prev, meals: data.availableMeals } : prev));
                }
                toast.error(data?.message ?? "Checkout failed. Try again.", { duration: 6000 });
                return;
            }

            setLastCheckoutResult(data);

            if (data.requiresTopUp && data.paymentUrl) {
                setCheckoutStep("topup");
            } else {
                if (orderForId === "me") {
                    setOrderedMealIds((prev) => new Set([...prev, ...cartLines.map((l) => l.meal.id)]));
                }
                setCheckoutStep("success");
                if (data.usedOverspend) {
                    toast.success("Part of this order used your authorized overspend allowance.");
                }
            }
            setCart(new Map());
            api.employee.allowance().then((a) => setAllowance(a as AllowanceInfoExtended));
        } catch {
            toast.error("Checkout failed. Try again.");
        } finally {
            setCheckoutLoading(false);
        }
    };

    const closeCheckout = () => {
        setCheckoutStep(null);
        setLastCheckoutResult(null);
        setCartOpen(false);
        setOrderForId("me");
    };

    const windowLabel = mealWindow === "breakfast" ? "Breakfast" : "Lunch";
    const orderForName = orderForId !== "me" ? colleagues.find((c) => c.id === orderForId)?.name : undefined;

    return (
        <div className="page-wash min-h-full relative">
            <div className="max-w-2xl md:max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
                {allowance && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative overflow-hidden rounded-[var(--radius-xl)] p-5 text-white shadow-[var(--shadow-md)]"
                        style={{ background: "linear-gradient(135deg, var(--brand-green), var(--brand-green-dark))" }}
                    >
                        <div className="absolute -right-8 -top-10 w-40 h-40 rounded-full bg-[var(--accent-2)]/20 blur-2xl" aria-hidden="true" />
                        <div className="relative flex items-start justify-between">
                            <div>
                                <p className="text-label-xs text-white/60">{windowLabel} allowance</p>
                                <p className="text-display-l mt-1 font-mono-num">{formatNaira(allowance.remaining)}</p>
                                <p className="text-body-s text-white/60 mt-0.5">
                                    {formatNaira(allowance.used)} used of {formatNaira(allowance.dailyAmount)}
                                    {!!allowance.overspendLimit && (
                                        <span className="text-[var(--accent-2)]"> · +{formatNaira(allowance.overspendLimit)} authorized overspend</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="relative mt-4 h-1.5 bg-white/15 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (allowance.used / allowance.dailyAmount) * 100)}%` }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full rounded-full"
                                style={{ background: "linear-gradient(90deg, var(--accent-2), var(--accent-3))" }}
                            />
                        </div>
                    </motion.div>
                )}

                {allowance?.canOrderForOthers && colleagues.length > 0 && (
                    <div className="flex items-center gap-2.5 px-4 py-3 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)]">
                        <Send size={16} className="text-[var(--accent-2-hover)] shrink-0" aria-hidden="true" />
                        <label className="text-body-s text-[var(--muted)] shrink-0">Ordering for</label>
                        <select
                            value={orderForId}
                            onChange={(e) => setOrderForId(e.target.value)}
                            className="flex-1 h-9 px-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]"
                        >
                            <option value="me">Myself</option>
                            {colleagues.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} (on my tab)</option>
                            ))}
                        </select>
                    </div>
                )}

                {menu && !countdown.expired && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5 px-4 py-3 bg-[var(--accent-2)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)]">
                        <Clock size={16} className="text-white shrink-0" aria-hidden="true" />
                        <p className="text-body-s text-white font-medium">
                            {windowLabel} order by {formatDate(menu.cutoffTime, "h:mm a")} — <strong className="font-mono-num">{countdown.formatted}</strong>
                        </p>
                    </motion.div>
                )}

                {countdown.expired && menu && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-[var(--danger-bg)] rounded-[var(--radius-lg)] border border-[var(--danger)]/20">
                        <AlertCircle size={16} className="text-[var(--danger)] shrink-0" aria-hidden="true" />
                        <p className="text-body-s text-[var(--danger)] font-medium">Ordering is closed for {windowLabel.toLowerCase()} today.</p>
                    </div>
                )}

                {isFallback && menu && menu.meals.length > 0 && !countdown.expired && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-[var(--brand-green-tint)] rounded-[var(--radius-lg)]">
                        <Info size={16} className="text-[var(--brand-green)] shrink-0" aria-hidden="true" />
                        <p className="text-body-s text-[var(--brand-green)]">
                            Ops hasn't scheduled a specific {windowLabel.toLowerCase()} menu today — showing everything currently available instead.
                        </p>
                    </div>
                )}

                <div className="flex items-baseline justify-between">
                    <div>
                        <h1 className="text-heading-m text-[var(--text)]">
                            {menu ? `${windowLabel} · ${formatDate(menu.date, "EEEE, d MMM")}` : `Today's ${windowLabel}`}
                        </h1>
                        {menu && <p className="text-body-s text-[var(--muted)] mt-1">{menu.meals.length} meals available — add as many as you like</p>}
                    </div>
                </div>

                {error && (
                    <EmptyState illustration="error" heading="Couldn't load the menu" description={error} action={<Button variant="outline" onClick={loadMenu}>Try again</Button>} />
                )}

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => <SkeletonMealCard key={i} />)}
                    </div>
                ) : !error && menu?.meals.length === 0 ? (
                    <EmptyState illustration="no-orders" heading={`No ${windowLabel.toLowerCase()} available right now`} description="Check back later, or come back for the next meal window." />
                ) : !error ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {menu?.meals.map((meal: any, i: number) => (
                            <MealCard
                                key={meal.id}
                                meal={meal}
                                gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                                quantityInCart={cart.get(meal.id)?.quantity ?? 0}
                                isAlreadyOrdered={orderedMealIds.has(meal.id)}
                                isClosed={countdown.expired}
                                onAdd={() => addToCart(meal)}
                                onDecrement={() => decrementInCart(meal.id)}
                            />
                        ))}
                    </div>
                ) : null}
            </div>

            <AnimatePresence>
                {cartCount > 0 && !cartOpen && (
                    <motion.button
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        onClick={() => setCartOpen(true)}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pl-4 pr-5 py-3 rounded-full shadow-[var(--shadow-lg)] text-white"
                        style={{ background: "linear-gradient(135deg, var(--accent-2), var(--accent-3))" }}
                    >
                        <span className="relative">
                            <ShoppingBag size={18} />
                            <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-white text-[var(--accent-3)] text-[10px] font-bold flex items-center justify-center">{cartCount}</span>
                        </span>
                        <span className="text-body-s font-semibold">View cart · {formatNaira(cartSubtotal)}</span>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {cartOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/40 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => (checkoutStep ? undefined : setCartOpen(false))}
                        />
                        <motion.div
                            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[420px] bg-[var(--surface)] shadow-[var(--shadow-xl)] flex flex-col"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 32, stiffness: 320 }}
                        >
                            {!checkoutStep && (
                                <>
                                    <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--line)] shrink-0">
                                        <h2 className="text-heading-s text-[var(--text)] flex items-center gap-2">
                                            <ShoppingBag size={18} /> Your cart
                                        </h2>
                                        <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full hover:bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)]" aria-label="Close cart">
                                            <X size={18} />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto thin-scroll p-5 space-y-3">
                                        {cartLines.length === 0 ? (
                                            <p className="text-body-s text-[var(--muted)] text-center py-12">Your cart is empty.</p>
                                        ) : (
                                            cartLines.map((line) => (
                                                <div key={line.meal.id} className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)] border border-[var(--line)]">
                                                    <div className="w-12 h-12 rounded-[var(--radius-md)] overflow-hidden shrink-0 relative bg-[var(--surface-soft)]">
                                                        {line.meal.imageUrl ? (
                                                            <Image src={line.meal.imageUrl} alt={line.meal.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="absolute inset-0 flex items-center justify-center text-lg">🍽️</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-body-s font-medium text-[var(--text)] truncate">{line.meal.name}</p>
                                                        <p className="text-label-xs text-[var(--muted)] font-mono-num">{formatNaira(line.meal.price)} each</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button onClick={() => decrementInCart(line.meal.id)} className="w-6 h-6 rounded-full border border-[var(--line)] flex items-center justify-center hover:bg-[var(--surface-soft)] text-[var(--muted)]">
                                                            <Minus size={11} />
                                                        </button>
                                                        <span className="w-5 text-center text-body-s font-mono-num">{line.quantity}</span>
                                                        <button onClick={() => addToCart(line.meal)} className="w-6 h-6 rounded-full border border-[var(--line)] flex items-center justify-center hover:bg-[var(--surface-soft)] text-[var(--muted)]">
                                                            <Plus size={11} />
                                                        </button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(line.meal.id)} className="text-[var(--muted)] hover:text-[var(--danger)] shrink-0" aria-label="Remove">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {cartLines.length > 0 && (
                                        <div className="shrink-0 border-t border-[var(--line)] p-5 space-y-3">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-body-s">
                                                    <span className="text-[var(--muted)]">Subtotal</span>
                                                    <span className="text-[var(--text)] font-mono-num">{formatNaira(cartSubtotal)}</span>
                                                </div>
                                                <div className="flex justify-between text-body-s">
                                                    <span className="text-[var(--muted)]">Allowance covers</span>
                                                    <span className="text-[var(--success)] font-mono-num">−{formatNaira(preview.allowanceCovered)}</span>
                                                </div>
                                                {preview.overspendCovered > 0 && (
                                                    <div className="flex justify-between text-body-s">
                                                        <span className="text-[var(--accent-2-hover)]">— includes overspend</span>
                                                        <span className="text-[var(--accent-2-hover)] font-mono-num">{formatNaira(preview.overspendCovered)}</span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-body-m font-semibold pt-1.5 border-t border-[var(--line)]">
                                                    <span className={preview.employeePaid > 0 ? "text-[var(--accent-3)]" : "text-[var(--success)]"}>
                                                        {preview.employeePaid > 0 ? "You'll pay" : "Fully covered"}
                                                    </span>
                                                    <span className={cn("font-mono-num", preview.employeePaid > 0 ? "text-[var(--accent-3)]" : "text-[var(--success)]")}>
                                                        {preview.employeePaid > 0 ? formatNaira(preview.employeePaid) : "₦0"}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button variant={preview.employeePaid > 0 ? "coral" : "filled"} fullWidth loading={checkoutLoading} onClick={handleCheckout}>
                                                {preview.employeePaid > 0 ? `Place order · pay ${formatNaira(preview.employeePaid)}` : `Place order · ${formatNaira(cartSubtotal)}`}
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {checkoutStep === "topup" && lastCheckoutResult && (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-[var(--accent-3-soft)] flex items-center justify-center">
                                        <AlertCircle size={28} className="text-[var(--accent-3)]" />
                                    </div>
                                    <div>
                                        <h2 className="text-heading-s text-[var(--text)]">Payment needed to confirm</h2>
                                        <p className="text-body-s text-[var(--muted)] mt-2 max-w-xs">
                                            Your order is saved, but it went beyond your allowance. Pay{" "}
                                            <strong className="text-[var(--text)] font-mono-num">{formatNaira(lastCheckoutResult.topUpAmount)}</strong>{" "}
                                            to confirm it — otherwise it may not be prepared today.
                                        </p>
                                    </div>
                                    <Button
                                        variant="coral"
                                        onClick={() => { window.open(lastCheckoutResult.paymentUrl, "_blank"); }}
                                    >
                                        Pay {formatNaira(lastCheckoutResult.topUpAmount)} now
                                    </Button>
                                    <button onClick={closeCheckout} className="text-body-s text-[var(--muted)] underline">I'll pay later, close this</button>
                                </div>
                            )}

                            {checkoutStep === "success" && lastCheckoutResult && (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10, stiffness: 200 }} className="w-16 h-16 rounded-full bg-[var(--success-bg)] flex items-center justify-center">
                                        <CheckCircle size={32} className="text-[var(--success)]" />
                                    </motion.div>
                                    <div>
                                        <h2 className="text-heading-s text-[var(--text)]">
                                            {lastCheckoutResult.orders?.length > 1 ? `${lastCheckoutResult.orders.length} items ordered!` : "Order placed!"}
                                        </h2>
                                        <p className="text-body-s text-[var(--muted)] mt-1">
                                            {orderForName ? `For ${orderForName} · ` : ""}{formatNaira(lastCheckoutResult.totalAmount)} total · On its way
                                        </p>
                                    </div>
                                    <Button variant="filled" onClick={closeCheckout}>Done</Button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

function MealCard({
                      meal, gradient, quantityInCart, isAlreadyOrdered, isClosed, onAdd, onDecrement,
                  }: {
    meal: Meal;
    gradient: string;
    quantityInCart: number;
    isAlreadyOrdered: boolean;
    isClosed: boolean;
    onAdd: () => void;
    onDecrement: () => void;
}) {
    const spice = spiceMap[meal.spiceLevel] ?? spiceMap.none;
    const disabled = isClosed || !meal.available || isAlreadyOrdered;

    return (
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="bg-[var(--surface)] rounded-[var(--radius-xl)] border border-[var(--line)] overflow-hidden flex flex-col shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
        >
            <div className="h-28 relative shrink-0">
                {meal.imageUrl ? (
                    <Image src={meal.imageUrl} alt={meal.name} fill sizes="(max-width: 768px) 33vw, 240px" className="object-cover" />
                ) : (
                    <div className="absolute inset-0" style={{ background: gradient }}>
                        <span className="absolute inset-0 flex items-center justify-center text-4xl opacity-90 drop-shadow" aria-hidden="true">🍽️</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" aria-hidden="true" />
                {isAlreadyOrdered && (
                    <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-white text-[var(--success)] text-[10px] font-bold shadow">
                        <CheckCircle size={10} aria-hidden="true" /> Ordered today
                    </span>
                )}
            </div>
            <div className="p-3 flex flex-col gap-2 flex-1">
                <h3 className="text-[13px] font-semibold text-[var(--text)] leading-tight line-clamp-2">{meal.name}</h3>
                <p className="text-[11px] text-[var(--muted)] line-clamp-2 flex-1">{meal.description}</p>
                <div className="flex flex-wrap gap-1">
                    {meal.dietary.map((d: any) => (
                        <span key={d.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[var(--brand-green-tint)] text-[var(--brand-green)] text-[9px] font-semibold">
                            <Leaf size={8} aria-hidden="true" /> {d.label}
                        </span>
                    ))}
                    {meal.spiceLevel !== "none" && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-[var(--accent-2-soft)] text-[var(--accent-2-hover)] text-[9px] font-semibold">
                            <Flame size={8} aria-hidden="true" /> {spice.label}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[13px] font-bold text-[var(--text)] font-mono-num">{formatNaira(meal.price)}</span>

                    {isAlreadyOrdered ? (
                        <span className="text-[11px] text-[var(--success)] font-medium">Ordered ✓</span>
                    ) : quantityInCart > 0 ? (
                        <div className="flex items-center gap-1.5">
                            <button onClick={onDecrement} className="w-6 h-6 rounded-full border border-[var(--line)] flex items-center justify-center hover:bg-[var(--surface-soft)] text-[var(--muted)]" aria-label={`Remove one ${meal.name}`}>
                                <Minus size={11} />
                            </button>
                            <span className="w-4 text-center text-[12px] font-mono-num">{quantityInCart}</span>
                            <button onClick={onAdd} disabled={disabled} className="w-6 h-6 rounded-full bg-[var(--accent-3)] text-white flex items-center justify-center hover:opacity-90 disabled:opacity-40" aria-label={`Add another ${meal.name}`}>
                                <Plus size={11} />
                            </button>
                        </div>
                    ) : (
                        <Button size="sm" variant="coral" disabled={disabled} onClick={onAdd} className="text-[11px] h-7 px-2.5">
                            {isClosed ? "Closed" : "Add"}
                        </Button>
                    )}
                </div>
            </div>
        </motion.article>
    );
}
