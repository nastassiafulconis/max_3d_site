import type { NextApiRequest, NextApiResponse } from "next";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { withAdmin } from "@/lib/server/auth";
import { BUCKET_NAME, objectKey, s3 } from "@/lib/server/aws";
import { contentTypeFor, generateFileName, isItemType, MAX_UPLOAD_BYTES } from "@/lib/server/validation";

/**
 * Returns a short-lived presigned POST so the browser uploads straight to S3
 * (large 3D models / audio never pass through the server). The policy pins the
 * exact key, content type and maximum size, so it can't be reused for anything else.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return res.status(405).json({ error: "Method not allowed" });
    }

    const { type, original_name, size } = req.body ?? {};
    if (!isItemType(type)) {
        return res.status(400).json({ error: "Invalid type" });
    }
    if (typeof original_name !== "string" || original_name.length > 255) {
        return res.status(400).json({ error: "Invalid file name" });
    }
    if (typeof size !== "number" || !Number.isFinite(size) || size <= 0 || size > MAX_UPLOAD_BYTES) {
        return res.status(400).json({ error: `File must be smaller than ${MAX_UPLOAD_BYTES / 1024 / 1024} MB` });
    }

    const fileType = original_name.split(".").pop()?.toLowerCase() ?? "";
    const contentType = contentTypeFor(type, fileType);
    if (!contentType) {
        return res.status(400).json({ error: `Unsupported file type ".${fileType}"` });
    }

    const fileName = generateFileName(original_name, fileType);
    const key = objectKey(type, fileName);

    try {
        const { url, fields } = await createPresignedPost(s3, {
            Bucket: BUCKET_NAME,
            Key: key,
            Conditions: [
                ["eq", "$key", key],
                ["eq", "$Content-Type", contentType],
                ["content-length-range", 1, MAX_UPLOAD_BYTES],
            ],
            Fields: { "Content-Type": contentType },
            Expires: 600, // 10 minutes
        });
        return res.status(200).json({ url, fields, file_name: fileName, file_type: fileType });
    } catch (err) {
        console.error("Error creating upload URL", err);
        return res.status(500).json({ error: "Could not prepare upload" });
    }
}

export default withAdmin(handler);
