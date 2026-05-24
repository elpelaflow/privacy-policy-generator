class TermsGenerator {
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
    const result = await this.buildTerms(input);
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
    const result = await this.buildTerms(input);

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

  async buildTerms(input) {
    const normalized = this.normalizeInput(input);
    const language = normalized.data.settings.language || 'es';
    this.currentLanguage = language;
    const document = {
      businessName: normalized.data.business.name,
      effectiveDate: new Date().toISOString().slice(0, 10),
      warnings: normalized.warnings,
      language,
      title: language === 'es' ? 'Términos y Condiciones' : 'Terms and Conditions',
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
      operations: {
        primaryJurisdiction: this.stringValue(input.operations?.primaryJurisdiction),
        sellRegions: this.arrayValue(input.operations?.sellRegions)
      },
      terms: {
        offeringType: this.stringValue(input.terms?.offeringType),
        hasAccounts: Boolean(input.terms?.hasAccounts),
        requiresRegistration: Boolean(input.terms?.requiresRegistration),
        allowsUserContent: Boolean(input.terms?.allowsUserContent),
        pricesIncludeTaxes: Boolean(input.terms?.pricesIncludeTaxes),
        currency: this.stringValue(input.terms?.currency),
        paymentProvider: this.stringValue(input.terms?.paymentProvider),
        refundsOffered: Boolean(input.terms?.refundsOffered),
        refundWindow: this.stringValue(input.terms?.refundWindow),
        refundConditions: this.stringValue(input.terms?.refundConditions),
        returnShippingResponsibility: this.stringValue(input.terms?.returnShippingResponsibility),
        warrantyOffered: Boolean(input.terms?.warrantyOffered),
        warrantyDetails: this.stringValue(input.terms?.warrantyDetails),
        prohibitedActivities: this.arrayValue(input.terms?.prohibitedActivities),
        customRestriction: this.stringValue(input.terms?.customRestriction),
        ipOwner: this.stringValue(input.terms?.ipOwner),
        ugcLicenseGranted: Boolean(input.terms?.ugcLicenseGranted),
        limitIndirectDamages: input.terms?.limitIndirectDamages !== false,
        shippingDelayDisclaimer: Boolean(input.terms?.shippingDelayDisclaimer),
        customDisclaimer: this.stringValue(input.terms?.customDisclaimer),
        maySuspendAccounts: input.terms?.maySuspendAccounts !== false,
        terminationGrounds: this.stringValue(input.terms?.terminationGrounds),
        changeNotification: this.stringValue(input.terms?.changeNotification),
        disputesForum: this.stringValue(input.terms?.disputesForum),
        adrMethod: this.stringValue(input.terms?.adrMethod)
      },
      settings: {
        language: this.stringValue(input.settings?.language, 'es')
      },
      customizations: {
        manualDisclosures: this.arrayValue(input.customizations?.manualDisclosures)
      }
    };

    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del negocio es obligatorio.',
          missingWebsite: 'La URL del sitio es obligatoria para generar términos publicables.',
          missingCountry: 'El país o ley aplicable es obligatorio.',
          missingAddress: 'La dirección física completa es importante para identificar al responsable del servicio.',
          missingEmail: 'El email de contacto es obligatorio.',
          missingOfferingType: 'Debe indicar qué vende u ofrece el servicio.',
          missingCurrency: 'Debe indicar la moneda principal del sitio.',
          missingPaymentProvider: 'Conviene indicar cómo se procesan los pagos o qué pasarela utiliza.',
          missingForum: 'Debe indicar jurisdicción o foro aplicable para disputas.',
          argentinaSpanishWarning: 'Para un negocio en Argentina conviene publicar los términos también en español.',
          argentinaConsumerWarning: 'Para e-commerce en Argentina conviene contemplar reglas de defensa del consumidor, información clara, derecho de arrepentimiento y garantías legales cuando correspondan.',
          argentinaForumWarning: 'Para un negocio argentino conviene definir con mayor precisión la jurisdicción o foro aplicable, evitando fórmulas demasiado vagas.',
          weakRefundWarning: 'Si vende productos o servicios al consumidor, conviene definir cambios, devoluciones o reembolsos.',
          weakWarrantyWarning: 'Si ofrece garantía o productos físicos, conviene aclarar su alcance.',
          weakAccountsWarning: 'Si hay cuentas de usuario, conviene definir cuándo pueden suspenderse o cancelarse.',
          missingTaxesWarning: 'Conviene aclarar si los precios incluyen IVA u otros impuestos y en qué moneda se muestran.'
        }
      : {
          missingBusinessName: 'Business name is required.',
          missingWebsite: 'Website URL is required for publishable terms.',
          missingCountry: 'Country or governing law basis is required.',
          missingAddress: 'A complete physical address is important to identify the service provider.',
          missingEmail: 'Contact email is required.',
          missingOfferingType: 'You must specify what the business sells or provides.',
          missingCurrency: 'You should specify the main site currency.',
          missingPaymentProvider: 'You should specify how payments are processed or which gateway is used.',
          missingForum: 'You must specify the governing forum or dispute venue.',
          argentinaSpanishWarning: 'For an Argentina-based business, publishing the terms in Spanish is strongly recommended.',
          argentinaConsumerWarning: 'For Argentina e-commerce, consider covering consumer-law expectations, clear information duties, withdrawal rights, and statutory warranties where relevant.',
          argentinaForumWarning: 'For an Argentina-based business, define the governing forum more precisely and avoid overly vague dispute wording.',
          weakRefundWarning: 'If you sell to consumers, you should define refunds, returns, or exchanges.',
          weakWarrantyWarning: 'If you offer warranties or physical goods, you should clarify warranty scope.',
          weakAccountsWarning: 'If user accounts exist, you should define when they may be suspended or terminated.',
          missingTaxesWarning: 'You should clarify whether prices include VAT or other taxes and which currency is displayed.'
        };

    const errors = [];
    const warnings = [];

    if (!data.business.name) errors.push(messages.missingBusinessName);
    if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
    if (!data.business.country) errors.push(messages.missingCountry);
    if (!data.contact.email) errors.push(messages.missingEmail);
    if (!data.terms.offeringType) errors.push(messages.missingOfferingType);
    if (!data.terms.disputesForum) errors.push(messages.missingForum);

    if (!data.business.address) warnings.push(messages.missingAddress);
    if (!data.terms.currency) warnings.push(messages.missingCurrency);
    if (!data.terms.paymentProvider) warnings.push(messages.missingPaymentProvider);
    if (!data.terms.pricesIncludeTaxes && !data.terms.currency) warnings.push(messages.missingTaxesWarning);
    if (!data.terms.refundsOffered && data.business.type === 'ecommerce') warnings.push(messages.weakRefundWarning);
    if (!data.terms.warrantyOffered && data.terms.offeringType === 'physical_goods') warnings.push(messages.weakWarrantyWarning);
    if (data.terms.hasAccounts && !data.terms.terminationGrounds) warnings.push(messages.weakAccountsWarning);
    if (this.isArgentina(data)) {
      if (data.settings.language !== 'es') warnings.push(messages.argentinaSpanishWarning);
      if (data.business.type === 'ecommerce') warnings.push(messages.argentinaConsumerWarning);
      if (/competent courts|tribunales competentes de argentina|argentina courts/i.test(data.terms.disputesForum || '')) {
        warnings.push(messages.argentinaForumWarning);
      }
    }

    return { data, errors, warnings };
  }

  buildSections(data) {
    const t = this.text.bind(this);
    const sections = [];

    sections.push(this.section('acceptance', t('Acceptance of Terms', 'Aceptación de los Términos'), [
      this.interpolate(t(
        'These Terms and Conditions govern access to and use of {website}, operated by {business_name}. By accessing, browsing, or purchasing through the service, users agree to be bound by these terms.',
        'Estos Términos y Condiciones regulan el acceso y uso de {website}, operado por {business_name}. Al acceder, navegar o comprar a través del servicio, los usuarios aceptan quedar vinculados por estos términos.'
      ), data)
    ]));

    sections.push(this.section('business', t('Business Information', 'Información del Negocio'), [
      this.interpolate(t(
        '{business_name} operates from {country}. Business contact details for legal or contractual matters are listed in the contact section below.',
        '{business_name} opera desde {country}. Los datos de contacto para asuntos legales o contractuales se indican en la sección de contacto más abajo.'
      ), data),
      this.interpolate(t(
        'Main website or application: {website}.',
        'Sitio web o aplicación principal: {website}.'
      ), data)
    ]));

    sections.push(this.section('service', t('Service Description', 'Descripción del Servicio'), [
      this.interpolate(t(
        'The service primarily offers {offering_type_label}.',
        'El servicio ofrece principalmente {offering_type_label}.'
      ), data),
      this.interpolate(this.accountText(data), data)
    ]));

    sections.push(this.section('orders', t('Orders, Prices, and Payments', 'Compras, Precios y Pagos'), [
      this.interpolate(this.pricingText(data), data),
      this.interpolate(this.paymentText(data), data)
    ], this.orderSubsections(data)));

    if (this.isArgentina(data) && data.business.type === 'ecommerce') {
      sections.push(this.section('argentina-consumer', t('Argentina Consumer Notice', 'Aviso de Consumo en Argentina'), [
        this.interpolate(this.argentinaConsumerText(data), data)
      ]));
    }

    sections.push(this.section('conduct', t('Prohibited Conduct', 'Conductas Prohibidas'), [
      this.interpolate(t(
        'Users may not use the service for unlawful, fraudulent, abusive, or technically harmful activity, including attempts to interfere with operations, misuse content, or violate applicable law.',
        'Los usuarios no pueden utilizar el servicio para actividades ilícitas, fraudulentas, abusivas o técnicamente dañinas, incluyendo intentos de interferir con la operación, usar indebidamente el contenido o violar la ley aplicable.'
      ), data),
      this.restrictionsLines(data)
    ]));

    sections.push(this.section('ip', t('Intellectual Property', 'Propiedad Intelectual'), [
      this.interpolate(this.ipText(data), data)
    ], data.terms.allowsUserContent ? [{
      title: t('User-Generated Content', 'Contenido Generado por Usuarios'),
      paragraphs: [this.interpolate(this.ugcText(data), data)]
    }] : []));

    sections.push(this.section('liability', t('Disclaimers and Limitation of Liability', 'Descargos y Limitación de Responsabilidad'), [
      this.interpolate(this.liabilityText(data), data),
      this.interpolate(this.shippingDisclaimerText(data), data),
      this.interpolate(this.customDisclaimerText(data), data)
    ]));

    sections.push(this.section('termination', t('Suspension, Termination, and Changes', 'Suspensión, Terminación y Cambios'), [
      this.interpolate(this.terminationText(data), data),
      this.interpolate(this.changeNotificationText(data), data)
    ]));

    sections.push(this.section('law', t('Governing Law and Disputes', 'Ley Aplicable y Disputas'), [
      this.interpolate(this.disputesText(data), data)
    ]));

    sections.push(this.section('contact', t('Contact Information', 'Información de Contacto'), [
      this.contactLines(data)
    ]));

    return sections;
  }

  orderSubsections(data) {
    const sections = [];
    if (data.terms.refundsOffered) {
      sections.push({
        title: this.text('Refunds, Returns, and Exchanges', 'Reembolsos, Cambios y Devoluciones'),
        paragraphs: [this.interpolate(this.refundText(data), data)]
      });
    }
    if (data.terms.warrantyOffered) {
      sections.push({
        title: this.text('Warranty', 'Garantía'),
        paragraphs: [this.interpolate(this.warrantyText(data), data)]
      });
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

  offeringTypeLabel(value) {
    const labels = {
      physical_goods: this.text('physical goods', 'productos físicos'),
      digital_products: this.text('digital products', 'productos digitales'),
      services: this.text('services', 'servicios'),
      subscriptions: this.text('subscriptions or recurring plans', 'suscripciones o planes recurrentes')
    };
    return labels[value] || value || this.text('online services', 'servicios en línea');
  }

  accountText(data) {
    if (!data.terms.hasAccounts) {
      return this.text(
        'Users may access and use the service without maintaining a persistent account, unless a specific feature or support flow requires identification information.',
        'Los usuarios pueden acceder y utilizar el servicio sin mantener una cuenta persistente, salvo que una función específica o un flujo de soporte requieran identificación.'
      );
    }

    if (data.terms.requiresRegistration) {
      return this.text(
        'Users may need to register and maintain accurate account information in order to access certain features, place orders, or manage subscriptions.',
        'Es posible que los usuarios deban registrarse y mantener información exacta de cuenta para acceder a ciertas funciones, realizar pedidos o gestionar suscripciones.'
      );
    }

    return this.text(
      'Users may create accounts to manage purchases or preferences, but account creation is not required for every use case.',
      'Los usuarios pueden crear cuentas para gestionar compras o preferencias, pero la creación de cuenta no es obligatoria para todos los casos.'
    );
  }

  pricingText(data) {
    const taxesText = data.terms.pricesIncludeTaxes
      ? this.text('Displayed prices are presented inclusive of applicable taxes unless stated otherwise.', 'Los precios exhibidos se presentan con los impuestos aplicables incluidos, salvo que se indique lo contrario.')
      : this.text('Displayed prices may exclude taxes, duties, or other charges unless expressly stated otherwise.', 'Los precios exhibidos pueden no incluir impuestos, tasas u otros cargos salvo indicación expresa en contrario.');
    const currencyText = data.terms.currency
      ? this.text(`Prices are shown primarily in ${data.terms.currency}.`, `Los precios se muestran principalmente en ${data.terms.currency}.`)
      : this.text('The service uses the currency indicated in the applicable commercial flow or payment channel.', 'El servicio utiliza la moneda indicada en el flujo comercial o canal de pago aplicable.');
    return `${taxesText} ${currencyText}`;
  }

  paymentText(data) {
    if (data.terms.paymentProvider) {
      return this.text(
        `Payments are processed through ${data.terms.paymentProvider}. Payment processing may be subject to that provider's own terms and conditions.`,
        `Los pagos se procesan a través de ${data.terms.paymentProvider}. El procesamiento del pago puede quedar sujeto a los propios términos y condiciones de ese proveedor.`
      );
    }
    return this.text(
      'Payment processing details should be completed before publication so users know which provider handles checkout.',
      'Los detalles del procesamiento de pagos deben completarse antes de publicar para que los usuarios sepan qué proveedor interviene en el checkout.'
    );
  }

  refundText(data) {
    const windowText = data.terms.refundWindow
      ? this.text(`Refund, return, or exchange requests should generally be made within ${data.terms.refundWindow}.`, `Las solicitudes de reembolso, cambio o devolución deberían realizarse en general dentro de ${data.terms.refundWindow}.`)
      : this.text('Refund timing should be completed before publication.', 'El plazo de reembolso debería completarse antes de publicar.');
    const conditionText = data.terms.refundConditions
      ? data.terms.refundConditions
      : this.text('Eligibility conditions should be defined based on product condition, usage, and applicable consumer law.', 'Las condiciones de elegibilidad deberían definirse según el estado del producto, su uso y la normativa de consumo aplicable.');
    const shippingText = data.terms.returnShippingResponsibility
      ? this.text(`Return shipping responsibility: ${data.terms.returnShippingResponsibility}.`, `Responsabilidad por el envío de devolución: ${data.terms.returnShippingResponsibility}.`)
      : this.text('Return shipping responsibility should be clarified.', 'Debería aclararse quién asume el envío de devolución.');
    const argentinaText = this.isArgentina(data) && data.business.type === 'ecommerce'
      ? this.text(' Where mandatory consumer protections apply, any statutory withdrawal, defect, or mismatch remedy available under consumer law will prevail over any narrower operational rule in these terms.', ' Cuando apliquen protecciones obligatorias de defensa del consumidor, cualquier derecho legal de arrepentimiento, falla o falta de conformidad previsto por la normativa de consumo prevalecerá sobre cualquier regla operativa más restrictiva de estos términos.')
      : '';
    return `${windowText} ${conditionText} ${shippingText}${argentinaText}`;
  }

  warrantyText(data) {
    return data.terms.warrantyDetails
      ? data.terms.warrantyDetails
      : this.text(
          'Any warranty scope, exclusions, and claim procedures will be governed by the specific commercial conditions communicated to the user where applicable.',
          'Cualquier alcance de garantía, exclusiones y procedimiento de reclamo se regirá por las condiciones comerciales específicas comunicadas al usuario cuando corresponda.'
        );
  }

  ipText(data) {
    const owner = data.terms.ipOwner || data.business.name;
    return this.text(
      `All site content, branding, visual assets, text, and related materials are owned by ${owner} or used with permission, and may not be copied, redistributed, or exploited without authorization except where law permits.`,
      `Todo el contenido del sitio, la marca, los recursos visuales, los textos y materiales relacionados pertenecen a ${owner} o se utilizan con autorización, y no pueden copiarse, redistribuirse ni explotarse sin autorización salvo en los casos permitidos por la ley.`
    );
  }

  ugcText(data) {
    if (data.terms.ugcLicenseGranted) {
      return this.text(
        'By submitting reviews, comments, images, or other user content, users grant a non-exclusive license to display, reproduce, and reference that content in connection with the service and related promotional channels.',
        'Al enviar reseñas, comentarios, imágenes u otro contenido de usuario, los usuarios otorgan una licencia no exclusiva para mostrar, reproducir y referenciar ese contenido en relación con el servicio y canales promocionales relacionados.'
      );
    }
    return this.text(
      'User-generated content may be moderated or removed, and any reuse beyond on-site display should be specifically reviewed before publication.',
      'El contenido generado por usuarios puede ser moderado o eliminado, y cualquier reutilización fuera del sitio quedará sujeta a la autorización o base legal aplicable.'
    );
  }

  liabilityText(data) {
    if (data.terms.limitIndirectDamages) {
      return this.text(
        'To the maximum extent permitted by law, the service is provided on an as-available basis and the business excludes liability for indirect, incidental, special, or consequential damages arising from use of the service, except where exclusion is not legally permitted.',
        'En la máxima medida permitida por la ley, el servicio se ofrece según disponibilidad y el negocio excluye responsabilidad por daños indirectos, incidentales, especiales o consecuenciales derivados del uso del servicio, salvo cuando la exclusión no esté legalmente permitida.'
      );
    }
    return this.text(
      'Liability limitations apply only to the extent permitted by applicable law and should be interpreted consistently with consumer and contractual protections that cannot be waived.',
      'Las limitaciones de responsabilidad aplican únicamente en la medida permitida por la ley aplicable y deben interpretarse de forma compatible con las protecciones de consumo y contractuales que no puedan ser renunciadas.'
    );
  }

  shippingDisclaimerText(data) {
    if (!data.terms.shippingDelayDisclaimer) {
      return '';
    }
    return this.text(
      'Where physical goods are shipped through third-party carriers, delivery times may be affected by external logistics providers once the order has been handed over to them.',
      'Cuando se envían productos físicos mediante transportistas externos, los tiempos de entrega pueden verse afectados por proveedores logísticos externos una vez entregado el pedido a dichos transportistas.'
    );
  }

  customDisclaimerText(data) {
    return data.terms.customDisclaimer || '';
  }

  terminationText(data) {
    const base = data.terms.maySuspendAccounts
      ? this.text(
          'The business may suspend or terminate access, accounts, or orders where users breach these terms, misuse the service, create operational or legal risk, or where continued service is not reasonably possible.',
          'El negocio podrá suspender o terminar el acceso, las cuentas o los pedidos cuando los usuarios incumplan estos términos, hagan un uso indebido del servicio, generen riesgos operativos o legales, o cuando la continuidad del servicio no sea razonablemente posible.'
        )
      : this.text(
          'The service provider may adopt proportionate operational restrictions where necessary to protect the service, comply with law, or address misuse.',
          'El prestador del servicio podrá adoptar restricciones operativas proporcionales cuando sea necesario para proteger el servicio, cumplir la ley o atender usos indebidos.'
        );
    return data.terms.terminationGrounds ? `${base} ${data.terms.terminationGrounds}` : base;
  }

  changeNotificationText(data) {
    const label = {
      email: this.text('email notice', 'aviso por email'),
      site_notice: this.text('a visible site notice', 'un aviso visible en el sitio'),
      both: this.text('email and a visible site notice', 'email y un aviso visible en el sitio')
    }[data.terms.changeNotification] || this.text('reasonable notice through the service', 'un aviso razonable a través del servicio');
    return this.text(
      `The business may update these terms from time to time and will generally communicate material changes through ${label}.`,
      `El negocio podrá actualizar estos términos periódicamente y, en general, comunicará los cambios relevantes mediante ${label}.`
    );
  }

  disputesText(data) {
    const adr = {
      none: this.text('No alternative dispute resolution method has been specified.', 'No se especificó un método alternativo de resolución de disputas.'),
      mediation: this.text('The parties may attempt mediation before pursuing judicial action where appropriate.', 'Las partes podrán intentar una mediación antes de iniciar acciones judiciales cuando corresponda.'),
      arbitration: this.text('Disputes may be referred to arbitration where the applicable law and the service model make that mechanism enforceable.', 'Las disputas podrán someterse a arbitraje cuando la ley aplicable y el modelo del servicio hagan exigible ese mecanismo.')
    }[data.terms.adrMethod] || '';
    return this.text(
      `These terms are governed and interpreted in connection with the laws and courts of ${data.terms.disputesForum}. ${adr}`.trim(),
      `Estos términos se rigen e interpretan en relación con las leyes y tribunales de ${data.terms.disputesForum}. ${adr}`.trim()
    );
  }

  argentinaConsumerText(data) {
    const refundWindow = data.terms.refundWindow
      ? this.text(`For distance sales in Argentina, customers should review whether a withdrawal or cancellation right may exist within ${data.terms.refundWindow}, without prejudice to any mandatory right that prevails over these terms.`, `Para ventas a distancia en Argentina, los clientes deberían revisar si existe un derecho de arrepentimiento o revocación dentro de ${data.terms.refundWindow}, sin perjuicio de cualquier derecho obligatorio que prevalezca sobre estos términos.`)
      : this.text(`For distance sales in Argentina, customers may have statutory withdrawal or cancellation rights, without prejudice to any mandatory consumer protection that prevails over these terms.`, `Para ventas a distancia en Argentina, los clientes pueden tener derechos legales de arrepentimiento o revocación, sin perjuicio de cualquier protección obligatoria de defensa del consumidor que prevalezca sobre estos términos.`);
    const pricing = this.text('Prices, taxes, availability, and core commercial conditions should be presented clearly before the user completes the transaction.', 'Los precios, impuestos, disponibilidad y condiciones comerciales esenciales deberían presentarse con claridad antes de que el usuario complete la transacción.');
    const warranty = data.terms.offeringType === 'physical_goods'
      ? this.text(' Product warranties, hidden defects, and remedies for goods that are damaged, defective, or materially different from what was offered should be interpreted consistently with applicable consumer law.', ' La garantía de productos, los vicios o defectos y los remedios por bienes dañados, defectuosos o sustancialmente distintos de lo ofrecido deben interpretarse de manera compatible con la normativa de defensa del consumidor aplicable.')
      : '';
    return `${refundWindow} ${pricing}${warranty}`.trim();
  }

  restrictionsLines(data) {
    const items = data.terms.prohibitedActivities.slice();
    if (data.terms.customRestriction) {
      items.push(data.terms.customRestriction);
    }
    if (items.length === 0) {
      return '';
    }
    return items.map((item) => `- ${item}`).join('\n');
  }

  manualLines(items) {
    return items.map((item) => `- ${item}`).join('\n');
  }

  contactLines(data) {
    const lines = [];
    if (data.contact.email) lines.push(`- ${this.text('Email', 'Email')}: ${data.contact.email}`);
    if (data.contact.pageUrl) lines.push(`- ${this.text('Contact page', 'Página de contacto')}: ${data.contact.pageUrl}`);
    if (data.contact.phone) lines.push(`- ${this.text('Phone', 'Teléfono')}: ${data.contact.phone}`);
    if (data.business.address) lines.push(`- ${this.text('Postal address', 'Dirección postal')}: ${data.business.address}`);
    return lines.join('\n');
  }

  interpolate(text, data) {
    if (!text) return '';
    return text
      .replaceAll('{business_name}', data.business.name || '')
      .replaceAll('{website}', data.business.websiteUrl || '')
      .replaceAll('{country}', data.business.country || '')
      .replaceAll('{offering_type_label}', this.offeringTypeLabel(data.terms.offeringType));
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
      for (const subsection of section.subsections) {
        lines.push(`### ${subsection.title}`, '');
        for (const paragraph of subsection.paragraphs) {
          lines.push(paragraph, '');
        }
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
      const subsections = section.subsections.map((subsection) => {
        const subsectionParagraphs = subsection.paragraphs.map((paragraph) => this.paragraphToHtml(paragraph, escape)).join('\n');
        return `<h3>${escape(subsection.title)}</h3>\n${subsectionParagraphs}`;
      }).join('\n');
      return `<section>\n<h2>${escape(section.title)}</h2>\n${paragraphs}\n${subsections}\n</section>`;
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

  isArgentina(data) {
    return data.operations.primaryJurisdiction === 'ar' || String(data.business.country || '').toLowerCase().includes('argentina');
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

  paragraphToHtml(paragraph, escape) {
    if (paragraph.startsWith('- ')) {
      const items = paragraph
        .split('\n')
        .filter((line) => line.startsWith('- '))
        .map((line) => `<li>${escape(line.slice(2))}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    }

    return `<p>${escape(paragraph).replaceAll('\n', '<br>')}</p>`;
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

module.exports = TermsGenerator;
