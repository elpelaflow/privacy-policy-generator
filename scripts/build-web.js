#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const esbuild = require('esbuild');

const ROOT = path.resolve(__dirname, '..');
const WEB_DIR = path.join(ROOT, 'web');
const DOCS_DIR = path.join(ROOT, 'docs');
const DOCS_ASSETS_DIR = path.join(DOCS_DIR, 'assets');
const DOCS_DATA_DIR = path.join(DOCS_DIR, 'data');

async function resolveConfigSource() {
  const localConfig = path.join(WEB_DIR, 'config.js');
  try {
    await fs.access(localConfig);
    return localConfig;
  } catch {}

  const existingDocsConfig = path.join(DOCS_DIR, 'config.js');
  try {
    await fs.access(existingDocsConfig);
    return existingDocsConfig;
  } catch {}

  return path.join(WEB_DIR, 'config.example.js');
}

async function copyFile(from, to) {
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(from, to);
}

async function copyDirFlat(fromDir, toDir) {
  await fs.mkdir(toDir, { recursive: true });
  const entries = await fs.readdir(fromDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    await copyFile(path.join(fromDir, entry.name), path.join(toDir, entry.name));
  }
}

async function writeNoJekyll() {
  await fs.writeFile(path.join(DOCS_DIR, '.nojekyll'), '', 'utf8');
}

async function buildBundle() {
  await esbuild.build({
    entryPoints: [path.join(WEB_DIR, 'browser-entry.js')],
    outfile: path.join(DOCS_ASSETS_DIR, 'generators.js'),
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020'],
    minify: false,
    sourcemap: false
  });
}

async function main() {
  await fs.mkdir(DOCS_ASSETS_DIR, { recursive: true });
  await fs.mkdir(DOCS_DATA_DIR, { recursive: true });

  const configSource = await resolveConfigSource();

  await Promise.all([
    copyFile(path.join(WEB_DIR, 'index.html'), path.join(DOCS_DIR, 'index.html')),
    copyFile(path.join(WEB_DIR, 'styles.css'), path.join(DOCS_DIR, 'styles.css')),
    copyFile(path.join(WEB_DIR, 'app.js'), path.join(DOCS_DIR, 'app.js')),
    copyFile(configSource, path.join(DOCS_DIR, 'config.js'))
  ]);

  await copyDirFlat(path.join(ROOT, 'data'), DOCS_DATA_DIR);
  await buildBundle();
  await writeNoJekyll();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
