import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINDMIRROR",
  description: "A brutally honest cognitive analysis of your AI conversation history.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="noise-bg ambient-glow">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
