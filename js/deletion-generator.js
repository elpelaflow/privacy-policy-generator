class DataDeletionGenerator {
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
      title: language === 'es' ? 'Instrucciones para Eliminación de Datos' : 'Data Deletion Instructions',
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
      deletion: {
        requestChannel: this.stringValue(input.deletion?.requestChannel, 'email'),
        requestEmail: this.stringValue(input.deletion?.requestEmail || input.contact?.email),
        requestUrl: this.stringValue(input.deletion?.requestUrl || input.contact?.pageUrl),
        identityRequirements: this.arrayValue(input.deletion?.identityRequirements),
        deletionScope: this.arrayValue(input.deletion?.deletionScope),
        retentionExceptions: this.arrayValue(input.deletion?.retentionExceptions),
        responseTime: this.stringValue(input.deletion?.responseTime),
        completionTime: this.stringValue(input.deletion?.completionTime),
        hasMetaConnection: Boolean(input.deletion?.hasMetaConnection),
        metaDisconnectInstructions: this.stringValue(input.deletion?.metaDisconnectInstructions),
        notes: this.arrayValue(input.deletion?.notes)
      },
      settings: {
        language: this.stringValue(input.settings?.language, 'es')
      }
    };

    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del negocio es obligatorio.',
          missingWebsite: 'La URL del servicio o sitio es obligatoria.',
          missingRequestChannel: 'Debe indicar cómo se solicita la eliminación de datos.',
          missingRequestContact: 'Debe indicar al menos un canal real para solicitar la eliminación de datos.',
          missingScope: 'Conviene indicar qué datos o recursos se eliminarán cuando el usuario haga el pedido.',
          missingTimeline: 'Conviene indicar en cuánto tiempo respondés y completás la eliminación.',
          missingMetaHint: 'Si la app se conecta con Meta, conviene explicar cómo revocar permisos o desvincular la cuenta.'
        }
      : {
          missingBusinessName: 'Business name is required.',
          missingWebsite: 'Service or website URL is required.',
          missingRequestChannel: 'You must specify how data deletion requests are submitted.',
          missingRequestContact: 'You must provide at least one real channel for submitting data deletion requests.',
          missingScope: 'You should specify what data or resources will be deleted when a user submits a request.',
          missingTimeline: 'You should specify how quickly you respond to and complete deletion requests.',
          missingMetaHint: 'If the app connects to Meta, you should explain how to revoke permissions or disconnect the account.'
        };

    const errors = [];
    const warnings = [];

    if (!data.business.name) errors.push(messages.missingBusinessName);
    if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
    if (!data.deletion.requestChannel) errors.push(messages.missingRequestChannel);
    if (!data.deletion.requestEmail && !data.deletion.requestUrl) errors.push(messages.missingRequestContact);
    if (data.deletion.deletionScope.length === 0) warnings.push(messages.missingScope);
    if (!data.deletion.responseTime || !data.deletion.completionTime) warnings.push(messages.missingTimeline);
    if (data.deletion.hasMetaConnection && !data.deletion.metaDisconnectInstructions) warnings.push(messages.missingMetaHint);

    return { data, errors, warnings };
  }

  buildSections(data) {
    return [
      this.section('overview', this.text('Overview', 'Resumen'), [
        this.interpolate(this.text(
          '{business_name} provides this page to explain how users may request deletion of personal data associated with the service available at {website}.',
          '{business_name} publica esta página para explicar cómo los usuarios pueden solicitar la eliminación de datos personales asociados al servicio disponible en {website}.'
        ), data)
      ]),
      this.section('request', this.text('How to Request Deletion', 'Cómo Solicitar la Eliminación'), [
        this.requestChannelText(data),
        this.identityText(data)
      ]),
      this.section('scope', this.text('What We Delete', 'Qué Eliminamos'), [
        this.scopeText(data),
        this.retentionText(data)
      ]),
      this.section('timing', this.text('Response and Completion Times', 'Tiempos de Respuesta y Ejecución'), [
        this.timingText(data)
      ]),
      ...(data.deletion.hasMetaConnection ? [
        this.section('meta', this.text('Meta / Facebook Connected Accounts', 'Cuentas Conectadas de Meta / Facebook'), [
          this.metaText(data)
        ])
      ] : []),
      this.section('contact', this.text('Contact Information', 'Información de Contacto'), [
        this.contactLines(data)
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

  requestChannelText(data) {
    const parts = [];
    if (data.deletion.requestEmail) {
      parts.push(this.text(
        `Users may request deletion by email at ${data.deletion.requestEmail}.`,
        `Los usuarios pueden solicitar la eliminación por email a ${data.deletion.requestEmail}.`
      ));
    }
    if (data.deletion.requestUrl) {
      parts.push(this.text(
        `Requests may also be submitted through ${data.deletion.requestUrl}.`,
        `Las solicitudes también pueden presentarse a través de ${data.deletion.requestUrl}.`
      ));
    }
    return parts.join(' ');
  }

  identityText(data) {
    if (data.deletion.identityRequirements.length === 0) {
      return this.text(
        'We may ask for enough information to verify that the request is made by the account holder or an authorized person before deleting data.',
        'Podemos solicitar información suficiente para verificar que el pedido sea realizado por el titular de la cuenta o una persona autorizada antes de eliminar datos.'
      );
    }
    return `${this.text('Please include the following details in the request:', 'Por favor incluya los siguientes datos en la solicitud:')}\n${this.listLines(data.deletion.identityRequirements)}`;
  }

  scopeText(data) {
    if (data.deletion.deletionScope.length === 0) {
      return this.text(
        'Upon valid request, we will review and delete personal data associated with the requesting user to the extent permitted by law and reasonably available in our systems.',
        'Ante un pedido válido, revisaremos y eliminaremos los datos personales asociados al usuario solicitante en la medida permitida por la ley y razonablemente disponible en nuestros sistemas.'
      );
    }
    return `${this.text('When a valid deletion request is confirmed, we will generally remove or anonymize the following data where applicable:', 'Cuando se confirma una solicitud válida de eliminación, en general eliminaremos o anonimizaremos los siguientes datos cuando corresponda:')}\n${this.listLines(data.deletion.deletionScope)}`;
  }

  retentionText(data) {
    if (data.deletion.retentionExceptions.length === 0) {
      return this.text(
        'Certain records may be retained where necessary to comply with legal obligations, resolve disputes, enforce agreements, or maintain security and fraud-prevention records.',
        'Determinados registros pueden conservarse cuando sea necesario para cumplir obligaciones legales, resolver disputas, hacer cumplir acuerdos o mantener registros de seguridad y prevención de fraude.'
      );
    }
    return `${this.text('Some data may be retained for limited purposes, including:', 'Algunos datos pueden conservarse con fines limitados, incluyendo:')}\n${this.listLines(data.deletion.retentionExceptions)}`;
  }

  timingText(data) {
    const response = data.deletion.responseTime
      ? this.text(`We generally acknowledge or respond to deletion requests within ${data.deletion.responseTime}.`, `En general acusamos recibo o respondemos las solicitudes de eliminación dentro de ${data.deletion.responseTime}.`)
      : this.text('We will respond to deletion requests within a reasonable time.', 'Responderemos las solicitudes de eliminación dentro de un plazo razonable.');
    const completion = data.deletion.completionTime
      ? this.text(`Where the request is valid and complete, deletion is generally completed within ${data.deletion.completionTime}, subject to technical or legal constraints.`, `Cuando la solicitud es válida y completa, la eliminación en general se completa dentro de ${data.deletion.completionTime}, sujeta a restricciones técnicas o legales.`)
      : this.text('Deletion completion time depends on technical and legal constraints.', 'El tiempo de ejecución de la eliminación depende de restricciones técnicas y legales.');
    return `${response} ${completion}`;
  }

  metaText(data) {
    if (data.deletion.metaDisconnectInstructions) {
      return data.deletion.metaDisconnectInstructions;
    }
    return this.text(
      'If the service is connected to a Meta or Facebook account, users may also revoke the app connection from their Meta/Facebook account settings. Revoking access does not automatically erase all historical records, so a deletion request should still be submitted through the contact channels listed above.',
      'Si el servicio está conectado a una cuenta de Meta o Facebook, los usuarios también pueden revocar la conexión de la app desde la configuración de su cuenta de Meta/Facebook. Revocar el acceso no elimina automáticamente todos los registros históricos, por lo que igualmente debe presentarse una solicitud de eliminación a través de los canales de contacto indicados arriba.'
    );
  }

  contactLines(data) {
    const lines = [];
    if (data.deletion.requestEmail || data.contact.email) lines.push(`- ${this.text('Email', 'Email')}: ${data.deletion.requestEmail || data.contact.email}`);
    if (data.deletion.requestUrl || data.contact.pageUrl) lines.push(`- ${this.text('Request page', 'Página de solicitud')}: ${data.deletion.requestUrl || data.contact.pageUrl}`);
    if (data.contact.phone) lines.push(`- ${this.text('Phone', 'Teléfono')}: ${data.contact.phone}`);
    if (data.business.address) lines.push(`- ${this.text('Postal address', 'Dirección postal')}: ${data.business.address}`);
    return lines.join('\n');
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
      '</head>',
      '<body>',
      `  <h1>${escape(document.title)} - ${escape(document.businessName)}</h1>`,
      `  <p><strong>${escape(this.text('Effective date', 'Fecha de vigencia'))}:</strong> ${escape(document.effectiveDate)}</p>`,
      body,
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

  buildHtmlMetadata(data) {
    return {
      websiteUrl: this.stringValue(data.business?.websiteUrl),
      country: this.stringValue(data.business?.country),
      contactEmail: this.stringValue(data.contact?.email || data.deletion?.requestEmail),
      contactPageUrl: this.stringValue(data.contact?.pageUrl || data.deletion?.requestUrl)
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

module.exports = DataDeletionGenerator;
