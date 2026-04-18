import "nextra-theme-docs/style.css";
import "./global.css";
import { type PropsWithChildren, type ReactElement } from "react";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata = {
  title: {
    default: "OGStack Docs",
    template: "%s | OGStack Docs",
  },
  description:
    "Branded Open Graph images, blog covers, and favicon sets. AI reads your page, one meta tag renders it.",
};

const navbar = (
  <Navbar
    logo={
      <span
        style={{
          fontFamily: "var(--font-bricolage)",
          fontWeight: 600,
          fontSize: 18,
          letterSpacing: "-0.02em",
        }}
      >
        og<span style={{ color: "#10b981" }}>stack</span>
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
      className={`${dmSans.variable} ${jetBrainsMono.variable} ${bricolage.variable}`}
    >
      <Head
        color={{
          hue: 160,
          saturation: 84,
          lightness: { dark: 50, light: 39 },
        }}
        backgroundColor={{ dark: "#0a0a10", light: "#fafafa" }}
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
