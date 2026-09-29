"use client";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "@/components/Dashboard";

// After a deliberate sign-out we stay on this page instead of bouncing straight back in.
const SIGNED_OUT = "pos_signed_out";
const flag = { get: () => { try { return sessionStorage.getItem(SIGNED_OUT) === "1"; } catch { return false; } }, set: (on: boolean) => { try { on ? sessionStorage.setItem(SIGNED_OUT, "1") : sessionStorage.removeItem(SIGNED_OUT); } catch {} } };

export default function Page() {
  const { data: session, status } = useSession();
  const [redirecting, setRedirecting] = useState(false);
  const error = (session as any)?.error as string | undefined;

  useEffect(() => {
    // Signed out and didn't just press "Sign out": go straight to Google (one click or none).
    if (status === "unauthenticated" && !flag.get()) { setRedirecting(true); signIn("google"); }
    // No stored refresh token (first sign-in after this change, or access revoked): ask
    // Google for consent once so Gmail/Calendar keep working. Guarded against loops.
    if (status === "authenticated" && (error === "NoRefreshToken" || error === "RefreshAccessTokenError")) {
      let asked = false; try { asked = sessionStorage.getItem("pos_consent_asked") === "1"; sessionStorage.setItem("pos_consent_asked", "1"); } catch {}
      if (!asked) { setRedirecting(true); signIn("google", undefined, { prompt: "consent" }); }
    }
  }, [status, error]);

  if (status === "loading" || redirecting)
    return <div className="center"><div className="muted">{redirecting ? "Signing you in with Google…" : "Loading…"}</div></div>;
  if (!session)
    return (
      <div className="center">
        <div className="signin card">
          <div className="mark" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 760 }}>Personal Dashboard</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            Your fitness, nutrition, study, Gmail and Calendar — all in one personal dashboard.
          </p>
          <button className="btn" onClick={() => { flag.set(false); signIn("google"); }} style={{ marginTop: 8 }}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  return <Dashboard onSignOut={() => { flag.set(true); signOut(); }} name={session.user?.name || "You"} />;
}
