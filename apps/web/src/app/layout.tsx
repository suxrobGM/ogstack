import "./globals.css";
import type { PropsWithChildren, ReactElement } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import { QueryProvider, ThemeProvider } from "@/providers";
import { NotificationProvider } from "@/providers/notification-provider";
import { PlanLimitProvider } from "@/providers/subscription-provider";

const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_URL = "https://ogstack.dev";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OGStack - Branded OG images, blog covers & favicons for any URL",
    template: "%s · OGStack",
  },
  description:
    "Developer-first API platform for branded Open Graph images, blog covers, and favicon sets. AI reads your page content and renders contextual previews from one meta tag or API call.",
  applicationName: "OGStack",
  authors: [{ name: "OGStack", url: SITE_URL }],
  creator: "OGStack",
  publisher: "OGStack",
  keywords: [
    "open graph",
    "og image",
    "og image generator",
    "social share image",
    "link preview",
    "twitter card",
    "blog cover generator",
    "favicon generator",
    "app icon generator",
    "meta tags",
    "seo preview",
    "og audit",
    "ai image generation",
    "content-aware ai",
    "developer api",
    "next.js",
    "nextjs og",
    "vercel og alternative",
    "cloudinary alternative",
    "ogstack",
  ],
  referrer: "origin-when-cross-origin",
  formatDetection: { email: false, address: false, telephone: false },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    siteName: "OGStack",
    locale: "en_US",
    url: SITE_URL,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "OGStack - Branded OG images, blog covers & favicons",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@ogstack",
    creator: "@ogstack",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  alternates: { canonical: "/" },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F3ED" },
    { media: "(prefers-color-scheme: dark)", color: "#1C1916" },
  ],
  colorScheme: "light",
};

export default function RootLayout({ children }: PropsWithChildren): ReactElement {
  return (
    <html lang="en">
      <body
        className={`${newsreader.variable} ${ibmPlexSans.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AppRouterCacheProvider>
          <ThemeProvider>
            <QueryProvider>
              <PlanLimitProvider>
                <NotificationProvider>{children}</NotificationProvider>
              </PlanLimitProvider>
            </QueryProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
