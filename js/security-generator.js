class SecurityPolicyGenerator {
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
      title: language === 'es' ? 'Política de Seguridad' : 'Security Policy',
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
        type: this.stringValue(input.business?.type),
        websiteUrl: this.stringValue(input.business?.websiteUrl),
        country: this.stringValue(input.business?.country),
        address: this.stringValue(input.business?.address)
      },
      contact: {
        email: this.stringValue(input.contact?.email),
        phone: this.stringValue(input.contact?.phone),
        pageUrl: this.stringValue(input.contact?.pageUrl)
      },
      security: {
        reportChannel: this.stringValue(input.security?.reportChannel, 'email'),
        reportEmail: this.stringValue(input.security?.reportEmail || input.contact?.email),
        reportUrl: this.stringValue(input.security?.reportUrl || input.contact?.pageUrl),
        scope: this.arrayValue(input.security?.scope),
        safeHarborOffered: this.booleanValue(input.security?.safeHarborOffered, true),
        automatedTestingAllowed: this.booleanValue(input.security?.automatedTestingAllowed, false),
        denialOfServiceTestingAllowed: this.booleanValue(input.security?.denialOfServiceTestingAllowed, false),
        socialEngineeringAllowed: this.booleanValue(input.security?.socialEngineeringAllowed, false),
        acknowledgementTime: this.stringValue(input.security?.acknowledgementTime),
        statusUpdateTime: this.stringValue(input.security?.statusUpdateTime),
        disclosurePreference: this.stringValue(input.security?.disclosurePreference, 'coordinated'),
        bugBountyOffered: this.booleanValue(input.security?.bugBountyOffered, false),
        bugBountyNotes: this.stringValue(input.security?.bugBountyNotes),
        reportRequirements: this.arrayValue(input.security?.reportRequirements),
        remediationGuidance: this.stringValue(input.security?.remediationGuidance),
        securityPracticesSummary: this.stringValue(input.security?.securityPracticesSummary),
        notes: this.arrayValue(input.security?.notes)
      },
      settings: {
        language: this.stringValue(input.settings?.language, 'es')
      }
    };

    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del negocio es obligatorio.',
          missingWebsite: 'La URL del sitio o aplicación es obligatoria.',
          missingReportContact: 'Debe indicar al menos un canal real para recibir reportes de seguridad.',
          missingScope: 'Conviene indicar el alcance de la política de seguridad o divulgación de vulnerabilidades.',
          missingAcknowledgement: 'Conviene indicar en cuánto tiempo se acusará recibo de un reporte válido.',
          missingStatusUpdate: 'Conviene indicar cada cuánto se compartirán actualizaciones sobre el estado del reporte.',
          missingRequirements: 'Conviene indicar qué información debe incluir un reporte de seguridad para facilitar el triage.',
          safeHarborWarning: 'Conviene incluir una cláusula de buena fe o safe harbor para reportes responsables.',
          bountyNeedsNotes: 'Si ofrecés bug bounty, conviene aclarar condiciones, elegibilidad o cómo se comunica.'
        }
      : {
          missingBusinessName: 'Business name is required.',
          missingWebsite: 'Website or app URL is required.',
          missingReportContact: 'You must provide at least one real channel for receiving security reports.',
          missingScope: 'You should specify the scope of the security or vulnerability disclosure policy.',
          missingAcknowledgement: 'You should state how quickly you acknowledge a valid report.',
          missingStatusUpdate: 'You should state how often you share status updates about a report.',
          missingRequirements: 'You should explain what information a security report should include to help triage.',
          safeHarborWarning: 'You should include a good-faith or safe-harbor clause for responsible reporting.',
          bountyNeedsNotes: 'If you offer a bug bounty, you should explain conditions, eligibility, or how that process is communicated.'
        };

    const errors = [];
    const warnings = [];

    if (!data.business.name) errors.push(messages.missingBusinessName);
    if (!data.business.websiteUrl) errors.push(messages.missingWebsite);

    const usesEmail = ['email', 'both'].includes(data.security.reportChannel);
    const usesUrl = ['form', 'both'].includes(data.security.reportChannel);
    if ((usesEmail && !data.security.reportEmail) || (usesUrl && !data.security.reportUrl)) {
      errors.push(messages.missingReportContact);
    }

    if (data.security.scope.length === 0) warnings.push(messages.missingScope);
    if (!data.security.acknowledgementTime) warnings.push(messages.missingAcknowledgement);
    if (!data.security.statusUpdateTime) warnings.push(messages.missingStatusUpdate);
    if (data.security.reportRequirements.length === 0) warnings.push(messages.missingRequirements);
    if (!data.security.safeHarborOffered) warnings.push(messages.safeHarborWarning);
    if (data.security.bugBountyOffered && !data.security.bugBountyNotes) warnings.push(messages.bountyNeedsNotes);

    return { data, errors, warnings };
  }

  buildSections(data) {
    const sections = [
      this.section('overview', this.text('Overview', 'Resumen'), [
        this.interpolate(this.text(
          '{business_name} publishes this security policy to explain how security researchers, users, and third parties may responsibly report vulnerabilities affecting {website}.',
          '{business_name} publica esta política de seguridad para explicar cómo investigadores, usuarios y terceros pueden reportar vulnerabilidades de forma responsable respecto de {website}.'
        ), data)
      ]),
      this.section('reporting', this.text('How to Report a Vulnerability', 'Cómo Reportar una Vulnerabilidad'), [
        this.reportingText(data)
      ]),
      this.section('scope', this.text('Scope', 'Alcance'), [
        this.scopeText(data)
      ]),
      this.section('testing', this.text('Testing Rules and Expectations', 'Reglas y Expectativas de Prueba'), [
        this.testingRulesText(data)
      ]),
      this.section('response', this.text('Acknowledgement and Response Times', 'Tiempos de Acuse y Respuesta'), [
        this.responseTimesText(data)
      ]),
      this.section('disclosure', this.text('Disclosure, Remediation, and Recognition', 'Divulgación, Remediación y Reconocimiento'), [
        this.disclosureText(data)
      ])
    ];

    if (data.security.securityPracticesSummary) {
      sections.push(this.section('practices', this.text('Security Practices Summary', 'Resumen de Prácticas de Seguridad'), [
        data.security.securityPracticesSummary
      ]));
    }

    sections.push(this.section('contact', this.text('Contact Information', 'Información de Contacto'), [
      this.contactText(data)
    ]));

    return sections;
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

  reportingText(data) {
    const parts = [];
    if (data.security.reportEmail) {
      parts.push(this.text(
        `Please report suspected vulnerabilities by email to ${data.security.reportEmail}.`,
        `Por favor reportá vulnerabilidades sospechadas por email a ${data.security.reportEmail}.`
      ));
    }
    if (data.security.reportUrl) {
      parts.push(this.text(
        `Reports may also be submitted through ${data.security.reportUrl}.`,
        `Los reportes también pueden presentarse a través de ${data.security.reportUrl}.`
      ));
    }
    if (data.security.reportRequirements.length > 0) {
      parts.push(`${this.text('To help us triage quickly, include:', 'Para facilitar el triage, incluí:')}\n${this.listLines(data.security.reportRequirements)}`);
    }
    return parts.join(' ');
  }

  scopeText(data) {
    if (data.security.scope.length === 0) {
      return this.text(
        'This policy applies to security issues that may affect the public service, supporting infrastructure, and related user-facing components operated by the business.',
        'Esta política aplica a problemas de seguridad que puedan afectar al servicio público, la infraestructura de soporte y los componentes relacionados operados por el negocio.'
      );
    }
    return `${this.text('This policy is intended for the following assets or surfaces:', 'Esta política está pensada para los siguientes activos o superficies:')}\n${this.listLines(data.security.scope.map((value) => this.scopeLabel(value)))}`;
  }

  testingRulesText(data) {
    const lines = [
      this.text(
        'Please act in good faith, avoid privacy violations, service disruption, data destruction, or any action that could harm users or systems.',
        'Actuá de buena fe y evitá violaciones de privacidad, interrupciones del servicio, destrucción de datos o cualquier acción que pueda dañar a usuarios o sistemas.'
      ),
      data.security.safeHarborOffered
        ? this.text(
          'When you follow this policy in good faith, we intend to treat your research as authorized and will not pursue action solely for testing conducted within this policy’s scope.',
          'Cuando sigas esta política de buena fe, nuestra intención es tratar tu investigación como autorizada y no impulsar acciones únicamente por pruebas realizadas dentro del alcance de esta política.'
        )
        : '',
      this.text(
        `Automated testing is ${data.security.automatedTestingAllowed ? 'allowed when it remains low-volume and does not degrade service' : 'not allowed unless we give prior written permission'}.`,
        `Las pruebas automatizadas ${data.security.automatedTestingAllowed ? 'están permitidas siempre que sean de bajo volumen y no degraden el servicio' : 'no están permitidas salvo autorización previa y por escrito'}.`
      ),
      this.text(
        `Denial-of-service or load testing is ${data.security.denialOfServiceTestingAllowed ? 'allowed only in a coordinated manner and with prior approval' : 'not allowed under this policy'}.`,
        `Las pruebas de denegación de servicio o carga ${data.security.denialOfServiceTestingAllowed ? 'sólo están permitidas de forma coordinada y con aprobación previa' : 'no están permitidas bajo esta política'}.`
      ),
      this.text(
        `Social engineering, phishing, or physical attacks are ${data.security.socialEngineeringAllowed ? 'only allowed if explicitly coordinated and approved in advance' : 'not allowed under this policy'}.`,
        `La ingeniería social, el phishing o los ataques físicos ${data.security.socialEngineeringAllowed ? 'sólo están permitidos si fueron coordinados y aprobados explícitamente de antemano' : 'no están permitidos bajo esta política'}.`
      )
    ].filter(Boolean);
    return lines.join(' ');
  }

  responseTimesText(data) {
    const parts = [];
    if (data.security.acknowledgementTime) {
      parts.push(this.text(
        `We aim to acknowledge valid reports within ${data.security.acknowledgementTime}.`,
        `Buscamos acusar recibo de reportes válidos dentro de ${data.security.acknowledgementTime}.`
      ));
    }
    if (data.security.statusUpdateTime) {
      parts.push(this.text(
        `We aim to provide meaningful status updates within ${data.security.statusUpdateTime}, depending on severity and complexity.`,
        `Buscamos compartir actualizaciones relevantes dentro de ${data.security.statusUpdateTime}, según gravedad y complejidad.`
      ));
    }
    if (data.security.remediationGuidance) {
      parts.push(data.security.remediationGuidance);
    }
    return parts.join(' ');
  }

  disclosureText(data) {
    const preference = data.security.disclosurePreference === 'silent_fix'
      ? this.text(
        'We prefer to remediate issues before any public disclosure and may choose not to publish individual advisories for every issue.',
        'Preferimos remediar los problemas antes de cualquier divulgación pública y podemos optar por no publicar avisos individuales para cada caso.'
      )
      : data.security.disclosurePreference === 'researcher_choice'
        ? this.text(
          'We expect coordinated communication, but final public disclosure timing may be discussed case by case with the reporting party.',
          'Esperamos una comunicación coordinada, pero el momento de la divulgación pública puede acordarse caso por caso con la persona reportante.'
        )
        : this.text(
          'We prefer coordinated disclosure and ask reporters to avoid public disclosure until we have had a reasonable opportunity to investigate and mitigate the issue.',
          'Preferimos la divulgación coordinada y pedimos que se evite la divulgación pública hasta que tengamos una oportunidad razonable de investigar y mitigar el problema.'
        );

    const bounty = data.security.bugBountyOffered
      ? ` ${data.security.bugBountyNotes || this.text('A bug bounty or reward process may exist, but eligibility, amount, and payment terms are determined case by case.', 'Puede existir un proceso de bug bounty o recompensas, pero la elegibilidad, el monto y las condiciones de pago se determinan caso por caso.')}`
      : ` ${this.text('This policy does not by itself guarantee payment, compensation, or public recognition for every report.', 'Esta política no garantiza por sí sola pago, compensación ni reconocimiento público para cada reporte.')}`;

    return `${preference}${bounty}`;
  }

  contactText(data) {
    const parts = [];
    if (data.security.reportEmail) parts.push(this.text(`Primary security email: ${data.security.reportEmail}.`, `Email principal de seguridad: ${data.security.reportEmail}.`));
    if (data.security.reportUrl) parts.push(this.text(`Security reporting page: ${data.security.reportUrl}.`, `Página para reportes de seguridad: ${data.security.reportUrl}.`));
    if (data.contact.phone) parts.push(this.text(`Phone: ${data.contact.phone}.`, `Teléfono: ${data.contact.phone}.`));
    if (data.business.address) parts.push(this.text(`Postal address: ${data.business.address}.`, `Dirección postal: ${data.business.address}.`));
    return parts.join(' ');
  }

  listLines(items) {
    return items.map((item) => `- ${item}`).join('\n');
  }

  scopeLabel(value) {
    const labels = {
      web_application: this.text('web application', 'aplicación web'),
      api: this.text('API or developer endpoints', 'API o endpoints para desarrolladores'),
      mobile_app: this.text('mobile app', 'aplicación móvil'),
      infrastructure: this.text('infrastructure or hosting components', 'infraestructura o componentes de hosting'),
      integrations: this.text('third-party integrations and connected services', 'integraciones con terceros y servicios conectados'),
      content: this.text('security-sensitive content, docs, or static assets', 'contenido sensible para seguridad, documentación o assets estáticos')
    };
    return labels[value] || value;
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
      const paragraphs = section.paragraphs.map((paragraph) => `<p>${escape(paragraph).replaceAll('\n', '<br>')}</p>`).join('\n');
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
      '  <meta name="legal-document-type" content="security">',
      '</head>',
      '<body>',
      `  <h1>${escape(document.title)} - ${escape(document.businessName)}</h1>`,
      `  <p><strong>${escape(this.text('Effective date', 'Fecha de vigencia'))}:</strong> ${escape(document.effectiveDate)}</p>`,
      body,
      '</body>',
      '</html>'
    ].join('\n');
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

  booleanValue(value, fallback = false) {
    if (typeof value === 'boolean') return value;
    if (value == null) return fallback;
    return Boolean(value);
  }

  buildHtmlMetadata(data) {
    return {
      websiteUrl: this.stringValue(data.business?.websiteUrl),
      country: this.stringValue(data.business?.country),
      contactEmail: this.stringValue(data.security?.reportEmail || data.contact?.email),
      contactPageUrl: this.stringValue(data.security?.reportUrl || data.contact?.pageUrl)
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

module.exports = SecurityPolicyGenerator;
