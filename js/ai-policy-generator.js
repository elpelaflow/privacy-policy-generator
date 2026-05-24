class AiPolicyGenerator {
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
      title: language === 'es' ? 'Política de Uso de IA y Datos de Entrenamiento' : 'AI Use and Training Data Policy',
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
      ai: {
        systemsUsed: this.arrayValue(input.ai?.systemsUsed),
        useCases: this.arrayValue(input.ai?.useCases),
        userFacingAi: this.booleanValue(input.ai?.userFacingAi, true),
        generatedContentLabeling: this.booleanValue(input.ai?.generatedContentLabeling, false),
        trainingDataUse: this.stringValue(input.ai?.trainingDataUse),
        dataSources: this.arrayValue(input.ai?.dataSources),
        personalDataInTraining: this.booleanValue(input.ai?.personalDataInTraining, false),
        modelImprovementUses: this.arrayValue(input.ai?.modelImprovementUses),
        optOutAvailable: this.booleanValue(input.ai?.optOutAvailable, false),
        optOutMethod: this.stringValue(input.ai?.optOutMethod),
        retentionPeriod: this.stringValue(input.ai?.retentionPeriod),
        thirdPartyProviders: this.arrayValue(input.ai?.thirdPartyProviders),
        automatedDecisionMaking: this.booleanValue(input.ai?.automatedDecisionMaking, false),
        humanReviewAvailable: this.booleanValue(input.ai?.humanReviewAvailable, true),
        appealChannel: this.stringValue(input.ai?.appealChannel),
        sensitiveDataRestrictions: this.stringValue(input.ai?.sensitiveDataRestrictions),
        securityControls: this.stringValue(input.ai?.securityControls),
        transparencyNotes: this.stringValue(input.ai?.transparencyNotes),
        notes: this.arrayValue(input.ai?.notes)
      },
      settings: {
        language: this.stringValue(input.settings?.language, 'es')
      }
    };

    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del negocio es obligatorio.',
          missingWebsite: 'La URL del servicio es obligatoria.',
          missingSystems: 'Conviene identificar qué sistemas o funciones de IA se usan.',
          missingUseCases: 'Conviene describir para qué se usa la IA en el servicio.',
          missingTrainingDisclosure: 'Debés aclarar si los datos se usan o no para entrenamiento, ajuste, evaluación o mejora de modelos.',
          missingDataSources: 'Conviene indicar de dónde provienen los datos vinculados al uso o entrenamiento de IA.',
          missingOptOutMethod: 'Si ofrecés opt-out sobre entrenamiento o mejora, conviene indicar el método concreto.',
          missingRetention: 'Conviene indicar cuánto tiempo se retienen prompts, outputs o datasets relacionados con IA.',
          missingProviders: 'Conviene identificar proveedores externos o model providers si intervienen en el flujo.',
          missingAppealChannel: 'Si hay decisiones automatizadas o revisión humana, conviene indicar un canal para pedir revisión o soporte.',
          missingSensitiveRestrictions: 'Conviene explicar cómo tratás datos sensibles, restringidos o de alto riesgo en flujos de IA.',
          missingSecurityControls: 'Conviene resumir controles de seguridad y minimización sobre prompts, outputs y datos vinculados a IA.',
          noHumanReviewWarning: 'Si la IA puede influir decisiones relevantes, conviene aclarar si existe revisión humana o mecanismos de escalamiento.',
          contradictionNoTrainingWithImprovement: 'Marcaste que no usás datos para entrenamiento o mejora, pero también seleccionaste usos concretos de improvement/evaluation. Revisá esa combinación.',
          contradictionOptOutWithoutEligibleUse: 'Configuraste un opt-out para entrenamiento o mejora, pero el uso de datos elegido no sugiere un flujo claro de entrenamiento/mejora que requiera ese control.',
          contradictionOptOutMethodWithoutOptOut: 'Completaste un método de opt-out, pero también marcaste que no existe ese control. Revisá cuál de las dos cosas refleja tu flujo real.',
          contradictionHiddenAiLabeling: 'Indicás etiquetado de contenido generado por IA, pero también marcaste que la IA no es visible para usuarios o clientes. Revisá si ambas afirmaciones reflejan realmente tu producto.',
          contradictionNoHumanReviewWithAppeal: 'Declaraste un canal de revisión o apelación, pero también marcaste que no existe revisión humana. Revisá si querés permitir escalamiento humano o ajustar ese canal.',
          contradictionPersonalDataDeniedWithOperationalSources: 'Marcaste que no intervienen datos personales, pero también indicás fuentes como inputs de usuarios, logs o feedback que normalmente pueden contenerlos. Conviene aclarar si se excluyen, anonimizan o aíslan antes de esos usos.'
        }
      : {
          missingBusinessName: 'Business name is required.',
          missingWebsite: 'Service URL is required.',
          missingSystems: 'You should identify which AI systems or features are used.',
          missingUseCases: 'You should describe how AI is used in the service.',
          missingTrainingDisclosure: 'You must clearly state whether data is used for training, fine-tuning, evaluation, or model improvement.',
          missingDataSources: 'You should identify the sources of data linked to AI use or training.',
          missingOptOutMethod: 'If you offer an opt-out for training or improvement, you should explain the concrete method.',
          missingRetention: 'You should state how long prompts, outputs, or AI-related datasets are retained.',
          missingProviders: 'You should identify external providers or model providers if they are part of the flow.',
          missingAppealChannel: 'If automated decisions or human review are involved, you should provide a channel for review or support requests.',
          missingSensitiveRestrictions: 'You should explain how sensitive, restricted, or high-risk data is handled in AI workflows.',
          missingSecurityControls: 'You should summarize security and minimization controls for prompts, outputs, and AI-related data.',
          noHumanReviewWarning: 'If AI can influence meaningful decisions, you should clarify whether human review or escalation mechanisms exist.',
          contradictionNoTrainingWithImprovement: 'You marked data use as no training/improvement, but also selected concrete improvement or evaluation uses. Review that combination.',
          contradictionOptOutWithoutEligibleUse: 'You configured an opt-out for training or improvement, but the selected data-use mode does not clearly suggest a training/improvement flow that would require that control.',
          contradictionOptOutMethodWithoutOptOut: 'You filled in an opt-out method, but also marked that no such control exists. Review which of those statements reflects the real workflow.',
          contradictionHiddenAiLabeling: 'You marked AI-generated content labeling, but also said AI is not visible to users or customers. Review whether both statements match the product.',
          contradictionNoHumanReviewWithAppeal: 'You declared a review or appeal channel, but also marked that no human review is available. Review whether you want human escalation or different wording.',
          contradictionPersonalDataDeniedWithOperationalSources: 'You marked that no personal data is involved, but also selected sources such as user inputs, service logs, or feedback that often contain it. Clarify whether those data are excluded, anonymized, or isolated before those uses.'
        };

    const errors = [];
    const warnings = [];

    if (!data.business.name) errors.push(messages.missingBusinessName);
    if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
    if (data.ai.systemsUsed.length === 0) warnings.push(messages.missingSystems);
    if (data.ai.useCases.length === 0) warnings.push(messages.missingUseCases);
    if (!data.ai.trainingDataUse) errors.push(messages.missingTrainingDisclosure);
    if (data.ai.dataSources.length === 0) warnings.push(messages.missingDataSources);
    if (data.ai.optOutAvailable && !data.ai.optOutMethod) warnings.push(messages.missingOptOutMethod);
    if (!data.ai.retentionPeriod) warnings.push(messages.missingRetention);
    if (data.ai.thirdPartyProviders.length === 0) warnings.push(messages.missingProviders);
    if (data.ai.automatedDecisionMaking && !data.ai.appealChannel) warnings.push(messages.missingAppealChannel);
    if (!data.ai.sensitiveDataRestrictions) warnings.push(messages.missingSensitiveRestrictions);
    if (!data.ai.securityControls) warnings.push(messages.missingSecurityControls);
    if (data.ai.automatedDecisionMaking && !data.ai.humanReviewAvailable) warnings.push(messages.noHumanReviewWarning);
    if (data.ai.trainingDataUse === 'no_training' && data.ai.modelImprovementUses.length > 0) warnings.push(messages.contradictionNoTrainingWithImprovement);
    if (data.ai.optOutAvailable && ['no_training', 'evaluation_only'].includes(data.ai.trainingDataUse)) warnings.push(messages.contradictionOptOutWithoutEligibleUse);
    if (!data.ai.optOutAvailable && data.ai.optOutMethod) warnings.push(messages.contradictionOptOutMethodWithoutOptOut);
    if (!data.ai.userFacingAi && data.ai.generatedContentLabeling) warnings.push(messages.contradictionHiddenAiLabeling);
    if (!data.ai.humanReviewAvailable && data.ai.appealChannel) warnings.push(messages.contradictionNoHumanReviewWithAppeal);
    if (
      !data.ai.personalDataInTraining
      && ['model_training', 'service_improvement'].includes(data.ai.trainingDataUse)
      && data.ai.dataSources.some((value) => ['customer_inputs', 'service_logs', 'feedback_signals'].includes(value))
    ) {
      warnings.push(messages.contradictionPersonalDataDeniedWithOperationalSources);
    }

    return { data, errors, warnings };
  }

  buildSections(data) {
    const sections = [
      this.section('overview', this.text('Overview', 'Resumen'), [
        this.interpolate(this.text(
          '{business_name} publishes this AI use and training data policy to explain how artificial intelligence systems may be used in connection with {website}, how related data may be handled, and what controls or limits apply.',
          '{business_name} publica esta política de uso de IA y datos de entrenamiento para explicar cómo pueden usarse sistemas de inteligencia artificial en relación con {website}, cómo pueden tratarse los datos vinculados y qué controles o límites aplican.'
        ), data)
      ]),
      this.section('systems', this.text('AI Systems and Use Cases', 'Sistemas de IA y casos de uso'), [
        this.systemsText(data)
      ]),
      this.section('training', this.text('Training, Evaluation, and Model Improvement', 'Entrenamiento, evaluación y mejora de modelos'), [
        this.trainingText(data)
      ]),
      this.section('sources', this.text('Data Sources and Providers', 'Fuentes de datos y proveedores'), [
        this.sourcesText(data)
      ]),
      this.section('retention', this.text('Retention, Opt-Out, and User Controls', 'Retención, opt-out y controles del usuario'), [
        this.retentionText(data)
      ]),
      this.section('decisions', this.text('Automated Decisions and Human Review', 'Decisiones automatizadas y revisión humana'), [
        this.decisionText(data)
      ]),
      this.section('safeguards', this.text('Restrictions, Security, and Safeguards', 'Restricciones, seguridad y salvaguardas'), [
        this.safeguardsText(data)
      ]),
      this.section('contact', this.text('Contact Information', 'Información de contacto'), [
        this.contactText(data)
      ])
    ];

    if (data.ai.transparencyNotes) {
      sections.splice(sections.length - 1, 0, this.section('additional-transparency', this.text('Additional Transparency Notes', 'Notas adicionales de transparencia'), [
        data.ai.transparencyNotes
      ]));
    }

    if (data.ai.notes.length > 0) {
      sections.splice(sections.length - 1, 0, this.section('additional-notes', this.text('Additional Notes', 'Notas adicionales'), data.ai.notes));
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
      .replaceAll('{website}', data.business.websiteUrl || '');
  }

  systemsText(data) {
    const parts = [];
    if (data.ai.systemsUsed.length > 0) {
      parts.push(`${this.text('AI systems or features in scope', 'Sistemas o funciones de IA alcanzados')}: ${data.ai.systemsUsed.map((value) => this.systemLabel(value)).join(', ')}.`);
    }
    if (data.ai.useCases.length > 0) {
      parts.push(`${this.text('Primary use cases', 'Casos de uso principales')}: ${data.ai.useCases.map((value) => this.useCaseLabel(value)).join(', ')}.`);
    }
    parts.push(this.text(
      data.ai.userFacingAi
        ? 'Some AI-supported features may be visible to end users, customers, or staff interacting with the service.'
        : 'AI use may be limited to internal support, moderation, analytics, or operational workflows rather than direct end-user interactions.',
      data.ai.userFacingAi
        ? 'Algunas funciones asistidas por IA pueden ser visibles para usuarios finales, clientes o personal que interactúe con el servicio.'
        : 'El uso de IA puede limitarse a soporte interno, moderación, analítica u operaciones, sin interacción directa con usuarios finales.'
    ));
    if (data.ai.generatedContentLabeling) {
      parts.push(this.text(
        'Where appropriate, the service may label or otherwise indicate content that is AI-generated or materially AI-assisted.',
        'Cuando corresponda, el servicio puede etiquetar o indicar de otro modo el contenido generado por IA o materialmente asistido por IA.'
      ));
    }
    return parts.join(' ');
  }

  trainingText(data) {
    const policy = {
      no_training: this.text(
        'Customer or user data is not used to train, fine-tune, or improve general-purpose or product models, except where strictly necessary for safety, abuse prevention, or separately disclosed evaluation workflows.',
        'Los datos de clientes o usuarios no se usan para entrenar, ajustar o mejorar modelos de propósito general o del producto, salvo cuando sea estrictamente necesario para seguridad, prevención de abuso o flujos de evaluación informados por separado.'
      ),
      evaluation_only: this.text(
        'Relevant data may be used in limited ways for evaluation, benchmarking, quality review, or safety testing, but not for broad model training unless separately disclosed.',
        'Ciertos datos pueden usarse de forma limitada para evaluación, benchmarking, revisión de calidad o pruebas de seguridad, pero no para entrenamiento amplio de modelos salvo aviso separado.'
      ),
      service_improvement: this.text(
        'Relevant prompts, outputs, feedback, or related signals may be used to improve product quality, safety, workflows, or narrow model behavior within the service context.',
        'Prompts, outputs, feedback u otras señales relacionadas pueden usarse para mejorar calidad, seguridad, flujos o comportamiento acotado del producto dentro del contexto del servicio.'
      ),
      model_training: this.text(
        'Relevant prompts, outputs, feedback, or associated data may be used for model training, fine-tuning, or broader model improvement, subject to applicable legal basis, safeguards, and user controls described in this policy.',
        'Prompts, outputs, feedback o datos asociados pueden usarse para entrenamiento, fine-tuning o mejora más amplia de modelos, sujeto a base legal aplicable, salvaguardas y controles descriptos en esta política.'
      )
    }[data.ai.trainingDataUse] || '';

    const parts = [policy];

    if (data.ai.personalDataInTraining) {
      parts.push(this.text(
        'Where personal data may appear in AI-related workflows, the service should apply minimization, restrictions, and governance measures appropriate to the context and legal basis used.',
        'Cuando puedan aparecer datos personales en flujos vinculados a IA, el servicio debería aplicar minimización, restricciones y medidas de gobernanza adecuadas al contexto y la base legal utilizada.'
      ));
    } else {
      parts.push(this.text(
        'The service aims to avoid or minimize the inclusion of personal data in AI training or model-improvement workflows wherever reasonably possible.',
        'El servicio busca evitar o minimizar, siempre que sea razonablemente posible, la inclusión de datos personales en flujos de entrenamiento o mejora de modelos.'
      ));
    }

    if (data.ai.modelImprovementUses.length > 0) {
      parts.push(`${this.text('Specific improvement uses', 'Usos concretos para mejora')}: ${data.ai.modelImprovementUses.map((value) => this.improvementLabel(value)).join(', ')}.`);
    }

    return parts.filter(Boolean).join(' ');
  }

  sourcesText(data) {
    const parts = [];
    if (data.ai.dataSources.length > 0) {
      parts.push(`${this.text('Relevant data sources', 'Fuentes de datos relevantes')}: ${data.ai.dataSources.map((value) => this.dataSourceLabel(value)).join(', ')}.`);
    }
    if (data.ai.thirdPartyProviders.length > 0) {
      parts.push(`${this.text('Third-party or model providers', 'Proveedores terceros o model providers')}: ${data.ai.thirdPartyProviders.map((value) => this.providerLabel(value)).join(', ')}.`);
    }
    parts.push(this.text(
      'Where third-party model or infrastructure providers are used, data sharing, retention, and contractual controls should be reviewed against the service’s legal and operational requirements.',
      'Cuando se usen proveedores externos de modelos o infraestructura, el intercambio de datos, la retención y los controles contractuales deberían revisarse frente a las exigencias legales y operativas del servicio.'
    ));
    return parts.join(' ');
  }

  retentionText(data) {
    const parts = [];
    if (data.ai.retentionPeriod) {
      parts.push(`${this.text('Retention approach', 'Criterio de retención')}: ${this.sentence(data.ai.retentionPeriod)}`);
    }
    if (data.ai.optOutAvailable) {
      parts.push(this.text(
        'The service offers a mechanism to limit or opt out of certain AI training or model-improvement uses where described for the relevant account, feature, or workflow.',
        'El servicio ofrece un mecanismo para limitar o excluir ciertos usos de entrenamiento o mejora de modelos, cuando así se indique para la cuenta, función o flujo correspondiente.'
      ));
      if (data.ai.optOutMethod) {
        parts.push(`${this.text('Opt-out method', 'Método de opt-out')}: ${this.sentence(data.ai.optOutMethod)}`);
      }
    } else {
      parts.push(this.text(
        'No general opt-out may be available for every AI-related workflow, especially where processing is required for security, abuse prevention, service delivery, or legally justified evaluation.',
        'Puede no existir un opt-out general para todos los flujos vinculados a IA, especialmente cuando el tratamiento sea necesario para seguridad, prevención de abuso, prestación del servicio o evaluación jurídicamente justificada.'
      ));
    }
    return parts.join(' ');
  }

  decisionText(data) {
    const parts = [
      this.text(
        data.ai.automatedDecisionMaking
          ? 'AI-supported outputs or scoring may contribute to automated or semi-automated decisions within the service.'
          : 'AI outputs are intended primarily as assistive, supportive, or informational tools rather than sole drivers of automated decisions with meaningful effects.',
        data.ai.automatedDecisionMaking
          ? 'Los outputs o puntajes asistidos por IA pueden contribuir a decisiones automatizadas o semiautomatizadas dentro del servicio.'
          : 'Los outputs de IA están pensados principalmente como herramientas de asistencia, soporte o información, y no como únicos determinantes de decisiones automatizadas con efectos relevantes.'
      )
    ];

    parts.push(this.text(
      data.ai.humanReviewAvailable
        ? 'Human review, escalation, or override may be available depending on the feature, account tier, support channel, or operational process involved.'
        : 'Human review may not be available in every AI workflow, so users should avoid relying on AI outputs as sole substitutes for material business, legal, financial, medical, or safety decisions.',
      data.ai.humanReviewAvailable
        ? 'Puede existir revisión humana, escalamiento o override según la función, el plan, el canal de soporte o el proceso operativo involucrado.'
        : 'Puede no haber revisión humana en todos los flujos de IA, por lo que los usuarios deberían evitar depender de los outputs de IA como sustituto único para decisiones materiales de negocio, legales, financieras, médicas o de seguridad.'
    ));

    if (data.ai.appealChannel) {
      parts.push(`${this.text('Review or support channel', 'Canal para revisión o soporte')}: ${this.sentence(data.ai.appealChannel)}`);
    }

    return parts.join(' ');
  }

  safeguardsText(data) {
    const parts = [];
    if (data.ai.sensitiveDataRestrictions) {
      parts.push(`${this.text('Sensitive or restricted data handling', 'Tratamiento de datos sensibles o restringidos')}: ${this.sentence(data.ai.sensitiveDataRestrictions)}`);
    }
    if (data.ai.securityControls) {
      parts.push(`${this.text('Security and minimization controls', 'Controles de seguridad y minimización')}: ${this.sentence(data.ai.securityControls)}`);
    }
    parts.push(this.text(
      'AI outputs may be incomplete, probabilistic, biased, outdated, or otherwise imperfect. Users should apply judgment, internal controls, and feature-appropriate review before relying on outputs in sensitive contexts.',
      'Los outputs de IA pueden ser incompletos, probabilísticos, sesgados, desactualizados o imperfectos. Los usuarios deberían aplicar criterio, controles internos y revisión adecuada antes de confiar en ellos en contextos sensibles.'
    ));
    return parts.join(' ');
  }

  contactText(data) {
    const parts = [];
    if (data.contact.email) parts.push(this.text(`Primary contact email: ${data.contact.email}.`, `Email principal de contacto: ${data.contact.email}.`));
    if (data.contact.pageUrl) parts.push(this.text(`Reference page or contact URL: ${data.contact.pageUrl}.`, `Página o URL de referencia: ${data.contact.pageUrl}.`));
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
      '  <meta name="legal-document-type" content="ai-policy">',
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

  sentence(value) {
    const normalized = this.stringValue(value);
    if (!normalized) return '';
    return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
  }

  systemLabel(value) {
    const labels = {
      chatbot_or_assistant: this.text('chatbots or assistants', 'chatbots o asistentes'),
      content_generation: this.text('content generation', 'generación de contenido'),
      ranking_or_recommendation: this.text('ranking or recommendations', 'ranking o recomendaciones'),
      classification_or_moderation: this.text('classification or moderation', 'clasificación o moderación'),
      analytics_or_forecasting: this.text('analytics or forecasting', 'analítica o predicción')
    };
    return labels[value] || value;
  }

  useCaseLabel(value) {
    const labels = {
      customer_support: this.text('customer support', 'soporte al cliente'),
      drafting_or_generation: this.text('drafting or generation', 'redacción o generación'),
      search_and_retrieval: this.text('search and retrieval', 'búsqueda y retrieval'),
      moderation_or_safety: this.text('moderation or safety', 'moderación o seguridad'),
      internal_operations: this.text('internal operations', 'operación interna')
    };
    return labels[value] || value;
  }

  dataSourceLabel(value) {
    const labels = {
      customer_inputs: this.text('customer or user inputs', 'inputs del cliente o usuario'),
      service_logs: this.text('service logs and telemetry', 'logs y telemetría del servicio'),
      feedback_signals: this.text('explicit feedback signals', 'feedback explícito'),
      public_or_licensed_data: this.text('public or licensed data', 'datos públicos o licenciados'),
      synthetic_or_test_data: this.text('synthetic or test data', 'datos sintéticos o de prueba')
    };
    return labels[value] || value;
  }

  improvementLabel(value) {
    const labels = {
      quality_evaluation: this.text('quality evaluation', 'evaluación de calidad'),
      safety_testing: this.text('safety testing', 'pruebas de seguridad'),
      fine_tuning: this.text('fine-tuning', 'fine-tuning'),
      product_analytics: this.text('product analytics', 'analítica del producto')
    };
    return labels[value] || value;
  }

  providerLabel(value) {
    const labels = {
      third_party_model_api: this.text('third-party model APIs', 'APIs de modelos de terceros'),
      cloud_infrastructure: this.text('cloud infrastructure', 'infraestructura cloud'),
      annotation_or_review_vendor: this.text('annotation or review vendors', 'vendors de anotación o revisión'),
      monitoring_or_safety_tooling: this.text('monitoring or safety tooling', 'herramientas de monitoreo o safety')
    };
    return labels[value] || value;
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

module.exports = AiPolicyGenerator;
