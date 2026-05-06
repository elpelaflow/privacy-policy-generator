const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const path = require('node:path');

function slugify(value) {
  return String(value || 'privacy-policy')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'privacy-policy';
}

function buildPolicyHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
}

function buildHashedFilename(businessName, htmlContent) {
  const slug = slugify(businessName);
  const hash = buildPolicyHash(htmlContent);
  return `${slug}-${hash}.html`;
}

function buildPublicUrl(baseUrl, filename) {
  return `${String(baseUrl || '').replace(/\/+$/, '')}/${filename}`;
}

async function publishPolicy({ businessName, htmlContent, outputDir, baseUrl }) {
  if (!outputDir) {
    throw new Error('outputDir is required to publish a policy');
  }

  if (!baseUrl) {
    throw new Error('baseUrl is required to publish a policy');
  }

  const filename = buildHashedFilename(businessName, htmlContent);
  const publicUrl = buildPublicUrl(baseUrl, filename);
  const resolvedDir = path.resolve(process.cwd(), outputDir);
  const filePath = path.join(resolvedDir, filename);
  const manifestPath = path.join(resolvedDir, 'privacy-policy-manifest.json');

  await fs.mkdir(resolvedDir, { recursive: true });
  await fs.writeFile(filePath, htmlContent, 'utf8');
  await fs.writeFile(
    manifestPath,
    `${JSON.stringify({
      businessName,
      filename,
      publicUrl,
      hash: buildPolicyHash(htmlContent),
      generatedAt: new Date().toISOString()
    }, null, 2)}\n`,
    'utf8'
  );

  return {
    filename,
    publicUrl,
    filePath,
    manifestPath
  };
}

module.exports = {
  buildPolicyHash,
  buildHashedFilename,
  buildPublicUrl,
  publishPolicy
};
