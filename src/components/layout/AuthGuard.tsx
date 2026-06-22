"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { Portal } from "@/lib/api";
import { PageSpinner } from "@/components/ui/Spinner";

/**
 * The minimum permission required to enter each portal's routes.
 * Mirrors the first/most-permissive `req.requirePermission(...)` check
 * each portal's backend routes actually use (see src/routes/*.ts) — so
 * the frontend gate and the backend's real enforcement agree.
 *
 * IMPORTANT: this is deliberately NOT a `user.portal === portal` string
 * match. A user's `portal` field is just their default landing page —
 * it does not define what they're allowed to access. Authorization is
 * permission-based: anyone holding the required permission (e.g. a
 * Super Admin, who holds every permission) can enter any portal, exactly
 * as the backend already allows.
 */
const PORTAL_REQUIRED_PERMISSION: Record<Portal, string> = {
    employee: "orders:read",
    hr: "employees:read",
    ops: "deliveries:read",
    admin: "companies:read",
    studio: "content:read",
};

interface AuthGuardProps {
    portal: Portal;
    children: React.ReactNode;
}

export function AuthGuard({ portal, children }: AuthGuardProps) {
    const { isLoading, isAuthenticated, hasPermission } = useAuth();
    const router = useRouter();

    const requiredPermission = PORTAL_REQUIRED_PERMISSION[portal];
    const authorized = hasPermission(requiredPermission);

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        if (!authorized) {
            router.replace("/403");
        }
    }, [isLoading, isAuthenticated, authorized, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--surface-soft)]">
                <PageSpinner />
            </div>
        );
    }

    if (!isAuthenticated || !authorized) {
        return null;
    }

    return <>{children}</>;
}