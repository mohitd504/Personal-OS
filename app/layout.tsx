import "./globals.css";
import Providers from "./providers";
import type { Viewport } from "next";

export const metadata = {
  title: "Personal OS",
  description: "Your life, one command center.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Personal OS" },
  icons: { apple: "/apple-icon.png", icon: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#080B14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
