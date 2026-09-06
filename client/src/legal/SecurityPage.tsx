import { LegalPage } from "./LegalPage";

export function SecurityPage() {
  return (
    <LegalPage title="Security" updated="September 6, 2026">
      <p>
        Security is core to what Cappr is being built to do. Here's how we
        handle the little data this site collects today.
      </p>

      <h2>Data in transit</h2>
      <p>
        This site is served over HTTPS, so anything you submit — including your
        email — is encrypted in transit.
      </p>

      <h2>Data minimization</h2>
      <p>
        We only collect what we need: your email for the early access list, plus
        anonymized usage analytics. Less data means less to protect.
      </p>

      <h2>Providers</h2>
      <p>
        We rely on reputable infrastructure and email providers to run the
        waitlist and this site, and we limit access to the data they hold.
      </p>

      <h2>Reporting an issue</h2>
      <p>
        If you believe you've found a security vulnerability, please email{" "}
        <a href="mailto:security@cappr.dev">security@cappr.dev</a>. We appreciate
        responsible disclosure and will respond as quickly as we can.
      </p>
    </LegalPage>
  );
}
