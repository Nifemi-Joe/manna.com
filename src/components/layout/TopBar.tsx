"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { NotificationsBell } from "@/components/ui/NotificationsBell";

interface TopBarProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
}

/** Detects which portal segment we're in so Settings/Profile can link
 to a route that actually exists (/hr/settings, /ops/settings, etc)
 instead of the old hardcoded /settings and /profile, which had no
 matching page anywhere and always 404'd. */
function getPortalFromPath(pathname: string): string {
    if (pathname.startsWith("/employee")) return "employee";
    if (pathname.startsWith("/hr")) return "hr";
    if (pathname.startsWith("/ops")) return "ops";
    if (pathname.startsWith("/admin")) return "admin";
    if (pathname.startsWith("/studio")) return "studio";
    return "";
}

export function TopBar({ title, subtitle, actions, className }: TopBarProps) {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const portal = getPortalFromPath(pathname ?? "");
    const settingsHref = portal ? `/${portal}/settings` : "/employee/settings";

    return (
        <header
            className={cn(
                "relative sticky top-0 z-40 h-16 flex items-center gap-4 px-6",
                "bg-[var(--surface)] border-b border-[var(--line)]",
                "shadow-[var(--shadow-sm)]",
                className
            )}
        >
            <span
                className="absolute left-0 right-0 top-0 h-[3px]"
                style={{ background: "linear-gradient(90deg, var(--brand-green), var(--accent-2), var(--accent-3))" }}
                aria-hidden="true"
            />

            {(title || subtitle) && (
                <div className="flex-1 min-w-0">
                    {title && <h1 className="text-[15px] font-semibold text-[var(--text)] truncate">{title}</h1>}
                    {subtitle && <p className="text-[12px] text-[var(--muted)] truncate">{subtitle}</p>}
                </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
                {actions}

                <NotificationsBell />

                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-[var(--radius-md)] hover:bg-[var(--surface-soft)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent-2)]"
                            aria-expanded={menuOpen}
                            aria-haspopup="menu"
                        >
                            <span
                                className="w-7 h-7 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                                style={{ background: "linear-gradient(135deg, var(--brand-green), var(--brand-green-dark))" }}
                                aria-hidden="true"
                            >
                                {getInitials(user.name)}
                            </span>
                            <span className="text-body-s font-medium text-[var(--text)] hidden sm:block">{user.name.split(" ")[0]}</span>
                            <ChevronDown size={14} className={cn("text-[var(--muted)] transition-transform duration-[160ms]", menuOpen && "rotate-180")} aria-hidden="true" />
                        </button>

                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
                                <div
                                    role="menu"
                                    className="absolute right-0 top-full mt-1 w-56 z-50 bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)] shadow-[var(--shadow-lg)] py-1"
                                >
                                    <div className="px-3 py-2 border-b border-[var(--line)]">
                                        <p className="text-[13px] font-semibold text-[var(--text)] truncate">{user.name}</p>
                                        <p className="text-[11px] text-[var(--muted)] truncate">{user.email}</p>
                                    </div>
                                    {/* FIXED: both Settings and Profile used to point at hardcoded
                                        /settings and /profile, neither of which exist as a route
                                        anywhere — always 404'd. Both now go to a real, portal-aware
                                        settings page. */}
                                    <MenuItem href={settingsHref} icon={<Settings size={14} />} label="Settings" onClick={() => setMenuOpen(false)} />
                                    <div className="border-t border-[var(--line)] mt-1 pt-1">
                                        <button
                                            role="menuitem"
                                            onClick={() => { setMenuOpen(false); logout(); }}
                                            className="w-full flex items-center gap-2.5 px-3 py-2 text-body-s text-[var(--danger)] hover:bg-[var(--danger-bg)] transition-colors"
                                        >
                                            <LogOut size={14} aria-hidden="true" />
                                            Sign out
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
}

function MenuItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <Link href={href} role="menuitem" onClick={onClick} className="flex items-center gap-2.5 px-3 py-2 text-body-s text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors">
            <span className="text-[var(--muted)]" aria-hidden="true">{icon}</span>
            {label}
        </Link>
    );
}
