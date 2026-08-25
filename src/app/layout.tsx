import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "sonner";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "RoomsCluster",
  description: "Virtual Webinar & Classroom Platform",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fontVariables} font-sans`} suppressHydrationWarning>
        <Providers>
          {children}
          <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-ink-800)",
              border: "1px solid var(--color-ink-700)",
              color: "var(--color-surface-200)",
            },
          }}
        />
        </Providers>
      </body>
    </html>
  );
}