import "nextra-theme-docs/style.css";
import "./global.css";
import { type PropsWithChildren, type ReactElement } from "react";
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
