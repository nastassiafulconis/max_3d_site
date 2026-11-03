import { randomBytes } from "crypto";
import { ItemType } from "@/types";

export const ITEM_TYPES: readonly ItemType[] = ["project", "sound"];

/** What the public pages know how to render, per section. */
export const ALLOWED_FILE_TYPES: Record<ItemType, Record<string, string>> = {
    project: {
        glb: "model/gltf-binary",
        mp4: "video/mp4",
    },
    sound: {
        mp3: "audio/mpeg",
        wav: "audio/wav",
    },
};

export const MAX_UPLOAD_BYTES = 250 * 1024 * 1024; // 250 MB

const TEXT_LIMITS = {
    name_en: 200,
    name_fr: 200,
    description_en: 5000,
    description_fr: 5000,
} as const;

export type TextFields = Partial<Record<keyof typeof TEXT_LIMITS, string>>;

export function isItemType(value: unknown): value is ItemType {
    return typeof value === "string" && (ITEM_TYPES as readonly string[]).includes(value);
}

export function contentTypeFor(type: ItemType, fileType: string): string | undefined {
    return Object.prototype.hasOwnProperty.call(ALLOWED_FILE_TYPES[type], fileType)
        ? ALLOWED_FILE_TYPES[type][fileType]
        : undefined;
}

/** Picks and validates the editable text fields from a request body. */
export function parseTextFields(body: Record<string, unknown>): { fields: TextFields } | { error: string } {
    const fields: TextFields = {};
    for (const [key, max] of Object.entries(TEXT_LIMITS) as [keyof typeof TEXT_LIMITS, number][]) {
        const value = body[key];
        if (value === undefined || value === null) continue;
        if (typeof value !== "string") return { error: `${key} must be text` };
        if (value.length > max) return { error: `${key} is too long (max ${max} characters)` };
        fields[key] = value.trim();
    }
    return { fields };
}

const SAFE_FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]{0,150}$/;

/** A stored file name must be one we generated: safe characters and an extension matching its type. */
export function isValidStoredFileName(type: ItemType, fileName: unknown, fileType: unknown): boolean {
    if (typeof fileName !== "string" || typeof fileType !== "string") return false;
    if (!SAFE_FILE_NAME.test(fileName) || fileName.includes("..")) return false;
    if (!contentTypeFor(type, fileType)) return false;
    return fileName.toLowerCase().endsWith(`.${fileType}`);
}

/** Builds a unique, URL-safe S3 file name from the uploader's original file name. */
export function generateFileName(originalName: string, fileType: string): string {
    const base = originalName
        .replace(/\.[^.]*$/, "")
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^A-Za-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 60)
        .toLowerCase();
    return `${base || "file"}-${randomBytes(4).toString("hex")}.${fileType}`;
}
