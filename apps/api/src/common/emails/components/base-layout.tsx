import type { ReactElement, ReactNode } from "react";
import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import { brand, styles } from "./styles";

interface BaseLayoutProps {
  children: ReactNode;
  preview: string;
}

/** Shared email layout with OGStack branding, header, and footer. */
export function BaseLayout(props: BaseLayoutProps): ReactElement {
  const { children, preview } = props;

  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" }}>
          <Container style={styles.container}>
            <Section style={styles.headerBanner}>
              <Text style={styles.brandName}>OGStack</Text>
            </Section>

            <Section style={styles.content}>{children}</Section>

            <Hr style={styles.hr} />

            <Section style={styles.footerSection}>
              <Text style={styles.footer}>Beautiful social previews. Zero effort.</Text>
            </Section>
          </Container>

          <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "16px 0" }}>
            <Text
              style={{
                fontSize: "12px",
                color: brand.textSecondary,
                textAlign: "center" as const,
                margin: "0",
                lineHeight: "18px",
              }}
            >
              © {new Date().getFullYear()} OGStack
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}
