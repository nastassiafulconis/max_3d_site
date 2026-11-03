import type { NextApiRequest, NextApiResponse } from "next";
import { DeleteCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { withAdmin } from "@/lib/server/auth";
import { dynamo, TABLE_NAME } from "@/lib/server/aws";
import { deleteFile, fileExists } from "@/lib/server/items";
import { isItemType, isValidStoredFileName, parseTextFields } from "@/lib/server/validation";
import { ProjectItem } from "@/types";

async function getItem(id: string): Promise<ProjectItem | undefined> {
    const result = await dynamo.send(new GetCommand({ TableName: TABLE_NAME, Key: { id } }));
    return result.Item as ProjectItem | undefined;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;
    if (typeof id !== "string" || id.length === 0 || id.length > 200) {
        return res.status(400).json({ error: "Invalid id" });
    }

    let existing: ProjectItem | undefined;
    try {
        existing = await getItem(id);
    } catch (err) {
        console.error("Error loading item", err);
        return res.status(500).json({ error: "Failed to load item" });
    }
    if (!existing || !isItemType(existing.type)) {
        return res.status(404).json({ error: "Item not found" });
    }

    if (req.method === "PUT") {
        const body = req.body ?? {};
        const parsed = parseTextFields(body);
        if ("error" in parsed) {
            return res.status(400).json({ error: parsed.error });
        }
        const updates: Record<string, unknown> = { ...parsed.fields };

        const replacingFile = body.file_name !== undefined && body.file_name !== existing.file_name;
        if (replacingFile) {
            if (!isValidStoredFileName(existing.type, body.file_name, body.file_type)) {
                return res.status(400).json({ error: "Please upload a valid file" });
            }
            if (!(await fileExists(existing.type, body.file_name))) {
                return res.status(400).json({ error: "Uploaded file not found — please upload it again" });
            }
            updates.file_name = body.file_name;
            updates.file_type = body.file_type;
        }

        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return res.status(200).json(existing);
        }

        try {
            const result = await dynamo.send(
                new UpdateCommand({
                    TableName: TABLE_NAME,
                    Key: { id },
                    UpdateExpression: "SET " + keys.map((_, i) => `#k${i} = :v${i}`).join(", "),
                    ExpressionAttributeNames: Object.fromEntries(keys.map((k, i) => [`#k${i}`, k])),
                    ExpressionAttributeValues: Object.fromEntries(keys.map((k, i) => [`:v${i}`, updates[k]])),
                    ConditionExpression: "attribute_exists(id)",
                    ReturnValues: "ALL_NEW",
                })
            );
            if (replacingFile) {
                await deleteFile(existing.type, existing.file_name);
            }
            return res.status(200).json(result.Attributes);
        } catch (err) {
            console.error("Error updating item", err);
            return res.status(500).json({ error: "Failed to save changes" });
        }
    }

    if (req.method === "DELETE") {
        try {
            await dynamo.send(
                new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: { id },
                    ConditionExpression: "attribute_exists(id)",
                })
            );
            await deleteFile(existing.type, existing.file_name);
            return res.status(200).json({ ok: true });
        } catch (err) {
            console.error("Error deleting item", err);
            return res.status(500).json({ error: "Failed to delete item" });
        }
    }

    res.setHeader("Allow", "PUT, DELETE");
    return res.status(405).json({ error: "Method not allowed" });
}

export default withAdmin(handler);
