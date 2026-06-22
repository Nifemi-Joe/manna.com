// ─── Error Types ─────────────────────────────────────────
export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly data?: unknown
    ) {
        super(message);
        this.name = "ApiError";
    }
}

// ─── Core Fetch Wrapper ───────────────────────────────────
// All paths below are RELATIVE ("/api/v1/...") on purpose. The browser
// calls same-origin (whatever domain the frontend is served from), and
// next.config.ts's rewrites() proxies that server-side to the real API
// (API_URL env var). This keeps the session cookie first-party — calling
// the API's own domain directly from the browser breaks magic-link auth,
// since a cookie set on api.example.com is never sent back to
// app.example.com on subsequent requests.
export async function apiFetch<T>(
    path: string,
    options?: RequestInit
): Promise<T> {
    const res = await fetch(path, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers ?? {}),
        },
        ...options,
    });

    if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        let data: unknown;
        try {
            data = await res.json();
            if (
                data &&
                typeof data === "object" &&
                "message" in data &&
                typeof (data as Record<string, unknown>).message === "string"
            ) {
                message = (data as Record<string, unknown>).message as string;
            }
        } catch {
            // non-JSON error body — use default message
        }
        throw new ApiError(res.status, message, data);
    }

    if (res.status === 204) return undefined as T;

    return res.json() as Promise<T>;
}

// ─── API Response Types ───────────────────────────────────

// Auth
export interface MagicLinkRequestBody {
    email: string;
}

export interface MagicLinkRequestResponse {
    message: string;
    debugLink?: string;
    /** Populated when debugLink is shown because real email delivery failed. */
    debugReason?: string;
}

export interface VerifyTokenResponse {
    token: string;
    user: User;
    portal: Portal;
}

export interface SwitchContextBody {
    portal: Portal;
}

// User & Auth
export type Portal = "employee" | "hr" | "ops" | "admin" | "studio";

export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    portal: Portal;
    companyId?: string;
    companyName?: string;
    permissions: string[];
    roles: string[];
    createdAt: string;
    updatedAt: string;
}

// Menu / Meals
export type SpiceLevel = "none" | "mild" | "medium" | "hot";

export interface AllergenTag {
    id: string;
    label: string;
}

export interface DietaryTag {
    id: string;
    label: "vegan" | "halal" | "spice-free" | "gluten-free";
}

export interface Meal {
    id: string;
    name: string;
    description: string;
    price: number;
    spiceLevel: SpiceLevel;
    allergens: AllergenTag[];
    dietary: DietaryTag[];
    imageUrl?: string;
    available: boolean;
}

export interface DayMenu {
    date: string; // ISO date
    cutoffTime: string; // ISO datetime
    meals: Meal[];
}

export interface MenuResponse {
    week: string;
    days: DayMenu[];
}

// Orders
export type OrderStatus =
    | "pending"
    | "confirmed"
    | "packed"
    | "dispatched"
    | "delivered"
    | "cancelled"
    | "failed";

