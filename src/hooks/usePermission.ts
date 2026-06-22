"use client";

import { useAuth } from "@/contexts/AuthContext";

export function usePermission(key: string): boolean {
    const { hasPermission } = useAuth();
    return hasPermission(key);
}