const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const PrivacyPolicyGenerator = require('../js/generator');
const TermsGenerator = require('../js/terms-generator');
const { buildHashedFilename, publishPolicy } = require('../js/publishing');
const execFileAsync = promisify(execFile);

function baseInput() {
  return {
    business: {
      name: 'Acme',
      type: 'saas',
      websiteUrl: 'https://acme.test',
      country: 'Germany',
      address: 'Test Street 123'
    },
    contact: {
      email: 'privacy@acme.test',
      phone: '',
      pageUrl: 'https://acme.test/privacy'
    },
    operations: {
      primaryJurisdiction: 'eu',
      sellRegions: ['eu'],
      childrenAudience: false
    },
    dataPractices: {
      collectedData: ['personal', 'usage'],
      thirdParties: ['analytics'],
      legalBases: ['contract']
    },
    compliance: {
      requestedFrameworks: []
    }
  };
}

test('EU scenario includes GDPR rights and excludes ecommerce-only retention', async () => {
  const generator = new PrivacyPolicyGenerator();
  const result = await generator.generate(baseInput());

  assert.match(result.markdown, /GDPR and UK GDPR/);
  assert.doesNotMatch(result.markdown, /Order and Fulfillment Records/);
});

test('US ecommerce includes California rights and ecommerce retention', async () => {
  const generator = new PrivacyPolicyGenerator();
  const input = baseInput();
  input.business.type = 'ecommerce';
  input.business.country = 'United States';
  input.operations.primaryJurisdiction = 'us';
  input.operations.sellRegions = ['us'];
  input.dataPractices.thirdParties = ['payment', 'shipping'];
  input.dataPractices.collectedData = ['personal', 'usage', 'tax'];

  const result = await generator.generate(input);

  assert.match(result.markdown, /California Privacy Rights/);
  assert.match(result.markdown, /Order and Fulfillment Records/);
});

test('social and email selections produce matching sections', async () => {
  const generator = new PrivacyPolicyGenerator();
  const input = baseInput();
  input.dataPractices.thirdParties = ['social', 'email'];

  const result = await generator.generate(input);

  assert.match(result.markdown, /Social Media and Embedded Content/);
  assert.match(result.markdown, /Email and Marketing Platforms/);
});

test('coppa selection creates children privacy language', async () => {
  const generator = new PrivacyPolicyGenerator();
  const input = baseInput();
  input.compliance.requestedFrameworks = ['coppa'];

  const result = await generator.generate(input);

  assert.match(result.markdown, /Services Directed to Children/);
});

test('validate reports missing required fields', async () => {
  const generator = new PrivacyPolicyGenerator();
  const validation = await generator.validate({
    business: {},
    contact: {},
    operations: {},
    dataPractices: {},
    compliance: {}
  });

  assert.equal(validation.ok, false);
  assert.ok(validation.errors.length >= 3);
});

test('Argentina scenario includes local rights and warns when output is not in Spanish', async () => {
  const generator = new PrivacyPolicyGenerator();
  const input = baseInput();
  input.business.country = 'Argentina';
  input.operations.primaryJurisdiction = 'ar';
  input.operations.sellRegions = ['ar'];
  input.settings = { language: 'en' };
  input.dataPractices.legalBases = ['contract', 'legal_obligation'];

  const validation = await generator.validate(input);
  const result = await generator.generate(input);

  assert.equal(validation.ok, true);
  assert.match(result.markdown, /Argentina Privacy Rights/);
  assert.doesNotMatch(result.markdown, /Draft Warnings|Advertencias del Borrador/);
  assert.doesNotMatch(result.html, /Draft Warnings|Advertencias del Borrador/);
  assert.ok(validation.warnings.some((warning) => /Spanish/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /Law 25\.326|AAIP/i.test(warning)));
});

