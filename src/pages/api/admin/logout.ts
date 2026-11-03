import type { NextApiRequest, NextApiResponse } from "next";
import { clearSessionCookie, isSameOriginRequest } from "@/lib/server/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }
    if (!isSameOriginRequest(req)) {
        return res.status(403).json({ error: "Forbidden" });
    }
    clearSessionCookie(res);
    return res.status(200).json({ ok: true });
}
