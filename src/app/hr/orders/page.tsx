"use client";

import React, { useState, useEffect } from "react";
import { Download, Search, Filter } from "lucide-react";
import { api, type HROrder, type OrderStatus } from "@/lib/api";
import { formatDate, formatNaira } from "@/lib/utils";
import { OrderStatusBadge } from "@/components/ui/Badge";
import { Table, type Column, Pagination } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_OPTIONS: Array<{ value: OrderStatus | ""; label: string }> = [
    { value: "", label: "All statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

export default function HROrdersPage() {
    const [orders, setOrders] = useState<HROrder[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<OrderStatus | "">("");
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("date");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const perPage = 20;

    useEffect(() => {
        setLoading(true);
        api.hr
            .orders({
                page,
                perPage,
                status: status || undefined,
            })
            .then((res: any) => {
                setOrders(res.orders);
                setTotal(res.total);
            })
            .catch(() => null)
            .finally(() => setLoading(false));
    }, [page, status]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
    };

    const filtered = orders.filter(
        (o) =>
            !search ||
            o.employeeName.toLowerCase().includes(search.toLowerCase()) ||
            o.mealName.toLowerCase().includes(search.toLowerCase())
    );

    const columns: Column<HROrder>[] = [
        {
            key: "date",
            header: "Date",
            sortable: true,
            render: (r) => (
                <span className="text-[var(--muted)]">{formatDate(r.date)}</span>
            ),
        },
        {
            key: "employee",
            header: "Employee",
            sortable: true,
            render: (r) => (
                <div>
                    <p className="font-medium text-[var(--text)]">{r.employeeName}</p>
                    <p className="text-[11px] text-[var(--muted)]">{r.employeeEmail}</p>
                </div>
            ),
        },
        {
            key: "meal",
            header: "Meal",
            render: (r) => r.mealName,
        },
        {
            key: "department",
            header: "Dept",
            render: (r) => r.department ?? "—",
        },
        {
            key: "status",
            header: "Status",
            render: (r) => <OrderStatusBadge status={r.status} />,
        },
        {
            key: "amount",
            header: "Amount",
            align: "right",
            sortable: true,
            render: (r) => (
                <span className="font-medium">{formatNaira(r.totalAmount)}</span>
            ),
        },
    ];

    const exportCSV = () => {
        const rows = [
            ["Date", "Employee", "Email", "Department", "Meal", "Status", "Amount"],
            ...filtered.map((o) => [
                formatDate(o.date),
                o.employeeName,
                o.employeeEmail,
                o.department ?? "",
                o.mealName,
                o.status,
                o.totalAmount,
            ]),
        ];
        const csv = rows.map((r) => r.join(",")).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
        a.download = `manna-orders-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
    };

    return (
        <div className="space-y-5 max-w-6xl">
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-heading-m text-[var(--text)]">Orders</h1>
                    <p className="text-body-s text-[var(--muted)] mt-1">
                        {total} total orders
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    leadingIcon={<Download size={14} />}
                    onClick={exportCSV}
                >
                    Export CSV
                </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-xs">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        placeholder="Search employee or meal…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:border-[var(--accent)] focus:outline-none"
                        aria-label="Search orders"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-[var(--muted)]" aria-hidden="true" />
                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value as OrderStatus | "");
                            setPage(1);
                        }}
                        className="h-9 px-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-body-s focus:border-[var(--accent)] focus:outline-none"
                        aria-label="Filter by status"
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <SkeletonTable rows={8} cols={6} />
            ) : (
                <>
                    <Table
                        columns={columns}
                        data={filtered}
                        keyExtractor={(r) => r.id}
                        sortKey={sortKey}
                        sortDir={sortDir}
                        onSort={handleSort}
                        emptyState={
                            <EmptyState
                                illustration="no-orders"
                                heading="No orders found"
                                description="Adjust your filters to see results."
                            />
                        }
                    />
                    <Pagination
                        page={page}
                        total={total}
                        perPage={perPage}
                        onChange={setPage}
                    />
                </>
            )}
        </div>
    );
}