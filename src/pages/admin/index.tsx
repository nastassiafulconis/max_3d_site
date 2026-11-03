import Head from "next/head";
import type { GetServerSideProps } from "next";
import { useCallback, useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/server/auth";
import { ItemType, ProjectItem } from "@/types";
import { ItemForm } from "@/components/admin/ItemForm";
import { adminFetch } from "@/components/admin/api";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    res.setHeader("Cache-Control", "no-store");
    if (!isAuthenticated(req)) {
        return { redirect: { destination: "/admin/login", permanent: false } };
    }
    return { props: {} };
};

const SECTIONS: { type: ItemType; label: string; publicPath: string }[] = [
    { type: "project", label: "Projects", publicPath: "/projects" },
    { type: "sound", label: "Sound design", publicPath: "/sound" },
];

function displayName(item: ProjectItem): string {
    return item.name_fr || item.name_en || item.id;
}

export default function AdminDashboard() {
    const [type, setType] = useState<ItemType>("project");
    const [items, setItems] = useState<ProjectItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editing, setEditing] = useState<ProjectItem | "new" | null>(null);
    const [busy, setBusy] = useState(false);

    const section = SECTIONS.find((s) => s.type === type)!;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await adminFetch<ProjectItem[]>(`/api/admin/items?type=${type}`));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }, [type]);

    useEffect(() => {
        setEditing(null);
        load();
    }, [load]);

    const move = async (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;
        const reordered = [...items];
        [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
        setItems(reordered);
        setBusy(true);
        try {
            await adminFetch("/api/admin/reorder", {
                method: "POST",
                body: { type, ids: reordered.map((i) => i.id) },
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save order");
            await load();
        } finally {
            setBusy(false);
        }
    };

    const remove = async (item: ProjectItem) => {
        if (!window.confirm(`Delete "${displayName(item)}"? This also deletes its file and can't be undone.`)) return;
        setBusy(true);
        try {
            await adminFetch(`/api/admin/items/${encodeURIComponent(item.id)}`, { method: "DELETE" });
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete");
        } finally {
            setBusy(false);
        }
    };

    const logout = async () => {
        await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
        window.location.href = "/admin/login";
    };

    const onSaved = async () => {
        setEditing(null);
        await load();
    };

    return (
        <>
            <Head>
                <title>Site admin</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="w-full max-w-5xl space-y-6 p-4 md:p-8">
                <header className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="text-3xl font-bold">Site admin</h1>
                    <div className="flex gap-3">
                        <a href="/" target="_blank" rel="noopener noreferrer" className="rounded border border-white px-3 py-1">
                            View site ↗
                        </a>
                        <button onClick={logout} className="rounded border border-white px-3 py-1">
                            Log out
                        </button>
                    </div>
                </header>

                <nav className="flex gap-2 border-b border-white/30" role="tablist">
                    {SECTIONS.map((s) => (
                        <button
                            key={s.type}
                            role="tab"
                            aria-selected={s.type === type}
                            onClick={() => setType(s.type)}
                            className={`-mb-px border-b-2 px-4 py-2 font-bold ${
                                s.type === type ? "border-white" : "border-transparent opacity-60"
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </nav>

                {error && (
                    <p role="alert" className="rounded border border-white/40 p-3">
                        ⚠ {error}
                    </p>
                )}

                {editing === "new" ? (
                    <ItemForm type={type} onSaved={onSaved} onCancel={() => setEditing(null)} />
                ) : (
                    <button
                        onClick={() => setEditing("new")}
                        disabled={busy || editing !== null}
                        className="rounded bg-white px-4 py-2 font-bold text-black disabled:opacity-50"
                    >
                        + Add {type === "project" ? "project" : "sound"}
                    </button>
                )}

                {loading ? (
                    <p>Loading…</p>
                ) : items.length === 0 ? (
                    !error && <p className="opacity-70">Nothing here yet.</p>
                ) : (
                    <ol className="space-y-3">
                        {items.map((item, index) =>
                            editing !== "new" && editing?.id === item.id ? (
                                <li key={item.id}>
                                    <ItemForm type={type} item={item} onSaved={onSaved} onCancel={() => setEditing(null)} />
                                </li>
                            ) : (
                                <li key={item.id} className="flex flex-wrap items-center gap-4 rounded border border-white/30 p-3">
                                    <div className="flex flex-col">
                                        <button
                                            aria-label="Move up"
                                            disabled={busy || index === 0}
                                            onClick={() => move(index, -1)}
                                            className="px-2 disabled:opacity-20"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            aria-label="Move down"
                                            disabled={busy || index === items.length - 1}
                                            onClick={() => move(index, 1)}
                                            className="px-2 disabled:opacity-20"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-bold">{displayName(item)}</p>
                                        <p className="truncate text-sm opacity-70">
                                            {item.file_type.toUpperCase()} · {item.file_name}
                                        </p>
                                    </div>
                                    {item.signedUrl && (
                                        <a href={item.signedUrl} target="_blank" rel="noopener noreferrer" className="text-sm underline">
                                            Open file
                                        </a>
                                    )}
                                    <div className="flex gap-2">
                                        <button
                                            disabled={busy || editing !== null}
                                            onClick={() => setEditing(item)}
                                            className="rounded border border-white px-3 py-1 disabled:opacity-50"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            disabled={busy || editing !== null}
                                            onClick={() => remove(item)}
                                            className="rounded border border-white px-3 py-1 disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            )
                        )}
                    </ol>
                )}

                <p className="text-sm opacity-70">
                    Changes appear on <a href={section.publicPath} target="_blank" rel="noopener noreferrer" className="underline">{section.publicPath}</a> as soon as they are saved.
                </p>
            </div>
        </>
    );
}
