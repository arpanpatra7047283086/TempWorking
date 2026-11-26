"use client";

import dynamic from "next/dynamic";
import useSWR from "swr";
import InventoryWorkspace from "../../components/inventory/InventoryWorkspace.jsx";
import InventoryLoadingBackdrop from "../../components/inventory/InventoryLoadingBackdrop.jsx";
import { PageLoadingIndicator } from "../../components/page-refresh-overlay.jsx";

const LoginWithRouter = dynamic(
  () => import("../../components/auth/LoginWithRouter.jsx"),
  { ssr: false },
);

const fetcher = async (url) => { const response = await fetch(url, { cache: "no-store" }); if (response.status === 401) return null; const data = await response.json(); if (!response.ok) throw new Error(data.error || "Unable to verify session."); return data.user; };

export default function InventoryPage() {
  const { data: user, error, isLoading, mutate } = useSWR("/api/auth/me", fetcher, { shouldRetryOnError: false, revalidateOnFocus: false });
  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    await mutate(null, false);
  }
  if (isLoading && user === undefined) return <><InventoryLoadingBackdrop /><PageLoadingIndicator label="Checking secure session…" /></>;
  if (error) return <main className="auth-loading"><p role="alert">{error.message}</p><button className="primary-button" onClick={() => mutate()} type="button">Try again</button></main>;
  if (!user) return <LoginWithRouter />;
  return <InventoryWorkspace user={user} onSignOut={signOut} />;
}
