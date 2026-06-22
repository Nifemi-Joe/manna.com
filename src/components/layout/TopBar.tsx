"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface TopBarProps {
    title?: string;
    subtitle?: string;
    actions?: React.ReactNode;
    className?: string;
}

export function TopBar({ title, subtitle, actions, className }: TopBarProps) {
    const { user, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <header
            className={cn(
                "sticky top-0 z-40 h-16 flex items-center gap-4 px-6",
                "bg-[var(--surface)] border-b border-[var(--line)]",
                "shadow-[var(--shadow-xs)]",
                className
            )}
        >
            {/* Title area */}
            {(title || subtitle) && (
                <div className="flex-1 min-w-0">
                    {title && (
                        <h1 className="text-[15px] font-semibold text-[var(--text)] truncate font-[var(--font-sans)]">
                            {title}
                        </h1>
                    )}
                    {subtitle && (
                        <p className="text-[12px] text-[var(--muted)] truncate">{subtitle}</p>
                    )}
                </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
                {actions}

                {/* Notification bell */}
                <button
                    className="relative w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                    aria-label="Notifications"
                >
                    <Bell size={18} />
                </button>

                {/* Avatar menu */}
                {user && (
                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen((o) => !o)}
                            className="flex items-center gap-2 h-9 pl-1 pr-2 rounded-[var(--radius-md)] hover:bg-[var(--surface-soft)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                            aria-expanded={menuOpen}
                            aria-haspopup="menu"
                        >
              <span
                  className="w-7 h-7 rounded-full bg-[var(--brand-green)] text-white text-[11px] font-bold flex items-center justify-center shrink-0"
                  aria-hidden="true"
              >
                {getInitials(user.name)}
              </span>
                            <span className="text-body-s font-medium text-[var(--text)] hidden sm:block">
                {user.name.split(" ")[0]}
              </span>
                            <ChevronDown
                                size={14}
                                className={cn(
                                    "text-[var(--muted)] transition-transform duration-[160ms]",
                                    menuOpen && "rotate-180"
                                )}
                                aria-hidden="true"
                            />
                        </button>

                        {menuOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setMenuOpen(false)}
                                    aria-hidden="true"
                                />
                                <div
                                    role="menu"
                                    className={cn(
                                        "absolute right-0 top-full mt-1 w-56 z-50",
                                        "bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--line)]",
                                        "shadow-[var(--shadow-lg)] py-1"
                                    )}
                                >
                                    <div className="px-3 py-2 border-b border-[var(--line)]">
                                        <p className="text-[13px] font-semibold text-[var(--text)] truncate">
                                            {user.name}
                                        </p>
                                        <p className="text-[11px] text-[var(--muted)] truncate">{user.email}</p>
                                    </div>
                                    <MenuItem href="/settings" icon={<Settings size={14} />} label="Settings" onClick={() => setMenuOpen(false)} />
                                    <MenuItem href="/profile" icon={<User size={14} />} label="Profile" onClick={() => setMenuOpen(false)} />
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

function MenuItem({
                      href,
                      icon,
                      label,
                      onClick,
                  }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            role="menuitem"
            onClick={onClick}
            className="flex items-center gap-2.5 px-3 py-2 text-body-s text-[var(--text)] hover:bg-[var(--surface-soft)] transition-colors"
        >
      <span className="text-[var(--muted)]" aria-hidden="true">
        {icon}
      </span>
            {label}
        </Link>
    );
}