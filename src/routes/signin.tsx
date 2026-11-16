import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PanelBoundary } from "@/components/error-boundary";
import { lovable } from "@/integrations/lovable";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { hasDemoSession } from "@/lib/use-portal-session";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Client Access — Obsidian Atelier" },
      { name: "description", content: "Sign in to your Obsidian Atelier client workspace." },
      { property: "og:title", content: "Client Access — Obsidian Atelier" },
      { property: "og:description", content: "Enter the Obsidian Atelier client portal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmationPending, setConfirmationPending] = useState(false);

  const submitAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) {
      toast.error("Client sign-in is unavailable. You can still explore the preview workspace.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Welcome back to your workspace.");
        await navigate({ to: "/workspace", replace: true });
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName.trim(), company: company.trim() },
          },
        });
        if (error) throw error;
        if (data.session) {
          toast.success("Your client account is ready.");
          await navigate({ to: "/workspace", replace: true });
        } else {
          setConfirmationPending(true);
          toast.success("Check your email to confirm your account.");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't complete sign-in.");
    } finally {
      setBusy(false);
    }
  };

  const viewDemo = () => {
    setBusy(true);
    window.setTimeout(() => {
      window.localStorage.setItem("studio_demo_session", "active");
      toast.success("Preview workspace is ready.");
      void navigate({ to: "/workspace", replace: true });
    }, 1200);
  };

  const oauth = async (provider: "google" | "lovable") => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error(result.error.message || "That sign-in method is unavailable.");
      setBusy(false);
    } else if (result.redirected) {
      return;
    } else {
      await navigate({ to: "/workspace", replace: true });
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Link to="/showcase" className="absolute left-5 top-5 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:left-8 sm:top-8">
        <ArrowLeft className="size-4" /> Back to showcase
      </Link>
      <PanelBoundary>
        <section className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></span>
            <p className="mt-5 font-mono text-[10px] uppercase text-primary">Obsidian Atelier · Client portal</p>
            <h1 className="headline mt-3 font-display text-2xl font-semibold">{mode === "signin" ? "Your work, in motion." : "Start your workspace."}</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{mode === "signin" ? "Sign in to review work, share feedback, and keep your team aligned." : "Create a secure account to follow your project from the first brief."}</p>
          </div>

          {confirmationPending ? (
            <div className="mt-8 border-y border-border py-7 text-center">
              <CheckCircle2 className="mx-auto size-7 text-primary" />
              <h2 className="mt-3 font-medium">Confirm your email</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">We sent a confirmation link to <span className="text-foreground">{email}</span>. Open it to finish setting up your workspace.</p>
            </div>
          ) : (
            <form className="mt-7 space-y-4" onSubmit={(event) => void submitAuth(event)}>
              {mode === "signup" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1.5 text-xs text-muted-foreground">Your name<input autoComplete="name" required maxLength={120} value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
                  <label className="space-y-1.5 text-xs text-muted-foreground">Company<input autoComplete="organization" maxLength={160} value={company} onChange={(event) => setCompany(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
                </div>
              ) : null}
              <label className="block space-y-1.5 text-xs text-muted-foreground">Work email<input type="email" autoComplete="email" required maxLength={255} placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /></label>
              <label className="block space-y-1.5 text-xs text-muted-foreground">Password<input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="h-10 w-full rounded-xl border border-border bg-canvas px-3 text-sm text-foreground outline-none focus:border-primary" /></label>
              <Button type="submit" disabled={busy || !isSupabaseConfigured} className="h-10 w-full rounded-xl">
                {busy ? <LoaderCircle className="animate-spin" /> : null}{mode === "signin" ? "Sign in" : "Create account"}
              </Button>
              {!isSupabaseConfigured ? <p className="text-center text-xs text-muted-foreground">Live sign-in needs workspace credentials; preview access is available below.</p> : null}
            </form>
          )}

          {isSupabaseConfigured && !confirmationPending ? (
            <div className="mt-4 grid gap-2">
              <Button type="button" variant="outline" disabled={busy} onClick={() => void oauth("google")} className="h-10 w-full rounded-xl border-[#747775] bg-white text-[#1F1F1F] hover:bg-white/90">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"/></svg>
                Continue with Google
              </Button>
              <Button type="button" variant="ghost" disabled={busy} onClick={() => void oauth("lovable")} className="h-10 w-full rounded-xl">Continue with Lovable</Button>
            </div>
          ) : null}

          {!confirmationPending ? (
            <>
              {isSupabaseConfigured ? <div className="my-5 flex items-center gap-3 text-[10px] uppercase text-muted-foreground"><span className="h-px flex-1 bg-border" />Preview access<span className="h-px flex-1 bg-border" /></div> : null}
              <Button type="button" variant="outline" onClick={viewDemo} disabled={busy} className="h-10 w-full rounded-xl border-primary/40 text-primary hover:bg-primary/10">
                {busy ? <LoaderCircle className="animate-spin" /> : null}{busy ? "Preparing preview…" : "View Demo"}
              </Button>
            </>
          ) : null}

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "New to the studio?" : "Already have an account?"}{" "}
            <button type="button" className="font-medium text-foreground underline underline-offset-4" onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setConfirmationPending(false); }}>{mode === "signin" ? "Create an account" : "Sign in"}</button>
          </p>
        </section>
      </PanelBoundary>
    </main>
  );
}