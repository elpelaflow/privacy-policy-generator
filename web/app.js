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
          selectField('operations.primaryJurisdiction', 'Jurisdicción principal', JURISDICTIONS, 'ar'),
          checkboxField('operations.sellRegions', 'Regiones operativas', REGIONS, ['ar']),
          booleanField('operations.childrenAudience', 'Audiencia infantil', 'Marcá esto sólo si el servicio está dirigido a menores o si trata datos de niños de forma intencional.', false),
          checkboxField('dataPractices.collectedData', 'Datos recolectados', DATA_OPTIONS, ['personal', 'usage', 'cookies']),
          checkboxField('dataPractices.thirdParties', 'Terceros', THIRD_PARTIES, ['analytics']),
          checkboxField('dataPractices.legalBases', 'Bases legales', LEGAL_BASES, ['contract']),
          checkboxField('compliance.requestedFrameworks', 'Foco de cumplimiento', COMPLIANCE, [])
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
          selectField('operations.primaryJurisdiction', 'Jurisdicción principal', JURISDICTIONS, 'ar'),
          checkboxField('operations.sellRegions', 'Regiones operativas', REGIONS, ['ar'])
        ]
      },
      {
        title: 'Servicio y comercio',
        description: 'Términos comerciales principales y modelo de cuentas.',
        fields: [
          selectField('terms.offeringType', 'Tipo de oferta', OFFERINGS, 'physical_goods'),
          booleanField('terms.hasAccounts', 'Cuentas de usuario', 'Los usuarios pueden crear cuentas o perfiles.', false),
          booleanField('terms.requiresRegistration', 'Registro obligatorio', 'Se requiere registro para el uso principal o para comprar.', false),
          booleanField('terms.allowsUserContent', 'Contenido generado por usuarios', 'Los usuarios pueden subir reseñas, comentarios o contenido similar.', false),
          booleanField('terms.pricesIncludeTaxes', 'Precios con impuestos incluidos', 'Típico para comercio orientado a consumidores en ARS/Argentina.', true),
          textField('terms.currency', 'Moneda principal', 'ARS'),
          textField('terms.paymentProvider', 'Proveedor de pago', 'Mercado Pago'),
          booleanField('terms.refundsOffered', 'Ofrecés devoluciones / reembolsos / cambios', 'Activá esto si ofrecés algún flujo de devolución o reembolso.', true),
          textField('terms.refundWindow', 'Plazo de devolución', '10 días'),
          textareaField('terms.refundConditions', 'Condiciones de devolución', 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.'),
          selectField('terms.returnShippingResponsibility', 'Responsable del envío de devolución', RETURN_SHIPPING, 'case_by_case'),
          booleanField('terms.warrantyOffered', 'Ofrecés garantía', 'Activá esto si aplican garantías sobre bienes físicos o servicios.', true),
          textareaField('terms.warrantyDetails', 'Detalle de la garantía', 'La garantía legal y cualquier remedio aplicable se interpretarán de forma compatible con la normativa de defensa del consumidor aplicable.')
        ]
      },
      {
        title: 'Reglas y legal',
        description: 'Restricciones, propiedad intelectual, suspensión, avisos, disputas y disclaimers adicionales.',
        fields: [
          checkboxField('terms.prohibitedActivities', 'Conductas prohibidas', PROHIBITED_ACTIVITIES, ['No usar el sitio para actividades ilegales.']),
          textField('terms.ipOwner', 'Titular de la propiedad intelectual', 'Mi proyecto'),
          booleanField('terms.ugcLicenseGranted', 'Licencia sobre contenido de usuarios', 'Si los usuarios envían reseñas o contenido, activá esto si querés una licencia de exhibición.', false),
          booleanField('terms.limitIndirectDamages', 'Limitar daños indirectos', 'Cláusula estándar de limitación de daños indirectos.', true),
          booleanField('terms.shippingDelayDisclaimer', 'Disclaimer por demoras de envío', 'Útil para bienes físicos y correos.', true),
          textareaField('terms.customDisclaimer', 'Disclaimer adicional', ''),
          booleanField('terms.maySuspendAccounts', 'Podés suspender cuentas o pedidos', 'Reservá derechos de suspensión o restricción por uso indebido.', true),
          textareaField('terms.terminationGrounds', 'Causales de terminación', 'Podemos suspender cuentas, pedidos o acceso por fraude, abuso, incumplimiento o riesgos operativos o legales.'),
          selectField('terms.changeNotification', 'Método de aviso de cambios', CHANGE_NOTIFICATION, 'both'),
          textField('terms.disputesForum', 'Foro o jurisdicción de disputas', 'Tribunales competentes de la Ciudad Autónoma de Buenos Aires'),
          selectField('terms.adrMethod', 'Resolución alternativa de disputas', ADR_OPTIONS, 'none')
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
          selectField('operations.primaryJurisdiction', 'Jurisdicción principal', JURISDICTIONS, 'ar'),
          checkboxField('operations.sellRegions', 'Regiones operativas', REGIONS, ['ar']),
          checkboxField('cookies.categories', 'Categorías de cookies', COOKIE_CATEGORIES, ['necessary', 'analytics']),
          checkboxField('cookies.thirdParties', 'Terceros relacionados con cookies', COOKIE_THIRD_PARTIES, ['analytics']),
          selectField('cookies.consentMode', 'Modo de consentimiento', COOKIE_CONSENT, 'banner'),
          textField('cookies.managementUrl', 'URL de gestión de cookies', ''),
          textareaField('cookies.browserControls', 'Controles del navegador o dispositivo', 'El usuario puede bloquear o eliminar cookies desde la configuración del navegador y revisar sus preferencias cuando el banner o el centro de preferencias esté disponible.'),
          textareaField('cookies.retentionPolicy', 'Nota de retención de cookies', 'Algunas cookies son de sesión y otras pueden persistir por más tiempo según la finalidad, la configuración técnica y las políticas del proveedor correspondiente.')
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
          selectField('refund.offeringType', 'Tipo de oferta', OFFERINGS, 'physical_goods'),
          booleanField('refund.acceptsReturns', 'Aceptás devoluciones o reembolsos', 'Activá esto para ventas a distancia o flujos operativos de devolución.', true),
          textField('refund.refundWindow', 'Plazo de reembolso', '10 días'),
          textField('refund.exchangeWindow', 'Plazo de cambio', '10 días'),
          textareaField('refund.returnConditions', 'Condiciones de devolución', 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.'),
          textField('refund.refundMethod', 'Método de reembolso', 'el mismo medio de pago original'),
          textField('refund.refundProcessingTime', 'Tiempo de procesamiento del reembolso', '10 días hábiles'),
          selectField('refund.returnShippingResponsibility', 'Responsable del envío de devolución', RETURN_SHIPPING, 'case_by_case'),
          textField('refund.returnRequestChannel', 'Canal para pedir la devolución', ''),
          textareaField('refund.nonReturnableItems', 'Productos no retornables (uno por línea)', 'Productos personalizados o hechos a medida\nProductos usados, dañados por mal uso o incompletos'),
          booleanField('refund.digitalGoodsFinal', 'Venta digital definitiva', 'Útil para descargas, licencias o accesos ya activados.', false),
          textareaField('refund.damagedItemsProcess', 'Proceso por producto dañado o incorrecto', 'Si el producto llega dañado, incorrecto o con fallas, pedimos que nos contactes con fotos y datos del pedido para revisar el caso.')
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
          checkboxField('disclaimer.categories', 'Tipos de disclaimer', DISCLAIMER_TYPES, ['errors_omissions', 'external_links', 'own_risk']),
          textareaField('disclaimer.professionalAdviceChannel', 'Nota sobre asesoramiento profesional', ''),
          textareaField('disclaimer.externalLinksPolicy', 'Política de enlaces externos', 'El servicio puede enlazar recursos o documentación de terceros. No controlamos ni garantizamos el contenido, disponibilidad o políticas de esos sitios externos.'),
          textareaField('disclaimer.affiliateDisclosure', 'Divulgación de afiliados o compensaciones', ''),
          textareaField('disclaimer.reviewMethodology', 'Metodología de reseñas', ''),
          textareaField('disclaimer.customRiskStatement', 'Nota de uso bajo propio riesgo', 'El uso de la aplicación, sus flujos, automatizaciones y materiales se realiza bajo exclusiva responsabilidad del usuario.')
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
  security: {
    label: 'Política de seguridad',
    description: 'Disclosure responsable, safe harbor, alcance técnico, tiempos de respuesta y prácticas mínimas de seguridad.',
    basePath: 'security',
    generator: () => new globalThis.LegalGenerators.SecurityPolicyGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y activo principal.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales para recibir reportes de seguridad.', fields: commonContactFields() },
      {
        title: 'Disclosure y seguridad',
        description: 'Canales de reporte, alcance, reglas de testing, tiempos de respuesta y bounty opcional.',
        fields: [
          selectField('security.reportChannel', 'Canal de reporte', SECURITY_REPORT_CHANNELS, 'both'),
          textField('security.reportEmail', 'Email de seguridad', ''),
          textField('security.reportUrl', 'URL de reporte o formulario', ''),
          checkboxField('security.scope', 'Alcance', SECURITY_SCOPE, ['web_application', 'api']),
          booleanField('security.safeHarborOffered', 'Incluir safe harbor o buena fe', 'Aclara que la investigación responsable y dentro del alcance será tratada como autorizada.', true),
          booleanField('security.automatedTestingAllowed', 'Permitir pruebas automatizadas de bajo volumen', 'Marcá esto sólo si aceptás escaneos o requests automatizados que no degraden el servicio.', false),
          booleanField('security.denialOfServiceTestingAllowed', 'Permitir pruebas coordinadas de carga o DoS', 'No lo actives salvo que realmente quieras admitirlo con coordinación previa.', false),
          booleanField('security.socialEngineeringAllowed', 'Permitir ingeniería social coordinada', 'No lo actives salvo que aceptes phishing o pruebas similares aprobadas de antemano.', false),
          checkboxField('security.reportRequirements', 'Qué debe incluir el reporte', SECURITY_REPORT_REQUIREMENTS, ['Descripción clara del hallazgo y del impacto esperado', 'Pasos de reproducción o prueba de concepto razonable', 'Activos, URLs, endpoints o cuentas involucradas', 'Información de contacto para seguimiento']),
          textField('security.acknowledgementTime', 'Tiempo para acusar recibo', '3 días hábiles'),
          textField('security.statusUpdateTime', 'Tiempo para compartir actualizaciones', '10 días hábiles'),
          selectField('security.disclosurePreference', 'Preferencia de disclosure', SECURITY_DISCLOSURE, 'coordinated'),
          booleanField('security.bugBountyOffered', 'Ofrecés bug bounty o recompensas', 'Activá esto si existe recompensa, bounty o reconocimiento para algunos reportes.', false),
          textareaField('security.bugBountyNotes', 'Nota sobre bounty o reconocimiento', ''),
          textareaField('security.remediationGuidance', 'Nota sobre remediación o coordinación', 'Priorizamos los reportes según severidad, impacto y complejidad, y podemos pedir tiempo razonable para investigar y mitigar antes de cualquier disclosure público.'),
          textareaField('security.securityPracticesSummary', 'Resumen opcional de prácticas de seguridad', 'Aplicamos controles de acceso, registros operativos, revisión de dependencias y medidas razonables de hardening sobre infraestructura y aplicaciones expuestas.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'security',
        business: values.business,
        contact: values.contact,
        security: values.security,
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
          selectField('deletion.requestChannel', 'Canal de solicitud', DELETION_CHANNELS, 'both'),
          textField('deletion.requestEmail', 'Email para eliminación', ''),
          textField('deletion.requestUrl', 'URL de la página de eliminación', ''),
          checkboxField('deletion.identityRequirements', 'Requisitos de identidad', DELETION_IDENTITY, ['Email de la cuenta o del usuario solicitante']),
          checkboxField('deletion.deletionScope', 'Alcance de la eliminación', DELETION_SCOPE, ['Datos de perfil o cuenta asociados al usuario']),
          checkboxField('deletion.retentionExceptions', 'Excepciones de retención', DELETION_RETENTION, ['Registros necesarios para cumplir obligaciones legales o regulatorias']),
          textField('deletion.responseTime', 'Tiempo de respuesta', '10 días hábiles'),
          textField('deletion.completionTime', 'Tiempo de finalización', '30 días'),
          booleanField('deletion.hasMetaConnection', 'Conexión con Meta/Facebook', 'Activá esto si la app se conecta con cuentas de Meta o Facebook.', true),
          textareaField('deletion.metaDisconnectInstructions', 'Instrucciones para desconectar Meta', 'El usuario puede revocar permisos desde Meta y además pedir eliminación por email.')
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
  lastInput: null,
  isDirtySinceGenerate: false,
  formSeed: null,
  advisorRecommendation: null
};

const formEl = document.getElementById('generator-form');
const previewFrameEl = document.getElementById('preview-html');
const previewCodeEl = document.getElementById('preview-code');
const validationEl = document.getElementById('validation-box');
const statusEl = document.getElementById('document-status');
const summaryEl = document.getElementById('summary-box');
const documentSelectEl = document.getElementById('document-type');
const documentDescriptionEl = document.getElementById('document-description');
const loadConfigButtonEl = document.getElementById('load-config-button');
const loadConfigInputEl = document.getElementById('load-config-input');
const advisorPanelEl = document.getElementById('advisor-panel');
const preparedPathEl = document.getElementById('prepared-path');
const generateButtonEl = document.getElementById('generate-button');
const downloadHtmlEl = document.getElementById('download-html');
const downloadMarkdownEl = document.getElementById('download-markdown');
const downloadTextEl = document.getElementById('download-text');
const downloadJsonEl = document.getElementById('download-json');
const connectGitHubEl = document.getElementById('connect-github');
const logoutGitHubEl = document.getElementById('logout-github');
const publishGitHubPagesEl = document.getElementById('publish-github-pages');
const githubRepoSelectEl = document.getElementById('github-repo-select');
const githubSessionStatusEl = document.getElementById('github-session-status');

let validationRequestId = 0;
let validationTimer = null;
const generatorCache = new Map();
const backendConfig = globalThis.__LEGAL_HUB_CONFIG__ || {};
const GH_SESSION_STORAGE_KEY = 'ppg_github_session';
const githubState = {
  backendEnabled: Boolean(backendConfig.backendBaseUrl),
  session: null,
  sessionToken: readStoredGitHubSessionToken(),
  repos: []
};

generateButtonEl.addEventListener('click', generateDocument);
downloadHtmlEl.addEventListener('click', () => downloadOutput('html'));
downloadMarkdownEl.addEventListener('click', () => downloadOutput('markdown'));
downloadTextEl.addEventListener('click', () => downloadOutput('text'));
downloadJsonEl.addEventListener('click', downloadJson);
connectGitHubEl.addEventListener('click', connectGitHub);
logoutGitHubEl.addEventListener('click', logoutGitHub);
publishGitHubPagesEl.addEventListener('click', publishToGitHubPages);
githubRepoSelectEl.addEventListener('change', updatePublishControls);
loadConfigButtonEl.addEventListener('click', () => loadConfigInputEl.click());
loadConfigInputEl.addEventListener('change', loadExistingConfig);

for (const button of document.querySelectorAll('.format-button')) {
  button.addEventListener('click', () => {
    appState.previewFormat = button.dataset.format;
    for (const item of document.querySelectorAll('.format-button')) item.classList.remove('is-active');
    button.classList.add('is-active');
    refreshPreview();
  });
}

function init() {
  bootstrapOAuthSessionFromUrl();
  renderDocumentCards();
  renderDocumentSelect();
  renderJurisdictionAdvisor();
  renderForm();
  setPreviewPlaceholder('Generá un documento para ver la salida acá.');
  setExportState(false);
  setStatus('');
  initGitHubPublish();
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
      appState.formSeed = null;
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
    appState.formSeed = null;
    renderForm();
  });
}

function renderJurisdictionAdvisor() {
  advisorPanelEl.innerHTML = `
    <div class="advisor-grid">
      <div class="field">
        <label for="advisor-home-jurisdiction">Dónde está establecido el negocio</label>
        <select id="advisor-home-jurisdiction">
          ${JURISDICTIONS.map((option) => `<option value="${option.value}" ${option.value === 'ar' ? 'selected' : ''}>${option.label}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="advisor-business-type">Qué tipo de producto o negocio tenés</label>
        <select id="advisor-business-type">
          ${BUSINESS_TYPES.map((option) => `<option value="${option.value}" ${option.value === 'saas' ? 'selected' : ''}>${option.label}</option>`).join('')}
        </select>
      </div>
      <div class="field full">
        <label>En qué regiones esperás usuarios o clientes</label>
        <div class="advisor-targets">
          ${REGIONS.map((option) => `
            <label class="checkbox-item">
              <input type="checkbox" name="advisor.targetRegions" value="${option.value}" ${option.value === 'ar' ? 'checked' : ''}>
              <span><strong>${option.label}</strong><small>${option.description || ''}</small></span>
            </label>
          `).join('')}
        </div>
      </div>
      <label class="checkbox-item">
        <input type="checkbox" id="advisor-california">
        <span><strong>¿Tenés usuarios o clientes en California?</strong><small>Esto ayuda a sugerir foco CCPA/CalOPPA en vez de asumirlo para todo Estados Unidos.</small></span>
      </label>
      <label class="checkbox-item">
        <input type="checkbox" id="advisor-children">
        <span><strong>¿El servicio apunta a menores o trata datos de chicos?</strong><small>Esto ayuda a sugerir enfoque tipo COPPA y lenguaje infantil reforzado.</small></span>
      </label>
    </div>
    <div class="advisor-actions">
      <button type="button" class="button button-secondary" id="advisor-run">Sugerir configuración</button>
      <button type="button" class="button button-primary button-disabled" id="advisor-apply" disabled>Aplicar sugerencia</button>
    </div>
    <div class="advisor-summary" id="advisor-summary"></div>
  `;

  advisorPanelEl.querySelector('#advisor-run').addEventListener('click', runJurisdictionAdvisor);
  advisorPanelEl.querySelector('#advisor-apply').addEventListener('click', applyJurisdictionRecommendation);
}

function renderForm() {
  const config = DOCUMENTS[appState.documentType];
  documentDescriptionEl.textContent = config.description;
  const defaults = createDefaults(appState.documentType, appState.formSeed);
  appState.lastGenerated = null;
  appState.lastInput = null;
  appState.isDirtySinceGenerate = false;
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
    markDirtySinceGenerate();
    scheduleLiveValidation();
  };

  preparedPathEl.textContent = buildPreparedPath();
  validationEl.className = 'validation-box';
  validationEl.innerHTML = '';
  renderSummary();
  setPreviewPlaceholder('Generá un documento para ver la salida acá.');
  setExportState(false);
  setStatus('');
  renderAdvisorRecommendation();
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

function createDefaults(type, seed = null) {
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
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'], childrenAudience: false },
      dataPractices: {
        collectedData: ['personal', 'usage', 'cookies'],
        thirdParties: ['analytics', 'cloud'],
        legalBases: ['contract', 'legitimate_interest']
      },
      compliance: { requestedFrameworks: [] }
    }, seed);
  }

  if (type === 'terms') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'ecommerce' },
      operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
      terms: {}
    }, seed);
  }

  if (type === 'cookies') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
      cookies: {}
    }, seed);
  }

  if (type === 'refund') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'ecommerce' },
      refund: {}
    }, seed);
  }

  if (type === 'disclaimer') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      disclaimer: {}
    }, seed);
  }

  if (type === 'security') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      security: {}
    }, seed);
  }

  return mergeSeed({
    ...common,
    business: { ...common.business, type: 'saas' },
    deletion: {}
  }, seed);
}

function mergeSeed(base, seed) {
  if (!seed || typeof seed !== 'object') return base;
  return deepMerge(base, seed);
}

function deepMerge(base, source) {
  if (Array.isArray(base) || Array.isArray(source)) {
    return Array.isArray(source) ? [...source] : Array.isArray(base) ? [...base] : source;
  }
  if (!base || typeof base !== 'object') return source;
  const output = { ...base };
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object' && !Array.isArray(output[key])) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = Array.isArray(value) ? [...value] : value;
    }
  }
  return output;
}

async function loadExistingConfig(event) {
  const [file] = event.target.files || [];
  event.target.value = '';
  if (!file) return;

  try {
    const contents = await file.text();
    const parsed = JSON.parse(contents);
    const documentType = resolveInputDocumentType(parsed);
    if (!documentType || !DOCUMENTS[documentType]) {
      throw new Error('No pude detectar un tipo de documento soportado dentro del JSON.');
    }

    appState.documentType = documentType;
    appState.formSeed = normalizeLoadedSeed(documentType, parsed);
    documentSelectEl.value = documentType;
    renderForm();
    scheduleLiveValidation();
    setStatus(`Configuración cargada para ${DOCUMENTS[documentType].label}. Revisá los campos y regenerá cuando quieras.`);
  } catch (error) {
    setStatus(`No pude cargar la configuración: ${error.message}`);
  }
}

function runJurisdictionAdvisor() {
  appState.advisorRecommendation = computeJurisdictionRecommendation(gatherAdvisorValues());
  renderAdvisorRecommendation();
}

function gatherAdvisorValues() {
  return {
    homeJurisdiction: advisorPanelEl.querySelector('#advisor-home-jurisdiction')?.value || 'ar',
    businessType: advisorPanelEl.querySelector('#advisor-business-type')?.value || 'saas',
    targetRegions: Array.from(advisorPanelEl.querySelectorAll('input[name="advisor.targetRegions"]:checked')).map((input) => input.value),
    californiaResidents: Boolean(advisorPanelEl.querySelector('#advisor-california')?.checked),
    childrenAudience: Boolean(advisorPanelEl.querySelector('#advisor-children')?.checked)
  };
}

function computeJurisdictionRecommendation(values) {
  const targetRegions = values.targetRegions.length > 0 ? values.targetRegions : [values.homeJurisdiction].filter(Boolean);
  const requestedFrameworks = [];
  const notes = [];

  if (values.californiaResidents) {
    requestedFrameworks.push('ccpa', 'caloppa');
    notes.push('Se recomienda reforzar derechos de privacidad para California.');
  } else if (targetRegions.includes('us')) {
    notes.push('Operar en Estados Unidos no activa CCPA automáticamente; si tenés usuarios en California, conviene revisar ese foco.');
  }

  if (values.childrenAudience) {
    requestedFrameworks.push('coppa');
    notes.push('Se recomienda lenguaje reforzado para privacidad infantil y revisión específica del flujo de datos de menores.');
  }

  if (values.homeJurisdiction === 'ca' || targetRegions.includes('ca')) {
    requestedFrameworks.push('pipeda');
    notes.push('Se recomienda reforzar lenguaje orientado a Canadá/PIPEDA.');
  }

  if (targetRegions.includes('eu') || targetRegions.includes('uk') || values.homeJurisdiction === 'eu' || values.homeJurisdiction === 'uk') {
    notes.push('Conviene revisar bases legales, derechos del usuario y transferencias con foco GDPR/UK GDPR.');
  }

  if (values.homeJurisdiction === 'ar' || targetRegions.includes('ar')) {
    notes.push('Se recomiendan defaults en español y lenguaje alineado a Argentina para privacidad, consumo y e-commerce.');
  }

  return {
    ...values,
    targetRegions,
    requestedFrameworks: [...new Set(requestedFrameworks)],
    language: values.homeJurisdiction === 'ar' || targetRegions.includes('ar') ? 'es' : 'en',
    countryLabel: jurisdictionLabel(values.homeJurisdiction),
    notes
  };
}

function renderAdvisorRecommendation() {
  const summaryEl = advisorPanelEl.querySelector('#advisor-summary');
  const applyButtonEl = advisorPanelEl.querySelector('#advisor-apply');
  if (!summaryEl || !applyButtonEl) return;

  if (!appState.advisorRecommendation) {
    summaryEl.classList.remove('is-visible');
    summaryEl.innerHTML = '';
    applyButtonEl.disabled = true;
    applyButtonEl.classList.add('button-disabled');
    return;
  }

  const recommendation = appState.advisorRecommendation;
  const bullets = [
    `Jurisdicción principal sugerida: ${jurisdictionLabel(recommendation.homeJurisdiction)}`,
    `Regiones operativas sugeridas: ${recommendation.targetRegions.map(jurisdictionLabel).join(', ') || 'Sin definir'}`,
    `Tipo de negocio sugerido: ${BUSINESS_TYPES.find((option) => option.value === recommendation.businessType)?.label || recommendation.businessType}`,
    `Idioma sugerido: ${recommendation.language === 'es' ? 'Español' : 'English'}`,
    recommendation.requestedFrameworks.length > 0
      ? `Marcos sugeridos: ${recommendation.requestedFrameworks.join(', ')}`
      : 'No hace falta activar marcos extra automáticamente con estas respuestas.'
  ];

  summaryEl.classList.add('is-visible');
  summaryEl.innerHTML = `
    <strong>Sugerencia actual</strong>
    <ul>${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    ${recommendation.notes.length > 0 ? `<ul>${recommendation.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
  `;
  applyButtonEl.disabled = false;
  applyButtonEl.classList.remove('button-disabled');
}

function applyJurisdictionRecommendation() {
  if (!appState.advisorRecommendation) return;

  const currentValues = gatherFormValues();
  const patch = buildRecommendationPatch(appState.documentType, appState.advisorRecommendation);
  appState.formSeed = deepMerge(currentValues, patch);
  renderForm();
  scheduleLiveValidation();
  setStatus(`Sugerencia aplicada sobre ${DOCUMENTS[appState.documentType].label}. Revisá los campos y ajustá lo que no refleje tu operación real.`);
}

function buildRecommendationPatch(documentType, recommendation) {
  const patch = {
    business: {
      type: recommendation.businessType,
      country: recommendation.countryLabel
    },
    settings: {
      language: recommendation.language
    }
  };

  if (['privacy', 'terms', 'cookies'].includes(documentType)) {
    patch.operations = {
      primaryJurisdiction: recommendation.homeJurisdiction,
      sellRegions: recommendation.targetRegions
    };
  }

  if (documentType === 'privacy') {
    patch.operations = {
      ...(patch.operations || {}),
      childrenAudience: recommendation.childrenAudience
    };
    patch.compliance = {
      requestedFrameworks: recommendation.requestedFrameworks
    };
  }

  return patch;
}

function jurisdictionLabel(value) {
  return JURISDICTIONS.find((option) => option.value === value)?.label || value;
}

function resolveInputDocumentType(input) {
  if (input && typeof input.documentType === 'string' && DOCUMENTS[input.documentType]) {
    return input.documentType;
  }
  if (input?.terms) return 'terms';
  if (input?.cookies) return 'cookies';
  if (input?.refund) return 'refund';
  if (input?.disclaimer) return 'disclaimer';
  if (input?.security) return 'security';
  if (input?.deletion) return 'deletion';
  return 'privacy';
}

function normalizeLoadedSeed(documentType, input) {
  const seed = { ...input };
  delete seed.documentType;
  if (documentType === 'refund' && Array.isArray(seed.refund?.nonReturnableItems)) {
    seed.refund = {
      ...seed.refund,
      nonReturnableItems: seed.refund.nonReturnableItems.join('\n')
    };
  }
  return seed;
}

async function generateDocument() {
  const values = gatherFormValues();
  const config = DOCUMENTS[appState.documentType];
  const generator = getGenerator(appState.documentType);
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
    appState.isDirtySinceGenerate = false;
    setExportState(true);
    setStatus('Documento generado correctamente. Si cambiás el formulario, vas a tener que regenerarlo para actualizar vista previa y descargas.');
    updatePublishControls();
    refreshPreview();
  } catch (error) {
    validationEl.className = 'validation-box is-visible';
    validationEl.innerHTML = `<div class="errors"><strong>Error de generación</strong><ul><li>${escapeHtml(error.message)}</li></ul></div>`;
    setPreviewPlaceholder('La generación falló.');
    appState.lastGenerated = null;
    setExportState(false);
    updatePublishControls();
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
  if (errors.length === 0 && warnings.length === 0 && !appState.isDirtySinceGenerate) {
    setStatus('');
  }
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
  return `https://YOUR-USER.github.io/YOUR-REPO/${buildRepoDocumentPath(appState.documentType, `${slugify(businessName)}-hash.html`)}`;
}

function buildRepoDocumentPath(documentType, filename) {
  return `legal/${DOCUMENTS[documentType].basePath}/${filename}`;
}

function setPreviewPlaceholder(message) {
  previewFrameEl.classList.remove('is-visible');
  previewFrameEl.srcdoc = '';
  previewCodeEl.classList.add('is-visible');
  previewCodeEl.textContent = message;
}

function setStatus(message) {
  if (!message) {
    statusEl.className = 'status-banner';
    statusEl.textContent = '';
    return;
  }

  statusEl.className = 'status-banner is-visible';
  statusEl.textContent = message;
}

function setExportState(enabled) {
  for (const button of [downloadHtmlEl, downloadMarkdownEl, downloadTextEl, downloadJsonEl]) {
    button.disabled = !enabled;
    button.classList.toggle('button-disabled', !enabled);
  }
  updatePublishControls();
}

function renderSummary() {
  const values = gatherFormValues();
  const items = [
    ['Documento', DOCUMENTS[appState.documentType].label],
    ['Proyecto', values.business?.name || 'Sin definir'],
    ['Tipo', values.business?.type || 'Sin definir'],
    ['País', values.business?.country || 'Sin definir'],
    ['Idioma', values.settings?.language === 'en' ? 'English' : 'Español'],
    ['Sitio', values.business?.websiteUrl || 'Sin URL'],
    ['Contacto', values.contact?.email || values.contact?.pageUrl || 'Sin contacto']
  ];

  const valuesHtml = items.map(([label, value]) => `
    <div class="summary-item">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(String(value))}</span>
    </div>
  `).join('');

  summaryEl.className = 'summary-box is-visible';
  summaryEl.innerHTML = `
    <h4>Resumen actual</h4>
    <div class="summary-grid">${valuesHtml}</div>
  `;
}

async function initGitHubPublish() {
  if (!githubState.backendEnabled) {
    githubSessionStatusEl.textContent = 'Backend no configurado todavía. Definí __LEGAL_HUB_CONFIG__.backendBaseUrl para habilitar GitHub.';
    connectGitHubEl.disabled = true;
    logoutGitHubEl.disabled = true;
    githubRepoSelectEl.disabled = true;
    publishGitHubPagesEl.disabled = true;
    publishGitHubPagesEl.classList.add('button-disabled');
    return;
  }

  connectGitHubEl.disabled = false;
  await refreshGitHubSession();
}

function backendUrl(path) {
  const base = String(backendConfig.backendBaseUrl || '').replace(/\/$/, '');
  return `${base}${path}`;
}

function readStoredGitHubSessionToken() {
  try {
    return localStorage.getItem(GH_SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function writeStoredGitHubSessionToken(value) {
  githubState.sessionToken = value || '';
  try {
    if (value) {
      localStorage.setItem(GH_SESSION_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(GH_SESSION_STORAGE_KEY);
    }
  } catch {
    // ignore storage issues in restricted browsers
  }
}

function bootstrapOAuthSessionFromUrl() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const sessionToken = params.get('gh_session');
  if (!sessionToken) return;

  writeStoredGitHubSessionToken(sessionToken);
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  history.replaceState(null, '', cleanUrl);
}

function backendFetch(path, init = {}) {
  const headers = new Headers(init.headers || {});
  if (githubState.sessionToken) {
    headers.set('authorization', `Bearer ${githubState.sessionToken}`);
  }
  return fetch(backendUrl(path), {
    ...init,
    credentials: 'include',
    headers
  });
}

async function refreshGitHubSession() {
  try {
    const response = await backendFetch('/api/github/session');
    const payload = await response.json();
    githubState.session = payload.authenticated ? payload.user : null;
    if (!payload.authenticated && githubState.sessionToken) {
      writeStoredGitHubSessionToken('');
    }
    renderGitHubSession();
    if (githubState.session) {
      await loadGitHubRepos();
    } else {
      githubState.repos = [];
      renderRepoOptions();
    }
  } catch {
    githubState.session = null;
    githubState.repos = [];
    githubSessionStatusEl.textContent = 'No se pudo conectar con el backend de GitHub.';
    renderRepoOptions();
  }
  updatePublishControls();
}

function renderGitHubSession() {
  if (!githubState.backendEnabled) return;
  if (githubState.session) {
    githubSessionStatusEl.textContent = `Conectado como ${githubState.session.login}.`;
    connectGitHubEl.disabled = true;
    logoutGitHubEl.disabled = false;
  } else {
    githubSessionStatusEl.textContent = 'Todavía no conectaste una cuenta de GitHub.';
    connectGitHubEl.disabled = false;
    logoutGitHubEl.disabled = true;
  }
  connectGitHubEl.classList.toggle('button-primary', !githubState.session);
  connectGitHubEl.classList.toggle('button-secondary', !!githubState.session);
  connectGitHubEl.classList.toggle('button-disabled', !!githubState.session);
  logoutGitHubEl.classList.toggle('button-primary', !!githubState.session);
  logoutGitHubEl.classList.toggle('button-secondary', !githubState.session);
  logoutGitHubEl.classList.toggle('button-disabled', !githubState.session);
}

async function loadGitHubRepos() {
  try {
    const response = await backendFetch('/api/github/repos');
    const payload = await response.json();
    githubState.repos = Array.isArray(payload.repos) ? payload.repos : [];
    renderRepoOptions();
  } catch {
    githubState.repos = [];
    githubRepoSelectEl.innerHTML = '<option value="">No se pudieron cargar repositorios</option>';
  }
}

function renderRepoOptions() {
  githubRepoSelectEl.innerHTML = '<option value="">Elegí un repositorio</option>';
  for (const repo of githubState.repos) {
    const option = document.createElement('option');
    option.value = repo.full_name;
    option.textContent = `${repo.full_name}${repoLabel(repo)}`;
    option.dataset.defaultBranch = repo.default_branch || 'main';
    githubRepoSelectEl.appendChild(option);
  }
  githubRepoSelectEl.disabled = !githubState.session || githubState.repos.length === 0;
}

function repoLabel(repo) {
  if (repo.pages_accessible) {
    return ' · Pages accesible';
  }
  if (repo.pages_active) {
    return ' · Pages activo';
  }
  return '';
}

function updatePublishControls() {
  const canPublish = githubState.backendEnabled
    && Boolean(githubState.session)
    && Boolean(githubRepoSelectEl.value)
    && Boolean(appState.lastGenerated)
    && !appState.isDirtySinceGenerate;

  publishGitHubPagesEl.disabled = !canPublish;
  publishGitHubPagesEl.classList.toggle('button-disabled', !canPublish);
  publishGitHubPagesEl.classList.toggle('button-primary', canPublish);
}

function connectGitHub() {
  if (!githubState.backendEnabled) return;
  const returnTo = encodeURIComponent(window.location.href);
  window.location.href = `${backendUrl('/api/github/start')}?return_to=${returnTo}`;
}

async function logoutGitHub() {
  if (!githubState.backendEnabled) return;
  await backendFetch('/api/github/logout', {
    method: 'POST'
  });
  writeStoredGitHubSessionToken('');
  githubState.session = null;
  githubState.repos = [];
  renderGitHubSession();
  renderRepoOptions();
  updatePublishControls();
}

async function publishToGitHubPages() {
  if (!githubState.backendEnabled || !appState.lastGenerated || !githubRepoSelectEl.value) {
    return;
  }

  publishGitHubPagesEl.disabled = true;
  publishGitHubPagesEl.textContent = 'Publicando...';

  try {
    const repo = githubState.repos.find((item) => item.full_name === githubRepoSelectEl.value);
    const html = appState.lastGenerated.html;
    const slug = slugify(appState.lastInput?.business?.name || 'legal-document');
    const hash = await shortHash(html);
    const path = buildRepoDocumentPath(appState.documentType, `${slug}-${hash}.html`);
    const response = await backendFetch('/api/github/publish', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        repo: githubRepoSelectEl.value,
        branch: repo?.default_branch || 'main',
        path,
        content: html,
        commitMessage: `Publish ${DOCUMENTS[appState.documentType].label}: ${slug}-${hash}.html`
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'No se pudo publicar el documento.');
    }
    preparedPathEl.textContent = payload.public_url || preparedPathEl.textContent;
    setStatus(`Documento publicado. URL final: ${payload.public_url}`);
  } catch (error) {
    setStatus(`Error al publicar en GitHub Pages: ${error.message}`);
  } finally {
    publishGitHubPagesEl.textContent = 'Publicar en mi GitHub Pages';
    updatePublishControls();
  }
}

function scheduleLiveValidation() {
  clearTimeout(validationTimer);
  const currentRequestId = ++validationRequestId;
  validationTimer = setTimeout(async () => {
    const config = DOCUMENTS[appState.documentType];
    const generator = getGenerator(appState.documentType);
    const values = gatherFormValues();
    const input = config.buildInput(values);

    try {
      const validation = await generator.validate(input);
      if (currentRequestId !== validationRequestId) return;
      renderSummary();
      renderValidation(validation);
    } catch {
      if (currentRequestId !== validationRequestId) return;
      validationEl.className = 'validation-box is-visible';
      validationEl.innerHTML = '<div class="errors"><strong>Error de validación</strong><ul><li>No se pudo validar el formulario en tiempo real.</li></ul></div>';
    }
  }, 250);
}

function getGenerator(documentType) {
  if (!generatorCache.has(documentType)) {
    generatorCache.set(documentType, DOCUMENTS[documentType].generator());
  }
  return generatorCache.get(documentType);
}

function markDirtySinceGenerate() {
  if (!appState.lastGenerated || appState.isDirtySinceGenerate) {
    return;
  }

  appState.isDirtySinceGenerate = true;
  appState.lastGenerated = null;
  setExportState(false);
  setPreviewPlaceholder('El formulario cambió desde la última generación. Volvé a generar el documento para actualizar la vista previa y las descargas.');
  setStatus('La versión generada quedó desactualizada. Volvé a generar el documento para que la vista previa y las descargas reflejen los cambios.');
}

function slugify(value) {
  return String(value || 'legal-document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'legal-document';
}

async function shortHash(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return hash.slice(0, 16);
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
  { value: 'personal', label: 'Personales', description: 'Nombres, emails, direcciones e identificadores de cuenta.' },
  { value: 'financial', label: 'Financieros', description: 'Pagos, facturación y datos de transacciones comerciales.' },
  { value: 'tax', label: 'Fiscales / facturación', description: 'CUIT, registros fiscales y datos contables.' },
  { value: 'identity', label: 'Identidad', description: 'Verificación o identidad comercial.' },
  { value: 'usage', label: 'Uso', description: 'Logs, analítica, eventos de interacción e IP.' },
  { value: 'cookies', label: 'Cookies', description: 'Cookies y tecnologías similares.' },
  { value: 'location', label: 'Ubicación', description: 'Ubicación aproximada o precisa.' },
  { value: 'profiling', label: 'Perfilado', description: 'Segmentación, scoring y decisiones automatizadas.' }
];
const THIRD_PARTIES = [
  { value: 'analytics', label: 'Analítica', description: 'Proveedores de analítica o medición.' },
  { value: 'advertising', label: 'Publicidad', description: 'Plataformas de anuncios, atribución o remarketing.' },
  { value: 'payment', label: 'Procesadores de pago', description: 'Pasarelas o procesadores de pago generales.' },
  { value: 'paypal_only', label: 'Sólo PayPal', description: 'Pagos manejados únicamente por PayPal.' },
  { value: 'shipping', label: 'Envíos / logística', description: 'Correos, couriers o fulfillment.' },
  { value: 'cloud', label: 'Cloud / hosting', description: 'Infraestructura cloud y hosting.' },
  { value: 'social', label: 'Integraciones sociales', description: 'Embeds, login social o APIs sociales.' },
  { value: 'email', label: 'Email / marketing', description: 'Email transaccional o automatización de marketing.' }
];
const LEGAL_BASES = [
  { value: 'contract', label: 'Contrato', description: 'Necesaria para prestar el servicio o completar una compra.' },
  { value: 'consent', label: 'Consentimiento', description: 'Consentimiento explícito del usuario.' },
  { value: 'legal_obligation', label: 'Obligación legal', description: 'Deberes fiscales, contables, regulatorios o legales.' },
  { value: 'legitimate_interest', label: 'Interés legítimo', description: 'Seguridad, prevención de fraude u operaciones limitadas.' }
];
const COMPLIANCE = [
  { value: 'ccpa', label: 'CCPA / CPRA', description: 'California privacy language.' },
  { value: 'coppa', label: 'COPPA', description: 'Children privacy compliance.' },
  { value: 'caloppa', label: 'CalOPPA', description: 'California online privacy baseline.' },
  { value: 'pipeda', label: 'PIPEDA', description: 'Canada privacy language.' }
];
const OFFERINGS = [
  { value: 'physical_goods', label: 'Productos físicos' },
  { value: 'digital_products', label: 'Productos digitales' },
  { value: 'services', label: 'Servicios' },
  { value: 'subscriptions', label: 'Suscripciones' }
];
const RETURN_SHIPPING = [
  { value: 'customer', label: 'Cliente' },
  { value: 'merchant', label: 'Comercio' },
  { value: 'case_by_case', label: 'Caso por caso' }
];
const CHANGE_NOTIFICATION = [
  { value: 'site_notice', label: 'Aviso en el sitio' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Ambos' }
];
const ADR_OPTIONS = [
  { value: 'none', label: 'Ninguna' },
  { value: 'mediation', label: 'Mediación' },
  { value: 'arbitration', label: 'Arbitraje' }
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
const SECURITY_REPORT_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'form', label: 'Formulario / página' },
  { value: 'both', label: 'Email y página' }
];
const SECURITY_SCOPE = [
  { value: 'web_application', label: 'Aplicación web', description: 'Frontend, panel y páginas públicas.' },
  { value: 'api', label: 'API / endpoints', description: 'APIs, webhooks o endpoints para desarrolladores.' },
  { value: 'mobile_app', label: 'App móvil', description: 'Aplicaciones iOS, Android o wrappers móviles.' },
  { value: 'infrastructure', label: 'Infraestructura', description: 'Hosting, redes, storage y componentes de soporte.' },
  { value: 'integrations', label: 'Integraciones', description: 'Servicios conectados y terceros integrados.' },
  { value: 'content', label: 'Contenido / assets', description: 'Documentación, archivos estáticos o contenido sensible para seguridad.' }
];
const SECURITY_DISCLOSURE = [
  { value: 'coordinated', label: 'Disclosure coordinado' },
  { value: 'researcher_choice', label: 'Caso por caso' },
  { value: 'silent_fix', label: 'Corregir antes de divulgar' }
];
const SECURITY_REPORT_REQUIREMENTS = [
  { value: 'Descripción clara del hallazgo y del impacto esperado', label: 'Descripción e impacto', description: 'Qué pasa y por qué importa.' },
  { value: 'Pasos de reproducción o prueba de concepto razonable', label: 'Reproducción o PoC', description: 'Cómo reproducir el hallazgo sin exagerar riesgo.' },
  { value: 'Activos, URLs, endpoints o cuentas involucradas', label: 'Activos afectados', description: 'Qué activos o superficies están involucrados.' },
  { value: 'Información de contacto para seguimiento', label: 'Contacto de seguimiento', description: 'Cómo continuar la coordinación del caso.' }
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
