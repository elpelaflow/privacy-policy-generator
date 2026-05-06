#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const PrivacyPolicyGenerator = require('./js/generator');
const TermsGenerator = require('./js/terms-generator');
const { publishPolicy } = require('./js/publishing');

const DOCUMENT_OPTIONS = [
  { value: 'privacy', label: 'Política de privacidad', description: 'Genera una política de privacidad con foco en datos, terceros, cookies y derechos.' },
  { value: 'terms', label: 'Términos y condiciones', description: 'Genera condiciones de servicio o términos comerciales del sitio /terms.' }
];

const BUSINESS_TYPE_OPTIONS = [
  { value: 'ecommerce', label: 'E-commerce', description: 'Tienda online que vende productos o servicios y procesa pedidos.' },
  { value: 'blog', label: 'Blog / Contenido', description: 'Sitio editorial, newsletter o publicación de contenido.' },
  { value: 'saas', label: 'SaaS / Web App', description: 'Software online con cuentas, panel, suscripciones o uso autenticado.' },
  { value: 'mobile', label: 'App móvil', description: 'Aplicación para iOS, Android o experiencia centrada en mobile.' },
  { value: 'nonprofit', label: 'Nonprofit / ONG', description: 'Organización sin fines de lucro, campañas o donaciones.' }
];

const JURISDICTION_OPTIONS = [
  { value: 'us', label: 'Estados Unidos', description: 'Base principal en Estados Unidos o foco fuerte en normas estatales como California.' },
  { value: 'eu', label: 'Unión Europea', description: 'Base principal en la UE o aplicación directa de GDPR.' },
  { value: 'uk', label: 'Reino Unido', description: 'Base principal en UK o aplicación directa de UK GDPR.' },
  { value: 'ca', label: 'Canadá', description: 'Base principal en Canadá o necesidad de lenguaje tipo PIPEDA.' },
  { value: 'au', label: 'Australia', description: 'Base principal en Australia o necesidad de lenguaje APP.' },
  { value: 'ar', label: 'Argentina', description: 'Base principal en Argentina o necesidad de cobertura orientada a Ley 25.326 y AAIP.' },
  { value: 'global', label: 'Otro / Global', description: 'Tu caso no encaja del todo en las opciones anteriores y querés una base genérica con revisión manual.' }
];

const REGION_OPTIONS = [
  { value: 'us', label: 'Estados Unidos', description: 'Tenés usuarios, clientes o ventas relevantes en EE.UU.' },
  { value: 'eu', label: 'Unión Europea', description: 'Tenés usuarios, clientes o ventas relevantes en la UE.' },
  { value: 'uk', label: 'Reino Unido', description: 'Tenés usuarios, clientes o ventas relevantes en UK.' },
  { value: 'ca', label: 'Canadá', description: 'Tenés usuarios, clientes o ventas relevantes en Canadá.' },
  { value: 'au', label: 'Australia', description: 'Tenés usuarios, clientes o ventas relevantes en Australia.' },
  { value: 'ar', label: 'Argentina', description: 'Tenés usuarios, clientes o ventas relevantes en Argentina.' },
  { value: 'global', label: 'Otro / Global', description: 'Operás en otros lugares o preferís una cobertura genérica manual.' }
];

const DATA_OPTIONS = [
  { value: 'personal', label: 'Datos personales', description: 'Nombre, email, usuario, dirección u otros datos identificatorios.' },
  { value: 'financial', label: 'Datos financieros', description: 'Información de pago, facturación o datos ligados a transacciones.' },
  { value: 'tax', label: 'Datos fiscales', description: 'CUIT, CUIL, condición impositiva, facturación y datos requeridos por obligaciones fiscales.' },
  { value: 'identity', label: 'Datos de identidad', description: 'Documento, verificación de identidad o datos comerciales para prevenir fraude o validar operaciones.' },
  { value: 'usage', label: 'Datos de uso', description: 'Métricas, logs, IP, navegación, eventos y diagnósticos.' },
  { value: 'cookies', label: 'Cookies', description: 'Cookies o tecnologías similares para sesión, preferencias o analítica.' },
  { value: 'location', label: 'Ubicación', description: 'Ubicación aproximada o precisa del usuario o dispositivo.' },
  { value: 'profiling', label: 'Perfilado o segmentación', description: 'Datos usados para personalización, scoring, segmentación comercial o decisiones automatizadas.' }
];

const THIRD_PARTY_OPTIONS = [
  { value: 'analytics', label: 'Analítica', description: 'Google Analytics, Plausible, PostHog u otra herramienta de medición.' },
  { value: 'advertising', label: 'Publicidad', description: 'Redes de anuncios, remarketing o campañas pagas.' },
  { value: 'payment', label: 'Múltiples procesadores de pago', description: 'Usás más de un proveedor de pago o una integración general de pagos.' },
  { value: 'paypal_only', label: 'Sólo PayPal', description: 'Todo el flujo de pago pasa por PayPal y no almacenás tarjetas localmente.' },
  { value: 'shipping', label: 'Logística y envíos', description: 'Correo, courier, fulfillment o terceros que reciben dirección y datos del pedido.' },
  { value: 'cloud', label: 'Infraestructura cloud', description: 'Hosting, bases de datos, backups o storage en terceros.' },
  { value: 'social', label: 'Integraciones sociales', description: 'Embeds, widgets, login social o contenido desde redes sociales.' },
  { value: 'email', label: 'Email / marketing', description: 'Newsletter, email transaccional, automatizaciones o CRM de email.' }
];

const LEGAL_BASE_OPTIONS = [
  { value: 'contract', label: 'Ejecución de contrato', description: 'Procesás datos porque es necesario para prestar el servicio, vender o entregar un pedido.' },
  { value: 'consent', label: 'Consentimiento', description: 'Procesás datos porque el usuario aceptó de forma explícita, por ejemplo marketing o cookies no esenciales.' },
  { value: 'legal_obligation', label: 'Obligación legal', description: 'Procesás o retenés datos por normas fiscales, contables, regulatorias o de seguridad.' },
  { value: 'legitimate_interest', label: 'Interés legítimo', description: 'Procesás ciertos datos para operar, prevenir fraude o mejorar el servicio, sujeto a evaluación y equilibrio.' }
];

const COMPLIANCE_OPTIONS = [
  { value: 'ccpa', label: 'CCPA / CPRA', description: 'Querés lenguaje específico para privacidad en California.' },
  { value: 'coppa', label: 'COPPA', description: 'Puede haber menores o necesitás revisar privacidad infantil.' },
  { value: 'caloppa', label: 'CalOPPA', description: 'Querés reforzar cobertura general para California.' },
  { value: 'pipeda', label: 'PIPEDA', description: 'Querés reforzar cobertura para Canadá.' }
];

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'markdown', label: 'Markdown', description: 'Ideal para editar, versionar y revisar rápido en texto.' },
  { value: 'html', label: 'HTML', description: 'Ideal para publicar o integrar en una web.' },
  { value: 'text', label: 'Texto plano', description: 'Ideal para revisar en terminal o pegar en otro sistema.' }
];

const OUTPUT_LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español', description: 'Genera la política en español.' },
  { value: 'en', label: 'English', description: 'Generates the policy in English.' }
];

