import "nextra-theme-docs/style.css";
import "./global.css";
import { type PropsWithChildren, type ReactElement } from "react";
import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import Image from "next/image";
import { Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";

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

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const DOCS_URL = "https://docs.ogstack.dev";

export const metadata: Metadata = {
  metadataBase: new URL(DOCS_URL),
  title: {
    default: "OGStack Docs — Guides, API reference & quickstarts",
    template: "%s · OGStack Docs",
  },
  description:
    "Official OGStack documentation. Guides, quickstarts, concepts, and the full API reference for branded Open Graph images, blog covers, and favicon sets — AI reads your page, one meta tag renders it.",
  applicationName: "OGStack Docs",
  authors: [{ name: "OGStack", url: "https://ogstack.dev" }],
  creator: "OGStack",
  publisher: "OGStack",
  keywords: [
    "ogstack docs",
    "ogstack documentation",
    "og image api docs",
    "open graph api reference",
    "ogstack quickstart",
    "ogstack guides",
    "og image sdk",
    "meta tag integration",
    "ai og image api",
    "favicon api docs",
    "blog cover api",
    "developer documentation",
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
    siteName: "OGStack Docs",
    locale: "en_US",
    url: DOCS_URL,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "OGStack Docs — Guides, API reference, and quickstarts",
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
  colorScheme: "light dark",
};

const navbar = (
  <Navbar
    logo={
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          fontFamily: "var(--font-ibm-plex)",
          fontWeight: 600,
          fontSize: 17,
          letterSpacing: "-0.5px",
        }}
      >
        <Image src="/logo-mark.svg" alt="Logo" width={26} height={26} />
        <span style={{ marginLeft: 8 }}>
          og<span style={{ color: "#B45309" }}>stack</span>
        </span>
      </span>
    }
    projectLink="https://github.com/suxrobgm/ogstack"
  />
);

export default async function RootLayout(props: PropsWithChildren): Promise<ReactElement> {
  const { children } = props;

  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      className={`${ibmPlexSans.variable} ${jetBrainsMono.variable} ${newsreader.variable}`}
    >
      <Head
        color={{
          hue: 26,
          saturation: 90,
          lightness: { dark: 52, light: 37 },
        }}
        backgroundColor={{ dark: "#1C1916", light: "#F7F3ED" }}
      />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/suxrobgm/ogstack/tree/main/apps/docs"
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          editLink="Edit this page on GitHub"
          feedback={{ content: null }}
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
