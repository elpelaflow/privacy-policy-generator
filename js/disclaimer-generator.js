class DisclaimerGenerator {
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
      title: language === 'es' ? 'Descargo de Responsabilidad' : 'Disclaimer',
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
      disclaimer: {
        categories: this.arrayValue(input.disclaimer?.categories),
        audienceDescription: this.stringValue(input.disclaimer?.audienceDescription),
        professionalAdviceChannel: this.stringValue(input.disclaimer?.professionalAdviceChannel),
        externalLinksPolicy: this.stringValue(input.disclaimer?.externalLinksPolicy),
        affiliateDisclosure: this.stringValue(input.disclaimer?.affiliateDisclosure),
        reviewMethodology: this.stringValue(input.disclaimer?.reviewMethodology),
        customRiskStatement: this.stringValue(input.disclaimer?.customRiskStatement),
        notes: this.arrayValue(input.disclaimer?.notes)
      },
      settings: {
        language: this.stringValue(input.settings?.language, 'es')
      }
    };

    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del negocio es obligatorio.',
          missingWebsite: 'La URL del sitio o aplicación es obligatoria.',
          missingCategories: 'Conviene seleccionar al menos un tipo de disclaimer.',
          medicalNeedsAdvice: 'Si incluís información médica o de fitness, conviene aclarar que no reemplaza asesoramiento profesional.',
          linksNeedPolicy: 'Si incluís disclaimer por enlaces externos, conviene explicar brevemente que no controlás ni garantizás sitios de terceros.',
          reviewsNeedMethodology: 'Si incluís reseñas de productos, conviene explicar cómo se hacen o si puede haber compensación, afiliación o sesgo comercial.'
        }
      : {
          missingBusinessName: 'Business name is required.',
          missingWebsite: 'Website or app URL is required.',
          missingCategories: 'You should select at least one disclaimer type.',
          medicalNeedsAdvice: 'If you include medical or fitness information, you should clarify that it does not replace professional advice.',
          linksNeedPolicy: 'If you include an external-links disclaimer, you should briefly explain that you do not control or guarantee third-party sites.',
          reviewsNeedMethodology: 'If you include product reviews, you should explain how reviews are made and whether compensation, affiliate links, or commercial bias may exist.'
        };

    const errors = [];
    const warnings = [];
    if (!data.business.name) errors.push(messages.missingBusinessName);
    if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
    if (data.disclaimer.categories.length === 0) warnings.push(messages.missingCategories);
    if (data.disclaimer.categories.some((value) => ['medical', 'fitness'].includes(value)) && !data.disclaimer.professionalAdviceChannel) warnings.push(messages.medicalNeedsAdvice);
    if (data.disclaimer.categories.includes('external_links') && !data.disclaimer.externalLinksPolicy) warnings.push(messages.linksNeedPolicy);
    if (data.disclaimer.categories.includes('product_reviews') && !data.disclaimer.reviewMethodology && !data.disclaimer.affiliateDisclosure) warnings.push(messages.reviewsNeedMethodology);

    return { data, errors, warnings };
  }

  buildSections(data) {
    const sections = [
      this.section('overview', this.text('Overview', 'Resumen'), [
        this.interpolate(this.text(
          '{business_name} publishes this disclaimer for content, tools, and materials made available through {website}.',
          '{business_name} publica este descargo de responsabilidad para los contenidos, herramientas y materiales disponibles a través de {website}.'
        ), data)
      ])
    ];

    const categorySections = data.disclaimer.categories.map((category) => this.categorySection(category, data)).filter(Boolean);
    sections.push(...categorySections);
    sections.push(this.section('contact', this.text('Contact Information', 'Información de Contacto'), [
      this.contactText(data)
    ]));
    return sections;
  }

  categorySection(category, data) {
    const map = {
      medical: {
        id: 'medical',
        title: this.text('Medical Information Disclaimer', 'Disclaimer sobre Información Médica'),
        paragraph: this.text(
          'Content provided through the service is for general informational purposes only and does not constitute medical advice, diagnosis, or treatment. Users should consult a qualified medical professional before acting on any health-related information.',
          'El contenido ofrecido a través del servicio tiene fines únicamente informativos y no constituye consejo médico, diagnóstico ni tratamiento. Los usuarios deben consultar a un profesional de la salud calificado antes de actuar sobre información relacionada con la salud.'
        )
      },
      fitness: {
        id: 'fitness',
        title: this.text('Fitness Information Disclaimer', 'Disclaimer sobre Información de Fitness'),
        paragraph: this.text(
          'Fitness, exercise, or wellness content is provided for general educational purposes only. Physical activity involves risk, and users should evaluate their own condition and seek professional guidance where appropriate before beginning or changing any routine.',
          'El contenido de fitness, ejercicio o bienestar se ofrece únicamente con fines educativos generales. La actividad física implica riesgos, y los usuarios deben evaluar su propia condición y buscar orientación profesional cuando corresponda antes de iniciar o modificar una rutina.'
        )
      },
      errors_omissions: {
        id: 'errors',
        title: this.text('Errors and Omissions Disclaimer', 'Disclaimer sobre Errores y Omisiones'),
        paragraph: this.text(
          'We aim to keep content accurate and current, but errors, omissions, delays, or outdated information may exist. The business does not guarantee that all information will always be complete, current, or error-free.',
          'Buscamos mantener el contenido preciso y actualizado, pero pueden existir errores, omisiones, demoras o información desactualizada. El negocio no garantiza que toda la información sea siempre completa, vigente o libre de errores.'
        )
      },
      external_links: {
        id: 'links',
        title: this.text('External Links Disclaimer', 'Disclaimer sobre Enlaces Externos'),
        paragraph: data.disclaimer.externalLinksPolicy || this.text(
          'The service may contain links to third-party websites, products, or services. We do not control and do not necessarily endorse those external resources, and we are not responsible for their content, practices, availability, or policies.',
          'El servicio puede contener enlaces a sitios web, productos o servicios de terceros. No controlamos ni necesariamente respaldamos esos recursos externos, y no somos responsables por su contenido, prácticas, disponibilidad o políticas.'
        )
      },
      views_expressed: {
        id: 'views',
        title: this.text('Views Expressed Disclaimer', 'Disclaimer sobre Opiniones Expresadas'),
        paragraph: this.text(
          'Views, opinions, or commentary expressed on the service belong to the relevant author or contributor and do not necessarily reflect official positions of clients, employers, partners, or every participant in the project.',
          'Las opiniones, comentarios o valoraciones expresadas en el servicio pertenecen al autor o colaborador correspondiente y no necesariamente reflejan posiciones oficiales de clientes, empleadores, socios o de todos los participantes del proyecto.'
        )
      },
      own_risk: {
        id: 'risk',
        title: this.text('Use at Your Own Risk Disclaimer', 'Disclaimer de Uso bajo tu Propio Riesgo'),
        paragraph: data.disclaimer.customRiskStatement || this.text(
          'Use of the service, tools, examples, and materials is at the user’s own risk. The business is not responsible for losses, damages, or outcomes arising from reliance on the content except where liability cannot legally be excluded.',
          'El uso del servicio, las herramientas, los ejemplos y los materiales corre por cuenta y riesgo del usuario. El negocio no es responsable por pérdidas, daños o resultados derivados de la confianza depositada en el contenido, salvo cuando la responsabilidad no pueda excluirse legalmente.'
        )
      },
      product_reviews: {
        id: 'reviews',
        title: this.text('Product Reviews Disclaimer', 'Disclaimer sobre Reseñas de Productos'),
        paragraph: [
          this.text(
            'Reviews, ratings, or product commentary reflect our opinion, testing, or editorial judgment at the time of publication and may not reflect every user’s experience.',
            'Las reseñas, calificaciones o comentarios sobre productos reflejan nuestra opinión, pruebas o criterio editorial al momento de su publicación y pueden no reflejar la experiencia de todos los usuarios.'
          ),
          data.disclaimer.reviewMethodology,
          data.disclaimer.affiliateDisclosure
        ].filter(Boolean).join(' ')
      }
    };

    const section = map[category];
    if (!section) return null;

    const extra = data.disclaimer.categories.some((value) => ['medical', 'fitness'].includes(value)) && data.disclaimer.professionalAdviceChannel
      ? ` ${data.disclaimer.professionalAdviceChannel}`
      : '';

    return this.section(section.id, section.title, [section.paragraph + extra]);
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

  contactText(data) {
    const parts = [];
    if (data.contact.email) parts.push(this.text(`Questions may be sent to ${data.contact.email}.`, `Las consultas pueden enviarse a ${data.contact.email}.`));
    if (data.contact.pageUrl) parts.push(this.text(`Additional contact information may be available at ${data.contact.pageUrl}.`, `Puede haber información adicional de contacto en ${data.contact.pageUrl}.`));
    if (data.contact.phone) parts.push(this.text(`Phone: ${data.contact.phone}.`, `Teléfono: ${data.contact.phone}.`));
    if (data.business.address) parts.push(this.text(`Postal address: ${data.business.address}.`, `Dirección postal: ${data.business.address}.`));
    return parts.join(' ');
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
      '  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>',
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
      contactEmail: this.stringValue(data.contact?.email),
      contactPageUrl: this.stringValue(data.contact?.pageUrl)
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

module.exports = DisclaimerGenerator;
