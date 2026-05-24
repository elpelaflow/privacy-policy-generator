const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const PrivacyPolicyGenerator = require('../js/generator');
const TermsGenerator = require('../js/terms-generator');
const DataDeletionGenerator = require('../js/deletion-generator');
const CookiesPolicyGenerator = require('../js/cookies-generator');
const ReturnRefundPolicyGenerator = require('../js/refund-generator');
const DisclaimerGenerator = require('../js/disclaimer-generator');
const SecurityPolicyGenerator = require('../js/security-generator');
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
  input.dataPractices.thirdParties = ['cloud'];

  const validation = await generator.validate(input);
  const result = await generator.generate(input);

  assert.equal(validation.ok, true);
  assert.match(result.markdown, /Argentina Privacy Rights/);
  assert.doesNotMatch(result.markdown, /Draft Warnings|Advertencias del Borrador/);
  assert.doesNotMatch(result.html, /Draft Warnings|Advertencias del Borrador/);
  assert.doesNotMatch(result.markdown, /Additional Business Notes Requiring Review|Notas Adicionales del Negocio que Requieren Revisión/);
  assert.ok(validation.warnings.some((warning) => /Spanish/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /Law 25\.326|AAIP/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /transfers|transferencias/i.test(warning)));
  assert.match(result.markdown, /Requests under Law 25\.326|Solicitudes bajo Ley 25\.326/);
  assert.match(result.markdown, /Transfers from Argentina|Transferencias desde Argentina/);
});