test('ecommerce validation warns instead of blocking when payment shipping and fiscal coverage are omitted', async () => {
  const generator = new PrivacyPolicyGenerator();
  const input = baseInput();
  input.business.type = 'ecommerce';
  input.operations.primaryJurisdiction = 'ar';
  input.business.country = 'Argentina';
  input.dataPractices.thirdParties = ['advertising'];
  input.dataPractices.collectedData = ['personal', 'usage'];
  input.dataPractices.legalBases = ['contract'];

  const validation = await generator.validate(input);
  const result = await generator.generate(input);

  assert.equal(validation.ok, true);
  assert.equal(validation.errors.length, 0);
  assert.ok(validation.warnings.some((warning) => /payment|pago/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /shipping|envíos|logística/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /fiscal|facturación|ident/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /cookies/i.test(warning)));
  assert.match(result.markdown, /Privacy Policy|Política de Privacidad/);
});

test('spanish output uses spanish headings and body text', async () => {
  const generator = new PrivacyPolicyGenerator();
  const input = baseInput();
  input.settings = { language: 'es' };

  const result = await generator.generate(input);

  assert.match(result.markdown, /Política de Privacidad/);
  assert.match(result.markdown, /Fecha de vigencia/);
  assert.match(result.markdown, /Cómo Usamos la Información/);
});

test('hashed filename is deterministic for the same html content', async () => {
  const filenameA = buildHashedFilename('Acme', '<html>same</html>');
  const filenameB = buildHashedFilename('Acme', '<html>same</html>');
  const filenameC = buildHashedFilename('Acme', '<html>different</html>');

  assert.equal(filenameA, filenameB);
  assert.notEqual(filenameA, filenameC);
});

test('publishPolicy writes hashed html and returns public URL', async () => {
  const outputDir = path.join('/tmp', 'privacy-policy-publish-test');
  await fs.rm(outputDir, { recursive: true, force: true });

  const published = await publishPolicy({
    businessName: 'Acme Publish',
    htmlContent: '<html><body>publish me</body></html>',
    outputDir,
    baseUrl: 'https://example.com/privacy'
  });

  const html = await fs.readFile(published.filePath, 'utf8');
  const manifest = JSON.parse(await fs.readFile(published.manifestPath, 'utf8'));

  assert.match(published.publicUrl, /^https:\/\/example\.com\/privacy\/acme-publish-[a-f0-9]{16}\.html$/);
  assert.match(published.filename, /^acme-publish-[a-f0-9]{16}\.html$/);
  assert.equal(html, '<html><body>publish me</body></html>');
  assert.equal(manifest.publicUrl, published.publicUrl);
});

test('publish command returns final public URL without full policy body', async () => {
  const outputDir = path.join('/tmp', 'privacy-policy-publish-cli-test');
  await fs.rm(outputDir, { recursive: true, force: true });

  const { stdout } = await execFileAsync('node', [
    path.join(__dirname, '..', 'cli.js'),
    'publish',
    '--input',
    path.join(__dirname, '..', 'examples', 'saas-eu.json'),
    '--base-url',
    'https://example.com/privacy',
    '--publish-dir',
    outputDir
  ]);

  assert.match(stdout, /^https:\/\/example\.com\/privacy\/acme-cloud-[a-f0-9]{16}\.html/m);
  assert.doesNotMatch(stdout, /Privacy Policy - Acme Cloud/);
});

function baseTermsInput() {
  return {
    documentType: 'terms',
    business: {
      name: 'Lucas Store',
      type: 'ecommerce',
      websiteUrl: 'https://lucas-store.test',
      country: 'Argentina',
      address: 'Calle 123, Ciudad, CP, Argentina'
    },
    contact: {
      email: 'ebc@gmail.com',
      phone: '',
      pageUrl: 'https://lucas-store.test/contacto'
    },
    operations: {
      primaryJurisdiction: 'ar',
      sellRegions: ['ar']
    },
    terms: {
      offeringType: 'physical_goods',
      hasAccounts: true,
      requiresRegistration: false,
      allowsUserContent: true,
      pricesIncludeTaxes: true,
      currency: 'ARS',
      paymentProvider: 'Mercado Pago',
      refundsOffered: true,
      refundWindow: '10 días',
      refundConditions: 'El producto debe devolverse sin uso y con sus etiquetas.',
      returnShippingResponsibility: 'case_by_case',
      warrantyOffered: true,
      warrantyDetails: 'La garantía cubre fallas de fabricación informadas dentro del plazo legal aplicable.',
      prohibitedActivities: ['No usar el sitio para actividades ilegales.'],
      ipOwner: 'Lucas Store',
      ugcLicenseGranted: true,
      limitIndirectDamages: true,
      shippingDelayDisclaimer: true,
      customDisclaimer: '',
      maySuspendAccounts: true,
      terminationGrounds: 'Podemos suspender cuentas por fraude, abuso o incumplimiento de estos términos.',
      changeNotification: 'site_notice',
      disputesForum: 'Tribunales competentes de la Ciudad de Buenos Aires',
      adrMethod: 'mediation'
    },
    settings: {
      language: 'es'
    },
    customizations: {
      manualDisclosures: []
    }
  };
}

