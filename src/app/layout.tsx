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
  verification: {
    other: {
      "msvalidate.01": "3345CF8BD5B4FA4F9374594861B00F78",
    },
  },
  openGraph: {
    title: "RoomsCluster",
    description:
      "Virtual Webinar & Classroom Platform — enrollment, live sessions, and access control built for training academies.",
    url: "https://roomscluster.com",
    siteName: "RoomsCluster",
    images: [
      {
        url: "https://roomscluster.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "RoomsCluster — Virtual Webinar & Classroom Platform",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoomsCluster",
    description: "Virtual Webinar & Classroom Platform",
    images: ["https://roomscluster.com/og-image.jpg"],
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
