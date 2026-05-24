class CookiesPolicyGenerator {
  async validate(input) {
    const normalized = this.normalizeInput(input);
    return {
      ok: normalized.errors.length === 0,
      errors: normalized.errors,
      warnings: normalized.warnings,
      normalizedInput: normalized.data
    };
  }

  async explain(input) {
    const result = await this.buildDocument(input);
    return {
      validation: {
        ok: result.errors.length === 0,
        errors: result.errors,
        warnings: result.warnings
      },
      decisionLog: result.decisionLog,
      includedSections: result.document.sections.map((section) => section.title)
    };
  }

  async generate(input) {
    const result = await this.buildDocument(input);
    if (result.errors.length > 0) {
      throw new Error(result.errors.join(' | '));
    }
    return {
      html: this.formatAsHTML(result.document),
      markdown: this.formatAsMarkdown(result.document),
      text: this.formatAsText(result.document),
      warnings: result.warnings,
      decisionLog: result.decisionLog
    };
  }

  async buildDocument(input) {
    const normalized = this.normalizeInput(input);
    const language = normalized.data.settings.language || 'es';
    this.currentLanguage = language;
    const document = {
      businessName: normalized.data.business.name,
      effectiveDate: new Date().toISOString().slice(0, 10),
      warnings: normalized.warnings,
      language,
      title: language === 'es' ? 'Política de Cookies' : 'Cookie Policy',
      metadata: this.buildHtmlMetadata(normalized.data),
      sections: []
    };
    const decisionLog = [];

    if (normalized.errors.length === 0) {
      const sections = this.buildSections(normalized.data);
      document.sections = sections.filter((section) => {
        const included = section.paragraphs.length > 0 || section.subsections.length > 0;
        decisionLog.push({
          sectionId: section.id,
          title: section.title,
          included,
          reason: included ? 'section generated' : 'section omitted'
        });
        return included;
      });
    }

    return {
      errors: normalized.errors,
      warnings: normalized.warnings,
      decisionLog,
      document
    };
  }

  normalizeInput(input) {
    const data = {
      business: {
        name: this.stringValue(input.business?.name),
        websiteUrl: this.stringValue(input.business?.websiteUrl),
        country: this.stringValue(input.business?.country),
        address: this.stringValue(input.business?.address)
      },
      contact: {
        email: this.stringValue(input.contact?.email),
        phone: this.stringValue(input.contact?.phone),
        pageUrl: this.stringValue(input.contact?.pageUrl)
      },
      operations: {
        primaryJurisdiction: this.stringValue(input.operations?.primaryJurisdiction),
        sellRegions: this.arrayValue(input.operations?.sellRegions)
      },
      cookies: {
        categories: this.arrayValue(input.cookies?.categories),
        thirdParties: this.arrayValue(input.cookies?.thirdParties),
        consentMode: this.stringValue(input.cookies?.consentMode, 'banner'),
        managementUrl: this.stringValue(input.cookies?.managementUrl || input.contact?.pageUrl),
        browserControls: this.stringValue(input.cookies?.browserControls),
        retentionPolicy: this.stringValue(input.cookies?.retentionPolicy),
        notes: this.arrayValue(input.cookies?.notes)
      },
      settings: {
        language: this.stringValue(input.settings?.language, 'es')
      }
    };

    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del negocio es obligatorio.',
          missingWebsite: 'La URL del sitio o aplicación es obligatoria.',
          missingCategories: 'Conviene indicar al menos una categoría de cookies o tecnologías similares.',
          missingThirdParties: 'Conviene indicar si existen terceros que colocan o leen cookies, como analítica o publicidad.',
          missingManagementUrl: 'Conviene indicar una URL, página o canal donde el usuario pueda gestionar cookies o contactarte sobre ellas.',
          advertisingNeedsConsent: 'Si usás cookies publicitarias o remarketing, conviene aclarar el mecanismo de consentimiento o banner de cookies.',
          analyticsNeedsControls: 'Si usás analítica o cookies no esenciales, conviene explicar cómo deshabilitarlas desde el navegador o desde tu banner.',
          argentinaSpanishWarning: 'Para un sitio o app en Argentina conviene publicar la política de cookies también en español.',
          advertisingNeedsSeparation: 'Si usás publicidad o remarketing, conviene separar con claridad cookies necesarias, analíticas y publicitarias.',
          advertisingNeedsThirdPartyClarity: 'Si usás analítica o publicidad, conviene identificar mejor los terceros y vincular esta política con la política de privacidad general.'
        }
      : {
          missingBusinessName: 'Business name is required.',
          missingWebsite: 'Website or app URL is required.',
          missingCategories: 'You should specify at least one cookie or similar technology category.',
          missingThirdParties: 'You should specify whether third parties place or read cookies, such as analytics or advertising providers.',
          missingManagementUrl: 'You should provide a URL, page, or contact channel where users can manage cookies or contact you about them.',
          advertisingNeedsConsent: 'If you use advertising or remarketing cookies, you should explain the consent or cookie-banner mechanism.',
          analyticsNeedsControls: 'If you use analytics or other non-essential cookies, you should explain how users can disable them in the browser or through your banner.',
          argentinaSpanishWarning: 'For an Argentina-facing site or app, publishing the cookie policy in Spanish is strongly recommended.',
          advertisingNeedsSeparation: 'If you use advertising or remarketing, clearly separate necessary, analytics, and advertising cookies.',
          advertisingNeedsThirdPartyClarity: 'If you use analytics or advertising, identify third parties more clearly and link this policy back to your broader privacy policy.'
        };

    const errors = [];
    const warnings = [];

    if (!data.business.name) errors.push(messages.missingBusinessName);
    if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
    if (data.cookies.categories.length === 0) warnings.push(messages.missingCategories);
    if (data.cookies.thirdParties.length === 0) warnings.push(messages.missingThirdParties);
    if (!data.cookies.managementUrl && !data.contact.email) warnings.push(messages.missingManagementUrl);
    if (data.cookies.categories.includes('advertising') && data.cookies.consentMode === 'essential_only') warnings.push(messages.advertisingNeedsConsent);
    if (data.cookies.categories.some((item) => ['analytics', 'advertising', 'preferences'].includes(item)) && !data.cookies.browserControls) warnings.push(messages.analyticsNeedsControls);
    if (this.isArgentina(data) && data.settings.language !== 'es') warnings.push(messages.argentinaSpanishWarning);
    if (data.cookies.categories.includes('advertising') && !data.cookies.categories.includes('analytics') && !data.cookies.categories.includes('necessary')) warnings.push(messages.advertisingNeedsSeparation);
    if (data.cookies.categories.some((item) => ['analytics', 'advertising'].includes(item)) && data.cookies.thirdParties.length === 0) warnings.push(messages.advertisingNeedsThirdPartyClarity);

    return { data, errors, warnings };
  }

  buildSections(data) {
    return [
      this.section('overview', this.text('Overview', 'Resumen'), [
        this.interpolate(this.text(
          '{business_name} uses cookies and similar technologies on {website} to operate the service, remember preferences, measure usage, and, where applicable, support analytics or advertising features.',
          '{business_name} utiliza cookies y tecnologías similares en {website} para operar el servicio, recordar preferencias, medir el uso y, cuando corresponde, soportar funciones de analítica o publicidad.'
        ), data)
      ]),
      this.section('what-are-cookies', this.text('What Cookies Are', 'Qué Son las Cookies'), [
        this.text(
          'Cookies are small text files or similar technologies stored on a browser, device, or application context so that a service can recognize a session, remember preferences, and understand how the service is used.',
          'Las cookies son pequeños archivos de texto o tecnologías similares que se almacenan en el navegador, el dispositivo o el contexto de una aplicación para que el servicio pueda reconocer una sesión, recordar preferencias y comprender cómo se utiliza.'
        )
      ]),
      this.section('categories', this.text('Categories of Cookies We Use', 'Categorías de Cookies que Utilizamos'), [
        this.categoriesText(data)
      ]),
      ...(this.isArgentina(data) ? [
        this.section('argentina-notice', this.text('Argentina Cookie Notice', 'Aviso de Cookies para Argentina'), [
          this.argentinaNoticeText(data)
        ])
      ] : []),
      this.section('third-parties', this.text('Third-Party Cookies and Similar Technologies', 'Cookies de Terceros y Tecnologías Similares'), [
        this.thirdPartiesText(data)
      ]),
      this.section('controls', this.text('Consent and Cookie Controls', 'Consentimiento y Controles de Cookies'), [
        this.controlsText(data)
      ]),
      this.section('retention', this.text('Duration and Retention', 'Duración y Retención'), [
        this.retentionText(data)
      ]),
      this.section('contact', this.text('Contact Information', 'Información de Contacto'), [
        this.contactText(data)
      ])
    ];
  }

  section(id, title, paragraphs, subsections = []) {
    return {
      id,
      title,
      paragraphs: paragraphs.filter(Boolean),
      subsections: subsections.filter((item) => item.paragraphs.some(Boolean))
    };
  }

  text(en, es) {
    return this.currentLanguage === 'es' ? es : en;
  }

  interpolate(text, data) {
    return String(text || '')
      .replaceAll('{business_name}', data.business.name || '')
      .replaceAll('{website}', data.business.websiteUrl || '');
  }

  categoriesText(data) {
    if (data.cookies.categories.length === 0) {
      return this.text(
        'We may use strictly necessary, preference, analytics, and advertising cookies depending on how the service is configured over time.',
        'Podemos utilizar cookies estrictamente necesarias, de preferencias, de analítica y de publicidad según cómo se configure el servicio a lo largo del tiempo.'
      );
    }

    const labels = data.cookies.categories.map((item) => this.cookieCategoryLabel(item));
    return `${this.text('The service may use the following categories of cookies or similar technologies:', 'El servicio puede utilizar las siguientes categorías de cookies o tecnologías similares:')}\n${this.listLines(labels)}`;
  }

  thirdPartiesText(data) {
    if (data.cookies.thirdParties.length === 0) {
      return this.text(
        'We may use internal tools and, where applicable, external providers that support analytics, advertising, embedded content, or similar operational functions.',
        'Podemos utilizar herramientas internas y, cuando corresponda, proveedores externos que soporten analítica, publicidad, contenido embebido u otras funciones operativas similares.'
      );
    }

    const labels = data.cookies.thirdParties.map((item) => this.thirdPartyLabel(item));
    return `${this.text('The following categories of third parties may set or read cookies or similar technologies through the service:', 'Las siguientes categorías de terceros pueden instalar o leer cookies o tecnologías similares a través del servicio:')}\n${this.listLines(labels)}`;
  }

  argentinaNoticeText(data) {
    const categories = this.text('Where cookies are not strictly necessary for the technical operation of the service, users should review available consent or preference controls before enabling analytics, advertising, or similar optional technologies.', 'Cuando las cookies no sean estrictamente necesarias para la operación técnica del servicio, los usuarios deberían revisar los controles de consentimiento o preferencias disponibles antes de habilitar tecnologías opcionales de analítica, publicidad o similares.');
    const privacy = data.cookies.managementUrl
      ? this.text(`Additional information about privacy practices, third parties, or user choices may also be available at ${data.cookies.managementUrl}.`, `Puede existir información adicional sobre prácticas de privacidad, terceros u opciones del usuario en ${data.cookies.managementUrl}.`)
      : '';
    return `${categories} ${privacy}`.trim();
  }

  controlsText(data) {
    const consent = this.consentModeText(data.cookies.consentMode);
    const browserControls = data.cookies.browserControls
      ? this.text(
        `Users can also manage or disable cookies through the following browser or device controls: ${data.cookies.browserControls}.`,
        `Los usuarios también pueden gestionar o deshabilitar cookies mediante los siguientes controles del navegador o dispositivo: ${data.cookies.browserControls}.`
      )
      : this.text(
        'Users may also review browser or device settings to block, delete, or limit cookies where those controls are available.',
        'Los usuarios también pueden revisar la configuración del navegador o del dispositivo para bloquear, eliminar o limitar cookies cuando esos controles estén disponibles.'
      );
    const management = data.cookies.managementUrl
      ? this.text(
        `Additional cookie-management information is available at ${data.cookies.managementUrl}.`,
        `Hay información adicional para gestionar cookies en ${data.cookies.managementUrl}.`
      )
      : '';
    return [consent, browserControls, management].filter(Boolean).join(' ');
  }

  retentionText(data) {
    if (data.cookies.retentionPolicy) {
      return data.cookies.retentionPolicy;
    }
    return this.text(
      'Some cookies are session-based and expire when a browser closes, while others may remain for a longer period depending on their purpose, configuration, and the policies of the relevant provider.',
      'Algunas cookies son de sesión y expiran cuando se cierra el navegador, mientras que otras pueden permanecer por un período mayor según su finalidad, configuración y las políticas del proveedor correspondiente.'
    );
  }

  contactText(data) {
    const parts = [];
    if (data.contact.email) {
      parts.push(this.text(`For cookie-related questions, users may contact us by email at ${data.contact.email}.`, `Para consultas relacionadas con cookies, los usuarios pueden contactarnos por email a ${data.contact.email}.`));
    }
    if (data.cookies.managementUrl) {
      parts.push(this.text(`Cookie choices or related information may also be available at ${data.cookies.managementUrl}.`, `Las opciones o información relacionada con cookies también pueden estar disponibles en ${data.cookies.managementUrl}.`));
    }
    if (data.contact.phone) {
      parts.push(this.text(`Phone contact: ${data.contact.phone}.`, `Teléfono de contacto: ${data.contact.phone}.`));
    }
    if (data.business.address) {
      parts.push(this.text(`Postal address: ${data.business.address}.`, `Dirección postal: ${data.business.address}.`));
    }
    return parts.join(' ');
  }

  consentModeText(mode) {
    if (mode === 'implied') {
      return this.text(
        'Where permitted by law, continued use of the service after notice may be treated as acceptance of certain non-essential cookies, subject to user controls and applicable law.',
        'Cuando la ley lo permita, el uso continuado del servicio luego del aviso puede tratarse como aceptación de determinadas cookies no esenciales, sujeto a los controles del usuario y a la ley aplicable.'
      );
    }
    if (mode === 'essential_only') {
      return this.text(
        'The service is intended to operate only with strictly necessary cookies unless and until non-essential cookies are separately enabled by the operator or user settings.',
        'El servicio está pensado para operar sólo con cookies estrictamente necesarias, salvo que el operador o la configuración del usuario habiliten por separado cookies no esenciales.'
      );
    }
    return this.text(
      'Where required, the service uses a cookie banner, preference center, or similar consent mechanism so that users can accept, reject, or configure non-essential cookies.',
      'Cuando corresponde, el servicio utiliza un banner de cookies, centro de preferencias o mecanismo similar de consentimiento para que los usuarios puedan aceptar, rechazar o configurar cookies no esenciales.'
    );
  }

  cookieCategoryLabel(value) {
    const labels = {
      necessary: this.text('Strictly necessary cookies', 'Cookies estrictamente necesarias'),
      preferences: this.text('Preference or functional cookies', 'Cookies de preferencias o funcionales'),
      analytics: this.text('Analytics or measurement cookies', 'Cookies de analítica o medición'),
      advertising: this.text('Advertising or remarketing cookies', 'Cookies de publicidad o remarketing')
    };
    return labels[value] || value;
  }

  thirdPartyLabel(value) {
    const labels = {
      analytics: this.text('Analytics providers', 'Proveedores de analítica'),
      advertising: this.text('Advertising and remarketing platforms', 'Plataformas de publicidad y remarketing'),
      social: this.text('Social media embeds or social login providers', 'Integraciones sociales, contenido embebido o login social'),
      cloud: this.text('Infrastructure or delivery providers that may support content or scripts', 'Proveedores de infraestructura o entrega que pueden soportar contenido o scripts'),
      email: this.text('Email or marketing automation providers', 'Proveedores de email o automatización de marketing')
    };
    return labels[value] || value;
  }

  listLines(items) {
    return items.map((item) => `- ${item}`).join('\n');
  }

  formatAsMarkdown(document) {
    const lines = [
      `# ${document.title} - ${document.businessName}`,
      '',
      `${this.text('Effective date', 'Fecha de vigencia')}: ${document.effectiveDate}`,
      ''
    ];
    for (const section of document.sections) {
      lines.push(`## ${section.title}`, '');
      for (const paragraph of section.paragraphs) {
        lines.push(paragraph, '');
      }
    }
    return lines.join('\n').trim();
  }

  formatAsText(document) {
    return this.formatAsMarkdown(document).replace(/^#{1,3}\s+/gm, '');
  }

  formatAsHTML(document) {
    const escape = (value) => String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;');
    const structuredData = this.buildStructuredData(document);
    const body = document.sections.map((section) => {
      const paragraphs = section.paragraphs.map((paragraph) => this.paragraphToHtml(paragraph, escape)).join('\n');
      return `<section>\n<h2>${escape(section.title)}</h2>\n${paragraphs}\n</section>`;
    }).join('\n');

    return [
      '<!doctype html>',
      `<html lang="${document.language}">`,
      '<head>',
      '  <meta charset="utf-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1">',
      `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
      `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd(structuredData)}</script>` : ''}`,
      '  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}ul{padding-left:24px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>',
      '</head>',
      '<body>',
      '  <main id="main-content" aria-labelledby="document-title">',
      '    <header>',
      `      <h1 id="document-title">${escape(document.title)} - ${escape(document.businessName)}</h1>`,
      `      <p><strong>${escape(this.text('Effective date', 'Fecha de vigencia'))}:</strong> <time datetime="${escape(document.effectiveDate)}">${escape(document.effectiveDate)}</time></p>`,
      '    </header>',
      body,
      '  </main>',
      '</body>',
      '</html>'
    ].join('\n');
  }

  paragraphToHtml(paragraph, escape) {
    if (String(paragraph).startsWith('- ')) {
      const items = String(paragraph)
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => `<li>${escape(line.slice(2))}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    }
    return `<p>${escape(paragraph).replaceAll('\n', '<br>')}</p>`;
  }

  stringValue(value, fallback = '') {
    if (typeof value !== 'string') return fallback;
    const normalized = value.trim();
    if (!normalized || ['>', 'no hay', 'n/a', 'na', 'none', 'null'].includes(normalized.toLowerCase())) {
      return fallback;
    }
    return normalized;
  }

  arrayValue(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  isArgentina(data) {
    return data.operations.primaryJurisdiction === 'ar' || String(data.business.country || '').toLowerCase().includes('argentina');
  }

  buildHtmlMetadata(data) {
    return {
      websiteUrl: this.stringValue(data.business?.websiteUrl),
      country: this.stringValue(data.business?.country),
      contactEmail: this.stringValue(data.contact?.email),
      contactPageUrl: this.stringValue(data.contact?.pageUrl || data.cookies?.managementUrl)
    };
  }

  buildStructuredData(document) {
    return buildStructuredDataDocument(document);
  }
}

function buildStructuredDataDocument(document) {
  const metadata = document.metadata || {};
  const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
  if (!canonicalUrl) return null;

  const organization = {
    '@type': 'Organization',
    name: document.businessName
  };
  if (metadata.websiteUrl) organization.url = metadata.websiteUrl;
  if (metadata.contactEmail) organization.email = metadata.contactEmail;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `${document.title} - ${document.businessName}`,
        url: canonicalUrl,
        inLanguage: document.language === 'es' ? 'es' : 'en',
        dateModified: document.effectiveDate,
        lastReviewed: document.effectiveDate,
        about: {
          '@type': 'Thing',
          name: document.title
        },
        publisher: organization,
        accountablePerson: organization
      },
      organization
    ]
  };
}

function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

module.exports = CookiesPolicyGenerator;
