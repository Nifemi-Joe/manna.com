'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ArrowRightLeft, X, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatNaira } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface Alternative {
    id: string;
    name: string;
    price: number;
}

interface SwapOrder {
    id: string;
    mealName: string;
    date: string;
    swapReason: string;
    swapAlternatives: Alternative[];
}

/**
 * This is the actual employee-facing half of "admin flags a meal
 * unavailable → employee swaps or cancels." Drop this at the top of
 * the Employee Orders page (and/or Menu page) — it fetches the
 * person's own orders, finds any with needsSwap=true, and shows a
 * banner per affected order until they resolve it.
 */
export function SwapNeededBanner() {
    const [swapOrders, setSwapOrders] = useState<SwapOrder[]>([]);
    const [activeOrder, setActiveOrder] = useState<SwapOrder | null>(null);
    const [resolving, setResolving] = useState(false);

    async function load() {
        try {
            const res = await fetch('/api/v1/orders/me', { credentials: 'include' });
            const data = await res.json();
            const needingSwap = (data.orders ?? []).filter((o: any) => o.needsSwap);
            setSwapOrders(
                needingSwap.map((o: any) => ({
                    id: o.id,
                    mealName: o.mealName,
                    date: o.date,
                    swapReason: o.swapReason ?? `${o.mealName} is no longer available`,
                    swapAlternatives: o.swapAlternatives ?? [],
                }))
            );
        } catch {
            // Silent — this banner is a bonus surface, not critical path;
            // the notification bell and email already carry the message.
        }
    }

    useEffect(() => { load(); }, []);

    async function handleSwap(orderId: string, newMealId: string) {
        setResolving(true);
        try {
            const res = await fetch(`/api/v1/orders/${orderId}/swap`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newMealId }),
            });
            const data = await res.json();
            if (!res.ok) { toast.error(data?.message ?? 'Could not swap'); return; }

            if (data.requiresTopUp) {
                toast.success(`Swapped — you'll need to pay ${formatNaira(data.topUpAmount)} extra`, { duration: 6000 });
            } else {
                toast.success('Swapped successfully');
            }
            setActiveOrder(null);
            setSwapOrders((prev) => prev.filter((o) => o.id !== orderId));
        } catch {
            toast.error('Could not reach the server');
        } finally {
            setResolving(false);
        }
    }

    async function handleCancel(orderId: string) {
        setResolving(true);
        try {
            const res = await fetch(`/api/v1/orders/${orderId}/cancel`, { method: 'PATCH', credentials: 'include' });
            if (!res.ok) { toast.error('Could not cancel'); return; }
            toast.success('Order cancelled');
            setActiveOrder(null);
            setSwapOrders((prev) => prev.filter((o) => o.id !== orderId));
        } catch {
            toast.error('Could not reach the server');
        } finally {
            setResolving(false);
        }
    }

    if (swapOrders.length === 0) return null;

    return (
        <>
            <div className="space-y-2 mb-4">
                {swapOrders.map((order) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 px-4 py-3 bg-[var(--accent-3-soft)] border border-[var(--accent-3)]/30 rounded-[var(--radius-lg)]"
                    >
                        <AlertTriangle size={18} className="text-[var(--accent-3)] shrink-0" />
                        <div className="flex-1 min-w-0">
                            <p className="text-body-s font-semibold text-[var(--text)]">{order.swapReason}</p>
                            <p className="text-label-xs text-[var(--muted)]">Choose an alternative or cancel this order</p>
                        </div>
                        <Button size="sm" variant="coral" onClick={() => setActiveOrder(order)}>Resolve</Button>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {activeOrder && (
                    <>
                        <motion.div className="fixed inset-0 bg-black/50 z-40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveOrder(null)} />
                        <motion.div
                            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="relative w-full md:max-w-md bg-[var(--surface)] rounded-t-[var(--radius-xl)] md:rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-xl)]"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                                onClick={(e) => e.stopPropagation()}
                                role="dialog"
                                aria-modal="true"
                            >
                                <button onClick={() => setActiveOrder(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)]" aria-label="Close">
                                    <X size={18} />
                                </button>

                                <div className="mb-5">
                                    <h2 className="text-heading-s text-[var(--text)] flex items-center gap-2">
                                        <ArrowRightLeft size={18} className="text-[var(--accent-3)]" />
                                        Choose an alternative
                                    </h2>
                                    <p className="text-body-s text-[var(--muted)] mt-1">{activeOrder.swapReason}</p>
                                </div>

                                <div className="space-y-2 mb-5">
                                    {activeOrder.swapAlternatives.map((alt) => (
                                        <button
                                            key={alt.id}
                                            disabled={resolving}
                                            onClick={() => handleSwap(activeOrder.id, alt.id)}
                                            className="w-full flex items-center justify-between p-3 rounded-[var(--radius-lg)] border border-[var(--line)] hover:border-[var(--accent-2)] hover:bg-[var(--accent-2-soft)] transition-colors text-left disabled:opacity-50"
                                        >
                                            <span className="text-body-s font-medium text-[var(--text)]">{alt.name}</span>
                                            <span className="text-body-s font-mono-num text-[var(--muted)]">{formatNaira(alt.price)}</span>
                                        </button>
                                    ))}
                                </div>

                                <Button variant="ghost" fullWidth disabled={resolving} onClick={() => handleCancel(activeOrder.id)} className="text-[var(--danger)] hover:bg-[var(--danger-bg)]">
                                    Cancel this order instead
                                </Button>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
