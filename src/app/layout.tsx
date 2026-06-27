import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RoomsCluster",
  description: "Virtual Webinar & Classroom Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#1f2937", // gray-800
              border: "1px solid #374151", // gray-700
              color: "#f3f4f6", // gray-100
            },
          }}
        />
        </Providers>
      </body>
    </html>
  );
}