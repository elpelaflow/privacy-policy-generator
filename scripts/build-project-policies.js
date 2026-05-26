#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');

const PrivacyPolicyGenerator = require('../js/generator');
const TermsGenerator = require('../js/terms-generator');
const SecurityPolicyGenerator = require('../js/security-generator');
const DisclaimerGenerator = require('../js/disclaimer-generator');

const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'data', 'project-policies');
const OUTPUT_DIR = path.join(ROOT, 'docs', 'legal');

const POLICIES = [
  {
    type: 'privacy',
    source: 'privacy.json',
    slug: 'privacy',
    label: 'Política de privacidad',
    description: 'Cómo este proyecto trata datos técnicos, contacto y uso de la web.'
  },
  {
    type: 'terms',
    source: 'terms.json',
    slug: 'terms',
    label: 'Términos de uso',
    description: 'Reglas de uso del generador, límites del borrador legal y responsabilidades.'
  },
  {
    type: 'security',
    source: 'security.json',
    slug: 'security',
    label: 'Política de seguridad',
    description: 'Canales y reglas para reportar vulnerabilidades de forma responsable.'
  },
  {
    type: 'disclaimer',
    source: 'disclaimer.json',
    slug: 'disclaimer',
    label: 'Disclaimer',
    description: 'Alcance informativo de la herramienta y límites de responsabilidad.'
  }
];

const GENERATORS = {
  privacy: () => new PrivacyPolicyGenerator(),
  terms: () => new TermsGenerator(),
  security: () => new SecurityPolicyGenerator(),
  disclaimer: () => new DisclaimerGenerator()
};

async function buildProjectPolicies() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const generated = [];
  for (const policy of POLICIES) {
    const input = JSON.parse(await fs.readFile(path.join(SOURCE_DIR, policy.source), 'utf8'));
    const generator = GENERATORS[policy.type]();
    const result = await generator.generate(input);
    const html = wrapPolicyHtml(result.html, policy);
    const policyDir = path.join(OUTPUT_DIR, policy.slug);
    await fs.mkdir(policyDir, { recursive: true });
    await fs.writeFile(path.join(policyDir, 'index.html'), html, 'utf8');
    generated.push(policy);
  }

  await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), buildLegalIndex(generated), 'utf8');
}

function wrapPolicyHtml(generatedHtml, policy) {
  const lang = generatedHtml.match(/<html\s+lang="([^"]+)"/i)?.[1] || 'es';
  const title = generatedHtml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || `${policy.label} - Policy Generator Hub`;
  const jsonLd = generatedHtml.match(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i)?.[0] || '';
  const main = generatedHtml.match(/<main[\s\S]*?<\/main>/i)?.[0] || '';

  return `<!doctype html>
<html lang="${escapeAttribute(lang)}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  ${jsonLd}
  <style>${policyCss()}</style>
</head>
<body>
  <div class="policy-page-shell">
    <a class="back-home" href="../../">Volver al inicio</a>
    <article class="policy-document">
      ${main}
    </article>
  </div>
</body>
</html>
`;
}

