# Privacy Policy Generator

CLI-first generator for privacy policies and terms and conditions, with structured validation, explainable generation, interactive terminal flows, and automated tests.

## Scope

This repo is now intentionally terminal-focused.

- no browser UI
- no static site assets
- no client-side generation path
- terminal-first generators for both privacy and terms documents

## Features

- structured rules instead of string-based condition parsing
- canonical JSON input format
- interactive wizard with document selection, guided choices, and manual "Other" notes
- output language selection in Spanish or English
- optional hashed public URL generation for self-hosted HTML output
- validation errors and draft warnings
- explainable `decisionLog` output
- HTML, Markdown, and plain text generation
- automated regression tests

## Supported Documents

- `privacy`: privacy policy generator
- `terms`: terms and conditions / conditions of service generator

## Supported Inputs

- business types: `ecommerce`, `blog`, `saas`, `mobile`, `nonprofit`
- jurisdictions: `us`, `eu`, `uk`, `ca`, `au`, `ar`, `global`
- data categories: `personal`, `financial`, `tax`, `identity`, `usage`, `cookies`, `location`, `profiling`
- third-party categories: `analytics`, `advertising`, `payment`, `paypal_only`, `shipping`, `cloud`, `social`, `email`
- legal bases: `contract`, `consent`, `legal_obligation`, `legitimate_interest`
- compliance toggles: `ccpa`, `coppa`, `caloppa`, `pipeda`
- output languages: `es`, `en`

## Self-Hosting

Yes, it is self-hostable.

The generator can create a static HTML privacy policy and optionally publish it into a local directory using a hashed filename such as:

```text
acme-cloud-7f3c1b2a9d4e6f10.html
```

If you provide:

- a public base URL such as `https://example.com/privacy`
- a local publish directory such as `./public/privacy`

the CLI writes the HTML file there and returns a final URL like:

```text
https://example.com/privacy/acme-cloud-7f3c1b2a9d4e6f10.html
```

That URL is valid as long as your own server or static host serves that directory publicly.

In this machine, the recommended defaults are:

- base URL: `https://dev-flow.duckdns.org/privacy`
- publish directory: `/home/dev-flow/tinyclaw/infra/www/privacy`

So the generated URL can be published directly under your existing public site.

## Install

```bash
git clone https://github.com/Tempest-Solutions-Company/privacy-policy-generator
cd privacy-policy-generator
```

No runtime dependencies are required beyond Node.js.

To install the command for the current user without root:

```bash
mkdir -p "$HOME/.local/bin" "$HOME/.local/lib"
env npm_config_prefix="$HOME/.local" npm link
```

If `~/.local/bin` is not already in `PATH`, add it in your shell profile.

## Commands

Interactive wizard:

```bash
privacy-policy
```

or explicitly:

```bash
privacy-policy wizard
```

Validate input:

```bash
privacy-policy validate --input ./examples/saas-eu.json
```

Validate terms:

```bash
privacy-policy validate --document terms --input ./examples/terms-ar-ecommerce.json
```

Explain which sections were included:

```bash
privacy-policy explain --input ./examples/saas-eu.json
```

Generate terms in Markdown:

```bash
privacy-policy generate --document terms --input ./examples/terms-ar-ecommerce.json --format markdown
```

Publish directly and return the final public URL:

```bash
privacy-policy publish \
  --input ./examples/saas-eu.json \
  --base-url https://example.com/privacy \
  --publish-dir ./public/privacy
```

On this host, the intended real command is:

```bash
privacy-policy publish --input ./examples/saas-eu.json --base-url https://dev-flow.duckdns.org/privacy
```

If you omit `--publish-dir`, the CLI now defaults to:

```text
/home/dev-flow/tinyclaw/infra/www/privacy
```

For terms, the corresponding defaults are:

```text
https://dev-flow.duckdns.org/terms
/home/dev-flow/tinyclaw/infra/www/terms
```

Generate Markdown:

```bash
privacy-policy generate --input ./examples/saas-eu.json --format markdown
```

Generate HTML to a file:

```bash
privacy-policy generate --input ./examples/saas-eu.json --format html --output ./privacy-policy.html
```

Generate and publish a hashed self-hosted URL:

```bash
privacy-policy generate \
  --input ./examples/saas-eu.json \
  --base-url https://example.com/privacy \
  --publish-dir ./public/privacy
```

Generate and publish terms:

```bash
privacy-policy publish \
  --document terms \
  --input ./examples/terms-ar-ecommerce.json \
  --base-url https://example.com/terms \
  --publish-dir ./public/terms
```

## Input Format

```json
{
  "business": {
    "name": "Acme Cloud",
    "type": "saas",
    "websiteUrl": "https://acme.example",
    "country": "Germany",
    "address": "42 Example Street, Berlin"
  },
  "contact": {
    "email": "privacy@acme.example",
    "phone": "+49 30 000000",
    "pageUrl": "https://acme.example/privacy-contact"
  },
  "operations": {
    "primaryJurisdiction": "eu",
    "sellRegions": ["eu", "uk"],
    "childrenAudience": false
  },
  "dataPractices": {
    "collectedData": ["personal", "usage", "cookies"],
    "thirdParties": ["analytics", "cloud", "email"],
    "legalBases": ["contract", "legitimate_interest"]
  },
  "compliance": {
    "requestedFrameworks": []
  }
}
```

You can still use JSON files directly, but the intended terminal workflow is now:

1. run `privacy-policy`
2. choose whether you want `privacy` or `terms`
3. answer the wizard questions
4. choose output language and output format
5. optionally save both the generated document and the JSON input

During the wizard, type `<` to go back one question inside the current block.

For `ecommerce`, the wizard now opens extra questions for payments, shipping, fiscal data, identity checks, and profiling.

If those relevant items are omitted, the generator still produces a draft, but it now shows strong review warnings instead of silently passing.

For `terms`, the wizard opens separate sections for:

- service description
- accounts and user content
- prices, payments, refunds, and warranty
- prohibited conduct and intellectual property
- disclaimers, termination, and dispute resolution

## Testing

Run:

```bash
npm test
```

Current test coverage checks:

- GDPR content appears for EU inputs
- ecommerce-only retention stays limited to ecommerce
- California rights appear in US scenarios
- Argentina rights and warnings appear in Argentina scenarios
- `social` and `email` options affect generated output
- COPPA selection affects children privacy content
- e-commerce privacy warnings now flag payment, shipping, and fiscal coverage gaps without blocking generation
- terms generation covers payment, refund, and dispute sections
- validation reports missing required fields

## Repository Layout

```text
cli.js
data/policy-sections.json
examples/saas-eu.json
examples/terms-ar-ecommerce.json
js/generator.js
js/terms-generator.js
tests/generator.test.js
package.json
```

## Limits

This tool generates draft legal documents, not legal advice.

- it does not guarantee compliance
- it does not replace legal review
- it depends on accurate operational inputs
