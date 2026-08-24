"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, PackageX, UserPlus, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NotificationItem {
    id: string;
    title: string;
    body: string;
    createdAt: string;
    read: boolean;
    kind: "lead" | "issue" | "order" | "system";
    link?: string;
}

const KIND_ICON: Record<NotificationItem["kind"], React.ReactNode> = {
    lead: <UserPlus size={14} />,
    issue: <AlertTriangle size={14} />,
    order: <PackageX size={14} />,
    system: <Bell size={14} />,
};

const KIND_TINT: Record<NotificationItem["kind"], string> = {
    lead: "var(--accent-2)",
    issue: "var(--danger)",
    order: "var(--brand-green)",
    system: "var(--muted)",
};

function timeAgo(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

/**
 * Wired to the real backend now — GET /api/v1/notifications on open
 * (and once on mount, for the unread dot), PATCH .../:id/read on click,
 * POST .../read-all for "mark all read". Previously this rendered an
 * honest empty state because there was no backend at all; there is now.
 */
export function NotificationsBell() {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    async function load() {
        setLoading(true);
        try {
            const res = await fetch("/api/v1/notifications", { credentials: "include" });
            if (!res.ok) return;
            const data = await res.json();
            setItems(data.notifications ?? []);
            setUnreadCount(data.unreadCount ?? 0);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        const interval = setInterval(load, 60_000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function onClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("mousedown", onClickOutside);
        return () => document.removeEventListener("mousedown", onClickOutside);
    }, []);

    async function markRead(id: string) {
        setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
        setUnreadCount((c) => Math.max(0, c - 1));
        await fetch(`/api/v1/notifications/${id}/read`, { method: "PATCH", credentials: "include" }).catch(() => {});
    }

    async function markAllRead() {
        setItems((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        await fetch("/api/v1/notifications/read-all", { method: "POST", credentials: "include" }).catch(() => {});
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => { setOpen((o) => !o); if (!open) load(); }}
                className="relative w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--accent-2-soft)] hover:text-[var(--accent-2-hover)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]"
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
                aria-expanded={open}
            >
                <Bell size={18} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[var(--danger)]" />
                )}
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-80 z-50 bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] shadow-[var(--shadow-lg)] overflow-hidden"
                    style={{ borderTop: "3px solid var(--accent-2)" }}
                >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
                        <p className="text-body-s font-semibold text-[var(--text)]">Notifications</p>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-label-xs text-[var(--accent-2-hover)] flex items-center gap-1 hover:underline">
                                <CheckCheck size={12} /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 overflow-y-auto thin-scroll">
                        {loading && items.length === 0 ? (
                            <div className="p-6 space-y-3">
                                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-[var(--surface-soft)] rounded-[var(--radius-md)] animate-pulse" />)}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[var(--surface-soft)] flex items-center justify-center text-[var(--muted)]">
                                    <Bell size={18} />
                                </div>
                                <p className="text-body-s text-[var(--text)] font-medium">You're all caught up</p>
                                <p className="text-label-xs text-[var(--muted)] mt-1">New leads, issues, and orders will show up here.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[var(--line)]">
                                {items.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => !n.read && markRead(n.id)}
                                        className={cn(
                                            "w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-[var(--surface-soft)] transition-colors",
                                            !n.read && "bg-[var(--accent-2-soft)]/40"
                                        )}
                                    >
                                        <span
                                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                            style={{ background: `color-mix(in srgb, ${KIND_TINT[n.kind]} 14%, transparent)`, color: KIND_TINT[n.kind] }}
                                        >
                                            {KIND_ICON[n.kind]}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-body-s font-medium text-[var(--text)]">{n.title}</p>
                                            <p className="text-label-xs text-[var(--muted)] mt-0.5">{n.body}</p>
                                            <p className="text-label-xs text-[var(--muted-soft)] mt-1">{timeAgo(n.createdAt)}</p>
                                        </div>
                                        {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--accent-2)] shrink-0 mt-1.5" aria-hidden="true" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
