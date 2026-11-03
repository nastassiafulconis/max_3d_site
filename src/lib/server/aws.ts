import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ItemType, ProjectItem } from "@/types";

export const dynamo = DynamoDBDocumentClient.from(
    new DynamoDBClient({ region: process.env.AWS_REGION }),
    { marshallOptions: { removeUndefinedValues: true } }
);
export const s3 = new S3Client({ region: process.env.AWS_REGION });

export const BUCKET_NAME = process.env.S3_BUCKET_NAME as string;
export const TABLE_NAME = process.env.DYNAMO_TABLE_NAME as string;

/** S3 key layout used by the public site: `projects/<file>` and `sounds/<file>`. */
export function objectKey(type: ItemType, fileName: string): string {
    return `${type}s/${fileName}`;
}

/** Returns every item of a type, sorted by `order`. Follows DynamoDB pagination. */
export async function listItems(type: ItemType): Promise<ProjectItem[]> {
    const items: ProjectItem[] = [];
    let ExclusiveStartKey: Record<string, unknown> | undefined;
    do {
        const page = await dynamo.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                IndexName: "type-order-index",
                KeyConditionExpression: "#type = :typeValue",
                ExpressionAttributeNames: { "#type": "type" },
                ExpressionAttributeValues: { ":typeValue": type },
                ExclusiveStartKey,
            })
        );
        items.push(...((page.Items ?? []) as ProjectItem[]));
        ExclusiveStartKey = page.LastEvaluatedKey;
    } while (ExclusiveStartKey);
    return items;
}

export async function withSignedUrls(items: ProjectItem[]): Promise<ProjectItem[]> {
    return Promise.all(
        items.map(async (item) => {
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: objectKey(item.type, item.file_name),
            });
            const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
            return { ...item, signedUrl };
        })
    );
}
