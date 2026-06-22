"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Flag, CheckCircle, Truck } from "lucide-react";
import { api, ApiError, type Delivery, type DeliveryStatus } from "@/lib/api";
import { DeliveryStatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Table, type Column } from "@/components/ui/Table";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUSES: DeliveryStatus[] = ["scheduled", "packed", "dispatched", "delivered", "failed"];

export default function OpsDispatchPage() {
    const [deliveries, setDeliveries] = useState<Delivery[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<DeliveryStatus | "">("");
    const [companyFilter, setCompanyFilter] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [updating, setUpdating] = useState<string | null>(null);

    const loadDeliveries = useCallback(() => {
        setLoading(true);
        api.ops.deliveries
            .list({ status: statusFilter || undefined, company: companyFilter || undefined })
            .then((res: any) => {
                setDeliveries(res.deliveries);
                setTotal(res.total);
            })
            .catch(() => null)
            .finally(() => setLoading(false));
    }, [statusFilter, companyFilter]);

    useEffect(() => { loadDeliveries(); }, [loadDeliveries]);

    const updateStatus = async (id: string, status: DeliveryStatus) => {
        setUpdating(id);
        try {
            const { delivery } = await api.ops.deliveries.update(id, { status });
            setDeliveries((prev) =>
                prev.map((d) => (d.id === id ? delivery : d))
            );
            toast.success(`Marked as ${status}`);
        } catch (err: any) {
            toast.error(err instanceof ApiError ? err.message : "Update failed");
        } finally {
            setUpdating(null);
        }
    };

    const companies = [...new Set(deliveries.map((d) => d.companyName))];

    const columns: Column<Delivery>[] = [
        {
            key: "sel",
            header: "",
            width: "40px",
            render: (r) => (
                <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={(e) => {
                        const next = new Set(selected);
                        if (e.target.checked) next.add(r.id);
                        else next.delete(r.id);
                        setSelected(next);
                    }}
                    aria-label={`Select delivery for ${r.employeeName}`}
                    className="w-4 h-4 accent-[var(--accent)]"
                />
            ),
        },
        {
            key: "company",
            header: "Company",
            sortable: true,
            render: (r) => (
                <span className="font-medium text-[var(--text)]">{r.companyName}</span>
            ),
        },
        {
            key: "employee",
            header: "Employee",
            render: (r) => r.employeeName,
        },
        {
            key: "meal",
            header: "Meal",
            render: (r) => (
                <div>
                    <span>{r.mealName}</span>
                    {r.dietary.length > 0 && (
                        <span className="ml-2 text-[10px] text-[var(--brand-green)] font-semibold">
              {r.dietary.map((d: any) => d.label).join(" · ")}
            </span>
                    )}
                </div>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (r) => <DeliveryStatusBadge status={r.status} />,
        },
        {
            key: "updated",
            header: "Last updated",
            render: (r) => (
                <span className="text-[var(--muted)]">{formatDateTime(r.updatedAt)}</span>
            ),
        },
        {
            key: "actions",
            header: "Action",
            align: "right",
            render: (r) => (
                <div className="flex items-center gap-1.5 justify-end">
                    {r.status === "packed" && (
                        <Button
                            size="sm"
                            variant="outline"
                            loading={updating === r.id}
                            onClick={() => updateStatus(r.id, "dispatched")}
                            leadingIcon={<Truck size={13} />}
                            className="text-[11px]"
                        >
                            Dispatch
                        </Button>
                    )}
                    {r.status === "dispatched" && (
                        <Button
                            size="sm"
                            variant="filled"
                            loading={updating === r.id}
                            onClick={() => updateStatus(r.id, "delivered")}
                            leadingIcon={<CheckCircle size={13} />}
                            className="text-[11px]"
                        >
                            Delivered
                        </Button>
                    )}
                    {r.status !== "failed" && r.status !== "delivered" && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => updateStatus(r.id, "failed")}
                            leadingIcon={<Flag size={13} />}
                            className="text-[11px] text-[var(--warning)]"
                            aria-label={`Flag delivery for ${r.employeeName} as failed`}
                        >
                            Flag
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4 max-w-7xl">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-heading-s text-[var(--text)]">Dispatch</h1>
                    <p className="text-body-s text-[var(--muted)] mt-0.5">
                        {total} deliveries today
                    </p>
                </div>
            </div>

            {/* Status chips */}
            <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by status">
                <button
                    onClick={() => setStatusFilter("")}
                    className={cn(
                        "px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors",
                        !statusFilter
                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                            : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    )}
                >
                    All ({total})
                </button>
                {STATUSES.map((s) => {
                    const count = deliveries.filter((d) => d.status === s).length;
                    return (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-colors capitalize",
                                statusFilter === s
                                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                                    : "bg-[var(--surface)] text-[var(--muted)] border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                            )}
                        >
                            {s} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Company filter */}
            {companies.length > 1 && (
                <select
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                    className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s"
                    aria-label="Filter by company"
                >
                    <option value="">All companies</option>
                    {companies.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            )}

            {/* Bulk action bar */}
            {selected.size > 0 && (
                <div className="flex items-center gap-3 px-4 py-3 bg-[var(--accent)]/10 rounded-[var(--radius-lg)] border border-[var(--accent)]/20">
          <span className="text-body-s font-semibold text-[var(--accent)]">
            {selected.size} selected
          </span>
                    <Button
                        size="sm"
                        variant="filled"
                        onClick={async () => {
                            for (const id of selected) await updateStatus(id, "dispatched");
                            setSelected(new Set());
                        }}
                    >
                        Mark all dispatched
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                        Clear
                    </Button>
                </div>
            )}

            {loading ? (
                <SkeletonTable rows={8} cols={7} />
            ) : (
                <Table
                    columns={columns}
                    data={deliveries}
                    keyExtractor={(r) => r.id}
                    emptyState={
                        <EmptyState
                            illustration="no-deliveries"
                            heading="No deliveries match this filter"
                            description="Try clearing the filters to see all deliveries."
                        />
                    }
                />
            )}
        </div>
    );
}