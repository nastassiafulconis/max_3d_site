import type { NextApiRequest, NextApiResponse } from "next";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { withAdmin } from "@/lib/server/auth";
import { dynamo, listItems, TABLE_NAME } from "@/lib/server/aws";
import { isItemType } from "@/lib/server/validation";

/** Body: { type, ids: string[] } — the full list of that section's ids in the new order. */
async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { type, ids } = req.body ?? {};
    if (!isItemType(type)) {
        return res.status(400).json({ error: "Invalid type" });
    }
    if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) {
        return res.status(400).json({ error: "Invalid order" });
    }

    try {
        const current = await listItems(type);
        const currentIds = new Set(current.map((item) => item.id));
        if (ids.length !== currentIds.size || new Set(ids).size !== ids.length || !ids.every((id) => currentIds.has(id))) {
            return res.status(409).json({ error: "The list changed — please reload and try again" });
        }

        const orderById = new Map(current.map((item) => [item.id, Number(item.order)]));
        await Promise.all(
            ids.map((id: string, index: number) => {
                const order = index + 1;
                if (orderById.get(id) === order) return null;
                return dynamo.send(
                    new UpdateCommand({
                        TableName: TABLE_NAME,
                        Key: { id },
                        UpdateExpression: "SET #order = :order",
                        ExpressionAttributeNames: { "#order": "order", "#type": "type" },
                        ExpressionAttributeValues: { ":order": order, ":type": type },
                        ConditionExpression: "attribute_exists(id) AND #type = :type",
                    })
                );
            })
        );
        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("Error reordering items", err);
        return res.status(500).json({ error: "Failed to save order" });
    }
}

export default withAdmin(handler);
