import type { ReactElement } from "react";
import { Button, Section, Text } from "@react-email/components";
import { BaseLayout } from "../components/base-layout";
import { styles } from "../components/styles";

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
}

export function PasswordResetEmail(props: PasswordResetEmailProps): ReactElement {
  const { name, resetUrl } = props;
  return (
    <BaseLayout preview="Reset your OGStack password">
      <Text style={styles.heading}>Reset your password</Text>
      <Text style={styles.paragraph}>
        Hi {name}, we received a request to reset your password. Click the button below to choose a
        new one.
      </Text>

      <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
        <Button style={styles.button} href={resetUrl}>
          Reset Password
        </Button>
      </Section>

      <Text style={styles.mutedText}>
        This link will expire in 1 hour. If you didn't request a password reset, you can safely
        ignore this email.
      </Text>
    </BaseLayout>
  );
}
