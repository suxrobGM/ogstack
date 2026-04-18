import "nextra-theme-docs/style.css";
import "./global.css";
import { type PropsWithChildren, type ReactElement } from "react";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";

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
      <b style={{ fontSize: 16, letterSpacing: "-0.5px" }}>
        og<span style={{ color: "#10b981" }}>stack</span>
      </b>
    }
    projectLink="https://github.com/suxrobgm/ogstack"
  />
);

const footer = (
  <Footer>
    <span>© {new Date().getFullYear()} OGStack</span>
  </Footer>
);

export default async function RootLayout(props: PropsWithChildren): Promise<ReactElement> {
  const { children } = props;

  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout
          navbar={navbar}
          pageMap={await getPageMap()}
          docsRepositoryBase="https://github.com/suxrobgm/ogstack/tree/main/apps/docs"
          footer={footer}
          sidebar={{ defaultMenuCollapseLevel: 1 }}
          editLink="Edit this page on GitHub"
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
