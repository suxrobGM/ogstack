import "./globals.css";
import type { PropsWithChildren, ReactElement } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import { ThemeProvider } from "@/providers";

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OGStack",
  description: "Developer-first API platform for generating beautiful Open Graph images",
};

export default function RootLayout({ children }: PropsWithChildren): ReactElement {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
        <AppRouterCacheProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
