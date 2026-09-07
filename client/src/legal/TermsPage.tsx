import { LegalPage } from "./LegalPage";

export function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="September 6, 2026">
      <p>
        These terms cover your use of the Cappr website while the product is in
        pre-release. By using this site or joining the early access list, you
        agree to them.
      </p>

      <h2>Pre-release status</h2>
      <p>
        Cappr is not yet generally available. Anything described on this site
        reflects our current plans and may change. Joining the early access list
        does not guarantee access to the product.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Please use this site lawfully and don't attempt to disrupt, probe, or
        gain unauthorized access to it or the systems behind it.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Cappr name, logo, and site content are ours. Shotoku, the open
        gateway underneath Cappr, is available under its own open-source
        license.
      </p>

      <h2>No warranty</h2>
      <p>
        This site is provided "as is," without warranties of any kind. To the
        extent permitted by law, Cappr is not liable for any damages arising
        from your use of it.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href="mailto:julius@shotoku.dev">julius@shotoku.dev</a>.
      </p>
    </LegalPage>
  );
}
