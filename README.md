# Privacy Policy Generator

CLI-first and web-enabled generator for privacy policies, terms and conditions, cookie policies, return and refund policies, disclaimers, security policies, and data deletion instructions, with structured validation, explainable generation, interactive terminal flows, automated tests, and GitHub Pages publishing support.

## Scope

This repo now supports two delivery modes:

- terminal-first generators for privacy, terms, cookies, return/refund, disclaimers, security-policy, and deletion-instructions documents
- a client-side static web app that runs fully in the browser and can be deployed to GitHub Pages

## Features

- structured rules instead of string-based condition parsing
- canonical JSON input format
- interactive wizard with document selection, guided choices, and manual "Other" notes
- static browser app with modern UI, live validation, preview, downloads, and GitHub publishing
- output language selection in Spanish or English
- optional hashed public URL generation for HTML published through hosting you already have
- GitHub OAuth publish flow for user-owned GitHub Pages repos
- safe publish paths under `legal/<document-type>/...` to avoid touching a user's site root
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
- authenticate with GitHub through a Cloudflare Worker backend
- list repositories from the authenticated user
- detect whether a repo has `Pages activo` or `Pages accesible`
- publish generated HTML into a selected repo under a safe route such as `legal/privacy/...`
- return the final expected GitHub Pages URL

What it does not do yet:

- auto-edit the user's existing homepage or footer to insert legal links
- auto-enable GitHub Pages on repos where Pages is not configured
- publish arbitrary custom document roots outside the current guided flow

## GitHub Publish v1

The repo includes a Cloudflare Worker backend under:

```text
backend/cloudflare-worker/
```

This Cloudflare Worker handles:

- GitHub OAuth start/callback
- session resolution for the browser app
- repo listing for the authenticated user
- GitHub Pages status checks
- publishing generated HTML files into a selected repo path
- returning the final expected GitHub Pages public URL

It is not active by default. To enable it you need:

1. a GitHub OAuth App
2. a deployed Cloudflare Worker with secrets
3. a public worker URL
4. `backendBaseUrl` configured in the static web app

### Frontend config files

The static app now reads its backend configuration from dedicated config files instead of hardcoding the Worker URL in `web/index.html`.

- `web/config.example.js`
  default example shipped with the repo
- `web/config.js`
  optional local override for your own instance
- `docs/config.js`
  config used by the published GitHub Pages build

Build behavior:

- if `web/config.js` exists, `npm run build:web` copies it into `docs/config.js`
- otherwise, if `docs/config.js` already exists, the build preserves that config
- otherwise, the build falls back to `web/config.example.js`

This keeps the source tree generic while still allowing the public instance to stay connected to its real backend.

Worker files:

- [backend/cloudflare-worker/src/index.js](backend/cloudflare-worker/src/index.js)
- [backend/cloudflare-worker/wrangler.toml.example](backend/cloudflare-worker/wrangler.toml.example)
- [backend/cloudflare-worker/README.md](backend/cloudflare-worker/README.md)

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

## GitHub Pages Publish Flow

Once the static app and backend are configured, the browser flow is:

1. open the web app
2. choose a document type
3. complete the form and generate the HTML
4. click `Conectar GitHub`
5. authorize the GitHub OAuth app
6. choose a repository from the dropdown
7. publish the generated document into a safe repo path such as:

```text
legal/privacy/my-app-abc123.html
legal/terms/my-app-abc123.html
legal/cookies/my-app-abc123.html
```

If the selected repository already has GitHub Pages enabled and accessible, the final URL should be usable immediately.

Important:

- the publish flow does not overwrite `index.html`
- it does not modify the user's homepage or site navigation
- it only adds standalone legal-document files under `legal/...`
- the user can later link those URLs from their site manually if they want

## How To Use This Project

### Option A: use the public app

If you only want to generate legal documents, you do not need to fork this repo.

Typical flow:

1. open the public web app
2. choose a document type
3. complete the form
4. generate the document in the browser
5. download the output
6. optionally connect GitHub and publish into your own repository

This is the intended path for normal users. They do not need to understand the internal backend details as long as the public instance is already configured and running.

### Option B: run your own copy

If you want your own independent instance, your own branding, or your own backend and OAuth setup, then you should fork the repo and run your own deployment.

What that means:

- your own GitHub repo and GitHub Pages site
- your own Cloudflare Worker backend
- your own GitHub OAuth App
- your own worker secrets
- your own `backendBaseUrl`

Recommended setup order:

1. fork this repository
2. clone your fork locally
3. install dependencies:

```bash
npm install
```

4. build the static web app:

```bash
npm run build:web
```

5. publish the generated `docs/` folder with GitHub Pages in your fork
6. create a GitHub OAuth App
7. set the callback URL to:

```text
https://YOUR-WORKER/api/github/callback
```

8. deploy the Cloudflare Worker from:

