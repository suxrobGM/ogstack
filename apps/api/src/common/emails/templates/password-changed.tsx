import type { ReactElement } from "react";
import { Text } from "@react-email/components";
import { BaseLayout } from "../components/base-layout";
import { styles } from "../components/styles";

interface PasswordChangedProps {
  name: string;
}

export function PasswordChangedEmail(props: PasswordChangedProps): ReactElement {
  const { name } = props;
  return (
    <BaseLayout preview="Your OGStack password was changed">
      <Text style={styles.heading}>Password changed</Text>
      <Text style={styles.paragraph}>
        Hi {name}, your password has been successfully changed. You can now use your new password to
        sign in.
      </Text>

      <Text style={styles.mutedText}>
        If you didn't make this change, please reset your password immediately or contact support.
      </Text>
    </BaseLayout>
  );
}
