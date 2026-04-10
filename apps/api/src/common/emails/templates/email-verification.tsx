import type { ReactElement } from "react";
import { Button, Section, Text } from "@react-email/components";
import { BaseLayout } from "../components/base-layout";
import { styles } from "../components/styles";

interface EmailVerificationProps {
  name: string;
  verifyUrl: string;
}

export function EmailVerificationEmail(props: EmailVerificationProps): ReactElement {
  const { name, verifyUrl } = props;
  return (
    <BaseLayout preview="Verify your OGStack email address">
      <Text style={styles.heading}>Verify your email</Text>
      <Text style={styles.paragraph}>
        Hi {name}, thanks for signing up! Click the button below to verify your email address.
      </Text>

      <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
        <Button style={styles.button} href={verifyUrl}>
          Verify Email
        </Button>
      </Section>

      <Text style={styles.mutedText}>
        This link will expire in 24 hours. If you didn't create an account, you can safely ignore
        this email.
      </Text>
    </BaseLayout>
  );
}
