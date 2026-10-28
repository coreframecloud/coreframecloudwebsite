"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "@/lib/api-base";
import { rememberReturnPath } from "@/lib/return-path";
import { apiFetch, isSignedIn } from "@/lib/session";
import { topUpHref } from "@/lib/signup-consent";

const API = API_BASE;

type State =
  | { kind: "loading" }
  | { kind: "signin" }
  | { kind: "expired" }
  | { kind: "error" };

export default function PayView({ token }: { token: string }) {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const here = `/pay/${token}`;
    if (!isSignedIn()) {
      rememberReturnPath(here);
      setState({ kind: "signin" });
      return;
    }
    let live = true;
    (async () => {
      try {
        const res = await apiFetch(`${API}/payments/pay-token/${encodeURIComponent(token)}`);
        if (res.status === 401) {
          rememberReturnPath(here);
          if (live) setState({ kind: "signin" });
          return;
        }
        if (!res.ok) {
          if (live) setState({ kind: res.status === 404 ? "expired" : "error" });
          return;
        }
        const data = (await res.json()) as { amount: number };
        window.location.replace(topUpHref(Number(data.amount)));
      } catch {
        if (live) setState({ kind: "error" });
      }
    })();
    return () => { live = false; };
  }, [token]);

  const card = "cf-glass mx-auto w-full max-w-md p-5 sm:p-7";
  const btn =
    "cf-btn-primary inline-flex min-h-11 w-full items-center justify-center rounded-cf px-4 text-center text-sm font-semibold";
  return (
    <main className="flex min-h-[70vh] w-full items-center justify-center overflow-x-hidden px-4 py-16">
      <div className={card}>
        {state.kind === "loading" && (
          <p className="text-center text-[15px] leading-7 text-ink-2" role="status">
            Opening your top-up…
          </p>
        )}
        {state.kind === "signin" && (
          <>
            <h1 className="text-xl font-semibold text-ink">Sign in to finish your top-up</h1>
            <p className="mt-2 text-[15px] leading-7 text-ink-2">
              Sign in with the email you used before, and we&apos;ll bring you straight back here.
            </p>
            <a href="/login" className={`${btn} mt-5`}>Sign in</a>
          </>
        )}
        {state.kind === "expired" && (
          <>
            <h1 className="text-xl font-semibold text-ink">This link has expired</h1>
            <p className="mt-2 text-[15px] leading-7 text-ink-2">
              It may already have been used, or it&apos;s more than a week old. You can add
              funds to your wallet any time from your account.
            </p>
            <a href="/my-activity?topup=1" className={`${btn} mt-5`}>Add funds</a>
          </>
        )}
        {state.kind === "error" && (
          <>
            <h1 className="text-xl font-semibold text-ink">Something went wrong</h1>
            <p className="mt-2 text-[15px] leading-7 text-ink-2">
              Please try again, or add funds from your account.
            </p>
            <a href="/my-activity?topup=1" className={`${btn} mt-5`}>Add funds</a>
          </>
        )}
      </div>
    </main>
  );
}
