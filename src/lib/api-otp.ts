/**
 * src/lib/api-otp.ts
 * OTP login methods — kept as a small companion module rather than
 * editing the large existing api.ts, since apiFetch is already exported
 * from there and these three functions are all OTP needs.
 *
 * Usage: import { requestOtp, verifyOtp } from "@/lib/api-otp";
 */

import { apiFetch } from "./api";
import type { VerifyTokenResponse } from "./api";

export interface RequestOtpBody {
    email: string;
    channel?: "email" | "sms";
}

export interface RequestOtpResponse {
    message: string;
    debugCode?: string;
    debugReason?: string;
}

export interface VerifyOtpBody {
    email: string;
    code: string;
}

export const requestOtp = (body: RequestOtpBody) =>
    apiFetch<RequestOtpResponse>("/api/v1/auth/request-otp", {
        method: "POST",
        body: JSON.stringify({ channel: "email", ...body }),
    });

export const verifyOtp = (body: VerifyOtpBody) =>
    apiFetch<VerifyTokenResponse>("/api/v1/auth/verify-otp", {
        method: "POST",
        body: JSON.stringify(body),
    });