test('invalid placeholder values are stripped from rendered public policy output', async () => {
  const generator = new PrivacyPolicyGenerator();
  const input = baseInput();
  input.settings = { language: 'es' };
  input.business.websiteUrl = '>';
  input.contact.pageUrl = '>';

  const result = await generator.generate(input);

  assert.doesNotMatch(result.markdown, />/);
  assert.doesNotMatch(result.html, /&gt;/);
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

test('privacy html includes internal JSON-LD metadata for page and organization', async () => {
  const generator = new PrivacyPolicyGenerator();
  const input = baseInput();
  input.settings = { language: 'en' };

  const result = await generator.generate(input);

  assert.match(result.html, /<script type="application\/ld\+json">/);
  assert.match(result.html, /"@context":"https:\/\/schema\.org"/);
  assert.match(result.html, /"@type":"WebPage"/);
  assert.match(result.html, /"@type":"Organization"/);
  assert.match(result.html, /"url":"https:\/\/acme\.test"/);
  assert.match(result.html, /"email":"privacy@acme\.test"/);
  assert.match(result.html, /<main id="main-content" aria-labelledby="document-title">/);
  assert.match(result.html, /<time datetime="[^"]+">/);
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


function baseSecurityInput() {
  return {
    documentType: 'security',
    business: {
      name: 'Acme Secure',
      type: 'saas',
      websiteUrl: 'https://secure.acme.test',
      country: 'Argentina',
      address: 'Calle 123, CABA, Argentina'
    },
    contact: {
      email: 'security@acme.test',
      phone: '',
      pageUrl: 'https://secure.acme.test/security'
    },
    security: {
      reportChannel: 'both',
      reportEmail: 'security@acme.test',
      reportUrl: 'https://secure.acme.test/report',
      scope: ['web_application', 'api', 'integrations'],
      safeHarborOffered: true,
      automatedTestingAllowed: true,
      denialOfServiceTestingAllowed: false,
      socialEngineeringAllowed: false,
      acknowledgementTime: '3 días hábiles',
      statusUpdateTime: '10 días hábiles',
      disclosurePreference: 'coordinated',
      bugBountyOffered: false,
      reportRequirements: [
        'Descripción del hallazgo',
        'Pasos de reproducción',
        'Datos de contacto para seguimiento'
      ],
      remediationGuidance: 'Priorizamos el reporte según severidad y riesgo.',
      securityPracticesSummary: 'Aplicamos controles de acceso, logs y medidas razonables de hardening.'
    },
    settings: {
      language: 'es'
    }
  };
}

test('security policy includes disclosure and reporting sections', async () => {
  const generator = new SecurityPolicyGenerator();
  const result = await generator.generate(baseSecurityInput());

  assert.match(result.markdown, /Política de Seguridad/);
  assert.match(result.markdown, /Cómo Reportar una Vulnerabilidad/);
  assert.match(result.markdown, /Divulgación, Remediación y Reconocimiento/);
});

test('security html includes internal JSON-LD metadata', async () => {
  const generator = new SecurityPolicyGenerator();
  const result = await generator.generate(baseSecurityInput());

  assert.match(result.html, /<script type="application\/ld\+json">/);
  assert.match(result.html, /"@type":"WebPage"/);
  assert.match(result.html, /<main id="main-content" aria-labelledby="document-title">/);
});

test('security validation requires a real reporting channel', async () => {
  const generator = new SecurityPolicyGenerator();
  const input = baseSecurityInput();
  input.security.reportChannel = 'email';
  input.security.reportEmail = '';
  input.security.reportUrl = '';
  input.contact.email = '';
  input.contact.pageUrl = '';

  const validation = await generator.validate(input);

  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => /canal real|real channel/i.test(error)));
});

test('security validation warns when safe harbor and expectations are too vague', async () => {
  const generator = new SecurityPolicyGenerator();
  const input = baseSecurityInput();
  input.security.safeHarborOffered = false;
  input.security.reportRequirements = [];
  input.security.acknowledgementTime = '';
  input.security.statusUpdateTime = '';

  const validation = await generator.validate(input);

  assert.equal(validation.ok, true);
  assert.ok(validation.warnings.some((warning) => /safe harbor|buena fe/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /triage|inclu/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /acusar|acknowledge/i.test(warning)));
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
  assert.match(result.markdown, /Aviso de Consumo en Argentina|defensa del consumidor|derecho de arrepentimiento/i);
});

test('terms html includes internal JSON-LD metadata', async () => {
  const generator = new TermsGenerator();
  const result = await generator.generate(baseTermsInput());

  assert.match(result.html, /<script type="application\/ld\+json">/);
  assert.match(result.html, /"@type":"Organization"/);
  assert.match(result.html, /<time datetime="[^"]+">/);
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

function baseDeletionInput() {
  return {
    documentType: 'deletion',
    business: {
      name: 'AutoAds CLI Operator',
      websiteUrl: 'https://autopost.example.com/',
      country: 'Argentina',
      address: 'Adolfo Alsina 3135, B1849, Buenos Aires, Argentina'
    },
    contact: {
      email: 'legal@autopost.example.com',
      phone: '+5491123317940',
      pageUrl: 'https://autopost.example.com/'
    },
    deletion: {
      requestChannel: 'both',
      requestEmail: 'legal@autopost.example.com',
      requestUrl: 'https://autopost.example.com/',
      identityRequirements: ['Email de la cuenta o del usuario solicitante'],
      deletionScope: ['Datos de perfil o cuenta asociados al usuario'],
      retentionExceptions: ['Registros necesarios para cumplir obligaciones legales o regulatorias'],
      responseTime: '10 días hábiles',
      completionTime: '30 días',
      hasMetaConnection: true,
      metaDisconnectInstructions: 'El usuario puede revocar permisos desde Meta y además pedir eliminación por email.'
    },
    settings: {
      language: 'es'
    }
  };
}

test('deletion generator creates a deletion instructions document with meta section', async () => {
  const generator = new DataDeletionGenerator();
  const result = await generator.generate(baseDeletionInput());

  assert.match(result.markdown, /Instrucciones para Eliminación de Datos/);
  assert.match(result.markdown, /Cómo Solicitar la Eliminación/);
  assert.match(result.markdown, /Meta \/ Facebook/);
});

test('deletion html includes internal JSON-LD metadata', async () => {
  const generator = new DataDeletionGenerator();
  const result = await generator.generate(baseDeletionInput());

  assert.match(result.html, /<script type="application\/ld\+json">/);
  assert.match(result.html, /"@type":"WebPage"/);
  assert.match(result.html, /<main id="main-content" aria-labelledby="document-title">/);
});

test('deletion validation blocks missing request contact', async () => {
  const generator = new DataDeletionGenerator();
  const input = baseDeletionInput();
  input.contact.email = '';
  input.contact.pageUrl = '';
  input.deletion.requestEmail = '';
  input.deletion.requestUrl = '';

  const validation = await generator.validate(input);

  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => /canal real|real channel/i.test(error)));
});

function baseCookiesInput() {
  return {
    documentType: 'cookies',
    business: {
      name: 'AutoPost CLI Operator',
      type: 'saas',
      websiteUrl: 'https://autopost.example.com/',
      country: 'Argentina',
      address: 'Adolfo Alsina 3135, B1849, Buenos Aires, Argentina'
    },
    contact: {
      email: 'legal@autopost.example.com',
      phone: '+5491123317940',
      pageUrl: 'https://autopost.example.com/privacy'
    },
    operations: {
      primaryJurisdiction: 'ar',
      sellRegions: ['ar']
    },
    cookies: {
      categories: ['necessary', 'analytics', 'advertising'],
      thirdParties: ['analytics', 'advertising', 'social'],
      consentMode: 'banner',
      managementUrl: 'https://autopost.example.com/privacy',
      browserControls: 'Puede bloquear o eliminar cookies desde la configuración del navegador.',
      retentionPolicy: 'Algunas cookies son de sesión y otras persisten más tiempo según su finalidad.'
    },
    settings: {
      language: 'es'
    }
  };
}

test('cookies generator creates a cookie policy with categories and controls sections', async () => {
  const generator = new CookiesPolicyGenerator();
  const result = await generator.generate(baseCookiesInput());

  assert.match(result.markdown, /Política de Cookies/);
  assert.match(result.markdown, /Categorías de Cookies/);
  assert.match(result.markdown, /Consentimiento y Controles de Cookies/);
  assert.match(result.markdown, /publicidad/i);
  assert.match(result.markdown, /Aviso de Cookies para Argentina|estrictamente necesarias/i);
});

test('cookies html includes internal JSON-LD metadata', async () => {
  const generator = new CookiesPolicyGenerator();
  const result = await generator.generate(baseCookiesInput());

  assert.match(result.html, /<script type="application\/ld\+json">/);
  assert.match(result.html, /"@type":"Organization"/);
  assert.match(result.html, /<time datetime="[^"]+">/);
});

test('cookies validation blocks missing website and warns on missing management details', async () => {
  const generator = new CookiesPolicyGenerator();
  const input = baseCookiesInput();
  input.business.websiteUrl = '';
  input.cookies.managementUrl = '';
  input.contact.email = '';
  input.contact.pageUrl = '';
  input.settings.language = 'en';

  const validation = await generator.validate(input);

  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => /URL del sitio|Website or app URL/i.test(error)));
  assert.ok(validation.warnings.some((warning) => /gestionar cookies|manage cookies/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /Spanish|español/i.test(warning)));
});

