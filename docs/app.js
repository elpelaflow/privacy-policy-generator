let DOCUMENTS;

function buildDocuments() {
  return {
  privacy: {
    label: 'Política de privacidad',
    description: 'Política de privacidad con regiones, datos, terceros, bases legales y advertencias Argentina-first.',
    basePath: 'privacy',
    generator: () => new globalThis.LegalGenerators.PrivacyPolicyGenerator(),
    sections: [
      {
        title: 'Negocio',
        description: 'Identidad principal del negocio o la app.',
        fields: commonBusinessFields()
      },
      {
        title: 'Contacto',
        description: 'Canales de privacidad y contacto que se muestran en el documento.',
        fields: commonContactFields()
      },
      {
        title: 'Operación y alcance de privacidad',
        description: 'Jurisdicción, regiones, audiencia, categorías de datos, bases legales y señales de cumplimiento.',
        fields: [
          selectField('operations.primaryJurisdiction', 'Primary jurisdiction', JURISDICTIONS, 'ar'),
          checkboxField('operations.sellRegions', 'Operational regions', REGIONS, ['ar']),
          booleanField('operations.childrenAudience', 'Children audience', 'Mark this only if the service is directed to minors or knowingly handles children data.', false),
          checkboxField('dataPractices.collectedData', 'Collected data', DATA_OPTIONS, ['personal', 'usage', 'cookies']),
          checkboxField('dataPractices.thirdParties', 'Third parties', THIRD_PARTIES, ['analytics']),
          checkboxField('dataPractices.legalBases', 'Legal bases', LEGAL_BASES, ['contract']),
          checkboxField('compliance.requestedFrameworks', 'Compliance focus', COMPLIANCE, [])
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'privacy',
        business: values.business,
        contact: values.contact,
        operations: values.operations,
        dataPractices: values.dataPractices,
        compliance: values.compliance,
        settings: values.settings
      };
    }
  },
  terms: {
    label: 'Términos y condiciones',
    description: 'Términos del servicio con consumo, e-commerce, cuentas, pagos y disputas.',
    basePath: 'terms',
    generator: () => new globalThis.LegalGenerators.TermsGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y sitio.', fields: commonBusinessFields('ecommerce') },
      { title: 'Contacto', description: 'Canales comerciales y legales de contacto.', fields: commonContactFields() },
      {
        title: 'Operación',
        description: 'Jurisdicción y regiones de venta.',
        fields: [
          selectField('operations.primaryJurisdiction', 'Primary jurisdiction', JURISDICTIONS, 'ar'),
          checkboxField('operations.sellRegions', 'Operational regions', REGIONS, ['ar'])
        ]
      },
      {
        title: 'Servicio y comercio',
        description: 'Términos comerciales principales y modelo de cuentas.',
        fields: [
          selectField('terms.offeringType', 'Offering type', OFFERINGS, 'physical_goods'),
          booleanField('terms.hasAccounts', 'User accounts', 'Users can create accounts or profiles.', false),
          booleanField('terms.requiresRegistration', 'Registration required', 'Registration is required for main usage or purchase.', false),
          booleanField('terms.allowsUserContent', 'User-generated content', 'Users can upload reviews, comments, or similar content.', false),
          booleanField('terms.pricesIncludeTaxes', 'Prices include taxes', 'Typical for ARS/Argentina consumer-facing commerce.', true),
          textField('terms.currency', 'Main currency', 'ARS'),
          textField('terms.paymentProvider', 'Payment provider', 'Mercado Pago'),
          booleanField('terms.refundsOffered', 'Refunds / returns / exchanges offered', 'Enable if you offer any kind of return or refund path.', true),
          textField('terms.refundWindow', 'Refund window', '10 días'),
          textareaField('terms.refundConditions', 'Refund conditions', 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.'),
          selectField('terms.returnShippingResponsibility', 'Return shipping responsibility', RETURN_SHIPPING, 'case_by_case'),
          booleanField('terms.warrantyOffered', 'Warranty offered', 'Enable if physical goods or service warranties apply.', true),
          textareaField('terms.warrantyDetails', 'Warranty details', 'La garantía legal y cualquier remedio aplicable se interpretarán de forma compatible con la normativa de defensa del consumidor aplicable.')
        ]
      },
      {
        title: 'Reglas y legal',
        description: 'Restricciones, propiedad intelectual, suspensión, avisos, disputas y disclaimers adicionales.',
        fields: [
          checkboxField('terms.prohibitedActivities', 'Prohibited conduct', PROHIBITED_ACTIVITIES, ['No usar el sitio para actividades ilegales.']),
          textField('terms.ipOwner', 'IP owner', 'AutoPost CLI Operator'),
          booleanField('terms.ugcLicenseGranted', 'UGC license granted', 'If users submit reviews or content, enable if you want a display license.', false),
          booleanField('terms.limitIndirectDamages', 'Limit indirect damages', 'Standard indirect damages limitation clause.', true),
          booleanField('terms.shippingDelayDisclaimer', 'Shipping delay disclaimer', 'Useful for physical goods and couriers.', true),
          textareaField('terms.customDisclaimer', 'Extra disclaimer', ''),
          booleanField('terms.maySuspendAccounts', 'May suspend accounts/orders', 'Reserve suspension or restriction rights for misuse.', true),
          textareaField('terms.terminationGrounds', 'Termination grounds', 'Podemos suspender cuentas, pedidos o acceso por fraude, abuso, incumplimiento o riesgos operativos o legales.'),
          selectField('terms.changeNotification', 'Change notification method', CHANGE_NOTIFICATION, 'both'),
          textField('terms.disputesForum', 'Disputes forum', 'Tribunales competentes de la Ciudad Autónoma de Buenos Aires'),
          selectField('terms.adrMethod', 'Alternative dispute resolution', ADR_OPTIONS, 'none')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'terms',
        business: values.business,
        contact: values.contact,
        operations: values.operations,
        terms: values.terms,
        settings: values.settings
      };
    }
  },
  cookies: {
    label: 'Política de cookies',
    description: 'Categorías de cookies, consentimiento, terceros, controles del navegador y alineación con privacidad.',
    basePath: 'cookies',
    generator: () => new globalThis.LegalGenerators.CookiesPolicyGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y sitio.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales de contacto y gestión para cookies.', fields: commonContactFields() },
      {
        title: 'Configuración de cookies',
        description: 'Categorías, terceros, consentimiento, retención y controles.',
        fields: [
          selectField('operations.primaryJurisdiction', 'Primary jurisdiction', JURISDICTIONS, 'ar'),
          checkboxField('operations.sellRegions', 'Operational regions', REGIONS, ['ar']),
          checkboxField('cookies.categories', 'Cookie categories', COOKIE_CATEGORIES, ['necessary', 'analytics']),
          checkboxField('cookies.thirdParties', 'Cookie-related third parties', COOKIE_THIRD_PARTIES, ['analytics']),
          selectField('cookies.consentMode', 'Consent mode', COOKIE_CONSENT, 'banner'),
          textField('cookies.managementUrl', 'Cookie management URL', 'https://dev-flow.duckdns.org/privacy'),
          textareaField('cookies.browserControls', 'Browser/device controls', 'El usuario puede bloquear o eliminar cookies desde la configuración del navegador y revisar sus preferencias cuando el banner o el centro de preferencias esté disponible.'),
          textareaField('cookies.retentionPolicy', 'Cookie retention note', 'Algunas cookies son de sesión y otras pueden persistir por más tiempo según la finalidad, la configuración técnica y las políticas del proveedor correspondiente.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'cookies',
        business: values.business,
        contact: values.contact,
        operations: values.operations,
        cookies: values.cookies,
        settings: values.settings
      };
    }
  },
  refund: {
    label: 'Política de devoluciones y reembolsos',
    description: 'Plazos de devolución, reembolsos, cambios, envíos, fallas y expectativas del consumidor.',
    basePath: 'refunds',
    generator: () => new globalThis.LegalGenerators.ReturnRefundPolicyGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y contexto de venta.', fields: commonBusinessFields('ecommerce') },
      { title: 'Contacto', description: 'Canales para solicitudes de devolución.', fields: commonContactFields() },
      {
        title: 'Reglas de devolución y reembolso',
        description: 'Plazos, condiciones, fallas, ventas digitales y excepciones.',
        fields: [
          selectField('refund.offeringType', 'Offering type', OFFERINGS, 'physical_goods'),
          booleanField('refund.acceptsReturns', 'Accepts returns/refunds', 'Enable for distance sales or operational return flows.', true),
          textField('refund.refundWindow', 'Refund window', '10 días'),
          textField('refund.exchangeWindow', 'Exchange window', '10 días'),
          textareaField('refund.returnConditions', 'Return conditions', 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.'),
          textField('refund.refundMethod', 'Refund method', 'el mismo medio de pago original'),
          textField('refund.refundProcessingTime', 'Refund processing time', '10 días hábiles'),
          selectField('refund.returnShippingResponsibility', 'Return shipping responsibility', RETURN_SHIPPING, 'case_by_case'),
          textField('refund.returnRequestChannel', 'Return request channel', 'thechief@dev-flow.duckdns.org'),
          textareaField('refund.nonReturnableItems', 'Non-returnable items (one per line)', 'Productos personalizados o hechos a medida\nProductos usados, dañados por mal uso o incompletos'),
          booleanField('refund.digitalGoodsFinal', 'Digital sales final', 'Useful for downloads, licenses, or activated access.', false),
          textareaField('refund.damagedItemsProcess', 'Damaged / incorrect item process', 'Si el producto llega dañado, incorrecto o con fallas, pedimos que nos contactes con fotos y datos del pedido para revisar el caso.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'refund',
        business: values.business,
        contact: values.contact,
        refund: {
          ...values.refund,
          nonReturnableItems: normalizeLines(values.refund.nonReturnableItems)
        },
        settings: values.settings
      };
    }
  },
  disclaimer: {
    label: 'Disclaimer',
    description: 'Disclaimers modulares para enlaces, errores, salud, fitness, riesgos y reseñas.',
    basePath: 'disclaimer',
    generator: () => new globalThis.LegalGenerators.DisclaimerGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y sitio.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales de contacto y soporte.', fields: commonContactFields() },
      {
        title: 'Módulos de disclaimer',
        description: 'Elegí uno o más tipos de disclaimer y ajustá el lenguaje opcional.',
        fields: [
          checkboxField('disclaimer.categories', 'Disclaimer types', DISCLAIMER_TYPES, ['errors_omissions', 'external_links', 'own_risk']),
          textareaField('disclaimer.professionalAdviceChannel', 'Professional advice note', ''),
          textareaField('disclaimer.externalLinksPolicy', 'External links policy', 'El servicio puede enlazar recursos o documentación de terceros. No controlamos ni garantizamos el contenido, disponibilidad o políticas de esos sitios externos.'),
          textareaField('disclaimer.affiliateDisclosure', 'Affiliate / compensation disclosure', ''),
          textareaField('disclaimer.reviewMethodology', 'Review methodology', ''),
          textareaField('disclaimer.customRiskStatement', 'Use-at-your-own-risk note', 'El uso de la aplicación, sus flujos, automatizaciones y materiales se realiza bajo exclusiva responsabilidad del usuario.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'disclaimer',
        business: values.business,
        contact: values.contact,
        disclaimer: values.disclaimer,
        settings: values.settings
      };
    }
  },
  deletion: {
    label: 'Instrucciones de eliminación de datos',
    description: 'Canal de eliminación, alcance, excepciones de retención y guía para cuentas conectadas con Meta.',
    basePath: 'data-deletion',
    generator: () => new globalThis.LegalGenerators.DataDeletionGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y sitio.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales de contacto para eliminación.', fields: commonContactFields() },
      {
        title: 'Flujo de eliminación',
        description: 'Canales de solicitud, datos requeridos, alcance de eliminación y tiempos de respuesta.',
        fields: [
          selectField('deletion.requestChannel', 'Request channel', DELETION_CHANNELS, 'both'),
          textField('deletion.requestEmail', 'Deletion email', 'thechief@dev-flow.duckdns.org'),
          textField('deletion.requestUrl', 'Deletion page URL', 'https://dev-flow.duckdns.org/'),
          checkboxField('deletion.identityRequirements', 'Identity requirements', DELETION_IDENTITY, ['Email de la cuenta o del usuario solicitante']),
          checkboxField('deletion.deletionScope', 'Deletion scope', DELETION_SCOPE, ['Datos de perfil o cuenta asociados al usuario']),
          checkboxField('deletion.retentionExceptions', 'Retention exceptions', DELETION_RETENTION, ['Registros necesarios para cumplir obligaciones legales o regulatorias']),
          textField('deletion.responseTime', 'Response time', '10 días hábiles'),
          textField('deletion.completionTime', 'Completion time', '30 días'),
          booleanField('deletion.hasMetaConnection', 'Meta/Facebook connection', 'Enable if the app connects to Meta or Facebook accounts.', true),
          textareaField('deletion.metaDisconnectInstructions', 'Meta disconnection instructions', 'El usuario puede revocar permisos desde Meta y además pedir eliminación por email.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'deletion',
        business: values.business,
        contact: values.contact,
        deletion: values.deletion,
        settings: values.settings
      };
    }
  }
  };
}

const appState = {
  documentType: 'privacy',
  previewFormat: 'html',
  lastGenerated: null,
  lastInput: null
};

const formEl = document.getElementById('generator-form');
const previewFrameEl = document.getElementById('preview-html');
const previewCodeEl = document.getElementById('preview-code');
const validationEl = document.getElementById('validation-box');
const documentSelectEl = document.getElementById('document-type');
const documentDescriptionEl = document.getElementById('document-description');
const preparedPathEl = document.getElementById('prepared-path');
const generateButtonEl = document.getElementById('generate-button');
const downloadHtmlEl = document.getElementById('download-html');
const downloadMarkdownEl = document.getElementById('download-markdown');
const downloadTextEl = document.getElementById('download-text');
const downloadJsonEl = document.getElementById('download-json');

let validationRequestId = 0;
let validationTimer = null;

generateButtonEl.addEventListener('click', generateDocument);
downloadHtmlEl.addEventListener('click', () => downloadOutput('html'));
downloadMarkdownEl.addEventListener('click', () => downloadOutput('markdown'));
downloadTextEl.addEventListener('click', () => downloadOutput('text'));
downloadJsonEl.addEventListener('click', downloadJson);

for (const button of document.querySelectorAll('.format-button')) {
  button.addEventListener('click', () => {
    appState.previewFormat = button.dataset.format;
    for (const item of document.querySelectorAll('.format-button')) item.classList.remove('is-active');
    button.classList.add('is-active');
    refreshPreview();
  });
}

function init() {
  renderDocumentCards();
  renderDocumentSelect();
  renderForm();
  setPreviewPlaceholder('Generá un documento para ver la salida acá.');
  setExportState(false);
}

function renderDocumentCards() {
  const cards = document.getElementById('document-cards');
  cards.innerHTML = Object.entries(DOCUMENTS).map(([key, config]) => `
    <article class="doc-card">
      <span class="doc-tag">${key}</span>
      <h3>${config.label}</h3>
      <p>${config.description}</p>
      <button type="button" class="button button-secondary" data-open-doc="${key}">Usar este documento</button>
    </article>
  `).join('');

  cards.querySelectorAll('[data-open-doc]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.documentType = button.dataset.openDoc;
      documentSelectEl.value = appState.documentType;
      renderForm();
      document.getElementById('generator').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderDocumentSelect() {
  documentSelectEl.innerHTML = Object.entries(DOCUMENTS)
    .map(([key, config]) => `<option value="${key}">${config.label}</option>`)
    .join('');
  documentSelectEl.value = appState.documentType;
  documentSelectEl.addEventListener('change', () => {
    appState.documentType = documentSelectEl.value;
    renderForm();
  });
}

function renderForm() {
  const config = DOCUMENTS[appState.documentType];
  documentDescriptionEl.textContent = config.description;
  const defaults = createDefaults(appState.documentType);
  appState.lastGenerated = null;
  appState.lastInput = null;
  validationRequestId += 1;
  clearTimeout(validationTimer);

  formEl.innerHTML = config.sections.map((section, index) => `
    <section class="form-section">
      <p class="eyebrow">Sección ${index + 1}</p>
      <h3>${section.title}</h3>
      <p>${section.description}</p>
      <div class="field-grid">
        ${section.fields.map((field) => renderField(field, defaults)).join('')}
      </div>
    </section>
  `).join('');

  formEl.oninput = () => {
    preparedPathEl.textContent = buildPreparedPath();
    scheduleLiveValidation();
  };

  preparedPathEl.textContent = buildPreparedPath();
  validationEl.className = 'validation-box';
  validationEl.innerHTML = '';
  setPreviewPlaceholder('Generá un documento para ver la salida acá.');
  setExportState(false);
}

function renderField(field, defaults) {
  const value = getByPath(defaults, field.name) ?? field.value;
  if (field.type === 'textarea') {
    return `<div class="field full"><label>${field.label}</label><textarea name="${field.name}" placeholder="${field.placeholder || ''}">${escapeHtml(String(value ?? ''))}</textarea>${hint(field)}</div>`;
  }
  if (field.type === 'select') {
    return `<div class="field"><label>${field.label}</label><select name="${field.name}">${field.options.map((option) => `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${option.label}</option>`).join('')}</select>${hint(field)}</div>`;
  }
  if (field.type === 'checkbox-group') {
    const selected = Array.isArray(value) ? value : [];
    return `<div class="field full"><label>${field.label}</label><div class="checkbox-group">${field.options.map((option, index) => `
      <label class="checkbox-item">
        <input type="checkbox" name="${field.name}" value="${option.value}" ${selected.includes(option.value) ? 'checked' : ''}>
        <span><strong>${option.label}</strong><small>${option.description}</small></span>
      </label>
    `).join('')}</div>${hint(field)}</div>`;
  }
  if (field.type === 'boolean') {
    return `<div class="field full"><label>${field.label}</label><label class="checkbox-item">
      <input type="checkbox" name="${field.name}" ${value ? 'checked' : ''}>
      <span><strong>${value ? 'Activado' : 'Desactivado por default'}</strong><small>${field.description || ''}</small></span>
    </label></div>`;
  }
  return `<div class="field ${field.full ? 'full' : ''}"><label>${field.label}</label><input name="${field.name}" value="${escapeHtml(String(value ?? ''))}" placeholder="${field.placeholder || ''}">${hint(field)}</div>`;
}

function hint(field) {
  return field.hint ? `<span class="field-hint">${field.hint}</span>` : '';
}

function createDefaults(type) {
  const common = {
    business: {
      name: 'Mi proyecto',
      type: type === 'privacy' ? 'saas' : 'ecommerce',
      websiteUrl: '',
      country: 'Argentina',
      address: ''
    },
    contact: {
      email: '',
      phone: '',
      pageUrl: ''
    },
    settings: { language: 'es' }
  };

  if (type === 'privacy') {
    return {
      ...common,
      business: { ...common.business, type: 'saas' },
      operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'], childrenAudience: false },
      dataPractices: {
        collectedData: ['personal', 'usage', 'cookies'],
        thirdParties: ['analytics', 'cloud'],
        legalBases: ['contract', 'legitimate_interest']
      },
      compliance: { requestedFrameworks: [] }
    };
  }

  if (type === 'terms') {
    return {
      ...common,
      business: { ...common.business, type: 'ecommerce' },
      operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
      terms: {}
    };
  }

  if (type === 'cookies') {
    return {
      ...common,
      business: { ...common.business, type: 'saas' },
      operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
      cookies: {}
    };
  }

  if (type === 'refund') {
    return {
      ...common,
      business: { ...common.business, type: 'ecommerce' },
      refund: {}
    };
  }

  if (type === 'disclaimer') {
    return {
      ...common,
      business: { ...common.business, type: 'saas' },
      disclaimer: {}
    };
  }

  return {
    ...common,
    business: { ...common.business, type: 'saas' },
    deletion: {}
  };
}

async function generateDocument() {
  const values = gatherFormValues();
  const config = DOCUMENTS[appState.documentType];
  const generator = config.generator();
  const input = config.buildInput(values);
  appState.lastInput = input;
  preparedPathEl.textContent = buildPreparedPath();

  try {
    const validation = await generator.validate(input);
    renderValidation(validation);
    if (!validation.ok) {
      setPreviewPlaceholder('Resolvé los campos obligatorios antes de generar el documento.');
      appState.lastGenerated = null;
      setExportState(false);
      return;
    }
    const result = await generator.generate(input);
    appState.lastGenerated = result;
    setExportState(true);
    refreshPreview();
  } catch (error) {
    validationEl.className = 'validation-box is-visible';
    validationEl.innerHTML = `<div class="errors"><strong>Error de generación</strong><ul><li>${escapeHtml(error.message)}</li></ul></div>`;
    setPreviewPlaceholder('La generación falló.');
    appState.lastGenerated = null;
    setExportState(false);
  }
}

function renderValidation(validation) {
  const errors = validation.errors || [];
  const warnings = validation.warnings || [];
  if (errors.length === 0 && warnings.length === 0) {
    validationEl.className = 'validation-box';
    validationEl.innerHTML = '';
    return;
  }

  validationEl.className = 'validation-box is-visible';
  validationEl.innerHTML = `
    ${errors.length ? `<div class="errors"><strong>Ajustes obligatorios</strong><ul>${errors.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
    ${warnings.length ? `<div class="warnings"><strong>Advertencias de revisión</strong><ul>${warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
  `;
}

function refreshPreview() {
  if (!appState.lastGenerated) return;
  if (appState.previewFormat === 'html') {
    previewFrameEl.srcdoc = appState.lastGenerated.html || '';
    previewFrameEl.classList.add('is-visible');
    previewCodeEl.classList.remove('is-visible');
    previewCodeEl.textContent = '';
    return;
  }

  previewFrameEl.classList.remove('is-visible');
  previewFrameEl.srcdoc = '';
  previewCodeEl.classList.add('is-visible');
  previewCodeEl.textContent = appState.lastGenerated[appState.previewFormat] || '';
}

function gatherFormValues() {
  const formData = new FormData(formEl);
  const values = {};
  const config = DOCUMENTS[appState.documentType];

  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.type === 'checkbox-group') {
        const all = formData.getAll(field.name);
        setByPath(values, field.name, all);
      } else if (field.type === 'boolean') {
        setByPath(values, field.name, formData.get(field.name) === 'on');
      } else {
        setByPath(values, field.name, formData.get(field.name) ?? '');
      }
    }
  }
  return values;
}

function downloadOutput(format) {
  if (!appState.lastGenerated || !appState.lastInput) return;
  const ext = format === 'markdown' ? 'md' : format === 'text' ? 'txt' : 'html';
  const filename = `${slugify(appState.lastInput.business?.name || 'legal-document')}-${DOCUMENTS[appState.documentType].basePath}.${ext}`;
  triggerDownload(filename, appState.lastGenerated[format], format === 'html' ? 'text/html' : 'text/plain');
}

function downloadJson() {
  if (!appState.lastInput) return;
  const filename = `${slugify(appState.lastInput.business?.name || 'legal-document')}-${DOCUMENTS[appState.documentType].basePath}-input.json`;
  triggerDownload(filename, `${JSON.stringify(appState.lastInput, null, 2)}\n`, 'application/json');
}

function triggerDownload(filename, contents, type) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildPreparedPath() {
  const businessName = document.querySelector('[name="business.name"]')?.value || 'your-project';
  return `https://YOUR-USER.github.io/YOUR-REPO/${DOCUMENTS[appState.documentType].basePath}/${slugify(businessName)}-hash.html`;
}

function setPreviewPlaceholder(message) {
  previewFrameEl.classList.remove('is-visible');
  previewFrameEl.srcdoc = '';
  previewCodeEl.classList.add('is-visible');
  previewCodeEl.textContent = message;
}

function setExportState(enabled) {
  for (const button of [downloadHtmlEl, downloadMarkdownEl, downloadTextEl, downloadJsonEl]) {
    button.disabled = !enabled;
  }
}

function scheduleLiveValidation() {
  clearTimeout(validationTimer);
  const currentRequestId = ++validationRequestId;
  validationTimer = setTimeout(async () => {
    const config = DOCUMENTS[appState.documentType];
    const generator = config.generator();
    const values = gatherFormValues();
    const input = config.buildInput(values);

    try {
      const validation = await generator.validate(input);
      if (currentRequestId !== validationRequestId) return;
      renderValidation(validation);
    } catch {
      if (currentRequestId !== validationRequestId) return;
      validationEl.className = 'validation-box is-visible';
      validationEl.innerHTML = '<div class="errors"><strong>Error de validación</strong><ul><li>No se pudo validar el formulario en tiempo real.</li></ul></div>';
    }
  }, 250);
}

function slugify(value) {
  return String(value || 'legal-document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'legal-document';
}

function setByPath(target, path, value) {
  const parts = path.split('.');
  let current = target;
  while (parts.length > 1) {
    const part = parts.shift();
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  current[parts[0]] = value;
}

function getByPath(target, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], target);
}

function normalizeLines(value) {
  return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
}

function textField(name, label, value = '', hint = '') { return { type: 'text', name, label, value, hint }; }
function textareaField(name, label, value = '', hint = '') { return { type: 'textarea', name, label, value, hint }; }
function selectField(name, label, options, value) { return { type: 'select', name, label, options, value }; }
function checkboxField(name, label, options, value = []) { return { type: 'checkbox-group', name, label, options, value }; }
function booleanField(name, label, description, value = false) { return { type: 'boolean', name, label, description, value }; }

function outputFields() {
  return {
    title: 'Salida',
    description: 'Idioma, exportación y preparación para GitHub Pages.',
    fields: [
      selectField('settings.language', 'Idioma de salida', [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }], 'es')
    ]
  };
}

function commonBusinessFields(defaultType = 'saas') {
  return [
    textField('business.name', 'Nombre del negocio o proyecto', 'Mi proyecto'),
    selectField('business.type', 'Tipo de negocio', BUSINESS_TYPES, defaultType),
    textField('business.websiteUrl', 'URL del sitio o app', ''),
    textField('business.country', 'País', 'Argentina'),
    textareaField('business.address', 'Dirección postal', '')
  ];
}

function commonContactFields() {
  return [
    textField('contact.email', 'Email de contacto', ''),
    textField('contact.phone', 'Teléfono', ''),
    textField('contact.pageUrl', 'Página de privacidad o contacto', '')
  ];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const BUSINESS_TYPES = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'blog', label: 'Blog / Contenido' },
  { value: 'saas', label: 'SaaS / App web' },
  { value: 'mobile', label: 'App móvil' },
  { value: 'nonprofit', label: 'ONG / nonprofit' }
];

const JURISDICTIONS = [
  { value: 'ar', label: 'Argentina' },
  { value: 'us', label: 'United States' },
  { value: 'eu', label: 'European Union' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'global', label: 'Global / custom' }
];
const REGIONS = JURISDICTIONS
  .filter((item) => item.value !== 'global')
  .concat([{ value: 'global', label: 'Global / custom' }])
  .map((item) => ({ ...item, description: `Aplica a ${item.label}` }));
const DATA_OPTIONS = [
  { value: 'personal', label: 'Personal', description: 'Names, emails, addresses, account identifiers.' },
  { value: 'financial', label: 'Financial', description: 'Payments, billing, commercial transaction details.' },
  { value: 'tax', label: 'Tax / invoicing', description: 'CUIT, tax records, fiscal or accounting data.' },
  { value: 'identity', label: 'Identity', description: 'Verification or commercial identity details.' },
  { value: 'usage', label: 'Usage', description: 'Logs, analytics, interaction events, IP.' },
  { value: 'cookies', label: 'Cookies', description: 'Cookies and similar technologies.' },
  { value: 'location', label: 'Location', description: 'Approximate or precise location.' },
  { value: 'profiling', label: 'Profiling', description: 'Segmentation, scoring, automated decisions.' }
];
const THIRD_PARTIES = [
  { value: 'analytics', label: 'Analytics', description: 'Analytics or measurement providers.' },
  { value: 'advertising', label: 'Advertising', description: 'Ads, attribution, or remarketing platforms.' },
  { value: 'payment', label: 'Payment processors', description: 'General payment gateways or processors.' },
  { value: 'paypal_only', label: 'PayPal only', description: 'Payments handled only through PayPal.' },
  { value: 'shipping', label: 'Shipping / logistics', description: 'Carriers, couriers, or fulfillment.' },
  { value: 'cloud', label: 'Cloud / hosting', description: 'Cloud infrastructure and hosting vendors.' },
  { value: 'social', label: 'Social integrations', description: 'Embeds, social login, social APIs.' },
  { value: 'email', label: 'Email / marketing', description: 'Transactional email or marketing automation.' }
];
const LEGAL_BASES = [
  { value: 'contract', label: 'Contract', description: 'Needed to provide the service or complete a purchase.' },
  { value: 'consent', label: 'Consent', description: 'Explicit user consent.' },
  { value: 'legal_obligation', label: 'Legal obligation', description: 'Tax, accounting, regulatory, or legal duties.' },
  { value: 'legitimate_interest', label: 'Legitimate interest', description: 'Security, fraud prevention, or limited operations.' }
];
const COMPLIANCE = [
  { value: 'ccpa', label: 'CCPA / CPRA', description: 'California privacy language.' },
  { value: 'coppa', label: 'COPPA', description: 'Children privacy compliance.' },
  { value: 'caloppa', label: 'CalOPPA', description: 'California online privacy baseline.' },
  { value: 'pipeda', label: 'PIPEDA', description: 'Canada privacy language.' }
];
const OFFERINGS = [
  { value: 'physical_goods', label: 'Physical goods' },
  { value: 'digital_products', label: 'Digital products' },
  { value: 'services', label: 'Services' },
  { value: 'subscriptions', label: 'Subscriptions' }
];
const RETURN_SHIPPING = [
  { value: 'customer', label: 'Customer' },
  { value: 'merchant', label: 'Merchant' },
  { value: 'case_by_case', label: 'Case by case' }
];
const CHANGE_NOTIFICATION = [
  { value: 'site_notice', label: 'Site notice' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Both' }
];
const ADR_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'mediation', label: 'Mediation' },
  { value: 'arbitration', label: 'Arbitration' }
];
const PROHIBITED_ACTIVITIES = [
  { value: 'No usar el sitio para actividades ilegales.', label: 'Illegal use', description: 'No unlawful or fraudulent use.' },
  { value: 'No interferir con la seguridad, estabilidad o funcionamiento técnico del sitio.', label: 'Technical interference', description: 'No attacks, scraping abuse, or technical misuse.' },
  { value: 'No copiar, revender o explotar el contenido o productos fuera de lo permitido.', label: 'Resale / exploitation', description: 'No unauthorized resale or copying.' },
  { value: 'No enviar spam, contenido abusivo o información falsa.', label: 'Spam / abuse', description: 'No spam, abusive content, or false information.' }
];
const COOKIE_CATEGORIES = [
  { value: 'necessary', label: 'Necessary', description: 'Core technical operation and security.' },
  { value: 'preferences', label: 'Preferences', description: 'Preferences and user settings.' },
  { value: 'analytics', label: 'Analytics', description: 'Measurement and analytics.' },
  { value: 'advertising', label: 'Advertising', description: 'Remarketing and advertising.' }
];
const COOKIE_THIRD_PARTIES = [
  { value: 'analytics', label: 'Analytics', description: 'Analytics providers.' },
  { value: 'advertising', label: 'Advertising', description: 'Ad platforms or remarketing tools.' },
  { value: 'social', label: 'Social', description: 'Embeds or social login.' },
  { value: 'cloud', label: 'Infrastructure', description: 'Hosting/CDN/script delivery.' },
  { value: 'email', label: 'Email / marketing', description: 'Campaign and marketing tools.' }
];
const COOKIE_CONSENT = [
  { value: 'banner', label: 'Banner / preferences center' },
  { value: 'implied', label: 'Implied by continued use' },
  { value: 'essential_only', label: 'Essential only' }
];
const DISCLAIMER_TYPES = [
  { value: 'medical', label: 'Medical information', description: 'Health or medical content.' },
  { value: 'fitness', label: 'Fitness information', description: 'Fitness, exercise, wellness.' },
  { value: 'errors_omissions', label: 'Errors and omissions', description: 'Content may contain mistakes or omissions.' },
  { value: 'external_links', label: 'External links', description: 'Third-party links disclaimer.' },
  { value: 'views_expressed', label: 'Views expressed', description: 'Opinions do not necessarily reflect official positions.' },
  { value: 'own_risk', label: 'Use at your own risk', description: 'Use of materials is at the user’s own risk.' },
  { value: 'product_reviews', label: 'Product reviews', description: 'Review methodology and commercial disclosure.' }
];
const DELETION_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'form', label: 'Form / page' },
  { value: 'both', label: 'Email and page' }
];
const DELETION_IDENTITY = [
  { value: 'Email de la cuenta o del usuario solicitante', label: 'Account email', description: 'Match the user to the stored account.' },
  { value: 'Nombre del perfil o identificador de usuario', label: 'Profile or user ID', description: 'Profile, handle, or internal user identifier.' },
  { value: 'ID de cuenta publicitaria o recurso vinculado', label: 'Ad account or asset ID', description: 'Useful for Meta-connected assets.' },
  { value: 'Breve descripción del pedido de eliminación', label: 'Request summary', description: 'What the user wants removed.' }
];
const DELETION_SCOPE = [
  { value: 'Datos de perfil o cuenta asociados al usuario', label: 'Profile / account data', description: 'User profile and account records.' },
  { value: 'Tokens o credenciales de acceso almacenadas por la aplicación', label: 'Access tokens / credentials', description: 'Stored tokens or persistent access data.' },
  { value: 'Registros operativos vinculados al uso de la aplicación', label: 'Operational records', description: 'Operational usage records linked to the user.' },
  { value: 'Configuraciones o preferencias guardadas', label: 'Preferences', description: 'Saved preferences and settings.' }
];
const DELETION_RETENTION = [
  { value: 'Registros necesarios para cumplir obligaciones legales o regulatorias', label: 'Legal obligations', description: 'Records retained by law.' },
  { value: 'Registros mínimos para seguridad, prevención de fraude o auditoría', label: 'Security / fraud', description: 'Minimal security or anti-fraud records.' },
  { value: 'Información necesaria para resolver disputas o hacer cumplir acuerdos', label: 'Disputes / contracts', description: 'Records needed for disputes or agreements.' }
];

DOCUMENTS = buildDocuments();

init();
