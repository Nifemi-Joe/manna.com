"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// ─── Column definition ────────────────────────────────────
export interface Column<T> {
    key: string;
    header: string;
    render: (row: T) => React.ReactNode;
    sortable?: boolean;
    width?: string;
    align?: "left" | "center" | "right";
    className?: string;
}

export interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    keyExtractor: (row: T) => string;
    sortKey?: string;
    sortDir?: "asc" | "desc";
    onSort?: (key: string) => void;
    onRowClick?: (row: T) => void;
    stickyHeader?: boolean;
    emptyState?: React.ReactNode;
    loading?: boolean;
    className?: string;
    rowClassName?: (row: T) => string;
}

export function Table<T>({
                             columns,
                             data,
                             keyExtractor,
                             sortKey,
                             sortDir,
                             onSort,
                             onRowClick,
                             stickyHeader = true,
                             emptyState,
                             loading = false,
                             className,
                             rowClassName,
                         }: TableProps<T>) {
    return (
        <div
            className={cn(
                "rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden",
                className
            )}
        >
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead
                        className={cn(
                            "bg-[var(--surface-soft)]",
                            stickyHeader && "sticky top-0 z-10"
                        )}
                    >
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                scope="col"
                                style={{ width: col.width }}
                                className={cn(
                                    "px-4 py-3 text-left border-b border-[var(--line)]",
                                    "text-label-xs text-[var(--muted)]",
                                    "whitespace-nowrap select-none",
                                    col.align === "center" && "text-center",
                                    col.align === "right" && "text-right",
                                    col.sortable &&
                                    "cursor-pointer hover:text-[var(--text)] transition-colors",
                                    col.className
                                )}
                                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                                aria-sort={
                                    col.sortable
                                        ? sortKey === col.key
                                            ? sortDir === "asc"
                                                ? "ascending"
                                                : "descending"
                                            : "none"
                                        : undefined
                                }
                            >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                      {col.sortable && (
                          <span className="shrink-0" aria-hidden="true">
                        {sortKey === col.key ? (
                            sortDir === "asc" ? (
                                <ChevronUp size={13} />
                            ) : (
                                <ChevronDown size={13} />
                            )
                        ) : (
                            <ChevronsUpDown size={13} className="opacity-40" />
                        )}
                      </span>
                      )}
                  </span>
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {!loading && data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="p-0">
                                {emptyState ?? (
                                    <div className="py-16 text-center text-[var(--muted)] text-body-s">
                                        No records found.
                                    </div>
                                )}
                            </td>
                        </tr>
                    ) : (
                        data.map((row) => (
                            <tr
                                key={keyExtractor(row)}
                                className={cn(
                                    "border-b border-[var(--line)] last:border-0",
                                    "transition-colors duration-[120ms]",
                                    onRowClick &&
                                    "cursor-pointer hover:bg-[var(--surface-soft)]",
                                    rowClassName?.(row)
                                )}
                                onClick={onRowClick ? () => onRowClick(row) : undefined}
                            >
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={cn(
                                            "px-4 py-3 text-body-s text-[var(--text)]",
                                            "whitespace-nowrap",
                                            col.align === "center" && "text-center",
                                            col.align === "right" && "text-right",
                                            col.className
                                        )}
                                    >
                                        {col.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Pagination ───────────────────────────────────────────
export interface PaginationProps {
    page: number;
    total: number;
    perPage: number;
    onChange: (page: number) => void;
}

export function Pagination({ page, total, perPage, onChange }: PaginationProps) {
    const totalPages = Math.ceil(total / perPage);
    if (totalPages <= 1) return null;

    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--line)]">
            <p className="text-body-s text-[var(--muted)]">
                Showing {start}–{end} of {total}
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onChange(page - 1)}
                    disabled={page === 1}
                    className="h-8 px-3 rounded-[var(--radius-md)] text-body-s text-[var(--muted)] hover:bg-[var(--surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                        <button
                            key={p}
                            onClick={() => onChange(p)}
                            className={cn(
                                "h-8 w-8 rounded-[var(--radius-md)] text-body-s transition-colors",
                                p === page
                                    ? "bg-[var(--accent)] text-white font-semibold"
                                    : "text-[var(--muted)] hover:bg-[var(--surface-soft)]"
                            )}
                            aria-current={p === page ? "page" : undefined}
                        >
                            {p}
                        </button>
                    );
                })}
                <button
                    onClick={() => onChange(page + 1)}
                    disabled={page === totalPages}
                    className="h-8 px-3 rounded-[var(--radius-md)] text-body-s text-[var(--muted)] hover:bg-[var(--surface-soft)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    Next
                </button>
            </div>
        </div>
    );
}