const TERMS_OFFERING_OPTIONS = [
  { value: 'physical_goods', label: 'Productos físicos', description: 'Vendés bienes tangibles que requieren preparación, despacho o entrega física.' },
  { value: 'digital_products', label: 'Productos digitales', description: 'Vendés archivos, licencias, cursos, descargas o contenido digital.' },
  { value: 'services', label: 'Servicios', description: 'Prestás servicios profesionales, implementación, soporte o trabajo bajo pedido.' },
  { value: 'subscriptions', label: 'Suscripciones', description: 'Cobrás planes recurrentes, membresías o acceso periódico.' }
];

const TERMS_CHANGE_OPTIONS = [
  { value: 'site_notice', label: 'Aviso en el sitio', description: 'Los cambios se publican en el sitio o aplicación.' },
  { value: 'email', label: 'Email', description: 'Los cambios relevantes se comunican por correo electrónico.' },
  { value: 'both', label: 'Ambos', description: 'Combinás aviso visible en el sitio y email cuando el cambio es relevante.' }
];

const TERMS_ADR_OPTIONS = [
  { value: 'none', label: 'Ninguno', description: 'No querés fijar un método alternativo específico.' },
  { value: 'mediation', label: 'Mediación', description: 'Las partes intentan una mediación antes de judicializar, cuando corresponda.' },
  { value: 'arbitration', label: 'Arbitraje', description: 'Prevés arbitraje si el marco legal y el servicio lo admiten.' }
];

const TERMS_RETURN_SHIPPING_OPTIONS = [
  { value: 'customer', label: 'Cliente', description: 'El costo de devolución corre normalmente por cuenta del cliente.' },
  { value: 'merchant', label: 'Negocio', description: 'El negocio asume el costo de la devolución cuando aplica.' },
  { value: 'case_by_case', label: 'Caso por caso', description: 'La devolución depende del motivo, estado del producto o ley aplicable.' }
];

const TERMS_STANDARD_RESTRICTIONS = [
  { value: 'No usar el sitio para actividades ilegales.', label: 'Actividad ilegal', description: 'Impide uso del sitio para fines ilícitos o fraudulentos.' },
  { value: 'No interferir con la seguridad, estabilidad o funcionamiento técnico del sitio.', label: 'Interferencia técnica', description: 'Prohíbe ataques, scraping abusivo o manipulación técnica.' },
  { value: 'No copiar, revender o explotar el contenido o productos fuera de lo permitido.', label: 'Reventa o explotación', description: 'Restringe copia, reventa o explotación no autorizada.' },
  { value: 'No enviar spam, contenido abusivo o información falsa.', label: 'Spam o abuso', description: 'Prohíbe spam, hostigamiento o datos falsos.' }
];

const BACK = Symbol('back');
const DEFAULT_PUBLIC_BASE_URL = 'https://dev-flow.duckdns.org/privacy';
const DEFAULT_PUBLISH_DIR = '/home/dev-flow/tinyclaw/infra/www/privacy';
const ANSI_ENABLED = Boolean(stdout.isTTY && process.env.NO_COLOR !== '1');

function color(code, value) {
  return ANSI_ENABLED ? `\u001b[${code}m${value}\u001b[0m` : value;
}

function bold(value) {
  return color('1', value);
}

function dim(value) {
  return color('2', value);
}

function cyan(value) {
  return color('36', value);
}

function yellow(value) {
  return color('33', value);
}

function green(value) {
  return color('32', value);
}

function red(value) {
  return color('31', value);
}

function magenta(value) {
  return color('35', value);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const value = rest[index + 1] && !rest[index + 1].startsWith('--')
      ? rest[++index]
      : 'true';

    options[key] = value;
  }

  return { command, options };
}

async function readInput(options) {
  if (!options.input) {
    throw new Error('Missing required --input <file.json>');
  }

  const filePath = path.resolve(process.cwd(), options.input);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function readJsonFile(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  const raw = await fs.readFile(resolved, 'utf8');
  return JSON.parse(raw);
}

async function listReusablePrivacyInputs() {
  const candidateDirs = [
    process.cwd(),
    '/tmp/privacy-policy-generator'
  ];

  const candidateNames = new Set([
    'wizard-input.json'
  ]);

  const results = [];

  for (const dir of candidateDirs) {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) {
        continue;
      }

      const likelyPrivacyInput = entry.name === 'wizard-input.json'
        || entry.name.endsWith('-privacy-policy-input.json')
        || entry.name.includes('privacy');

      if (!likelyPrivacyInput) {
        continue;
      }

      const resolvedPath = path.join(dir, entry.name);
      if (candidateNames.has(resolvedPath)) {
        continue;
      }

      try {
        const raw = await fs.readFile(resolvedPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed?.business && parsed?.contact && parsed?.operations && parsed?.dataPractices && !parsed?.terms) {
          results.push({
            path: resolvedPath,
            label: path.relative(process.cwd(), resolvedPath) || resolvedPath,
            description: `${parsed.business?.name || 'Negocio sin nombre'}${parsed.business?.websiteUrl ? ` · ${parsed.business.websiteUrl}` : ''}`
          });
          candidateNames.add(resolvedPath);
        }
      } catch {
        continue;
      }
    }
  }

  results.sort((a, b) => {
    if (a.path.endsWith('wizard-input.json')) return -1;
    if (b.path.endsWith('wizard-input.json')) return 1;
    return a.path.localeCompare(b.path);
  });

  return results;
}

function isBackCommand(value) {
  return ['<', 'volver', 'back'].includes(String(value || '').trim().toLowerCase());
}

function backHint(allowBack) {
  return allowBack ? dim(' | < = volver') : '';
}

async function promptText(rl, label, { required = false, allowEmpty = true, defaultValue = '', allowBack = true } = {}) {
  while (true) {
    const suffix = defaultValue ? ` [default: ${defaultValue}]` : '';
    const answer = (await rl.question(`${label}${suffix}${backHint(allowBack)}: `)).trim();
    if (allowBack && isBackCommand(answer)) {
      return BACK;
    }
    const value = answer || defaultValue;

    if (!required || value || allowEmpty) {
      return value;
    }

    stdout.write(`${red('Este campo es obligatorio.')}\n`);
  }
}

