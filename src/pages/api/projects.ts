import type { NextApiRequest, NextApiResponse } from "next";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ProjectItem } from "@/types";

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({ region: process.env.AWS_REGION }));
const s3 = new S3Client({ region: process.env.AWS_REGION });

const BUCKET_NAME = process.env.S3_BUCKET_NAME as string;
const TABLE_NAME = process.env.DYNAMO_TABLE_NAME as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse<ProjectItem[] | { error: string }>) {
    const { type } = req.query;

    if (!type || typeof type !== "string") {
        return res.status(400).json({ error: "Missing or invalid type parameter" });
    }

    try {
        const queryParams = {
            TableName: TABLE_NAME,
            IndexName: "type-order-index",
            KeyConditionExpression: "#type = :typeValue",
            ExpressionAttributeNames: {
                "#type": "type",
            },
            ExpressionAttributeValues: {
                ":typeValue": type,
            },
        };

        const data: QueryCommandOutput = await dynamo.send(new QueryCommand(queryParams));

        if (!data.Items) {
            return res.status(404).json({ error: "No items found" });
        }

        // 2. Generate signed URLs
        const itemsWithUrls: ProjectItem[] = await Promise.all(
            data.Items.map(async (item) => {
                const projectItem = item as ProjectItem;

                const command = new GetObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: `${projectItem.type}s/${projectItem.file_name}`,
                });

                const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

                return { ...projectItem, signedUrl };

                return projectItem;
            })
        );

        res.status(200).json(itemsWithUrls);
    } catch (err) {
        console.error("Error fetching projects", err);
        res.status(500).json({ error: "Failed to fetch projects" });
    }
}
