class DataProcessingAgreementGenerator {
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
      title: language === 'es' ? 'Acuerdo de Tratamiento de Datos (DPA)' : 'Data Processing Agreement (DPA)',
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
      dpa: {
        counterpartyName: this.stringValue(input.dpa?.counterpartyName),
        counterpartyRole: this.stringValue(input.dpa?.counterpartyRole, 'controller'),
        regulatoryScope: this.arrayValue(input.dpa?.regulatoryScope),
        servicesDescription: this.stringValue(input.dpa?.servicesDescription),
        duration: this.stringValue(input.dpa?.duration),
        processingPurpose: this.stringValue(input.dpa?.processingPurpose),
        personalDataCategories: this.arrayValue(input.dpa?.personalDataCategories),
        dataSubjectCategories: this.arrayValue(input.dpa?.dataSubjectCategories),
        instructionsChannel: this.stringValue(input.dpa?.instructionsChannel),
        confidentialityMeasures: this.stringValue(input.dpa?.confidentialityMeasures),
        securityMeasures: this.stringValue(input.dpa?.securityMeasures),
        subprocessorsUsed: this.booleanValue(input.dpa?.subprocessorsUsed, true),
        subprocessorAuthorization: this.stringValue(input.dpa?.subprocessorAuthorization),
        subprocessorObjectionWindow: this.stringValue(input.dpa?.subprocessorObjectionWindow),
        subprocessorMethodology: this.stringValue(input.dpa?.subprocessorMethodology),
        internationalTransfers: this.booleanValue(input.dpa?.internationalTransfers, false),
        transferMechanism: this.stringValue(input.dpa?.transferMechanism),
        transferSupplementarySafeguards: this.stringValue(input.dpa?.transferSupplementarySafeguards),
        breachNotificationTime: this.stringValue(input.dpa?.breachNotificationTime),
        assistanceCommitments: this.stringValue(input.dpa?.assistanceCommitments),
        deletionReturnPeriod: this.stringValue(input.dpa?.deletionReturnPeriod),
        backupRetentionHandling: this.stringValue(input.dpa?.backupRetentionHandling),
        auditMechanism: this.stringValue(input.dpa?.auditMechanism),
        auditNoticePeriod: this.stringValue(input.dpa?.auditNoticePeriod),
        auditRights: this.stringValue(input.dpa?.auditRights),
        governingLaw: this.stringValue(input.dpa?.governingLaw),
        euSccRequired: this.booleanValue(input.dpa?.euSccRequired, false),
        notes: this.arrayValue(input.dpa?.notes)
      },
      settings: {
        language: this.stringValue(input.settings?.language, 'es')
      }
    };

    const messages = data.settings.language === 'es'
      ? {
          missingBusinessName: 'El nombre del negocio o proveedor es obligatorio.',
          missingWebsite: 'La URL principal del servicio es obligatoria.',
          missingCounterparty: 'Debés identificar a la contraparte del DPA (por ejemplo, el cliente o controller).',
          missingRegulatoryScope: 'Conviene indicar el alcance regulatorio o las regiones relevantes del cliente para no subestimar obligaciones tipo GDPR, UK GDPR u otras. Esto importa especialmente si vendés a clientes UE/UK aunque tu empresa esté fuera de esa región.',
          missingServices: 'Debés describir el servicio SaaS o el alcance principal del procesamiento. Sin eso, el DPA queda demasiado abstracto para saber qué operaciones cubre realmente.',
          missingPurpose: 'Conviene describir la naturaleza y la finalidad del tratamiento. Esto ayuda a que el DPA no quede genérico y suele ser importante cuando el cliente necesita mapear instrucciones, soporte, hosting o analytics.',
          missingPersonalDataCategories: 'Conviene indicar qué categorías de datos personales se procesan. Esto es especialmente útil para clientes enterprise, evaluaciones de vendor risk o anexos estilo GDPR Art. 28.',
          missingDataSubjects: 'Conviene indicar qué categorías de titulares o usuarios están involucradas. Esto importa especialmente si tratás empleados del cliente, usuarios finales, prospects o datos mixtos.',
          missingSecurityMeasures: 'Conviene resumir medidas técnicas y organizativas de seguridad. Sin eso, el DPA queda flojo para procurement, vendor review o contratos enterprise.',
          missingDeletionPeriod: 'Conviene indicar qué pasa con los datos al finalizar el servicio. Esto importa especialmente si el cliente espera devolución, borrado, backups controlados o retenciones legales limitadas.',
          subprocessorsNeedMethodology: 'Si usás subencargados o subprocessors, conviene explicar cómo se autorizan y controlan. Esto suele ser importante para clientes B2B que revisan hosting, soporte, cloud o proveedores operativos.',
          missingSubprocessorAuthorization: 'Si usás subprocessors, conviene aclarar si funcionan con autorización general, consentimiento específico o la mecánica que defina el contrato principal.',
          missingSubprocessorObjectionWindow: 'Si usás autorización general de subprocessors, conviene indicar si existe ventana de objeción o aviso previo para cambios materiales.',
          transfersNeedMechanism: 'Si hay transferencias internacionales, conviene aclarar el mecanismo contractual o legal utilizado. Esto importa especialmente para clientes UE/UK o para soporte, hosting y accesos cross-border.',
          sccNeedsTransferMechanism: 'Si marcás que puede requerirse SCC, conviene indicar el mecanismo de transferencias o el proceso contractual asociado. Si no, el cliente ve la mención pero no entiende cómo se implementa.',
          missingTransferSafeguards: 'Si hay transferencias internacionales, conviene indicar salvaguardas complementarias como regionalización, minimización, cifrado, segregación o evaluación de vendors.',
          missingIncidentTiming: 'Conviene indicar en cuánto tiempo se notifican incidentes o brechas relevantes. Esto importa especialmente en contratos enterprise, seguridad SaaS y obligaciones de respuesta rápida.',
          missingBackupHandling: 'Conviene explicar cómo se tratan backups o copias de seguridad al cierre del servicio, especialmente si no se borran de forma inmediata.',
          missingAuditRights: 'Conviene aclarar cómo se ejercen derechos de auditoría o acceso a información sobre el tratamiento. Esto es especialmente útil si ofrecés certificaciones, cuestionarios o evidencia documental en vez de auditoría onsite.',
          missingAuditMechanism: 'Conviene indicar si la auditoría se satisface con cuestionarios, certificaciones, revisión remota o un mecanismo definido por contrato.',
          missingAuditNotice: 'Conviene indicar si las auditorías requieren preaviso o coordinación razonable, sobre todo en contratos enterprise o revisiones de vendor risk.',
          contradictionSubprocessorMethodWithoutSubprocessors: 'Completaste una metodología de subprocessors, pero también marcaste que no usás subencargados. Revisá cuál de las dos cosas refleja tu operación real para no describir una cadena de proveedores inexistente.',
          contradictionTransferMechanismWithoutTransfers: 'Indicás un mecanismo de transferencias, pero también marcaste que no hay transferencias internacionales. Revisá si realmente existe acceso, hosting o soporte transfronterizo, o si esa cláusula quedó de más.',
          contradictionSccWithoutTransfers: 'Marcaste que podrían requerirse SCC o cláusulas equivalentes, pero también marcaste que no hay transferencias internacionales. Conviene revisar si el flujo realmente involucra transferencias o si esa cláusula sobra en este contrato.',
          contradictionSccWithoutEuUkScope: 'Marcaste SCC o cláusulas equivalentes, pero no señalaste alcance regulatorio UE/UK. Conviene confirmar si el cliente, los datos o el marco contractual igualmente exigen esas salvaguardas, o si bastaría otra lógica contractual.',
          contradictionJointControllerTemplate: 'Marcaste que la contraparte actúa como joint controller, pero esta plantilla está orientada principalmente a relaciones controller-processor. Conviene revisión legal específica si realmente hay corresponsabilidad, porque podrían faltar cláusulas propias de un acuerdo de joint controllership.'
        }
      : {
          missingBusinessName: 'Business or provider name is required.',
          missingWebsite: 'Primary service URL is required.',
          missingCounterparty: 'You must identify the DPA counterparty (for example, the customer or controller).',
          missingRegulatoryScope: 'You should indicate the customer regulatory scope or relevant regions so GDPR, UK GDPR, or similar expectations are not understated. This matters especially if you sell to EU/UK customers even when your company is based elsewhere.',
          missingServices: 'You must describe the SaaS service or main processing scope. Without that, the DPA stays too abstract to show what operations are actually covered.',
          missingPurpose: 'You should describe the nature and purpose of the processing. This helps keep the DPA from sounding generic and matters when the customer is mapping hosting, support, instructions, or analytics flows.',
          missingPersonalDataCategories: 'You should identify the categories of personal data processed. This is especially useful for enterprise customers, vendor-risk reviews, or GDPR-style Annex mapping.',
          missingDataSubjects: 'You should identify the categories of data subjects involved. This matters especially if you process customer employees, end users, prospects, or mixed populations.',
          missingSecurityMeasures: 'You should summarize the technical and organizational security measures. Without that, the DPA is weak for procurement, vendor review, or enterprise contracting.',
          missingDeletionPeriod: 'You should explain what happens to data when the service ends. This matters especially when customers expect return, deletion, controlled backups, or limited legal retention.',
          subprocessorsNeedMethodology: 'If subprocessors are used, you should explain how they are authorized and controlled. This is commonly important for B2B customers reviewing hosting, support, cloud, or operational vendors.',
          missingSubprocessorAuthorization: 'If subprocessors are used, you should clarify whether they rely on general authorization, specific approval, or the mechanism defined in the main contract.',
          missingSubprocessorObjectionWindow: 'If you rely on general subprocessor authorization, you should explain whether customers get notice or an objection window for material vendor changes.',
          transfersNeedMechanism: 'If international transfers occur, you should explain the contractual or legal transfer mechanism used. This matters especially for EU/UK customers or cross-border hosting, support, and access.',
          sccNeedsTransferMechanism: 'If you flag SCC as potentially required, you should describe the transfer mechanism or related contractual process. Otherwise the customer sees the clause but not how it is actually implemented.',
          missingTransferSafeguards: 'If international transfers occur, you should also describe supplementary safeguards such as regional hosting, minimization, encryption, segregation, or vendor review.',
          missingIncidentTiming: 'You should state how quickly relevant incidents or breaches will be notified. This matters especially in enterprise contracts, SaaS security reviews, and rapid-response commitments.',
          missingBackupHandling: 'You should explain how backups or security copies are treated when the service ends, especially if they are not deleted immediately.',
          missingAuditRights: 'You should explain how audit or information rights are exercised under the agreement. This is especially useful if you provide certifications, questionnaires, or documentary evidence instead of onsite audits.',
          missingAuditMechanism: 'You should indicate whether audit rights are typically handled through questionnaires, certifications, remote review, or another contract-defined mechanism.',
          missingAuditNotice: 'You should indicate whether audits require reasonable prior notice or coordination, especially in enterprise contracts or vendor-risk reviews.',
          contradictionSubprocessorMethodWithoutSubprocessors: 'You filled in a subprocessor methodology, but also marked that no subprocessors are used. Review which statement reflects the real operating model so the DPA does not describe a vendor chain that does not exist.',
          contradictionTransferMechanismWithoutTransfers: 'You provided a transfer mechanism, but also marked that no international transfers occur. Review whether cross-border hosting, access, or support actually exists, or whether that clause is leftover boilerplate.',
          contradictionSccWithoutTransfers: 'You flagged SCC or equivalent clauses, but also marked that no international transfers occur. Review whether the flow really involves transfers or whether that clause is unnecessary in this contract.',
          contradictionSccWithoutEuUkScope: 'You flagged SCC or equivalent clauses, but did not mark EU/UK regulatory scope. Confirm whether the customer, data, or contract still requires those safeguards, or whether a different contractual approach would be more accurate.',
          contradictionJointControllerTemplate: 'You marked the counterparty as a joint controller, but this template is mainly oriented to controller-processor relationships. Legal review is recommended if joint controllership is real, because a dedicated joint-controller arrangement may need additional clauses.'
        };

    const errors = [];
    const warnings = [];

    if (!data.business.name) errors.push(messages.missingBusinessName);
    if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
    if (!data.dpa.counterpartyName) errors.push(messages.missingCounterparty);
    if (data.dpa.regulatoryScope.length === 0) warnings.push(messages.missingRegulatoryScope);
    if (!data.dpa.servicesDescription) errors.push(messages.missingServices);
    if (!data.dpa.processingPurpose) warnings.push(messages.missingPurpose);
    if (data.dpa.personalDataCategories.length === 0) warnings.push(messages.missingPersonalDataCategories);
    if (data.dpa.dataSubjectCategories.length === 0) warnings.push(messages.missingDataSubjects);
    if (!data.dpa.securityMeasures) warnings.push(messages.missingSecurityMeasures);
    if (!data.dpa.deletionReturnPeriod) warnings.push(messages.missingDeletionPeriod);
    if (data.dpa.subprocessorsUsed && !data.dpa.subprocessorMethodology) warnings.push(messages.subprocessorsNeedMethodology);
    if (data.dpa.subprocessorsUsed && !data.dpa.subprocessorAuthorization) warnings.push(messages.missingSubprocessorAuthorization);
    if (data.dpa.subprocessorsUsed && data.dpa.subprocessorAuthorization === 'general_authorization' && !data.dpa.subprocessorObjectionWindow) warnings.push(messages.missingSubprocessorObjectionWindow);
    if (data.dpa.internationalTransfers && !data.dpa.transferMechanism) warnings.push(messages.transfersNeedMechanism);
    if (data.dpa.euSccRequired && !data.dpa.transferMechanism) warnings.push(messages.sccNeedsTransferMechanism);
    if (data.dpa.internationalTransfers && !data.dpa.transferSupplementarySafeguards) warnings.push(messages.missingTransferSafeguards);
    if (!data.dpa.breachNotificationTime) warnings.push(messages.missingIncidentTiming);
    if (!data.dpa.backupRetentionHandling) warnings.push(messages.missingBackupHandling);
    if (!data.dpa.auditRights) warnings.push(messages.missingAuditRights);
    if (!data.dpa.auditMechanism) warnings.push(messages.missingAuditMechanism);
    if (data.dpa.auditMechanism && !data.dpa.auditNoticePeriod) warnings.push(messages.missingAuditNotice);
    if (!data.dpa.subprocessorsUsed && data.dpa.subprocessorMethodology) warnings.push(messages.contradictionSubprocessorMethodWithoutSubprocessors);
    if (!data.dpa.internationalTransfers && data.dpa.transferMechanism) warnings.push(messages.contradictionTransferMechanismWithoutTransfers);
    if (!data.dpa.internationalTransfers && data.dpa.euSccRequired) warnings.push(messages.contradictionSccWithoutTransfers);
    if (data.dpa.euSccRequired && !data.dpa.regulatoryScope.some((value) => ['eu', 'uk'].includes(value))) warnings.push(messages.contradictionSccWithoutEuUkScope);
    if (data.dpa.counterpartyRole === 'joint_controller') warnings.push(messages.contradictionJointControllerTemplate);

    return { data, errors, warnings };
  }

  buildSections(data) {
    const sections = [
      this.section('overview', this.text('Overview', 'Resumen'), [
        this.interpolate(this.text(
          'This Data Processing Agreement governs how {business_name} processes personal data on behalf of {counterparty_name} in connection with the services described for {website}.',
          'Este Acuerdo de Tratamiento de Datos regula cómo {business_name} trata datos personales por cuenta de {counterparty_name} en relación con los servicios descriptos para {website}.'
        ), data),
        this.dpaLegalContext(data)
      ]),
      this.section('roles', this.text('Roles, Scope, and Subject Matter', 'Roles, alcance y objeto'), [
        this.rolesText(data)
      ]),
      this.section('instructions', this.text('Documented Instructions and Processing Purpose', 'Instrucciones documentadas y finalidad del tratamiento'), [
        this.instructionsText(data)
      ]),
      this.section('confidentiality-security', this.text('Confidentiality and Security Measures', 'Confidencialidad y medidas de seguridad'), [
        this.securityText(data)
      ]),
      this.section('subprocessors', this.text('Subprocessors', 'Subencargados / subprocessors'), [
        this.subprocessorsText(data)
      ]),
      this.section('transfers', this.text('International Transfers', 'Transferencias internacionales'), [
        this.transfersText(data)
      ]),
      this.section('assistance-incidents', this.text('Assistance, Requests, and Incidents', 'Asistencia, solicitudes e incidentes'), [
        this.assistanceText(data)
      ]),
      this.section('deletion', this.text('Return or Deletion of Data', 'Devolución o eliminación de datos'), [
        this.deletionText(data)
      ]),
      this.section('audit', this.text('Audit and Information Rights', 'Derechos de auditoría e información'), [
        this.auditText(data)
      ]),
      this.section('contact', this.text('Contact Information', 'Información de contacto'), [
        this.contactText(data)
      ])
    ];

    if (data.dpa.notes.length > 0) {
      sections.splice(sections.length - 1, 0, this.section('additional-notes', this.text('Additional Notes', 'Notas adicionales'), data.dpa.notes));
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
      .replaceAll('{counterparty_name}', data.dpa.counterpartyName || this.text('the customer', 'la contraparte'));
  }

  dpaLegalContext(data) {
    const mentionsEuStyle = data.dpa.euSccRequired
      || data.dpa.regulatoryScope.some((value) => ['eu', 'uk'].includes(value))
      || ['eu', 'uk'].includes(this.inferJurisdiction(data.business.country));
    return mentionsEuStyle
      ? this.text(
        'Where applicable, this agreement is intended to support controller-processor obligations and contractual requirements commonly associated with Article 28 GDPR and similar data processing frameworks.',
        'Cuando corresponda, este acuerdo busca respaldar obligaciones controller-processor y exigencias contractuales comúnmente asociadas al Artículo 28 del GDPR y marcos similares de tratamiento de datos.'
      )
      : this.text(
        'This agreement is intended to define baseline contractual obligations for processor-style handling of personal data in a SaaS or B2B service context.',
        'Este acuerdo busca definir obligaciones contractuales mínimas para un tratamiento estilo processor en un contexto SaaS o B2B.'
      );
  }

  rolesText(data) {
    const counterpartyRole = data.dpa.counterpartyRole === 'processor'
      ? this.text('processor', 'processor')
      : data.dpa.counterpartyRole === 'joint_controller'
        ? this.text('joint controller', 'joint controller')
        : this.text('controller', 'controller');

    const fragments = [
      this.interpolate(this.text(
        '{business_name} acts as a processor or service provider for the personal data described in this agreement, while {counterparty_name} acts as the {counterparty_role} unless the parties document another allocation of roles.',
        '{business_name} actúa como processor o prestador de servicios respecto de los datos personales descriptos en este acuerdo, mientras que {counterparty_name} actúa como {counterparty_role}, salvo que las partes documenten otra asignación de roles.'
      ).replaceAll('{counterparty_role}', counterpartyRole), data),
      data.dpa.servicesDescription
        ? `${this.text('Service scope', 'Alcance del servicio')}: ${this.sentence(data.dpa.servicesDescription)}`
        : '',
      data.dpa.duration
        ? `${this.text('Processing duration', 'Duración del tratamiento')}: ${this.sentence(data.dpa.duration)}`
        : '',
      data.dpa.regulatoryScope.length > 0
        ? `${this.text('Relevant regulatory scope', 'Alcance regulatorio relevante')}: ${data.dpa.regulatoryScope.map((value) => this.regulatoryScopeLabel(value)).join(', ')}.`
        : '',
      data.dpa.personalDataCategories.length > 0
        ? `${this.text('Categories of personal data', 'Categorías de datos personales')}: ${data.dpa.personalDataCategories.join(', ')}.`
        : '',
      data.dpa.dataSubjectCategories.length > 0
        ? `${this.text('Categories of data subjects', 'Categorías de titulares')}: ${data.dpa.dataSubjectCategories.join(', ')}.`
        : ''
    ];
    return fragments.filter(Boolean).join(' ');
  }

  instructionsText(data) {
    const parts = [];
    if (data.dpa.processingPurpose) {
      parts.push(`${this.text('Nature and purpose of processing', 'Naturaleza y finalidad del tratamiento')}: ${this.sentence(data.dpa.processingPurpose)}`);
    }
    parts.push(this.text(
      'The processor will handle personal data only on documented instructions from the controller or customer, unless a binding legal obligation requires another action.',
      'El processor tratará datos personales únicamente sobre la base de instrucciones documentadas del controller o cliente, salvo que una obligación legal vinculante exija otra actuación.'
    ));
    if (data.dpa.instructionsChannel) {
      parts.push(`${this.text('Instruction channel', 'Canal para instrucciones')}: ${this.sentence(data.dpa.instructionsChannel)}`);
    }
    return parts.join(' ');
  }

  securityText(data) {
    const parts = [
      this.text(
        'Personnel authorized to process personal data must be subject to confidentiality duties and access restrictions appropriate to the service.',
        'El personal autorizado para tratar datos personales debe estar sujeto a deberes de confidencialidad y restricciones de acceso apropiadas para el servicio.'
      )
    ];
    if (data.dpa.confidentialityMeasures) {
      parts.push(`${this.text('Confidentiality controls', 'Controles de confidencialidad')}: ${this.sentence(data.dpa.confidentialityMeasures)}`);
    }
    if (data.dpa.securityMeasures) {
      parts.push(`${this.text('Technical and organizational measures', 'Medidas técnicas y organizativas')}: ${this.sentence(data.dpa.securityMeasures)}`);
    }
    return parts.join(' ');
  }

  subprocessorsText(data) {
    if (!data.dpa.subprocessorsUsed) {
      return this.text(
        'The processor does not expect to engage subprocessors for the covered processing unless the agreement is updated or the customer is otherwise informed.',
        'El processor no prevé contratar subprocessors para el tratamiento cubierto, salvo actualización del acuerdo o información previa a la contraparte.'
      );
    }

    return [
      this.text(
        'The processor may engage subprocessors to support infrastructure, hosting, support, communications, analytics, or related service operations, provided that appropriate contractual obligations are imposed on those subprocessors.',
        'El processor puede contratar subprocessors para infraestructura, hosting, soporte, comunicaciones, analítica u operaciones relacionadas con el servicio, siempre que se les impongan obligaciones contractuales apropiadas.'
      ),
      data.dpa.subprocessorMethodology
        ? `${this.text('Subprocessor approach', 'Criterio sobre subprocessors')}: ${this.sentence(data.dpa.subprocessorMethodology)}`
        : '',
      data.dpa.subprocessorAuthorization
        ? `${this.text('Authorization model', 'Modelo de autorización')}: ${this.subprocessorAuthorizationLabel(data.dpa.subprocessorAuthorization)}.`
        : '',
      data.dpa.subprocessorObjectionWindow
        ? `${this.text('Notice or objection window', 'Preaviso o ventana de objeción')}: ${this.sentence(data.dpa.subprocessorObjectionWindow)}`
        : ''
    ].filter(Boolean).join(' ');
  }

  transfersText(data) {
    if (!data.dpa.internationalTransfers && !data.dpa.transferMechanism && !data.dpa.euSccRequired) {
      return this.text(
        'Where personal data remains in the same jurisdiction or adequate regions, the parties should still review whether any onward transfer safeguards are required in practice.',
        'Cuando los datos personales permanezcan en la misma jurisdicción o en regiones adecuadas, las partes igualmente deberían revisar si en la práctica se requieren salvaguardas para transferencias ulteriores.'
      );
    }

    const parts = [
      this.text(
        'Where processing involves cross-border access, hosting, support, or onward transfers, the parties should rely on a lawful transfer mechanism appropriate to the jurisdictions involved.',
        'Cuando el tratamiento implique acceso transfronterizo, hosting, soporte o transferencias ulteriores, las partes deberían apoyarse en un mecanismo de transferencia lícito y adecuado para las jurisdicciones involucradas.'
      )
    ];

    if (data.dpa.transferMechanism) {
      parts.push(`${this.text('Transfer mechanism', 'Mecanismo de transferencia')}: ${this.sentence(data.dpa.transferMechanism)}`);
    }
    if (data.dpa.transferSupplementarySafeguards) {
      parts.push(`${this.text('Supplementary safeguards', 'Salvaguardas complementarias')}: ${this.sentence(data.dpa.transferSupplementarySafeguards)}`);
    }

    if (data.dpa.euSccRequired) {
      parts.push(this.text(
        'If required by the parties’ transfer analysis, the parties should consider executing the applicable Standard Contractual Clauses or equivalent safeguards.',
        'Si lo requiere el análisis de transferencias de las partes, deberían considerarse las Cláusulas Contractuales Tipo aplicables u otras salvaguardas equivalentes.'
      ));
    }

    return parts.join(' ');
  }

  assistanceText(data) {
    const parts = [
      this.text(
        'The processor should provide reasonable assistance, taking into account the nature of the processing and information available to the processor, to help the controller respond to data subject requests and compliance obligations.',
        'El processor debería brindar asistencia razonable, teniendo en cuenta la naturaleza del tratamiento y la información disponible, para ayudar al controller a responder solicitudes de titulares y obligaciones de cumplimiento.'
      )
    ];
    if (data.dpa.assistanceCommitments) {
      parts.push(`${this.text('Assistance commitments', 'Compromisos de asistencia')}: ${this.sentence(data.dpa.assistanceCommitments)}`);
    }
    if (data.dpa.breachNotificationTime) {
      parts.push(`${this.text('Incident or breach notice timing', 'Plazo para avisar incidentes o brechas')}: ${this.sentence(data.dpa.breachNotificationTime)}`);
    }
    return parts.join(' ');
  }

  deletionText(data) {
    const parts = [
      this.text(
        'At the end of the services, the processor should return or delete personal data and existing copies, unless retention is required by applicable law or documented backup/security retention processes.',
        'Al finalizar los servicios, el processor debería devolver o eliminar los datos personales y sus copias existentes, salvo que la conservación sea exigida por ley aplicable o por procesos documentados de backup/seguridad.'
      )
    ];
    if (data.dpa.deletionReturnPeriod) {
      parts.push(`${this.text('Deletion or return timing', 'Plazo de devolución o eliminación')}: ${this.sentence(data.dpa.deletionReturnPeriod)}`);
    }
    if (data.dpa.backupRetentionHandling) {
      parts.push(`${this.text('Backups and residual copies', 'Backups y copias residuales')}: ${this.sentence(data.dpa.backupRetentionHandling)}`);
    }
    return parts.join(' ');
  }

  auditText(data) {
    const parts = [
      this.text(
        'The processor should make available information reasonably necessary to demonstrate compliance with the processing obligations described in this agreement.',
        'El processor debería poner a disposición información razonablemente necesaria para demostrar cumplimiento de las obligaciones de tratamiento descriptas en este acuerdo.'
      )
    ];
    if (data.dpa.auditRights) {
      parts.push(`${this.text('Audit approach', 'Enfoque de auditoría')}: ${this.sentence(data.dpa.auditRights)}`);
    }
    if (data.dpa.auditMechanism) {
      parts.push(`${this.text('Typical audit mechanism', 'Mecanismo habitual de auditoría')}: ${this.auditMechanismLabel(data.dpa.auditMechanism)}.`);
    }
    if (data.dpa.auditNoticePeriod) {
      parts.push(`${this.text('Audit notice period', 'Preaviso de auditoría')}: ${this.sentence(data.dpa.auditNoticePeriod)}`);
    }
    if (data.dpa.governingLaw) {
      parts.push(`${this.text('Governing law or contractual reference', 'Ley aplicable o referencia contractual')}: ${this.sentence(data.dpa.governingLaw)}`);
    }
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

  inferJurisdiction(country) {
    const normalized = String(country || '').trim().toLowerCase();
    if (['united kingdom', 'uk', 'reino unido', 'england', 'scotland', 'wales'].includes(normalized)) return 'uk';
    if (['germany', 'france', 'spain', 'italy', 'netherlands', 'european union', 'eu', 'unión europea'].includes(normalized)) return 'eu';
    return 'global';
  }

  regulatoryScopeLabel(value) {
    const labels = {
      eu: this.text('EU / GDPR', 'UE / GDPR'),
      uk: this.text('UK / UK GDPR', 'UK / UK GDPR'),
      us: this.text('United States', 'Estados Unidos'),
      ar: this.text('Argentina', 'Argentina'),
      global: this.text('global or custom', 'global o custom')
    };
    return labels[value] || value;
  }

  subprocessorAuthorizationLabel(value) {
    const labels = {
      general_authorization: this.text('general authorization with notice-based updates', 'autorización general con avisos de actualización'),
      specific_approval: this.text('specific approval before adding new subprocessors', 'aprobación específica antes de sumar nuevos subprocessors'),
      contract_defined: this.text('the main contract or order form defines the applicable authorization model', 'el contrato principal u order form define el modelo de autorización aplicable')
    };
    return labels[value] || value;
  }

  auditMechanismLabel(value) {
    const labels = {
      questionnaire_and_certifications: this.text('questionnaires, certifications, and documentary evidence', 'cuestionarios, certificaciones y evidencia documental'),
      remote_review: this.text('remote review of documents or coordinated evidence requests', 'revisión remota de documentos o pedidos coordinados de evidencia'),
      onsite_limited: this.text('limited onsite audit rights subject to confidentiality and operational safeguards', 'auditoría onsite limitada, sujeta a confidencialidad y resguardos operativos'),
      contract_defined: this.text('the main contract defines the audit mechanics and escalation path', 'el contrato principal define la mecánica de auditoría y el camino de escalamiento')
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
      '  <meta name="legal-document-type" content="dpa">',
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

module.exports = DataProcessingAgreementGenerator;