async function promptSingleChoice(rl, title, options, { allowOther = true, allowBack = true } = {}) {
  stdout.write(`\n${bold(cyan(title))}\n`);
  options.forEach((option, index) => {
    stdout.write(`  ${yellow(String(index + 1))}. ${bold(option.label)}\n`);
    stdout.write(`     ${dim(option.description)}\n`);
  });

  const otherIndex = options.length + 1;
  if (allowOther) {
    stdout.write(`  ${yellow(String(otherIndex))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Escribís una variante manual y el sistema la deja anotada para revisión.')}\n`);
  }

  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}${backHint(allowBack)}: `)).trim();
    if (allowBack && isBackCommand(answer)) {
      return BACK;
    }
    const choice = Number.parseInt(answer, 10);

    if (choice >= 1 && choice <= options.length) {
      return { value: options[choice - 1].value, manualNote: '' };
    }

    if (allowOther && choice === otherIndex) {
      const manualNote = await promptText(rl, 'Describí la opción manual', { required: true, allowEmpty: false, allowBack: true });
      if (manualNote === BACK) {
        continue;
      }
      return { value: 'other', manualNote };
    }

    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function promptMultiChoice(rl, title, options, { allowOther = true, allowNone = true, allowBack = true } = {}) {
  stdout.write(`\n${bold(cyan(title))}\n`);
  options.forEach((option, index) => {
    stdout.write(`  ${yellow(String(index + 1))}. ${bold(option.label)}\n`);
    stdout.write(`     ${dim(option.description)}\n`);
  });

  const otherIndex = options.length + 1;
  if (allowOther) {
    stdout.write(`  ${yellow(String(otherIndex))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Agregás una nota manual para algo que no está en la lista.')}\n`);
  }

  if (allowNone) {
    stdout.write(`  ${dim('Enter vacío = ninguna opción')}\n`);
  }

  while (true) {
    const answer = (await rl.question(`${green('Elegí uno o varios números separados por coma')}${backHint(allowBack)}: `)).trim();
    if (allowBack && isBackCommand(answer)) {
      return BACK;
    }
    if (!answer && allowNone) {
      return { values: [], manualNotes: [] };
    }

    const parts = answer
      .split(',')
      .map((item) => Number.parseInt(item.trim(), 10))
      .filter((item) => Number.isInteger(item));

    if (parts.length === 0) {
      stdout.write(`${red('No se entendió la selección. Probá de nuevo.')}\n`);
      continue;
    }

    const unique = [...new Set(parts)];
    const invalid = unique.some((item) => item < 1 || item > otherIndex || (!allowOther && item > options.length));
    if (invalid) {
      stdout.write(`${red('Hay una opción inválida. Probá de nuevo.')}\n`);
      continue;
    }

    const values = unique
      .filter((item) => item >= 1 && item <= options.length)
      .map((item) => options[item - 1].value);

    const manualNotes = [];
    if (allowOther && unique.includes(otherIndex)) {
      const manualNote = await promptText(rl, 'Describí la opción manual', { required: true, allowEmpty: false, allowBack: true });
      if (manualNote === BACK) {
        continue;
      }
      manualNotes.push(manualNote);
    }

    return { values, manualNotes };
  }
}

async function promptYesNo(rl, title, description, defaultValue = false, allowBack = true) {
  stdout.write(`\n${bold(cyan(title))}\n`);
  stdout.write(`  ${dim(description)}\n`);

  while (true) {
    const defaultText = defaultValue ? 'S/n' : 's/N';
    const raw = (await rl.question(`${green(`Respuesta [${defaultText}]`)}${backHint(allowBack)}: `)).trim();
    if (allowBack && isBackCommand(raw)) {
      return BACK;
    }
    const answer = raw.toLowerCase();

    if (!answer) {
      return defaultValue;
    }

    if (['s', 'si', 'sí', 'y', 'yes'].includes(answer)) {
      return true;
    }

    if (['n', 'no'].includes(answer)) {
      return false;
    }

    stdout.write(`${red('Respondé sí o no.')}\n`);
  }
}

async function runQuestions(questions) {
  let index = 0;
  while (index < questions.length) {
    const result = await questions[index]();
    if (result === BACK) {
      if (index === 0) {
        stdout.write('Ya estás en la primera pregunta de este bloque.\n');
        stdout.write(`${dim('No podés retroceder más dentro de este bloque.')}\n`);
        continue;
      }
      index -= 1;
      continue;
    }
    index += 1;
  }
}

async function publishGeneratedPolicy(input, result, options = {}) {
  if (!options.baseUrl && !options.publishDir) {
    return null;
  }

  return publishPolicy({
    businessName: input.business?.name || 'privacy-policy',
    htmlContent: result.html,
    outputDir: options.publishDir || DEFAULT_PUBLISH_DIR,
    baseUrl: options.baseUrl || DEFAULT_PUBLIC_BASE_URL
  });
}

function defaultBaseUrlForDocument(documentType) {
  return documentType === 'terms'
    ? 'https://dev-flow.duckdns.org/terms'
    : DEFAULT_PUBLIC_BASE_URL;
}

function defaultPublishDirForDocument(documentType) {
  return documentType === 'terms'
    ? '/home/dev-flow/tinyclaw/infra/www/terms'
    : DEFAULT_PUBLISH_DIR;
}

function resolveDocumentType(options, input) {
  if (options.document === 'terms' || options.document === 'privacy') {
    return options.document;
  }
  if (input?.documentType === 'terms' || input?.documentType === 'privacy') {
    return input.documentType;
  }
  if (input?.terms) {
    return 'terms';
  }
  return 'privacy';
}

function inferJurisdiction(country) {
  const normalized = String(country || '').trim().toLowerCase();
  if (['united states', 'usa', 'us', 'estados unidos'].includes(normalized)) {
    return 'us';
  }
  if (['germany', 'france', 'spain', 'italy', 'netherlands', 'european union', 'eu', 'unión europea'].includes(normalized)) {
    return 'eu';
  }
  if (['united kingdom', 'uk', 'reino unido', 'england', 'scotland', 'wales'].includes(normalized)) {
    return 'uk';
  }
  if (['canada', 'canadá'].includes(normalized)) {
    return 'ca';
  }
  if (['australia'].includes(normalized)) {
    return 'au';
  }
  if (['argentina', 'ar', 'república argentina', 'republica argentina'].includes(normalized)) {
    return 'ar';
  }
  return 'global';
}

function defaultContactEmail(websiteUrl) {
  try {
    if (!websiteUrl) {
      return '';
    }
    const hostname = new URL(websiteUrl).hostname.replace(/^www\./, '');
    return `privacy@${hostname}`;
  } catch {
    return '';
  }
}