test('terms generator creates spanish ecommerce terms with payment and dispute sections', async () => {
  const generator = new TermsGenerator();
  const result = await generator.generate(baseTermsInput());

  assert.match(result.markdown, /Términos y Condiciones/);
  assert.match(result.markdown, /Mercado Pago/);
  assert.match(result.markdown, /Tribunales competentes de la Ciudad de Buenos Aires/);
  assert.match(result.markdown, /Reembolsos, Cambios y Devoluciones/);
});

test('terms validation blocks missing website and forum', async () => {
  const generator = new TermsGenerator();
  const input = baseTermsInput();
  input.business.websiteUrl = '';
  input.terms.disputesForum = '';

  const validation = await generator.validate(input);

  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => /URL del sitio|Website URL/i.test(error)));
  assert.ok(validation.errors.some((error) => /foro|forum/i.test(error)));
});

test('terms publish command returns final public URL without full document body', async () => {
  const outputDir = path.join('/tmp', 'terms-publish-cli-test');
  await fs.rm(outputDir, { recursive: true, force: true });
  const inputPath = path.join('/tmp', 'privacy-policy-generator-terms-example.json');
  await fs.writeFile(inputPath, `${JSON.stringify(baseTermsInput(), null, 2)}\n`, 'utf8');

  const { stdout } = await execFileAsync('node', [
    path.join(__dirname, '..', 'cli.js'),
    'publish',
    '--document',
    'terms',
    '--input',
    inputPath,
    '--base-url',
    'https://example.com/terms',
    '--publish-dir',
    outputDir
  ]);

  assert.match(stdout, /^https:\/\/example\.com\/terms\/lucas-store-[a-f0-9]{16}\.html/m);
  assert.doesNotMatch(stdout, /Términos y Condiciones|Terms and Conditions/);
});

test('terms example can be derived from privacy-like shared fields without losing required shared context', async () => {
  const generator = new TermsGenerator();
  const privacyLike = {
    business: {
      name: 'Shared Shop',
      type: 'ecommerce',
      websiteUrl: 'https://shared-shop.test',
      country: 'Argentina',
      address: 'Calle Falsa 123, Buenos Aires, Argentina'
    },
    contact: {
      email: 'privacy@shared-shop.test',
      phone: '+54 11 5555 5555',
      pageUrl: 'https://shared-shop.test/contacto'
    },
    operations: {
      primaryJurisdiction: 'ar',
      sellRegions: ['ar']
    },
    dataPractices: {
      collectedData: ['personal', 'financial', 'tax'],
      thirdParties: ['payment', 'shipping'],
      legalBases: ['contract']
    }
  };

  const input = baseTermsInput();
  input.business = { ...input.business, ...privacyLike.business };
  input.contact = { ...input.contact, ...privacyLike.contact };
  input.operations = { ...input.operations, ...privacyLike.operations };
  input.terms.paymentProvider = 'Pasarela general o múltiples procesadores';
  input.terms.shippingDelayDisclaimer = privacyLike.dataPractices.thirdParties.includes('shipping');

  const validation = await generator.validate(input);
  assert.equal(validation.ok, true);
  assert.equal(validation.normalizedInput.business.name, 'Shared Shop');
  assert.equal(validation.normalizedInput.business.websiteUrl, 'https://shared-shop.test');
  assert.equal(validation.normalizedInput.operations.primaryJurisdiction, 'ar');
});
