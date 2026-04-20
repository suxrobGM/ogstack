import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of the OGStack API, dashboard, and generated images.",
  keywords: ["ogstack terms", "terms of service", "api terms", "usage terms"],
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: false },
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
        These terms are a binding agreement between you and OGStack (&quot;we&quot;,
        &quot;us&quot;). By creating an account, calling the API, or embedding a public project ID,
        you accept them. If you&apos;re signing up on behalf of a company, you confirm you have
        authority to bind it.
      </Typography>

      <Typography variant="h3">1. The Service</Typography>
      <Typography variant="body1">
        OGStack generates Open Graph images, favicon bundles, and SEO audits from URLs you submit.
        Breaking API changes are announced at least 30 days in advance.
      </Typography>

      <Typography variant="h3">2. Your account</Typography>
      <ul>
        <li>One person or entity per account.</li>
        <li>Keep your information accurate and your credentials private.</li>
        <li>
          You&apos;re responsible for everything done under your account and API keys. Rotate keys
          if exposed.
        </li>
      </ul>

      <Typography variant="h3">3. Acceptable use</Typography>
      <Typography variant="body1">You must not:</Typography>
      <ul>
        <li>Submit URLs you&apos;re not authorised to fetch or represent.</li>
        <li>Bypass SSRF protections, rate limits, quotas, or domain allowlists.</li>
        <li>
          Generate content that is unlawful, infringing, defamatory, or otherwise violates our
          moderation policy.
        </li>
        <li>Launch DoS traffic, scrape, or fuzz the Service.</li>
        <li>Reverse-engineer the Service except where law forbids that restriction.</li>
        <li>Resell the Service or use it to build a substantially identical competitor.</li>
        <li>Use OGStack to send spam, phishing, or malware.</li>
      </ul>
      <Typography variant="body1">
        Violations may lead to suspension or termination, and unlawful activity may be reported.
      </Typography>

      <Typography variant="h3">4. Your content</Typography>
      <Typography variant="body1">
        You keep ownership of your URLs and generated output. You grant us a worldwide, royalty-free
        licence to host, cache, and serve that content through our CDN solely to provide the
        Service. We never train models on your content or sell it. The licence ends when you delete
        the content or close your account.
      </Typography>

      <Typography variant="h3">5. Our IP</Typography>
      <Typography variant="body1">
        The Service, templates, docs, and the OGStack name and logo belong to us. You get no rights
        beyond those in these terms. You may reference OGStack for attribution but not in a way that
        implies endorsement without consent.
      </Typography>

      <Typography variant="h3">6. Plans &amp; billing</Typography>
      <ul>
        <li>
          Non-AI renders are unlimited; AI quotas reset each billing cycle and don&apos;t roll over.
        </li>
        <li>
          Paid plans auto-renew via Stripe until cancelled. Prices exclude VAT/GST/sales tax, added
          at checkout.
        </li>
        <li>
          Cancel anytime - your plan remains active until the end of the paid period. Downgrades
          take effect at period end; higher-tier output may become read-only.
        </li>
        <li>
          Failed payments trigger retries and email notices. Accounts 14+ days overdue may be
          downgraded to free.
        </li>
        <li>
          No prorated refunds except where required by law. Billing disputes:{" "}
          <a href="mailto:billing@ogstack.dev">billing@ogstack.dev</a> within 30 days.
        </li>
      </ul>

      <Typography variant="h3">7. Uptime &amp; support</Typography>
      <Typography variant="body1">
        We target 99.9% monthly availability without a contractual SLA on self-serve plans. Support:
        one business day on paid plans, three on free. Enterprise SLAs are available on request.
      </Typography>

      <Typography variant="h3">8. Third-party services</Typography>
      <Typography variant="body1">
        The Service depends on Cloudflare, Stripe, Resend, Google reCAPTCHA, and an LLM provider.
        Their outages may affect us. Signing in or registering through our site runs Google
        reCAPTCHA, which is subject to Google&apos;s{" "}
        <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>{" "}
        and{" "}
        <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>
        .
      </Typography>

      <Typography variant="h3">9. Termination</Typography>
      <Typography variant="body1">
        You may close your account anytime. We may suspend or terminate for material breach,
        non-payment, or security risk, with notice and cure where reasonable. Fees owed, IP,
        disclaimers, liability limits, and indemnity survive termination.
      </Typography>

      <Typography variant="h3">10. Warranty disclaimer</Typography>
      <Typography variant="body1">
        The Service is provided <strong>&quot;as is&quot;</strong> without warranties of any kind.
        Generated output - especially AI-assisted - should be reviewed before publication.
      </Typography>

      <Typography variant="h3">11. Liability limit</Typography>
      <Typography variant="body1">
        To the maximum extent permitted by law, neither party is liable for indirect, incidental, or
        consequential damages, or lost profits or data. Our aggregate liability is capped at the
        fees you paid us in the 12 months before the claim. Nothing here excludes liability that
        cannot be excluded by law.
      </Typography>

      <Typography variant="h3">12. Indemnity</Typography>
      <Typography variant="body1">
        You&apos;ll defend us against third-party claims arising from the URLs or content you
        submit, your breach of these terms, or your infringement of someone else&apos;s rights.
      </Typography>

      <Typography variant="h3">13. Feedback</Typography>
      <Typography variant="body1">
        Feedback and suggestions are granted to us under a perpetual, royalty-free licence to use
        without restriction.
      </Typography>

      <Typography variant="h3">14. Governing law</Typography>
      <Typography variant="body1">
        These terms are governed by the laws of OGStack&apos;s jurisdiction of incorporation.
        Disputes go to its competent courts, except where mandatory consumer law says otherwise.
      </Typography>

      <Typography variant="h3">15. General</Typography>
      <ul>
        <li>No assignment without our consent; we may assign on a corporate transaction.</li>
        <li>If a clause is unenforceable, the rest stands and it&apos;s reformed minimally.</li>
        <li>Not enforcing a right once doesn&apos;t waive it later.</li>
        <li>These terms and the Privacy Policy are the entire agreement on this subject.</li>
        <li>Neither party is liable for delays caused by events beyond reasonable control.</li>
      </ul>

      <Typography variant="h3">16. Changes</Typography>
      <Typography variant="body1">
        We&apos;ll update this page and email active account holders at least 30 days before
        material changes take effect. Continued use after that date means you accept the revised
        terms.
      </Typography>

      <Typography variant="h3">17. Contact</Typography>
      <Typography variant="body1">
        Terms: <a href="mailto:legal@ogstack.dev">legal@ogstack.dev</a>. Billing:{" "}
        <a href="mailto:billing@ogstack.dev">billing@ogstack.dev</a>. Support:{" "}
        <a href="mailto:support@ogstack.dev">support@ogstack.dev</a>.
      </Typography>
    </>
  );
}
