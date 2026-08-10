import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [{ title: "Signing in — LST" }],
  }),
  component: AuthCallbackPage,
});

/**
 * Completes an OAuth sign-in that came back as a full-page redirect.
 *
 * The Lovable auth broker only hands tokens back in-process when the app runs
 * inside an iframe; in a normal tab it redirects here instead, and nothing else
 * in the app turns that redirect into a Supabase session. This route reads the
 * tokens off the URL and calls setSession so the /_authenticated guard sees it.
 */
function readTokensFromUrl(): { access_token: string; refresh_token: string } | null {
  if (typeof window === "undefined") return null;

  // The broker may use either the fragment (implicit-style) or the query string.
  const sources = [
    new URLSearchParams(window.location.hash.replace(/^#/, "")),
    new URLSearchParams(window.location.search),
  ];

  for (const params of sources) {
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    if (access_token && refresh_token) {
      return { access_token, refresh_token };
    }
  }

  return null;
}

function readErrorFromUrl(): string | null {
  if (typeof window === "undefined") return null;

  for (const params of [
    new URLSearchParams(window.location.hash.replace(/^#/, "")),
    new URLSearchParams(window.location.search),
  ]) {
    const error = params.get("error_description") ?? params.get("error");
    if (error) return error;
  }

  return null;
}

function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function complete() {
      const providerError = readErrorFromUrl();
      if (providerError) {
        if (!cancelled) setError(providerError);
        return;
      }

      const tokens = readTokensFromUrl();

      if (tokens) {
        const { error: setSessionError } = await supabase.auth.setSession(tokens);
        if (setSessionError) {
          if (!cancelled) setError(setSessionError.message);
          return;
        }
        // Drop the tokens from the address bar before moving on.
        window.history.replaceState({}, "", window.location.pathname);
        if (!cancelled) router.navigate({ to: "/dashboard" });
        return;
      }

      // No tokens on the URL: supabase-js may already have consumed them via
      // its own detectSessionInUrl handling, so fall back to whatever session
      // it holds before giving up.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        if (!cancelled) router.navigate({ to: "/dashboard" });
        return;
      }

      if (!cancelled) {
        setError("The sign-in provider did not return a session.");
      }
    }

    void complete();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            {error ? "Sign-in failed" : "Signing you in…"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {error ?? "Completing your session."}
          </CardDescription>
        </CardHeader>
        {error && (
          <CardContent>
            <p className="text-center text-xs text-muted-foreground">
              <Link to="/auth/login" className="text-primary hover:underline">
                Back to sign in
              </Link>
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