test('cookies publish command returns final public URL without full document body', async () => {
  const outputDir = path.join('/tmp', 'cookies-publish-cli-test');
  await fs.rm(outputDir, { recursive: true, force: true });
  const inputPath = path.join('/tmp', 'privacy-policy-generator-cookies-example.json');
  await fs.writeFile(inputPath, `${JSON.stringify(baseCookiesInput(), null, 2)}\n`, 'utf8');

  const { stdout } = await execFileAsync('node', [
    path.join(__dirname, '..', 'cli.js'),
    'publish',
    '--document',
    'cookies',
    '--input',
    inputPath,
    '--base-url',
    'https://example.com/cookies',
    '--publish-dir',
    outputDir
  ]);

  assert.match(stdout, /^https:\/\/example\.com\/cookies\/autopost-cli-operator-[a-f0-9]{16}\.html/m);
  assert.doesNotMatch(stdout, /Política de Cookies|Cookie Policy/);
});

function baseRefundInput() {
  return {
    documentType: 'refund',
    business: {
      name: 'AutoPost CLI Operator',
      type: 'ecommerce',
      websiteUrl: 'https://autopost.example.com/',
      country: 'Argentina',
      address: 'Adolfo Alsina 3135, B1849, Buenos Aires, Argentina'
    },
    contact: {
      email: 'legal@autopost.example.com',
      phone: '+5491123317940',
      pageUrl: 'https://autopost.example.com/contacto'
    },
    refund: {
      offeringType: 'physical_goods',
      acceptsReturns: true,
      refundWindow: '10 días',
      exchangeWindow: '10 días',
      returnConditions: 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.',
      refundMethod: 'el mismo medio de pago original',
      refundProcessingTime: '10 días hábiles',
      returnShippingResponsibility: 'case_by_case',
      returnRequestChannel: 'legal@autopost.example.com',
      nonReturnableItems: ['Productos personalizados o hechos a medida'],
      digitalGoodsFinal: false,
      damagedItemsProcess: 'Si el producto llega dañado, incorrecto o con fallas, pedimos fotos y datos del pedido.'
    },
    settings: {
      language: 'es'
    }
  };
}

test('refund generator creates a spanish return and refund policy with timing and exceptions', async () => {
  const generator = new ReturnRefundPolicyGenerator();
  const result = await generator.generate(baseRefundInput());

  assert.match(result.markdown, /Política de Devoluciones y Reembolsos/);
  assert.match(result.markdown, /10 días hábiles/);
  assert.match(result.markdown, /Productos personalizados o hechos a medida/);
  assert.match(result.markdown, /derecho de arrepentimiento|venta a distancia|Consumo y Venta a Distancia/i);
});

test('refund html includes internal JSON-LD metadata', async () => {
  const generator = new ReturnRefundPolicyGenerator();
  const result = await generator.generate(baseRefundInput());

  assert.match(result.html, /<script type="application\/ld\+json">/);
  assert.match(result.html, /"@type":"WebPage"/);
  assert.match(result.html, /<main id="main-content" aria-labelledby="document-title">/);
});

