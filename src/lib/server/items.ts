import { DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { ItemType } from "@/types";
import { BUCKET_NAME, objectKey, s3 } from "./aws";

export async function fileExists(type: ItemType, fileName: string): Promise<boolean> {
    try {
        await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey(type, fileName) }));
        return true;
    } catch {
        return false;
    }
}

/** Deletes a media file; failures are logged, not thrown (the DB change already succeeded). */
export async function deleteFile(type: ItemType, fileName: string): Promise<void> {
    try {
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: objectKey(type, fileName) }));
    } catch (err) {
        console.error(`Failed to delete ${objectKey(type, fileName)}`, err);
    }
}
