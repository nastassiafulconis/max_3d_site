import type { NextApiRequest, NextApiResponse } from "next";
import { randomUUID } from "crypto";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { withAdmin } from "@/lib/server/auth";
import { dynamo, listItems, TABLE_NAME, withSignedUrls } from "@/lib/server/aws";
import { fileExists } from "@/lib/server/items";
import { isItemType, isValidStoredFileName, parseTextFields } from "@/lib/server/validation";
import { ProjectItem } from "@/types";

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "GET") {
        const { type } = req.query;
        if (!isItemType(type)) {
            return res.status(400).json({ error: "Invalid type" });
        }
        try {
            return res.status(200).json(await withSignedUrls(await listItems(type)));
        } catch (err) {
            console.error("Error listing items", err);
            return res.status(500).json({ error: "Failed to load items" });
        }
    }

    if (req.method === "POST") {
        const body = req.body ?? {};
        const { type, file_name, file_type } = body;
        if (!isItemType(type)) {
            return res.status(400).json({ error: "Invalid type" });
        }
        if (!isValidStoredFileName(type, file_name, file_type)) {
            return res.status(400).json({ error: "Please upload a valid file" });
        }
        const parsed = parseTextFields(body);
        if ("error" in parsed) {
            return res.status(400).json({ error: parsed.error });
        }

        try {
            if (!(await fileExists(type, file_name))) {
                return res.status(400).json({ error: "Uploaded file not found — please upload it again" });
            }
            const existing = await listItems(type);
            const order = existing.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1;
            const item: ProjectItem = {
                id: randomUUID(),
                type,
                file_name,
                file_type,
                order,
                ...parsed.fields,
            };
            await dynamo.send(
                new PutCommand({
                    TableName: TABLE_NAME,
                    Item: item,
                    ConditionExpression: "attribute_not_exists(id)",
                })
            );
            return res.status(201).json(item);
        } catch (err) {
            console.error("Error creating item", err);
            return res.status(500).json({ error: "Failed to create item" });
        }
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
}

export default withAdmin(handler);