test('refund validation blocks missing website and warns on missing process details', async () => {
  const generator = new ReturnRefundPolicyGenerator();
  const input = baseRefundInput();
  input.business.websiteUrl = '';
  input.refund.refundWindow = '';
  input.refund.refundProcessingTime = '';
  input.refund.returnConditions = '';
  input.refund.damagedItemsProcess = '';

  const validation = await generator.validate(input);

  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => /URL del sitio|Website or app URL/i.test(error)));
  assert.ok(validation.warnings.some((warning) => /reembolso|refund/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /estado|condition/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /arrepentimiento|withdrawal/i.test(warning)));
  assert.ok(validation.warnings.some((warning) => /defectuoso|damaged|distinto/i.test(warning)));
});

test('refund publish command returns final public URL without full document body', async () => {
  const outputDir = path.join('/tmp', 'refund-publish-cli-test');
  await fs.rm(outputDir, { recursive: true, force: true });
  const inputPath = path.join('/tmp', 'privacy-policy-generator-refund-example.json');
  await fs.writeFile(inputPath, `${JSON.stringify(baseRefundInput(), null, 2)}\n`, 'utf8');

  const { stdout } = await execFileAsync('node', [
    path.join(__dirname, '..', 'cli.js'),
    'publish',
    '--document',
    'refund',
    '--input',
    inputPath,
    '--base-url',
    'https://example.com/refunds',
    '--publish-dir',
    outputDir
  ]);

  assert.match(stdout, /^https:\/\/example\.com\/refunds\/autopost-cli-operator-[a-f0-9]{16}\.html/m);
  assert.doesNotMatch(stdout, /Política de Devoluciones y Reembolsos|Return & Refund Policy/);
});

function baseDisclaimerInput() {
  return {
    documentType: 'disclaimer',
    business: {
      name: 'AutoPost CLI Operator',
      websiteUrl: 'https://autopost.example.com/',
      country: 'Argentina',
      address: 'Adolfo Alsina 3135, B1849, Buenos Aires, Argentina'
    },
    contact: {
      email: 'legal@autopost.example.com',
      phone: '+5491123317940',
      pageUrl: 'https://autopost.example.com/contacto'
    },
    disclaimer: {
      categories: ['errors_omissions', 'external_links', 'own_risk', 'product_reviews'],
      externalLinksPolicy: 'No controlamos ni garantizamos sitios externos enlazados.',
      affiliateDisclosure: 'Algunas herramientas o recomendaciones pueden involucrar enlaces afiliados o beneficios indirectos.',
      reviewMethodology: 'Las reseñas se basan en criterio editorial, experiencia de uso o pruebas puntuales.',
      customRiskStatement: 'El uso del servicio y de sus materiales corre por cuenta del usuario.'
    },
    settings: {
      language: 'es'
    }
  };
}

test('disclaimer generator creates modular disclaimer sections', async () => {
  const generator = new DisclaimerGenerator();
  const result = await generator.generate(baseDisclaimerInput());

  assert.match(result.markdown, /Descargo de Responsabilidad/);
  assert.match(result.markdown, /Errores y Omisiones|enlaces externos|Uso bajo tu Propio Riesgo/i);
  assert.match(result.markdown, /reseñas/i);
});

test('disclaimer html includes internal JSON-LD metadata', async () => {
  const generator = new DisclaimerGenerator();
  const result = await generator.generate(baseDisclaimerInput());

  assert.match(result.html, /<script type="application\/ld\+json">/);
  assert.match(result.html, /"@type":"Organization"/);
  assert.match(result.html, /<time datetime="[^"]+">/);
});

test('disclaimer validation blocks missing website and warns on review methodology gaps', async () => {
  const generator = new DisclaimerGenerator();
  const input = baseDisclaimerInput();
  input.business.websiteUrl = '';
  input.disclaimer.affiliateDisclosure = '';
  input.disclaimer.reviewMethodology = '';

  const validation = await generator.validate(input);

  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((error) => /URL del sitio|Website or app URL/i.test(error)));
  assert.ok(validation.warnings.some((warning) => /reseñas|reviews/i.test(warning)));
});

test('disclaimer publish command returns final public URL without full document body', async () => {
  const outputDir = path.join('/tmp', 'disclaimer-publish-cli-test');
  await fs.rm(outputDir, { recursive: true, force: true });
  const inputPath = path.join('/tmp', 'privacy-policy-generator-disclaimer-example.json');
  await fs.writeFile(inputPath, `${JSON.stringify(baseDisclaimerInput(), null, 2)}\n`, 'utf8');

  const { stdout } = await execFileAsync('node', [
    path.join(__dirname, '..', 'cli.js'),
    'publish',
    '--document',
    'disclaimer',
    '--input',
    inputPath,
    '--base-url',
    'https://example.com/disclaimer',
    '--publish-dir',
    outputDir
  ]);

  assert.match(stdout, /^https:\/\/example\.com\/disclaimer\/autopost-cli-operator-[a-f0-9]{16}\.html/m);
  assert.doesNotMatch(stdout, /Descargo de Responsabilidad|Disclaimer/);
});
