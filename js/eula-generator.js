class EulaGenerator {
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
      title: language === 'es' ? 'EULA / Contrato de Licencia de Usuario Final' : 'End User License Agreement (EULA)',
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
      eula: {
        productName: this.stringValue(input.eula?.productName),
        softwareType: this.stringValue(input.eula?.softwareType),
        licenseGrant: this.stringValue(input.eula?.licenseGrant),
        licenseScope: this.stringValue(input.eula?.licenseScope),
        allowsCommercialUse: this.booleanValue(input.eula?.allowsCommercialUse, false),
        transferable: this.booleanValue(input.eula?.transferable, false),
        installationLimit: this.stringValue(input.eula?.installationLimit),
        reverseEngineeringRestricted: this.booleanValue(input.eula?.reverseEngineeringRestricted, true),
        modificationRestricted: this.booleanValue(input.eula?.modificationRestricted, true),
        redistributionRestricted: this.booleanValue(input.eula?.redistributionRestricted, true),
        updatesProvided: this.booleanValue(input.eula?.updatesProvided, true),
        supportLevel: this.stringValue(input.eula?.supportLevel),
        thirdPartyComponents: this.booleanValue(input.eula?.thirdPartyComponents, false),
        openSourceNotice: this.stringValue(input.eula?.openSourceNotice),
        warrantyDisclaimer: this.stringValue(input.eula?.warrantyDisclaimer),
        liabilityLimit: this.stringValue(input.eula?.liabilityLimit),
        terminationTriggers: this.stringValue(input.eula?.terminationTriggers),
        governingLaw: this.stringValue(input.eula?.governingLaw),
        notes: this.arrayValue(input.eula?.notes)
      },
      settings: {
        language: this.stringValue(input.settings?.language, 'es')
      }
    };

    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del titular o licenciante es obligatorio.',
          missingWebsite: 'La URL principal del producto o del licenciante es obligatoria.',
          missingProductName: 'Debés indicar el nombre del software, app o producto licenciado.',
          missingSoftwareType: 'Conviene indicar qué tipo de software o distribución cubre este EULA.',
          missingLicenseGrant: 'Debés describir la licencia otorgada. Sin eso, el EULA no deja claro qué derecho de uso recibe el usuario.',
          missingLicenseScope: 'Conviene indicar si la licencia es personal, por cuenta, por asiento, interna o comercial. Esto evita un EULA demasiado ambiguo.',
          missingInstallationLimit: 'Conviene indicar el límite de instalación, cuenta, dispositivo o asiento cuando el licenciamiento no es totalmente abierto.',
          missingSupportLevel: 'Conviene aclarar si existe soporte, mantenimiento comercial, actualizaciones best effort o si el uso es as-is.',
          missingOpenSourceNotice: 'Si el producto incorpora componentes de terceros u open source, conviene aclararlo para no dar a entender que todo el stack se licencia igual.',
          missingWarrantyDisclaimer: 'Conviene incluir un disclaimer de garantías o explicar si el software se entrega "as is".',
          missingLiabilityLimit: 'Conviene resumir la limitación de responsabilidad para que el EULA no quede incompleto frente a daños indirectos, pérdida de datos o interrupciones.',
          missingTermination: 'Conviene indicar cuándo puede terminarse o revocarse la licencia.',
          missingGoverningLaw: 'Conviene indicar ley aplicable o foro principal para disputas vinculadas a la licencia.',
          contradictionNoUpdatesWithSupport: 'Marcaste que no se proveen updates, pero también seleccionaste un soporte o mantenimiento que normalmente supone cambios o releases. Revisá si realmente no hay actualizaciones cubiertas.',
          contradictionTransferableSeatLicense: 'Marcaste la licencia como transferible, pero también describiste un límite por asiento o cuenta. Conviene revisar si esa transferencia es real o si la licencia debería quedar como no transferible.',
          contradictionNoThirdPartyWithNotice: 'Completaste una nota sobre componentes de terceros u open source, pero también marcaste que no existen. Revisá cuál de las dos cosas refleja el producto real.'
        }
      : {
          missingBusinessName: 'Licensor or business name is required.',
          missingWebsite: 'Primary product or licensor website URL is required.',
          missingProductName: 'You must identify the licensed software, app, or product name.',
          missingSoftwareType: 'You should indicate what kind of software or distribution this EULA covers.',
          missingLicenseGrant: 'You must describe the license grant. Without it, the EULA does not clearly explain what usage rights the user receives.',
          missingLicenseScope: 'You should indicate whether the license is personal, account-based, seat-based, internal, or commercial. This helps avoid an overly vague EULA.',
          missingInstallationLimit: 'You should indicate device, account, seat, or installation limits when the license is not fully open-ended.',
          missingSupportLevel: 'You should clarify whether support, commercial maintenance, best-effort updates, or purely as-is use applies.',
          missingOpenSourceNotice: 'If the product includes third-party or open-source components, you should say so to avoid implying that the entire stack is licensed under identical terms.',
          missingWarrantyDisclaimer: 'You should include a warranty disclaimer or explain whether the software is provided "as is".',
          missingLiabilityLimit: 'You should summarize the limitation of liability so the EULA is not silent on indirect damages, data loss, or service interruption.',
          missingTermination: 'You should describe when the license may be terminated or revoked.',
          missingGoverningLaw: 'You should indicate the governing law or main dispute venue tied to the license.',
          contradictionNoUpdatesWithSupport: 'You marked that no updates are provided, but also selected a support level that normally implies releases or maintenance changes. Review whether updates are actually excluded.',
          contradictionTransferableSeatLicense: 'You marked the license as transferable, but also described a seat, account, or device-style limitation. Review whether transfer is truly allowed or whether the license should remain non-transferable.',
          contradictionNoThirdPartyWithNotice: 'You filled in a notice about third-party or open-source components, but also marked that none exist. Review which statement matches the real product.'
        };

    const errors = [];
    const warnings = [];

    if (!data.business.name) errors.push(messages.missingBusinessName);
    if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
    if (!data.eula.productName) errors.push(messages.missingProductName);
    if (!data.eula.softwareType) warnings.push(messages.missingSoftwareType);
    if (!data.eula.licenseGrant) errors.push(messages.missingLicenseGrant);
    if (!data.eula.licenseScope) warnings.push(messages.missingLicenseScope);
    if (!data.eula.installationLimit) warnings.push(messages.missingInstallationLimit);
    if (!data.eula.supportLevel) warnings.push(messages.missingSupportLevel);
    if (data.eula.thirdPartyComponents && !data.eula.openSourceNotice) warnings.push(messages.missingOpenSourceNotice);
    if (!data.eula.warrantyDisclaimer) warnings.push(messages.missingWarrantyDisclaimer);
    if (!data.eula.liabilityLimit) warnings.push(messages.missingLiabilityLimit);
    if (!data.eula.terminationTriggers) warnings.push(messages.missingTermination);
    if (!data.eula.governingLaw) warnings.push(messages.missingGoverningLaw);
    if (!data.eula.updatesProvided && ['best_effort', 'commercial_support'].includes(data.eula.supportLevel)) warnings.push(messages.contradictionNoUpdatesWithSupport);
    if (data.eula.transferable && ['single_device', 'per_seat', 'per_account'].includes(data.eula.licenseScope)) warnings.push(messages.contradictionTransferableSeatLicense);
    if (!data.eula.thirdPartyComponents && data.eula.openSourceNotice) warnings.push(messages.contradictionNoThirdPartyWithNotice);

    return { data, errors, warnings };
  }

  buildSections(data) {
    const sections = [
      this.section('overview', this.text('Overview', 'Resumen'), [
        this.interpolate(this.text(
          'This End User License Agreement governs access to and use of {product_name}, distributed or made available by {business_name} through {website}.',
          'Este Contrato de Licencia de Usuario Final regula el acceso y uso de {product_name}, distribuido o puesto a disposición por {business_name} a través de {website}.'
        ), data)
      ]),
      this.section('license-grant', this.text('License Grant', 'Licencia otorgada'), [
        this.licenseGrantText(data)
      ]),
      this.section('restrictions', this.text('Use Restrictions', 'Restricciones de uso'), [
        this.restrictionsText(data)
      ]),
      this.section('updates-support', this.text('Updates and Support', 'Actualizaciones y soporte'), [
        this.updatesSupportText(data)
      ]),
      this.section('third-party', this.text('Third-Party and Open-Source Components', 'Componentes de terceros y open source'), [
        this.thirdPartyText(data)
      ]),
      this.section('termination', this.text('Termination of the License', 'Terminación de la licencia'), [
        this.terminationText(data)
      ]),
      this.section('disclaimers', this.text('Warranty Disclaimer and Limitation of Liability', 'Descargo de garantías y limitación de responsabilidad'), [
        this.disclaimerText(data)
      ]),
      this.section('governing-law', this.text('Governing Law', 'Ley aplicable'), [
        this.governingLawText(data)
      ]),
      this.section('contact', this.text('Contact Information', 'Información de contacto'), [
        this.contactText(data)
      ])
    ];

    if (data.eula.notes.length > 0) {
      sections.splice(sections.length - 1, 0, this.section('additional-notes', this.text('Additional Notes', 'Notas adicionales'), data.eula.notes));
    }

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
      .replaceAll('{website}', data.business.websiteUrl || '')
      .replaceAll('{product_name}', data.eula.productName || this.text('the software', 'el software'));
  }

  licenseGrantText(data) {
    const parts = [
      this.interpolate(this.text(
        '{business_name} grants the end user a limited license to use {product_name} subject to this agreement and any applicable commercial or account-level restrictions.',
        '{business_name} otorga al usuario final una licencia limitada para usar {product_name}, sujeta a este acuerdo y a las restricciones comerciales o de cuenta que correspondan.'
      ), data)
    ];
    if (data.eula.licenseGrant) {
      parts.push(`${this.text('License language', 'Redacción de la licencia')}: ${this.sentence(data.eula.licenseGrant)}`);
    }
    if (data.eula.softwareType) {
      parts.push(`${this.text('Covered software type', 'Tipo de software cubierto')}: ${this.softwareTypeLabel(data.eula.softwareType)}.`);
    }
    if (data.eula.licenseScope) {
      parts.push(`${this.text('License scope', 'Alcance de la licencia')}: ${this.licenseScopeLabel(data.eula.licenseScope)}.`);
    }
    if (data.eula.installationLimit) {
      parts.push(`${this.text('Installation or seat limits', 'Límites de instalación o asientos')}: ${this.sentence(data.eula.installationLimit)}`);
    }
    parts.push(this.text(
      data.eula.allowsCommercialUse
        ? 'Commercial or business use is permitted only within the scope described by the service, subscription, or contract tier selected by the customer.'
        : 'Commercial or business use is not granted unless a separate commercial plan, contract, or written authorization expressly allows it.',
      data.eula.allowsCommercialUse
        ? 'El uso comercial o empresarial está permitido únicamente dentro del alcance previsto por el servicio, suscripción o nivel contractual contratado.'
        : 'No se concede uso comercial o empresarial salvo que exista un plan comercial, contrato o autorización escrita que lo permita de forma expresa.'
    ));
    parts.push(this.text(
      data.eula.transferable
        ? 'The license may be transferred only where that transfer is technically and contractually supported by the product or subscription model.'
        : 'The license is personal, limited, and non-transferable unless a separate written authorization states otherwise.',
      data.eula.transferable
        ? 'La licencia sólo podrá transferirse cuando esa transferencia esté admitida técnica y contractualmente por el producto o la suscripción.'
        : 'La licencia es personal, limitada e intransferible salvo autorización escrita en contrario.'
    ));
    return parts.join(' ');
  }

  restrictionsText(data) {
    const restrictions = [
      this.text(
        'The end user may not copy, sublicense, distribute, rent, or commercially exploit the software beyond the rights expressly granted.',
        'El usuario final no puede copiar, sublicenciar, distribuir, alquilar o explotar comercialmente el software más allá de los derechos expresamente otorgados.'
      )
    ];
    if (data.eula.reverseEngineeringRestricted) {
      restrictions.push(this.text(
        'Reverse engineering, decompilation, or attempts to derive source code are restricted except where mandatory law allows otherwise.',
        'La ingeniería inversa, descompilación o intentos de derivar código fuente están restringidos salvo que la ley obligatoria disponga lo contrario.'
      ));
    }
    if (data.eula.modificationRestricted) {
      restrictions.push(this.text(
        'Modification or creation of derivative works is restricted unless the applicable license, documentation, or a separate written permission allows it.',
        'La modificación o creación de obras derivadas está restringida salvo que la licencia aplicable, la documentación o una autorización escrita lo permitan.'
      ));
    }
    if (data.eula.redistributionRestricted) {
      restrictions.push(this.text(
        'Redistribution, repackaging, or republication of the software or its core components is restricted unless expressly authorized.',
        'La redistribución, reempaquetado o republicación del software o de sus componentes principales está restringida salvo autorización expresa.'
      ));
    }
    return restrictions.join(' ');
  }

  updatesSupportText(data) {
    const parts = [
      this.text(
        data.eula.updatesProvided
          ? 'Updates, patches, or new versions may be made available according to the product roadmap, subscription tier, and operational priorities of the licensor.'
          : 'The licensor does not promise future updates, patches, or new versions unless a separate commercial commitment says otherwise.',
        data.eula.updatesProvided
          ? 'Las actualizaciones, parches o nuevas versiones pueden ponerse a disposición según el roadmap del producto, el nivel de suscripción y las prioridades operativas del licenciante.'
          : 'El licenciante no promete futuras actualizaciones, parches o nuevas versiones salvo que exista un compromiso comercial separado.'
      )
    ];
    if (data.eula.supportLevel) {
      parts.push(`${this.text('Support model', 'Modelo de soporte')}: ${this.supportLevelLabel(data.eula.supportLevel)}.`);
    }
    return parts.join(' ');
  }

  thirdPartyText(data) {
    if (!data.eula.thirdPartyComponents && !data.eula.openSourceNotice) {
      return this.text(
        'Third-party or open-source components may still exist in the technical stack, but this agreement does not expand their original license terms and users should also review any notices made available with the software.',
        'Pueden existir componentes de terceros u open source en la base técnica, pero este acuerdo no amplía sus licencias originales y los usuarios deberían revisar además los avisos que se entreguen con el software.'
      );
    }

    return [
      this.text(
        'The software may include third-party, open-source, or externally licensed components that remain subject to their own applicable notices and license conditions.',
        'El software puede incluir componentes de terceros, open source o licenciados externamente, que siguen sujetos a sus propios avisos y condiciones de licencia.'
      ),
      data.eula.openSourceNotice
        ? `${this.text('Third-party/open-source notice', 'Aviso de terceros/open source')}: ${this.sentence(data.eula.openSourceNotice)}`
        : ''
    ].filter(Boolean).join(' ');
  }

  terminationText(data) {
    const parts = [
      this.text(
        'The license may terminate automatically if the end user materially breaches this agreement, uses the software outside the granted scope, or violates payment, account, or compliance conditions tied to the product.',
        'La licencia podrá terminar automáticamente si el usuario final incumple materialmente este acuerdo, usa el software fuera del alcance concedido o viola condiciones de pago, cuenta o cumplimiento vinculadas al producto.'
      )
    ];
    if (data.eula.terminationTriggers) {
      parts.push(`${this.text('Typical termination triggers', 'Supuestos típicos de terminación')}: ${this.sentence(data.eula.terminationTriggers)}`);
    }
    return parts.join(' ');
  }

  disclaimerText(data) {
    const parts = [];
    if (data.eula.warrantyDisclaimer) {
      parts.push(`${this.text('Warranty disclaimer', 'Descargo de garantías')}: ${this.sentence(data.eula.warrantyDisclaimer)}`);
    } else {
      parts.push(this.text(
        'Unless a separate commercial warranty expressly says otherwise, the software is provided on an "as is" and "as available" basis to the maximum extent permitted by law.',
        'Salvo garantía comercial separada y expresa, el software se entrega "tal cual" y "según disponibilidad", en la máxima medida permitida por la ley.'
      ));
    }
    if (data.eula.liabilityLimit) {
      parts.push(`${this.text('Limitation of liability', 'Limitación de responsabilidad')}: ${this.sentence(data.eula.liabilityLimit)}`);
    }
    return parts.join(' ');
  }

  governingLawText(data) {
    return data.eula.governingLaw
      ? `${this.text('Governing law or main dispute forum', 'Ley aplicable o foro principal')}: ${this.sentence(data.eula.governingLaw)}`
      : this.text(
        'The parties should review the governing law and dispute venue that best fit the distribution and user geography of the software.',
        'Las partes deberían revisar la ley aplicable y el foro de disputas que mejor encajen con la distribución y geografía de usuarios del software.'
      );
  }

  contactText(data) {
    const parts = [];
    if (data.contact.email) parts.push(this.text(`Primary contact email: ${data.contact.email}.`, `Email principal de contacto: ${data.contact.email}.`));
    if (data.contact.pageUrl) parts.push(this.text(`Reference page or contact URL: ${data.contact.pageUrl}.`, `Página o URL de referencia: ${data.contact.pageUrl}.`));
    if (data.contact.phone) parts.push(this.text(`Phone: ${data.contact.phone}.`, `Teléfono: ${data.contact.phone}.`));
    if (data.business.address) parts.push(this.text(`Postal address: ${data.business.address}.`, `Dirección postal: ${data.business.address}.`));
    return parts.join(' ');
  }

  softwareTypeLabel(value) {
    const labels = {
      desktop: this.text('desktop software', 'software de escritorio'),
      mobile_app: this.text('mobile app', 'app móvil'),
      web_app: this.text('hosted web app or SaaS interface', 'web app o interfaz SaaS'),
      sdk_api: this.text('SDK, API, or developer tooling', 'SDK, API o tooling para desarrolladores'),
      plugin_extension: this.text('plugin, extension, or add-on', 'plugin, extensión o add-on')
    };
    return labels[value] || value;
  }

  licenseScopeLabel(value) {
    const labels = {
      personal_internal: this.text('personal or internal business use only', 'uso personal o interno únicamente'),
      commercial_b2b: this.text('commercial business use under the contracted plan', 'uso comercial bajo el plan contratado'),
      single_device: this.text('single device or installation scope', 'alcance limitado a un dispositivo o instalación'),
      per_account: this.text('per account or named user', 'por cuenta o usuario nominal'),
      per_seat: this.text('per seat, seat pack, or subscription quantity', 'por asiento, paquete de asientos o cantidad contratada')
    };
    return labels[value] || value;
  }

  supportLevelLabel(value) {
    const labels = {
      none: this.text('no support commitment beyond general availability', 'sin compromiso de soporte más allá de la disponibilidad general'),
      best_effort: this.text('best-effort support and maintenance', 'soporte y mantenimiento best effort'),
      commercial_support: this.text('commercial support subject to plan or contract', 'soporte comercial sujeto a plan o contrato'),
      contract_defined: this.text('support terms defined by a separate contract or order form', 'soporte definido por contrato u order form')
    };
    return labels[value] || value;
  }

  sentence(value) {
    const normalized = this.stringValue(value);
    if (!normalized) return '';
    return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
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
      const sectionId = `section-${section.id}`;
      const paragraphs = section.paragraphs.map((paragraph) => `<p>${escape(paragraph).replaceAll('\n', '<br>')}</p>`).join('\n');
      return `<section aria-labelledby="${sectionId}">\n<h2 id="${sectionId}">${escape(section.title)}</h2>\n${paragraphs}\n</section>`;
    }).join('\n');

    return [
      '<!doctype html>',
      `<html lang="${document.language}">`,
      '<head>',
      '  <meta charset="utf-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1">',
      `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
      `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd(structuredData)}</script>` : ''}`,
      '  <meta name="legal-document-type" content="eula">',
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

module.exports = EulaGenerator;