function defaultContactPage(websiteUrl) {
  try {
    if (!websiteUrl) {
      return '';
    }
    const url = new URL(websiteUrl);
    url.pathname = '/privacy';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

function slugify(value) {
  return String(value || 'privacy-policy')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'privacy-policy';
}

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value;
}

function optionLabels(options, values) {
  return values.length > 0
    ? values.map((value) => optionLabel(options, value)).join(', ')
    : '(ninguno)';
}

function addUnique(list, value) {
  if (!value || list.includes(value)) {
    return list;
  }
  list.push(value);
  return list;
}

function removeValue(list, value) {
  return list.filter((item) => item !== value);
}

function mergeTermsStateFromPrivacyInput(state, input) {
  state.business.name = input.business?.name || state.business.name;
  state.business.type = input.business?.type || state.business.type;
  state.business.websiteUrl = input.business?.websiteUrl || state.business.websiteUrl;
  state.business.country = input.business?.country || state.business.country;
  state.business.address = input.business?.address || state.business.address;

  state.contact.email = input.contact?.email || state.contact.email;
  state.contact.phone = input.contact?.phone || state.contact.phone;
  state.contact.pageUrl = input.contact?.pageUrl || state.contact.pageUrl;

  state.operations.primaryJurisdiction = input.operations?.primaryJurisdiction || state.operations.primaryJurisdiction;
  state.operations.sellRegions = Array.isArray(input.operations?.sellRegions) && input.operations.sellRegions.length > 0
    ? input.operations.sellRegions
    : state.operations.sellRegions;

  if (state.business.type === 'ecommerce') {
    if (input.dataPractices?.thirdParties?.includes('payment')) {
      state.terms.paymentProvider = state.terms.paymentProvider || 'Pasarela general o múltiples procesadores';
    }
    if (input.dataPractices?.thirdParties?.includes('paypal_only')) {
      state.terms.paymentProvider = state.terms.paymentProvider || 'PayPal';
    }
    if (input.dataPractices?.thirdParties?.includes('shipping')) {
      state.terms.shippingDelayDisclaimer = true;
    }
    if (input.dataPractices?.collectedData?.includes('financial')) {
      state.terms.pricesIncludeTaxes = state.terms.pricesIncludeTaxes ?? true;
    }
  }

  if ((input.business?.country || '').toLowerCase().includes('argentina') || input.operations?.primaryJurisdiction === 'ar') {
    state.output.language = 'es';
    state.operations.primaryJurisdiction = state.operations.primaryJurisdiction || 'ar';
    state.operations.sellRegions = state.operations.sellRegions.length > 0 ? state.operations.sellRegions : ['ar'];
    state.terms.currency = state.terms.currency || 'ARS';
  }
}

function buildInputFromState(state) {
  return {
    documentType: 'privacy',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    operations: {
      primaryJurisdiction: state.operations.primaryJurisdiction,
      sellRegions: state.operations.sellRegions,
      childrenAudience: state.operations.childrenAudience
    },
    dataPractices: {
      collectedData: state.dataPractices.collectedData,
      thirdParties: state.dataPractices.thirdParties,
      legalBases: state.dataPractices.legalBases
    },
    compliance: {
      requestedFrameworks: state.compliance.requestedFrameworks
    },
    settings: {
      language: state.output.language
    },
    customizations: {
      manualDisclosures: state.manualDisclosures
    }
  };
}

function removeManualNotesByPrefix(state, prefixes) {
  state.manualDisclosures = state.manualDisclosures.filter(
    (entry) => !prefixes.some((prefix) => entry.startsWith(prefix))
  );
}

async function collectBusinessSection(rl, state) {
  removeManualNotesByPrefix(state, ['Tipo de negocio indicado manualmente:']);
  await runQuestions([
    async () => {
      const value = await promptText(rl, '\nNombre del negocio o proyecto', {
        required: true,
        allowEmpty: false,
        defaultValue: state.business.name
      });
      if (value === BACK) return BACK;
      state.business.name = value;
    },
    async () => {
      const value = await promptText(rl, 'URL del sitio o app', {
        allowEmpty: true,
        defaultValue: state.business.websiteUrl
      });
      if (value === BACK) return BACK;
      state.business.websiteUrl = value;
    },
    async () => {
      const businessTypeChoice = await promptSingleChoice(rl, 'Tipo de negocio', BUSINESS_TYPE_OPTIONS);
      if (businessTypeChoice === BACK) return BACK;
      state.business.type = businessTypeChoice.value;
      if (businessTypeChoice.value === 'other') {
        state.manualDisclosures.push(`Tipo de negocio indicado manualmente: ${businessTypeChoice.manualNote}`);
        const baseTypeChoice = await promptSingleChoice(rl, 'Elegí la categoría base más parecida para estructurar la política', BUSINESS_TYPE_OPTIONS, { allowOther: false });
        if (baseTypeChoice === BACK) {
          removeManualNotesByPrefix(state, ['Tipo de negocio indicado manualmente:']);
          return BACK;
        }
        state.business.type = baseTypeChoice.value;
      }
    },
    async () => {
      const value = await promptText(rl, 'País principal del negocio', {
        required: true,
        allowEmpty: false,
        defaultValue: state.business.country || 'United States'
      });
      if (value === BACK) return BACK;
      state.business.country = value;
    },
    async () => {
      const value = await promptText(rl, 'Dirección física o postal del negocio', {
        allowEmpty: true,
        defaultValue: state.business.address
      });
      if (value === BACK) return BACK;
      state.business.address = value;
    }
  ]);
}

async function collectContactSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptText(rl, '\nEmail de privacidad o contacto', {
        allowEmpty: true,
        defaultValue: state.contact.email || defaultContactEmail(state.business.websiteUrl)
      });
      if (value === BACK) return BACK;
      state.contact.email = value;
    },
    async () => {
      const value = await promptText(rl, 'Teléfono de contacto', {
        allowEmpty: true,
        defaultValue: state.contact.phone
      });
      if (value === BACK) return BACK;
      state.contact.phone = value;
    },
    async () => {
      const value = await promptText(rl, 'URL de página de contacto o privacidad', {
        allowEmpty: true,
        defaultValue: state.contact.pageUrl || defaultContactPage(state.business.websiteUrl)
      });
      if (value === BACK) return BACK;
      state.contact.pageUrl = value;
    }
  ]);
}

async function collectOperationsSection(rl, state) {
  removeManualNotesByPrefix(state, ['Jurisdicción personalizada indicada manualmente:', 'Región operativa manual:']);
  await runQuestions([
    async () => {
      const inferredJurisdiction = inferJurisdiction(state.business.country);
      stdout.write(`\nSugerencia de jurisdicción según país: ${optionLabel(JURISDICTION_OPTIONS, inferredJurisdiction)}\n`);
      const jurisdictionChoice = await promptSingleChoice(rl, 'Jurisdicción principal', JURISDICTION_OPTIONS);
      if (jurisdictionChoice === BACK) return BACK;
      state.operations.primaryJurisdiction = jurisdictionChoice.value === 'other' ? 'global' : jurisdictionChoice.value;
      if (jurisdictionChoice.value === 'other') {
        state.manualDisclosures.push(`Jurisdicción personalizada indicada manualmente: ${jurisdictionChoice.manualNote}`);
      }
    },
    async () => {
      const regionsChoice = await promptMultiChoice(rl, 'Regiones donde vendés u operás', REGION_OPTIONS);
      if (regionsChoice === BACK) return BACK;
      state.operations.sellRegions = regionsChoice.values.length > 0
        ? regionsChoice.values
        : [state.operations.primaryJurisdiction].filter((value) => value && value !== 'global');
      state.manualDisclosures.push(...regionsChoice.manualNotes.map((note) => `Región operativa manual: ${note}`));
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Audiencia infantil',
        'Marcá sí si el servicio está dirigido a menores o si sabés que trata datos de niños.',
        state.operations.childrenAudience
      );
      if (value === BACK) return BACK;
      state.operations.childrenAudience = value;
    }
  ]);
}

