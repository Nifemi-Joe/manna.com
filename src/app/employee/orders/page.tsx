"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { api, ApiError, type Order } from "@/lib/api";
import { formatDate, formatNaira } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function EmployeeOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [cancelTarget, setCancelTarget] = useState<Order | null>(null);
    const [cancelling, setCancelling] = useState(false);

    useEffect(() => {
        api.employee.orders
            .list()
            .then((res) => setOrders(res.orders))
            .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load orders"))
            .finally(() => setLoading(false));
    }, []);

    const handleCancel = async () => {
        if (!cancelTarget) return;
        setCancelling(true);
        try {
            await api.employee.orders.cancel(cancelTarget.id);
            setOrders((prev) =>
                prev.map((o) => (o.id === cancelTarget.id ? { ...o, status: "cancelled", cancellable: false } : o))
            );
            toast.success("Order cancelled.");
        } catch (err) {
            toast.error(err instanceof ApiError ? err.message : "Couldn't cancel order.");
        } finally {
            setCancelling(false);
            setCancelTarget(null);
        }
    };

    return (
        <div className="page-wash min-h-full">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                <h1 className="text-heading-m text-[var(--text)]">My orders</h1>

                {loading && <SkeletonTable rows={5} cols={4} />}

                {!loading && error && (
                    <EmptyState
                        illustration="error"
                        heading="Couldn't load orders"
                        description={error}
                        action={
                            <Button variant="outline" onClick={() => window.location.reload()}>
                                Retry
                            </Button>
                        }
                    />
                )}

                {!loading && !error && orders.length === 0 && (
                    <EmptyState
                        illustration="no-orders"
                        heading="No orders yet"
                        description="Place your first order from today's menu."
                        action={
                            <Button variant="coral" onClick={() => (window.location.href = "/employee/menu")}>
                                Browse menu
                            </Button>
                        }
                    />
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-2">
                        {orders.map((order) => (
                            <OrderRow
                                key={order.id}
                                order={order}
                                expanded={expandedId === order.id}
                                onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                                onCancel={() => setCancelTarget(order)}
                            />
                        ))}
                    </div>
                )}

                <ConfirmDialog
                    open={!!cancelTarget}
                    onClose={() => setCancelTarget(null)}
                    onConfirm={handleCancel}
                    title="Cancel order"
                    description={`Cancel "${cancelTarget?.mealName}"? This can't be undone.`}
                    confirmLabel="Cancel order"
                    cancelLabel="Keep order"
                    loading={cancelling}
                />
            </div>
        </div>
    );
}

const STATUS_ACCENT: Record<string, string> = {
    pending: "var(--accent-2)",
    confirmed: "var(--brand-green)",
    delivered: "var(--success)",
    cancelled: "var(--muted)",
};

function OrderRow({
                      order,
                      expanded,
                      onToggle,
                      onCancel,
                  }: {
    order: Order;
    expanded: boolean;
    onToggle: () => void;
    onCancel: () => void;
}) {
    const accent = STATUS_ACCENT[order.status] ?? "var(--line-strong)";

    return (
        <div
            className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] overflow-hidden"
            style={{ borderLeft: `3px solid ${accent}` }}
        >
            <button
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-[var(--surface-soft)] transition-colors"
                onClick={onToggle}
                aria-expanded={expanded}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold text-[var(--text)]">{order.mealName}</span>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-body-s text-[var(--muted)] mt-0.5">
                        {formatDate(order.date)} · <span className="font-mono-num">{formatNaira(order.totalAmount)}</span>
                    </p>
                </div>
                <ChevronDown
                    size={16}
                    className={cn("text-[var(--muted)] transition-transform duration-200 shrink-0", expanded && "rotate-180")}
                    aria-hidden="true"
                />
            </button>

            <motion.div
                initial={false}
                animate={{ height: expanded ? "auto" : 0, opacity: expanded ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
            >
                <div className="px-4 pb-4 pt-0 border-t border-[var(--line)] bg-[var(--surface-soft)]">
                    <div className="grid grid-cols-2 gap-3 pt-4 text-body-s">
                        <div>
                            <p className="text-[var(--muted)]">Company covered</p>
                            <p className="text-[var(--text)] font-medium font-mono-num">{formatNaira(order.allowanceCovered)}</p>
                        </div>
                        <div>
                            <p className="text-[var(--muted)]">You paid</p>
                            <p className="text-[var(--text)] font-medium font-mono-num">{formatNaira(order.employeePaid)}</p>
                        </div>
                        {order.notes && (
                            <div className="col-span-2">
                                <p className="text-[var(--muted)]">Notes</p>
                                <p className="text-[var(--text)]">{order.notes}</p>
                            </div>
                        )}
                    </div>

                    {order.cancellable && (
                        <div className="mt-4">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={onCancel}
                                leadingIcon={<X size={14} />}
                                className="text-[var(--danger)] border-[var(--danger)] hover:bg-[var(--danger-bg)]"
                            >
                                Cancel order
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
