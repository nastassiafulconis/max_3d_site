import { FormEvent, useState } from "react";
import { ItemType, ProjectItem } from "@/types";
import { adminFetch, uploadFile } from "./api";

const ACCEPT: Record<ItemType, string> = {
    project: ".glb,.mp4",
    sound: ".mp3,.wav",
};

type Props = {
    type: ItemType;
    item?: ProjectItem; // undefined = creating a new one
    onSaved: () => void;
    onCancel: () => void;
};

const inputClass = "w-full rounded border p-2";

export function ItemForm({ type, item, onSaved, onCancel }: Props) {
    const [nameEn, setNameEn] = useState(item?.name_en ?? "");
    const [nameFr, setNameFr] = useState(item?.name_fr ?? "");
    const [descEn, setDescEn] = useState(item?.description_en ?? "");
    const [descFr, setDescFr] = useState(item?.description_fr ?? "");
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isNew = !item;
    const showDescriptions = type === "project";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        if (isNew && !file) {
            setError("Please choose a file");
            return;
        }
        setSaving(true);
        try {
            let uploaded: { file_name: string; file_type: string } | undefined;
            if (file) {
                setProgress(0);
                uploaded = await uploadFile(type, file, setProgress);
            }
            const body = {
                name_en: nameEn,
                name_fr: nameFr,
                ...(showDescriptions ? { description_en: descEn, description_fr: descFr } : {}),
                ...(uploaded ?? {}),
            };
            if (isNew) {
                await adminFetch("/api/admin/items", { method: "POST", body: { type, ...body } });
            } else {
                await adminFetch(`/api/admin/items/${encodeURIComponent(item.id)}`, { method: "PUT", body });
            }
            onSaved();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setSaving(false);
            setProgress(null);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded border border-white/40 p-4">
            <h3 className="text-xl font-bold">
                {isNew ? `New ${type === "project" ? "project" : "sound"}` : "Edit"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block" htmlFor="name_fr">Title (French)</label>
                    <input id="name_fr" className={inputClass} value={nameFr} maxLength={200} onChange={(e) => setNameFr(e.target.value)} />
                </div>
                <div>
                    <label className="mb-1 block" htmlFor="name_en">Title (English)</label>
                    <input id="name_en" className={inputClass} value={nameEn} maxLength={200} onChange={(e) => setNameEn(e.target.value)} />
                </div>
                {showDescriptions && (
                    <>
                        <div>
                            <label className="mb-1 block" htmlFor="description_fr">Description (French)</label>
                            <textarea id="description_fr" rows={6} className={inputClass} value={descFr} maxLength={5000} onChange={(e) => setDescFr(e.target.value)} />
                        </div>
                        <div>
                            <label className="mb-1 block" htmlFor="description_en">Description (English)</label>
                            <textarea id="description_en" rows={6} className={inputClass} value={descEn} maxLength={5000} onChange={(e) => setDescEn(e.target.value)} />
                        </div>
                    </>
                )}
            </div>
            {showDescriptions && (
                <p className="text-sm opacity-70">
                    Tip: to add a link, write the word followed by the address in brackets, e.g.{" "}
                    <code>Sylphyo (https://www.aodyo.com)</code>
                </p>
            )}

            <div>
                <label className="mb-1 block" htmlFor="file">
                    {isNew ? "File" : "Replace file (optional)"} — {ACCEPT[type].replaceAll(",", ", ")}, max 250 MB
                </label>
                {!isNew && <p className="mb-1 text-sm opacity-70">Current: {item.file_name}</p>}
                <input
                    id="file"
                    type="file"
                    accept={ACCEPT[type]}
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="block w-full text-sm"
                />
            </div>

            {progress !== null && (
                <div className="h-2 w-full rounded bg-white/20" aria-label="Upload progress">
                    <div className="h-2 rounded bg-white" style={{ width: `${Math.round(progress * 100)}%` }} />
                </div>
            )}
            {error && <p role="alert">⚠ {error}</p>}

            <div className="flex gap-3">
                <button type="submit" disabled={saving} className="rounded bg-white px-4 py-2 font-bold text-black disabled:opacity-50">
                    {saving ? (progress !== null ? `Uploading… ${Math.round(progress * 100)}%` : "Saving…") : "Save"}
                </button>
                <button type="button" disabled={saving} onClick={onCancel} className="rounded border border-white px-4 py-2 disabled:opacity-50">
                    Cancel
                </button>
            </div>
        </form>
    );
}
