import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — OGStack",
  description:
    "The terms that govern your use of the OGStack API, dashboard, and generated images.",
};

export default function TermsPage(): ReactElement {
  return (
    <>
      <Stack spacing={2} sx={{ mb: 6 }}>
        <Typography variant="overline" sx={{ color: "accent.primary" }}>
          Legal
        </Typography>
        <Typography variant="h1">Terms of Service</Typography>
        <Typography variant="captionMuted">Last updated: 2026-04-15</Typography>
      </Stack>

      <Typography variant="body1">
        These terms govern your use of OGStack. By creating an account or calling the API you agree
        to them.
      </Typography>

      <Typography variant="h3">1. The service</Typography>
      <Typography variant="body1">
        OGStack generates Open Graph preview images from URLs you submit. The service includes the
        API, dashboard, audit tool, and any AI-powered features on the tiers that include them.
      </Typography>

      <Typography variant="h3">2. Your account</Typography>
      <ul>
        <li>You are responsible for everything done under your account and API keys.</li>
        <li>Keep API keys secret. Rotate immediately if you suspect exposure.</li>
        <li>You must be 13 or older to create an account.</li>
      </ul>

      <Typography variant="h3">3. Acceptable use</Typography>
      <ul>
        <li>Don&apos;t submit URLs you do not have permission to fetch or represent.</li>
        <li>Don&apos;t attempt to bypass SSRF protections, rate limits, or quota enforcement.</li>
        <li>
          Don&apos;t use AI generation to produce content that violates our moderation policy.
        </li>
        <li>Respect the allowed-domain list configured on each project.</li>
      </ul>

      <Typography variant="h3">4. Ownership of generated images</Typography>
      <Typography variant="body1">
        You own the generated output for URLs you are entitled to represent. You grant OGStack a
        limited license to cache, store, and serve those images through our CDN on your behalf.
      </Typography>

      <Typography variant="h3">5. Plans, quotas, and billing</Typography>
      <ul>
        <li>Non-AI renders are unlimited on every plan.</li>
        <li>AI image and AI audit quotas reset monthly.</li>
        <li>Downgrades take effect at end of billing period.</li>
        <li>Images generated on a higher tier may be locked after downgrade.</li>
      </ul>

      <Typography variant="h3">6. Uptime &amp; support</Typography>
      <Typography variant="body1">
        We target high availability but do not guarantee SLA on self-serve plans. Enterprise SLAs
        are available on request.
      </Typography>

      <Typography variant="h3">7. Termination</Typography>
      <Typography variant="body1">
        You may cancel at any time from billing settings. We may suspend or terminate accounts that
        violate these terms or pose a security risk.
      </Typography>

      <Typography variant="h3">8. Liability</Typography>
      <Typography variant="body1">
        The service is provided &quot;as is&quot; without warranties of any kind. Our aggregate
        liability is limited to fees paid in the 12 months preceding a claim.
      </Typography>

      <Typography variant="h3">9. Changes</Typography>
      <Typography variant="body1">
        We may revise these terms and will update the &quot;last updated&quot; date. Material
        changes are communicated via email to account holders.
      </Typography>
    </>
  );
}
