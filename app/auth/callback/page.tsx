"use client";

import { useEffect } from "react";

/**
 * /auth/callback
 *
 * Loaded in a hidden iframe by the customer dashboard (control.coreframecloud.com)
 * after successful login. Reads the JWT and user JSON from the URL hash and
 * persists them in this origin's localStorage so the marketing site header
 * can show the wallet balance and "My Activity" link.
 *
 * Hash format: #t=<token>&u=<encoded-user-json>
 */
export default function AuthCallbackPage() {
  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      const params = new URLSearchParams(hash);
      const token = params.get("t");
      const user = params.get("u");
      if (token) localStorage.setItem("cf_customer_token", token);
      if (user) localStorage.setItem("cf_customer_user", decodeURIComponent(user));
      // Replace URL so the token doesn't linger in browser history
      window.history.replaceState(null, "", "/auth/callback");
    } catch (_) {}
  }, []);

  // Blank page — only ever loaded inside a hidden iframe
  return null;
}
