import "./integrations.css";

const CDN = "https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons";

const ICONS = [
  { slug: "openai",        name: "OpenAI",        href: "https://openai.com",        lightInvert: true  },
  { slug: "anthropic",     name: "Anthropic",     href: "https://anthropic.com",     lightInvert: true  },
  { slug: "google-gemini", name: "Google Gemini", href: "https://gemini.google.com", lightInvert: false },
  { slug: "mistral",       name: "Mistral",       href: "https://mistral.ai",        lightInvert: false },
  { slug: "groq",          name: "Groq",          href: "https://groq.com",          lightInvert: false },
  { slug: "xai",           name: "xAI",           href: "https://x.ai",              lightInvert: false },
  { slug: "perplexity",    name: "Perplexity",    href: "https://perplexity.ai",     lightInvert: false },
  { slug: "together-ai",   name: "Together AI",   href: "https://together.ai",       lightInvert: true  },
  { slug: "replicate",     name: "Replicate",     href: "https://replicate.com",     lightInvert: true  },
  { slug: "langchain",     name: "LangChain",     href: "https://langchain.com",     lightInvert: false },
  { slug: "cohere",        name: "Cohere",        href: "https://cohere.com",        lightInvert: false },
  { slug: "stripe",        name: "Stripe",        href: "https://stripe.com",        lightInvert: false },
  { slug: "aws",           name: "AWS",           href: "https://aws.amazon.com",    lightInvert: false },
] as const;

export function LandingIntegrationsSection() {
  return (
    <section
      className="landing-integrations landing-grid"
      aria-labelledby="landing-integrations-title"
    >
      <div className="landing-grid__gutter" aria-hidden />
      <div className="landing-integrations__frame">
        <header className="landing-integrations__header">
          <h2 id="landing-integrations-title" className="landing-integrations__title">
            Works with the providers<br />you already use.
          </h2>
          <p className="landing-integrations__lead">
            One proxy endpoint. Every model, tool, and payment API —
            observed and enforced.
          </p>
        </header>
        <div className="landing-integrations__marquee">
          <ul className="landing-integrations__track" role="list">
            {ICONS.map((icon) => (
              <li key={icon.slug} role="listitem" className="landing-integrations__item">
                <a
                  href={icon.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={icon.name}
                  className="landing-integrations__icon-link"
                >
                  <img
                    src={`${CDN}/${icon.slug}/default.svg`}
                    alt=""
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className={`landing-integrations__icon${icon.lightInvert ? " landing-integrations__icon--light-invert" : ""}`}
                  />
                </a>
              </li>
            ))}
            {/* Duplicate set for a seamless loop; hidden from assistive tech */}
            {ICONS.map((icon) => (
              <li
                key={`${icon.slug}-dup`}
                aria-hidden
                className="landing-integrations__item"
              >
                <span className="landing-integrations__icon-link">
                  <img
                    src={`${CDN}/${icon.slug}/default.svg`}
                    alt=""
                    width={36}
                    height={36}
                    loading="lazy"
                    decoding="async"
                    className={`landing-integrations__icon${icon.lightInvert ? " landing-integrations__icon--light-invert" : ""}`}
                  />
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="landing-grid__gutter" aria-hidden />
    </section>
  );
}