async function collectDataSection(rl, state) {
  removeManualNotesByPrefix(state, ['Dato recolectado no listado:', 'Tercero o proveedor no listado:', 'Base legal manual:', 'Marco de cumplimiento manual:']);
  await runQuestions([
    async () => {
      const dataChoice = await promptMultiChoice(rl, 'Qué datos recolectás', DATA_OPTIONS);
      if (dataChoice === BACK) return BACK;
      state.dataPractices.collectedData = dataChoice.values;
      state.manualDisclosures.push(...dataChoice.manualNotes.map((note) => `Dato recolectado no listado: ${note}`));
    },
    async () => {
      const thirdPartiesChoice = await promptMultiChoice(rl, 'Qué terceros o proveedores intervienen', THIRD_PARTY_OPTIONS);
      if (thirdPartiesChoice === BACK) return BACK;
      state.dataPractices.thirdParties = thirdPartiesChoice.values;
      state.manualDisclosures.push(...thirdPartiesChoice.manualNotes.map((note) => `Tercero o proveedor no listado: ${note}`));
    },
    async () => {
      const legalBasesChoice = await promptMultiChoice(rl, 'Qué bases legales usás para tratar los datos', LEGAL_BASE_OPTIONS, { allowNone: false });
      if (legalBasesChoice === BACK) return BACK;
      state.dataPractices.legalBases = legalBasesChoice.values;
      state.manualDisclosures.push(...legalBasesChoice.manualNotes.map((note) => `Base legal manual: ${note}`));
    },
    async () => {
      const complianceChoice = await promptMultiChoice(rl, 'Qué marcos de cumplimiento querés reforzar', COMPLIANCE_OPTIONS);
      if (complianceChoice === BACK) return BACK;
      state.compliance.requestedFrameworks = complianceChoice.values;
      state.manualDisclosures.push(...complianceChoice.manualNotes.map((note) => `Marco de cumplimiento manual: ${note}`));
    },
    async () => {
      if (state.business.type !== 'ecommerce') return;
      const usesPayments = await promptYesNo(
        rl,
        'Pagos y checkout',
        'Para e-commerce, indicá si terceros procesan pagos o checkout.',
        state.dataPractices.thirdParties.includes('payment') || state.dataPractices.thirdParties.includes('paypal_only')
      );
      if (usesPayments === BACK) return BACK;
      if (!usesPayments) {
        state.dataPractices.thirdParties = removeValue(removeValue(state.dataPractices.thirdParties, 'payment'), 'paypal_only');
        return;
      }

      const paymentChoice = await promptSingleChoice(rl, 'Cómo procesás los pagos', [
        { value: 'payment', label: 'Pasarela general o múltiples procesadores', description: 'Mercado Pago, Stripe, gateways mixtos o más de un proveedor de pago.' },
        { value: 'paypal_only', label: 'Sólo PayPal', description: 'Todo el pago pasa por PayPal y no usás otra pasarela principal.' }
      ], { allowOther: false });
      if (paymentChoice === BACK) return BACK;

      state.dataPractices.thirdParties = removeValue(removeValue(state.dataPractices.thirdParties, 'payment'), 'paypal_only');
      state.dataPractices.thirdParties = addUnique(state.dataPractices.thirdParties, paymentChoice.value);
      state.dataPractices.collectedData = addUnique(state.dataPractices.collectedData, 'financial');
    },
    async () => {
      if (state.business.type !== 'ecommerce') return;
      const usesShipping = await promptYesNo(
        rl,
        'Logística y envíos',
        'Indicá si compartís nombre, dirección o teléfono con correo, courier o fulfillment.',
        state.dataPractices.thirdParties.includes('shipping')
      );
      if (usesShipping === BACK) return BACK;
      state.dataPractices.thirdParties = usesShipping
        ? addUnique(state.dataPractices.thirdParties, 'shipping')
        : removeValue(state.dataPractices.thirdParties, 'shipping');
    },
    async () => {
      if (state.business.type !== 'ecommerce') return;
      const usesTaxData = await promptYesNo(
        rl,
        'Facturación y datos fiscales',
        'Indicá si emitís factura o retenés datos fiscales, contables o de facturación.',
        state.dataPractices.collectedData.includes('tax')
      );
      if (usesTaxData === BACK) return BACK;
      state.dataPractices.collectedData = usesTaxData
        ? addUnique(state.dataPractices.collectedData, 'tax')
        : removeValue(state.dataPractices.collectedData, 'tax');
    },
    async () => {
      if (state.business.type !== 'ecommerce') return;
      const usesIdentityData = await promptYesNo(
        rl,
        'Verificación e identidad comercial',
        'Indicá si pedís documento, CUIT/CUIL u otra verificación para fraude, retiros o validación comercial.',
        state.dataPractices.collectedData.includes('identity')
      );
      if (usesIdentityData === BACK) return BACK;
      state.dataPractices.collectedData = usesIdentityData
        ? addUnique(state.dataPractices.collectedData, 'identity')
        : removeValue(state.dataPractices.collectedData, 'identity');
    },
    async () => {
      const usesProfiling = await promptYesNo(
        rl,
        'Perfilado o decisiones automatizadas',
        'Marcá sí si usás scoring, segmentación, personalización relevante o decisiones automáticas sobre usuarios.',
        state.dataPractices.collectedData.includes('profiling')
      );
      if (usesProfiling === BACK) return BACK;
      state.dataPractices.collectedData = usesProfiling
        ? addUnique(state.dataPractices.collectedData, 'profiling')
        : removeValue(state.dataPractices.collectedData, 'profiling');
    }
  ]);
}

async function collectOutputSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptYesNo(
        rl,
        'Generar URL pública hasheada',
        'Si respondés sí, se crea un HTML con nombre hasheado en un directorio publicable y se imprime la URL final lista para usar.',
        state.output.publishHashedUrl
      );
      if (value === BACK) return BACK;
      state.output.publishHashedUrl = value;
      if (value) {
        state.output.format = 'html';
      } else {
        state.output.baseUrl = '';
        state.output.publishDir = '';
      }
    },
    async () => {
      if (!state.output.publishHashedUrl) return;
      const value = await promptText(rl, 'Base URL pública', {
        required: true,
        allowEmpty: false,
        defaultValue: state.output.baseUrl || defaultBaseUrlForDocument(state.documentType || 'privacy')
      });
      if (value === BACK) return BACK;
      state.output.baseUrl = value;
    },
    async () => {
      if (!state.output.publishHashedUrl) return;
      const value = await promptText(rl, 'Directorio local publicable', {
        required: true,
        allowEmpty: false,
        defaultValue: state.output.publishDir || defaultPublishDirForDocument(state.documentType || 'privacy')
      });
      if (value === BACK) return BACK;
      state.output.publishDir = value;
    },
    async () => {
      const value = await promptSingleChoice(rl, 'Idioma de salida', OUTPUT_LANGUAGE_OPTIONS, { allowOther: false });
      if (value === BACK) return BACK;
      state.output.language = value.value;
    },
    async () => {
      const value = await promptSingleChoice(rl, 'Formato de salida', OUTPUT_FORMAT_OPTIONS, { allowOther: false });
      if (value === BACK) return BACK;
      state.output.format = state.output.publishHashedUrl ? 'html' : value.value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Guardar a archivo',
        'Si respondés sí, además de generar el texto te voy a pedir una ruta de salida.',
        state.output.format !== 'text'
      );
      if (value === BACK) return BACK;
      state.output.writeToFile = value;
      if (!value) state.output.outputPath = '';
    },
    async () => {
      if (!state.output.writeToFile) return;
      const suffix = state.documentType === 'terms' ? 'terms' : 'privacy-policy';
      const baseName = `${slugify(state.business.name)}-${suffix}`;
      const value = await promptText(rl, 'Ruta de salida', {
        required: true,
        allowEmpty: false,
        defaultValue: state.output.outputPath || (
          state.output.format === 'html'
            ? `${baseName}.html`
            : state.output.format === 'markdown'
              ? `${baseName}.md`
              : `${baseName}.txt`
        )
      });
      if (value === BACK) return BACK;
      state.output.outputPath = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Guardar también el input JSON',
        'Sirve para regenerar o editar la política después sin repetir el cuestionario.',
        true
      );
      if (value === BACK) return BACK;
      state.output.saveInput = value;
      if (!value) state.output.inputPath = '';
    },
    async () => {
      if (!state.output.saveInput) return;
      const suffix = state.documentType === 'terms' ? 'terms' : 'privacy-policy';
      const baseName = `${slugify(state.business.name)}-${suffix}`;
      const value = await promptText(rl, 'Ruta para guardar el JSON', {
        required: true,
        allowEmpty: false,
        defaultValue: state.output.inputPath || `${baseName}-input.json`
      });
      if (value === BACK) return BACK;
      state.output.inputPath = value;
    }
  ]);
}

function printSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Tipo: ${optionLabel(BUSINESS_TYPE_OPTIONS, state.business.type || '(sin definir)')}\n`);
  stdout.write(`- País: ${state.business.country || '(sin definir)'}\n`);
  stdout.write(`- Jurisdicción principal: ${optionLabel(JURISDICTION_OPTIONS, state.operations.primaryJurisdiction || '(sin definir)')}\n`);
  stdout.write(`- Regiones operativas: ${optionLabels(REGION_OPTIONS, state.operations.sellRegions)}\n`);
  stdout.write(`- Datos recolectados: ${optionLabels(DATA_OPTIONS, state.dataPractices.collectedData)}\n`);
  stdout.write(`- Terceros: ${optionLabels(THIRD_PARTY_OPTIONS, state.dataPractices.thirdParties)}\n`);
  stdout.write(`- Bases legales: ${optionLabels(LEGAL_BASE_OPTIONS, state.dataPractices.legalBases)}\n`);
  stdout.write(`- Compliance: ${optionLabels(COMPLIANCE_OPTIONS, state.compliance.requestedFrameworks)}\n`);
  stdout.write(`- Contacto: ${state.contact.email || state.contact.pageUrl || state.contact.phone || state.business.address || '(faltante)'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) {
    stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  }
  stdout.write(`- Guardar política a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (state.manualDisclosures.length > 0) {
    stdout.write(`- Notas manuales: ${state.manualDisclosures.length}\n`);
  }
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

function buildTermsInputFromState(state) {
  return {
    documentType: 'terms',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    operations: {
      primaryJurisdiction: state.operations.primaryJurisdiction,
      sellRegions: state.operations.sellRegions
    },
    terms: { ...state.terms },
    settings: {
      language: state.output.language
    },
    customizations: {
      manualDisclosures: state.manualDisclosures
    }
  };
}

async function promptDocumentChoice(rl) {
  const choice = await promptSingleChoice(rl, 'Qué querés generar', DOCUMENT_OPTIONS, { allowOther: false, allowBack: false });
  return choice.value;
}

async function maybePreloadTermsFromPrivacy(rl, state) {
  const reuse = await promptYesNo(
    rl,
    'Reutilizar datos desde privacidad',
    'Marcá sí si ya generaste una política de privacidad y querés precargar negocio, contacto, jurisdicción y algunas señales operativas.',
    false,
    false
  );

  if (!reuse) {
    return;
  }

  const candidates = await listReusablePrivacyInputs();

  if (candidates.length > 0) {
    stdout.write(`\n${bold(cyan('JSON de privacidad detectados'))}\n`);
    candidates.forEach((candidate, index) => {
      stdout.write(`  ${yellow(String(index + 1))}. ${bold(candidate.label)}\n`);
      stdout.write(`     ${dim(candidate.description)}\n`);
    });
    stdout.write(`  ${yellow(String(candidates.length + 1))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Escribís manualmente la ruta de otro JSON de privacidad.')}\n`);

    while (true) {
      const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
      const choice = Number.parseInt(answer, 10);

      if (Number.isInteger(choice) && choice >= 1 && choice <= candidates.length) {
        const selected = candidates[choice - 1];
        const imported = await readJsonFile(selected.path);
        mergeTermsStateFromPrivacyInput(state, imported);
        state.output.importPath = selected.path;
        stdout.write(`${green(`Importé datos compartidos desde ${selected.label}`)}\n`);
        return;
      }

      if (choice === candidates.length + 1) {
        break;
      }

      stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
    }
  }

  while (true) {
    const inputPath = await promptText(rl, 'Ruta del JSON de privacidad a reutilizar', {
      required: true,
      allowEmpty: false,
      defaultValue: state.output.importPath || 'wizard-input.json'
    });
    if (inputPath === BACK) {
      continue;
    }

    try {
      const imported = await readJsonFile(inputPath);
      mergeTermsStateFromPrivacyInput(state, imported);
      state.output.importPath = inputPath;
      stdout.write(`${green(`Importé datos compartidos desde ${inputPath}`)}\n`);
      return;
    } catch (error) {
      stdout.write(`${red(`No pude leer ese JSON: ${error.message}`)}\n`);
    }
  }
}

async function collectTermsServiceSection(rl, state) {
  removeManualNotesByPrefix(state, ['Tipo de oferta manual:', 'Restricción adicional:', 'Disclaimer manual:']);
  await runQuestions([
    async () => {
      const offeringChoice = await promptSingleChoice(rl, 'Qué vendés u ofrecés', TERMS_OFFERING_OPTIONS);
      if (offeringChoice === BACK) return BACK;
      state.terms.offeringType = offeringChoice.value;
      if (offeringChoice.value === 'other') {
        state.manualDisclosures.push(`Tipo de oferta manual: ${offeringChoice.manualNote}`);
        const baseChoice = await promptSingleChoice(rl, 'Elegí la categoría base más parecida para estructurar los términos', TERMS_OFFERING_OPTIONS, { allowOther: false });
        if (baseChoice === BACK) return BACK;
        state.terms.offeringType = baseChoice.value;
      }
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Cuentas de usuario',
        'Marcá sí si el sitio permite crear cuentas o perfiles de usuario.',
        state.terms.hasAccounts
      );
      if (value === BACK) return BACK;
      state.terms.hasAccounts = value;
      if (!value) {
        state.terms.requiresRegistration = false;
      }
    },
    async () => {
      if (!state.terms.hasAccounts) return;
      const value = await promptYesNo(
        rl,
        'Registro obligatorio',
        'Marcá sí si la compra o el uso principal requiere registrarse.',
        state.terms.requiresRegistration
      );
      if (value === BACK) return BACK;
      state.terms.requiresRegistration = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Contenido de usuarios',
        'Marcá sí si los usuarios pueden subir reseñas, comentarios, fotos u otro contenido.',
        state.terms.allowsUserContent
      );
      if (value === BACK) return BACK;
      state.terms.allowsUserContent = value;
    }
  ]);
}

