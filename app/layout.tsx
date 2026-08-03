import "./globals.css";
import Providers from "./providers";

export const metadata = { title: "Personal OS", description: "Your life, one command center." };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body><Providers>{children}</Providers></body>
    </html>
  );
}
