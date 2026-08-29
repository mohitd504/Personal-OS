"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Dashboard from "@/components/Dashboard";

export default function Page() {
  const { data: session, status } = useSession();
  if (status === "loading")
    return <div className="center"><div className="muted">Loading…</div></div>;
  if (!session)
    return (
      <div className="center">
        <div className="signin card">
          <div className="mark" style={{ margin: "0 auto 16px" }} />
          <h1 style={{ margin: "0 0 6px", fontSize: 24, fontWeight: 760 }}>Personal OS</h1>
          <p className="muted" style={{ marginTop: 0 }}>
            Your fitness, nutrition, study, Gmail and Calendar — one live command center.
          </p>
          <button className="btn" onClick={() => signIn("google")} style={{ marginTop: 8 }}>
            Sign in with Google
          </button>
        </div>
      </div>
    );
  return <Dashboard onSignOut={() => signOut()} name={session.user?.name || "You"} />;
}