async function collectTermsCommerceSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptText(rl, 'Moneda principal del sitio', {
        required: false,
        allowEmpty: true,
        defaultValue: state.terms.currency || 'ARS'
      });
      if (value === BACK) return BACK;
      state.terms.currency = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Precios con impuestos incluidos',
        'Marcá sí si los precios se muestran con IVA u otros impuestos incluidos.',
        state.terms.pricesIncludeTaxes
      );
      if (value === BACK) return BACK;
      state.terms.pricesIncludeTaxes = value;
    },
    async () => {
      const value = await promptText(rl, 'Proveedor o pasarela de pago', {
        allowEmpty: true,
        defaultValue: state.terms.paymentProvider
      });
      if (value === BACK) return BACK;
      state.terms.paymentProvider = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Ofrecés reembolsos, cambios o devoluciones',
        'Marcá sí si el negocio contempla devoluciones, cambios o reembolsos.',
        state.terms.refundsOffered
      );
      if (value === BACK) return BACK;
      state.terms.refundsOffered = value;
      if (!value) {
        state.terms.refundWindow = '';
        state.terms.refundConditions = '';
        state.terms.returnShippingResponsibility = '';
      }
    },
    async () => {
      if (!state.terms.refundsOffered) return;
      const value = await promptText(rl, 'Plazo general para pedir devolución o cambio', {
        allowEmpty: true,
        defaultValue: state.terms.refundWindow || '10 días'
      });
      if (value === BACK) return BACK;
      state.terms.refundWindow = value;
    },
    async () => {
      if (!state.terms.refundsOffered) return;
      const value = await promptText(rl, 'Condiciones de devolución o reembolso', {
        allowEmpty: true,
        defaultValue: state.terms.refundConditions
      });
      if (value === BACK) return BACK;
      state.terms.refundConditions = value;
    },
    async () => {
      if (!state.terms.refundsOffered) return;
      const choice = await promptSingleChoice(rl, 'Quién asume el envío de devolución', TERMS_RETURN_SHIPPING_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.terms.returnShippingResponsibility = choice.value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Ofrecés garantía',
        'Marcá sí si vendés productos o servicios con garantía específica.',
        state.terms.warrantyOffered
      );
      if (value === BACK) return BACK;
      state.terms.warrantyOffered = value;
      if (!value) {
        state.terms.warrantyDetails = '';
      }
    },
    async () => {
      if (!state.terms.warrantyOffered) return;
      const value = await promptText(rl, 'Detalle breve de la garantía', {
        allowEmpty: true,
        defaultValue: state.terms.warrantyDetails
      });
      if (value === BACK) return BACK;
      state.terms.warrantyDetails = value;
    }
  ]);
}

async function collectTermsRulesSection(rl, state) {
  await runQuestions([
    async () => {
      const restrictions = await promptMultiChoice(rl, 'Qué conductas querés prohibir de forma expresa', TERMS_STANDARD_RESTRICTIONS);
      if (restrictions === BACK) return BACK;
      state.terms.prohibitedActivities = restrictions.values;
      state.manualDisclosures.push(...restrictions.manualNotes.map((note) => `Restricción adicional: ${note}`));
    },
    async () => {
      const value = await promptText(rl, 'Dueño del contenido, marca o material del sitio', {
        allowEmpty: true,
        defaultValue: state.terms.ipOwner || state.business.name
      });
      if (value === BACK) return BACK;
      state.terms.ipOwner = value;
    },
    async () => {
      if (!state.terms.allowsUserContent) return;
      const value = await promptYesNo(
        rl,
        'Licencia sobre reseñas o contenido de usuarios',
        'Marcá sí si el usuario te autoriza a mostrar sus reseñas o contenido en el sitio o redes.',
        state.terms.ugcLicenseGranted
      );
      if (value === BACK) return BACK;
      state.terms.ugcLicenseGranted = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Limitar daños indirectos',
        'Marcá sí si querés una cláusula estándar de limitación de responsabilidad por daños indirectos.',
        state.terms.limitIndirectDamages
      );
      if (value === BACK) return BACK;
      state.terms.limitIndirectDamages = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Aclarar demoras de transporte',
        'Marcá sí si querés aclarar que no controlás totalmente las demoras del courier una vez despachado el pedido.',
        state.terms.shippingDelayDisclaimer
      );
      if (value === BACK) return BACK;
      state.terms.shippingDelayDisclaimer = value;
    },
    async () => {
      const value = await promptText(rl, 'Disclaimer o aclaración adicional', {
        allowEmpty: true,
        defaultValue: state.terms.customDisclaimer
      });
      if (value === BACK) return BACK;
      state.terms.customDisclaimer = value;
    }
  ]);
}

async function collectTermsLegalSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptYesNo(
        rl,
        'Podés suspender cuentas o pedidos',
        'Marcá sí si querés reservarte la facultad de suspender cuentas, pedidos o acceso por incumplimiento.',
        state.terms.maySuspendAccounts
      );
      if (value === BACK) return BACK;
      state.terms.maySuspendAccounts = value;
    },
    async () => {
      const value = await promptText(rl, 'Motivos típicos de suspensión o terminación', {
        allowEmpty: true,
        defaultValue: state.terms.terminationGrounds
      });
      if (value === BACK) return BACK;
      state.terms.terminationGrounds = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Cómo notificás cambios en los términos', TERMS_CHANGE_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.terms.changeNotification = choice.value;
    },
    async () => {
      const value = await promptText(rl, 'Jurisdicción o foro para reclamos', {
        required: true,
        allowEmpty: false,
        defaultValue: state.terms.disputesForum || (state.business.country ? `Tribunales competentes de ${state.business.country}` : '')
      });
      if (value === BACK) return BACK;
      state.terms.disputesForum = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Método alternativo de resolución de disputas', TERMS_ADR_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.terms.adrMethod = choice.value;
    }
  ]);
}

function printTermsSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Documento: Términos y condiciones\n`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}\n`);
  stdout.write(`- Tipo de negocio: ${optionLabel(BUSINESS_TYPE_OPTIONS, state.business.type || '(sin definir)')}\n`);
  stdout.write(`- Qué ofrece: ${optionLabel(TERMS_OFFERING_OPTIONS, state.terms.offeringType || '(sin definir)')}\n`);
  stdout.write(`- País: ${state.business.country || '(sin definir)'}\n`);
  stdout.write(`- Jurisdicción principal: ${optionLabel(JURISDICTION_OPTIONS, state.operations.primaryJurisdiction || '(sin definir)')}\n`);
  stdout.write(`- Proveedor de pago: ${state.terms.paymentProvider || '(sin definir)'}\n`);
  stdout.write(`- Moneda: ${state.terms.currency || '(sin definir)'}\n`);
  stdout.write(`- Reembolsos / cambios: ${state.terms.refundsOffered ? 'sí' : 'no'}\n`);
  stdout.write(`- Garantía: ${state.terms.warrantyOffered ? 'sí' : 'no'}\n`);
  stdout.write(`- Foro de disputas: ${state.terms.disputesForum || '(sin definir)'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) {
    stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  }
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (state.manualDisclosures.length > 0) {
    stdout.write(`- Notas manuales: ${state.manualDisclosures.length}\n`);
  }
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

async function promptTermsReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar términos')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar servicio')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar compras y precios')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Editar reglas, propiedad y disclaimers')}\n`);
  stdout.write(`  ${yellow('7')}. ${bold('Editar disputas y cambios')}\n`);
  stdout.write(`  ${yellow('8')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('9')}. ${bold('Cancelar')}\n`);

  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 9) {
      return choice;
    }
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runTermsWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'terms',
    business: { name: '', type: 'ecommerce', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
    terms: {
      offeringType: 'physical_goods',
      hasAccounts: false,
      requiresRegistration: false,
      allowsUserContent: false,
      pricesIncludeTaxes: true,
      currency: 'ARS',
      paymentProvider: '',
      refundsOffered: true,
      refundWindow: '10 días',
      refundConditions: '',
      returnShippingResponsibility: 'case_by_case',
      warrantyOffered: false,
      warrantyDetails: '',
      prohibitedActivities: [],
      customRestriction: '',
      ipOwner: '',
      ugcLicenseGranted: false,
      limitIndirectDamages: true,
      shippingDelayDisclaimer: false,
      customDisclaimer: '',
      maySuspendAccounts: true,
      terminationGrounds: '',
      changeNotification: 'site_notice',
      disputesForum: '',
      adrMethod: 'none'
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('terms'), publishDir: defaultPublishDirForDocument('terms'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de términos y condiciones'))}\n`);
    stdout.write(`${dim('Te voy a hacer preguntas cortas y voy a generar un borrador contractual al final.')}\n`);
    await maybePreloadTermsFromPrivacy(rl, state);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectOperationsSection(rl, state);
    await collectTermsServiceSection(rl, state);
    await collectTermsCommerceSection(rl, state);
    await collectTermsRulesSection(rl, state);
    await collectTermsLegalSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildTermsInputFromState(state);
      const validation = await generator.validate(input);

      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }

      printTermsSummary(state, validation);
      const action = await promptTermsReviewAction(rl);

      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectTermsServiceSection(rl, state); continue; }
      if (action === 5) { await collectTermsCommerceSection(rl, state); continue; }
      if (action === 6) { await collectTermsRulesSection(rl, state); continue; }
      if (action === 7) { await collectTermsLegalSection(rl, state); continue; }
      if (action === 8) { await collectOutputSection(rl, state); continue; }
      if (action === 9) { stdout.write(`${yellow('Wizard cancelado.')}\n`); return; }

      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-terms-input.json`), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-terms-input.json`}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('terms'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('terms')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé los términos en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

async function promptReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar política')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar jurisdicción y operación')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar datos, terceros, bases legales y compliance')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('7')}. ${bold('Cancelar')}\n`);

  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 7) {
      return choice;
    }
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'privacy',
    business: { name: '', type: '', websiteUrl: '', country: 'United States', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    operations: { primaryJurisdiction: '', sellRegions: [], childrenAudience: false },
    dataPractices: { collectedData: [], thirdParties: [], legalBases: [] },
    compliance: { requestedFrameworks: [] },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: '', publishDir: '', writeToFile: false, outputPath: '', saveInput: true, inputPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de privacy-policy'))}\n`);
    stdout.write(`${dim('Te voy a hacer preguntas cortas y voy a generar el borrador al final.')}\n`);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectOperationsSection(rl, state);
    await collectDataSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildInputFromState(state);
      const validation = await generator.validate(input);

      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }

      printSummary(state, validation);
      const action = await promptReviewAction(rl);

      if (action === 2) {
        await collectBusinessSection(rl, state);
        continue;
      }
      if (action === 3) {
        await collectContactSection(rl, state);
        continue;
      }
      if (action === 4) {
        await collectOperationsSection(rl, state);
        continue;
      }
      if (action === 5) {
        await collectDataSection(rl, state);
        continue;
      }
      if (action === 6) {
        await collectOutputSection(rl, state);
        continue;
      }
      if (action === 7) {
        stdout.write(`${yellow('Wizard cancelado.')}\n`);
        return;
      }

      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir,
          baseUrl: state.output.baseUrl
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé la política en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

function usage() {
  return [
    'Usage:',
    '  privacy-policy wizard',
    '  privacy-policy generate --document privacy|terms --input <file.json> [--format html|markdown|text] [--output file]',
    '  privacy-policy publish --document privacy|terms --input <file.json> --base-url <url> [--publish-dir <dir>]',
    '  privacy-policy validate --document privacy|terms --input <file.json>',
    '  privacy-policy explain --document privacy|terms --input <file.json>',
    '',
    'If you run `privacy-policy` with no command, the interactive wizard starts automatically.'
  ].join('\n');
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  const privacyGenerator = new PrivacyPolicyGenerator();
  const termsGenerator = new TermsGenerator();

  if (!command || command === 'wizard') {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    try {
      stdout.write(`${bold(cyan('Asistente interactivo de privacy-policy'))}\n`);
      stdout.write(`${dim('Elegí primero qué documento querés generar.')}\n`);
      const documentType = await promptDocumentChoice(rl);
      if (documentType === 'terms') {
        await runTermsWizard(termsGenerator);
      } else {
        await runWizard(privacyGenerator);
      }
    } finally {
      rl.close();
    }
    return;
  }

  if (!['generate', 'publish', 'validate', 'explain'].includes(command)) {
    throw new Error(usage());
  }

  const input = await readInput(options);
  const documentType = resolveDocumentType(options, input);
  const generator = documentType === 'terms' ? termsGenerator : privacyGenerator;

  if (command === 'validate') {
    const validation = await generator.validate(input);
    process.stdout.write(`${JSON.stringify(validation, null, 2)}\n`);
    process.exitCode = validation.ok ? 0 : 1;
    return;
  }

  if (command === 'explain') {
    const explanation = await generator.explain(input);
    process.stdout.write(`${JSON.stringify(explanation, null, 2)}\n`);
    return;
  }

  if (command === 'publish') {
    if (!options['base-url']) {
      throw new Error('publish requires --base-url <public-url>');
    }

    const result = await generator.generate(input);
    const published = await publishGeneratedPolicy(input, result, {
      publishDir: options['publish-dir'] || defaultPublishDirForDocument(documentType),
      baseUrl: options['base-url']
    });

    process.stdout.write(`${published.publicUrl}\n`);
    process.stdout.write(`Published file: ${published.filePath}\n`);
    process.stdout.write(`Manifest: ${published.manifestPath}\n`);
    return;
  }

  const format = options.format || 'markdown';
  const result = await generator.generate(input);
  const output = result[format];

  if (!output) {
    throw new Error(`Unsupported format: ${format}`);
  }

  if (options.output) {
    await fs.writeFile(path.resolve(process.cwd(), options.output), output, 'utf8');
    process.stdout.write(`Wrote ${format} output to ${options.output}\n`);
  }

  if (!options.output) {
    process.stdout.write(`${output}\n`);
  }

  if (options['base-url'] || options['publish-dir']) {
    const published = await publishGeneratedPolicy(input, result, {
      publishDir: options['publish-dir'] || defaultPublishDirForDocument(documentType),
      baseUrl: options['base-url'] || defaultBaseUrlForDocument(documentType)
    });
    process.stdout.write(`Published URL: ${published.publicUrl}\n`);
    process.stdout.write(`Published file: ${published.filePath}\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
