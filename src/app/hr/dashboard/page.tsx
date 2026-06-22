"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown, Users, ShoppingBag, AlertCircle, Percent, Upload, Sliders, FileText } from "lucide-react";
import { api, type HROrdersResponse } from "@/lib/api";
import { formatNaira } from "@/lib/utils";
import { SkeletonKPI } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface KPI {
    label: string;
    value: string;
    trend: number;
    trendLabel: string;
    icon: React.ReactNode;
    color: string;
}

export default function HRDashboardPage() {
    const [data, setData] = useState<HROrdersResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.hr.orders({ perPage: 100 })
            .then(setData)
            .catch(() => null)
            .finally(() => setLoading(false));
    }, []);

    const totalOrders = data?.total ?? 0;
    const totalSpend = data?.totalAmount ?? 0;
    const budget = 250000; // Would come from rules API

    const kpis: KPI[] = [
        {
            label: "Orders Today",
            value: String(totalOrders),
            trend: 12,
            trendLabel: "vs yesterday",
            icon: <ShoppingBag size={20} />,
            color: "text-[var(--accent)]",
        },
        {
            label: "Spend vs Budget",
            value: `${Math.round((totalSpend / budget) * 100)}%`,
            trend: -5,
            trendLabel: "vs last week",
            icon: <Percent size={20} />,
            color: "text-[var(--brand-green)]",
        },
        {
            label: "Participation",
            value: "78%",
            trend: 3,
            trendLabel: "vs last week",
            icon: <Users size={20} />,
            color: "text-[var(--accent-2)]",
        },
        {
            label: "Open Issues",
            value: "2",
            trend: 0,
            trendLabel: "no change",
            icon: <AlertCircle size={20} />,
            color: "text-[var(--warning)]",
        },
    ];

    return (
        <div className="space-y-6 max-w-6xl">
            <div>
                <h1 className="text-heading-m text-[var(--text)]">Dashboard</h1>
                <p className="text-body-s text-[var(--muted)] mt-1">
                    What needs your attention today.
                </p>
            </div>

            {/* KPI grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonKPI key={i} />)
                    : kpis.map((kpi) => <KPICard key={kpi.label} kpi={kpi} />)}
            </div>

            {/* Quick actions */}
            <div>
                <h2 className="text-[15px] font-semibold text-[var(--text)] mb-3 font-[var(--font-sans)]">
                    Quick actions
                </h2>
                <div className="flex flex-wrap gap-3">
                    <Link href="/hr/employees">
                        <Button variant="outline" size="sm" leadingIcon={<Upload size={14} />}>
                            Upload Employees CSV
                        </Button>
                    </Link>
                    <Link href="/hr/rules">
                        <Button variant="outline" size="sm" leadingIcon={<Sliders size={14} />}>
                            Set Allowance
                        </Button>
                    </Link>
                    <Link href="/hr/billing">
                        <Button variant="outline" size="sm" leadingIcon={<FileText size={14} />}>
                            View Invoice
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Recent orders */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[15px] font-semibold text-[var(--text)] font-[var(--font-sans)]">
                        Recent orders
                    </h2>
                    <Link href="/hr/orders" className="text-body-s text-[var(--accent)] hover:underline">
                        View all
                    </Link>
                </div>
                {loading ? (
                    <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] p-8 text-center">
                        <div className="animate-pulse space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-4 bg-[var(--line)] rounded w-full" />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] overflow-hidden">
                        {data?.orders.slice(0, 5).map((order: any, i: any) => (
                            <div
                                key={order.id}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-3 text-body-s",
                                    i < (data?.orders.length ?? 0) - 1 && "border-b border-[var(--line)]"
                                )}
                            >
                                <div className="flex-1">
                  <span className="font-medium text-[var(--text)]">
                    {order.employeeName}
                  </span>
                                    <span className="text-[var(--muted)]"> · {order.mealName}</span>
                                </div>
                                <span className="text-[var(--muted)] hidden sm:block">
                  {order.department ?? "—"}
                </span>
                                <span className="font-medium text-[var(--text)]">
                  {formatNaira(order.totalAmount)}
                </span>
                            </div>
                        ))}
                        {(!data || data.orders.length === 0) && (
                            <p className="px-5 py-8 text-center text-body-s text-[var(--muted)]">
                                No orders yet today.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function KPICard({ kpi }: { kpi: KPI }) {
    const isPositive = kpi.trend > 0;
    const isNeutral = kpi.trend === 0;

    return (
        <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] p-5 space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-label-xs text-[var(--muted)]">{kpi.label}</p>
                <span className={cn("opacity-60", kpi.color)}>{kpi.icon}</span>
            </div>
            <p className={cn("text-display-l", kpi.color)}>{kpi.value}</p>
            <div className="flex items-center gap-1.5">
                {!isNeutral && (
                    <>
                        {isPositive ? (
                            <TrendingUp size={13} className="text-[var(--success)]" aria-hidden="true" />
                        ) : (
                            <TrendingDown size={13} className="text-[var(--danger)]" aria-hidden="true" />
                        )}
                        <span
                            className={cn(
                                "text-[11px] font-semibold",
                                isPositive ? "text-[var(--success)]" : "text-[var(--danger)]"
                            )}
                        >
              {isPositive ? "+" : ""}{kpi.trend}%
            </span>
                    </>
                )}
                <span className="text-[11px] text-[var(--muted)]">{kpi.trendLabel}</span>
            </div>
        </div>
    );
}