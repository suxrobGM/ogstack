import type { ReactElement } from "react";
import { Button, Section, Text } from "@react-email/components";
import { BaseLayout } from "../components/base-layout";
import { styles } from "../components/styles";

interface EmailChangedProps {
  name: string;
  newEmail: string;
  verifyUrl: string;
}

export function EmailChangedEmail(props: EmailChangedProps): ReactElement {
  const { name, newEmail, verifyUrl } = props;
  return (
    <BaseLayout preview="Verify your new OGStack email address">
      <Text style={styles.heading}>Email address updated</Text>
      <Text style={styles.paragraph}>
        Hi {name}, your email address has been changed to <strong>{newEmail}</strong>. Please verify
        your new email by clicking the button below.
      </Text>

      <Section style={{ textAlign: "center" as const, margin: "32px 0" }}>
        <Button style={styles.button} href={verifyUrl}>
          Verify New Email
        </Button>
      </Section>

      <Text style={styles.mutedText}>
        This link will expire in 24 hours. If you didn't make this change, please secure your
        account immediately.
      </Text>
    </BaseLayout>
  );
}
