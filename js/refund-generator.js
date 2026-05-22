class ReturnRefundPolicyGenerator {
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
      title: language === 'es' ? 'Política de Devoluciones y Reembolsos' : 'Return & Refund Policy',
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
      refund: {
        offeringType: this.stringValue(input.refund?.offeringType, 'physical_goods'),
        acceptsReturns: this.booleanValue(input.refund?.acceptsReturns, true),
        refundWindow: this.stringValue(input.refund?.refundWindow),
        exchangeWindow: this.stringValue(input.refund?.exchangeWindow),
        returnConditions: this.stringValue(input.refund?.returnConditions),
        refundMethod: this.stringValue(input.refund?.refundMethod),
        refundProcessingTime: this.stringValue(input.refund?.refundProcessingTime),
        returnShippingResponsibility: this.stringValue(input.refund?.returnShippingResponsibility),
        returnRequestChannel: this.stringValue(input.refund?.returnRequestChannel || input.contact?.email),
        nonReturnableItems: this.arrayValue(input.refund?.nonReturnableItems),
        digitalGoodsFinal: this.booleanValue(input.refund?.digitalGoodsFinal, false),
        damagedItemsProcess: this.stringValue(input.refund?.damagedItemsProcess),
        notes: this.arrayValue(input.refund?.notes)
      },
      settings: {
        language: this.stringValue(input.settings?.language, 'es')
      }
    };

    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del negocio es obligatorio.',
          missingWebsite: 'La URL del sitio o aplicación es obligatoria.',
          missingReturnWindow: 'Conviene indicar el plazo general para pedir devolución o reembolso.',
          missingReturnConditions: 'Conviene aclarar en qué estado debe estar el producto o servicio para aceptar una devolución.',
          missingReturnChannel: 'Conviene indicar un canal claro para iniciar devoluciones o reclamos.',
          missingRefundTiming: 'Conviene indicar cuánto tarda el reembolso una vez aprobado.',
          digitalNeedsClarity: 'Si vendés productos digitales, conviene aclarar si son finales, no reembolsables o si tienen excepciones.',
          noReturnsNeedsReason: 'Si no aceptás devoluciones, conviene aclarar excepciones mínimas por daño, error o exigencia legal.',
          argentinaSpanishWarning: 'Para una política de devoluciones orientada a Argentina conviene publicarla en español.',
          argentinaWithdrawalWarning: 'Para ventas a distancia en Argentina conviene contemplar el derecho de arrepentimiento y aclarar que los derechos legales del consumidor prevalecen cuando corresponda.',
          argentinaDefectWarning: 'Para e-commerce en Argentina conviene describir con claridad qué ocurre si el producto llega defectuoso, dañado o es distinto del ofrecido.'
        }
      : {
          missingBusinessName: 'Business name is required.',
          missingWebsite: 'Website or app URL is required.',
          missingReturnWindow: 'You should specify the general time window for return or refund requests.',
          missingReturnConditions: 'You should explain the required condition of returned items or services.',
          missingReturnChannel: 'You should provide a clear channel for initiating return or refund requests.',
          missingRefundTiming: 'You should state how long refunds usually take after approval.',
          digitalNeedsClarity: 'If you sell digital products, you should clarify whether sales are final, non-refundable, or subject to exceptions.',
          noReturnsNeedsReason: 'If you do not accept returns, you should explain at least the basic exceptions for damage, error, or legal obligations.',
          argentinaSpanishWarning: 'For an Argentina-facing return policy, publishing in Spanish is strongly recommended.',
          argentinaWithdrawalWarning: 'For distance sales in Argentina, consider describing the statutory withdrawal or cooling-off right and clarifying that mandatory consumer rights prevail where applicable.',
          argentinaDefectWarning: 'For Argentina e-commerce, clearly describe what happens if the product arrives defective, damaged, or materially different from what was offered.'
        };

    const errors = [];
    const warnings = [];

    if (!data.business.name) errors.push(messages.missingBusinessName);
    if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
    if (data.refund.acceptsReturns && !data.refund.refundWindow) warnings.push(messages.missingReturnWindow);
    if (data.refund.acceptsReturns && !data.refund.returnConditions) warnings.push(messages.missingReturnConditions);
    if (!data.refund.returnRequestChannel && !data.contact.email && !data.contact.pageUrl) warnings.push(messages.missingReturnChannel);
    if (!data.refund.refundProcessingTime) warnings.push(messages.missingRefundTiming);
    if (data.refund.offeringType === 'digital_products' && !data.refund.digitalGoodsFinal && data.refund.nonReturnableItems.length === 0) warnings.push(messages.digitalNeedsClarity);
    if (!data.refund.acceptsReturns && !data.refund.damagedItemsProcess) warnings.push(messages.noReturnsNeedsReason);
    if (this.isArgentina(data)) {
      if (data.settings.language !== 'es') warnings.push(messages.argentinaSpanishWarning);
      if (!data.refund.refundWindow) warnings.push(messages.argentinaWithdrawalWarning);
      if (!data.refund.damagedItemsProcess) warnings.push(messages.argentinaDefectWarning);
    }

    return { data, errors, warnings };
  }

  buildSections(data) {
    return [
      this.section('overview', this.text('Overview', 'Resumen'), [
        this.interpolate(this.text(
          '{business_name} publishes this return and refund policy for purchases or services offered through {website}.',
          '{business_name} publica esta política de devoluciones y reembolsos para compras o servicios ofrecidos a través de {website}.'
        ), data)
      ]),
      this.section('eligibility', this.text('Eligibility for Returns and Refunds', 'Elegibilidad para Devoluciones y Reembolsos'), [
        this.eligibilityText(data)
      ]),
      ...(this.isArgentina(data) ? [
        this.section('consumer-rights-ar', this.text('Argentina Consumer and Distance-Sales Notice', 'Aviso de Consumo y Venta a Distancia en Argentina'), [
          this.argentinaConsumerText(data)
        ])
      ] : []),
      this.section('process', this.text('How to Start a Return or Refund Request', 'Cómo Iniciar una Solicitud de Devolución o Reembolso'), [
        this.processText(data)
      ]),
      this.section('shipping', this.text('Return Shipping and Logistics', 'Envío de Devoluciones y Logística'), [
        this.shippingText(data)
      ]),
      this.section('exceptions', this.text('Exceptions and Non-Returnable Items', 'Excepciones y Productos No Retornables'), [
        this.exceptionsText(data)
      ]),
      this.section('timing', this.text('Refund Timing and Method', 'Tiempos y Método de Reembolso'), [
        this.timingText(data)
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

  eligibilityText(data) {
    if (!data.refund.acceptsReturns) {
      return this.text(
        'Returns are generally not accepted except where the item or service is defective, materially different from what was ordered, or where applicable law requires a remedy.',
        'En general no se aceptan devoluciones, salvo cuando el producto o servicio presente fallas, sea sustancialmente distinto de lo pedido o cuando la ley aplicable exija un remedio.'
      );
    }

    const parts = [];
    if (data.refund.refundWindow) {
      parts.push(this.text(
        `Return or refund requests should generally be submitted within ${data.refund.refundWindow} of delivery, access, or purchase, as applicable.`,
        `Las solicitudes de devolución o reembolso en general deben presentarse dentro de ${data.refund.refundWindow} desde la entrega, el acceso o la compra, según corresponda.`
      ));
    }
    if (data.refund.exchangeWindow) {
      parts.push(this.text(
        `Where exchanges are offered, they should generally be requested within ${data.refund.exchangeWindow}.`,
        `Cuando se ofrecen cambios, en general deben solicitarse dentro de ${data.refund.exchangeWindow}.`
      ));
    }
    if (data.refund.returnConditions) {
      parts.push(data.refund.returnConditions);
    }
    return parts.join(' ');
  }

  argentinaConsumerText(data) {
    const withdrawal = data.refund.refundWindow
      ? this.text(
        `Where Argentina consumer law applies, customers purchasing at a distance should review whether a statutory withdrawal right may exist within ${data.refund.refundWindow}, without prejudice to any mandatory legal right that may prevail over this policy.`,
        `Cuando resulte aplicable la normativa argentina de consumo, los clientes que compren a distancia deberían revisar si existe un derecho de arrepentimiento dentro de ${data.refund.refundWindow}, sin perjuicio de cualquier derecho legal obligatorio que prevalezca sobre esta política.`
      )
      : this.text(
        'Where Argentina consumer law applies, customers purchasing at a distance may have a statutory withdrawal right, without prejudice to any mandatory legal right that prevails over this policy.',
        'Cuando resulte aplicable la normativa argentina de consumo, los clientes que compren a distancia pueden tener un derecho legal de arrepentimiento, sin perjuicio de cualquier derecho obligatorio que prevalezca sobre esta política.'
      );
    const defects = data.refund.damagedItemsProcess
      ? ` ${this.text('Issues involving defective, damaged, or materially different products should be handled under the specific review and remediation process described below.', 'Los supuestos de producto defectuoso, dañado o sustancialmente distinto de lo ofrecido deberían canalizarse conforme al proceso específico de revisión y solución indicado más abajo.')}`
      : '';
    return `${withdrawal}${defects}`;
  }

  processText(data) {
    const channel = data.refund.returnRequestChannel || data.contact.email || data.contact.pageUrl;
    const base = channel
      ? this.text(
        `To initiate a request, contact us through ${channel} and provide enough information to identify the order, purchase, or service involved.`,
        `Para iniciar una solicitud, contactanos a través de ${channel} y aportá información suficiente para identificar el pedido, la compra o el servicio involucrado.`
      )
      : this.text(
        'To initiate a request, contact the business and provide enough information to identify the order, purchase, or service involved.',
        'Para iniciar una solicitud, contactá al negocio y aportá información suficiente para identificar el pedido, la compra o el servicio involucrado.'
      );
    const damaged = data.refund.damagedItemsProcess
      ? ` ${data.refund.damagedItemsProcess}`
      : '';
    return `${base}${damaged}`;
  }

  shippingText(data) {
    const labels = {
      customer: this.text('The customer normally bears return shipping costs unless law or a specific case requires otherwise.', 'El cliente normalmente asume el costo del envío de devolución, salvo que la ley o el caso concreto indiquen otra cosa.'),
      merchant: this.text('The business normally bears return shipping costs when a return is approved.', 'El negocio normalmente asume el costo del envío de devolución cuando una devolución es aprobada.'),
      case_by_case: this.text('Return shipping responsibility is reviewed case by case depending on the reason for the return, the product condition, and applicable law.', 'La responsabilidad por el envío de devolución se revisa caso por caso según el motivo de la devolución, el estado del producto y la ley aplicable.')
    };
    return labels[data.refund.returnShippingResponsibility] || this.text(
      'Shipping and logistics for returns depend on the type of product, the reason for the request, and applicable law.',
      'La logística y el envío de devoluciones dependen del tipo de producto, del motivo de la solicitud y de la ley aplicable.'
    );
  }

  exceptionsText(data) {
    const items = [];
    if (data.refund.offeringType === 'digital_products' && data.refund.digitalGoodsFinal) {
      items.push(this.text('Digital products, downloads, or activated licenses may be final and non-refundable once accessed or delivered, except where law requires otherwise.', 'Los productos digitales, descargas o licencias activadas pueden ser finales y no reembolsables una vez accedidos o entregados, salvo que la ley exija lo contrario.'));
    }
    if (data.refund.nonReturnableItems.length > 0) {
      return `${this.text('The following categories may be non-returnable or subject to special conditions:', 'Las siguientes categorías pueden no admitir devolución o estar sujetas a condiciones especiales:')}\n${this.listLines(data.refund.nonReturnableItems)}`;
    }
    if (items.length > 0) {
      return items.join(' ');
    }
    return this.text(
      'Certain items, services, or digital goods may be excluded from returns or refunds where clearly indicated at purchase, where they are perishable, personalized, activated, or otherwise subject to a lawful exception.',
      'Determinados productos, servicios o bienes digitales pueden quedar excluidos de devoluciones o reembolsos cuando ello se informe claramente al momento de la compra, cuando sean perecederos, personalizados, activados o estén alcanzados por una excepción legal válida.'
    );
  }

  timingText(data) {
    const method = data.refund.refundMethod
      ? this.text(`Approved refunds are generally issued through ${data.refund.refundMethod}.`, `Los reembolsos aprobados en general se emiten mediante ${data.refund.refundMethod}.`)
      : this.text('Approved refunds are generally issued through the same or a comparable payment method used for the original transaction, unless otherwise agreed or required.', 'Los reembolsos aprobados en general se emiten mediante el mismo medio de pago usado en la transacción original o uno comparable, salvo acuerdo o exigencia distinta.');
    const timing = data.refund.refundProcessingTime
      ? this.text(`Once approved, refunds are generally processed within ${data.refund.refundProcessingTime}, subject to banking, card, or platform timing.`, `Una vez aprobados, los reembolsos en general se procesan dentro de ${data.refund.refundProcessingTime}, sujeto a tiempos bancarios, de tarjeta o de la plataforma.`)
      : this.text('Refund timing depends on approval, payment method, and the policies of the relevant banking or payment provider.', 'El tiempo del reembolso depende de la aprobación, del medio de pago y de las políticas del proveedor bancario o de pagos correspondiente.');
    return `${method} ${timing}`;
  }

  contactText(data) {
    const parts = [];
    if (data.contact.email) {
      parts.push(this.text(`For return or refund questions, contact us by email at ${data.contact.email}.`, `Para consultas sobre devoluciones o reembolsos, contactanos por email a ${data.contact.email}.`));
    }
    if (data.contact.pageUrl) {
      parts.push(this.text(`Additional contact or support information may be available at ${data.contact.pageUrl}.`, `Puede haber información adicional de contacto o soporte en ${data.contact.pageUrl}.`));
    }
    if (data.contact.phone) {
      parts.push(this.text(`Phone contact: ${data.contact.phone}.`, `Teléfono de contacto: ${data.contact.phone}.`));
    }
    if (data.business.address) {
      parts.push(this.text(`Postal address: ${data.business.address}.`, `Dirección postal: ${data.business.address}.`));
    }
    return parts.join(' ');
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

  booleanValue(value, fallback = false) {
    return typeof value === 'boolean' ? value : fallback;
  }

  isArgentina(data) {
    return String(data.business.country || '').toLowerCase().includes('argentina');
  }
}

module.exports = ReturnRefundPolicyGenerator;
