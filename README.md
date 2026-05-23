# Privacy Policy Generator

CLI-first generator for privacy policies, terms and conditions, cookie policies, return and refund policies, disclaimers, and data deletion instructions, with structured validation, explainable generation, interactive terminal flows, automated tests, and a static web app prepared for GitHub Pages.

## Scope

This repo now supports two delivery modes:

- terminal-first generators for privacy, terms, cookies, return/refund, disclaimers, and deletion-instructions documents
- a client-side static web app that runs fully in the browser and can be deployed to GitHub Pages

## Features

- structured rules instead of string-based condition parsing
- canonical JSON input format
- interactive wizard with document selection, guided choices, and manual "Other" notes
- static browser app with modern UI, live validation, preview, and downloads
- output language selection in Spanish or English
- optional hashed public URL generation for self-hosted HTML output
- validation errors and draft warnings
- explainable `decisionLog` output
- HTML, Markdown, and plain text generation
- automated regression tests

## Static Web App

The repo now includes a browser-based static app under `web/` and a GitHub Pages-ready build output under `docs/`.

What the static app can do today:

- choose any supported legal document
- complete a guided form in the browser
- generate the final document client-side
- preview HTML, Markdown, or text output
- download `html`, `md`, `txt`, and input `json`
- show a prepared GitHub Pages path for future publishing

What it does not do yet:

- authenticate with GitHub
- publish directly into a user's repository
- run a backend publish flow

Build the static site:

```bash
npm install
npm run build:web
```

This writes the deployable static site into:

```text
docs/
```

That folder is ready to be served by GitHub Pages.

## Supported Documents

- `privacy`: privacy policy generator
- `terms`: terms and conditions / conditions of service generator
- `deletion`: data deletion instructions URL generator
- `cookies`: cookie policy generator
- `refund`: return and refund policy generator
- `disclaimer`: modular disclaimer generator

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

For cookie policies on this machine, the recommended defaults are:

- base URL: `https://dev-flow.duckdns.org/cookies`
- publish directory: `/home/dev-flow/tinyclaw/infra/www/cookies`

For return/refund policies on this machine, the recommended defaults are:

- base URL: `https://dev-flow.duckdns.org/refunds`
- publish directory: `/home/dev-flow/tinyclaw/infra/www/refunds`

For disclaimers on this machine, the recommended defaults are:

- base URL: `https://dev-flow.duckdns.org/disclaimer`
- publish directory: `/home/dev-flow/tinyclaw/infra/www/disclaimer`

## Install

```bash
git clone https://github.com/elpelaflow/privacy-policy-generator
cd privacy-policy-generator
npm install
```

Runtime usage only needs Node.js, but `npm install` is required if you want to build the static web app for GitHub Pages.

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

Validate deletion instructions:

```bash
privacy-policy validate --document deletion --input ./examples/deletion-ar-meta.json
```

Validate cookie policy:

```bash
privacy-policy validate --document cookies --input ./examples/cookies-ar-meta.json
```

Validate return/refund policy:

```bash
privacy-policy validate --document refund --input ./examples/refund-ar-ecommerce.json
```

Validate disclaimer:

```bash
privacy-policy validate --document disclaimer --input ./examples/disclaimer-meta-content.json
```

Explain which sections were included:

```bash
privacy-policy explain --input ./examples/saas-eu.json
```

Generate terms in Markdown:

```bash
privacy-policy generate --document terms --input ./examples/terms-ar-ecommerce.json --format markdown
```

Generate deletion instructions in Markdown:

```bash
privacy-policy generate --document deletion --input ./examples/deletion-ar-meta.json --format markdown
```

Generate cookie policy in Markdown:

```bash
privacy-policy generate --document cookies --input ./examples/cookies-ar-meta.json --format markdown
```

Generate return/refund policy in Markdown:

```bash
privacy-policy generate --document refund --input ./examples/refund-ar-ecommerce.json --format markdown
```

Generate disclaimer in Markdown:

