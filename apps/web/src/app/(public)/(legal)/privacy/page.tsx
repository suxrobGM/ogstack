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
        This policy covers what OGStack collects, why, how long we keep it, and the controls you
        have — for account holders and for the URLs submitted to our API.
      </Typography>

      <Typography variant="h3">1. What we collect</Typography>
      <ul>
        <li>
          <strong>Account:</strong> email, name, password hash, and — for OAuth sign-in — the
          provider&apos;s subject ID. We never see your OAuth password.
        </li>
        <li>
          <strong>Billing:</strong> Stripe customer ID, subscription status, and plan. Card numbers
          never touch our servers.
        </li>
        <li>
          <strong>Projects:</strong> names, allowed domains, public IDs, and hashed API key
          fingerprints. Raw keys are shown once and never stored.
        </li>
        <li>
          <strong>Submitted URLs:</strong> we fetch the public page, parse its metadata, and store
          the seeds used to render.
        </li>
        <li>
          <strong>Generated output:</strong> images and audit reports served from our CDN until
          deleted.
        </li>
        <li>
          <strong>Request logs:</strong> IP, user-agent, endpoint, status, latency — for rate
          limits, abuse prevention, and billing reconciliation.
        </li>
      </ul>

      <Typography variant="h3">2. How we use it</Typography>
      <ul>
        <li>Generate, cache, and serve your images, icon sets, and audit reports.</li>
        <li>Authenticate sessions and secure API keys.</li>
        <li>Enforce quotas and bill correctly.</li>
        <li>Detect and prevent abuse (SSRF checks, rate limits, AI moderation).</li>
        <li>
          Send transactional email only — verification, password reset, receipts, security alerts.
          No marketing without explicit opt-in.
        </li>
      </ul>

      <Typography variant="h3">3. Legal bases (GDPR)</Typography>
      <Typography variant="body1">
        <strong>Contract</strong> to provide the service, <strong>legitimate interest</strong> for
        security and analytics, <strong>legal obligation</strong> for tax records, and{" "}
        <strong>consent</strong> for any optional marketing — withdrawable anytime.
      </Typography>

      <Typography variant="h3">4. AI processing</Typography>
      <Typography variant="body1">
        AI audit and generation features send the extracted page content (title, description, meta
        tags, short excerpts) to a language model provider. Account data, API keys, and billing are
        never sent. Our providers are contractually barred from training on your inputs and retain
        data for ≤30 days for abuse monitoring only.
      </Typography>

      <Typography variant="h3">5. Retention</Typography>
      <ul>
        <li>
          <strong>Account:</strong> deleted within 30 days of closure, except where law requires
          retention.
        </li>
        <li>
          <strong>Images &amp; reports:</strong> until you delete them. Free-plan output may be
          purged after 90 days of inactivity.
        </li>
        <li>
          <strong>Request logs:</strong> up to 30 days.
        </li>
        <li>
          <strong>Billing records:</strong> 7 years (tax obligations).
        </li>
        <li>
          <strong>Backups:</strong> encrypted snapshots rotated within 30 days.
        </li>
      </ul>

      <Typography variant="h3">6. Sub-processors</Typography>
      <ul>
        <li>
          <strong>Cloudflare</strong> — R2 storage and CDN.
        </li>
        <li>
          <strong>Stripe</strong> — payments and subscriptions.
        </li>
        <li>
          <strong>Resend</strong> — transactional email.
        </li>
        <li>
          <strong>LLM provider</strong> — AI-enabled generations and audits only.
        </li>
        <li>
          <strong>Hosting</strong> — managed EU infrastructure for the API and database.
        </li>
      </ul>
      <Typography variant="body1">
        We never sell your data or share it with advertisers. Legal disclosures are made only when
        compelled, and we notify affected users where permitted.
      </Typography>

      <Typography variant="h3">7. International transfers</Typography>
      <Typography variant="body1">
        Primary infrastructure is in the EU. Transfers to US-based sub-processors rely on Standard
        Contractual Clauses and, where applicable, the EU–US Data Privacy Framework.
      </Typography>

      <Typography variant="h3">8. Security</Typography>
      <ul>
        <li>TLS 1.2+ and HSTS for all traffic.</li>
        <li>bcrypt for passwords; SHA-256 fingerprints for API keys.</li>
        <li>Encryption at rest for the database, backups, and object storage.</li>
        <li>Least-privilege, audit-logged production access.</li>
        <li>SSRF protections on all URL-fetching endpoints.</li>
        <li>Rate limiting on authentication and generation endpoints.</li>
      </ul>

      <Typography variant="h3">9. Breach notification</Typography>
      <Typography variant="body1">
        If a breach affects your personal data, we notify affected users and, where required,
        supervisory authorities within 72 hours of discovery.
      </Typography>

      <Typography variant="h3">10. Your rights</Typography>
      <Typography variant="body1">
        You can access, correct, delete, export, restrict, or object to processing of your data.
      </Typography>
      <ul>
        <li>Export account data and generated content from settings.</li>
        <li>Delete a project to remove its images, seeds, and reports.</li>
        <li>Close your account from billing settings.</li>
        <li>
          For anything else, email <a href="mailto:privacy@ogstack.dev">privacy@ogstack.dev</a>{" "}
          (30-day response).
        </li>
        <li>
          EU/UK residents may lodge a complaint with their DPA — please contact us first so we can
          try to resolve it.
        </li>
      </ul>

      <Typography variant="h3">11. Cookies</Typography>
      <Typography variant="body1">
        Strictly necessary only: httpOnly access and refresh tokens for sessions, plus a CSRF token
        on sensitive forms. No advertising, tracking, or third-party analytics cookies.
      </Typography>

      <Typography variant="h3">12. Children</Typography>
      <Typography variant="body1">
        OGStack is not intended for children under 13 (16 in the EEA). Contact us if you believe a
        minor has created an account and we&apos;ll remove it.
      </Typography>

      <Typography variant="h3">13. Changes</Typography>
      <Typography variant="body1">
        We update this page when material changes occur. Significant changes are emailed to active
        account holders at least 14 days before taking effect.
      </Typography>

      <Typography variant="h3">14. Contact</Typography>
      <Typography variant="body1">
        Privacy and data requests: <a href="mailto:privacy@ogstack.dev">privacy@ogstack.dev</a>.
        General support: <a href="mailto:support@ogstack.dev">support@ogstack.dev</a>.
      </Typography>
    </>
  );
}
