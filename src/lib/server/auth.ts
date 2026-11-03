import { createHmac, scrypt, timingSafeEqual, randomBytes } from "crypto";
import type { IncomingMessage } from "http";
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

/**
 * Single-user admin authentication.
 *
 * - The password itself is never stored: ADMIN_PASSWORD_HASH holds an scrypt hash
 *   (generate one with `npm run hash-password`).
 * - A successful login sets an HttpOnly, Secure, SameSite=Strict cookie containing an
 *   expiry timestamp signed with HMAC-SHA256 (ADMIN_SESSION_SECRET). Nothing secret is in
 *   the cookie, and it can't be forged or extended without the secret.
 * - Rotating ADMIN_SESSION_SECRET instantly logs out every session.
 */

export const SESSION_COOKIE = "admin_session";
const SESSION_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const SCRYPT_KEYLEN = 64;

type AuthConfig = { passwordHash: string; sessionSecret: string };

function getConfig(): AuthConfig | null {
    const passwordHash = process.env.ADMIN_PASSWORD_HASH;
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    if (!passwordHash || !sessionSecret || sessionSecret.length < 32) {
        return null;
    }
    return { passwordHash, sessionSecret };
}

export function isAdminConfigured(): boolean {
    return getConfig() !== null;
}

function scryptAsync(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        scrypt(password, salt, keylen, (err, key) => (err ? reject(err) : resolve(key)));
    });
}

/** Format: `scrypt:<salt hex>:<hash hex>` (colons, not `$`, so .env files don't expand it). */
export async function hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16);
    const hash = await scryptAsync(password, salt, SCRYPT_KEYLEN);
    return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string): Promise<boolean> {
    const config = getConfig();
    if (!config) return false;
    const [scheme, saltHex, hashHex] = config.passwordHash.split(":");
    if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, "hex");
    const actual = await scryptAsync(password, Buffer.from(saltHex, "hex"), expected.length);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function sign(payload: string, secret: string): string {
    return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSessionToken(now = Date.now()): string {
    const config = getConfig();
    if (!config) throw new Error("Admin is not configured");
    const exp = String(now + SESSION_TTL_MS);
    return `${exp}.${sign(`admin.${exp}`, config.sessionSecret)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
    const config = getConfig();
    if (!config || !token) return false;
    const [exp, sig] = token.split(".");
    if (!exp || !sig || !/^\d+$/.test(exp)) return false;
    const expected = Buffer.from(sign(`admin.${exp}`, config.sessionSecret));
    const actual = Buffer.from(sig);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    return Number(exp) > now;
}

function parseCookies(header: string | undefined): Record<string, string> {
    const out: Record<string, string> = {};
    if (!header) return out;
    for (const part of header.split(";")) {
        const idx = part.indexOf("=");
        if (idx === -1) continue;
        const key = part.slice(0, idx).trim();
        const value = part.slice(idx + 1).trim();
        try {
            out[key] = decodeURIComponent(value);
        } catch {
            // ignore malformed cookie
        }
    }
    return out;
}

export function isAuthenticated(req: IncomingMessage): boolean {
    return verifySessionToken(parseCookies(req.headers.cookie)[SESSION_COOKIE]);
}

function cookieAttributes(maxAgeSeconds: number): string {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    return `Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAgeSeconds}${secure}`;
}

export function setSessionCookie(res: NextApiResponse, token: string) {
    res.setHeader(
        "Set-Cookie",
        `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieAttributes(SESSION_TTL_MS / 1000)}`
    );
}

export function clearSessionCookie(res: NextApiResponse) {
    res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; ${cookieAttributes(0)}`);
}

/**
 * CSRF defence in depth (on top of SameSite=Strict): state-changing requests must
 * come from this site's own origin and carry a JSON body, which browsers won't send
 * cross-origin without a CORS preflight we never approve.
 */
export function isSameOriginRequest(req: NextApiRequest): boolean {
    const origin = req.headers.origin;
    const host = (req.headers["x-forwarded-host"] as string | undefined)?.split(",")[0].trim() ?? req.headers.host;
    if (!origin || !host) return false;
    try {
        return new URL(origin).host === host;
    } catch {
        return false;
    }
}

function isJsonRequest(req: NextApiRequest): boolean {
    return (req.headers["content-type"] ?? "").toLowerCase().startsWith("application/json");
}

export function getClientIp(req: IncomingMessage): string {
    const forwarded = req.headers["x-forwarded-for"];
    const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0].trim();
    return first || req.socket.remoteAddress || "unknown";
}

/**
 * Best-effort login throttling: 5 failed attempts per IP per 15 minutes, plus a
 * site-wide cap of 50 failures per 15 minutes (so rotating spoofed IPs doesn't help).
 * In-memory, so it resets on cold start / isn't shared between serverless instances;
 * the strong password + slow scrypt hash are the main protection.
 */
const MAX_ATTEMPTS = 5;
const MAX_GLOBAL_ATTEMPTS = 50;
const WINDOW_MS = 15 * 60 * 1000;
const failedAttempts = new Map<string, { count: number; resetAt: number }>();
const globalFailures = { count: 0, resetAt: 0 };

export function isRateLimited(ip: string, now = Date.now()): boolean {
    if (globalFailures.resetAt > now && globalFailures.count >= MAX_GLOBAL_ATTEMPTS) return true;
    const entry = failedAttempts.get(ip);
    if (!entry || entry.resetAt <= now) return false;
    return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedLogin(ip: string, now = Date.now()) {
    if (globalFailures.resetAt <= now) {
        globalFailures.count = 0;
        globalFailures.resetAt = now + WINDOW_MS;
    }
    globalFailures.count += 1;

    const entry = failedAttempts.get(ip);
    if (!entry || entry.resetAt <= now) {
        failedAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    } else {
        entry.count += 1;
    }
    if (failedAttempts.size > 10_000) {
        for (const [key, value] of failedAttempts) {
            if (value.resetAt <= now) failedAttempts.delete(key);
        }
    }
}

export function clearFailedLogins(ip: string) {
    failedAttempts.delete(ip);
}

/** Wraps an admin API route: requires a valid session, and same-origin JSON for writes. */
export function withAdmin(handler: NextApiHandler): NextApiHandler {
    return async (req, res) => {
        res.setHeader("Cache-Control", "no-store");
        if (!isAdminConfigured()) {
            return res.status(503).json({ error: "Admin is not configured" });
        }
        if (!isAuthenticated(req)) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        if (req.method !== "GET" && req.method !== "HEAD") {
            if (!isSameOriginRequest(req) || !isJsonRequest(req)) {
                return res.status(403).json({ error: "Forbidden" });
            }
        }
        return handler(req, res);
    };
}

export { isJsonRequest };