```bash
privacy-policy generate --document disclaimer --input ./examples/disclaimer-meta-content.json --format markdown
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

For data deletion instructions, the corresponding defaults are:

```text
https://dev-flow.duckdns.org/data-deletion
/home/dev-flow/tinyclaw/infra/www/data-deletion
```

For cookie policies, the corresponding defaults are:

```text
https://dev-flow.duckdns.org/cookies
/home/dev-flow/tinyclaw/infra/www/cookies
```

For return/refund policies, the corresponding defaults are:

```text
https://dev-flow.duckdns.org/refunds
/home/dev-flow/tinyclaw/infra/www/refunds
```

For disclaimers, the corresponding defaults are:

```text
https://dev-flow.duckdns.org/disclaimer
/home/dev-flow/tinyclaw/infra/www/disclaimer
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

Generate and publish data deletion instructions:

```bash
privacy-policy publish \
  --document deletion \
  --input ./examples/deletion-ar-meta.json \
  --base-url https://example.com/data-deletion \
  --publish-dir ./public/data-deletion
```

Generate and publish cookie policy:

```bash
privacy-policy publish \
  --document cookies \
  --input ./examples/cookies-ar-meta.json \
  --base-url https://example.com/cookies \
  --publish-dir ./public/cookies
```

Generate and publish return/refund policy:

```bash
privacy-policy publish \
  --document refund \
  --input ./examples/refund-ar-ecommerce.json \
  --base-url https://example.com/refunds \
  --publish-dir ./public/refunds
```

Generate and publish disclaimer:

```bash
privacy-policy publish \
  --document disclaimer \
  --input ./examples/disclaimer-meta-content.json \
  --base-url https://example.com/disclaimer \
  --publish-dir ./public/disclaimer
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
2. choose whether you want `privacy`, `terms`, `cookies`, `refund`, `disclaimer`, or `deletion`
3. answer the wizard questions
4. choose output language and output format
5. optionally save both the generated document and the JSON input

During the wizard, type `<` to go back one question inside the current block.

For `ecommerce`, the wizard now opens extra questions for payments, shipping, fiscal data, identity checks, and profiling.

If those relevant items are omitted, the generator still produces a draft, but it now shows strong review warnings instead of silently passing.

For `cookies`, the wizard asks specifically about:

- cookie categories
- third-party cookie providers
- consent mode or banner strategy
- management URL or cookie settings page
- browser/device controls
- cookie duration or retention notes

For `refund`, the wizard asks specifically about:

- what kind of offering the policy covers
- return and exchange windows
- return conditions
- channel to request returns or refunds
- who pays return shipping
- refund method and processing time
- excluded or non-returnable categories
- treatment of damaged or incorrect items

For `disclaimer`, the wizard asks specifically about:

- which disclaimer types apply
- professional-advice language for health or fitness content
- external links language
- review methodology or affiliate disclosure
- use-at-your-own-risk wording

For `terms`, the wizard opens separate sections for:

- service description
- accounts and user content
- prices, payments, refunds, and warranty
- prohibited conduct and intellectual property
- disclaimers, termination, and dispute resolution

For `deletion`, the wizard opens separate sections for:

- request channels
- identity verification details
- deletion scope
- retention exceptions
- response and completion times
- Meta/Facebook revocation guidance

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
- refund generation covers return windows, exceptions, and refund timing
- disclaimer generation covers modular warnings for links, reviews, risks, and informational content
- deletion generation covers request channels, deletion scope, and Meta-connected account guidance
- validation reports missing required fields

## Repository Layout

```text
cli.js
data/policy-sections.json
examples/saas-eu.json
examples/terms-ar-ecommerce.json
examples/deletion-ar-meta.json
examples/cookies-ar-meta.json
examples/refund-ar-ecommerce.json
examples/disclaimer-meta-content.json
js/generator.js
js/terms-generator.js
js/deletion-generator.js
js/cookies-generator.js
js/refund-generator.js
js/disclaimer-generator.js
tests/generator.test.js
package.json
```

## Limits

This tool generates draft legal documents, not legal advice.

- it does not guarantee compliance
- it does not replace legal review
- it depends on accurate operational inputs
