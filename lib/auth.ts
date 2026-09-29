import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { loadRefreshToken, saveRefreshToken } from "@/lib/google-tokens";

const SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
  "https://www.googleapis.com/auth/calendar.readonly",
].join(" ");

// Exchange the long-lived refresh token for a fresh access token.
async function refreshAccessToken(token: any) {
  try {
    if (!token.refreshToken) throw new Error("no refresh token");
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw data;
    return {
      ...token,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
      // Google usually omits a new refresh_token on refresh — keep the existing one.
      refreshToken: data.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (e) {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        // No forced consent screen: Google signs straight in once access was granted.
        // The refresh token from the first consent is kept in Supabase (lib/google-tokens.ts);
        // the client re-requests consent only if none is stored (session.error "NoRefreshToken").
        params: { scope: SCOPES, access_type: "offline", include_granted_scopes: "true" },
      },
    }),
  ],
  // Stay signed in for 90 days of inactivity (refreshed on use).
  session: { strategy: "jwt", maxAge: 90 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, account }) {
      // First sign-in: capture tokens from the provider.
      if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at;
        token.error = undefined;
        const email = token.email as string | undefined;
        if (account.refresh_token) {
          token.refreshToken = account.refresh_token;
          if (email) await saveRefreshToken(email, account.refresh_token);
        } else {
          token.refreshToken = email ? await loadRefreshToken(email) : null;
          if (!token.refreshToken) token.error = "NoRefreshToken";
        }
        return token;
      }
      // Access token still valid (with a 2-minute safety buffer) — reuse it.
      if (token.expiresAt && Date.now() < (token.expiresAt as number) * 1000 - 120000) {
        return token;
      }
      // Expired — silently refresh using the refresh token.
      return await refreshAccessToken(token);
    },
    async session({ session, token }) {
      (session as any).accessToken = token.accessToken;
      (session as any).error = (token as any).error;
      return session;
    },
  },
};
