import { LegalPage } from "./LegalPage";

export function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 6, 2026">
      <p>
        Cappr is in active development. This policy explains what we collect
        while we build the product and gauge interest from teams like yours.
      </p>

      <h2>What we collect</h2>
      <p>
        If you join the early access list, we collect the email address you
        provide. If you email us, we keep that correspondence. We also collect
        basic, anonymized analytics about how this site is used.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To contact you as early access opens and to share product updates.</li>
        <li>To understand demand and prioritize what we build.</li>
        <li>To operate, secure, and improve this website.</li>
      </ul>

      <h2>What we don't do</h2>
      <p>
        We do not sell your personal information, and we do not share it with
        third parties except the service providers that help us run the
        waitlist and this site.
      </p>

      <h2>Your choices</h2>
      <p>
        You can ask us to access or delete your information at any time.
        Every email we send includes a way to unsubscribe.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? Email{" "}
        <a href="mailto:hello@cappr.dev">hello@cappr.dev</a>.
      </p>
    </LegalPage>
  );
}
