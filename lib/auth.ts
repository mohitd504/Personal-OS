import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
        params: { scope: SCOPES, access_type: "offline", prompt: "consent" },
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // First sign-in: capture tokens from the provider.
      if (account) {
        token.accessToken = account.access_token;
        token.expiresAt = account.expires_at;
        if (account.refresh_token) token.refreshToken = account.refresh_token;
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
