/**
 * Privacy Policy Generator
 * Structured-rule generator with validation, explainability, and CLI/browser support.
 */

class PrivacyPolicyGenerator {
  constructor() {
    this.templateData = {};
    this.ready = this.loadTemplateData();
  }

  async loadTemplateData() {
    if (this.templateData.en && this.templateData.es) {
      return this.templateData;
    }

    const [english, spanish] = await Promise.all([
      this.readJson('policy-sections.json'),
      this.readJson('policy-sections.es.json')
    ]);

    this.templateData = {
      en: english,
      es: spanish
    };
    return this.templateData;
  }

  async readJson(filename) {
    const fs = require('node:fs/promises');
    const path = require('node:path');
    const filePath = path.join(__dirname, '..', 'data', filename);
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  }

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
    const result = await this.buildPolicy(input);
    return {
      validation: {
        ok: result.errors.length === 0,
        errors: result.errors,
        warnings: result.warnings
      },
      decisionLog: result.decisionLog,
      includedSections: result.policy.sections.map((section) => section.title)
    };
  }

  async generate(input) {
    const result = await this.buildPolicy(input);

    if (result.errors.length > 0) {
      throw new Error(result.errors.join(' | '));
    }

    return {
      html: this.formatAsHTML(result.policy),
      markdown: this.formatAsMarkdown(result.policy),
      text: this.formatAsText(result.policy),
      warnings: result.warnings,
      decisionLog: result.decisionLog
    };
  }

  async buildPolicy(input) {
    await this.ready;

    const normalized = this.normalizeInput(input);
    const language = normalized.data.settings.language || 'en';
    const template = this.templateData[language] || this.templateData.en;
    this.currentLanguage = language;
    const policy = {
      businessName: normalized.data.business.name,
      effectiveDate: new Date().toISOString().slice(0, 10),
      warnings: normalized.warnings,
      sections: [],
      language
    };
    const decisionLog = [];

    if (normalized.errors.length === 0) {
      for (const sectionDefinition of template.sections) {
        const sectionResult = this.resolveSection(sectionDefinition, normalized.data, decisionLog);
        if (sectionResult) {
          policy.sections.push(sectionResult);
        }
      }
    }

    return {
      errors: normalized.errors,
      warnings: normalized.warnings,
      decisionLog,
      policy
    };
  }

  normalizeInput(input) {
    const raw = this.isCanonicalInput(input) ? input : this.fromLegacyInput(input);
    const data = {
      business: {
        name: this.stringValue(raw.business?.name),
        type: this.stringValue(raw.business?.type),
        websiteUrl: this.stringValue(raw.business?.websiteUrl),
        country: this.stringValue(raw.business?.country, 'United States'),
        address: this.stringValue(raw.business?.address)
      },
      contact: {
        email: this.stringValue(raw.contact?.email),
        phone: this.stringValue(raw.contact?.phone),
        pageUrl: this.stringValue(raw.contact?.pageUrl)
      },
      operations: {
        primaryJurisdiction: this.stringValue(raw.operations?.primaryJurisdiction),
        sellRegions: this.arrayValue(raw.operations?.sellRegions),
        childrenAudience: Boolean(raw.operations?.childrenAudience)
      },
      dataPractices: {
        collectedData: this.arrayValue(raw.dataPractices?.collectedData),
        thirdParties: this.arrayValue(raw.dataPractices?.thirdParties),
        legalBases: this.arrayValue(raw.dataPractices?.legalBases)
      },
      compliance: {
        requestedFrameworks: this.arrayValue(raw.compliance?.requestedFrameworks)
      },
      settings: {
        language: this.stringValue(raw.settings?.language, 'en')
      },
      customizations: {
        manualDisclosures: this.arrayValue(raw.customizations?.manualDisclosures)
      }
    };

    const errors = [];
    const warnings = [];
    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del negocio es obligatorio.',
          missingBusinessType: 'El tipo de negocio es obligatorio.',
          missingJurisdiction: 'La jurisdicción principal es obligatoria.',
          missingContact: 'No se proporcionó un medio de contacto de privacidad. La sección de contacto quedará incompleta.',
          missingWebsite: 'No se proporcionó una URL del sitio. La política usará una referencia genérica al sitio web.',
          coppaWarning: 'Se seleccionó COPPA pero el servicio no figura como dirigido a menores. Revise cuidadosamente la sección de privacidad infantil.',
          paymentConflict: 'Seleccione procesadores múltiples de pago o sólo PayPal, pero no ambas opciones.',
          globalWarning: 'Se seleccionó una jurisdicción global o personalizada. Revise manualmente el lenguaje de derechos regionales antes de publicar.',
          ecommercePaymentRequired: 'Para e-commerce debe indicarse al menos un procesador de pago o una modalidad de pago externa.',
          ecommerceShippingRequired: 'Para e-commerce debe indicarse al menos una categoría de logística o envíos.',
          ecommerceFiscalRequired: 'Para e-commerce debe indicarse si se tratan datos fiscales, de facturación o identificación comercial.',
          advertisingCookiesWarning: 'Seleccionó publicidad sin cookies. Revise si utiliza píxeles, remarketing o cookies publicitarias.',
          shortAddressWarning: 'La dirección cargada parece incompleta. Agregue calle, número, ciudad y país o jurisdicción relevante.',
          argentinaSpanishWarning: 'Para un negocio en Argentina conviene publicar la política también en español.',
          argentinaRightsWarning: 'Si opera en Argentina, revise que la política incluya derechos locales, AAIP y tratamiento de datos conforme a la Ley 25.326.',
          argentinaRightsChannelWarning: 'Para privacidad en Argentina conviene informar un canal claro para ejercer derechos, idealmente por email o mediante una página de contacto.',
          argentinaTransferWarning: 'Si opera en Argentina y utiliza proveedores globales, revise que la política describa transferencias internacionales y salvaguardas aplicables.',
          argentinaThirdPartiesWarning: 'Si opera en Argentina, conviene describir con mayor claridad categorías de encargados, proveedores y terceros que intervienen en el tratamiento.',
          argentinaConsumerLanguageWarning: 'Para un negocio argentino orientado a consumidores, conviene evitar una política demasiado global o genérica y usar lenguaje local más claro.',
          missingLegalBasisWarning: 'No se indicaron bases legales de tratamiento. Revise contrato, consentimiento, obligación legal o interés legítimo según corresponda.'
        }
      : {
          missingBusinessName: 'Business name is required.',
          missingBusinessType: 'Business type is required.',
          missingJurisdiction: 'Primary jurisdiction is required.',
          missingContact: 'No privacy contact method was provided. Contact section will be incomplete.',
          missingWebsite: 'No website URL was provided. The generated policy uses a placeholder website label.',
          coppaWarning: 'COPPA was selected but the service is not marked as directed to children. Review the children privacy section carefully.',
          paymentConflict: 'Select either multiple payment processors or PayPal-only payments, not both.',
          globalWarning: 'Global or custom jurisdiction selected. Review regional rights language manually before publishing.',
          ecommercePaymentRequired: 'E-commerce requires at least one payment processor or external payment flow.',
          ecommerceShippingRequired: 'E-commerce requires at least one shipping or logistics category.',
          ecommerceFiscalRequired: 'E-commerce requires a fiscal, invoicing, or commercial identity data category.',
          advertisingCookiesWarning: 'Advertising was selected without cookies. Review whether you use pixels, remarketing, or advertising cookies.',
          shortAddressWarning: 'The address provided looks incomplete. Add street, number, city, and country or relevant jurisdiction.',
          argentinaSpanishWarning: 'For an Argentina-based business, publishing the policy in Spanish is strongly recommended.',
          argentinaRightsWarning: 'If the business operates in Argentina, review local rights, AAIP references, and Law 25.326 requirements before publishing.',
          argentinaRightsChannelWarning: 'For Argentina privacy compliance, provide a clear channel for rights requests, ideally by email or a contact page.',
          argentinaTransferWarning: 'If the business operates in Argentina and uses global providers, review whether international transfers and safeguards are clearly described.',
          argentinaThirdPartiesWarning: 'If the business operates in Argentina, describe processors, vendors, or third-party categories more clearly.',
          argentinaConsumerLanguageWarning: 'For an Argentina-facing consumer business, avoid a policy that feels overly global or generic and prefer clearer local wording.',
          missingLegalBasisWarning: 'No legal bases were selected. Review contract, consent, legal obligation, or legitimate interests as appropriate.'
        };

    if (!data.business.name) {
      errors.push(messages.missingBusinessName);
    }

    if (!data.business.type) {
      errors.push(messages.missingBusinessType);
    }

    if (!data.operations.primaryJurisdiction) {
      errors.push(messages.missingJurisdiction);
    }

    if (!data.contact.email && !data.contact.phone && !data.contact.pageUrl && !data.business.address) {
      warnings.push(messages.missingContact);
    }

    if (!data.business.websiteUrl) {
      warnings.push(messages.missingWebsite);
    }

    if (data.business.address && data.business.address.trim().length < 12) {
      warnings.push(messages.shortAddressWarning);
    }

    if (data.operations.primaryJurisdiction === 'global') {
      warnings.push(messages.globalWarning);
    }

    if (data.operations.primaryJurisdiction === 'ar' || data.business.country.toLowerCase().includes('argentina')) {
      warnings.push(messages.argentinaRightsWarning);
      if (data.settings.language !== 'es') {
        warnings.push(messages.argentinaSpanishWarning);
      }
      if (!data.contact.email && !data.contact.pageUrl) {
        warnings.push(messages.argentinaRightsChannelWarning);
      }
      if (data.dataPractices.thirdParties.some((value) => ['cloud', 'analytics', 'advertising', 'social', 'payment', 'email'].includes(value))) {
        warnings.push(messages.argentinaTransferWarning);
      }
      if (data.dataPractices.thirdParties.length === 0) {
        warnings.push(messages.argentinaThirdPartiesWarning);
      }
      if (data.business.type === 'ecommerce' && data.operations.primaryJurisdiction === 'global') {
        warnings.push(messages.argentinaConsumerLanguageWarning);
      }
    }

    if (data.compliance.requestedFrameworks.includes('coppa') && !data.operations.childrenAudience) {
      warnings.push(messages.coppaWarning);
    }

    if (data.dataPractices.thirdParties.includes('payment') && data.dataPractices.thirdParties.includes('paypal_only')) {
      errors.push(messages.paymentConflict);
    }

    if (data.dataPractices.thirdParties.includes('advertising') && !data.dataPractices.collectedData.includes('cookies')) {
      warnings.push(messages.advertisingCookiesWarning);
    }

    if (data.dataPractices.legalBases.length === 0) {
      warnings.push(messages.missingLegalBasisWarning);
    }

    if (data.business.type === 'ecommerce') {
      const paymentConfigured = data.dataPractices.thirdParties.includes('payment') || data.dataPractices.thirdParties.includes('paypal_only');
      const shippingConfigured = data.dataPractices.thirdParties.includes('shipping');
      const fiscalConfigured = data.dataPractices.collectedData.includes('tax') || data.dataPractices.collectedData.includes('identity');

      if (!paymentConfigured) {
        warnings.push(messages.ecommercePaymentRequired);
      }

      if (!shippingConfigured) {
        warnings.push(messages.ecommerceShippingRequired);
      }

      if (!fiscalConfigured) {
        warnings.push(messages.ecommerceFiscalRequired);
      }
    }

    return { data, errors, warnings };
  }

  isCanonicalInput(input) {
    return Boolean(input?.business || input?.operations || input?.dataPractices);
  }

  fromLegacyInput(input) {
    return {
      business: {
        name: input.businessName,
        type: input.businessType,
        websiteUrl: input.websiteUrl,
        country: input.country,
        address: input.businessAddress
      },
      contact: {
        email: input.contactEmail,
        phone: input.contactPhone,
        pageUrl: input.contactPage
      },
      operations: {
        primaryJurisdiction: input.jurisdiction,
        sellRegions: input.sellRegions,
        childrenAudience: Boolean(input.childrenAudience)
      },
      dataPractices: {
        collectedData: input.dataCollected,
        thirdParties: input.thirdParties,
        legalBases: input.legalBases
      },
      compliance: {
        requestedFrameworks: input.compliance
      },
      settings: {
        language: input.outputLanguage || input.language || 'en'
      },
      customizations: {
        manualDisclosures: input.manualDisclosures || input.customDisclosures
      }
    };
  }

  resolveSection(sectionDefinition, data, decisionLog) {
    const includeSection = this.shouldInclude(sectionDefinition.includeWhen, data, sectionDefinition.required === true);
    const sectionLog = {
      sectionId: sectionDefinition.id,
      title: sectionDefinition.title,
      included: includeSection,
      reason: includeSection ? 'rule matched or section required' : 'rule did not match'
    };
    decisionLog.push(sectionLog);

    if (!includeSection) {
      return null;
    }

    const paragraphs = [];
    const subsections = [];

    for (const line of sectionDefinition.content || []) {
      const renderedLine = this.renderLine(line, data);
      if (renderedLine) {
        paragraphs.push(renderedLine);
      }
    }

    for (const subsection of sectionDefinition.subsections || []) {
      const includeSubsection = this.shouldInclude(subsection.includeWhen, data, false);
      decisionLog.push({
        sectionId: subsection.id,
        title: subsection.title,
        included: includeSubsection,
        reason: includeSubsection ? 'rule matched' : 'rule did not match'
      });

      if (!includeSubsection) {
        continue;
      }

      const subsectionParagraphs = (subsection.content || [])
        .map((line) => this.renderLine(line, data))
        .filter(Boolean);

      if (subsectionParagraphs.length > 0) {
        subsections.push({
          title: subsection.title,
          paragraphs: subsectionParagraphs
        });
      }
    }

    if (paragraphs.length === 0 && subsections.length === 0) {
      return null;
    }

    return {
      title: this.cleanTitle(sectionDefinition.title),
      paragraphs,
      subsections: subsections.map((subsection) => ({
        ...subsection,
        title: this.cleanTitle(subsection.title)
      }))
    };
  }

  shouldInclude(rule, data, defaultValue) {
    if (!rule) {
      return defaultValue;
    }

    if (rule.allOf) {
      return rule.allOf.every((item) => this.shouldInclude(item, data, false));
    }

    if (rule.anyOf) {
      return rule.anyOf.some((item) => this.shouldInclude(item, data, false));
    }

    if (rule.noneOf) {
      return rule.noneOf.every((item) => !this.shouldInclude(item, data, false));
    }

    const fieldValue = this.getByPath(data, rule.field);

    if (Object.prototype.hasOwnProperty.call(rule, 'equals')) {
      return fieldValue === rule.equals;
    }

    if (Object.prototype.hasOwnProperty.call(rule, 'notEquals')) {
      return fieldValue !== rule.notEquals;
    }

    if (Object.prototype.hasOwnProperty.call(rule, 'includes')) {
      return Array.isArray(fieldValue) && fieldValue.includes(rule.includes);
    }

    if (Object.prototype.hasOwnProperty.call(rule, 'notIncludes')) {
      return Array.isArray(fieldValue) && !fieldValue.includes(rule.notIncludes);
    }

    if (Object.prototype.hasOwnProperty.call(rule, 'exists')) {
      const hasValue = Array.isArray(fieldValue)
        ? fieldValue.length > 0
        : fieldValue !== undefined && fieldValue !== '';
      return rule.exists ? hasValue : !hasValue;
    }

    if (Object.prototype.hasOwnProperty.call(rule, 'isTrue')) {
      return Boolean(fieldValue) === Boolean(rule.isTrue);
    }

    if (Object.prototype.hasOwnProperty.call(rule, 'isFalse')) {
      return Boolean(fieldValue) === !Boolean(rule.isFalse);
    }

    return defaultValue;
  }

  renderLine(line, data) {
    const context = this.createTemplateContext(data);
    return line.replace(/\{([^}]+)\}/g, (_, token) => context[token] ?? '');
  }

  createTemplateContext(data) {
    return {
      business_name: data.business.name,
      service_type: this.getServiceTypeLabel(data.business.type),
      website_url_or_placeholder: data.business.websiteUrl || (this.currentLanguage === 'es'
        ? 'el sitio o servicio en línea asociado'
        : `${data.business.name || 'the business'} website`),
      country: data.business.country,
      contact_lines: this.buildContactLines(data.contact, data.business.address, data.settings.language),
      manual_disclosures_lines: this.buildManualDisclosureLines(data.customizations.manualDisclosures)
    };
  }

  buildContactLines(contact, address, language) {
    const lines = [];
    const labels = language === 'es'
      ? {
          email: 'Por email',
          page: 'A través de esta página',
          phone: 'Por teléfono',
          mail: 'Por correo postal',
          fallback: 'No se configuró todavía un canal directo de contacto. Agregue al menos un medio de contacto de privacidad antes de publicar esta política.'
        }
      : {
          email: 'By email',
          page: 'Through this page',
          phone: 'By phone',
          mail: 'By mail',
          fallback: 'No direct contact method has been configured yet. Add at least one privacy contact channel before publishing this policy.'
        };

    if (contact.email) {
      lines.push(`- ${labels.email}: ${contact.email}`);
    }
    if (contact.pageUrl) {
      lines.push(`- ${labels.page}: ${contact.pageUrl}`);
    }
    if (contact.phone) {
      lines.push(`- ${labels.phone}: ${contact.phone}`);
    }
    if (address) {
      lines.push(`- ${labels.mail}: ${address}`);
    }

    if (lines.length === 0) {
      lines.push(`- ${labels.fallback}`);
    }

    return lines.join('\n');
  }

  buildManualDisclosureLines(disclosures) {
    if (!Array.isArray(disclosures) || disclosures.length === 0) {
      return '';
    }

    return disclosures
      .filter(Boolean)
      .map((entry) => `- ${entry}`)
      .join('\n');
  }

  getServiceTypeLabel(type) {
    const englishLabels = {
      ecommerce: 'website, online store, and related services',
      blog: 'content site, newsletter, and related services',
      saas: 'software service and related account features',
      mobile: 'mobile application and related services',
      nonprofit: 'nonprofit website, campaigns, and related services'
    };

    const spanishLabels = {
      ecommerce: 'sitio web, tienda online y servicios relacionados',
      blog: 'sitio de contenido, newsletter y servicios relacionados',
      saas: 'servicio de software y funciones relacionadas de cuenta',
      mobile: 'aplicación móvil y servicios relacionados',
      nonprofit: 'sitio de ONG, campañas y servicios relacionados'
    };

    return this.currentLanguage === 'es'
      ? (spanishLabels[type] || 'servicio en línea')
      : (englishLabels[type] || 'online service');
  }

  getByPath(object, path) {
    return path.split('.').reduce((value, segment) => {
      if (value === undefined || value === null) {
        return undefined;
      }
      return value[segment];
    }, object);
  }

  stringValue(value, fallback = '') {
    if (typeof value !== 'string') {
      return fallback;
    }

    const normalized = value.trim();
    if (!normalized || ['>', 'no hay', 'n/a', 'na', 'none', 'null'].includes(normalized.toLowerCase())) {
      return fallback;
    }

    return normalized;
  }

  arrayValue(value) {
    return Array.isArray(value) ? value.filter(Boolean) : [];
  }

  cleanTitle(title) {
    return title.replace(/^\d+(\.\d+)*\.?\s+/, '');
  }

  formatAsMarkdown(policy) {
    const labels = policy.language === 'es'
      ? { title: 'Política de Privacidad', effectiveDate: 'Fecha de vigencia' }
      : { title: 'Privacy Policy', effectiveDate: 'Effective Date' };
    let markdown = `# ${labels.title} - ${policy.businessName}\n\n`;
    markdown += `*${labels.effectiveDate}: ${policy.effectiveDate}*\n\n`;

    policy.sections.forEach((section, sectionIndex) => {
      markdown += `## ${sectionIndex + 1}. ${section.title}\n\n`;

      for (const paragraph of section.paragraphs) {
        markdown += `${paragraph}\n\n`;
      }

      section.subsections.forEach((subsection, subsectionIndex) => {
        markdown += `### ${sectionIndex + 1}.${subsectionIndex + 1} ${subsection.title}\n\n`;
        for (const paragraph of subsection.paragraphs) {
          markdown += `${paragraph}\n\n`;
        }
      });
    });

    return markdown.trim();
  }

  formatAsText(policy) {
    return this.formatAsMarkdown(policy)
      .replace(/^# /gm, '')
      .replace(/^## /gm, '')
      .replace(/^### /gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '');
  }

  formatAsHTML(policy) {
    const labels = policy.language === 'es'
      ? { title: 'Política de Privacidad', effectiveDate: 'Fecha de vigencia' }
      : { title: 'Privacy Policy', effectiveDate: 'Effective Date' };
    let html = `<!DOCTYPE html>
<html lang="${policy.language === 'es' ? 'es' : 'en'}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(labels.title)} - ${escapeHtml(policy.businessName)}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #222; max-width: 900px; margin: 0 auto; padding: 24px; }
    h1, h2, h3 { line-height: 1.2; }
    ul { padding-left: 24px; }
  </style>
</head>
<body>
  <h1>${escapeHtml(labels.title)} - ${escapeHtml(policy.businessName)}</h1>
  <p><em>${escapeHtml(labels.effectiveDate)}: ${escapeHtml(policy.effectiveDate)}</em></p>
  ${this.renderPolicyHtml(policy)}
</body></html>`;
    return html;
  }

  renderPolicyHtml(policy) {
    let html = '';

    policy.sections.forEach((section, sectionIndex) => {
      html += `<section><h2>${escapeHtml(`${sectionIndex + 1}. ${section.title}`)}</h2>`;
      for (const paragraph of section.paragraphs) {
        html += paragraphToHtml(paragraph);
      }
      section.subsections.forEach((subsection, subsectionIndex) => {
        html += `<h3>${escapeHtml(`${sectionIndex + 1}.${subsectionIndex + 1} ${subsection.title}`)}</h3>`;
        for (const paragraph of subsection.paragraphs) {
          html += paragraphToHtml(paragraph);
        }
      });
      html += '</section>';
    });

    return html;
  }
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function paragraphToHtml(paragraph) {
  if (paragraph.startsWith('- ')) {
    const items = paragraph
      .split('\n')
      .filter((line) => line.startsWith('- '))
      .map((line) => `<li>${escapeHtml(line.slice(2)).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</li>`)
      .join('');
    return `<ul>${items}</ul>`;
  }

  return `<p>${escapeHtml(paragraph).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')}</p>`;
}
module.exports = PrivacyPolicyGenerator;
