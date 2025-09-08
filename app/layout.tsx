import type { Metadata, Viewport } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/nav-bar";
import { getUser } from "@/lib/db/queries";
import { SWRConfig } from "swr";

export const metadata: Metadata = {
  title: "This is a playground for Next.js",
  description:
    "A simple Next.js project to test and experiment with various features and functionalities.",
};
export const viewport: Viewport = {
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className="min-h-[100dvh]">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SWRConfig
              value={{
                fallback: {
                  // We do NOT await here
                  // Only components that read this data will suspend
                  "/api/user": getUser(),
                },
              }}
            >
              <Navbar />
              {children}
            </SWRConfig>

            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
