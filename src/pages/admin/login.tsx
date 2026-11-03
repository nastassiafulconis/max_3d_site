import Head from "next/head";
import { useRouter } from "next/router";
import { FormEvent, useState } from "react";
import type { GetServerSideProps } from "next";
import { isAdminConfigured, isAuthenticated } from "@/lib/server/auth";

type Props = { configured: boolean };

export const getServerSideProps: GetServerSideProps<Props> = async ({ req, res }) => {
    res.setHeader("Cache-Control", "no-store");
    if (isAuthenticated(req)) {
        return { redirect: { destination: "/admin", permanent: false } };
    }
    return { props: { configured: isAdminConfigured() } };
};

export default function AdminLogin({ configured }: Props) {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                await router.replace("/admin");
                return;
            }
            const data = await res.json().catch(() => ({}));
            setError(data.error ?? "Login failed");
        } catch {
            setError("Network error — please try again");
        } finally {
            setSubmitting(false);
            setPassword("");
        }
    };

    return (
        <>
            <Head>
                <title>Admin login</title>
                <meta name="robots" content="noindex, nofollow" />
            </Head>
            <div className="flex min-h-screen w-full items-center justify-center p-4">
                <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded border border-white/30 p-6">
                    <h1 className="text-2xl font-bold">Site admin</h1>
                    {!configured ? (
                        <p className="text-sm">
                            Admin login is not set up yet. Set ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET in
                            the hosting environment (see ADMIN.md).
                        </p>
                    ) : (
                        <>
                            <div>
                                <label htmlFor="password" className="mb-2 block">Password</label>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    autoFocus
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded border p-2"
                                />
                            </div>
                            {error && <p role="alert" className="text-sm">⚠ {error}</p>}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full rounded bg-white px-4 py-2 font-bold text-black disabled:opacity-50"
                            >
                                {submitting ? "Signing in…" : "Sign in"}
                            </button>
                        </>
                    )}
                </form>
            </div>
        </>
    );
}
