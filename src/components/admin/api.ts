import { ItemType } from "@/types";

export class ApiError extends Error {
    constructor(message: string, public status: number) {
        super(message);
    }
}

/** JSON fetch to our admin API. Sends to /admin/login when the session has expired. */
export async function adminFetch<T>(url: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
    const method = init.method ?? "GET";
    const res = await fetch(url, {
        method,
        credentials: "same-origin",
        headers: method === "GET" ? undefined : { "Content-Type": "application/json" },
        body: method === "GET" ? undefined : JSON.stringify(init.body ?? {}),
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) {
        window.location.href = "/admin/login";
    }
    if (!res.ok) {
        throw new ApiError(data.error ?? `Request failed (${res.status})`, res.status);
    }
    return data as T;
}

type UploadTicket = {
    url: string;
    fields: Record<string, string>;
    file_name: string;
    file_type: string;
};

/** Gets a presigned POST from the server, then uploads the file directly to S3. */
export async function uploadFile(
    type: ItemType,
    file: File,
    onProgress: (fraction: number) => void
): Promise<{ file_name: string; file_type: string }> {
    const ticket = await adminFetch<UploadTicket>("/api/admin/upload", {
        method: "POST",
        body: { type, original_name: file.name, size: file.size },
    });

    const form = new FormData();
    for (const [key, value] of Object.entries(ticket.fields)) {
        form.append(key, value);
    }
    form.append("file", file); // must be the last field

    await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", ticket.url);
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) onProgress(e.loaded / e.total);
        };
        xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
                ? resolve()
                : reject(new Error(`Upload failed (${xhr.status})`));
        xhr.onerror = () => reject(new Error("Upload failed — check your connection (or the bucket's CORS settings)"));
        xhr.send(form);
    });

    return { file_name: ticket.file_name, file_type: ticket.file_type };
}
