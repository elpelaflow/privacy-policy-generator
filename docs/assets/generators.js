(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // js/generator.js
  var require_generator = __commonJS({
    "js/generator.js"(exports, module) {
      var PrivacyPolicyGenerator = class {
        constructor() {
          this.templateData = {};
          this.ready = this.loadTemplateData();
        }
        async loadTemplateData() {
          if (this.templateData.en && this.templateData.es) {
            return this.templateData;
          }
          const [english, spanish] = await Promise.all([
            this.readJson("policy-sections.json"),
            this.readJson("policy-sections.es.json")
          ]);
          this.templateData = {
            en: english,
            es: spanish
          };
          return this.templateData;
        }
        async readJson(filename) {
          if (typeof window !== "undefined" && typeof fetch === "function") {
            const base = String(globalThis.__LEGAL_GENERATOR_BASE__ || ".").replace(/\/$/, "");
            const response = await fetch(`${base}/data/${filename}`);
            if (!response.ok) {
              throw new Error(`Failed to load ${filename}: ${response.status}`);
            }
            return response.json();
          }
          const nodeRequire = eval("require");
          const fs = nodeRequire("node:fs/promises");
          const path = nodeRequire("node:path");
          const filePath = path.join(__dirname, "..", "data", filename);
          const raw = await fs.readFile(filePath, "utf8");
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
            throw new Error(result.errors.join(" | "));
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
          const language = normalized.data.settings.language || "en";
          const template = this.templateData[language] || this.templateData.en;
          this.currentLanguage = language;
          const policy = {
            businessName: normalized.data.business.name,
            effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            warnings: normalized.warnings,
            sections: [],
            language,
            metadata: this.buildHtmlMetadata(normalized.data)
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
          const raw2 = this.isCanonicalInput(input) ? input : this.fromLegacyInput(input);
          const data = {
            business: {
              name: this.stringValue(raw2.business?.name),
              type: this.stringValue(raw2.business?.type),
              websiteUrl: this.stringValue(raw2.business?.websiteUrl),
              country: this.stringValue(raw2.business?.country, "United States"),
              address: this.stringValue(raw2.business?.address)
            },
            contact: {
              email: this.stringValue(raw2.contact?.email),
              phone: this.stringValue(raw2.contact?.phone),
              pageUrl: this.stringValue(raw2.contact?.pageUrl)
            },
            operations: {
              primaryJurisdiction: this.stringValue(raw2.operations?.primaryJurisdiction),
              sellRegions: this.arrayValue(raw2.operations?.sellRegions),
              childrenAudience: Boolean(raw2.operations?.childrenAudience)
            },
            dataPractices: {
              collectedData: this.arrayValue(raw2.dataPractices?.collectedData),
              thirdParties: this.arrayValue(raw2.dataPractices?.thirdParties),
              legalBases: this.arrayValue(raw2.dataPractices?.legalBases)
            },
            compliance: {
              requestedFrameworks: this.arrayValue(raw2.compliance?.requestedFrameworks)
            },
            settings: {
              language: this.stringValue(raw2.settings?.language, "en")
            },
            customizations: {
              manualDisclosures: this.arrayValue(raw2.customizations?.manualDisclosures)
            }
          };
          const errors = [];
          const warnings = [];
          const messages = data.settings.language === "es" ? {
            missingBusinessName: "El nombre del negocio es obligatorio.",
            missingBusinessType: "El tipo de negocio es obligatorio.",
            missingJurisdiction: "La jurisdicci\xF3n principal es obligatoria.",
            missingContact: "No se proporcion\xF3 un medio de contacto de privacidad. La secci\xF3n de contacto quedar\xE1 incompleta.",
            missingWebsite: "No se proporcion\xF3 una URL del sitio. La pol\xEDtica usar\xE1 una referencia gen\xE9rica al sitio web.",
            coppaWarning: "Se seleccion\xF3 COPPA pero el servicio no figura como dirigido a menores. Revise cuidadosamente la secci\xF3n de privacidad infantil.",
            paymentConflict: "Seleccione procesadores m\xFAltiples de pago o s\xF3lo PayPal, pero no ambas opciones.",
            globalWarning: "Se seleccion\xF3 una jurisdicci\xF3n global o personalizada. Revise manualmente el lenguaje de derechos regionales antes de publicar.",
            ecommercePaymentRequired: "Para e-commerce debe indicarse al menos un procesador de pago o una modalidad de pago externa.",
            ecommerceShippingRequired: "Para e-commerce debe indicarse al menos una categor\xEDa de log\xEDstica o env\xEDos.",
            ecommerceFiscalRequired: "Para e-commerce debe indicarse si se tratan datos fiscales, de facturaci\xF3n o identificaci\xF3n comercial.",
            advertisingCookiesWarning: "Seleccion\xF3 publicidad sin cookies. Revise si utiliza p\xEDxeles, remarketing o cookies publicitarias.",
            shortAddressWarning: "La direcci\xF3n cargada parece incompleta. Agregue calle, n\xFAmero, ciudad y pa\xEDs o jurisdicci\xF3n relevante.",
            argentinaSpanishWarning: "Para un negocio en Argentina conviene publicar la pol\xEDtica tambi\xE9n en espa\xF1ol.",
            argentinaRightsWarning: "Si opera en Argentina, revise que la pol\xEDtica incluya derechos locales, AAIP y tratamiento de datos conforme a la Ley 25.326.",
            argentinaRightsChannelWarning: "Para privacidad en Argentina conviene informar un canal claro para ejercer derechos, idealmente por email o mediante una p\xE1gina de contacto.",
            argentinaTransferWarning: "Si opera en Argentina y utiliza proveedores globales, revise que la pol\xEDtica describa transferencias internacionales y salvaguardas aplicables.",
            argentinaThirdPartiesWarning: "Si opera en Argentina, conviene describir con mayor claridad categor\xEDas de encargados, proveedores y terceros que intervienen en el tratamiento.",
            argentinaConsumerLanguageWarning: "Para un negocio argentino orientado a consumidores, conviene evitar una pol\xEDtica demasiado global o gen\xE9rica y usar lenguaje local m\xE1s claro.",
            missingLegalBasisWarning: "No se indicaron bases legales de tratamiento. Revise contrato, consentimiento, obligaci\xF3n legal o inter\xE9s leg\xEDtimo seg\xFAn corresponda."
          } : {
            missingBusinessName: "Business name is required.",
            missingBusinessType: "Business type is required.",
            missingJurisdiction: "Primary jurisdiction is required.",
            missingContact: "No privacy contact method was provided. Contact section will be incomplete.",
            missingWebsite: "No website URL was provided. The generated policy uses a placeholder website label.",
            coppaWarning: "COPPA was selected but the service is not marked as directed to children. Review the children privacy section carefully.",
            paymentConflict: "Select either multiple payment processors or PayPal-only payments, not both.",
            globalWarning: "Global or custom jurisdiction selected. Review regional rights language manually before publishing.",
            ecommercePaymentRequired: "E-commerce requires at least one payment processor or external payment flow.",
            ecommerceShippingRequired: "E-commerce requires at least one shipping or logistics category.",
            ecommerceFiscalRequired: "E-commerce requires a fiscal, invoicing, or commercial identity data category.",
            advertisingCookiesWarning: "Advertising was selected without cookies. Review whether you use pixels, remarketing, or advertising cookies.",
            shortAddressWarning: "The address provided looks incomplete. Add street, number, city, and country or relevant jurisdiction.",
            argentinaSpanishWarning: "For an Argentina-based business, publishing the policy in Spanish is strongly recommended.",
            argentinaRightsWarning: "If the business operates in Argentina, review local rights, AAIP references, and Law 25.326 requirements before publishing.",
            argentinaRightsChannelWarning: "For Argentina privacy compliance, provide a clear channel for rights requests, ideally by email or a contact page.",
            argentinaTransferWarning: "If the business operates in Argentina and uses global providers, review whether international transfers and safeguards are clearly described.",
            argentinaThirdPartiesWarning: "If the business operates in Argentina, describe processors, vendors, or third-party categories more clearly.",
            argentinaConsumerLanguageWarning: "For an Argentina-facing consumer business, avoid a policy that feels overly global or generic and prefer clearer local wording.",
            missingLegalBasisWarning: "No legal bases were selected. Review contract, consent, legal obligation, or legitimate interests as appropriate."
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
          if (data.operations.primaryJurisdiction === "global") {
            warnings.push(messages.globalWarning);
          }
          if (data.operations.primaryJurisdiction === "ar" || data.business.country.toLowerCase().includes("argentina")) {
            warnings.push(messages.argentinaRightsWarning);
            if (data.settings.language !== "es") {
              warnings.push(messages.argentinaSpanishWarning);
            }
            if (!data.contact.email && !data.contact.pageUrl) {
              warnings.push(messages.argentinaRightsChannelWarning);
            }
            if (data.dataPractices.thirdParties.some((value) => ["cloud", "analytics", "advertising", "social", "payment", "email"].includes(value))) {
              warnings.push(messages.argentinaTransferWarning);
            }
            if (data.dataPractices.thirdParties.length === 0) {
              warnings.push(messages.argentinaThirdPartiesWarning);
            }
            if (data.business.type === "ecommerce" && data.operations.primaryJurisdiction === "global") {
              warnings.push(messages.argentinaConsumerLanguageWarning);
            }
          }
          if (data.compliance.requestedFrameworks.includes("coppa") && !data.operations.childrenAudience) {
            warnings.push(messages.coppaWarning);
          }
          if (data.dataPractices.thirdParties.includes("payment") && data.dataPractices.thirdParties.includes("paypal_only")) {
            errors.push(messages.paymentConflict);
          }
          if (data.dataPractices.thirdParties.includes("advertising") && !data.dataPractices.collectedData.includes("cookies")) {
            warnings.push(messages.advertisingCookiesWarning);
          }
          if (data.dataPractices.legalBases.length === 0) {
            warnings.push(messages.missingLegalBasisWarning);
          }
          if (data.business.type === "ecommerce") {
            const paymentConfigured = data.dataPractices.thirdParties.includes("payment") || data.dataPractices.thirdParties.includes("paypal_only");
            const shippingConfigured = data.dataPractices.thirdParties.includes("shipping");
            const fiscalConfigured = data.dataPractices.collectedData.includes("tax") || data.dataPractices.collectedData.includes("identity");
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
              language: input.outputLanguage || input.language || "en"
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
            reason: includeSection ? "rule matched or section required" : "rule did not match"
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
              reason: includeSubsection ? "rule matched" : "rule did not match"
            });
            if (!includeSubsection) {
              continue;
            }
            const subsectionParagraphs = (subsection.content || []).map((line) => this.renderLine(line, data)).filter(Boolean);
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
          if (Object.prototype.hasOwnProperty.call(rule, "equals")) {
            return fieldValue === rule.equals;
          }
          if (Object.prototype.hasOwnProperty.call(rule, "notEquals")) {
            return fieldValue !== rule.notEquals;
          }
          if (Object.prototype.hasOwnProperty.call(rule, "includes")) {
            return Array.isArray(fieldValue) && fieldValue.includes(rule.includes);
          }
          if (Object.prototype.hasOwnProperty.call(rule, "notIncludes")) {
            return Array.isArray(fieldValue) && !fieldValue.includes(rule.notIncludes);
          }
          if (Object.prototype.hasOwnProperty.call(rule, "exists")) {
            const hasValue = Array.isArray(fieldValue) ? fieldValue.length > 0 : fieldValue !== void 0 && fieldValue !== "";
            return rule.exists ? hasValue : !hasValue;
          }
          if (Object.prototype.hasOwnProperty.call(rule, "isTrue")) {
            return Boolean(fieldValue) === Boolean(rule.isTrue);
          }
          if (Object.prototype.hasOwnProperty.call(rule, "isFalse")) {
            return Boolean(fieldValue) === !Boolean(rule.isFalse);
          }
          return defaultValue;
        }
        renderLine(line, data) {
          const context = this.createTemplateContext(data);
          return line.replace(/\{([^}]+)\}/g, (_, token) => context[token] ?? "");
        }
        createTemplateContext(data) {
          return {
            business_name: data.business.name,
            service_type: this.getServiceTypeLabel(data.business.type),
            website_url_or_placeholder: data.business.websiteUrl || (this.currentLanguage === "es" ? "el sitio o servicio en l\xEDnea asociado" : `${data.business.name || "the business"} website`),
            country: data.business.country,
            contact_lines: this.buildContactLines(data.contact, data.business.address, data.settings.language),
            manual_disclosures_lines: this.buildManualDisclosureLines(data.customizations.manualDisclosures)
          };
        }
        buildContactLines(contact, address, language) {
          const lines = [];
          const labels = language === "es" ? {
            email: "Por email",
            page: "A trav\xE9s de esta p\xE1gina",
            phone: "Por tel\xE9fono",
            mail: "Por correo postal",
            fallback: "No se configur\xF3 todav\xEDa un canal directo de contacto. Agregue al menos un medio de contacto de privacidad antes de publicar esta pol\xEDtica."
          } : {
            email: "By email",
            page: "Through this page",
            phone: "By phone",
            mail: "By mail",
            fallback: "No direct contact method has been configured yet. Add at least one privacy contact channel before publishing this policy."
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
          return lines.join("\n");
        }
        buildManualDisclosureLines(disclosures) {
          if (!Array.isArray(disclosures) || disclosures.length === 0) {
            return "";
          }
          return disclosures.filter(Boolean).map((entry) => `- ${entry}`).join("\n");
        }
        getServiceTypeLabel(type) {
          const englishLabels = {
            ecommerce: "website, online store, and related services",
            blog: "content site, newsletter, and related services",
            saas: "software service and related account features",
            mobile: "mobile application and related services",
            nonprofit: "nonprofit website, campaigns, and related services"
          };
          const spanishLabels = {
            ecommerce: "sitio web, tienda online y servicios relacionados",
            blog: "sitio de contenido, newsletter y servicios relacionados",
            saas: "servicio de software y funciones relacionadas de cuenta",
            mobile: "aplicaci\xF3n m\xF3vil y servicios relacionados",
            nonprofit: "sitio de ONG, campa\xF1as y servicios relacionados"
          };
          return this.currentLanguage === "es" ? spanishLabels[type] || "servicio en l\xEDnea" : englishLabels[type] || "online service";
        }
        getByPath(object, path2) {
          return path2.split(".").reduce((value, segment) => {
            if (value === void 0 || value === null) {
              return void 0;
            }
            return value[segment];
          }, object);
        }
        stringValue(value, fallback = "") {
          if (typeof value !== "string") {
            return fallback;
          }
          const normalized = value.trim();
          if (!normalized || [">", "no hay", "n/a", "na", "none", "null"].includes(normalized.toLowerCase())) {
            return fallback;
          }
          return normalized;
        }
        arrayValue(value) {
          return Array.isArray(value) ? value.filter(Boolean) : [];
        }
        cleanTitle(title) {
          return title.replace(/^\d+(\.\d+)*\.?\s+/, "");
        }
        formatAsMarkdown(policy) {
          const labels = policy.language === "es" ? { title: "Pol\xEDtica de Privacidad", effectiveDate: "Fecha de vigencia" } : { title: "Privacy Policy", effectiveDate: "Effective Date" };
          let markdown = `# ${labels.title} - ${policy.businessName}

`;
          markdown += `*${labels.effectiveDate}: ${policy.effectiveDate}*

`;
          policy.sections.forEach((section, sectionIndex) => {
            markdown += `## ${sectionIndex + 1}. ${section.title}

`;
            for (const paragraph of section.paragraphs) {
              markdown += `${paragraph}

`;
            }
            section.subsections.forEach((subsection, subsectionIndex) => {
              markdown += `### ${sectionIndex + 1}.${subsectionIndex + 1} ${subsection.title}

`;
              for (const paragraph of subsection.paragraphs) {
                markdown += `${paragraph}

`;
              }
            });
          });
          return markdown.trim();
        }
        formatAsText(policy) {
          return this.formatAsMarkdown(policy).replace(/^# /gm, "").replace(/^## /gm, "").replace(/^### /gm, "").replace(/\*\*/g, "").replace(/\*/g, "");
        }
        formatAsHTML(policy) {
          const labels = policy.language === "es" ? { title: "Pol\xEDtica de Privacidad", effectiveDate: "Fecha de vigencia" } : { title: "Privacy Policy", effectiveDate: "Effective Date" };
          const structuredData = this.buildPrivacyStructuredData(policy, labels.title);
          let html = `<!DOCTYPE html>
<html lang="${policy.language === "es" ? "es" : "en"}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(labels.title)} - ${escapeHtml(policy.businessName)}</title>
  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd(structuredData)}<\/script>` : ""}
  <style>
    :root { color-scheme: light; }
    body { font-family: Arial, sans-serif; line-height: 1.7; color: #1f2937; background: #ffffff; max-width: 900px; margin: 0 auto; padding: 24px; }
    main { display: block; }
    header { margin-bottom: 28px; }
    h1, h2, h3 { line-height: 1.25; color: #111827; }
    h1 { margin-bottom: 12px; }
    h2 { margin-top: 32px; margin-bottom: 12px; }
    h3 { margin-top: 20px; margin-bottom: 10px; }
    p, li { font-size: 1rem; }
    ul { padding-left: 24px; }
    a { color: #0f62fe; }
    a:focus-visible { outline: 3px solid #0f62fe; outline-offset: 2px; }
  </style>
</head>
<body>
  <main id="main-content" aria-labelledby="document-title">
    <header>
      <h1 id="document-title">${escapeHtml(labels.title)} - ${escapeHtml(policy.businessName)}</h1>
      <p><em>${escapeHtml(labels.effectiveDate)}: <time datetime="${escapeHtml(policy.effectiveDate)}">${escapeHtml(policy.effectiveDate)}</time></em></p>
    </header>
    ${this.renderPolicyHtml(policy)}
  </main>
</body></html>`;
          return html;
        }
        renderPolicyHtml(policy) {
          let html = "";
          policy.sections.forEach((section, sectionIndex) => {
            const sectionId = `section-${sectionIndex + 1}`;
            html += `<section aria-labelledby="${sectionId}"><h2 id="${sectionId}">${escapeHtml(`${sectionIndex + 1}. ${section.title}`)}</h2>`;
            for (const paragraph of section.paragraphs) {
              html += paragraphToHtml(paragraph);
            }
            section.subsections.forEach((subsection, subsectionIndex) => {
              const subsectionId = `section-${sectionIndex + 1}-${subsectionIndex + 1}`;
              html += `<h3 id="${subsectionId}">${escapeHtml(`${sectionIndex + 1}.${subsectionIndex + 1} ${subsection.title}`)}</h3>`;
              for (const paragraph of subsection.paragraphs) {
                html += paragraphToHtml(paragraph);
              }
            });
            html += "</section>";
          });
          return html;
        }
        buildHtmlMetadata(data) {
          return {
            websiteUrl: this.stringValue(data.business?.websiteUrl),
            country: this.stringValue(data.business?.country),
            contactEmail: this.stringValue(data.contact?.email),
            contactPageUrl: this.stringValue(data.contact?.pageUrl)
          };
        }
        buildPrivacyStructuredData(policy, pageTitle) {
          const metadata = policy.metadata || {};
          const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
          if (!canonicalUrl) {
            return null;
          }
          const language = policy.language === "es" ? "es" : "en";
          const organization = {
            "@type": "Organization",
            name: policy.businessName
          };
          if (metadata.websiteUrl) {
            organization.url = metadata.websiteUrl;
          }
          if (metadata.contactEmail) {
            organization.email = metadata.contactEmail;
          }
          return {
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                name: `${pageTitle} - ${policy.businessName}`,
                url: canonicalUrl,
                inLanguage: language,
                dateModified: policy.effectiveDate,
                lastReviewed: policy.effectiveDate,
                about: {
                  "@type": "Thing",
                  name: pageTitle
                },
                publisher: organization,
                accountablePerson: organization
              },
              organization
            ]
          };
        }
      };
      function escapeHtml(value) {
        return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      }
      function paragraphToHtml(paragraph) {
        if (paragraph.startsWith("- ")) {
          const items = paragraph.split("\n").filter((line) => line.startsWith("- ")).map((line) => `<li>${escapeHtml(line.slice(2)).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</li>`).join("");
          return `<ul>${items}</ul>`;
        }
        return `<p>${escapeHtml(paragraph).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")}</p>`;
      }
      function serializeJsonLd(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
      }
      module.exports = PrivacyPolicyGenerator;
    }
  });

  // js/terms-generator.js
  var require_terms_generator = __commonJS({
    "js/terms-generator.js"(exports2, module2) {
      var TermsGenerator = class {
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
            throw new Error(result.errors.join(" | "));
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
          const language = normalized.data.settings.language || "es";
          this.currentLanguage = language;
          const document = {
            businessName: normalized.data.business.name,
            effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            warnings: normalized.warnings,
            language,
            title: language === "es" ? "T\xE9rminos y Condiciones" : "Terms and Conditions",
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
                reason: included ? "section generated" : "section omitted"
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
              language: this.stringValue(input.settings?.language, "es")
            },
            customizations: {
              manualDisclosures: this.arrayValue(input.customizations?.manualDisclosures)
            }
          };
          const messages = data.settings.language === "es" ? {
            missingBusinessName: "El nombre del negocio es obligatorio.",
            missingWebsite: "La URL del sitio es obligatoria para generar t\xE9rminos publicables.",
            missingCountry: "El pa\xEDs o ley aplicable es obligatorio.",
            missingAddress: "La direcci\xF3n f\xEDsica completa es importante para identificar al responsable del servicio.",
            missingEmail: "El email de contacto es obligatorio.",
            missingOfferingType: "Debe indicar qu\xE9 vende u ofrece el servicio.",
            missingCurrency: "Debe indicar la moneda principal del sitio.",
            missingPaymentProvider: "Conviene indicar c\xF3mo se procesan los pagos o qu\xE9 pasarela utiliza.",
            missingForum: "Debe indicar jurisdicci\xF3n o foro aplicable para disputas.",
            argentinaSpanishWarning: "Para un negocio en Argentina conviene publicar los t\xE9rminos tambi\xE9n en espa\xF1ol.",
            argentinaConsumerWarning: "Para e-commerce en Argentina conviene contemplar reglas de defensa del consumidor, informaci\xF3n clara, derecho de arrepentimiento y garant\xEDas legales cuando correspondan.",
            argentinaForumWarning: "Para un negocio argentino conviene definir con mayor precisi\xF3n la jurisdicci\xF3n o foro aplicable, evitando f\xF3rmulas demasiado vagas.",
            weakRefundWarning: "Si vende productos o servicios al consumidor, conviene definir cambios, devoluciones o reembolsos.",
            weakWarrantyWarning: "Si ofrece garant\xEDa o productos f\xEDsicos, conviene aclarar su alcance.",
            weakAccountsWarning: "Si hay cuentas de usuario, conviene definir cu\xE1ndo pueden suspenderse o cancelarse.",
            missingTaxesWarning: "Conviene aclarar si los precios incluyen IVA u otros impuestos y en qu\xE9 moneda se muestran."
          } : {
            missingBusinessName: "Business name is required.",
            missingWebsite: "Website URL is required for publishable terms.",
            missingCountry: "Country or governing law basis is required.",
            missingAddress: "A complete physical address is important to identify the service provider.",
            missingEmail: "Contact email is required.",
            missingOfferingType: "You must specify what the business sells or provides.",
            missingCurrency: "You should specify the main site currency.",
            missingPaymentProvider: "You should specify how payments are processed or which gateway is used.",
            missingForum: "You must specify the governing forum or dispute venue.",
            argentinaSpanishWarning: "For an Argentina-based business, publishing the terms in Spanish is strongly recommended.",
            argentinaConsumerWarning: "For Argentina e-commerce, consider covering consumer-law expectations, clear information duties, withdrawal rights, and statutory warranties where relevant.",
            argentinaForumWarning: "For an Argentina-based business, define the governing forum more precisely and avoid overly vague dispute wording.",
            weakRefundWarning: "If you sell to consumers, you should define refunds, returns, or exchanges.",
            weakWarrantyWarning: "If you offer warranties or physical goods, you should clarify warranty scope.",
            weakAccountsWarning: "If user accounts exist, you should define when they may be suspended or terminated.",
            missingTaxesWarning: "You should clarify whether prices include VAT or other taxes and which currency is displayed."
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
          if (!data.terms.refundsOffered && data.business.type === "ecommerce") warnings.push(messages.weakRefundWarning);
          if (!data.terms.warrantyOffered && data.terms.offeringType === "physical_goods") warnings.push(messages.weakWarrantyWarning);
          if (data.terms.hasAccounts && !data.terms.terminationGrounds) warnings.push(messages.weakAccountsWarning);
          if (this.isArgentina(data)) {
            if (data.settings.language !== "es") warnings.push(messages.argentinaSpanishWarning);
            if (data.business.type === "ecommerce") warnings.push(messages.argentinaConsumerWarning);
            if (/competent courts|tribunales competentes de argentina|argentina courts/i.test(data.terms.disputesForum || "")) {
              warnings.push(messages.argentinaForumWarning);
            }
          }
          return { data, errors, warnings };
        }
        buildSections(data) {
          const t = this.text.bind(this);
          const sections = [];
          sections.push(this.section("acceptance", t("Acceptance of Terms", "Aceptaci\xF3n de los T\xE9rminos"), [
            this.interpolate(t(
              "These Terms and Conditions govern access to and use of {website}, operated by {business_name}. By accessing, browsing, or purchasing through the service, users agree to be bound by these terms.",
              "Estos T\xE9rminos y Condiciones regulan el acceso y uso de {website}, operado por {business_name}. Al acceder, navegar o comprar a trav\xE9s del servicio, los usuarios aceptan quedar vinculados por estos t\xE9rminos."
            ), data)
          ]));
          sections.push(this.section("business", t("Business Information", "Informaci\xF3n del Negocio"), [
            this.interpolate(t(
              "{business_name} operates from {country}. Business contact details for legal or contractual matters are listed in the contact section below.",
              "{business_name} opera desde {country}. Los datos de contacto para asuntos legales o contractuales se indican en la secci\xF3n de contacto m\xE1s abajo."
            ), data),
            this.interpolate(t(
              "Main website or application: {website}.",
              "Sitio web o aplicaci\xF3n principal: {website}."
            ), data)
          ]));
          sections.push(this.section("service", t("Service Description", "Descripci\xF3n del Servicio"), [
            this.interpolate(t(
              "The service primarily offers {offering_type_label}.",
              "El servicio ofrece principalmente {offering_type_label}."
            ), data),
            this.interpolate(this.accountText(data), data)
          ]));
          sections.push(this.section("orders", t("Orders, Prices, and Payments", "Compras, Precios y Pagos"), [
            this.interpolate(this.pricingText(data), data),
            this.interpolate(this.paymentText(data), data)
          ], this.orderSubsections(data)));
          if (this.isArgentina(data) && data.business.type === "ecommerce") {
            sections.push(this.section("argentina-consumer", t("Argentina Consumer Notice", "Aviso de Consumo en Argentina"), [
              this.interpolate(this.argentinaConsumerText(data), data)
            ]));
          }
          sections.push(this.section("conduct", t("Prohibited Conduct", "Conductas Prohibidas"), [
            this.interpolate(t(
              "Users may not use the service for unlawful, fraudulent, abusive, or technically harmful activity, including attempts to interfere with operations, misuse content, or violate applicable law.",
              "Los usuarios no pueden utilizar el servicio para actividades il\xEDcitas, fraudulentas, abusivas o t\xE9cnicamente da\xF1inas, incluyendo intentos de interferir con la operaci\xF3n, usar indebidamente el contenido o violar la ley aplicable."
            ), data),
            this.restrictionsLines(data)
          ]));
          sections.push(this.section("ip", t("Intellectual Property", "Propiedad Intelectual"), [
            this.interpolate(this.ipText(data), data)
          ], data.terms.allowsUserContent ? [{
            title: t("User-Generated Content", "Contenido Generado por Usuarios"),
            paragraphs: [this.interpolate(this.ugcText(data), data)]
          }] : []));
          sections.push(this.section("liability", t("Disclaimers and Limitation of Liability", "Descargos y Limitaci\xF3n de Responsabilidad"), [
            this.interpolate(this.liabilityText(data), data),
            this.interpolate(this.shippingDisclaimerText(data), data),
            this.interpolate(this.customDisclaimerText(data), data)
          ]));
          sections.push(this.section("termination", t("Suspension, Termination, and Changes", "Suspensi\xF3n, Terminaci\xF3n y Cambios"), [
            this.interpolate(this.terminationText(data), data),
            this.interpolate(this.changeNotificationText(data), data)
          ]));
          sections.push(this.section("law", t("Governing Law and Disputes", "Ley Aplicable y Disputas"), [
            this.interpolate(this.disputesText(data), data)
          ]));
          sections.push(this.section("contact", t("Contact Information", "Informaci\xF3n de Contacto"), [
            this.contactLines(data)
          ]));
          return sections;
        }
        orderSubsections(data) {
          const sections = [];
          if (data.terms.refundsOffered) {
            sections.push({
              title: this.text("Refunds, Returns, and Exchanges", "Reembolsos, Cambios y Devoluciones"),
              paragraphs: [this.interpolate(this.refundText(data), data)]
            });
          }
          if (data.terms.warrantyOffered) {
            sections.push({
              title: this.text("Warranty", "Garant\xEDa"),
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
          return this.currentLanguage === "es" ? es : en;
        }
        offeringTypeLabel(value) {
          const labels = {
            physical_goods: this.text("physical goods", "productos f\xEDsicos"),
            digital_products: this.text("digital products", "productos digitales"),
            services: this.text("services", "servicios"),
            subscriptions: this.text("subscriptions or recurring plans", "suscripciones o planes recurrentes")
          };
          return labels[value] || value || this.text("online services", "servicios en l\xEDnea");
        }
        accountText(data) {
          if (!data.terms.hasAccounts) {
            return this.text(
              "Users may access and use the service without maintaining a persistent account, unless a specific feature or support flow requires identification information.",
              "Los usuarios pueden acceder y utilizar el servicio sin mantener una cuenta persistente, salvo que una funci\xF3n espec\xEDfica o un flujo de soporte requieran identificaci\xF3n."
            );
          }
          if (data.terms.requiresRegistration) {
            return this.text(
              "Users may need to register and maintain accurate account information in order to access certain features, place orders, or manage subscriptions.",
              "Es posible que los usuarios deban registrarse y mantener informaci\xF3n exacta de cuenta para acceder a ciertas funciones, realizar pedidos o gestionar suscripciones."
            );
          }
          return this.text(
            "Users may create accounts to manage purchases or preferences, but account creation is not required for every use case.",
            "Los usuarios pueden crear cuentas para gestionar compras o preferencias, pero la creaci\xF3n de cuenta no es obligatoria para todos los casos."
          );
        }
        pricingText(data) {
          const taxesText = data.terms.pricesIncludeTaxes ? this.text("Displayed prices are presented inclusive of applicable taxes unless stated otherwise.", "Los precios exhibidos se presentan con los impuestos aplicables incluidos, salvo que se indique lo contrario.") : this.text("Displayed prices may exclude taxes, duties, or other charges unless expressly stated otherwise.", "Los precios exhibidos pueden no incluir impuestos, tasas u otros cargos salvo indicaci\xF3n expresa en contrario.");
          const currencyText = data.terms.currency ? this.text(`Prices are shown primarily in ${data.terms.currency}.`, `Los precios se muestran principalmente en ${data.terms.currency}.`) : this.text("The service uses the currency indicated in the applicable commercial flow or payment channel.", "El servicio utiliza la moneda indicada en el flujo comercial o canal de pago aplicable.");
          return `${taxesText} ${currencyText}`;
        }
        paymentText(data) {
          if (data.terms.paymentProvider) {
            return this.text(
              `Payments are processed through ${data.terms.paymentProvider}. Payment processing may be subject to that provider's own terms and conditions.`,
              `Los pagos se procesan a trav\xE9s de ${data.terms.paymentProvider}. El procesamiento del pago puede quedar sujeto a los propios t\xE9rminos y condiciones de ese proveedor.`
            );
          }
          return this.text(
            "Payment processing details should be completed before publication so users know which provider handles checkout.",
            "Los detalles del procesamiento de pagos deben completarse antes de publicar para que los usuarios sepan qu\xE9 proveedor interviene en el checkout."
          );
        }
        refundText(data) {
          const windowText = data.terms.refundWindow ? this.text(`Refund, return, or exchange requests should generally be made within ${data.terms.refundWindow}.`, `Las solicitudes de reembolso, cambio o devoluci\xF3n deber\xEDan realizarse en general dentro de ${data.terms.refundWindow}.`) : this.text("Refund timing should be completed before publication.", "El plazo de reembolso deber\xEDa completarse antes de publicar.");
          const conditionText = data.terms.refundConditions ? data.terms.refundConditions : this.text("Eligibility conditions should be defined based on product condition, usage, and applicable consumer law.", "Las condiciones de elegibilidad deber\xEDan definirse seg\xFAn el estado del producto, su uso y la normativa de consumo aplicable.");
          const shippingText = data.terms.returnShippingResponsibility ? this.text(`Return shipping responsibility: ${data.terms.returnShippingResponsibility}.`, `Responsabilidad por el env\xEDo de devoluci\xF3n: ${data.terms.returnShippingResponsibility}.`) : this.text("Return shipping responsibility should be clarified.", "Deber\xEDa aclararse qui\xE9n asume el env\xEDo de devoluci\xF3n.");
          const argentinaText = this.isArgentina(data) && data.business.type === "ecommerce" ? this.text(" Where mandatory consumer protections apply, any statutory withdrawal, defect, or mismatch remedy available under consumer law will prevail over any narrower operational rule in these terms.", " Cuando apliquen protecciones obligatorias de defensa del consumidor, cualquier derecho legal de arrepentimiento, falla o falta de conformidad previsto por la normativa de consumo prevalecer\xE1 sobre cualquier regla operativa m\xE1s restrictiva de estos t\xE9rminos.") : "";
          return `${windowText} ${conditionText} ${shippingText}${argentinaText}`;
        }
        warrantyText(data) {
          return data.terms.warrantyDetails ? data.terms.warrantyDetails : this.text(
            "Any warranty scope, exclusions, and claim procedures will be governed by the specific commercial conditions communicated to the user where applicable.",
            "Cualquier alcance de garant\xEDa, exclusiones y procedimiento de reclamo se regir\xE1 por las condiciones comerciales espec\xEDficas comunicadas al usuario cuando corresponda."
          );
        }
        ipText(data) {
          const owner = data.terms.ipOwner || data.business.name;
          return this.text(
            `All site content, branding, visual assets, text, and related materials are owned by ${owner} or used with permission, and may not be copied, redistributed, or exploited without authorization except where law permits.`,
            `Todo el contenido del sitio, la marca, los recursos visuales, los textos y materiales relacionados pertenecen a ${owner} o se utilizan con autorizaci\xF3n, y no pueden copiarse, redistribuirse ni explotarse sin autorizaci\xF3n salvo en los casos permitidos por la ley.`
          );
        }
        ugcText(data) {
          if (data.terms.ugcLicenseGranted) {
            return this.text(
              "By submitting reviews, comments, images, or other user content, users grant a non-exclusive license to display, reproduce, and reference that content in connection with the service and related promotional channels.",
              "Al enviar rese\xF1as, comentarios, im\xE1genes u otro contenido de usuario, los usuarios otorgan una licencia no exclusiva para mostrar, reproducir y referenciar ese contenido en relaci\xF3n con el servicio y canales promocionales relacionados."
            );
          }
          return this.text(
            "User-generated content may be moderated or removed, and any reuse beyond on-site display should be specifically reviewed before publication.",
            "El contenido generado por usuarios puede ser moderado o eliminado, y cualquier reutilizaci\xF3n fuera del sitio quedar\xE1 sujeta a la autorizaci\xF3n o base legal aplicable."
          );
        }
        liabilityText(data) {
          if (data.terms.limitIndirectDamages) {
            return this.text(
              "To the maximum extent permitted by law, the service is provided on an as-available basis and the business excludes liability for indirect, incidental, special, or consequential damages arising from use of the service, except where exclusion is not legally permitted.",
              "En la m\xE1xima medida permitida por la ley, el servicio se ofrece seg\xFAn disponibilidad y el negocio excluye responsabilidad por da\xF1os indirectos, incidentales, especiales o consecuenciales derivados del uso del servicio, salvo cuando la exclusi\xF3n no est\xE9 legalmente permitida."
            );
          }
          return this.text(
            "Liability limitations apply only to the extent permitted by applicable law and should be interpreted consistently with consumer and contractual protections that cannot be waived.",
            "Las limitaciones de responsabilidad aplican \xFAnicamente en la medida permitida por la ley aplicable y deben interpretarse de forma compatible con las protecciones de consumo y contractuales que no puedan ser renunciadas."
          );
        }
        shippingDisclaimerText(data) {
          if (!data.terms.shippingDelayDisclaimer) {
            return "";
          }
          return this.text(
            "Where physical goods are shipped through third-party carriers, delivery times may be affected by external logistics providers once the order has been handed over to them.",
            "Cuando se env\xEDan productos f\xEDsicos mediante transportistas externos, los tiempos de entrega pueden verse afectados por proveedores log\xEDsticos externos una vez entregado el pedido a dichos transportistas."
          );
        }
        customDisclaimerText(data) {
          return data.terms.customDisclaimer || "";
        }
        terminationText(data) {
          const base = data.terms.maySuspendAccounts ? this.text(
            "The business may suspend or terminate access, accounts, or orders where users breach these terms, misuse the service, create operational or legal risk, or where continued service is not reasonably possible.",
            "El negocio podr\xE1 suspender o terminar el acceso, las cuentas o los pedidos cuando los usuarios incumplan estos t\xE9rminos, hagan un uso indebido del servicio, generen riesgos operativos o legales, o cuando la continuidad del servicio no sea razonablemente posible."
          ) : this.text(
            "The service provider may adopt proportionate operational restrictions where necessary to protect the service, comply with law, or address misuse.",
            "El prestador del servicio podr\xE1 adoptar restricciones operativas proporcionales cuando sea necesario para proteger el servicio, cumplir la ley o atender usos indebidos."
          );
          return data.terms.terminationGrounds ? `${base} ${data.terms.terminationGrounds}` : base;
        }
        changeNotificationText(data) {
          const label = {
            email: this.text("email notice", "aviso por email"),
            site_notice: this.text("a visible site notice", "un aviso visible en el sitio"),
            both: this.text("email and a visible site notice", "email y un aviso visible en el sitio")
          }[data.terms.changeNotification] || this.text("reasonable notice through the service", "un aviso razonable a trav\xE9s del servicio");
          return this.text(
            `The business may update these terms from time to time and will generally communicate material changes through ${label}.`,
            `El negocio podr\xE1 actualizar estos t\xE9rminos peri\xF3dicamente y, en general, comunicar\xE1 los cambios relevantes mediante ${label}.`
          );
        }
        disputesText(data) {
          const adr = {
            none: this.text("No alternative dispute resolution method has been specified.", "No se especific\xF3 un m\xE9todo alternativo de resoluci\xF3n de disputas."),
            mediation: this.text("The parties may attempt mediation before pursuing judicial action where appropriate.", "Las partes podr\xE1n intentar una mediaci\xF3n antes de iniciar acciones judiciales cuando corresponda."),
            arbitration: this.text("Disputes may be referred to arbitration where the applicable law and the service model make that mechanism enforceable.", "Las disputas podr\xE1n someterse a arbitraje cuando la ley aplicable y el modelo del servicio hagan exigible ese mecanismo.")
          }[data.terms.adrMethod] || "";
          return this.text(
            `These terms are governed and interpreted in connection with the laws and courts of ${data.terms.disputesForum}. ${adr}`.trim(),
            `Estos t\xE9rminos se rigen e interpretan en relaci\xF3n con las leyes y tribunales de ${data.terms.disputesForum}. ${adr}`.trim()
          );
        }
        argentinaConsumerText(data) {
          const refundWindow = data.terms.refundWindow ? this.text(`For distance sales in Argentina, customers should review whether a withdrawal or cancellation right may exist within ${data.terms.refundWindow}, without prejudice to any mandatory right that prevails over these terms.`, `Para ventas a distancia en Argentina, los clientes deber\xEDan revisar si existe un derecho de arrepentimiento o revocaci\xF3n dentro de ${data.terms.refundWindow}, sin perjuicio de cualquier derecho obligatorio que prevalezca sobre estos t\xE9rminos.`) : this.text(`For distance sales in Argentina, customers may have statutory withdrawal or cancellation rights, without prejudice to any mandatory consumer protection that prevails over these terms.`, `Para ventas a distancia en Argentina, los clientes pueden tener derechos legales de arrepentimiento o revocaci\xF3n, sin perjuicio de cualquier protecci\xF3n obligatoria de defensa del consumidor que prevalezca sobre estos t\xE9rminos.`);
          const pricing = this.text("Prices, taxes, availability, and core commercial conditions should be presented clearly before the user completes the transaction.", "Los precios, impuestos, disponibilidad y condiciones comerciales esenciales deber\xEDan presentarse con claridad antes de que el usuario complete la transacci\xF3n.");
          const warranty = data.terms.offeringType === "physical_goods" ? this.text(" Product warranties, hidden defects, and remedies for goods that are damaged, defective, or materially different from what was offered should be interpreted consistently with applicable consumer law.", " La garant\xEDa de productos, los vicios o defectos y los remedios por bienes da\xF1ados, defectuosos o sustancialmente distintos de lo ofrecido deben interpretarse de manera compatible con la normativa de defensa del consumidor aplicable.") : "";
          return `${refundWindow} ${pricing}${warranty}`.trim();
        }
        restrictionsLines(data) {
          const items = data.terms.prohibitedActivities.slice();
          if (data.terms.customRestriction) {
            items.push(data.terms.customRestriction);
          }
          if (items.length === 0) {
            return "";
          }
          return items.map((item) => `- ${item}`).join("\n");
        }
        manualLines(items) {
          return items.map((item) => `- ${item}`).join("\n");
        }
        contactLines(data) {
          const lines = [];
          if (data.contact.email) lines.push(`- ${this.text("Email", "Email")}: ${data.contact.email}`);
          if (data.contact.pageUrl) lines.push(`- ${this.text("Contact page", "P\xE1gina de contacto")}: ${data.contact.pageUrl}`);
          if (data.contact.phone) lines.push(`- ${this.text("Phone", "Tel\xE9fono")}: ${data.contact.phone}`);
          if (data.business.address) lines.push(`- ${this.text("Postal address", "Direcci\xF3n postal")}: ${data.business.address}`);
          return lines.join("\n");
        }
        interpolate(text, data) {
          if (!text) return "";
          return text.replaceAll("{business_name}", data.business.name || "").replaceAll("{website}", data.business.websiteUrl || "").replaceAll("{country}", data.business.country || "").replaceAll("{offering_type_label}", this.offeringTypeLabel(data.terms.offeringType));
        }
        formatAsMarkdown(document) {
          const lines = [
            `# ${document.title} - ${document.businessName}`,
            "",
            `${this.text("Effective date", "Fecha de vigencia")}: ${document.effectiveDate}`,
            ""
          ];
          for (const section of document.sections) {
            lines.push(`## ${section.title}`, "");
            for (const paragraph of section.paragraphs) {
              lines.push(paragraph, "");
            }
            for (const subsection of section.subsections) {
              lines.push(`### ${subsection.title}`, "");
              for (const paragraph of subsection.paragraphs) {
                lines.push(paragraph, "");
              }
            }
          }
          return lines.join("\n").trim();
        }
        formatAsText(document) {
          return this.formatAsMarkdown(document).replace(/^#{1,3}\s+/gm, "");
        }
        formatAsHTML(document) {
          const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          const structuredData = this.buildStructuredData(document);
          const body = document.sections.map((section) => {
            const paragraphs = section.paragraphs.map((paragraph) => this.paragraphToHtml(paragraph, escape)).join("\n");
            const subsections = section.subsections.map((subsection) => {
              const subsectionParagraphs = subsection.paragraphs.map((paragraph) => this.paragraphToHtml(paragraph, escape)).join("\n");
              return `<h3>${escape(subsection.title)}</h3>
${subsectionParagraphs}`;
            }).join("\n");
            return `<section>
<h2>${escape(section.title)}</h2>
${paragraphs}
${subsections}
</section>`;
          }).join("\n");
          return [
            "<!doctype html>",
            `<html lang="${document.language}">`,
            "<head>",
            '  <meta charset="utf-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1">',
            `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
            `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd2(structuredData)}<\/script>` : ""}`,
            "  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}h3{margin-top:20px;}ul{padding-left:24px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>",
            "</head>",
            "<body>",
            '  <main id="main-content" aria-labelledby="document-title">',
            "    <header>",
            `      <h1 id="document-title">${escape(document.title)} - ${escape(document.businessName)}</h1>`,
            `      <p><strong>${escape(this.text("Effective date", "Fecha de vigencia"))}:</strong> <time datetime="${escape(document.effectiveDate)}">${escape(document.effectiveDate)}</time></p>`,
            "    </header>",
            body,
            "  </main>",
            "</body>",
            "</html>"
          ].join("\n");
        }
        stringValue(value, fallback = "") {
          if (typeof value !== "string") {
            return fallback;
          }
          const normalized = value.trim();
          if (!normalized || [">", "no hay", "n/a", "na", "none", "null"].includes(normalized.toLowerCase())) {
            return fallback;
          }
          return normalized;
        }
        arrayValue(value) {
          return Array.isArray(value) ? value.filter(Boolean) : [];
        }
        isArgentina(data) {
          return data.operations.primaryJurisdiction === "ar" || String(data.business.country || "").toLowerCase().includes("argentina");
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
          if (paragraph.startsWith("- ")) {
            const items = paragraph.split("\n").filter((line) => line.startsWith("- ")).map((line) => `<li>${escape(line.slice(2))}</li>`).join("");
            return `<ul>${items}</ul>`;
          }
          return `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`;
        }
      };
      function buildStructuredDataDocument(document) {
        const metadata = document.metadata || {};
        const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
        if (!canonicalUrl) return null;
        const organization = {
          "@type": "Organization",
          name: document.businessName
        };
        if (metadata.websiteUrl) organization.url = metadata.websiteUrl;
        if (metadata.contactEmail) organization.email = metadata.contactEmail;
        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: `${document.title} - ${document.businessName}`,
              url: canonicalUrl,
              inLanguage: document.language === "es" ? "es" : "en",
              dateModified: document.effectiveDate,
              lastReviewed: document.effectiveDate,
              about: {
                "@type": "Thing",
                name: document.title
              },
              publisher: organization,
              accountablePerson: organization
            },
            organization
          ]
        };
      }
      function serializeJsonLd2(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
      }
      module2.exports = TermsGenerator;
    }
  });

  // js/deletion-generator.js
  var require_deletion_generator = __commonJS({
    "js/deletion-generator.js"(exports2, module2) {
      var DataDeletionGenerator = class {
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
            throw new Error(result.errors.join(" | "));
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
          const language = normalized.data.settings.language || "es";
          this.currentLanguage = language;
          const document = {
            businessName: normalized.data.business.name,
            effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            warnings: normalized.warnings,
            language,
            title: language === "es" ? "Instrucciones para Eliminaci\xF3n de Datos" : "Data Deletion Instructions",
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
                reason: included ? "section generated" : "section omitted"
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
              requestChannel: this.stringValue(input.deletion?.requestChannel, "email"),
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
              language: this.stringValue(input.settings?.language, "es")
            }
          };
          const messages = data.settings.language === "es" ? {
            missingBusinessName: "El nombre del negocio es obligatorio.",
            missingWebsite: "La URL del servicio o sitio es obligatoria.",
            missingRequestChannel: "Debe indicar c\xF3mo se solicita la eliminaci\xF3n de datos.",
            missingRequestContact: "Debe indicar al menos un canal real para solicitar la eliminaci\xF3n de datos.",
            missingScope: "Conviene indicar qu\xE9 datos o recursos se eliminar\xE1n cuando el usuario haga el pedido.",
            missingTimeline: "Conviene indicar en cu\xE1nto tiempo respond\xE9s y complet\xE1s la eliminaci\xF3n.",
            missingMetaHint: "Si la app se conecta con Meta, conviene explicar c\xF3mo revocar permisos o desvincular la cuenta."
          } : {
            missingBusinessName: "Business name is required.",
            missingWebsite: "Service or website URL is required.",
            missingRequestChannel: "You must specify how data deletion requests are submitted.",
            missingRequestContact: "You must provide at least one real channel for submitting data deletion requests.",
            missingScope: "You should specify what data or resources will be deleted when a user submits a request.",
            missingTimeline: "You should specify how quickly you respond to and complete deletion requests.",
            missingMetaHint: "If the app connects to Meta, you should explain how to revoke permissions or disconnect the account."
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
            this.section("overview", this.text("Overview", "Resumen"), [
              this.interpolate(this.text(
                "{business_name} provides this page to explain how users may request deletion of personal data associated with the service available at {website}.",
                "{business_name} publica esta p\xE1gina para explicar c\xF3mo los usuarios pueden solicitar la eliminaci\xF3n de datos personales asociados al servicio disponible en {website}."
              ), data)
            ]),
            this.section("request", this.text("How to Request Deletion", "C\xF3mo Solicitar la Eliminaci\xF3n"), [
              this.requestChannelText(data),
              this.identityText(data)
            ]),
            this.section("scope", this.text("What We Delete", "Qu\xE9 Eliminamos"), [
              this.scopeText(data),
              this.retentionText(data)
            ]),
            this.section("timing", this.text("Response and Completion Times", "Tiempos de Respuesta y Ejecuci\xF3n"), [
              this.timingText(data)
            ]),
            ...data.deletion.hasMetaConnection ? [
              this.section("meta", this.text("Meta / Facebook Connected Accounts", "Cuentas Conectadas de Meta / Facebook"), [
                this.metaText(data)
              ])
            ] : [],
            this.section("contact", this.text("Contact Information", "Informaci\xF3n de Contacto"), [
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
          return this.currentLanguage === "es" ? es : en;
        }
        interpolate(text, data) {
          return String(text || "").replaceAll("{business_name}", data.business.name || "").replaceAll("{website}", data.business.websiteUrl || "");
        }
        requestChannelText(data) {
          const parts = [];
          if (data.deletion.requestEmail) {
            parts.push(this.text(
              `Users may request deletion by email at ${data.deletion.requestEmail}.`,
              `Los usuarios pueden solicitar la eliminaci\xF3n por email a ${data.deletion.requestEmail}.`
            ));
          }
          if (data.deletion.requestUrl) {
            parts.push(this.text(
              `Requests may also be submitted through ${data.deletion.requestUrl}.`,
              `Las solicitudes tambi\xE9n pueden presentarse a trav\xE9s de ${data.deletion.requestUrl}.`
            ));
          }
          return parts.join(" ");
        }
        identityText(data) {
          if (data.deletion.identityRequirements.length === 0) {
            return this.text(
              "We may ask for enough information to verify that the request is made by the account holder or an authorized person before deleting data.",
              "Podemos solicitar informaci\xF3n suficiente para verificar que el pedido sea realizado por el titular de la cuenta o una persona autorizada antes de eliminar datos."
            );
          }
          return `${this.text("Please include the following details in the request:", "Por favor incluya los siguientes datos en la solicitud:")}
${this.listLines(data.deletion.identityRequirements)}`;
        }
        scopeText(data) {
          if (data.deletion.deletionScope.length === 0) {
            return this.text(
              "Upon valid request, we will review and delete personal data associated with the requesting user to the extent permitted by law and reasonably available in our systems.",
              "Ante un pedido v\xE1lido, revisaremos y eliminaremos los datos personales asociados al usuario solicitante en la medida permitida por la ley y razonablemente disponible en nuestros sistemas."
            );
          }
          return `${this.text("When a valid deletion request is confirmed, we will generally remove or anonymize the following data where applicable:", "Cuando se confirma una solicitud v\xE1lida de eliminaci\xF3n, en general eliminaremos o anonimizaremos los siguientes datos cuando corresponda:")}
${this.listLines(data.deletion.deletionScope)}`;
        }
        retentionText(data) {
          if (data.deletion.retentionExceptions.length === 0) {
            return this.text(
              "Certain records may be retained where necessary to comply with legal obligations, resolve disputes, enforce agreements, or maintain security and fraud-prevention records.",
              "Determinados registros pueden conservarse cuando sea necesario para cumplir obligaciones legales, resolver disputas, hacer cumplir acuerdos o mantener registros de seguridad y prevenci\xF3n de fraude."
            );
          }
          return `${this.text("Some data may be retained for limited purposes, including:", "Algunos datos pueden conservarse con fines limitados, incluyendo:")}
${this.listLines(data.deletion.retentionExceptions)}`;
        }
        timingText(data) {
          const response = data.deletion.responseTime ? this.text(`We generally acknowledge or respond to deletion requests within ${data.deletion.responseTime}.`, `En general acusamos recibo o respondemos las solicitudes de eliminaci\xF3n dentro de ${data.deletion.responseTime}.`) : this.text("We will respond to deletion requests within a reasonable time.", "Responderemos las solicitudes de eliminaci\xF3n dentro de un plazo razonable.");
          const completion = data.deletion.completionTime ? this.text(`Where the request is valid and complete, deletion is generally completed within ${data.deletion.completionTime}, subject to technical or legal constraints.`, `Cuando la solicitud es v\xE1lida y completa, la eliminaci\xF3n en general se completa dentro de ${data.deletion.completionTime}, sujeta a restricciones t\xE9cnicas o legales.`) : this.text("Deletion completion time depends on technical and legal constraints.", "El tiempo de ejecuci\xF3n de la eliminaci\xF3n depende de restricciones t\xE9cnicas y legales.");
          return `${response} ${completion}`;
        }
        metaText(data) {
          if (data.deletion.metaDisconnectInstructions) {
            return data.deletion.metaDisconnectInstructions;
          }
          return this.text(
            "If the service is connected to a Meta or Facebook account, users may also revoke the app connection from their Meta/Facebook account settings. Revoking access does not automatically erase all historical records, so a deletion request should still be submitted through the contact channels listed above.",
            "Si el servicio est\xE1 conectado a una cuenta de Meta o Facebook, los usuarios tambi\xE9n pueden revocar la conexi\xF3n de la app desde la configuraci\xF3n de su cuenta de Meta/Facebook. Revocar el acceso no elimina autom\xE1ticamente todos los registros hist\xF3ricos, por lo que igualmente debe presentarse una solicitud de eliminaci\xF3n a trav\xE9s de los canales de contacto indicados arriba."
          );
        }
        contactLines(data) {
          const lines = [];
          if (data.deletion.requestEmail || data.contact.email) lines.push(`- ${this.text("Email", "Email")}: ${data.deletion.requestEmail || data.contact.email}`);
          if (data.deletion.requestUrl || data.contact.pageUrl) lines.push(`- ${this.text("Request page", "P\xE1gina de solicitud")}: ${data.deletion.requestUrl || data.contact.pageUrl}`);
          if (data.contact.phone) lines.push(`- ${this.text("Phone", "Tel\xE9fono")}: ${data.contact.phone}`);
          if (data.business.address) lines.push(`- ${this.text("Postal address", "Direcci\xF3n postal")}: ${data.business.address}`);
          return lines.join("\n");
        }
        listLines(items) {
          return items.map((item) => `- ${item}`).join("\n");
        }
        formatAsMarkdown(document) {
          const lines = [
            `# ${document.title} - ${document.businessName}`,
            "",
            `${this.text("Effective date", "Fecha de vigencia")}: ${document.effectiveDate}`,
            ""
          ];
          for (const section of document.sections) {
            lines.push(`## ${section.title}`, "");
            for (const paragraph of section.paragraphs) {
              lines.push(paragraph, "");
            }
          }
          return lines.join("\n").trim();
        }
        formatAsText(document) {
          return this.formatAsMarkdown(document).replace(/^#{1,3}\s+/gm, "");
        }
        formatAsHTML(document) {
          const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          const structuredData = this.buildStructuredData(document);
          const body = document.sections.map((section) => {
            const paragraphs = section.paragraphs.map((paragraph) => this.paragraphToHtml(paragraph, escape)).join("\n");
            return `<section>
<h2>${escape(section.title)}</h2>
${paragraphs}
</section>`;
          }).join("\n");
          return [
            "<!doctype html>",
            `<html lang="${document.language}">`,
            "<head>",
            '  <meta charset="utf-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1">',
            `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
            `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd2(structuredData)}<\/script>` : ""}`,
            "  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}ul{padding-left:24px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>",
            "</head>",
            "<body>",
            '  <main id="main-content" aria-labelledby="document-title">',
            "    <header>",
            `      <h1 id="document-title">${escape(document.title)} - ${escape(document.businessName)}</h1>`,
            `      <p><strong>${escape(this.text("Effective date", "Fecha de vigencia"))}:</strong> <time datetime="${escape(document.effectiveDate)}">${escape(document.effectiveDate)}</time></p>`,
            "    </header>",
            body,
            "  </main>",
            "</body>",
            "</html>"
          ].join("\n");
        }
        paragraphToHtml(paragraph, escape) {
          if (String(paragraph).startsWith("- ")) {
            const items = String(paragraph).split("\n").filter((line) => line.startsWith("- ")).map((line) => `<li>${escape(line.slice(2))}</li>`).join("");
            return `<ul>${items}</ul>`;
          }
          return `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`;
        }
        stringValue(value, fallback = "") {
          if (typeof value !== "string") return fallback;
          const normalized = value.trim();
          if (!normalized || [">", "no hay", "n/a", "na", "none", "null"].includes(normalized.toLowerCase())) {
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
      };
      function buildStructuredDataDocument(document) {
        const metadata = document.metadata || {};
        const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
        if (!canonicalUrl) return null;
        const organization = {
          "@type": "Organization",
          name: document.businessName
        };
        if (metadata.websiteUrl) organization.url = metadata.websiteUrl;
        if (metadata.contactEmail) organization.email = metadata.contactEmail;
        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: `${document.title} - ${document.businessName}`,
              url: canonicalUrl,
              inLanguage: document.language === "es" ? "es" : "en",
              dateModified: document.effectiveDate,
              lastReviewed: document.effectiveDate,
              about: {
                "@type": "Thing",
                name: document.title
              },
              publisher: organization,
              accountablePerson: organization
            },
            organization
          ]
        };
      }
      function serializeJsonLd2(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
      }
      module2.exports = DataDeletionGenerator;
    }
  });

  // js/cookies-generator.js
  var require_cookies_generator = __commonJS({
    "js/cookies-generator.js"(exports2, module2) {
      var CookiesPolicyGenerator = class {
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
            throw new Error(result.errors.join(" | "));
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
          const language = normalized.data.settings.language || "es";
          this.currentLanguage = language;
          const document = {
            businessName: normalized.data.business.name,
            effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            warnings: normalized.warnings,
            language,
            title: language === "es" ? "Pol\xEDtica de Cookies" : "Cookie Policy",
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
                reason: included ? "section generated" : "section omitted"
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
              consentMode: this.stringValue(input.cookies?.consentMode, "banner"),
              managementUrl: this.stringValue(input.cookies?.managementUrl || input.contact?.pageUrl),
              browserControls: this.stringValue(input.cookies?.browserControls),
              retentionPolicy: this.stringValue(input.cookies?.retentionPolicy),
              notes: this.arrayValue(input.cookies?.notes)
            },
            settings: {
              language: this.stringValue(input.settings?.language, "es")
            }
          };
          const messages = data.settings.language === "es" ? {
            missingBusinessName: "El nombre del negocio es obligatorio.",
            missingWebsite: "La URL del sitio o aplicaci\xF3n es obligatoria.",
            missingCategories: "Conviene indicar al menos una categor\xEDa de cookies o tecnolog\xEDas similares.",
            missingThirdParties: "Conviene indicar si existen terceros que colocan o leen cookies, como anal\xEDtica o publicidad.",
            missingManagementUrl: "Conviene indicar una URL, p\xE1gina o canal donde el usuario pueda gestionar cookies o contactarte sobre ellas.",
            advertisingNeedsConsent: "Si us\xE1s cookies publicitarias o remarketing, conviene aclarar el mecanismo de consentimiento o banner de cookies.",
            analyticsNeedsControls: "Si us\xE1s anal\xEDtica o cookies no esenciales, conviene explicar c\xF3mo deshabilitarlas desde el navegador o desde tu banner.",
            argentinaSpanishWarning: "Para un sitio o app en Argentina conviene publicar la pol\xEDtica de cookies tambi\xE9n en espa\xF1ol.",
            advertisingNeedsSeparation: "Si us\xE1s publicidad o remarketing, conviene separar con claridad cookies necesarias, anal\xEDticas y publicitarias.",
            advertisingNeedsThirdPartyClarity: "Si us\xE1s anal\xEDtica o publicidad, conviene identificar mejor los terceros y vincular esta pol\xEDtica con la pol\xEDtica de privacidad general."
          } : {
            missingBusinessName: "Business name is required.",
            missingWebsite: "Website or app URL is required.",
            missingCategories: "You should specify at least one cookie or similar technology category.",
            missingThirdParties: "You should specify whether third parties place or read cookies, such as analytics or advertising providers.",
            missingManagementUrl: "You should provide a URL, page, or contact channel where users can manage cookies or contact you about them.",
            advertisingNeedsConsent: "If you use advertising or remarketing cookies, you should explain the consent or cookie-banner mechanism.",
            analyticsNeedsControls: "If you use analytics or other non-essential cookies, you should explain how users can disable them in the browser or through your banner.",
            argentinaSpanishWarning: "For an Argentina-facing site or app, publishing the cookie policy in Spanish is strongly recommended.",
            advertisingNeedsSeparation: "If you use advertising or remarketing, clearly separate necessary, analytics, and advertising cookies.",
            advertisingNeedsThirdPartyClarity: "If you use analytics or advertising, identify third parties more clearly and link this policy back to your broader privacy policy."
          };
          const errors = [];
          const warnings = [];
          if (!data.business.name) errors.push(messages.missingBusinessName);
          if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
          if (data.cookies.categories.length === 0) warnings.push(messages.missingCategories);
          if (data.cookies.thirdParties.length === 0) warnings.push(messages.missingThirdParties);
          if (!data.cookies.managementUrl && !data.contact.email) warnings.push(messages.missingManagementUrl);
          if (data.cookies.categories.includes("advertising") && data.cookies.consentMode === "essential_only") warnings.push(messages.advertisingNeedsConsent);
          if (data.cookies.categories.some((item) => ["analytics", "advertising", "preferences"].includes(item)) && !data.cookies.browserControls) warnings.push(messages.analyticsNeedsControls);
          if (this.isArgentina(data) && data.settings.language !== "es") warnings.push(messages.argentinaSpanishWarning);
          if (data.cookies.categories.includes("advertising") && !data.cookies.categories.includes("analytics") && !data.cookies.categories.includes("necessary")) warnings.push(messages.advertisingNeedsSeparation);
          if (data.cookies.categories.some((item) => ["analytics", "advertising"].includes(item)) && data.cookies.thirdParties.length === 0) warnings.push(messages.advertisingNeedsThirdPartyClarity);
          return { data, errors, warnings };
        }
        buildSections(data) {
          return [
            this.section("overview", this.text("Overview", "Resumen"), [
              this.interpolate(this.text(
                "{business_name} uses cookies and similar technologies on {website} to operate the service, remember preferences, measure usage, and, where applicable, support analytics or advertising features.",
                "{business_name} utiliza cookies y tecnolog\xEDas similares en {website} para operar el servicio, recordar preferencias, medir el uso y, cuando corresponde, soportar funciones de anal\xEDtica o publicidad."
              ), data)
            ]),
            this.section("what-are-cookies", this.text("What Cookies Are", "Qu\xE9 Son las Cookies"), [
              this.text(
                "Cookies are small text files or similar technologies stored on a browser, device, or application context so that a service can recognize a session, remember preferences, and understand how the service is used.",
                "Las cookies son peque\xF1os archivos de texto o tecnolog\xEDas similares que se almacenan en el navegador, el dispositivo o el contexto de una aplicaci\xF3n para que el servicio pueda reconocer una sesi\xF3n, recordar preferencias y comprender c\xF3mo se utiliza."
              )
            ]),
            this.section("categories", this.text("Categories of Cookies We Use", "Categor\xEDas de Cookies que Utilizamos"), [
              this.categoriesText(data)
            ]),
            ...this.isArgentina(data) ? [
              this.section("argentina-notice", this.text("Argentina Cookie Notice", "Aviso de Cookies para Argentina"), [
                this.argentinaNoticeText(data)
              ])
            ] : [],
            this.section("third-parties", this.text("Third-Party Cookies and Similar Technologies", "Cookies de Terceros y Tecnolog\xEDas Similares"), [
              this.thirdPartiesText(data)
            ]),
            this.section("controls", this.text("Consent and Cookie Controls", "Consentimiento y Controles de Cookies"), [
              this.controlsText(data)
            ]),
            this.section("retention", this.text("Duration and Retention", "Duraci\xF3n y Retenci\xF3n"), [
              this.retentionText(data)
            ]),
            this.section("contact", this.text("Contact Information", "Informaci\xF3n de Contacto"), [
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
          return this.currentLanguage === "es" ? es : en;
        }
        interpolate(text, data) {
          return String(text || "").replaceAll("{business_name}", data.business.name || "").replaceAll("{website}", data.business.websiteUrl || "");
        }
        categoriesText(data) {
          if (data.cookies.categories.length === 0) {
            return this.text(
              "We may use strictly necessary, preference, analytics, and advertising cookies depending on how the service is configured over time.",
              "Podemos utilizar cookies estrictamente necesarias, de preferencias, de anal\xEDtica y de publicidad seg\xFAn c\xF3mo se configure el servicio a lo largo del tiempo."
            );
          }
          const labels = data.cookies.categories.map((item) => this.cookieCategoryLabel(item));
          return `${this.text("The service may use the following categories of cookies or similar technologies:", "El servicio puede utilizar las siguientes categor\xEDas de cookies o tecnolog\xEDas similares:")}
${this.listLines(labels)}`;
        }
        thirdPartiesText(data) {
          if (data.cookies.thirdParties.length === 0) {
            return this.text(
              "We may use internal tools and, where applicable, external providers that support analytics, advertising, embedded content, or similar operational functions.",
              "Podemos utilizar herramientas internas y, cuando corresponda, proveedores externos que soporten anal\xEDtica, publicidad, contenido embebido u otras funciones operativas similares."
            );
          }
          const labels = data.cookies.thirdParties.map((item) => this.thirdPartyLabel(item));
          return `${this.text("The following categories of third parties may set or read cookies or similar technologies through the service:", "Las siguientes categor\xEDas de terceros pueden instalar o leer cookies o tecnolog\xEDas similares a trav\xE9s del servicio:")}
${this.listLines(labels)}`;
        }
        argentinaNoticeText(data) {
          const categories = this.text("Where cookies are not strictly necessary for the technical operation of the service, users should review available consent or preference controls before enabling analytics, advertising, or similar optional technologies.", "Cuando las cookies no sean estrictamente necesarias para la operaci\xF3n t\xE9cnica del servicio, los usuarios deber\xEDan revisar los controles de consentimiento o preferencias disponibles antes de habilitar tecnolog\xEDas opcionales de anal\xEDtica, publicidad o similares.");
          const privacy = data.cookies.managementUrl ? this.text(`Additional information about privacy practices, third parties, or user choices may also be available at ${data.cookies.managementUrl}.`, `Puede existir informaci\xF3n adicional sobre pr\xE1cticas de privacidad, terceros u opciones del usuario en ${data.cookies.managementUrl}.`) : "";
          return `${categories} ${privacy}`.trim();
        }
        controlsText(data) {
          const consent = this.consentModeText(data.cookies.consentMode);
          const browserControls = data.cookies.browserControls ? this.text(
            `Users can also manage or disable cookies through the following browser or device controls: ${data.cookies.browserControls}.`,
            `Los usuarios tambi\xE9n pueden gestionar o deshabilitar cookies mediante los siguientes controles del navegador o dispositivo: ${data.cookies.browserControls}.`
          ) : this.text(
            "Users may also review browser or device settings to block, delete, or limit cookies where those controls are available.",
            "Los usuarios tambi\xE9n pueden revisar la configuraci\xF3n del navegador o del dispositivo para bloquear, eliminar o limitar cookies cuando esos controles est\xE9n disponibles."
          );
          const management = data.cookies.managementUrl ? this.text(
            `Additional cookie-management information is available at ${data.cookies.managementUrl}.`,
            `Hay informaci\xF3n adicional para gestionar cookies en ${data.cookies.managementUrl}.`
          ) : "";
          return [consent, browserControls, management].filter(Boolean).join(" ");
        }
        retentionText(data) {
          if (data.cookies.retentionPolicy) {
            return data.cookies.retentionPolicy;
          }
          return this.text(
            "Some cookies are session-based and expire when a browser closes, while others may remain for a longer period depending on their purpose, configuration, and the policies of the relevant provider.",
            "Algunas cookies son de sesi\xF3n y expiran cuando se cierra el navegador, mientras que otras pueden permanecer por un per\xEDodo mayor seg\xFAn su finalidad, configuraci\xF3n y las pol\xEDticas del proveedor correspondiente."
          );
        }
        contactText(data) {
          const parts = [];
          if (data.contact.email) {
            parts.push(this.text(`For cookie-related questions, users may contact us by email at ${data.contact.email}.`, `Para consultas relacionadas con cookies, los usuarios pueden contactarnos por email a ${data.contact.email}.`));
          }
          if (data.cookies.managementUrl) {
            parts.push(this.text(`Cookie choices or related information may also be available at ${data.cookies.managementUrl}.`, `Las opciones o informaci\xF3n relacionada con cookies tambi\xE9n pueden estar disponibles en ${data.cookies.managementUrl}.`));
          }
          if (data.contact.phone) {
            parts.push(this.text(`Phone contact: ${data.contact.phone}.`, `Tel\xE9fono de contacto: ${data.contact.phone}.`));
          }
          if (data.business.address) {
            parts.push(this.text(`Postal address: ${data.business.address}.`, `Direcci\xF3n postal: ${data.business.address}.`));
          }
          return parts.join(" ");
        }
        consentModeText(mode) {
          if (mode === "implied") {
            return this.text(
              "Where permitted by law, continued use of the service after notice may be treated as acceptance of certain non-essential cookies, subject to user controls and applicable law.",
              "Cuando la ley lo permita, el uso continuado del servicio luego del aviso puede tratarse como aceptaci\xF3n de determinadas cookies no esenciales, sujeto a los controles del usuario y a la ley aplicable."
            );
          }
          if (mode === "essential_only") {
            return this.text(
              "The service is intended to operate only with strictly necessary cookies unless and until non-essential cookies are separately enabled by the operator or user settings.",
              "El servicio est\xE1 pensado para operar s\xF3lo con cookies estrictamente necesarias, salvo que el operador o la configuraci\xF3n del usuario habiliten por separado cookies no esenciales."
            );
          }
          return this.text(
            "Where required, the service uses a cookie banner, preference center, or similar consent mechanism so that users can accept, reject, or configure non-essential cookies.",
            "Cuando corresponde, el servicio utiliza un banner de cookies, centro de preferencias o mecanismo similar de consentimiento para que los usuarios puedan aceptar, rechazar o configurar cookies no esenciales."
          );
        }
        cookieCategoryLabel(value) {
          const labels = {
            necessary: this.text("Strictly necessary cookies", "Cookies estrictamente necesarias"),
            preferences: this.text("Preference or functional cookies", "Cookies de preferencias o funcionales"),
            analytics: this.text("Analytics or measurement cookies", "Cookies de anal\xEDtica o medici\xF3n"),
            advertising: this.text("Advertising or remarketing cookies", "Cookies de publicidad o remarketing")
          };
          return labels[value] || value;
        }
        thirdPartyLabel(value) {
          const labels = {
            analytics: this.text("Analytics providers", "Proveedores de anal\xEDtica"),
            advertising: this.text("Advertising and remarketing platforms", "Plataformas de publicidad y remarketing"),
            social: this.text("Social media embeds or social login providers", "Integraciones sociales, contenido embebido o login social"),
            cloud: this.text("Infrastructure or delivery providers that may support content or scripts", "Proveedores de infraestructura o entrega que pueden soportar contenido o scripts"),
            email: this.text("Email or marketing automation providers", "Proveedores de email o automatizaci\xF3n de marketing")
          };
          return labels[value] || value;
        }
        listLines(items) {
          return items.map((item) => `- ${item}`).join("\n");
        }
        formatAsMarkdown(document) {
          const lines = [
            `# ${document.title} - ${document.businessName}`,
            "",
            `${this.text("Effective date", "Fecha de vigencia")}: ${document.effectiveDate}`,
            ""
          ];
          for (const section of document.sections) {
            lines.push(`## ${section.title}`, "");
            for (const paragraph of section.paragraphs) {
              lines.push(paragraph, "");
            }
          }
          return lines.join("\n").trim();
        }
        formatAsText(document) {
          return this.formatAsMarkdown(document).replace(/^#{1,3}\s+/gm, "");
        }
        formatAsHTML(document) {
          const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          const structuredData = this.buildStructuredData(document);
          const body = document.sections.map((section) => {
            const paragraphs = section.paragraphs.map((paragraph) => this.paragraphToHtml(paragraph, escape)).join("\n");
            return `<section>
<h2>${escape(section.title)}</h2>
${paragraphs}
</section>`;
          }).join("\n");
          return [
            "<!doctype html>",
            `<html lang="${document.language}">`,
            "<head>",
            '  <meta charset="utf-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1">',
            `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
            `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd2(structuredData)}<\/script>` : ""}`,
            "  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}ul{padding-left:24px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>",
            "</head>",
            "<body>",
            '  <main id="main-content" aria-labelledby="document-title">',
            "    <header>",
            `      <h1 id="document-title">${escape(document.title)} - ${escape(document.businessName)}</h1>`,
            `      <p><strong>${escape(this.text("Effective date", "Fecha de vigencia"))}:</strong> <time datetime="${escape(document.effectiveDate)}">${escape(document.effectiveDate)}</time></p>`,
            "    </header>",
            body,
            "  </main>",
            "</body>",
            "</html>"
          ].join("\n");
        }
        paragraphToHtml(paragraph, escape) {
          if (String(paragraph).startsWith("- ")) {
            const items = String(paragraph).split("\n").filter((line) => line.startsWith("- ")).map((line) => `<li>${escape(line.slice(2))}</li>`).join("");
            return `<ul>${items}</ul>`;
          }
          return `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`;
        }
        stringValue(value, fallback = "") {
          if (typeof value !== "string") return fallback;
          const normalized = value.trim();
          if (!normalized || [">", "no hay", "n/a", "na", "none", "null"].includes(normalized.toLowerCase())) {
            return fallback;
          }
          return normalized;
        }
        arrayValue(value) {
          return Array.isArray(value) ? value.filter(Boolean) : [];
        }
        isArgentina(data) {
          return data.operations.primaryJurisdiction === "ar" || String(data.business.country || "").toLowerCase().includes("argentina");
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
      };
      function buildStructuredDataDocument(document) {
        const metadata = document.metadata || {};
        const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
        if (!canonicalUrl) return null;
        const organization = {
          "@type": "Organization",
          name: document.businessName
        };
        if (metadata.websiteUrl) organization.url = metadata.websiteUrl;
        if (metadata.contactEmail) organization.email = metadata.contactEmail;
        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: `${document.title} - ${document.businessName}`,
              url: canonicalUrl,
              inLanguage: document.language === "es" ? "es" : "en",
              dateModified: document.effectiveDate,
              lastReviewed: document.effectiveDate,
              about: {
                "@type": "Thing",
                name: document.title
              },
              publisher: organization,
              accountablePerson: organization
            },
            organization
          ]
        };
      }
      function serializeJsonLd2(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
      }
      module2.exports = CookiesPolicyGenerator;
    }
  });

  // js/refund-generator.js
  var require_refund_generator = __commonJS({
    "js/refund-generator.js"(exports2, module2) {
      var ReturnRefundPolicyGenerator = class {
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
            throw new Error(result.errors.join(" | "));
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
          const language = normalized.data.settings.language || "es";
          this.currentLanguage = language;
          const document = {
            businessName: normalized.data.business.name,
            effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            warnings: normalized.warnings,
            language,
            title: language === "es" ? "Pol\xEDtica de Devoluciones y Reembolsos" : "Return & Refund Policy",
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
                reason: included ? "section generated" : "section omitted"
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
              offeringType: this.stringValue(input.refund?.offeringType, "physical_goods"),
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
              language: this.stringValue(input.settings?.language, "es")
            }
          };
          const messages = data.settings.language === "es" ? {
            missingBusinessName: "El nombre del negocio es obligatorio.",
            missingWebsite: "La URL del sitio o aplicaci\xF3n es obligatoria.",
            missingReturnWindow: "Conviene indicar el plazo general para pedir devoluci\xF3n o reembolso.",
            missingReturnConditions: "Conviene aclarar en qu\xE9 estado debe estar el producto o servicio para aceptar una devoluci\xF3n.",
            missingReturnChannel: "Conviene indicar un canal claro para iniciar devoluciones o reclamos.",
            missingRefundTiming: "Conviene indicar cu\xE1nto tarda el reembolso una vez aprobado.",
            digitalNeedsClarity: "Si vend\xE9s productos digitales, conviene aclarar si son finales, no reembolsables o si tienen excepciones.",
            noReturnsNeedsReason: "Si no acept\xE1s devoluciones, conviene aclarar excepciones m\xEDnimas por da\xF1o, error o exigencia legal.",
            argentinaSpanishWarning: "Para una pol\xEDtica de devoluciones orientada a Argentina conviene publicarla en espa\xF1ol.",
            argentinaWithdrawalWarning: "Para ventas a distancia en Argentina conviene contemplar el derecho de arrepentimiento y aclarar que los derechos legales del consumidor prevalecen cuando corresponda.",
            argentinaDefectWarning: "Para e-commerce en Argentina conviene describir con claridad qu\xE9 ocurre si el producto llega defectuoso, da\xF1ado o es distinto del ofrecido."
          } : {
            missingBusinessName: "Business name is required.",
            missingWebsite: "Website or app URL is required.",
            missingReturnWindow: "You should specify the general time window for return or refund requests.",
            missingReturnConditions: "You should explain the required condition of returned items or services.",
            missingReturnChannel: "You should provide a clear channel for initiating return or refund requests.",
            missingRefundTiming: "You should state how long refunds usually take after approval.",
            digitalNeedsClarity: "If you sell digital products, you should clarify whether sales are final, non-refundable, or subject to exceptions.",
            noReturnsNeedsReason: "If you do not accept returns, you should explain at least the basic exceptions for damage, error, or legal obligations.",
            argentinaSpanishWarning: "For an Argentina-facing return policy, publishing in Spanish is strongly recommended.",
            argentinaWithdrawalWarning: "For distance sales in Argentina, consider describing the statutory withdrawal or cooling-off right and clarifying that mandatory consumer rights prevail where applicable.",
            argentinaDefectWarning: "For Argentina e-commerce, clearly describe what happens if the product arrives defective, damaged, or materially different from what was offered."
          };
          const errors = [];
          const warnings = [];
          if (!data.business.name) errors.push(messages.missingBusinessName);
          if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
          if (data.refund.acceptsReturns && !data.refund.refundWindow) warnings.push(messages.missingReturnWindow);
          if (data.refund.acceptsReturns && !data.refund.returnConditions) warnings.push(messages.missingReturnConditions);
          if (!data.refund.returnRequestChannel && !data.contact.email && !data.contact.pageUrl) warnings.push(messages.missingReturnChannel);
          if (!data.refund.refundProcessingTime) warnings.push(messages.missingRefundTiming);
          if (data.refund.offeringType === "digital_products" && !data.refund.digitalGoodsFinal && data.refund.nonReturnableItems.length === 0) warnings.push(messages.digitalNeedsClarity);
          if (!data.refund.acceptsReturns && !data.refund.damagedItemsProcess) warnings.push(messages.noReturnsNeedsReason);
          if (this.isArgentina(data)) {
            if (data.settings.language !== "es") warnings.push(messages.argentinaSpanishWarning);
            if (!data.refund.refundWindow) warnings.push(messages.argentinaWithdrawalWarning);
            if (!data.refund.damagedItemsProcess) warnings.push(messages.argentinaDefectWarning);
          }
          return { data, errors, warnings };
        }
        buildSections(data) {
          return [
            this.section("overview", this.text("Overview", "Resumen"), [
              this.interpolate(this.text(
                "{business_name} publishes this return and refund policy for purchases or services offered through {website}.",
                "{business_name} publica esta pol\xEDtica de devoluciones y reembolsos para compras o servicios ofrecidos a trav\xE9s de {website}."
              ), data)
            ]),
            this.section("eligibility", this.text("Eligibility for Returns and Refunds", "Elegibilidad para Devoluciones y Reembolsos"), [
              this.eligibilityText(data)
            ]),
            ...this.isArgentina(data) ? [
              this.section("consumer-rights-ar", this.text("Argentina Consumer and Distance-Sales Notice", "Aviso de Consumo y Venta a Distancia en Argentina"), [
                this.argentinaConsumerText(data)
              ])
            ] : [],
            this.section("process", this.text("How to Start a Return or Refund Request", "C\xF3mo Iniciar una Solicitud de Devoluci\xF3n o Reembolso"), [
              this.processText(data)
            ]),
            this.section("shipping", this.text("Return Shipping and Logistics", "Env\xEDo de Devoluciones y Log\xEDstica"), [
              this.shippingText(data)
            ]),
            this.section("exceptions", this.text("Exceptions and Non-Returnable Items", "Excepciones y Productos No Retornables"), [
              this.exceptionsText(data)
            ]),
            this.section("timing", this.text("Refund Timing and Method", "Tiempos y M\xE9todo de Reembolso"), [
              this.timingText(data)
            ]),
            this.section("contact", this.text("Contact Information", "Informaci\xF3n de Contacto"), [
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
          return this.currentLanguage === "es" ? es : en;
        }
        interpolate(text, data) {
          return String(text || "").replaceAll("{business_name}", data.business.name || "").replaceAll("{website}", data.business.websiteUrl || "");
        }
        eligibilityText(data) {
          if (!data.refund.acceptsReturns) {
            return this.text(
              "Returns are generally not accepted except where the item or service is defective, materially different from what was ordered, or where applicable law requires a remedy.",
              "En general no se aceptan devoluciones, salvo cuando el producto o servicio presente fallas, sea sustancialmente distinto de lo pedido o cuando la ley aplicable exija un remedio."
            );
          }
          const parts = [];
          if (data.refund.refundWindow) {
            parts.push(this.text(
              `Return or refund requests should generally be submitted within ${data.refund.refundWindow} of delivery, access, or purchase, as applicable.`,
              `Las solicitudes de devoluci\xF3n o reembolso en general deben presentarse dentro de ${data.refund.refundWindow} desde la entrega, el acceso o la compra, seg\xFAn corresponda.`
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
          return parts.join(" ");
        }
        argentinaConsumerText(data) {
          const withdrawal = data.refund.refundWindow ? this.text(
            `Where Argentina consumer law applies, customers purchasing at a distance should review whether a statutory withdrawal right may exist within ${data.refund.refundWindow}, without prejudice to any mandatory legal right that may prevail over this policy.`,
            `Cuando resulte aplicable la normativa argentina de consumo, los clientes que compren a distancia deber\xEDan revisar si existe un derecho de arrepentimiento dentro de ${data.refund.refundWindow}, sin perjuicio de cualquier derecho legal obligatorio que prevalezca sobre esta pol\xEDtica.`
          ) : this.text(
            "Where Argentina consumer law applies, customers purchasing at a distance may have a statutory withdrawal right, without prejudice to any mandatory legal right that prevails over this policy.",
            "Cuando resulte aplicable la normativa argentina de consumo, los clientes que compren a distancia pueden tener un derecho legal de arrepentimiento, sin perjuicio de cualquier derecho obligatorio que prevalezca sobre esta pol\xEDtica."
          );
          const defects = data.refund.damagedItemsProcess ? ` ${this.text("Issues involving defective, damaged, or materially different products should be handled under the specific review and remediation process described below.", "Los supuestos de producto defectuoso, da\xF1ado o sustancialmente distinto de lo ofrecido deber\xEDan canalizarse conforme al proceso espec\xEDfico de revisi\xF3n y soluci\xF3n indicado m\xE1s abajo.")}` : "";
          return `${withdrawal}${defects}`;
        }
        processText(data) {
          const channel = data.refund.returnRequestChannel || data.contact.email || data.contact.pageUrl;
          const base = channel ? this.text(
            `To initiate a request, contact us through ${channel} and provide enough information to identify the order, purchase, or service involved.`,
            `Para iniciar una solicitud, contactanos a trav\xE9s de ${channel} y aport\xE1 informaci\xF3n suficiente para identificar el pedido, la compra o el servicio involucrado.`
          ) : this.text(
            "To initiate a request, contact the business and provide enough information to identify the order, purchase, or service involved.",
            "Para iniciar una solicitud, contact\xE1 al negocio y aport\xE1 informaci\xF3n suficiente para identificar el pedido, la compra o el servicio involucrado."
          );
          const damaged = data.refund.damagedItemsProcess ? ` ${data.refund.damagedItemsProcess}` : "";
          return `${base}${damaged}`;
        }
        shippingText(data) {
          const labels = {
            customer: this.text("The customer normally bears return shipping costs unless law or a specific case requires otherwise.", "El cliente normalmente asume el costo del env\xEDo de devoluci\xF3n, salvo que la ley o el caso concreto indiquen otra cosa."),
            merchant: this.text("The business normally bears return shipping costs when a return is approved.", "El negocio normalmente asume el costo del env\xEDo de devoluci\xF3n cuando una devoluci\xF3n es aprobada."),
            case_by_case: this.text("Return shipping responsibility is reviewed case by case depending on the reason for the return, the product condition, and applicable law.", "La responsabilidad por el env\xEDo de devoluci\xF3n se revisa caso por caso seg\xFAn el motivo de la devoluci\xF3n, el estado del producto y la ley aplicable.")
          };
          return labels[data.refund.returnShippingResponsibility] || this.text(
            "Shipping and logistics for returns depend on the type of product, the reason for the request, and applicable law.",
            "La log\xEDstica y el env\xEDo de devoluciones dependen del tipo de producto, del motivo de la solicitud y de la ley aplicable."
          );
        }
        exceptionsText(data) {
          const items = [];
          if (data.refund.offeringType === "digital_products" && data.refund.digitalGoodsFinal) {
            items.push(this.text("Digital products, downloads, or activated licenses may be final and non-refundable once accessed or delivered, except where law requires otherwise.", "Los productos digitales, descargas o licencias activadas pueden ser finales y no reembolsables una vez accedidos o entregados, salvo que la ley exija lo contrario."));
          }
          if (data.refund.nonReturnableItems.length > 0) {
            return `${this.text("The following categories may be non-returnable or subject to special conditions:", "Las siguientes categor\xEDas pueden no admitir devoluci\xF3n o estar sujetas a condiciones especiales:")}
${this.listLines(data.refund.nonReturnableItems)}`;
          }
          if (items.length > 0) {
            return items.join(" ");
          }
          return this.text(
            "Certain items, services, or digital goods may be excluded from returns or refunds where clearly indicated at purchase, where they are perishable, personalized, activated, or otherwise subject to a lawful exception.",
            "Determinados productos, servicios o bienes digitales pueden quedar excluidos de devoluciones o reembolsos cuando ello se informe claramente al momento de la compra, cuando sean perecederos, personalizados, activados o est\xE9n alcanzados por una excepci\xF3n legal v\xE1lida."
          );
        }
        timingText(data) {
          const method = data.refund.refundMethod ? this.text(`Approved refunds are generally issued through ${data.refund.refundMethod}.`, `Los reembolsos aprobados en general se emiten mediante ${data.refund.refundMethod}.`) : this.text("Approved refunds are generally issued through the same or a comparable payment method used for the original transaction, unless otherwise agreed or required.", "Los reembolsos aprobados en general se emiten mediante el mismo medio de pago usado en la transacci\xF3n original o uno comparable, salvo acuerdo o exigencia distinta.");
          const timing = data.refund.refundProcessingTime ? this.text(`Once approved, refunds are generally processed within ${data.refund.refundProcessingTime}, subject to banking, card, or platform timing.`, `Una vez aprobados, los reembolsos en general se procesan dentro de ${data.refund.refundProcessingTime}, sujeto a tiempos bancarios, de tarjeta o de la plataforma.`) : this.text("Refund timing depends on approval, payment method, and the policies of the relevant banking or payment provider.", "El tiempo del reembolso depende de la aprobaci\xF3n, del medio de pago y de las pol\xEDticas del proveedor bancario o de pagos correspondiente.");
          return `${method} ${timing}`;
        }
        contactText(data) {
          const parts = [];
          if (data.contact.email) {
            parts.push(this.text(`For return or refund questions, contact us by email at ${data.contact.email}.`, `Para consultas sobre devoluciones o reembolsos, contactanos por email a ${data.contact.email}.`));
          }
          if (data.contact.pageUrl) {
            parts.push(this.text(`Additional contact or support information may be available at ${data.contact.pageUrl}.`, `Puede haber informaci\xF3n adicional de contacto o soporte en ${data.contact.pageUrl}.`));
          }
          if (data.contact.phone) {
            parts.push(this.text(`Phone contact: ${data.contact.phone}.`, `Tel\xE9fono de contacto: ${data.contact.phone}.`));
          }
          if (data.business.address) {
            parts.push(this.text(`Postal address: ${data.business.address}.`, `Direcci\xF3n postal: ${data.business.address}.`));
          }
          return parts.join(" ");
        }
        listLines(items) {
          return items.map((item) => `- ${item}`).join("\n");
        }
        formatAsMarkdown(document) {
          const lines = [
            `# ${document.title} - ${document.businessName}`,
            "",
            `${this.text("Effective date", "Fecha de vigencia")}: ${document.effectiveDate}`,
            ""
          ];
          for (const section of document.sections) {
            lines.push(`## ${section.title}`, "");
            for (const paragraph of section.paragraphs) {
              lines.push(paragraph, "");
            }
          }
          return lines.join("\n").trim();
        }
        formatAsText(document) {
          return this.formatAsMarkdown(document).replace(/^#{1,3}\s+/gm, "");
        }
        formatAsHTML(document) {
          const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          const structuredData = this.buildStructuredData(document);
          const body = document.sections.map((section) => {
            const paragraphs = section.paragraphs.map((paragraph) => this.paragraphToHtml(paragraph, escape)).join("\n");
            return `<section>
<h2>${escape(section.title)}</h2>
${paragraphs}
</section>`;
          }).join("\n");
          return [
            "<!doctype html>",
            `<html lang="${document.language}">`,
            "<head>",
            '  <meta charset="utf-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1">',
            `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
            `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd2(structuredData)}<\/script>` : ""}`,
            "  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}ul{padding-left:24px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>",
            "</head>",
            "<body>",
            '  <main id="main-content" aria-labelledby="document-title">',
            "    <header>",
            `      <h1 id="document-title">${escape(document.title)} - ${escape(document.businessName)}</h1>`,
            `      <p><strong>${escape(this.text("Effective date", "Fecha de vigencia"))}:</strong> <time datetime="${escape(document.effectiveDate)}">${escape(document.effectiveDate)}</time></p>`,
            "    </header>",
            body,
            "  </main>",
            "</body>",
            "</html>"
          ].join("\n");
        }
        paragraphToHtml(paragraph, escape) {
          if (String(paragraph).startsWith("- ")) {
            const items = String(paragraph).split("\n").filter((line) => line.startsWith("- ")).map((line) => `<li>${escape(line.slice(2))}</li>`).join("");
            return `<ul>${items}</ul>`;
          }
          return `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`;
        }
        stringValue(value, fallback = "") {
          if (typeof value !== "string") return fallback;
          const normalized = value.trim();
          if (!normalized || [">", "no hay", "n/a", "na", "none", "null"].includes(normalized.toLowerCase())) {
            return fallback;
          }
          return normalized;
        }
        arrayValue(value) {
          return Array.isArray(value) ? value.filter(Boolean) : [];
        }
        booleanValue(value, fallback = false) {
          return typeof value === "boolean" ? value : fallback;
        }
        isArgentina(data) {
          return String(data.business.country || "").toLowerCase().includes("argentina");
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
      };
      function buildStructuredDataDocument(document) {
        const metadata = document.metadata || {};
        const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
        if (!canonicalUrl) return null;
        const organization = {
          "@type": "Organization",
          name: document.businessName
        };
        if (metadata.websiteUrl) organization.url = metadata.websiteUrl;
        if (metadata.contactEmail) organization.email = metadata.contactEmail;
        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: `${document.title} - ${document.businessName}`,
              url: canonicalUrl,
              inLanguage: document.language === "es" ? "es" : "en",
              dateModified: document.effectiveDate,
              lastReviewed: document.effectiveDate,
              about: {
                "@type": "Thing",
                name: document.title
              },
              publisher: organization,
              accountablePerson: organization
            },
            organization
          ]
        };
      }
      function serializeJsonLd2(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
      }
      module2.exports = ReturnRefundPolicyGenerator;
    }
  });

  // js/disclaimer-generator.js
  var require_disclaimer_generator = __commonJS({
    "js/disclaimer-generator.js"(exports2, module2) {
      var DisclaimerGenerator = class {
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
            throw new Error(result.errors.join(" | "));
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
          const language = normalized.data.settings.language || "es";
          this.currentLanguage = language;
          const document = {
            businessName: normalized.data.business.name,
            effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            warnings: normalized.warnings,
            language,
            title: language === "es" ? "Descargo de Responsabilidad" : "Disclaimer",
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
                reason: included ? "section generated" : "section omitted"
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
              language: this.stringValue(input.settings?.language, "es")
            }
          };
          const messages = data.settings.language === "es" ? {
            missingBusinessName: "El nombre del negocio es obligatorio.",
            missingWebsite: "La URL del sitio o aplicaci\xF3n es obligatoria.",
            missingCategories: "Conviene seleccionar al menos un tipo de disclaimer.",
            medicalNeedsAdvice: "Si inclu\xEDs informaci\xF3n m\xE9dica o de fitness, conviene aclarar que no reemplaza asesoramiento profesional.",
            linksNeedPolicy: "Si inclu\xEDs disclaimer por enlaces externos, conviene explicar brevemente que no control\xE1s ni garantiz\xE1s sitios de terceros.",
            reviewsNeedMethodology: "Si inclu\xEDs rese\xF1as de productos, conviene explicar c\xF3mo se hacen o si puede haber compensaci\xF3n, afiliaci\xF3n o sesgo comercial."
          } : {
            missingBusinessName: "Business name is required.",
            missingWebsite: "Website or app URL is required.",
            missingCategories: "You should select at least one disclaimer type.",
            medicalNeedsAdvice: "If you include medical or fitness information, you should clarify that it does not replace professional advice.",
            linksNeedPolicy: "If you include an external-links disclaimer, you should briefly explain that you do not control or guarantee third-party sites.",
            reviewsNeedMethodology: "If you include product reviews, you should explain how reviews are made and whether compensation, affiliate links, or commercial bias may exist."
          };
          const errors = [];
          const warnings = [];
          if (!data.business.name) errors.push(messages.missingBusinessName);
          if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
          if (data.disclaimer.categories.length === 0) warnings.push(messages.missingCategories);
          if (data.disclaimer.categories.some((value) => ["medical", "fitness"].includes(value)) && !data.disclaimer.professionalAdviceChannel) warnings.push(messages.medicalNeedsAdvice);
          if (data.disclaimer.categories.includes("external_links") && !data.disclaimer.externalLinksPolicy) warnings.push(messages.linksNeedPolicy);
          if (data.disclaimer.categories.includes("product_reviews") && !data.disclaimer.reviewMethodology && !data.disclaimer.affiliateDisclosure) warnings.push(messages.reviewsNeedMethodology);
          return { data, errors, warnings };
        }
        buildSections(data) {
          const sections = [
            this.section("overview", this.text("Overview", "Resumen"), [
              this.interpolate(this.text(
                "{business_name} publishes this disclaimer for content, tools, and materials made available through {website}.",
                "{business_name} publica este descargo de responsabilidad para los contenidos, herramientas y materiales disponibles a trav\xE9s de {website}."
              ), data)
            ])
          ];
          const categorySections = data.disclaimer.categories.map((category) => this.categorySection(category, data)).filter(Boolean);
          sections.push(...categorySections);
          sections.push(this.section("contact", this.text("Contact Information", "Informaci\xF3n de Contacto"), [
            this.contactText(data)
          ]));
          return sections;
        }
        categorySection(category, data) {
          const map = {
            medical: {
              id: "medical",
              title: this.text("Medical Information Disclaimer", "Disclaimer sobre Informaci\xF3n M\xE9dica"),
              paragraph: this.text(
                "Content provided through the service is for general informational purposes only and does not constitute medical advice, diagnosis, or treatment. Users should consult a qualified medical professional before acting on any health-related information.",
                "El contenido ofrecido a trav\xE9s del servicio tiene fines \xFAnicamente informativos y no constituye consejo m\xE9dico, diagn\xF3stico ni tratamiento. Los usuarios deben consultar a un profesional de la salud calificado antes de actuar sobre informaci\xF3n relacionada con la salud."
              )
            },
            fitness: {
              id: "fitness",
              title: this.text("Fitness Information Disclaimer", "Disclaimer sobre Informaci\xF3n de Fitness"),
              paragraph: this.text(
                "Fitness, exercise, or wellness content is provided for general educational purposes only. Physical activity involves risk, and users should evaluate their own condition and seek professional guidance where appropriate before beginning or changing any routine.",
                "El contenido de fitness, ejercicio o bienestar se ofrece \xFAnicamente con fines educativos generales. La actividad f\xEDsica implica riesgos, y los usuarios deben evaluar su propia condici\xF3n y buscar orientaci\xF3n profesional cuando corresponda antes de iniciar o modificar una rutina."
              )
            },
            errors_omissions: {
              id: "errors",
              title: this.text("Errors and Omissions Disclaimer", "Disclaimer sobre Errores y Omisiones"),
              paragraph: this.text(
                "We aim to keep content accurate and current, but errors, omissions, delays, or outdated information may exist. The business does not guarantee that all information will always be complete, current, or error-free.",
                "Buscamos mantener el contenido preciso y actualizado, pero pueden existir errores, omisiones, demoras o informaci\xF3n desactualizada. El negocio no garantiza que toda la informaci\xF3n sea siempre completa, vigente o libre de errores."
              )
            },
            external_links: {
              id: "links",
              title: this.text("External Links Disclaimer", "Disclaimer sobre Enlaces Externos"),
              paragraph: data.disclaimer.externalLinksPolicy || this.text(
                "The service may contain links to third-party websites, products, or services. We do not control and do not necessarily endorse those external resources, and we are not responsible for their content, practices, availability, or policies.",
                "El servicio puede contener enlaces a sitios web, productos o servicios de terceros. No controlamos ni necesariamente respaldamos esos recursos externos, y no somos responsables por su contenido, pr\xE1cticas, disponibilidad o pol\xEDticas."
              )
            },
            views_expressed: {
              id: "views",
              title: this.text("Views Expressed Disclaimer", "Disclaimer sobre Opiniones Expresadas"),
              paragraph: this.text(
                "Views, opinions, or commentary expressed on the service belong to the relevant author or contributor and do not necessarily reflect official positions of clients, employers, partners, or every participant in the project.",
                "Las opiniones, comentarios o valoraciones expresadas en el servicio pertenecen al autor o colaborador correspondiente y no necesariamente reflejan posiciones oficiales de clientes, empleadores, socios o de todos los participantes del proyecto."
              )
            },
            own_risk: {
              id: "risk",
              title: this.text("Use at Your Own Risk Disclaimer", "Disclaimer de Uso bajo tu Propio Riesgo"),
              paragraph: data.disclaimer.customRiskStatement || this.text(
                "Use of the service, tools, examples, and materials is at the user\u2019s own risk. The business is not responsible for losses, damages, or outcomes arising from reliance on the content except where liability cannot legally be excluded.",
                "El uso del servicio, las herramientas, los ejemplos y los materiales corre por cuenta y riesgo del usuario. El negocio no es responsable por p\xE9rdidas, da\xF1os o resultados derivados de la confianza depositada en el contenido, salvo cuando la responsabilidad no pueda excluirse legalmente."
              )
            },
            product_reviews: {
              id: "reviews",
              title: this.text("Product Reviews Disclaimer", "Disclaimer sobre Rese\xF1as de Productos"),
              paragraph: [
                this.text(
                  "Reviews, ratings, or product commentary reflect our opinion, testing, or editorial judgment at the time of publication and may not reflect every user\u2019s experience.",
                  "Las rese\xF1as, calificaciones o comentarios sobre productos reflejan nuestra opini\xF3n, pruebas o criterio editorial al momento de su publicaci\xF3n y pueden no reflejar la experiencia de todos los usuarios."
                ),
                data.disclaimer.reviewMethodology,
                data.disclaimer.affiliateDisclosure
              ].filter(Boolean).join(" ")
            }
          };
          const section = map[category];
          if (!section) return null;
          const extra = data.disclaimer.categories.some((value) => ["medical", "fitness"].includes(value)) && data.disclaimer.professionalAdviceChannel ? ` ${data.disclaimer.professionalAdviceChannel}` : "";
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
          return this.currentLanguage === "es" ? es : en;
        }
        interpolate(text, data) {
          return String(text || "").replaceAll("{business_name}", data.business.name || "").replaceAll("{website}", data.business.websiteUrl || "");
        }
        contactText(data) {
          const parts = [];
          if (data.contact.email) parts.push(this.text(`Questions may be sent to ${data.contact.email}.`, `Las consultas pueden enviarse a ${data.contact.email}.`));
          if (data.contact.pageUrl) parts.push(this.text(`Additional contact information may be available at ${data.contact.pageUrl}.`, `Puede haber informaci\xF3n adicional de contacto en ${data.contact.pageUrl}.`));
          if (data.contact.phone) parts.push(this.text(`Phone: ${data.contact.phone}.`, `Tel\xE9fono: ${data.contact.phone}.`));
          if (data.business.address) parts.push(this.text(`Postal address: ${data.business.address}.`, `Direcci\xF3n postal: ${data.business.address}.`));
          return parts.join(" ");
        }
        formatAsMarkdown(document) {
          const lines = [
            `# ${document.title} - ${document.businessName}`,
            "",
            `${this.text("Effective date", "Fecha de vigencia")}: ${document.effectiveDate}`,
            ""
          ];
          for (const section of document.sections) {
            lines.push(`## ${section.title}`, "");
            for (const paragraph of section.paragraphs) {
              lines.push(paragraph, "");
            }
          }
          return lines.join("\n").trim();
        }
        formatAsText(document) {
          return this.formatAsMarkdown(document).replace(/^#{1,3}\s+/gm, "");
        }
        formatAsHTML(document) {
          const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          const structuredData = this.buildStructuredData(document);
          const body = document.sections.map((section) => {
            const paragraphs = section.paragraphs.map((paragraph) => `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`).join("\n");
            return `<section>
<h2>${escape(section.title)}</h2>
${paragraphs}
</section>`;
          }).join("\n");
          return [
            "<!doctype html>",
            `<html lang="${document.language}">`,
            "<head>",
            '  <meta charset="utf-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1">',
            `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
            `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd2(structuredData)}<\/script>` : ""}`,
            "  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>",
            "</head>",
            "<body>",
            '  <main id="main-content" aria-labelledby="document-title">',
            "    <header>",
            `      <h1 id="document-title">${escape(document.title)} - ${escape(document.businessName)}</h1>`,
            `      <p><strong>${escape(this.text("Effective date", "Fecha de vigencia"))}:</strong> <time datetime="${escape(document.effectiveDate)}">${escape(document.effectiveDate)}</time></p>`,
            "    </header>",
            body,
            "  </main>",
            "</body>",
            "</html>"
          ].join("\n");
        }
        stringValue(value, fallback = "") {
          if (typeof value !== "string") return fallback;
          const normalized = value.trim();
          if (!normalized || [">", "no hay", "n/a", "na", "none", "null"].includes(normalized.toLowerCase())) {
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
      };
      function buildStructuredDataDocument(document) {
        const metadata = document.metadata || {};
        const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
        if (!canonicalUrl) return null;
        const organization = {
          "@type": "Organization",
          name: document.businessName
        };
        if (metadata.websiteUrl) organization.url = metadata.websiteUrl;
        if (metadata.contactEmail) organization.email = metadata.contactEmail;
        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: `${document.title} - ${document.businessName}`,
              url: canonicalUrl,
              inLanguage: document.language === "es" ? "es" : "en",
              dateModified: document.effectiveDate,
              lastReviewed: document.effectiveDate,
              about: {
                "@type": "Thing",
                name: document.title
              },
              publisher: organization,
              accountablePerson: organization
            },
            organization
          ]
        };
      }
      function serializeJsonLd2(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
      }
      module2.exports = DisclaimerGenerator;
    }
  });

  // js/security-generator.js
  var require_security_generator = __commonJS({
    "js/security-generator.js"(exports2, module2) {
      var SecurityPolicyGenerator = class {
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
            throw new Error(result.errors.join(" | "));
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
          const language = normalized.data.settings.language || "es";
          this.currentLanguage = language;
          const document = {
            businessName: normalized.data.business.name,
            effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            warnings: normalized.warnings,
            language,
            title: language === "es" ? "Pol\xEDtica de Seguridad" : "Security Policy",
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
                reason: included ? "section generated" : "section omitted"
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
              reportChannel: this.stringValue(input.security?.reportChannel, "email"),
              reportEmail: this.stringValue(input.security?.reportEmail || input.contact?.email),
              reportUrl: this.stringValue(input.security?.reportUrl || input.contact?.pageUrl),
              scope: this.arrayValue(input.security?.scope),
              safeHarborOffered: this.booleanValue(input.security?.safeHarborOffered, true),
              automatedTestingAllowed: this.booleanValue(input.security?.automatedTestingAllowed, false),
              denialOfServiceTestingAllowed: this.booleanValue(input.security?.denialOfServiceTestingAllowed, false),
              socialEngineeringAllowed: this.booleanValue(input.security?.socialEngineeringAllowed, false),
              acknowledgementTime: this.stringValue(input.security?.acknowledgementTime),
              statusUpdateTime: this.stringValue(input.security?.statusUpdateTime),
              disclosurePreference: this.stringValue(input.security?.disclosurePreference, "coordinated"),
              bugBountyOffered: this.booleanValue(input.security?.bugBountyOffered, false),
              bugBountyNotes: this.stringValue(input.security?.bugBountyNotes),
              reportRequirements: this.arrayValue(input.security?.reportRequirements),
              remediationGuidance: this.stringValue(input.security?.remediationGuidance),
              securityPracticesSummary: this.stringValue(input.security?.securityPracticesSummary),
              notes: this.arrayValue(input.security?.notes)
            },
            settings: {
              language: this.stringValue(input.settings?.language, "es")
            }
          };
          const messages = data.settings.language === "es" ? {
            missingBusinessName: "El nombre del negocio es obligatorio.",
            missingWebsite: "La URL del sitio o aplicaci\xF3n es obligatoria.",
            missingReportContact: "Debe indicar al menos un canal real para recibir reportes de seguridad.",
            missingScope: "Conviene indicar el alcance de la pol\xEDtica de seguridad o divulgaci\xF3n de vulnerabilidades.",
            missingAcknowledgement: "Conviene indicar en cu\xE1nto tiempo se acusar\xE1 recibo de un reporte v\xE1lido.",
            missingStatusUpdate: "Conviene indicar cada cu\xE1nto se compartir\xE1n actualizaciones sobre el estado del reporte.",
            missingRequirements: "Conviene indicar qu\xE9 informaci\xF3n debe incluir un reporte de seguridad para facilitar el triage.",
            safeHarborWarning: "Conviene incluir una cl\xE1usula de buena fe o safe harbor para reportes responsables.",
            bountyNeedsNotes: "Si ofrec\xE9s bug bounty, conviene aclarar condiciones, elegibilidad o c\xF3mo se comunica."
          } : {
            missingBusinessName: "Business name is required.",
            missingWebsite: "Website or app URL is required.",
            missingReportContact: "You must provide at least one real channel for receiving security reports.",
            missingScope: "You should specify the scope of the security or vulnerability disclosure policy.",
            missingAcknowledgement: "You should state how quickly you acknowledge a valid report.",
            missingStatusUpdate: "You should state how often you share status updates about a report.",
            missingRequirements: "You should explain what information a security report should include to help triage.",
            safeHarborWarning: "You should include a good-faith or safe-harbor clause for responsible reporting.",
            bountyNeedsNotes: "If you offer a bug bounty, you should explain conditions, eligibility, or how that process is communicated."
          };
          const errors = [];
          const warnings = [];
          if (!data.business.name) errors.push(messages.missingBusinessName);
          if (!data.business.websiteUrl) errors.push(messages.missingWebsite);
          const usesEmail = ["email", "both"].includes(data.security.reportChannel);
          const usesUrl = ["form", "both"].includes(data.security.reportChannel);
          if (usesEmail && !data.security.reportEmail || usesUrl && !data.security.reportUrl) {
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
            this.section("overview", this.text("Overview", "Resumen"), [
              this.interpolate(this.text(
                "{business_name} publishes this security policy to explain how security researchers, users, and third parties may responsibly report vulnerabilities affecting {website}.",
                "{business_name} publica esta pol\xEDtica de seguridad para explicar c\xF3mo investigadores, usuarios y terceros pueden reportar vulnerabilidades de forma responsable respecto de {website}."
              ), data)
            ]),
            this.section("reporting", this.text("How to Report a Vulnerability", "C\xF3mo Reportar una Vulnerabilidad"), [
              this.reportingText(data)
            ]),
            this.section("scope", this.text("Scope", "Alcance"), [
              this.scopeText(data)
            ]),
            this.section("testing", this.text("Testing Rules and Expectations", "Reglas y Expectativas de Prueba"), [
              this.testingRulesText(data)
            ]),
            this.section("response", this.text("Acknowledgement and Response Times", "Tiempos de Acuse y Respuesta"), [
              this.responseTimesText(data)
            ]),
            this.section("disclosure", this.text("Disclosure, Remediation, and Recognition", "Divulgaci\xF3n, Remediaci\xF3n y Reconocimiento"), [
              this.disclosureText(data)
            ])
          ];
          if (data.security.securityPracticesSummary) {
            sections.push(this.section("practices", this.text("Security Practices Summary", "Resumen de Pr\xE1cticas de Seguridad"), [
              data.security.securityPracticesSummary
            ]));
          }
          sections.push(this.section("contact", this.text("Contact Information", "Informaci\xF3n de Contacto"), [
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
          return this.currentLanguage === "es" ? es : en;
        }
        interpolate(text, data) {
          return String(text || "").replaceAll("{business_name}", data.business.name || "").replaceAll("{website}", data.business.websiteUrl || "");
        }
        reportingText(data) {
          const parts = [];
          if (data.security.reportEmail) {
            parts.push(this.text(
              `Please report suspected vulnerabilities by email to ${data.security.reportEmail}.`,
              `Por favor report\xE1 vulnerabilidades sospechadas por email a ${data.security.reportEmail}.`
            ));
          }
          if (data.security.reportUrl) {
            parts.push(this.text(
              `Reports may also be submitted through ${data.security.reportUrl}.`,
              `Los reportes tambi\xE9n pueden presentarse a trav\xE9s de ${data.security.reportUrl}.`
            ));
          }
          if (data.security.reportRequirements.length > 0) {
            parts.push(`${this.text("To help us triage quickly, include:", "Para facilitar el triage, inclu\xED:")}
${this.listLines(data.security.reportRequirements)}`);
          }
          return parts.join(" ");
        }
        scopeText(data) {
          if (data.security.scope.length === 0) {
            return this.text(
              "This policy applies to security issues that may affect the public service, supporting infrastructure, and related user-facing components operated by the business.",
              "Esta pol\xEDtica aplica a problemas de seguridad que puedan afectar al servicio p\xFAblico, la infraestructura de soporte y los componentes relacionados operados por el negocio."
            );
          }
          return `${this.text("This policy is intended for the following assets or surfaces:", "Esta pol\xEDtica est\xE1 pensada para los siguientes activos o superficies:")}
${this.listLines(data.security.scope.map((value) => this.scopeLabel(value)))}`;
        }
        testingRulesText(data) {
          const lines = [
            this.text(
              "Please act in good faith, avoid privacy violations, service disruption, data destruction, or any action that could harm users or systems.",
              "Actu\xE1 de buena fe y evit\xE1 violaciones de privacidad, interrupciones del servicio, destrucci\xF3n de datos o cualquier acci\xF3n que pueda da\xF1ar a usuarios o sistemas."
            ),
            data.security.safeHarborOffered ? this.text(
              "When you follow this policy in good faith, we intend to treat your research as authorized and will not pursue action solely for testing conducted within this policy\u2019s scope.",
              "Cuando sigas esta pol\xEDtica de buena fe, nuestra intenci\xF3n es tratar tu investigaci\xF3n como autorizada y no impulsar acciones \xFAnicamente por pruebas realizadas dentro del alcance de esta pol\xEDtica."
            ) : "",
            this.text(
              `Automated testing is ${data.security.automatedTestingAllowed ? "allowed when it remains low-volume and does not degrade service" : "not allowed unless we give prior written permission"}.`,
              `Las pruebas automatizadas ${data.security.automatedTestingAllowed ? "est\xE1n permitidas siempre que sean de bajo volumen y no degraden el servicio" : "no est\xE1n permitidas salvo autorizaci\xF3n previa y por escrito"}.`
            ),
            this.text(
              `Denial-of-service or load testing is ${data.security.denialOfServiceTestingAllowed ? "allowed only in a coordinated manner and with prior approval" : "not allowed under this policy"}.`,
              `Las pruebas de denegaci\xF3n de servicio o carga ${data.security.denialOfServiceTestingAllowed ? "s\xF3lo est\xE1n permitidas de forma coordinada y con aprobaci\xF3n previa" : "no est\xE1n permitidas bajo esta pol\xEDtica"}.`
            ),
            this.text(
              `Social engineering, phishing, or physical attacks are ${data.security.socialEngineeringAllowed ? "only allowed if explicitly coordinated and approved in advance" : "not allowed under this policy"}.`,
              `La ingenier\xEDa social, el phishing o los ataques f\xEDsicos ${data.security.socialEngineeringAllowed ? "s\xF3lo est\xE1n permitidos si fueron coordinados y aprobados expl\xEDcitamente de antemano" : "no est\xE1n permitidos bajo esta pol\xEDtica"}.`
            )
          ].filter(Boolean);
          return lines.join(" ");
        }
        responseTimesText(data) {
          const parts = [];
          if (data.security.acknowledgementTime) {
            parts.push(this.text(
              `We aim to acknowledge valid reports within ${data.security.acknowledgementTime}.`,
              `Buscamos acusar recibo de reportes v\xE1lidos dentro de ${data.security.acknowledgementTime}.`
            ));
          }
          if (data.security.statusUpdateTime) {
            parts.push(this.text(
              `We aim to provide meaningful status updates within ${data.security.statusUpdateTime}, depending on severity and complexity.`,
              `Buscamos compartir actualizaciones relevantes dentro de ${data.security.statusUpdateTime}, seg\xFAn gravedad y complejidad.`
            ));
          }
          if (data.security.remediationGuidance) {
            parts.push(data.security.remediationGuidance);
          }
          return parts.join(" ");
        }
        disclosureText(data) {
          const preference = data.security.disclosurePreference === "silent_fix" ? this.text(
            "We prefer to remediate issues before any public disclosure and may choose not to publish individual advisories for every issue.",
            "Preferimos remediar los problemas antes de cualquier divulgaci\xF3n p\xFAblica y podemos optar por no publicar avisos individuales para cada caso."
          ) : data.security.disclosurePreference === "researcher_choice" ? this.text(
            "We expect coordinated communication, but final public disclosure timing may be discussed case by case with the reporting party.",
            "Esperamos una comunicaci\xF3n coordinada, pero el momento de la divulgaci\xF3n p\xFAblica puede acordarse caso por caso con la persona reportante."
          ) : this.text(
            "We prefer coordinated disclosure and ask reporters to avoid public disclosure until we have had a reasonable opportunity to investigate and mitigate the issue.",
            "Preferimos la divulgaci\xF3n coordinada y pedimos que se evite la divulgaci\xF3n p\xFAblica hasta que tengamos una oportunidad razonable de investigar y mitigar el problema."
          );
          const bounty = data.security.bugBountyOffered ? ` ${data.security.bugBountyNotes || this.text("A bug bounty or reward process may exist, but eligibility, amount, and payment terms are determined case by case.", "Puede existir un proceso de bug bounty o recompensas, pero la elegibilidad, el monto y las condiciones de pago se determinan caso por caso.")}` : ` ${this.text("This policy does not by itself guarantee payment, compensation, or public recognition for every report.", "Esta pol\xEDtica no garantiza por s\xED sola pago, compensaci\xF3n ni reconocimiento p\xFAblico para cada reporte.")}`;
          return `${preference}${bounty}`;
        }
        contactText(data) {
          const parts = [];
          if (data.security.reportEmail) parts.push(this.text(`Primary security email: ${data.security.reportEmail}.`, `Email principal de seguridad: ${data.security.reportEmail}.`));
          if (data.security.reportUrl) parts.push(this.text(`Security reporting page: ${data.security.reportUrl}.`, `P\xE1gina para reportes de seguridad: ${data.security.reportUrl}.`));
          if (data.contact.phone) parts.push(this.text(`Phone: ${data.contact.phone}.`, `Tel\xE9fono: ${data.contact.phone}.`));
          if (data.business.address) parts.push(this.text(`Postal address: ${data.business.address}.`, `Direcci\xF3n postal: ${data.business.address}.`));
          return parts.join(" ");
        }
        listLines(items) {
          return items.map((item) => `- ${item}`).join("\n");
        }
        scopeLabel(value) {
          const labels = {
            web_application: this.text("web application", "aplicaci\xF3n web"),
            api: this.text("API or developer endpoints", "API o endpoints para desarrolladores"),
            mobile_app: this.text("mobile app", "aplicaci\xF3n m\xF3vil"),
            infrastructure: this.text("infrastructure or hosting components", "infraestructura o componentes de hosting"),
            integrations: this.text("third-party integrations and connected services", "integraciones con terceros y servicios conectados"),
            content: this.text("security-sensitive content, docs, or static assets", "contenido sensible para seguridad, documentaci\xF3n o assets est\xE1ticos")
          };
          return labels[value] || value;
        }
        formatAsMarkdown(document) {
          const lines = [
            `# ${document.title} - ${document.businessName}`,
            "",
            `${this.text("Effective date", "Fecha de vigencia")}: ${document.effectiveDate}`,
            ""
          ];
          for (const section of document.sections) {
            lines.push(`## ${section.title}`, "");
            for (const paragraph of section.paragraphs) {
              lines.push(paragraph, "");
            }
          }
          return lines.join("\n").trim();
        }
        formatAsText(document) {
          return this.formatAsMarkdown(document).replace(/^#{1,3}\s+/gm, "");
        }
        formatAsHTML(document) {
          const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          const structuredData = this.buildStructuredData(document);
          const body = document.sections.map((section) => {
            const paragraphs = section.paragraphs.map((paragraph) => `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`).join("\n");
            return `<section>
<h2>${escape(section.title)}</h2>
${paragraphs}
</section>`;
          }).join("\n");
          return [
            "<!doctype html>",
            `<html lang="${document.language}">`,
            "<head>",
            '  <meta charset="utf-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1">',
            `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
            `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd2(structuredData)}<\/script>` : ""}`,
            '  <meta name="legal-document-type" content="security">',
            "  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}ul{padding-left:24px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>",
            "</head>",
            "<body>",
            '  <main id="main-content" aria-labelledby="document-title">',
            "    <header>",
            `      <h1 id="document-title">${escape(document.title)} - ${escape(document.businessName)}</h1>`,
            `      <p><strong>${escape(this.text("Effective date", "Fecha de vigencia"))}:</strong> <time datetime="${escape(document.effectiveDate)}">${escape(document.effectiveDate)}</time></p>`,
            "    </header>",
            body,
            "  </main>",
            "</body>",
            "</html>"
          ].join("\n");
        }
        stringValue(value, fallback = "") {
          if (typeof value !== "string") return fallback;
          const normalized = value.trim();
          if (!normalized || [">", "no hay", "n/a", "na", "none", "null"].includes(normalized.toLowerCase())) {
            return fallback;
          }
          return normalized;
        }
        arrayValue(value) {
          return Array.isArray(value) ? value.filter(Boolean) : [];
        }
        booleanValue(value, fallback = false) {
          if (typeof value === "boolean") return value;
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
      };
      function buildStructuredDataDocument(document) {
        const metadata = document.metadata || {};
        const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
        if (!canonicalUrl) return null;
        const organization = {
          "@type": "Organization",
          name: document.businessName
        };
        if (metadata.websiteUrl) organization.url = metadata.websiteUrl;
        if (metadata.contactEmail) organization.email = metadata.contactEmail;
        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: `${document.title} - ${document.businessName}`,
              url: canonicalUrl,
              inLanguage: document.language === "es" ? "es" : "en",
              dateModified: document.effectiveDate,
              lastReviewed: document.effectiveDate,
              about: {
                "@type": "Thing",
                name: document.title
              },
              publisher: organization,
              accountablePerson: organization
            },
            organization
          ]
        };
      }
      function serializeJsonLd2(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
      }
      module2.exports = SecurityPolicyGenerator;
    }
  });

  // js/dpa-generator.js
  var require_dpa_generator = __commonJS({
    "js/dpa-generator.js"(exports2, module2) {
      var DataProcessingAgreementGenerator = class {
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
            throw new Error(result.errors.join(" | "));
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
          const language = normalized.data.settings.language || "es";
          this.currentLanguage = language;
          const document = {
            businessName: normalized.data.business.name,
            effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            warnings: normalized.warnings,
            language,
            title: language === "es" ? "Acuerdo de Tratamiento de Datos (DPA)" : "Data Processing Agreement (DPA)",
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
                reason: included ? "section generated" : "section omitted"
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
              counterpartyRole: this.stringValue(input.dpa?.counterpartyRole, "controller"),
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
              subprocessorMethodology: this.stringValue(input.dpa?.subprocessorMethodology),
              internationalTransfers: this.booleanValue(input.dpa?.internationalTransfers, false),
              transferMechanism: this.stringValue(input.dpa?.transferMechanism),
              breachNotificationTime: this.stringValue(input.dpa?.breachNotificationTime),
              assistanceCommitments: this.stringValue(input.dpa?.assistanceCommitments),
              deletionReturnPeriod: this.stringValue(input.dpa?.deletionReturnPeriod),
              auditRights: this.stringValue(input.dpa?.auditRights),
              governingLaw: this.stringValue(input.dpa?.governingLaw),
              euSccRequired: this.booleanValue(input.dpa?.euSccRequired, false),
              notes: this.arrayValue(input.dpa?.notes)
            },
            settings: {
              language: this.stringValue(input.settings?.language, "es")
            }
          };
          const messages = data.settings.language === "es" ? {
            missingBusinessName: "El nombre del negocio o proveedor es obligatorio.",
            missingWebsite: "La URL principal del servicio es obligatoria.",
            missingCounterparty: "Deb\xE9s identificar a la contraparte del DPA (por ejemplo, el cliente o controller).",
            missingRegulatoryScope: "Conviene indicar el alcance regulatorio o las regiones relevantes del cliente para no subestimar obligaciones tipo GDPR, UK GDPR u otras. Esto importa especialmente si vend\xE9s a clientes UE/UK aunque tu empresa est\xE9 fuera de esa regi\xF3n.",
            missingServices: "Deb\xE9s describir el servicio SaaS o el alcance principal del procesamiento. Sin eso, el DPA queda demasiado abstracto para saber qu\xE9 operaciones cubre realmente.",
            missingPurpose: "Conviene describir la naturaleza y la finalidad del tratamiento. Esto ayuda a que el DPA no quede gen\xE9rico y suele ser importante cuando el cliente necesita mapear instrucciones, soporte, hosting o analytics.",
            missingPersonalDataCategories: "Conviene indicar qu\xE9 categor\xEDas de datos personales se procesan. Esto es especialmente \xFAtil para clientes enterprise, evaluaciones de vendor risk o anexos estilo GDPR Art. 28.",
            missingDataSubjects: "Conviene indicar qu\xE9 categor\xEDas de titulares o usuarios est\xE1n involucradas. Esto importa especialmente si trat\xE1s empleados del cliente, usuarios finales, prospects o datos mixtos.",
            missingSecurityMeasures: "Conviene resumir medidas t\xE9cnicas y organizativas de seguridad. Sin eso, el DPA queda flojo para procurement, vendor review o contratos enterprise.",
            missingDeletionPeriod: "Conviene indicar qu\xE9 pasa con los datos al finalizar el servicio. Esto importa especialmente si el cliente espera devoluci\xF3n, borrado, backups controlados o retenciones legales limitadas.",
            subprocessorsNeedMethodology: "Si us\xE1s subencargados o subprocessors, conviene explicar c\xF3mo se autorizan y controlan. Esto suele ser importante para clientes B2B que revisan hosting, soporte, cloud o proveedores operativos.",
            transfersNeedMechanism: "Si hay transferencias internacionales, conviene aclarar el mecanismo contractual o legal utilizado. Esto importa especialmente para clientes UE/UK o para soporte, hosting y accesos cross-border.",
            sccNeedsTransferMechanism: "Si marc\xE1s que puede requerirse SCC, conviene indicar el mecanismo de transferencias o el proceso contractual asociado. Si no, el cliente ve la menci\xF3n pero no entiende c\xF3mo se implementa.",
            missingIncidentTiming: "Conviene indicar en cu\xE1nto tiempo se notifican incidentes o brechas relevantes. Esto importa especialmente en contratos enterprise, seguridad SaaS y obligaciones de respuesta r\xE1pida.",
            missingAuditRights: "Conviene aclarar c\xF3mo se ejercen derechos de auditor\xEDa o acceso a informaci\xF3n sobre el tratamiento. Esto es especialmente \xFAtil si ofrec\xE9s certificaciones, cuestionarios o evidencia documental en vez de auditor\xEDa onsite.",
            contradictionSubprocessorMethodWithoutSubprocessors: "Completaste una metodolog\xEDa de subprocessors, pero tambi\xE9n marcaste que no us\xE1s subencargados. Revis\xE1 cu\xE1l de las dos cosas refleja tu operaci\xF3n real para no describir una cadena de proveedores inexistente.",
            contradictionTransferMechanismWithoutTransfers: "Indic\xE1s un mecanismo de transferencias, pero tambi\xE9n marcaste que no hay transferencias internacionales. Revis\xE1 si realmente existe acceso, hosting o soporte transfronterizo, o si esa cl\xE1usula qued\xF3 de m\xE1s.",
            contradictionSccWithoutTransfers: "Marcaste que podr\xEDan requerirse SCC o cl\xE1usulas equivalentes, pero tambi\xE9n marcaste que no hay transferencias internacionales. Conviene revisar si el flujo realmente involucra transferencias o si esa cl\xE1usula sobra en este contrato.",
            contradictionSccWithoutEuUkScope: "Marcaste SCC o cl\xE1usulas equivalentes, pero no se\xF1alaste alcance regulatorio UE/UK. Conviene confirmar si el cliente, los datos o el marco contractual igualmente exigen esas salvaguardas, o si bastar\xEDa otra l\xF3gica contractual.",
            contradictionJointControllerTemplate: "Marcaste que la contraparte act\xFAa como joint controller, pero esta plantilla est\xE1 orientada principalmente a relaciones controller-processor. Conviene revisi\xF3n legal espec\xEDfica si realmente hay corresponsabilidad, porque podr\xEDan faltar cl\xE1usulas propias de un acuerdo de joint controllership."
          } : {
            missingBusinessName: "Business or provider name is required.",
            missingWebsite: "Primary service URL is required.",
            missingCounterparty: "You must identify the DPA counterparty (for example, the customer or controller).",
            missingRegulatoryScope: "You should indicate the customer regulatory scope or relevant regions so GDPR, UK GDPR, or similar expectations are not understated. This matters especially if you sell to EU/UK customers even when your company is based elsewhere.",
            missingServices: "You must describe the SaaS service or main processing scope. Without that, the DPA stays too abstract to show what operations are actually covered.",
            missingPurpose: "You should describe the nature and purpose of the processing. This helps keep the DPA from sounding generic and matters when the customer is mapping hosting, support, instructions, or analytics flows.",
            missingPersonalDataCategories: "You should identify the categories of personal data processed. This is especially useful for enterprise customers, vendor-risk reviews, or GDPR-style Annex mapping.",
            missingDataSubjects: "You should identify the categories of data subjects involved. This matters especially if you process customer employees, end users, prospects, or mixed populations.",
            missingSecurityMeasures: "You should summarize the technical and organizational security measures. Without that, the DPA is weak for procurement, vendor review, or enterprise contracting.",
            missingDeletionPeriod: "You should explain what happens to data when the service ends. This matters especially when customers expect return, deletion, controlled backups, or limited legal retention.",
            subprocessorsNeedMethodology: "If subprocessors are used, you should explain how they are authorized and controlled. This is commonly important for B2B customers reviewing hosting, support, cloud, or operational vendors.",
            transfersNeedMechanism: "If international transfers occur, you should explain the contractual or legal transfer mechanism used. This matters especially for EU/UK customers or cross-border hosting, support, and access.",
            sccNeedsTransferMechanism: "If you flag SCC as potentially required, you should describe the transfer mechanism or related contractual process. Otherwise the customer sees the clause but not how it is actually implemented.",
            missingIncidentTiming: "You should state how quickly relevant incidents or breaches will be notified. This matters especially in enterprise contracts, SaaS security reviews, and rapid-response commitments.",
            missingAuditRights: "You should explain how audit or information rights are exercised under the agreement. This is especially useful if you provide certifications, questionnaires, or documentary evidence instead of onsite audits.",
            contradictionSubprocessorMethodWithoutSubprocessors: "You filled in a subprocessor methodology, but also marked that no subprocessors are used. Review which statement reflects the real operating model so the DPA does not describe a vendor chain that does not exist.",
            contradictionTransferMechanismWithoutTransfers: "You provided a transfer mechanism, but also marked that no international transfers occur. Review whether cross-border hosting, access, or support actually exists, or whether that clause is leftover boilerplate.",
            contradictionSccWithoutTransfers: "You flagged SCC or equivalent clauses, but also marked that no international transfers occur. Review whether the flow really involves transfers or whether that clause is unnecessary in this contract.",
            contradictionSccWithoutEuUkScope: "You flagged SCC or equivalent clauses, but did not mark EU/UK regulatory scope. Confirm whether the customer, data, or contract still requires those safeguards, or whether a different contractual approach would be more accurate.",
            contradictionJointControllerTemplate: "You marked the counterparty as a joint controller, but this template is mainly oriented to controller-processor relationships. Legal review is recommended if joint controllership is real, because a dedicated joint-controller arrangement may need additional clauses."
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
          if (data.dpa.internationalTransfers && !data.dpa.transferMechanism) warnings.push(messages.transfersNeedMechanism);
          if (data.dpa.euSccRequired && !data.dpa.transferMechanism) warnings.push(messages.sccNeedsTransferMechanism);
          if (!data.dpa.breachNotificationTime) warnings.push(messages.missingIncidentTiming);
          if (!data.dpa.auditRights) warnings.push(messages.missingAuditRights);
          if (!data.dpa.subprocessorsUsed && data.dpa.subprocessorMethodology) warnings.push(messages.contradictionSubprocessorMethodWithoutSubprocessors);
          if (!data.dpa.internationalTransfers && data.dpa.transferMechanism) warnings.push(messages.contradictionTransferMechanismWithoutTransfers);
          if (!data.dpa.internationalTransfers && data.dpa.euSccRequired) warnings.push(messages.contradictionSccWithoutTransfers);
          if (data.dpa.euSccRequired && !data.dpa.regulatoryScope.some((value) => ["eu", "uk"].includes(value))) warnings.push(messages.contradictionSccWithoutEuUkScope);
          if (data.dpa.counterpartyRole === "joint_controller") warnings.push(messages.contradictionJointControllerTemplate);
          return { data, errors, warnings };
        }
        buildSections(data) {
          const sections = [
            this.section("overview", this.text("Overview", "Resumen"), [
              this.interpolate(this.text(
                "This Data Processing Agreement governs how {business_name} processes personal data on behalf of {counterparty_name} in connection with the services described for {website}.",
                "Este Acuerdo de Tratamiento de Datos regula c\xF3mo {business_name} trata datos personales por cuenta de {counterparty_name} en relaci\xF3n con los servicios descriptos para {website}."
              ), data),
              this.dpaLegalContext(data)
            ]),
            this.section("roles", this.text("Roles, Scope, and Subject Matter", "Roles, alcance y objeto"), [
              this.rolesText(data)
            ]),
            this.section("instructions", this.text("Documented Instructions and Processing Purpose", "Instrucciones documentadas y finalidad del tratamiento"), [
              this.instructionsText(data)
            ]),
            this.section("confidentiality-security", this.text("Confidentiality and Security Measures", "Confidencialidad y medidas de seguridad"), [
              this.securityText(data)
            ]),
            this.section("subprocessors", this.text("Subprocessors", "Subencargados / subprocessors"), [
              this.subprocessorsText(data)
            ]),
            this.section("transfers", this.text("International Transfers", "Transferencias internacionales"), [
              this.transfersText(data)
            ]),
            this.section("assistance-incidents", this.text("Assistance, Requests, and Incidents", "Asistencia, solicitudes e incidentes"), [
              this.assistanceText(data)
            ]),
            this.section("deletion", this.text("Return or Deletion of Data", "Devoluci\xF3n o eliminaci\xF3n de datos"), [
              this.deletionText(data)
            ]),
            this.section("audit", this.text("Audit and Information Rights", "Derechos de auditor\xEDa e informaci\xF3n"), [
              this.auditText(data)
            ]),
            this.section("contact", this.text("Contact Information", "Informaci\xF3n de contacto"), [
              this.contactText(data)
            ])
          ];
          if (data.dpa.notes.length > 0) {
            sections.splice(sections.length - 1, 0, this.section("additional-notes", this.text("Additional Notes", "Notas adicionales"), data.dpa.notes));
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
          return this.currentLanguage === "es" ? es : en;
        }
        interpolate(text, data) {
          return String(text || "").replaceAll("{business_name}", data.business.name || "").replaceAll("{website}", data.business.websiteUrl || "").replaceAll("{counterparty_name}", data.dpa.counterpartyName || this.text("the customer", "la contraparte"));
        }
        dpaLegalContext(data) {
          const mentionsEuStyle = data.dpa.euSccRequired || data.dpa.regulatoryScope.some((value) => ["eu", "uk"].includes(value)) || ["eu", "uk"].includes(this.inferJurisdiction(data.business.country));
          return mentionsEuStyle ? this.text(
            "Where applicable, this agreement is intended to support controller-processor obligations and contractual requirements commonly associated with Article 28 GDPR and similar data processing frameworks.",
            "Cuando corresponda, este acuerdo busca respaldar obligaciones controller-processor y exigencias contractuales com\xFAnmente asociadas al Art\xEDculo 28 del GDPR y marcos similares de tratamiento de datos."
          ) : this.text(
            "This agreement is intended to define baseline contractual obligations for processor-style handling of personal data in a SaaS or B2B service context.",
            "Este acuerdo busca definir obligaciones contractuales m\xEDnimas para un tratamiento estilo processor en un contexto SaaS o B2B."
          );
        }
        rolesText(data) {
          const counterpartyRole = data.dpa.counterpartyRole === "processor" ? this.text("processor", "processor") : data.dpa.counterpartyRole === "joint_controller" ? this.text("joint controller", "joint controller") : this.text("controller", "controller");
          const fragments = [
            this.interpolate(this.text(
              "{business_name} acts as a processor or service provider for the personal data described in this agreement, while {counterparty_name} acts as the {counterparty_role} unless the parties document another allocation of roles.",
              "{business_name} act\xFAa como processor o prestador de servicios respecto de los datos personales descriptos en este acuerdo, mientras que {counterparty_name} act\xFAa como {counterparty_role}, salvo que las partes documenten otra asignaci\xF3n de roles."
            ).replaceAll("{counterparty_role}", counterpartyRole), data),
            data.dpa.servicesDescription ? `${this.text("Service scope", "Alcance del servicio")}: ${this.sentence(data.dpa.servicesDescription)}` : "",
            data.dpa.duration ? `${this.text("Processing duration", "Duraci\xF3n del tratamiento")}: ${this.sentence(data.dpa.duration)}` : "",
            data.dpa.regulatoryScope.length > 0 ? `${this.text("Relevant regulatory scope", "Alcance regulatorio relevante")}: ${data.dpa.regulatoryScope.map((value) => this.regulatoryScopeLabel(value)).join(", ")}.` : "",
            data.dpa.personalDataCategories.length > 0 ? `${this.text("Categories of personal data", "Categor\xEDas de datos personales")}: ${data.dpa.personalDataCategories.join(", ")}.` : "",
            data.dpa.dataSubjectCategories.length > 0 ? `${this.text("Categories of data subjects", "Categor\xEDas de titulares")}: ${data.dpa.dataSubjectCategories.join(", ")}.` : ""
          ];
          return fragments.filter(Boolean).join(" ");
        }
        instructionsText(data) {
          const parts = [];
          if (data.dpa.processingPurpose) {
            parts.push(`${this.text("Nature and purpose of processing", "Naturaleza y finalidad del tratamiento")}: ${this.sentence(data.dpa.processingPurpose)}`);
          }
          parts.push(this.text(
            "The processor will handle personal data only on documented instructions from the controller or customer, unless a binding legal obligation requires another action.",
            "El processor tratar\xE1 datos personales \xFAnicamente sobre la base de instrucciones documentadas del controller o cliente, salvo que una obligaci\xF3n legal vinculante exija otra actuaci\xF3n."
          ));
          if (data.dpa.instructionsChannel) {
            parts.push(`${this.text("Instruction channel", "Canal para instrucciones")}: ${this.sentence(data.dpa.instructionsChannel)}`);
          }
          return parts.join(" ");
        }
        securityText(data) {
          const parts = [
            this.text(
              "Personnel authorized to process personal data must be subject to confidentiality duties and access restrictions appropriate to the service.",
              "El personal autorizado para tratar datos personales debe estar sujeto a deberes de confidencialidad y restricciones de acceso apropiadas para el servicio."
            )
          ];
          if (data.dpa.confidentialityMeasures) {
            parts.push(`${this.text("Confidentiality controls", "Controles de confidencialidad")}: ${this.sentence(data.dpa.confidentialityMeasures)}`);
          }
          if (data.dpa.securityMeasures) {
            parts.push(`${this.text("Technical and organizational measures", "Medidas t\xE9cnicas y organizativas")}: ${this.sentence(data.dpa.securityMeasures)}`);
          }
          return parts.join(" ");
        }
        subprocessorsText(data) {
          if (!data.dpa.subprocessorsUsed) {
            return this.text(
              "The processor does not expect to engage subprocessors for the covered processing unless the agreement is updated or the customer is otherwise informed.",
              "El processor no prev\xE9 contratar subprocessors para el tratamiento cubierto, salvo actualizaci\xF3n del acuerdo o informaci\xF3n previa a la contraparte."
            );
          }
          return [
            this.text(
              "The processor may engage subprocessors to support infrastructure, hosting, support, communications, analytics, or related service operations, provided that appropriate contractual obligations are imposed on those subprocessors.",
              "El processor puede contratar subprocessors para infraestructura, hosting, soporte, comunicaciones, anal\xEDtica u operaciones relacionadas con el servicio, siempre que se les impongan obligaciones contractuales apropiadas."
            ),
            data.dpa.subprocessorMethodology ? `${this.text("Subprocessor approach", "Criterio sobre subprocessors")}: ${this.sentence(data.dpa.subprocessorMethodology)}` : ""
          ].filter(Boolean).join(" ");
        }
        transfersText(data) {
          if (!data.dpa.internationalTransfers && !data.dpa.transferMechanism && !data.dpa.euSccRequired) {
            return this.text(
              "Where personal data remains in the same jurisdiction or adequate regions, the parties should still review whether any onward transfer safeguards are required in practice.",
              "Cuando los datos personales permanezcan en la misma jurisdicci\xF3n o en regiones adecuadas, las partes igualmente deber\xEDan revisar si en la pr\xE1ctica se requieren salvaguardas para transferencias ulteriores."
            );
          }
          const parts = [
            this.text(
              "Where processing involves cross-border access, hosting, support, or onward transfers, the parties should rely on a lawful transfer mechanism appropriate to the jurisdictions involved.",
              "Cuando el tratamiento implique acceso transfronterizo, hosting, soporte o transferencias ulteriores, las partes deber\xEDan apoyarse en un mecanismo de transferencia l\xEDcito y adecuado para las jurisdicciones involucradas."
            )
          ];
          if (data.dpa.transferMechanism) {
            parts.push(`${this.text("Transfer mechanism", "Mecanismo de transferencia")}: ${this.sentence(data.dpa.transferMechanism)}`);
          }
          if (data.dpa.euSccRequired) {
            parts.push(this.text(
              "If required by the parties\u2019 transfer analysis, the parties should consider executing the applicable Standard Contractual Clauses or equivalent safeguards.",
              "Si lo requiere el an\xE1lisis de transferencias de las partes, deber\xEDan considerarse las Cl\xE1usulas Contractuales Tipo aplicables u otras salvaguardas equivalentes."
            ));
          }
          return parts.join(" ");
        }
        assistanceText(data) {
          const parts = [
            this.text(
              "The processor should provide reasonable assistance, taking into account the nature of the processing and information available to the processor, to help the controller respond to data subject requests and compliance obligations.",
              "El processor deber\xEDa brindar asistencia razonable, teniendo en cuenta la naturaleza del tratamiento y la informaci\xF3n disponible, para ayudar al controller a responder solicitudes de titulares y obligaciones de cumplimiento."
            )
          ];
          if (data.dpa.assistanceCommitments) {
            parts.push(`${this.text("Assistance commitments", "Compromisos de asistencia")}: ${this.sentence(data.dpa.assistanceCommitments)}`);
          }
          if (data.dpa.breachNotificationTime) {
            parts.push(`${this.text("Incident or breach notice timing", "Plazo para avisar incidentes o brechas")}: ${this.sentence(data.dpa.breachNotificationTime)}`);
          }
          return parts.join(" ");
        }
        deletionText(data) {
          const parts = [
            this.text(
              "At the end of the services, the processor should return or delete personal data and existing copies, unless retention is required by applicable law or documented backup/security retention processes.",
              "Al finalizar los servicios, el processor deber\xEDa devolver o eliminar los datos personales y sus copias existentes, salvo que la conservaci\xF3n sea exigida por ley aplicable o por procesos documentados de backup/seguridad."
            )
          ];
          if (data.dpa.deletionReturnPeriod) {
            parts.push(`${this.text("Deletion or return timing", "Plazo de devoluci\xF3n o eliminaci\xF3n")}: ${this.sentence(data.dpa.deletionReturnPeriod)}`);
          }
          return parts.join(" ");
        }
        auditText(data) {
          const parts = [
            this.text(
              "The processor should make available information reasonably necessary to demonstrate compliance with the processing obligations described in this agreement.",
              "El processor deber\xEDa poner a disposici\xF3n informaci\xF3n razonablemente necesaria para demostrar cumplimiento de las obligaciones de tratamiento descriptas en este acuerdo."
            )
          ];
          if (data.dpa.auditRights) {
            parts.push(`${this.text("Audit approach", "Enfoque de auditor\xEDa")}: ${this.sentence(data.dpa.auditRights)}`);
          }
          if (data.dpa.governingLaw) {
            parts.push(`${this.text("Governing law or contractual reference", "Ley aplicable o referencia contractual")}: ${this.sentence(data.dpa.governingLaw)}`);
          }
          return parts.join(" ");
        }
        contactText(data) {
          const parts = [];
          if (data.contact.email) parts.push(this.text(`Primary contact email: ${data.contact.email}.`, `Email principal de contacto: ${data.contact.email}.`));
          if (data.contact.pageUrl) parts.push(this.text(`Reference page or contact URL: ${data.contact.pageUrl}.`, `P\xE1gina o URL de referencia: ${data.contact.pageUrl}.`));
          if (data.contact.phone) parts.push(this.text(`Phone: ${data.contact.phone}.`, `Tel\xE9fono: ${data.contact.phone}.`));
          if (data.business.address) parts.push(this.text(`Postal address: ${data.business.address}.`, `Direcci\xF3n postal: ${data.business.address}.`));
          return parts.join(" ");
        }
        inferJurisdiction(country) {
          const normalized = String(country || "").trim().toLowerCase();
          if (["united kingdom", "uk", "reino unido", "england", "scotland", "wales"].includes(normalized)) return "uk";
          if (["germany", "france", "spain", "italy", "netherlands", "european union", "eu", "uni\xF3n europea"].includes(normalized)) return "eu";
          return "global";
        }
        regulatoryScopeLabel(value) {
          const labels = {
            eu: this.text("EU / GDPR", "UE / GDPR"),
            uk: this.text("UK / UK GDPR", "UK / UK GDPR"),
            us: this.text("United States", "Estados Unidos"),
            ar: this.text("Argentina", "Argentina"),
            global: this.text("global or custom", "global o custom")
          };
          return labels[value] || value;
        }
        sentence(value) {
          const normalized = this.stringValue(value);
          if (!normalized) return "";
          return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
        }
        formatAsMarkdown(document) {
          const lines = [
            `# ${document.title} - ${document.businessName}`,
            "",
            `${this.text("Effective date", "Fecha de vigencia")}: ${document.effectiveDate}`,
            ""
          ];
          for (const section of document.sections) {
            lines.push(`## ${section.title}`, "");
            for (const paragraph of section.paragraphs) {
              lines.push(paragraph, "");
            }
          }
          return lines.join("\n").trim();
        }
        formatAsText(document) {
          return this.formatAsMarkdown(document).replace(/^#{1,3}\s+/gm, "");
        }
        formatAsHTML(document) {
          const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          const structuredData = this.buildStructuredData(document);
          const body = document.sections.map((section) => {
            const sectionId = `section-${section.id}`;
            const paragraphs = section.paragraphs.map((paragraph) => `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`).join("\n");
            return `<section aria-labelledby="${sectionId}">
<h2 id="${sectionId}">${escape(section.title)}</h2>
${paragraphs}
</section>`;
          }).join("\n");
          return [
            "<!doctype html>",
            `<html lang="${document.language}">`,
            "<head>",
            '  <meta charset="utf-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1">',
            `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
            `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd2(structuredData)}<\/script>` : ""}`,
            '  <meta name="legal-document-type" content="dpa">',
            "  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}ul{padding-left:24px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>",
            "</head>",
            "<body>",
            '  <main id="main-content" aria-labelledby="document-title">',
            "    <header>",
            `      <h1 id="document-title">${escape(document.title)} - ${escape(document.businessName)}</h1>`,
            `      <p><strong>${escape(this.text("Effective date", "Fecha de vigencia"))}:</strong> <time datetime="${escape(document.effectiveDate)}">${escape(document.effectiveDate)}</time></p>`,
            "    </header>",
            body,
            "  </main>",
            "</body>",
            "</html>"
          ].join("\n");
        }
        stringValue(value, fallback = "") {
          if (typeof value !== "string") return fallback;
          const normalized = value.trim();
          if (!normalized || [">", "no hay", "n/a", "na", "none", "null"].includes(normalized.toLowerCase())) {
            return fallback;
          }
          return normalized;
        }
        arrayValue(value) {
          return Array.isArray(value) ? value.filter(Boolean) : [];
        }
        booleanValue(value, fallback = false) {
          if (typeof value === "boolean") return value;
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
      };
      function buildStructuredDataDocument(document) {
        const metadata = document.metadata || {};
        const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
        if (!canonicalUrl) return null;
        const organization = {
          "@type": "Organization",
          name: document.businessName
        };
        if (metadata.websiteUrl) organization.url = metadata.websiteUrl;
        if (metadata.contactEmail) organization.email = metadata.contactEmail;
        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: `${document.title} - ${document.businessName}`,
              url: canonicalUrl,
              inLanguage: document.language === "es" ? "es" : "en",
              dateModified: document.effectiveDate,
              lastReviewed: document.effectiveDate,
              about: {
                "@type": "Thing",
                name: document.title
              },
              publisher: organization,
              accountablePerson: organization
            },
            organization
          ]
        };
      }
      function serializeJsonLd2(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
      }
      module2.exports = DataProcessingAgreementGenerator;
    }
  });

  // js/ai-policy-generator.js
  var require_ai_policy_generator = __commonJS({
    "js/ai-policy-generator.js"(exports2, module2) {
      var AiPolicyGenerator = class {
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
            throw new Error(result.errors.join(" | "));
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
          const language = normalized.data.settings.language || "es";
          this.currentLanguage = language;
          const document = {
            businessName: normalized.data.business.name,
            effectiveDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
            warnings: normalized.warnings,
            language,
            title: language === "es" ? "Pol\xEDtica de Uso de IA y Datos de Entrenamiento" : "AI Use and Training Data Policy",
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
                reason: included ? "section generated" : "section omitted"
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
              language: this.stringValue(input.settings?.language, "es")
            }
          };
          const messages = data.settings.language === "es" ? {
            missingBusinessName: "El nombre del negocio es obligatorio.",
            missingWebsite: "La URL del servicio es obligatoria.",
            missingSystems: "Conviene identificar qu\xE9 sistemas o funciones de IA se usan. Esto ayuda a que la policy no quede gen\xE9rica y suele ser importante si us\xE1s asistentes, generaci\xF3n, ranking o moderaci\xF3n visibles.",
            missingUseCases: "Conviene describir para qu\xE9 se usa la IA en el servicio. Esto importa especialmente si la IA afecta soporte, generaci\xF3n de contenido, fraude, moderaci\xF3n o priorizaci\xF3n.",
            missingTrainingDisclosure: "Deb\xE9s aclarar si los datos se usan o no para entrenamiento, ajuste, evaluaci\xF3n o mejora de modelos. Sin esa definici\xF3n la policy puede quedar ambigua justo en el punto m\xE1s sensible del documento.",
            missingDataSources: "Conviene indicar de d\xF3nde provienen los datos vinculados al uso o entrenamiento de IA. Esto es especialmente \xFAtil si us\xE1s prompts de clientes, logs, feedback, datos p\xFAblicos o proveedores externos.",
            missingOptOutMethod: "Si ofrec\xE9s opt-out sobre entrenamiento o mejora, conviene indicar el m\xE9todo concreto. Si no, el usuario sabe que existe el control pero no c\xF3mo ejercerlo.",
            missingRetention: "Conviene indicar cu\xE1nto tiempo se retienen prompts, outputs o datasets relacionados con IA. Esto importa especialmente si guard\xE1s logs, conversaciones o se\xF1ales para evaluaci\xF3n, seguridad o mejora.",
            missingProviders: "Conviene identificar proveedores externos o model providers si intervienen en el flujo. Esto es especialmente importante si us\xE1s APIs de terceros, infraestructura cloud o herramientas de safety/observability.",
            missingAppealChannel: "Si hay decisiones automatizadas o revisi\xF3n humana, conviene indicar un canal para pedir revisi\xF3n o soporte. Esto importa m\xE1s cuando la IA afecta acceso, moderaci\xF3n, fraude, ranking o priorizaci\xF3n.",
            missingSensitiveRestrictions: "Conviene explicar c\xF3mo trat\xE1s datos sensibles, restringidos o de alto riesgo en flujos de IA. Esto es especialmente importante si los usuarios podr\xEDan cargar salud, biom\xE9tricos, menores o informaci\xF3n financiera.",
            missingSecurityControls: "Conviene resumir controles de seguridad y minimizaci\xF3n sobre prompts, outputs y datos vinculados a IA. Sin eso, la policy queda floja para entornos B2B, enterprise o con datos personales.",
            noHumanReviewWarning: "Si la IA puede influir decisiones relevantes, conviene aclarar si existe revisi\xF3n humana o mecanismos de escalamiento. Esto importa especialmente si la IA afecta acceso, scoring, fraude, moderaci\xF3n o priorizaci\xF3n.",
            contradictionNoTrainingWithImprovement: "Marcaste que no us\xE1s datos para entrenamiento o mejora, pero tambi\xE9n seleccionaste usos concretos de improvement/evaluation. Revis\xE1 si esos usos ocurren sobre datos del usuario, datos aislados o datasets separados, y ajust\xE1 la policy para que no se contradiga.",
            contradictionOptOutWithoutEligibleUse: "Configuraste un opt-out para entrenamiento o mejora, pero el uso de datos elegido no sugiere un flujo claro de entrenamiento/mejora que requiera ese control. Confirm\xE1 si realmente existe opt-out o si el dato deber\xEDa figurar s\xF3lo para evaluation-only o no-training.",
            contradictionOptOutMethodWithoutOptOut: "Completaste un m\xE9todo de opt-out, pero tambi\xE9n marcaste que no existe ese control. Revis\xE1 cu\xE1l de las dos cosas refleja tu flujo real para no prometer una opci\xF3n que despu\xE9s no aparece en producto o contrato.",
            contradictionHiddenAiLabeling: "Indic\xE1s etiquetado de contenido generado por IA, pero tambi\xE9n marcaste que la IA no es visible para usuarios o clientes. Revis\xE1 si el etiquetado aplica a contenido p\xFAblico, interno o a otra feature, para que la policy no describa una experiencia inexistente.",
            contradictionNoHumanReviewWithAppeal: "Declaraste un canal de revisi\xF3n o apelaci\xF3n, pero tambi\xE9n marcaste que no existe revisi\xF3n humana. Revis\xE1 si quer\xE9s permitir escalamiento humano real o si ese canal s\xF3lo cubre soporte general y no revisi\xF3n de decisiones.",
            contradictionPersonalDataDeniedWithOperationalSources: "Marcaste que no intervienen datos personales, pero tambi\xE9n indic\xE1s fuentes como inputs de usuarios, logs o feedback que normalmente pueden contenerlos. Conviene aclarar si se excluyen, anonimizan o a\xEDslan antes de esos usos, sobre todo en SaaS, soporte o analytics."
          } : {
            missingBusinessName: "Business name is required.",
            missingWebsite: "Service URL is required.",
            missingSystems: "You should identify which AI systems or features are used. This helps avoid a generic policy and is especially important if assistants, generation, ranking, or moderation are visible in the product.",
            missingUseCases: "You should describe how AI is used in the service. This matters especially if AI affects support, content generation, fraud, moderation, or prioritization.",
            missingTrainingDisclosure: "You must clearly state whether data is used for training, fine-tuning, evaluation, or model improvement. Without that choice, the policy stays ambiguous on its most sensitive point.",
            missingDataSources: "You should identify the sources of data linked to AI use or training. This is especially helpful if you rely on customer prompts, service logs, feedback, public data, or third-party sources.",
            missingOptOutMethod: "If you offer an opt-out for training or improvement, you should explain the concrete method. Otherwise users know the control exists but not how to exercise it.",
            missingRetention: "You should state how long prompts, outputs, or AI-related datasets are retained. This matters especially if you keep logs, conversations, or signals for evaluation, safety, or improvement.",
            missingProviders: "You should identify external providers or model providers if they are part of the flow. This is especially important when third-party APIs, cloud infrastructure, or safety/observability vendors are involved.",
            missingAppealChannel: "If automated decisions or human review are involved, you should provide a channel for review or support requests. This matters most when AI affects access, moderation, fraud, ranking, or prioritization.",
            missingSensitiveRestrictions: "You should explain how sensitive, restricted, or high-risk data is handled in AI workflows. This matters especially if users may submit health, biometric, minor, or financial data.",
            missingSecurityControls: "You should summarize security and minimization controls for prompts, outputs, and AI-related data. Without that, the policy is weak for B2B, enterprise, or personal-data-heavy contexts.",
            noHumanReviewWarning: "If AI can influence meaningful decisions, you should clarify whether human review or escalation mechanisms exist. This matters especially where AI affects access, scoring, fraud, moderation, or prioritization.",
            contradictionNoTrainingWithImprovement: "You marked data use as no training/improvement, but also selected concrete improvement or evaluation uses. Review whether those uses happen on user data, isolated data, or separate datasets, and align the policy wording.",
            contradictionOptOutWithoutEligibleUse: "You configured an opt-out for training or improvement, but the selected data-use mode does not clearly suggest a training/improvement flow that would require that control. Confirm whether the opt-out is real or whether the mode should stay evaluation-only or no-training.",
            contradictionOptOutMethodWithoutOptOut: "You filled in an opt-out method, but also marked that no such control exists. Review which statement matches the real workflow so the policy does not promise a control the product or contract does not offer.",
            contradictionHiddenAiLabeling: "You marked AI-generated content labeling, but also said AI is not visible to users or customers. Review whether the labeling applies to public content, internal workflows, or another feature so the policy matches the actual experience.",
            contradictionNoHumanReviewWithAppeal: "You declared a review or appeal channel, but also marked that no human review is available. Review whether you want real human escalation or whether that channel only covers general support rather than decision review.",
            contradictionPersonalDataDeniedWithOperationalSources: "You marked that no personal data is involved, but also selected sources such as user inputs, service logs, or feedback that often contain it. Clarify whether those data are excluded, anonymized, or isolated before those uses, especially in SaaS, support, or analytics flows."
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
          if (data.ai.trainingDataUse === "no_training" && data.ai.modelImprovementUses.length > 0) warnings.push(messages.contradictionNoTrainingWithImprovement);
          if (data.ai.optOutAvailable && ["no_training", "evaluation_only"].includes(data.ai.trainingDataUse)) warnings.push(messages.contradictionOptOutWithoutEligibleUse);
          if (!data.ai.optOutAvailable && data.ai.optOutMethod) warnings.push(messages.contradictionOptOutMethodWithoutOptOut);
          if (!data.ai.userFacingAi && data.ai.generatedContentLabeling) warnings.push(messages.contradictionHiddenAiLabeling);
          if (!data.ai.humanReviewAvailable && data.ai.appealChannel) warnings.push(messages.contradictionNoHumanReviewWithAppeal);
          if (!data.ai.personalDataInTraining && ["model_training", "service_improvement"].includes(data.ai.trainingDataUse) && data.ai.dataSources.some((value) => ["customer_inputs", "service_logs", "feedback_signals"].includes(value))) {
            warnings.push(messages.contradictionPersonalDataDeniedWithOperationalSources);
          }
          return { data, errors, warnings };
        }
        buildSections(data) {
          const sections = [
            this.section("overview", this.text("Overview", "Resumen"), [
              this.interpolate(this.text(
                "{business_name} publishes this AI use and training data policy to explain how artificial intelligence systems may be used in connection with {website}, how related data may be handled, and what controls or limits apply.",
                "{business_name} publica esta pol\xEDtica de uso de IA y datos de entrenamiento para explicar c\xF3mo pueden usarse sistemas de inteligencia artificial en relaci\xF3n con {website}, c\xF3mo pueden tratarse los datos vinculados y qu\xE9 controles o l\xEDmites aplican."
              ), data)
            ]),
            this.section("systems", this.text("AI Systems and Use Cases", "Sistemas de IA y casos de uso"), [
              this.systemsText(data)
            ]),
            this.section("training", this.text("Training, Evaluation, and Model Improvement", "Entrenamiento, evaluaci\xF3n y mejora de modelos"), [
              this.trainingText(data)
            ]),
            this.section("sources", this.text("Data Sources and Providers", "Fuentes de datos y proveedores"), [
              this.sourcesText(data)
            ]),
            this.section("retention", this.text("Retention, Opt-Out, and User Controls", "Retenci\xF3n, opt-out y controles del usuario"), [
              this.retentionText(data)
            ]),
            this.section("decisions", this.text("Automated Decisions and Human Review", "Decisiones automatizadas y revisi\xF3n humana"), [
              this.decisionText(data)
            ]),
            this.section("safeguards", this.text("Restrictions, Security, and Safeguards", "Restricciones, seguridad y salvaguardas"), [
              this.safeguardsText(data)
            ]),
            this.section("contact", this.text("Contact Information", "Informaci\xF3n de contacto"), [
              this.contactText(data)
            ])
          ];
          if (data.ai.transparencyNotes) {
            sections.splice(sections.length - 1, 0, this.section("additional-transparency", this.text("Additional Transparency Notes", "Notas adicionales de transparencia"), [
              data.ai.transparencyNotes
            ]));
          }
          if (data.ai.notes.length > 0) {
            sections.splice(sections.length - 1, 0, this.section("additional-notes", this.text("Additional Notes", "Notas adicionales"), data.ai.notes));
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
          return this.currentLanguage === "es" ? es : en;
        }
        interpolate(text, data) {
          return String(text || "").replaceAll("{business_name}", data.business.name || "").replaceAll("{website}", data.business.websiteUrl || "");
        }
        systemsText(data) {
          const parts = [];
          if (data.ai.systemsUsed.length > 0) {
            parts.push(`${this.text("AI systems or features in scope", "Sistemas o funciones de IA alcanzados")}: ${data.ai.systemsUsed.map((value) => this.systemLabel(value)).join(", ")}.`);
          }
          if (data.ai.useCases.length > 0) {
            parts.push(`${this.text("Primary use cases", "Casos de uso principales")}: ${data.ai.useCases.map((value) => this.useCaseLabel(value)).join(", ")}.`);
          }
          parts.push(this.text(
            data.ai.userFacingAi ? "Some AI-supported features may be visible to end users, customers, or staff interacting with the service." : "AI use may be limited to internal support, moderation, analytics, or operational workflows rather than direct end-user interactions.",
            data.ai.userFacingAi ? "Algunas funciones asistidas por IA pueden ser visibles para usuarios finales, clientes o personal que interact\xFAe con el servicio." : "El uso de IA puede limitarse a soporte interno, moderaci\xF3n, anal\xEDtica u operaciones, sin interacci\xF3n directa con usuarios finales."
          ));
          if (data.ai.generatedContentLabeling) {
            parts.push(this.text(
              "Where appropriate, the service may label or otherwise indicate content that is AI-generated or materially AI-assisted.",
              "Cuando corresponda, el servicio puede etiquetar o indicar de otro modo el contenido generado por IA o materialmente asistido por IA."
            ));
          }
          return parts.join(" ");
        }
        trainingText(data) {
          const policy = {
            no_training: this.text(
              "Customer or user data is not used to train, fine-tune, or improve general-purpose or product models, except where strictly necessary for safety, abuse prevention, or separately disclosed evaluation workflows.",
              "Los datos de clientes o usuarios no se usan para entrenar, ajustar o mejorar modelos de prop\xF3sito general o del producto, salvo cuando sea estrictamente necesario para seguridad, prevenci\xF3n de abuso o flujos de evaluaci\xF3n informados por separado."
            ),
            evaluation_only: this.text(
              "Relevant data may be used in limited ways for evaluation, benchmarking, quality review, or safety testing, but not for broad model training unless separately disclosed.",
              "Ciertos datos pueden usarse de forma limitada para evaluaci\xF3n, benchmarking, revisi\xF3n de calidad o pruebas de seguridad, pero no para entrenamiento amplio de modelos salvo aviso separado."
            ),
            service_improvement: this.text(
              "Relevant prompts, outputs, feedback, or related signals may be used to improve product quality, safety, workflows, or narrow model behavior within the service context.",
              "Prompts, outputs, feedback u otras se\xF1ales relacionadas pueden usarse para mejorar calidad, seguridad, flujos o comportamiento acotado del producto dentro del contexto del servicio."
            ),
            model_training: this.text(
              "Relevant prompts, outputs, feedback, or associated data may be used for model training, fine-tuning, or broader model improvement, subject to applicable legal basis, safeguards, and user controls described in this policy.",
              "Prompts, outputs, feedback o datos asociados pueden usarse para entrenamiento, fine-tuning o mejora m\xE1s amplia de modelos, sujeto a base legal aplicable, salvaguardas y controles descriptos en esta pol\xEDtica."
            )
          }[data.ai.trainingDataUse] || "";
          const parts = [policy];
          if (data.ai.personalDataInTraining) {
            parts.push(this.text(
              "Where personal data may appear in AI-related workflows, the service should apply minimization, restrictions, and governance measures appropriate to the context and legal basis used.",
              "Cuando puedan aparecer datos personales en flujos vinculados a IA, el servicio deber\xEDa aplicar minimizaci\xF3n, restricciones y medidas de gobernanza adecuadas al contexto y la base legal utilizada."
            ));
          } else {
            parts.push(this.text(
              "The service aims to avoid or minimize the inclusion of personal data in AI training or model-improvement workflows wherever reasonably possible.",
              "El servicio busca evitar o minimizar, siempre que sea razonablemente posible, la inclusi\xF3n de datos personales en flujos de entrenamiento o mejora de modelos."
            ));
          }
          if (data.ai.modelImprovementUses.length > 0) {
            parts.push(`${this.text("Specific improvement uses", "Usos concretos para mejora")}: ${data.ai.modelImprovementUses.map((value) => this.improvementLabel(value)).join(", ")}.`);
          }
          return parts.filter(Boolean).join(" ");
        }
        sourcesText(data) {
          const parts = [];
          if (data.ai.dataSources.length > 0) {
            parts.push(`${this.text("Relevant data sources", "Fuentes de datos relevantes")}: ${data.ai.dataSources.map((value) => this.dataSourceLabel(value)).join(", ")}.`);
          }
          if (data.ai.thirdPartyProviders.length > 0) {
            parts.push(`${this.text("Third-party or model providers", "Proveedores terceros o model providers")}: ${data.ai.thirdPartyProviders.map((value) => this.providerLabel(value)).join(", ")}.`);
          }
          parts.push(this.text(
            "Where third-party model or infrastructure providers are used, data sharing, retention, and contractual controls should be reviewed against the service\u2019s legal and operational requirements.",
            "Cuando se usen proveedores externos de modelos o infraestructura, el intercambio de datos, la retenci\xF3n y los controles contractuales deber\xEDan revisarse frente a las exigencias legales y operativas del servicio."
          ));
          return parts.join(" ");
        }
        retentionText(data) {
          const parts = [];
          if (data.ai.retentionPeriod) {
            parts.push(`${this.text("Retention approach", "Criterio de retenci\xF3n")}: ${this.sentence(data.ai.retentionPeriod)}`);
          }
          if (data.ai.optOutAvailable) {
            parts.push(this.text(
              "The service offers a mechanism to limit or opt out of certain AI training or model-improvement uses where described for the relevant account, feature, or workflow.",
              "El servicio ofrece un mecanismo para limitar o excluir ciertos usos de entrenamiento o mejora de modelos, cuando as\xED se indique para la cuenta, funci\xF3n o flujo correspondiente."
            ));
            if (data.ai.optOutMethod) {
              parts.push(`${this.text("Opt-out method", "M\xE9todo de opt-out")}: ${this.sentence(data.ai.optOutMethod)}`);
            }
          } else {
            parts.push(this.text(
              "No general opt-out may be available for every AI-related workflow, especially where processing is required for security, abuse prevention, service delivery, or legally justified evaluation.",
              "Puede no existir un opt-out general para todos los flujos vinculados a IA, especialmente cuando el tratamiento sea necesario para seguridad, prevenci\xF3n de abuso, prestaci\xF3n del servicio o evaluaci\xF3n jur\xEDdicamente justificada."
            ));
          }
          return parts.join(" ");
        }
        decisionText(data) {
          const parts = [
            this.text(
              data.ai.automatedDecisionMaking ? "AI-supported outputs or scoring may contribute to automated or semi-automated decisions within the service." : "AI outputs are intended primarily as assistive, supportive, or informational tools rather than sole drivers of automated decisions with meaningful effects.",
              data.ai.automatedDecisionMaking ? "Los outputs o puntajes asistidos por IA pueden contribuir a decisiones automatizadas o semiautomatizadas dentro del servicio." : "Los outputs de IA est\xE1n pensados principalmente como herramientas de asistencia, soporte o informaci\xF3n, y no como \xFAnicos determinantes de decisiones automatizadas con efectos relevantes."
            )
          ];
          parts.push(this.text(
            data.ai.humanReviewAvailable ? "Human review, escalation, or override may be available depending on the feature, account tier, support channel, or operational process involved." : "Human review may not be available in every AI workflow, so users should avoid relying on AI outputs as sole substitutes for material business, legal, financial, medical, or safety decisions.",
            data.ai.humanReviewAvailable ? "Puede existir revisi\xF3n humana, escalamiento o override seg\xFAn la funci\xF3n, el plan, el canal de soporte o el proceso operativo involucrado." : "Puede no haber revisi\xF3n humana en todos los flujos de IA, por lo que los usuarios deber\xEDan evitar depender de los outputs de IA como sustituto \xFAnico para decisiones materiales de negocio, legales, financieras, m\xE9dicas o de seguridad."
          ));
          if (data.ai.appealChannel) {
            parts.push(`${this.text("Review or support channel", "Canal para revisi\xF3n o soporte")}: ${this.sentence(data.ai.appealChannel)}`);
          }
          return parts.join(" ");
        }
        safeguardsText(data) {
          const parts = [];
          if (data.ai.sensitiveDataRestrictions) {
            parts.push(`${this.text("Sensitive or restricted data handling", "Tratamiento de datos sensibles o restringidos")}: ${this.sentence(data.ai.sensitiveDataRestrictions)}`);
          }
          if (data.ai.securityControls) {
            parts.push(`${this.text("Security and minimization controls", "Controles de seguridad y minimizaci\xF3n")}: ${this.sentence(data.ai.securityControls)}`);
          }
          parts.push(this.text(
            "AI outputs may be incomplete, probabilistic, biased, outdated, or otherwise imperfect. Users should apply judgment, internal controls, and feature-appropriate review before relying on outputs in sensitive contexts.",
            "Los outputs de IA pueden ser incompletos, probabil\xEDsticos, sesgados, desactualizados o imperfectos. Los usuarios deber\xEDan aplicar criterio, controles internos y revisi\xF3n adecuada antes de confiar en ellos en contextos sensibles."
          ));
          return parts.join(" ");
        }
        contactText(data) {
          const parts = [];
          if (data.contact.email) parts.push(this.text(`Primary contact email: ${data.contact.email}.`, `Email principal de contacto: ${data.contact.email}.`));
          if (data.contact.pageUrl) parts.push(this.text(`Reference page or contact URL: ${data.contact.pageUrl}.`, `P\xE1gina o URL de referencia: ${data.contact.pageUrl}.`));
          if (data.contact.phone) parts.push(this.text(`Phone: ${data.contact.phone}.`, `Tel\xE9fono: ${data.contact.phone}.`));
          if (data.business.address) parts.push(this.text(`Postal address: ${data.business.address}.`, `Direcci\xF3n postal: ${data.business.address}.`));
          return parts.join(" ");
        }
        formatAsMarkdown(document) {
          const lines = [
            `# ${document.title} - ${document.businessName}`,
            "",
            `${this.text("Effective date", "Fecha de vigencia")}: ${document.effectiveDate}`,
            ""
          ];
          for (const section of document.sections) {
            lines.push(`## ${section.title}`, "");
            for (const paragraph of section.paragraphs) {
              lines.push(paragraph, "");
            }
          }
          return lines.join("\n").trim();
        }
        formatAsText(document) {
          return this.formatAsMarkdown(document).replace(/^#{1,3}\s+/gm, "");
        }
        formatAsHTML(document) {
          const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
          const structuredData = this.buildStructuredData(document);
          const body = document.sections.map((section) => {
            const sectionId = `section-${section.id}`;
            const paragraphs = section.paragraphs.map((paragraph) => `<p>${escape(paragraph).replaceAll("\n", "<br>")}</p>`).join("\n");
            return `<section aria-labelledby="${sectionId}">
<h2 id="${sectionId}">${escape(section.title)}</h2>
${paragraphs}
</section>`;
          }).join("\n");
          return [
            "<!doctype html>",
            `<html lang="${document.language}">`,
            "<head>",
            '  <meta charset="utf-8">',
            '  <meta name="viewport" content="width=device-width, initial-scale=1">',
            `  <title>${escape(document.title)} - ${escape(document.businessName)}</title>`,
            `  ${structuredData ? `<script type="application/ld+json">${serializeJsonLd2(structuredData)}<\/script>` : ""}`,
            '  <meta name="legal-document-type" content="ai-policy">',
            "  <style>:root{color-scheme:light;}body{font-family:Arial,sans-serif;line-height:1.7;color:#1f2937;background:#fff;max-width:900px;margin:0 auto;padding:24px;}main{display:block;}header{margin-bottom:28px;}h1,h2,h3{line-height:1.25;color:#111827;}h2{margin-top:32px;}ul{padding-left:24px;}a{color:#0f62fe;}a:focus-visible{outline:3px solid #0f62fe;outline-offset:2px;}</style>",
            "</head>",
            "<body>",
            '  <main id="main-content" aria-labelledby="document-title">',
            "    <header>",
            `      <h1 id="document-title">${escape(document.title)} - ${escape(document.businessName)}</h1>`,
            `      <p><strong>${escape(this.text("Effective date", "Fecha de vigencia"))}:</strong> <time datetime="${escape(document.effectiveDate)}">${escape(document.effectiveDate)}</time></p>`,
            "    </header>",
            body,
            "  </main>",
            "</body>",
            "</html>"
          ].join("\n");
        }
        stringValue(value, fallback = "") {
          if (typeof value !== "string") return fallback;
          const normalized = value.trim();
          if (!normalized || [">", "no hay", "n/a", "na", "none", "null"].includes(normalized.toLowerCase())) {
            return fallback;
          }
          return normalized;
        }
        arrayValue(value) {
          return Array.isArray(value) ? value.filter(Boolean) : [];
        }
        booleanValue(value, fallback = false) {
          if (typeof value === "boolean") return value;
          if (value == null) return fallback;
          return Boolean(value);
        }
        sentence(value) {
          const normalized = this.stringValue(value);
          if (!normalized) return "";
          return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
        }
        systemLabel(value) {
          const labels = {
            chatbot_or_assistant: this.text("chatbots or assistants", "chatbots o asistentes"),
            content_generation: this.text("content generation", "generaci\xF3n de contenido"),
            ranking_or_recommendation: this.text("ranking or recommendations", "ranking o recomendaciones"),
            classification_or_moderation: this.text("classification or moderation", "clasificaci\xF3n o moderaci\xF3n"),
            analytics_or_forecasting: this.text("analytics or forecasting", "anal\xEDtica o predicci\xF3n")
          };
          return labels[value] || value;
        }
        useCaseLabel(value) {
          const labels = {
            customer_support: this.text("customer support", "soporte al cliente"),
            drafting_or_generation: this.text("drafting or generation", "redacci\xF3n o generaci\xF3n"),
            search_and_retrieval: this.text("search and retrieval", "b\xFAsqueda y retrieval"),
            moderation_or_safety: this.text("moderation or safety", "moderaci\xF3n o seguridad"),
            internal_operations: this.text("internal operations", "operaci\xF3n interna")
          };
          return labels[value] || value;
        }
        dataSourceLabel(value) {
          const labels = {
            customer_inputs: this.text("customer or user inputs", "inputs del cliente o usuario"),
            service_logs: this.text("service logs and telemetry", "logs y telemetr\xEDa del servicio"),
            feedback_signals: this.text("explicit feedback signals", "feedback expl\xEDcito"),
            public_or_licensed_data: this.text("public or licensed data", "datos p\xFAblicos o licenciados"),
            synthetic_or_test_data: this.text("synthetic or test data", "datos sint\xE9ticos o de prueba")
          };
          return labels[value] || value;
        }
        improvementLabel(value) {
          const labels = {
            quality_evaluation: this.text("quality evaluation", "evaluaci\xF3n de calidad"),
            safety_testing: this.text("safety testing", "pruebas de seguridad"),
            fine_tuning: this.text("fine-tuning", "fine-tuning"),
            product_analytics: this.text("product analytics", "anal\xEDtica del producto")
          };
          return labels[value] || value;
        }
        providerLabel(value) {
          const labels = {
            third_party_model_api: this.text("third-party model APIs", "APIs de modelos de terceros"),
            cloud_infrastructure: this.text("cloud infrastructure", "infraestructura cloud"),
            annotation_or_review_vendor: this.text("annotation or review vendors", "vendors de anotaci\xF3n o revisi\xF3n"),
            monitoring_or_safety_tooling: this.text("monitoring or safety tooling", "herramientas de monitoreo o safety")
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
      };
      function buildStructuredDataDocument(document) {
        const metadata = document.metadata || {};
        const canonicalUrl = metadata.websiteUrl || metadata.contactPageUrl;
        if (!canonicalUrl) return null;
        const organization = {
          "@type": "Organization",
          name: document.businessName
        };
        if (metadata.websiteUrl) organization.url = metadata.websiteUrl;
        if (metadata.contactEmail) organization.email = metadata.contactEmail;
        return {
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              name: `${document.title} - ${document.businessName}`,
              url: canonicalUrl,
              inLanguage: document.language === "es" ? "es" : "en",
              dateModified: document.effectiveDate,
              lastReviewed: document.effectiveDate,
              about: {
                "@type": "Thing",
                name: document.title
              },
              publisher: organization,
              accountablePerson: organization
            },
            organization
          ]
        };
      }
      function serializeJsonLd2(value) {
        return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
      }
      module2.exports = AiPolicyGenerator;
    }
  });

  // web/browser-entry.js
  var require_browser_entry = __commonJS({
    "web/browser-entry.js"() {
      var PrivacyPolicyGenerator2 = require_generator();
      var TermsGenerator = require_terms_generator();
      var DataDeletionGenerator = require_deletion_generator();
      var CookiesPolicyGenerator = require_cookies_generator();
      var ReturnRefundPolicyGenerator = require_refund_generator();
      var DisclaimerGenerator = require_disclaimer_generator();
      var SecurityPolicyGenerator = require_security_generator();
      var DataProcessingAgreementGenerator = require_dpa_generator();
      var AiPolicyGenerator = require_ai_policy_generator();
      globalThis.LegalGenerators = {
        PrivacyPolicyGenerator: PrivacyPolicyGenerator2,
        TermsGenerator,
        DataDeletionGenerator,
        CookiesPolicyGenerator,
        ReturnRefundPolicyGenerator,
        DisclaimerGenerator,
        SecurityPolicyGenerator,
        DataProcessingAgreementGenerator,
        AiPolicyGenerator
      };
    }
  });
  require_browser_entry();
})();
