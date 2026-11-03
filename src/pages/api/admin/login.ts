import type { NextApiRequest, NextApiResponse } from "next";
import {
    clearFailedLogins,
    createSessionToken,
    getClientIp,
    isAdminConfigured,
    isJsonRequest,
    isRateLimited,
    isSameOriginRequest,
    recordFailedLogin,
    setSessionCookie,
    verifyPassword,
} from "@/lib/server/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");

    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }
    if (!isAdminConfigured()) {
        return res.status(503).json({ error: "Admin is not configured" });
    }
    if (!isSameOriginRequest(req) || !isJsonRequest(req)) {
        return res.status(403).json({ error: "Forbidden" });
    }

    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
        return res.status(429).json({ error: "Too many attempts. Try again in 15 minutes." });
    }

    const password = req.body?.password;
    if (typeof password !== "string" || password.length === 0 || password.length > 1024) {
        return res.status(400).json({ error: "Password required" });
    }

    if (!(await verifyPassword(password))) {
        recordFailedLogin(ip);
        return res.status(401).json({ error: "Incorrect password" });
    }

    clearFailedLogins(ip);
    setSessionCookie(res, createSessionToken());
    return res.status(200).json({ ok: true });
}