function buildLegalIndex(policies) {
  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Nuestras políticas - Policy Generator Hub</title>
  <meta name="description" content="Políticas propias de Policy Generator Hub generadas con la misma herramienta.">
  <style>${policyCss()}</style>
</head>
<body>
  <div class="policy-page-shell">
    <a class="back-home" href="../">Volver al inicio</a>
    <header class="policies-hero">
      <span class="policy-pill">Policy Generator Hub</span>
      <h1>Nuestras políticas</h1>
      <p>Estas políticas corresponden al proyecto Policy Generator Hub y fueron generadas con esta misma herramienta.</p>
    </header>
    <main class="policy-index-grid" aria-label="Políticas del proyecto">
      ${policies.map((policy) => `
      <a class="policy-index-card" href="./${policy.slug}/">
        <span>${escapeHtml(policy.type)}</span>
        <strong>${escapeHtml(policy.label)}</strong>
        <small>${escapeHtml(policy.description)}</small>
      </a>`).join('')}
    </main>
  </div>
</body>
</html>
`;
}

function policyCss() {
  return `
:root {
  --bg: #0e1226;
  --panel: rgba(15, 20, 46, 0.82);
  --panel-strong: rgba(10, 14, 32, 0.94);
  --text: #f5f7ff;
  --muted: #b7bfdc;
  --line: rgba(255, 255, 255, 0.12);
  --primary: #ff7a18;
  --secondary: #00c2ff;
  --tertiary: #9cff57;
  --shadow: 0 22px 80px rgba(0, 0, 0, 0.38);
  --radius: 24px;
  --mono: "IBM Plex Mono", "Fira Code", monospace;
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body {
  margin: 0;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(255, 122, 24, 0.22), transparent 28%),
    radial-gradient(circle at top right, rgba(0, 194, 255, 0.18), transparent 32%),
    radial-gradient(circle at bottom left, rgba(156, 255, 87, 0.12), transparent 24%),
    linear-gradient(180deg, #0d1020 0%, #121833 45%, #0b0f1f 100%);
}
a { color: inherit; text-decoration: none; }
.policy-page-shell {
  width: min(1040px, calc(100% - 32px));
  margin: 0 auto;
  padding: 28px 0 52px;
}
.back-home {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 16px;
  margin-bottom: 24px;
  border-radius: 14px;
  border: 1px solid var(--line);
  color: #0b1020;
  background: linear-gradient(135deg, var(--secondary), #8cf9ff);
  font-weight: 800;
}
.policies-hero,
.policy-document {
  border: 1px solid var(--line);
  background: var(--panel);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}
.policies-hero {
  padding: clamp(28px, 5vw, 52px);
  margin-bottom: 18px;
}
.policy-pill {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  margin-bottom: 16px;
  background: rgba(255,255,255,0.08);
  color: var(--tertiary);
  font-family: var(--mono);
  font-size: .8rem;
  text-transform: uppercase;
  letter-spacing: .12em;
}
.policies-hero h1,
.policy-document h1 {
  margin: 0;
  font-size: clamp(2.4rem, 7vw, 5rem);
  line-height: .95;
  letter-spacing: -.04em;
}
.policies-hero p {
  max-width: 64ch;
  margin: 20px 0 0;
  color: var(--muted);
  font-size: 1.08rem;
  line-height: 1.7;
}
.policy-index-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}
.policy-index-card {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 18px;
  padding: 22px;
  border-radius: 22px;
  border: 1px solid var(--line);
  background: linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035));
  transition: transform .2s ease, border-color .2s ease, background .2s ease;
}
.policy-index-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 194, 255, 0.42);
  background: linear-gradient(160deg, rgba(0,194,255,0.14), rgba(255,255,255,0.04));
}
.policy-index-card span {
  color: var(--tertiary);
  font-family: var(--mono);
  font-size: .78rem;
  text-transform: uppercase;
  letter-spacing: .12em;
}
.policy-index-card strong {
  display: block;
  font-size: 1.35rem;
  line-height: 1.1;
}
.policy-index-card small {
  color: var(--muted);
  line-height: 1.55;
  font-size: .95rem;
}
.policy-document {
  padding: clamp(24px, 5vw, 54px);
}
.policy-document main {
  display: block;
}
.policy-document header {
  margin-bottom: 34px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line);
}
.policy-document header p {
  color: var(--muted);
  margin: 18px 0 0;
}
.policy-document section {
  padding: 24px 0;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.policy-document section:first-of-type {
  border-top: 0;
}
.policy-document h2,
.policy-document h3 {
  color: #ffffff;
  line-height: 1.2;
}
.policy-document h2 {
  margin: 0 0 14px;
  font-size: clamp(1.35rem, 3vw, 2rem);
}
.policy-document h3 {
  margin: 20px 0 10px;
}
.policy-document p,
.policy-document li {
  color: var(--muted);
  line-height: 1.75;
  font-size: 1rem;
}
.policy-document p {
  margin: 0 0 14px;
}
.policy-document ul {
  padding-left: 22px;
}
.policy-document code {
  font-family: var(--mono);
  color: #ffffff;
}
.policy-document a:focus-visible,
.policy-index-card:focus-visible,
.back-home:focus-visible {
  outline: 3px solid var(--secondary);
  outline-offset: 3px;
}
@media (max-width: 900px) {
  .policy-index-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 620px) {
  .policy-page-shell { width: min(100% - 24px, 1040px); padding-top: 18px; }
  .back-home { width: 100%; }
  .policy-index-grid { grid-template-columns: 1fr; }
}
`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll('`', '&#96;');
}

if (require.main === module) {
  buildProjectPolicies().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  buildProjectPolicies
};