export interface Order {
    id: string;
    userId: string;
    mealId: string;
    mealName: string;
    date: string;
    status: OrderStatus;
    totalAmount: number;
    allowanceCovered: number;
    employeePaid: number;
    companyId: string;
    deliveryAddress?: string;
    notes?: string;
    cancellable: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PlaceOrderBody {
    mealId: string;
    date: string;
    notes?: string;
}

export interface PlaceOrderResponse {
    order: Order;
    requiresTopUp: boolean;
    topUpAmount?: number;
    paymentUrl?: string;
}

export interface OrdersListResponse {
    orders: Order[];
    total: number;
    page: number;
    perPage: number;
}

// Allowance / Wallet
export interface AllowanceInfo {
    dailyAmount: number;
    /** Alias for dailyAmount */
    daily?: number;
    remaining: number;
    used: number;
    resetAt: string;
    /** Meal type covered by the benefit plan */
    mealType?: string;
}

export interface TopUpBody {
    amount: number;
    orderId?: string;
}

export interface TopUpResponse {
    paymentUrl: string;
    reference: string;
}

export interface TopUpRecord {
    id: string;
    amount: number;
    reference: string;
    status: "pending" | "success" | "failed";
    createdAt: string;
}

// HR
export interface HROrder extends Order {
    employeeName: string;
    employeeEmail: string;
    department?: string;
}

export interface HROrdersResponse {
    orders: HROrder[];
    total: number;
    page: number;
    perPage: number;
    totalAmount: number;
    filters?: {
        startDate?: string;
        endDate?: string;
        status?: OrderStatus;
        department?: string;
    };
}

// Ops / Deliveries
export type DeliveryStatus =
    | "scheduled"
    | "packed"
    | "dispatched"
    | "delivered"
    | "failed";

export interface Delivery {
    id: string;
    orderId: string;
    companyId: string;
    companyName: string;
    employeeName: string;
    employeeEmail: string;
    mealName: string;
    status: DeliveryStatus;
    deliveryAddress: string;
    scheduledFor: string;
    updatedAt: string;
    notes?: string;
    dietary: DietaryTag[];
}

export interface DeliveriesResponse {
    deliveries: Delivery[];
    total: number;
}

export interface UpdateDeliveryBody {
    status: DeliveryStatus;
    notes?: string;
}

// RBAC
export interface Permission {
    id: string;
    key: string;
    label: string;
    group: string;
}

export interface Role {
    id: string;
    name: string;
    description?: string;
    permissions: string[];
    assignedCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateRoleBody {
    name: string;
    description?: string;
    permissions: string[];
}

export interface RoleAssignment {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    roleId: string;
    roleName: string;
    status: "active" | "inactive";
    assignedAt: string;
    assignedBy: string;
}

export interface AssignRoleBody {
    userId: string;
    roleId: string;
}

// Content Studio
export type ContentStatus = "draft" | "published" | "unpublished_changes";

export interface ContentEntry {
    key: string;
    type: "text" | "richtext" | "json" | "markdown";
    title: string;
    status: ContentStatus;
    section: string;
    content: string;
    lastEditedAt: string;
    lastPublishedAt?: string;
    editedBy: string;
}

export interface ContentRevision {
    id: string;
    key: string;
    content: string;
    publishedAt: string;
    publishedBy: string;
    summary?: string;
}

export interface MediaAsset {
    id: string;
    filename: string;
    url: string;
    mimeType: string;
    sizeBytes: number;
    width?: number;
    height?: number;
    alt?: string;
    tags: string[];
    uploadedAt: string;
    uploadedBy: string;
}

// Health
export type ServiceStatus = "ok" | "degraded" | "down";

export interface HealthResponse {
    status: ServiceStatus;
    timestamp: string;
    services: {
        db: ServiceStatus;
        auth: ServiceStatus;
        payments: ServiceStatus;
        delivery: ServiceStatus;
    };
    version: string;
}

// ─── Typed API Calls ──────────────────────────────────────

export const api = {
    // Auth
    auth: {
        requestLink: (body: MagicLinkRequestBody) =>
            apiFetch<MagicLinkRequestResponse>("/api/v1/auth/request-link", {
                method: "POST",
                body: JSON.stringify(body),
            }),
        verify: (token: string) =>
            apiFetch<VerifyTokenResponse>(
                `/api/v1/auth/verify?token=${encodeURIComponent(token)}`
            ),
        switchContext: (body: SwitchContextBody) =>
            apiFetch<{ success: boolean }>("/api/v1/auth/switch-context", {
                method: "POST",
                body: JSON.stringify(body),
            }),
    },

    // Access / Me
    access: {
        me: () => apiFetch<User>("/api/v1/access/me"),
        permissions: () =>
            apiFetch<{ permissions: Permission[] }>("/api/v1/access/permissions"),
        /** Convenience: list roles → resolves to Role[] */
        async listRoles() { const r = await apiFetch<{ roles: Role[] }>("/api/v1/access/roles"); return r.roles; },
        /** Convenience: list assignments → resolves to RoleAssignment[] */
        async listAssignments() { const r = await apiFetch<{ assignments: RoleAssignment[] }>("/api/v1/access/assignments"); return r.assignments; },
        /** Convenience: create role → resolves to Role */
        async createRole(body: CreateRoleBody) { const r = await apiFetch<{ role: Role }>("/api/v1/access/roles", { method: "POST", body: JSON.stringify(body) }); return r.role; },
        roles: {
            list: () => apiFetch<{ roles: Role[] }>("/api/v1/access/roles"),
            create: (body: CreateRoleBody) =>
                apiFetch<{ role: Role }>("/api/v1/access/roles", {
                    method: "POST",
                    body: JSON.stringify(body),
                }),
            update: (id: string, body: Partial<CreateRoleBody>) =>
                apiFetch<{ role: Role }>(`/api/v1/access/roles/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                }),
        },
        assignments: {
            list: () =>
                apiFetch<{ assignments: RoleAssignment[] }>(
                    "/api/v1/access/assignments"
                ),
            create: (body: AssignRoleBody) =>
                apiFetch<{ assignment: RoleAssignment }>("/api/v1/access/assignments", {
                    method: "POST",
                    body: JSON.stringify(body),
                }),
            update: (id: string, body: Partial<AssignRoleBody>) =>
                apiFetch<{ assignment: RoleAssignment }>(
                    `/api/v1/access/assignments/${id}`,
                    { method: "PATCH", body: JSON.stringify(body) }
                ),
        },
    },

    // Employee
    employee: {
        menus: () => apiFetch<MenuResponse>("/api/v1/menus"),
        allowance: () => apiFetch<AllowanceInfo>("/api/v1/employee/allowance"),
        orders: {
            list: () => apiFetch<OrdersListResponse>("/api/v1/orders/me"),
            place: (body: PlaceOrderBody) =>
                apiFetch<PlaceOrderResponse>("/api/v1/orders", {
                    method: "POST",
                    body: JSON.stringify(body),
                }),
            cancel: (id: string) =>
                apiFetch<{ success: boolean }>(`/api/v1/orders/${id}/cancel`, {
                    method: "PATCH",
                }),
        },
        payment: {
            initializeTopUp: (body: TopUpBody) =>
                apiFetch<TopUpResponse>("/api/v1/payments/paystack/initialize", {
                    method: "POST",
                    body: JSON.stringify(body),
                }),
        },
    },

    // HR
    hr: {
        orders: (params?: {
            page?: number;
            perPage?: number;
            startDate?: string;
            endDate?: string;
            status?: OrderStatus;
            department?: string;
        }) => {
            const qs = params
                ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])).toString()
                : "";
            return apiFetch<HROrdersResponse>(`/api/v1/hr/orders${qs}`);
        },
    },

    // Ops
    ops: {
        deliveries: {
            list: (params?: { company?: string; status?: DeliveryStatus }) => {
                const qs = params
                    ? "?" + new URLSearchParams(Object.entries(params).filter(([, v]) => v != null) as [string, string][]).toString()
                    : "";
                return apiFetch<DeliveriesResponse>(`/api/v1/ops/deliveries${qs}`);
            },
            update: (id: string, body: UpdateDeliveryBody) =>
                apiFetch<{ delivery: Delivery }>(`/api/v1/ops/deliveries/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                }),
        },
    },

