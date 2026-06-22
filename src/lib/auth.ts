/**
 * src/lib/auth.ts
 * Session helpers for the Manna frontend.
 *
 * Auth is fully cookie-based (magic-link flow). The server sets an HttpOnly
 * session cookie on verify; we never touch it from JS. These helpers provide
 * client-side utilities that complement AuthContext.
 */

export type Portal = 'employee' | 'hr' | 'ops' | 'admin' | 'studio';

const PORTAL_PATHS: Record<Portal, string> = {
    employee: '/employee/menu',
    hr: '/hr/dashboard',
    ops: '/ops/dispatch',
    admin: '/admin/dashboard',
    studio: '/studio',
};

const PORTAL_LABELS: Record<Portal, string> = {
    employee: 'Employee Portal',
    hr: 'HR Portal',
    ops: 'Ops Portal',
    admin: 'Admin',
    studio: 'Content Studio',
};

/**
 * Return the default landing path for a given portal.
 */
export function getPortalHome(portal: Portal): string {
    return PORTAL_PATHS[portal];
}

/**
 * Return the human-readable label for a portal.
 */
export function getPortalLabel(portal: Portal): string {
    return PORTAL_LABELS[portal];
}

/**
 * Derive which portal the current page belongs to from the pathname.
 * Returns null if we're on a public/auth route.
 */
export function portalFromPathname(pathname: string): Portal | null {
    if (pathname.startsWith('/employee')) return 'employee';
    if (pathname.startsWith('/hr')) return 'hr';
    if (pathname.startsWith('/ops')) return 'ops';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/studio')) return 'studio';
    return null;
}

/**
 * Build the login URL, optionally embedding a `next` redirect.
 */
export function loginUrl(next?: string): string {
    if (!next) return '/login';
    return `/login?next=${encodeURIComponent(next)}`;
}

/**
 * Build the 403 URL with an optional `from` context hint.
 */
export function forbiddenUrl(from?: string): string {
    if (!from) return '/403';
    return `/403?from=${encodeURIComponent(from)}`;
}

/**
 * All permissions used in the application.
 * Keep in sync with the backend access/permissions API.
 */
export const PERMISSIONS = [
    // Orders
    'orders:read',
    'orders:create',
    'orders:cancel',
    'orders:cancel_any',
    // HR
    'employees:read',
    'employees:write',
    'employees:delete',
    'rules:read',
    'rules:write',
    'billing:read',
    'reports:read',
    // Ops
    'deliveries:read',
    'deliveries:update',
    'issues:read',
    'issues:write',
    'menus:read',
    'menus:write',
    'menus:publish',
    // Admin
    'companies:read',
    'companies:write',
    'users:read',
    'users:write',
    'users:suspend',
    // RBAC
    'roles:read',
    'roles:write',
    'assignments:read',
    'assignments:write',
    // Content
    'content:read',
    'content:write',
    'content:publish',
    'media:read',
    'media:write',
] as const;

export type Permission = typeof PERMISSIONS[number];

/**
 * Default permission sets per portal (used for UI hints only —
 * actual enforcement is backend-side).
 */
export const PORTAL_DEFAULT_PERMISSIONS: Record<Portal, Permission[]> = {
    employee: ['orders:read', 'orders:create', 'orders:cancel'],
    hr: [
        'orders:read',
        'employees:read',
        'employees:write',
        'rules:read',
        'rules:write',
        'billing:read',
        'reports:read',
        'roles:read',
        'assignments:read',
    ],
    ops: [
        'deliveries:read',
        'deliveries:update',
        'issues:read',
        'issues:write',
        'menus:read',
        'menus:write',
        'menus:publish',
    ],
    admin: PERMISSIONS as unknown as Permission[],
    studio: ['content:read', 'content:write', 'content:publish', 'media:read', 'media:write'],
};