```text
backend/cloudflare-worker/
```

9. configure these values in the worker:

- `PUBLIC_APP_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SESSION_SECRET`

10. set the worker URL in the web app through:

```js
globalThis.__LEGAL_HUB_CONFIG__ = {
  backendBaseUrl: "https://your-worker.workers.dev"
};
```

11. save that into `web/config.js`
12. rebuild and republish the static site
13. test the full browser flow:

- connect GitHub
- list repos
- generate a document
- publish to a repo

If you skip the Worker or OAuth setup, your fork will still work as:

- a CLI generator
- a browser generator with downloads

but not as a full GitHub publish app.

## Supported Documents

- `privacy`: privacy policy generator
- `terms`: terms and conditions / conditions of service generator
- `deletion`: data deletion instructions URL generator
- `cookies`: cookie policy generator
- `refund`: return and refund policy generator
- `disclaimer`: modular disclaimer generator
- `security`: security policy and responsible disclosure generator

## Supported Inputs

- business types: `ecommerce`, `blog`, `saas`, `mobile`, `nonprofit`
- jurisdictions: `us`, `eu`, `uk`, `ca`, `au`, `ar`, `global`
- data categories: `personal`, `financial`, `tax`, `identity`, `usage`, `cookies`, `location`, `profiling`
- third-party categories: `analytics`, `advertising`, `payment`, `paypal_only`, `shipping`, `cloud`, `social`, `email`
- legal bases: `contract`, `consent`, `legal_obligation`, `legitimate_interest`
- compliance toggles: `ccpa`, `coppa`, `caloppa`, `pipeda`
- output languages: `es`, `en`

## Existing Hosting Integration

Yes, the repo can integrate with hosting you already have.

The generator can create a static HTML privacy policy and optionally publish it into a directory using a hashed filename such as:

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

That URL is valid as long as your own server or static host already serves that directory publicly.

Important:

- the repo does not create your hosting infrastructure from scratch
- the repo does not automatically provision a VPS, web server, or static host
- it can integrate with hosting you already have

Typical examples include:

- an existing website that serves `./public/privacy`
- a static host serving a `/privacy` directory
- a reverse-proxy setup where a public URL already maps to a filesystem path

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

Validate security policy:

```bash
privacy-policy validate --document security --input ./examples/security-disclosure.json
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

Generate security policy in Markdown:

```bash
privacy-policy generate --document security --input ./examples/security-disclosure.json --format markdown
```

Publish directly and return the final public URL:

```bash
privacy-policy publish \
  --input ./examples/saas-eu.json \
  --base-url https://example.com/privacy \
  --publish-dir ./public/privacy
```

Important: this CLI publish flow writes a local file and assumes your existing hosting or server already serves that directory publicly. If you do not already have hosting for that path, the practical result is only a local file plus an expected URL.

If you omit `--publish-dir`, the CLI defaults to generic local directories such as:

```text
./public/privacy
./public/terms
./public/data-deletion
./public/cookies
./public/refunds
./public/disclaimer
./public/security
```

Generate Markdown:

```bash
privacy-policy generate --input ./examples/saas-eu.json --format markdown
```

Generate HTML to a file:

```bash
privacy-policy generate --input ./examples/saas-eu.json --format html --output ./privacy-policy.html
```

Generate and publish a hashed URL through existing hosting:

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

Generate and publish security policy:

```bash
privacy-policy publish \
  --document security \
  --input ./examples/security-disclosure.json \
  --base-url https://example.com/security \
  --publish-dir ./public/security
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
2. choose whether you want `privacy`, `terms`, `cookies`, `refund`, `disclaimer`, `security`, or `deletion`
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

For `security`, the wizard asks specifically about:

- security reporting channels
- disclosure scope and covered assets
- safe harbor and good-faith language
- what testing is allowed or prohibited
- acknowledgement and status-update timing
- coordinated disclosure and bug bounty notes
- optional summary of security practices

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
- security generation covers reporting channels, safe harbor, disclosure timing, and optional security-practices summaries
- deletion generation covers request channels, deletion scope, and Meta-connected account guidance
- validation reports missing required fields

## Repository Layout

```text
cli.js
web/
docs/
backend/cloudflare-worker/
data/policy-sections.json
examples/saas-eu.json
examples/terms-ar-ecommerce.json
examples/deletion-ar-meta.json
examples/cookies-ar-meta.json
examples/refund-ar-ecommerce.json
examples/disclaimer-meta-content.json
examples/security-disclosure.json
js/generator.js
js/terms-generator.js
js/deletion-generator.js
js/cookies-generator.js
js/refund-generator.js
js/disclaimer-generator.js
js/security-generator.js
tests/generator.test.js
package.json
```

## Limits

This tool generates draft legal documents, not legal advice.

- it does not guarantee compliance
- it does not replace legal review
- it depends on accurate operational inputs