    // Studio
    studio: {
        content: {
            list: () =>
                apiFetch<{ entries: ContentEntry[] }>("/api/v1/studio/content"),
            get: (key: string) =>
                apiFetch<ContentEntry>(`/api/v1/studio/content/entry?key=${encodeURIComponent(key)}`),
            update: (key: string, content: string) =>
                apiFetch<ContentEntry>(`/api/v1/studio/content/entry?key=${encodeURIComponent(key)}`, {
                    method: "PATCH",
                    body: JSON.stringify({ content }),
                }),
            publish: (key: string) =>
                apiFetch<ContentEntry>(
                    `/api/v1/studio/content/publish?key=${encodeURIComponent(key)}`,
                    { method: "POST" }
                ),
            rollback: (key: string, revisionId: string) =>
                apiFetch<ContentEntry>(
                    `/api/v1/studio/content/rollback?key=${encodeURIComponent(key)}`,
                    { method: "POST", body: JSON.stringify({ revisionId }) }
                ),
            revisions: (key: string) =>
                apiFetch<{ revisions: ContentRevision[] }>(
                    `/api/v1/studio/content/revisions?key=${encodeURIComponent(key)}`
                ),
        },
        media: {
            list: () => apiFetch<{ assets: MediaAsset[] }>("/api/v1/studio/media"),
            upload: (formData: FormData) =>
                fetch("/api/v1/studio/media", {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }).then(async (res) => {
                    if (!res.ok) throw new ApiError(res.status, "Upload failed");
                    return res.json() as Promise<MediaAsset>;
                }),
            update: (id: string, body: Partial<Pick<MediaAsset, "alt" | "tags">>) =>
                apiFetch<MediaAsset>(`/api/v1/studio/media/${id}`, {
                    method: "PATCH",
                    body: JSON.stringify(body),
                }),
        },
    },

    // Admin
    admin: {
        health: () => apiFetch<HealthResponse>("/api/v1/health"),
    },
};