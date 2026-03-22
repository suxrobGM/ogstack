import type { ReactElement, ReactNode } from "react";
import { Body, Container, Head, Hr, Html, Preview, Section, Text } from "@react-email/components";
import { t, type Language } from "@/i18n";
import { commonTranslations } from "@/i18n/translations/common";
import { brand, styles } from "./styles";

interface BaseLayoutProps {
  children: ReactNode;
  preview: string;
  lang: Language;
}

/** Shared email layout with Mehnatsevar branding, header, and footer. */
export function BaseLayout(props: BaseLayoutProps): ReactElement {
  const { children, preview, lang } = props;

  return (
    <Html lang={lang.toLowerCase()}>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", padding: "24px 16px" }}>
          <Container style={styles.container}>
            <Section style={styles.headerBanner}>
              <Text style={styles.brandName}>Mehnatsevar</Text>
            </Section>

            <Section style={styles.content}>{children}</Section>

            <Hr style={styles.hr} />

            <Section style={styles.footerSection}>
              <Text style={styles.footer}>{t(commonTranslations, "footerTagline", lang)}</Text>
              <Text style={{ ...styles.footer, marginTop: "4px" }}>
                {t(commonTranslations, "footerLocation", lang)}
              </Text>
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
              © {new Date().getFullYear()} Mehnatsevar
            </Text>
          </Container>
        </Container>
      </Body>
    </Html>
  );
}
