import type { NextApiRequest, NextApiResponse } from "next";
import { ProjectItem } from "@/types";
import { listItems, withSignedUrls } from "@/lib/server/aws";
import { isItemType } from "@/lib/server/validation";

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProjectItem[] | { error: string }>) {
    const { type } = req.query;

    if (!isItemType(type)) {
        return res.status(400).json({ error: "Missing or invalid type parameter" });
    }

    try {
        res.status(200).json(await withSignedUrls(await listItems(type)));
    } catch (err) {
        console.error("Error fetching projects", err);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
}
