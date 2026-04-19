import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How OGStack collects, uses, and protects data for account holders and URLs submitted to the platform.",
  keywords: ["ogstack privacy", "privacy policy", "data protection", "gdpr"],
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: false },
};

export default function PrivacyPage(): ReactElement {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 6 }}>
        <Typography variant="overline" sx={{ color: "accent.primary" }}>
          Legal
        </Typography>
        <Typography variant="h1">Privacy Policy</Typography>
        <Typography variant="captionMuted">Last updated: 2026-04-15</Typography>
      </Stack>

      <Typography variant="body1">
        This policy describes what we collect, why, and the controls you have. It covers both
        account holders and the URLs submitted to the OGStack API.
      </Typography>

      <Typography variant="h3">1. Information we collect</Typography>
      <ul>
        <li>
          <strong>Account data:</strong> email, name, hashed password, OAuth identifiers, billing
          data handled by Stripe.
        </li>
        <li>
          <strong>Project data:</strong> project names, allowed domains, API key fingerprints (never
          the raw secret after creation).
        </li>
        <li>
          <strong>URLs you submit:</strong> for every generation, we fetch the public page at that
          URL, read its metadata and body text, and store the derived seeds used for rendering.
        </li>
        <li>
          <strong>Logs:</strong> request metadata (IP, user-agent, latency, status), used for abuse
          prevention and billing reconciliation. Retained up to 30 days.
        </li>
      </ul>

      <Typography variant="h3">2. How we use it</Typography>
      <ul>
        <li>To generate, cache, and serve your OG images.</li>
        <li>To authenticate sessions and secure API keys.</li>
        <li>To enforce plan quotas and bill appropriately.</li>
        <li>To detect and prevent abuse (rate limits, SSRF checks, content moderation).</li>
      </ul>

      <Typography variant="h3">3. AI processing</Typography>
      <Typography variant="body1">
        Page analysis and audit recommendations call a language model provider. The content sent is
        limited to what's needed to render your preview — typically the page title, description,
        meta tags, and short body excerpts. We do not send account data.
      </Typography>

      <Typography variant="h3">4. Data sharing</Typography>
      <ul>
        <li>
          Infrastructure providers (Cloudflare R2 + CDN, Stripe, the LLM provider on your tier).
        </li>
        <li>Never sold. Never shared for advertising.</li>
      </ul>

      <Typography variant="h3">5. Your rights</Typography>
      <ul>
        <li>Request export or deletion of your account data at any time.</li>
        <li>Delete a project to remove associated images, logs, and cached seeds.</li>
        <li>
          Contact us at <a href="mailto:privacy@ogstack.dev">privacy@ogstack.dev</a>.
        </li>
      </ul>

      <Typography variant="h3">6. Cookies</Typography>
      <Typography variant="body1">
        We use strictly necessary cookies for authentication (access + refresh tokens stored
        httpOnly). No third-party tracking cookies.
      </Typography>

      <Typography variant="h3">7. Changes</Typography>
      <Typography variant="body1">
        We update this page when material changes happen. The &quot;last updated&quot; date reflects
        the most recent revision.
      </Typography>
    </>
  );
}
