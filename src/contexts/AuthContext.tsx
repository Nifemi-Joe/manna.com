"use client";

import React, {
    createContext,
    useContext,
    useReducer,
    useEffect,
    useCallback,
} from "react";
import { api, ApiError, type User, type Portal } from "@/lib/api";

// ─── State ────────────────────────────────────────────────
interface AuthState {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

type AuthAction =
    | { type: "LOADING" }
    | { type: "SET_USER"; payload: User }
    | { type: "CLEAR_USER" }
    | { type: "SET_ERROR"; payload: string };

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "LOADING":
            return { ...state, isLoading: true, error: null };
        case "SET_USER":
            return {
                user: action.payload,
                isLoading: false,
                isAuthenticated: true,
                error: null,
            };
        case "CLEAR_USER":
            return { user: null, isLoading: false, isAuthenticated: false, error: null };
        case "SET_ERROR":
            return { ...state, isLoading: false, error: action.payload };
        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────
interface AuthContextValue extends AuthState {
    /** Alias for user */
    currentUser: User | null;
    portal: Portal | null;
    permissions: string[];
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
    hasPermission: (key: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, {
        user: null,
        isLoading: true,
        isAuthenticated: false,
        error: null,
    });

    const refreshUser = useCallback(async () => {
        dispatch({ type: "LOADING" });
        try {
            const user = await api.access.me();
            dispatch({ type: "SET_USER", payload: user });
        } catch (err) {
            if (err instanceof ApiError && err.status === 401) {
                dispatch({ type: "CLEAR_USER" });
            } else {
                dispatch({ type: "SET_ERROR", payload: "Failed to load session" });
                dispatch({ type: "CLEAR_USER" });
            }
        }
    }, []);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    const logout = useCallback(async () => {
        try {
            await fetch("/api/v1/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } finally {
            dispatch({ type: "CLEAR_USER" });
            window.location.href = "/login";
        }
    }, []);

    const hasPermission = useCallback(
        (key: string) => state.user?.permissions.includes(key) ?? false,
        [state.user]
    );

    const value: AuthContextValue = {
        ...state,
        portal: state.user?.portal ?? null,
        currentUser: state.user ?? null,
        permissions: state.user?.permissions ?? [],
        logout,
        refreshUser,
        hasPermission,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}