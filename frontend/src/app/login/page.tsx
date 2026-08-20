"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand";
import { useGuestLogin } from "@/lib/queries";
import { isLoggedIn, setToken } from "@/lib/auth";
import { IS_REMOTE_API } from "@/lib/api";
import { GoogleIcon } from "@/components/google-icon";

export default function LoginPage() {
  const router = useRouter();
  const guestLogin = useGuestLogin();
  const [redirecting, setRedirecting] = useState(false);
  // Set once the request has been running long enough that the user deserves
  // an explanation (see the cold-start note below).
  const [slowRequest, setSlowRequest] = useState(false);

  // Already logged in? Straight to the app.
  useEffect(() => {
    if (isLoggedIn()) {
      router.replace("/tasks");
    }
  }, [router]);

  function handleGuestLogin() {
    setSlowRequest(false);
    const slowTimer = setTimeout(() => setSlowRequest(true), 3000);

    guestLogin.mutate(undefined, {
      onSuccess: ({ accessToken }) => {
        setToken(accessToken);
        setRedirecting(true);
        router.replace("/tasks");
      },
      onError: (error) => toast.error(error.message),
      onSettled: () => clearTimeout(slowTimer),
    });
  }

  const busy = guestLogin.isPending || redirecting;

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6">
      <BrandLogo />

      <div className="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6">
          <header className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Let&apos;s get back on track
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to login to your account.
            </p>
          </header>

          <div className="flex flex-col gap-3">
            <Button className="w-full" onClick={handleGuestLogin} disabled={busy}>
              {busy ? "Setting up your workspace…" : "Continue as Guest"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                toast.info("Google login is not part of this demo — use guest login.")
              }
              disabled={busy}
            >
              <GoogleIcon />
              Login with Google
            </Button>
          </div>

          {/*
            The hosted API runs on Render's free tier, which suspends when idle.
            Rather than hide that behind a spinner, say so: a heads-up before the
            click, and a clearer message once the request is visibly slow.
          */}
          {IS_REMOTE_API && (
            <p
              className="text-center text-xs text-muted-foreground"
              role={slowRequest ? "status" : undefined}
              aria-live={slowRequest ? "polite" : undefined}
            >
              {slowRequest ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 className="size-3 animate-spin" aria-hidden />
                  Still waking the server up — this can take up to a minute.
                </span>
              ) : (
                <>
                  Heads up: the API is hosted on Render&apos;s free tier and sleeps
                  when idle, so the first sign-in can take up to a minute.
                </>
              )}
            </p>
          )}
        </div>
      </div>

      <p className="max-w-xs text-center text-sm text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-foreground">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>
      </p>
    </main>
  );
}
