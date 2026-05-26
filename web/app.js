let DOCUMENTS;

const DOCUMENT_PRESETS = {
  privacy: [
    {
      value: 'saas_b2b_argentina',
      label: 'SaaS B2B Argentina',
      description: 'Base local para SaaS o app web con clientes principalmente en Argentina y proveedores cloud/analytics habituales.',
      summary: [
        'Foco principal en Argentina con operación local.',
        'Asume datos personales, uso y cookies con base contractual e interés legítimo.',
        'Marca cloud, analítica y email transaccional como terceros típicos.'
      ],
      patch: {
        business: { type: 'saas', country: 'Argentina' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar'],
          childrenAudience: false
        },
        dataPractices: {
          collectedData: ['personal', 'usage', 'cookies'],
          thirdParties: ['cloud', 'analytics', 'email'],
          legalBases: ['contract', 'legitimate_interest']
        },
        compliance: {
          requestedFrameworks: []
        }
      }
    },
    {
      value: 'global_saas_eu',
      label: 'SaaS global con clientes UE',
      description: 'Escenario para SaaS o app web con usuarios o clientes en la Unión Europea y foco más fuerte en GDPR.',
      summary: [
        'Activa Unión Europea y Reino Unido como regiones operativas.',
        'Suma consentimiento además de contrato e interés legítimo.',
        'Asume cloud, analítica y email como proveedores típicos con transferencias potenciales.'
      ],
      patch: {
        business: { type: 'saas', country: 'Germany' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'eu',
          sellRegions: ['eu', 'uk'],
          childrenAudience: false
        },
        dataPractices: {
          collectedData: ['personal', 'usage', 'cookies'],
          thirdParties: ['cloud', 'analytics', 'email'],
          legalBases: ['contract', 'consent', 'legitimate_interest']
        },
        compliance: {
          requestedFrameworks: []
        }
      }
    },
    {
      value: 'ecommerce_argentina',
      label: 'E-commerce Argentina',
      description: 'Base para comercio electrónico local con pagos, facturación, logística y prácticas de analítica/cookies comunes.',
      summary: [
        'Asume operación principal en Argentina para ventas online.',
        'Incluye datos personales, financieros, fiscales, uso y cookies.',
        'Marca pagos, logística, cloud, analítica y email como terceros frecuentes.'
      ],
      patch: {
        business: { type: 'ecommerce', country: 'Argentina' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar'],
          childrenAudience: false
        },
        dataPractices: {
          collectedData: ['personal', 'financial', 'tax', 'usage', 'cookies'],
          thirdParties: ['payment', 'shipping', 'cloud', 'analytics', 'email'],
          legalBases: ['contract', 'legal_obligation', 'legitimate_interest']
        },
        compliance: {
          requestedFrameworks: []
        }
      }
    },
    {
      value: 'mobile_meta_social',
      label: 'App con login social y Meta',
      description: 'Escenario para app móvil o servicio con login social, integraciones Meta/sociales y flujo de deletion más sensible.',
      summary: [
        'Asume app móvil con integraciones sociales y terceros cloud/analytics.',
        'Marca datos personales, uso, cookies e identificadores de cuenta.',
        'Útil para productos con login social, SDKs sociales o APIs conectadas.'
      ],
      patch: {
        business: { type: 'mobile', country: 'Argentina' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global'],
          childrenAudience: false
        },
        dataPractices: {
          collectedData: ['personal', 'identity', 'usage', 'cookies'],
          thirdParties: ['social', 'cloud', 'analytics'],
          legalBases: ['contract', 'consent', 'legitimate_interest']
        },
        compliance: {
          requestedFrameworks: []
        }
      }
    },
    {
      value: 'content_newsletter',
      label: 'Contenido / blog con newsletter',
      description: 'Preset liviano para sitio de contenido con suscripción por email, analítica y cookies básicas.',
      summary: [
        'Pensado para blog, medio o proyecto de contenido con newsletter.',
        'Asume datos personales básicos, analítica y cookies.',
        'Marca email/marketing, cloud y analítica como terceros usuales.'
      ],
      patch: {
        business: { type: 'blog' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global'],
          childrenAudience: false
        },
        dataPractices: {
          collectedData: ['personal', 'usage', 'cookies'],
          thirdParties: ['email', 'analytics', 'cloud'],
          legalBases: ['consent', 'legitimate_interest']
        },
        compliance: {
          requestedFrameworks: []
        }
      }
    }
  ],
  terms: [
    {
      value: 'ecommerce_argentina',
      label: 'E-commerce Argentina',
      description: 'Base para tienda online local con productos físicos, pagos, logística, devoluciones y foco consumidor.',
      summary: [
        'Asume venta de productos físicos en Argentina.',
        'Activa impuestos incluidos, pagos, devoluciones y garantía.',
        'Usa foro local y disclaimer por demoras de envío.'
      ],
      patch: {
        business: { type: 'ecommerce', country: 'Argentina' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar']
        },
        terms: {
          offeringType: 'physical_goods',
          hasAccounts: false,
          requiresRegistration: false,
          allowsUserContent: false,
          pricesIncludeTaxes: true,
          currency: 'ARS',
          paymentProvider: 'Mercado Pago',
          refundsOffered: true,
          refundWindow: '10 días',
          refundConditions: 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.',
          returnShippingResponsibility: 'case_by_case',
          warrantyOffered: true,
          warrantyDetails: 'La garantía legal y cualquier remedio aplicable se interpretarán de forma compatible con la normativa de defensa del consumidor aplicable.',
          prohibitedActivities: [
            'No usar el sitio para actividades ilegales.',
            'No interferir con la seguridad, estabilidad o funcionamiento técnico del sitio.',
            'No copiar, revender o explotar el contenido o productos fuera de lo permitido.'
          ],
          ipOwner: '',
          ugcLicenseGranted: false,
          limitIndirectDamages: true,
          shippingDelayDisclaimer: true,
          customDisclaimer: '',
          maySuspendAccounts: true,
          terminationGrounds: 'Podemos suspender cuentas, pedidos o acceso por fraude, abuso, incumplimiento o riesgos operativos o legales.',
          changeNotification: 'both',
          disputesForum: 'Tribunales competentes de la Ciudad Autónoma de Buenos Aires',
          adrMethod: 'none'
        }
      }
    },
    {
      value: 'subscription_saas',
      label: 'SaaS por suscripción',
      description: 'Escenario para software o app web con cuentas, acceso revocable y pagos recurrentes.',
      summary: [
        'Asume cuentas de usuario y registro obligatorio.',
        'Base pensada para suscripciones y acceso al servicio.',
        'Refuerza suspensión, limitación de daños y cambios del servicio.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        terms: {
          offeringType: 'subscriptions',
          hasAccounts: true,
          requiresRegistration: true,
          allowsUserContent: false,
          pricesIncludeTaxes: false,
          currency: 'USD',
          paymentProvider: 'Stripe',
          refundsOffered: true,
          refundWindow: '14 días',
          refundConditions: 'Los reembolsos, si corresponden, se evalúan según el plan, el tiempo transcurrido y el uso efectivo del servicio.',
          returnShippingResponsibility: 'merchant',
          warrantyOffered: false,
          warrantyDetails: '',
          prohibitedActivities: [
            'No usar el sitio para actividades ilegales.',
            'No interferir con la seguridad, estabilidad o funcionamiento técnico del sitio.',
            'No enviar spam, contenido abusivo o información falsa.'
          ],
          ipOwner: '',
          ugcLicenseGranted: false,
          limitIndirectDamages: true,
          shippingDelayDisclaimer: false,
          customDisclaimer: 'La disponibilidad, continuidad y features del servicio pueden evolucionar con actualizaciones razonables y límites operativos propios de un servicio SaaS.',
          maySuspendAccounts: true,
          terminationGrounds: 'Podemos suspender o terminar cuentas por fraude, abuso, uso indebido, impago, incumplimiento contractual o riesgos operativos, legales o de seguridad.',
          changeNotification: 'both',
          disputesForum: 'Tribunales competentes de la Ciudad Autónoma de Buenos Aires',
          adrMethod: 'mediation'
        }
      }
    },
    {
      value: 'digital_downloads',
      label: 'Producto digital descargable',
      description: 'Base para ebooks, plantillas, assets, cursos descargables o licencias de acceso digital.',
      summary: [
        'Asume entrega digital y sin logística física.',
        'Hace más restrictiva la política de reembolsos después del acceso.',
        'Sirve para descargas, activos y productos digitales simples.'
      ],
      patch: {
        business: { type: 'ecommerce' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        terms: {
          offeringType: 'digital_products',
          hasAccounts: false,
          requiresRegistration: false,
          allowsUserContent: false,
          pricesIncludeTaxes: false,
          currency: 'USD',
          paymentProvider: 'Stripe',
          refundsOffered: true,
          refundWindow: '7 días',
          refundConditions: 'Los reembolsos pueden limitarse cuando el acceso digital, descarga o consumo del producto ya comenzó, sin perjuicio de los derechos obligatorios aplicables.',
          returnShippingResponsibility: 'merchant',
          warrantyOffered: false,
          warrantyDetails: '',
          prohibitedActivities: [
            'No usar el sitio para actividades ilegales.',
            'No copiar, revender o explotar el contenido o productos fuera de lo permitido.',
            'No enviar spam, contenido abusivo o información falsa.'
          ],
          ipOwner: '',
          ugcLicenseGranted: false,
          limitIndirectDamages: true,
          shippingDelayDisclaimer: false,
          customDisclaimer: 'El acceso, descarga o entrega del producto digital puede depender de plataformas, correo transaccional, credenciales o disponibilidad técnica razonable.',
          maySuspendAccounts: true,
          terminationGrounds: 'Podemos restringir acceso o descargas por fraude, chargebacks, abuso, redistribución no autorizada o incumplimiento de estos términos.',
          changeNotification: 'service',
          disputesForum: 'Tribunales competentes de la Ciudad Autónoma de Buenos Aires',
          adrMethod: 'none'
        }
      }
    },
    {
      value: 'marketplace_with_accounts',
      label: 'Marketplace o plataforma con cuentas',
      description: 'Escenario para plataforma con cuentas, contenido de usuarios, moderación y facultades fuertes de suspensión.',
      summary: [
        'Asume cuentas obligatorias y contenido generado por usuarios.',
        'Activa licencia sobre UGC y restricciones de uso más amplias.',
        'Útil para directorios, comunidades o plataformas multiusuario.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        terms: {
          offeringType: 'services',
          hasAccounts: true,
          requiresRegistration: true,
          allowsUserContent: true,
          pricesIncludeTaxes: false,
          currency: 'USD',
          paymentProvider: 'Stripe',
          refundsOffered: true,
          refundWindow: '14 días',
          refundConditions: 'Los reembolsos, si aplican, dependen del servicio efectivamente prestado, del momento del reclamo y de las reglas comerciales o regulatorias aplicables.',
          returnShippingResponsibility: 'merchant',
          warrantyOffered: false,
          warrantyDetails: '',
          prohibitedActivities: [
            'No usar el sitio para actividades ilegales.',
            'No interferir con la seguridad, estabilidad o funcionamiento técnico del sitio.',
            'No copiar, revender o explotar el contenido o productos fuera de lo permitido.',
            'No enviar spam, contenido abusivo o información falsa.'
          ],
          ipOwner: '',
          ugcLicenseGranted: true,
          limitIndirectDamages: true,
          shippingDelayDisclaimer: false,
          customDisclaimer: 'La plataforma puede moderar, desindexar, limitar o remover contenido o cuentas cuando exista abuso, conflicto legal, riesgo operativo o incumplimiento de reglas internas.',
          maySuspendAccounts: true,
          terminationGrounds: 'Podemos suspender o terminar cuentas, publicaciones, accesos o transacciones por fraude, abuso, infracción de derechos, incumplimiento o riesgos legales, operativos o de seguridad.',
          changeNotification: 'both',
          disputesForum: 'Tribunales competentes de la Ciudad Autónoma de Buenos Aires',
          adrMethod: 'mediation'
        }
      }
    },
    {
      value: 'professional_services',
      label: 'Servicios profesionales',
      description: 'Base para consultoría, implementación, diseño, desarrollo o servicios prestados por proyecto o por encargo.',
      summary: [
        'Asume servicios más que venta de productos.',
        'Reduce foco logístico y refuerza límites de alcance y ejecución.',
        'Sirve para consultores, agencias y servicios a medida.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        terms: {
          offeringType: 'services',
          hasAccounts: false,
          requiresRegistration: false,
          allowsUserContent: false,
          pricesIncludeTaxes: false,
          currency: 'USD',
          paymentProvider: 'Transferencia bancaria u otro medio acordado',
          refundsOffered: true,
          refundWindow: 'Caso por caso',
          refundConditions: 'Los reembolsos o ajustes, si existieran, dependen del estado del servicio, entregables comprometidos, gastos ya incurridos y normas obligatorias aplicables.',
          returnShippingResponsibility: 'merchant',
          warrantyOffered: false,
          warrantyDetails: '',
          prohibitedActivities: [
            'No usar el sitio para actividades ilegales.',
            'No enviar spam, contenido abusivo o información falsa.'
          ],
          ipOwner: '',
          ugcLicenseGranted: false,
          limitIndirectDamages: true,
          shippingDelayDisclaimer: false,
          customDisclaimer: 'Los tiempos, entregables y alcances específicos pueden depender de propuestas, cronogramas, materiales provistos por el cliente o acuerdos complementarios.',
          maySuspendAccounts: true,
          terminationGrounds: 'Podemos suspender o terminar el servicio por falta de colaboración, incumplimiento, fraude, riesgo legal, operativo o de cobro, o imposibilidad razonable de ejecución.',
          changeNotification: 'email',
          disputesForum: 'Tribunales competentes de la Ciudad Autónoma de Buenos Aires',
          adrMethod: 'mediation'
        }
      }
    }
  ],
  refund: [
    {
      value: 'physical_ecommerce',
      label: 'E-commerce productos físicos',
      description: 'Base para tienda online con entregas físicas, devoluciones operativas, productos no retornables y manejo de daños o faltantes.',
      summary: [
        'Asume venta de productos físicos con cambios y reembolsos.',
        'Marca plazos operativos típicos y logística caso por caso.',
        'Incluye exclusiones razonables y proceso para productos dañados o incorrectos.'
      ],
      patch: {
        business: { type: 'ecommerce', country: 'Argentina' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar']
        },
        refund: {
          offeringType: 'physical_goods',
          acceptsReturns: true,
          refundWindow: '10 días',
          exchangeWindow: '10 días',
          returnConditions: 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.',
          refundMethod: 'el mismo medio de pago original',
          refundProcessingTime: '10 días hábiles',
          returnShippingResponsibility: 'case_by_case',
          returnRequestChannel: 'Email de soporte o formulario de contacto del sitio.',
          nonReturnableItems: [
            'Productos personalizados o hechos a medida',
            'Productos usados, dañados por mal uso o incompletos'
          ],
          digitalGoodsFinal: false,
          damagedItemsProcess: 'Si el producto llega dañado, incorrecto o con fallas, pedimos que nos contactes con fotos y datos del pedido para revisar el caso.'
        }
      }
    },
    {
      value: 'digital_products',
      label: 'Productos digitales',
      description: 'Escenario para descargas, licencias, activos digitales o accesos activados, con política más restrictiva después del acceso.',
      summary: [
        'Asume entrega digital sin logística física.',
        'Marca venta digital definitiva y excepciones más claras.',
        'Útil para ebooks, plantillas, licencias, cursos o productos descargables.'
      ],
      patch: {
        business: { type: 'ecommerce' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        refund: {
          offeringType: 'digital_products',
          acceptsReturns: true,
          refundWindow: '7 días',
          exchangeWindow: '',
          returnConditions: 'Los reembolsos pueden limitarse o excluirse una vez iniciado el acceso, descarga, activación o consumo del producto digital, sin perjuicio de derechos obligatorios aplicables.',
          refundMethod: 'el mismo medio de pago original',
          refundProcessingTime: '10 días hábiles',
          returnShippingResponsibility: 'merchant',
          returnRequestChannel: 'Email de soporte o formulario de contacto del sitio.',
          nonReturnableItems: [
            'Licencias o accesos ya activados',
            'Descargas ya iniciadas o consumidas',
            'Productos digitales personalizados o adaptados al cliente'
          ],
          digitalGoodsFinal: true,
          damagedItemsProcess: 'Si el acceso, enlace o archivo llega incompleto, corrupto o no coincide con la compra, pedimos que nos contactes con evidencia para revisar y corregir el caso.'
        }
      }
    },
    {
      value: 'services_or_bookings',
      label: 'Servicios o reservas',
      description: 'Base para servicios, turnos, reservas o trabajo por encargo, con foco en cancelación, reprogramación y estado de ejecución.',
      summary: [
        'Asume prestación de servicios o reservas más que venta de bienes.',
        'Usa evaluación caso por caso según el estado del servicio.',
        'Sirve para consultoría, reservas, sesiones o servicios a medida.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        refund: {
          offeringType: 'services',
          acceptsReturns: true,
          refundWindow: 'Hasta 48 horas antes del servicio',
          exchangeWindow: 'Sujeto a disponibilidad',
          returnConditions: 'Las cancelaciones, reprogramaciones o reembolsos se evalúan según el momento del aviso, la disponibilidad y el nivel de ejecución del servicio ya comprometido.',
          refundMethod: 'el mismo medio de pago original u otro medio acordado',
          refundProcessingTime: '10 días hábiles',
          returnShippingResponsibility: 'merchant',
          returnRequestChannel: 'Email de soporte o canal de atención del servicio.',
          nonReturnableItems: [
            'Servicios ya prestados total o parcialmente',
            'Reservas no canceladas dentro del plazo operativo informado',
            'Gastos o insumos ya comprometidos específicamente para el cliente'
          ],
          digitalGoodsFinal: false,
          damagedItemsProcess: 'Si el servicio se presta con errores, de forma incompleta o no coincide materialmente con lo contratado, pedimos que nos contactes para revisar corrección, reprogramación o remedio razonable.'
        }
      }
    },
    {
      value: 'saas_subscriptions',
      label: 'Suscripción SaaS',
      description: 'Escenario para suscripciones o planes SaaS con cancelación, prorrateo limitado y evaluación del uso ya consumido.',
      summary: [
        'Asume cobro por suscripción o plan recurrente.',
        'Marca evaluación según tiempo transcurrido y uso efectivo.',
        'Útil para software, membresías o acceso online continuo.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        refund: {
          offeringType: 'subscriptions',
          acceptsReturns: true,
          refundWindow: '14 días desde la contratación inicial',
          exchangeWindow: '',
          returnConditions: 'Los reembolsos o créditos, si corresponden, se evalúan según el plan contratado, el tiempo transcurrido, el uso efectivo del servicio y cualquier derecho legal obligatorio aplicable.',
          refundMethod: 'el mismo medio de pago original o crédito equivalente cuando corresponda',
          refundProcessingTime: '10 días hábiles',
          returnShippingResponsibility: 'merchant',
          returnRequestChannel: 'Email de soporte o canal de cuenta del usuario.',
          nonReturnableItems: [
            'Períodos ya consumidos de la suscripción',
            'Servicios profesionales, onboarding o setup ya prestados',
            'Planes o add-ons activados y usados fuera de cualquier ventana promocional aplicable'
          ],
          digitalGoodsFinal: false,
          damagedItemsProcess: 'Si el servicio no puede usarse razonablemente, se activa de forma incorrecta o presenta una falla material, pedimos que nos contactes para revisar soporte, corrección, crédito o remedio razonable.'
        }
      }
    }
  ],
  cookies: [
    {
      value: 'informational_site_analytics',
      label: 'Sitio informativo con analítica',
      description: 'Base liviana para sitio institucional, landing o proyecto informativo con cookies necesarias y de analítica.',
      summary: [
        'Asume cookies necesarias y de analítica.',
        'Usa banner o centro de preferencias como base de consentimiento.',
        'Marca terceros de analítica e infraestructura mínimos.'
      ],
      patch: {
        business: { type: 'blog' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        cookies: {
          categories: ['necessary', 'analytics'],
          thirdParties: ['analytics', 'cloud'],
          consentMode: 'banner',
          managementUrl: '',
          browserControls: 'El usuario puede bloquear o eliminar cookies desde la configuración del navegador y revisar sus preferencias cuando el banner o el centro de preferencias esté disponible.',
          retentionPolicy: 'Algunas cookies son de sesión y otras pueden persistir por más tiempo según la finalidad, la configuración técnica y las políticas del proveedor correspondiente.'
        }
      }
    },
    {
      value: 'ecommerce_remarketing',
      label: 'E-commerce con remarketing',
      description: 'Escenario para tienda online con analítica, marketing y plataformas publicitarias o de remarketing.',
      summary: [
        'Asume cookies necesarias, de preferencias, analítica y publicidad.',
        'Marca proveedores publicitarios, analítica, email y cloud.',
        'Útil para comercio con campañas, atribución y remarketing.'
      ],
      patch: {
        business: { type: 'ecommerce', country: 'Argentina' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar']
        },
        cookies: {
          categories: ['necessary', 'preferences', 'analytics', 'advertising'],
          thirdParties: ['analytics', 'advertising', 'email', 'cloud'],
          consentMode: 'banner',
          managementUrl: '',
          browserControls: 'El usuario puede gestionar preferencias desde el banner o centro de cookies y también bloquear o eliminar cookies desde la configuración del navegador.',
          retentionPolicy: 'Las cookies publicitarias, de analítica y preferencias pueden persistir según la campaña, la finalidad técnica y la política del proveedor involucrado.'
        }
      }
    },
    {
      value: 'saas_product_support',
      label: 'SaaS con producto y soporte',
      description: 'Base para app web o SaaS con cookies necesarias, preferencias y analítica, pero sin foco fuerte en publicidad.',
      summary: [
        'Asume cookies funcionales del producto, preferencias y analítica.',
        'Reduce foco publicitario frente a un e-commerce o medio con ads.',
        'Sirve para apps, dashboards, paneles y productos con soporte.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        cookies: {
          categories: ['necessary', 'preferences', 'analytics'],
          thirdParties: ['analytics', 'cloud'],
          consentMode: 'banner',
          managementUrl: '',
          browserControls: 'El usuario puede gestionar o deshabilitar cookies desde el banner o centro de preferencias y desde la configuración del navegador o dispositivo.',
          retentionPolicy: 'Las cookies necesarias y de preferencias pueden persistir por períodos razonables según autenticación, seguridad, configuración del usuario y operación del servicio.'
        }
      }
    },
    {
      value: 'blog_social_embeds',
      label: 'Medio / blog con embeds sociales',
      description: 'Escenario para contenido con analítica, embeds o widgets sociales y terceros relacionados con distribución o interacción social.',
      summary: [
        'Asume cookies necesarias, analítica y de terceros sociales.',
        'Marca integraciones sociales, infraestructura y medición.',
        'Útil para blogs, medios o sitios con videos, posts embebidos o widgets.'
      ],
      patch: {
        business: { type: 'blog' },
        settings: { language: 'es' },
        operations: {
          primaryJurisdiction: 'ar',
          sellRegions: ['ar', 'global']
        },
        cookies: {
          categories: ['necessary', 'analytics'],
          thirdParties: ['analytics', 'social', 'cloud'],
          consentMode: 'banner',
          managementUrl: '',
          browserControls: 'El usuario puede gestionar preferencias desde el banner o centro de cookies y también bloquear o eliminar cookies desde la configuración del navegador.',
          retentionPolicy: 'Las cookies y tecnologías relacionadas con embeds, analítica o integraciones sociales pueden persistir según la finalidad y la política del proveedor correspondiente.'
        }
      }
    }
  ],
  eula: [
    {
      value: 'consumer_mobile_app',
      label: 'App móvil de consumo',
      description: 'Base para app móvil orientada a usuarios finales, con licencia por cuenta, updates, componentes de terceros y restricciones estándar.',
      summary: [
        'Asume app móvil con licencia no transferible por cuenta.',
        'Mantiene restricciones de ingeniería inversa, modificación y redistribución.',
        'Útil para apps móviles de consumo con soporte comercial o del plan activo.'
      ],
      patch: {
        business: { type: 'mobile' },
        settings: { language: 'es' },
        eula: {
          softwareType: 'mobile_app',
          licenseGrant: 'Se concede una licencia limitada, revocable, no exclusiva y no transferible para instalar y usar la app en dispositivos compatibles conforme a este acuerdo y al plan, tienda o suscripción aplicable.',
          licenseScope: 'per_account',
          allowsCommercialUse: false,
          transferable: false,
          installationLimit: 'Una cuenta activa y los dispositivos personales razonablemente asociados al usuario, sujeto a las reglas técnicas o comerciales aplicables.',
          reverseEngineeringRestricted: true,
          modificationRestricted: true,
          redistributionRestricted: true,
          updatesProvided: true,
          supportLevel: 'commercial_support',
          thirdPartyComponents: true,
          openSourceNotice: 'La app puede incluir SDKs, librerías o componentes de terceros y open source sujetos a sus propias licencias, avisos y condiciones aplicables.',
          warrantyDisclaimer: 'Salvo garantía comercial expresa, la app se entrega "tal cual" y según disponibilidad, en la máxima medida permitida por la ley aplicable.',
          liabilityLimit: 'En la máxima medida permitida por la ley, no respondemos por daños indirectos, pérdida de datos, lucro cesante o interrupciones derivadas del uso de la app, salvo dolo o prohibición legal aplicable.',
          terminationTriggers: 'La licencia puede terminarse por incumplimiento material, uso no autorizado, manipulación indebida, infracción de restricciones técnicas o legales, o falta de pago cuando corresponda.',
          governingLaw: 'Según la jurisdicción indicada por el licenciante o por los términos comerciales principales asociados a la app.'
        }
      }
    },
    {
      value: 'saas_end_user',
      label: 'SaaS con cliente final',
      description: 'Escenario para software o app web con acceso por cuenta, uso comercial autorizado y soporte sujeto a plan o contrato.',
      summary: [
        'Asume licencia vinculada a cuenta o suscripción.',
        'Permite uso comercial bajo plan aplicable.',
        'Sirve para SaaS, dashboards o productos online con soporte comercial.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        eula: {
          softwareType: 'web_app',
          licenseGrant: 'Se concede una licencia limitada, revocable, no exclusiva y no transferible para acceder y usar el software conforme a este acuerdo, al plan contratado y a la documentación aplicable.',
          licenseScope: 'per_account',
          allowsCommercialUse: true,
          transferable: false,
          installationLimit: 'Una cuenta activa, un entorno autorizado o la cantidad de usuarios o seats contratados según el plan aplicable.',
          reverseEngineeringRestricted: true,
          modificationRestricted: true,
          redistributionRestricted: true,
          updatesProvided: true,
          supportLevel: 'commercial_support',
          thirdPartyComponents: true,
          openSourceNotice: 'El servicio puede apoyarse en componentes de terceros u open source sujetos a sus propias licencias, avisos y condiciones.',
          warrantyDisclaimer: 'Salvo garantía comercial expresa, el software se entrega "tal cual" y según disponibilidad, con los límites permitidos por la ley aplicable y el contrato principal.',
          liabilityLimit: 'En la máxima medida permitida por la ley, no respondemos por daños indirectos, pérdida de datos, lucro cesante o interrupciones derivadas del uso del software, salvo dolo o prohibición legal aplicable.',
          terminationTriggers: 'La licencia puede revocarse o suspenderse por incumplimiento material, impago, uso abusivo, acceso no autorizado o riesgos operativos, legales o de seguridad.',
          governingLaw: 'Según la jurisdicción indicada por el licenciante o por los términos comerciales principales del servicio.'
        }
      }
    },
    {
      value: 'sdk_api_developers',
      label: 'SDK / API para developers',
      description: 'Base para librerías, SDKs, tooling o APIs con restricciones de redistribución, uso técnico y dependencia de documentación y licencias externas.',
      summary: [
        'Asume uso técnico por developers o equipos integradores.',
        'Refuerza restricciones de redistribución y modificación.',
        'Útil para SDKs, APIs, librerías o herramientas para terceros.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        eula: {
          softwareType: 'sdk_api',
          licenseGrant: 'Se concede una licencia limitada, revocable, no exclusiva y no transferible para usar el SDK, API o tooling conforme a la documentación, límites técnicos y plan o contrato aplicable.',
          licenseScope: 'commercial_b2b',
          allowsCommercialUse: true,
          transferable: false,
          installationLimit: 'Uso por las cuentas, proyectos, entornos o límites técnicos expresamente autorizados por el plan o contrato aplicable.',
          reverseEngineeringRestricted: true,
          modificationRestricted: true,
          redistributionRestricted: true,
          updatesProvided: true,
          supportLevel: 'contract_defined',
          thirdPartyComponents: true,
          openSourceNotice: 'El SDK o tooling puede incorporar componentes de terceros u open source sujetos a licencias y avisos separados que siguen vigentes para esos componentes.',
          warrantyDisclaimer: 'Salvo garantía comercial expresa, el SDK, API o tooling se entrega "tal cual" y según disponibilidad, con los límites permitidos por la ley y el contrato aplicable.',
          liabilityLimit: 'En la máxima medida permitida por la ley, no respondemos por daños indirectos, fallas de integración, pérdida de datos, lucro cesante o interrupciones derivadas del uso del SDK, API o tooling, salvo dolo o prohibición legal aplicable.',
          terminationTriggers: 'La licencia puede terminarse por incumplimiento material, abuso técnico, violación de límites de uso, redistribución no autorizada, impago o riesgo legal o de seguridad.',
          governingLaw: 'Según la jurisdicción indicada por el licenciante, la documentación contractual o el acuerdo comercial principal.'
        }
      }
    },
    {
      value: 'plugin_or_extension',
      label: 'Plugin o extensión',
      description: 'Escenario para extensiones, add-ons o módulos que complementan otra plataforma y dependen de compatibilidad, updates y restricciones de reempaquetado.',
      summary: [
        'Asume plugin o extensión ligada a otra plataforma.',
        'Refuerza compatibilidad, updates y redistribución restringida.',
        'Sirve para add-ons, extensiones, módulos y complementos.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        eula: {
          softwareType: 'plugin_extension',
          licenseGrant: 'Se concede una licencia limitada, revocable, no exclusiva y no transferible para instalar y usar el plugin o extensión únicamente junto con las plataformas compatibles y dentro del alcance autorizado.',
          licenseScope: 'per_account',
          allowsCommercialUse: true,
          transferable: false,
          installationLimit: 'Una cuenta, instalación o cantidad de sitios, workspaces o entornos compatibles según el plan o licencia aplicable.',
          reverseEngineeringRestricted: true,
          modificationRestricted: true,
          redistributionRestricted: true,
          updatesProvided: true,
          supportLevel: 'best_effort',
          thirdPartyComponents: true,
          openSourceNotice: 'El plugin o extensión puede depender de componentes de terceros, SDKs o módulos open source sujetos a licencias y avisos separados.',
          warrantyDisclaimer: 'Salvo garantía comercial expresa, el plugin o extensión se entrega "tal cual" y según disponibilidad, sin promesa absoluta de compatibilidad continua con toda plataforma o versión externa.',
          liabilityLimit: 'En la máxima medida permitida por la ley, no respondemos por daños indirectos, incompatibilidades, pérdida de datos o interrupciones derivadas del uso del plugin o extensión, salvo dolo o prohibición legal aplicable.',
          terminationTriggers: 'La licencia puede terminarse por incumplimiento material, redistribución no autorizada, manipulación indebida, uso abusivo o incompatibilidades contractuales o técnicas graves.',
          governingLaw: 'Según la jurisdicción indicada por el licenciante o por el acuerdo principal aplicable al plugin o extensión.'
        }
      }
    },
    {
      value: 'internal_desktop_software',
      label: 'Software desktop interno',
      description: 'Base para software de escritorio o local con instalación acotada, uso interno y soporte best effort o definido por contrato.',
      summary: [
        'Asume instalación local o desktop dentro de una organización.',
        'Limita la licencia a dispositivo, usuario o entorno autorizado.',
        'Útil para herramientas internas, software on-prem o workstation.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        eula: {
          softwareType: 'desktop',
          licenseGrant: 'Se concede una licencia limitada, revocable, no exclusiva y no transferible para instalar y usar el software en equipos o entornos autorizados conforme a este acuerdo y al contrato aplicable.',
          licenseScope: 'single_device',
          allowsCommercialUse: true,
          transferable: false,
          installationLimit: 'Los dispositivos, usuarios o estaciones de trabajo expresamente autorizados por el licenciante o por el contrato principal aplicable.',
          reverseEngineeringRestricted: true,
          modificationRestricted: true,
          redistributionRestricted: true,
          updatesProvided: false,
          supportLevel: 'best_effort',
          thirdPartyComponents: true,
          openSourceNotice: 'El software puede incluir componentes de terceros u open source sujetos a sus propias licencias y avisos aplicables.',
          warrantyDisclaimer: 'Salvo garantía comercial expresa, el software se entrega "tal cual" y según disponibilidad, en la máxima medida permitida por la ley aplicable.',
          liabilityLimit: 'En la máxima medida permitida por la ley, no respondemos por daños indirectos, pérdida de datos, lucro cesante o interrupciones derivadas del uso del software, salvo dolo o prohibición legal aplicable.',
          terminationTriggers: 'La licencia puede terminarse por incumplimiento material, copia o instalación no autorizada, uso fuera del alcance contratado, manipulación indebida o falta de pago cuando corresponda.',
          governingLaw: 'Según la jurisdicción indicada por el licenciante o el contrato principal aplicable al software.'
        }
      }
    }
  ],
  security: [
    {
      value: 'open_source_maintainer',
      label: 'Open source maintainer',
      description: 'Base para proyectos open source o mantenedores con disclosure coordinado, canal simple y restricciones fuertes sobre pruebas disruptivas.',
      summary: [
        'Asume reportes por email y/o página simple.',
        'Mantiene disclosure coordinado sin bug bounty formal.',
        'Útil para repos, librerías o proyectos públicos con recursos limitados.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        security: {
          reportChannel: 'both',
          reportEmail: '',
          reportUrl: '',
          scope: ['web_application', 'api', 'content'],
          safeHarborOffered: true,
          automatedTestingAllowed: true,
          denialOfServiceTestingAllowed: false,
          socialEngineeringAllowed: false,
          reportRequirements: [
            'Descripción clara del hallazgo y del impacto esperado',
            'Pasos de reproducción o prueba de concepto razonable',
            'Activos, URLs, endpoints o cuentas involucradas',
            'Información de contacto para seguimiento'
          ],
          acknowledgementTime: '5 días hábiles',
          statusUpdateTime: '15 días hábiles',
          disclosurePreference: 'coordinated',
          bugBountyOffered: false,
          bugBountyNotes: '',
          remediationGuidance: 'Priorizamos los reportes según severidad, impacto y complejidad, y podemos pedir tiempo razonable para investigar, corregir y coordinar el disclosure antes de cualquier publicación pública.',
          securityPracticesSummary: 'Aplicamos controles de acceso, revisión de dependencias, hardening razonable y medidas de seguridad acordes a la escala y recursos del proyecto.'
        }
      }
    },
    {
      value: 'saas_b2b_api',
      label: 'SaaS B2B con API',
      description: 'Escenario para producto SaaS con panel web, API y expectativas más claras de triage, updates y coordinación.',
      summary: [
        'Asume alcance sobre app web, API e integraciones.',
        'Permite testing automatizado de bajo volumen, pero no DoS ni social engineering.',
        'Útil para SaaS con developers, webhooks o superficie técnica más amplia.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        security: {
          reportChannel: 'both',
          reportEmail: '',
          reportUrl: '',
          scope: ['web_application', 'api', 'integrations', 'infrastructure'],
          safeHarborOffered: true,
          automatedTestingAllowed: true,
          denialOfServiceTestingAllowed: false,
          socialEngineeringAllowed: false,
          reportRequirements: [
            'Descripción clara del hallazgo y del impacto esperado',
            'Pasos de reproducción o prueba de concepto razonable',
            'Activos, URLs, endpoints o cuentas involucradas',
            'Información de contacto para seguimiento'
          ],
          acknowledgementTime: '3 días hábiles',
          statusUpdateTime: '10 días hábiles',
          disclosurePreference: 'coordinated',
          bugBountyOffered: false,
          bugBountyNotes: '',
          remediationGuidance: 'Priorizamos los reportes según severidad, exposición, explotabilidad y riesgo para clientes o integraciones, y coordinamos mitigación antes del disclosure público cuando corresponda.',
          securityPracticesSummary: 'Aplicamos controles de acceso, registros operativos, revisión de dependencias, segmentación razonable y medidas de hardening sobre aplicaciones, APIs e infraestructura expuesta.'
        }
      }
    },
    {
      value: 'startup_light_program',
      label: 'Startup con programa liviano',
      description: 'Base para equipo pequeño que quiere recibir reportes bien formados sin prometer bounty ni procesos pesados.',
      summary: [
        'Canal simple, safe harbor y reglas claras de testing.',
        'No admite DoS ni social engineering.',
        'Útil para startups o productos en crecimiento con capacidad de respuesta limitada.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        security: {
          reportChannel: 'email',
          reportEmail: '',
          reportUrl: '',
          scope: ['web_application', 'api'],
          safeHarborOffered: true,
          automatedTestingAllowed: true,
          denialOfServiceTestingAllowed: false,
          socialEngineeringAllowed: false,
          reportRequirements: [
            'Descripción clara del hallazgo y del impacto esperado',
            'Pasos de reproducción o prueba de concepto razonable',
            'Activos, URLs, endpoints o cuentas involucradas',
            'Información de contacto para seguimiento'
          ],
          acknowledgementTime: '5 días hábiles',
          statusUpdateTime: '15 días hábiles',
          disclosurePreference: 'silent_fix',
          bugBountyOffered: false,
          bugBountyNotes: '',
          remediationGuidance: 'Podemos necesitar tiempo razonable para validar, reproducir y corregir reportes antes de compartir detalles públicos o técnicos más amplios.',
          securityPracticesSummary: 'Aplicamos controles de acceso, registros operativos, gestión de dependencias y medidas razonables de hardening acordes al tamaño y madurez del producto.'
        }
      }
    },
    {
      value: 'enterprise_formal_process',
      label: 'Enterprise con proceso formal',
      description: 'Escenario para organización con proceso más formal, evidencia documental, coordinación más estructurada y eventual recompensa o reconocimiento.',
      summary: [
        'Asume canal dual, triage formal y updates más estructurados.',
        'Mantiene disclosure coordinado con documentación y evidencia.',
        'Útil para organizaciones con vendor review, compliance o seguridad más madura.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        security: {
          reportChannel: 'both',
          reportEmail: '',
          reportUrl: '',
          scope: ['web_application', 'api', 'mobile_app', 'infrastructure', 'integrations'],
          safeHarborOffered: true,
          automatedTestingAllowed: true,
          denialOfServiceTestingAllowed: false,
          socialEngineeringAllowed: false,
          reportRequirements: [
            'Descripción clara del hallazgo y del impacto esperado',
            'Pasos de reproducción o prueba de concepto razonable',
            'Activos, URLs, endpoints o cuentas involucradas',
            'Información de contacto para seguimiento'
          ],
          acknowledgementTime: '2 días hábiles',
          statusUpdateTime: '7 días hábiles',
          disclosurePreference: 'coordinated',
          bugBountyOffered: true,
          bugBountyNotes: 'Algunos hallazgos pueden ser elegibles para reconocimiento o recompensa, sujeto a severidad, alcance, validez y reglas específicas del programa.',
          remediationGuidance: 'Los reportes válidos se priorizan según severidad, exposición y explotabilidad. Podemos solicitar coordinación razonable, confidencialidad temporal y tiempo suficiente para corregir antes del disclosure.',
          securityPracticesSummary: 'Aplicamos controles de acceso, gestión de dependencias, registros operativos, hardening, revisión razonable de cambios y otras medidas técnicas y organizativas acordes al servicio.'
        }
      }
    }
  ],
  deletion: [
    {
      value: 'meta_connected_app',
      label: 'App conectada con Meta',
      description: 'Base para apps o integraciones conectadas con Meta/Facebook, con doble canal y nota clara sobre revocación de permisos.',
      summary: [
        'Asume conexión con Meta/Facebook y revocación de permisos.',
        'Pide email, identificador y recurso vinculado cuando corresponde.',
        'Útil para apps con login, páginas, cuentas publicitarias o integraciones Meta.'
      ],
      patch: {
        business: { type: 'mobile' },
        settings: { language: 'es' },
        deletion: {
          requestChannel: 'both',
          requestEmail: '',
          requestUrl: '',
          identityRequirements: [
            'Email de la cuenta o del usuario solicitante',
            'Nombre del perfil o identificador de usuario',
            'ID de cuenta publicitaria o recurso vinculado',
            'Breve descripción del pedido de eliminación'
          ],
          deletionScope: [
            'Datos de perfil o cuenta asociados al usuario',
            'Tokens o credenciales de acceso almacenadas por la aplicación',
            'Registros operativos vinculados al uso de la aplicación',
            'Configuraciones o preferencias guardadas'
          ],
          retentionExceptions: [
            'Registros necesarios para cumplir obligaciones legales o regulatorias',
            'Registros mínimos para seguridad, prevención de fraude o auditoría'
          ],
          responseTime: '10 días hábiles',
          completionTime: '30 días',
          hasMetaConnection: true,
          metaDisconnectInstructions: 'El usuario puede revocar permisos desde Meta/Facebook y además solicitar la eliminación por email o por la página de solicitud de borrado.'
        }
      }
    },
    {
      value: 'saas_user_accounts',
      label: 'SaaS con cuentas',
      description: 'Escenario para app web o SaaS con perfiles, preferencias, logs y tiempos razonables de respuesta y cierre.',
      summary: [
        'Asume cuentas de usuario y datos de perfil, configuración y logs.',
        'Usa verificación por email o identificador de cuenta.',
        'Sirve para paneles, productos SaaS y apps con login propio.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        deletion: {
          requestChannel: 'both',
          requestEmail: '',
          requestUrl: '',
          identityRequirements: [
            'Email de la cuenta o del usuario solicitante',
            'Nombre del perfil o identificador de usuario',
            'Breve descripción del pedido de eliminación'
          ],
          deletionScope: [
            'Datos de perfil o cuenta asociados al usuario',
            'Registros operativos vinculados al uso de la aplicación',
            'Configuraciones o preferencias guardadas'
          ],
          retentionExceptions: [
            'Registros necesarios para cumplir obligaciones legales o regulatorias',
            'Registros mínimos para seguridad, prevención de fraude o auditoría',
            'Información necesaria para resolver disputas o hacer cumplir acuerdos'
          ],
          responseTime: '10 días hábiles',
          completionTime: '30 días',
          hasMetaConnection: false,
          metaDisconnectInstructions: ''
        }
      }
    },
    {
      value: 'ecommerce_customer_account',
      label: 'E-commerce con cuenta de cliente',
      description: 'Base para comercio electrónico con perfiles de cliente, pedidos y excepciones de retención por consumo, impuestos y disputas.',
      summary: [
        'Asume datos de cuenta y cierta retención legal/comercial.',
        'Refuerza excepciones por obligaciones fiscales, fraude y disputas.',
        'Útil para tiendas con cuenta de cliente y pedidos asociados.'
      ],
      patch: {
        business: { type: 'ecommerce', country: 'Argentina' },
        settings: { language: 'es' },
        deletion: {
          requestChannel: 'both',
          requestEmail: '',
          requestUrl: '',
          identityRequirements: [
            'Email de la cuenta o del usuario solicitante',
            'Nombre del perfil o identificador de usuario',
            'Breve descripción del pedido de eliminación'
          ],
          deletionScope: [
            'Datos de perfil o cuenta asociados al usuario',
            'Configuraciones o preferencias guardadas',
            'Registros operativos vinculados al uso de la aplicación'
          ],
          retentionExceptions: [
            'Registros necesarios para cumplir obligaciones legales o regulatorias',
            'Registros mínimos para seguridad, prevención de fraude o auditoría',
            'Información necesaria para resolver disputas o hacer cumplir acuerdos'
          ],
          responseTime: '10 días hábiles',
          completionTime: '30 días',
          hasMetaConnection: false,
          metaDisconnectInstructions: ''
        }
      }
    },
    {
      value: 'lightweight_deletion_flow',
      label: 'Producto con baja sensibilidad',
      description: 'Escenario simple para productos o servicios con pocos datos, canal directo y alcance de borrado más acotado.',
      summary: [
        'Asume flujo liviano con pocas categorías de datos.',
        'Mantiene verificación y respuesta razonables sin complejidad extra.',
        'Útil para micrositios, apps pequeñas o herramientas con perfil de riesgo bajo.'
      ],
      patch: {
        business: { type: 'blog' },
        settings: { language: 'es' },
        deletion: {
          requestChannel: 'email',
          requestEmail: '',
          requestUrl: '',
          identityRequirements: [
            'Email de la cuenta o del usuario solicitante',
            'Breve descripción del pedido de eliminación'
          ],
          deletionScope: [
            'Datos de perfil o cuenta asociados al usuario',
            'Configuraciones o preferencias guardadas'
          ],
          retentionExceptions: [
            'Registros necesarios para cumplir obligaciones legales o regulatorias',
            'Registros mínimos para seguridad, prevención de fraude o auditoría'
          ],
          responseTime: '10 días hábiles',
          completionTime: '30 días',
          hasMetaConnection: false,
          metaDisconnectInstructions: ''
        }
      }
    }
  ],
  dpa: [
    {
      value: 'saas_b2b_eu',
      label: 'SaaS B2B con clientes UE',
      description: 'Controller-processor clásico con foco GDPR, subprocessors y transferencias documentadas.',
      summary: [
        'Asume cliente controller y proveedor processor.',
        'Activa scope UE, subprocessors y transferencias internacionales.',
        'Deja SCC/equivalentes marcados como probables y completa textos base más enterprise.'
      ],
      patch: {
        business: { type: 'saas', country: 'Germany' },
        settings: { language: 'es' },
        dpa: {
          counterpartyRole: 'controller',
          regulatoryScope: ['eu'],
          servicesDescription: 'Prestación SaaS B2B con hosting de cuentas, soporte operativo, automatización de flujos y procesamiento limitado a la ejecución del servicio contratado.',
          processingPurpose: 'Procesar datos personales por cuenta del cliente para prestar, asegurar, soportar y administrar el servicio SaaS contratado.',
          personalDataCategories: [
            'Datos de identificación y contacto',
            'Datos de cuenta o credenciales de acceso',
            'Datos de uso, eventos y registros técnicos'
          ],
          dataSubjectCategories: ['Usuarios finales del cliente', 'Empleados o contratistas del cliente'],
          subprocessorsUsed: true,
          subprocessorMethodology: 'Se seleccionan subprocessors con garantías razonables, revisión contractual y obligaciones de protección de datos alineadas con el servicio.',
          internationalTransfers: true,
          transferMechanism: 'Cuando corresponde, usamos cláusulas contractuales tipo SCC, salvaguardas equivalentes o controles regionales compatibles con la jurisdicción aplicable.',
          euSccRequired: true,
          assistanceCommitments: 'Brindamos asistencia razonable para solicitudes de titulares, evaluaciones de impacto y consultas regulatorias dentro del alcance del servicio y de la información disponible.',
          deletionReturnPeriod: 'Al finalizar el servicio, devolvemos o eliminamos los datos personales dentro de un plazo razonable, sujeto a retención legal y backups con ciclo controlado.',
          auditRights: 'Podemos proporcionar información razonable, respuestas documentadas, certificaciones o evidencia equivalente, sujeto a confidencialidad y límites operativos razonables.'
        }
      }
    },
    {
      value: 'saas_b2b_latam',
      label: 'SaaS B2B LATAM / Argentina',
      description: 'Proveedor regional con estructura processor simple y menos carga contractual UE.',
      summary: [
        'Mantiene la lógica controller-processor pero sin asumir scope UE.',
        'Deja transferencias internacionales desactivadas por default.',
        'Sirve como base para clientes AR/LATAM con vendor review más liviano.'
      ],
      patch: {
        business: { type: 'saas', country: 'Argentina' },
        settings: { language: 'es' },
        dpa: {
          counterpartyRole: 'controller',
          regulatoryScope: ['ar', 'latam'],
          servicesDescription: 'Prestación SaaS B2B para gestión operativa, soporte y procesamiento limitado a la prestación del servicio contratado.',
          processingPurpose: 'Procesar datos personales por cuenta del cliente para operar el servicio, brindar soporte y mantener su seguridad y disponibilidad.',
          personalDataCategories: [
            'Datos de identificación y contacto',
            'Datos de cuenta o credenciales de acceso',
            'Datos de uso, eventos y registros técnicos'
          ],
          dataSubjectCategories: ['Usuarios finales del cliente', 'Empleados o contratistas del cliente'],
          subprocessorsUsed: true,
          subprocessorMethodology: 'Se utilizan proveedores operativos con garantías razonables y obligaciones contractuales de protección de datos acordes al servicio.',
          internationalTransfers: false,
          transferMechanism: '',
          euSccRequired: false,
          assistanceCommitments: 'Brindamos asistencia razonable para solicitudes del cliente y consultas vinculadas al tratamiento en la medida compatible con el servicio.',
          deletionReturnPeriod: 'Al finalizar el servicio, los datos se devuelven o eliminan dentro de un plazo razonable, salvo retenciones legales o backups controlados.',
          auditRights: 'Podemos compartir información razonable, cuestionarios o evidencia documental sobre el tratamiento y las medidas de seguridad aplicables.'
        }
      }
    },
    {
      value: 'global_vendor_chain',
      label: 'Proveedor con cloud y subprocessors globales',
      description: 'Base para SaaS con hosting internacional, soporte distribuido y cadena real de vendors.',
      summary: [
        'Asume uso activo de subprocessors y accesos cross-border.',
        'Refuerza metodología de vendors, transferencias y evidencia de auditoría.',
        'Útil para SaaS con infraestructura global o soporte follow-the-sun.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        dpa: {
          counterpartyRole: 'controller',
          regulatoryScope: ['eu', 'us'],
          subprocessorsUsed: true,
          subprocessorMethodology: 'Se mantiene una cadena documentada de subprocessors críticos, con due diligence razonable, obligaciones contractuales y controles de cambio compatibles con el servicio.',
          internationalTransfers: true,
          transferMechanism: 'Las transferencias se cubren mediante cláusulas contractuales, salvaguardas equivalentes, evaluación razonable del proveedor y controles regionales cuando corresponda.',
          euSccRequired: true,
          breachNotificationTime: 'Sin demoras indebidas y dentro de un plazo razonable desde la confirmación del incidente, con coordinación adicional cuando el contrato principal lo exija.',
          auditRights: 'Podemos ofrecer cuestionarios, certificaciones, informes resumidos o evidencia equivalente, y evaluar pedidos de auditoría adicional sujetos a confidencialidad y razonabilidad operativa.'
        }
      }
    }
  ],
  ai: [
    {
      value: 'external_ai_saas',
      label: 'AI SaaS con proveedor externo',
      description: 'Asistente o generación con API/model provider de tercero y controles de mejora del producto.',
      summary: [
        'Marca sistemas visibles al usuario y providers externos.',
        'Asume uso para service improvement con opt-out disponible.',
        'Sirve para SaaS que consume modelos de terceros y guarda señales operativas.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        ai: {
          systemsUsed: ['chatbot_or_assistant', 'content_generation'],
          useCases: ['customer_support', 'drafting_or_generation'],
          userFacingAi: true,
          generatedContentLabeling: true,
          trainingDataUse: 'service_improvement',
          dataSources: ['customer_inputs', 'service_logs', 'feedback_signals'],
          personalDataInTraining: false,
          modelImprovementUses: ['quality_evaluation', 'safety_testing'],
          optOutAvailable: true,
          optOutMethod: 'Configuración de cuenta, soporte o canal contractual para clientes con restricciones de uso de datos.',
          retentionPeriod: 'Los datos vinculados a IA se retienen sólo por el tiempo razonablemente necesario para prestación, seguridad, soporte, evaluación o mejora del servicio.',
          thirdPartyProviders: ['third_party_model_api', 'cloud_infrastructure'],
          automatedDecisionMaking: false,
          humanReviewAvailable: true,
          sensitiveDataRestrictions: 'No pedimos ni recomendamos cargar datos sensibles salvo necesidad operativa clara, base legal suficiente y controles reforzados.',
          securityControls: 'Aplicamos minimización, controles de acceso, registros operativos y medidas razonables de seguridad sobre prompts, outputs y datos vinculados a IA.'
        }
      }
    },
    {
      value: 'no_training_internal_ai',
      label: 'IA interna sin training sobre datos de clientes',
      description: 'IA usada para soporte interno o productividad, sin entrenamiento ni mejora sobre datos de clientes.',
      summary: [
        'Marca uso no visible o parcialmente interno.',
        'Deja explícito no-training y sin opt-out asociado.',
        'Útil para equipos que usan IA como apoyo interno pero no reciclan prompts o logs para mejorar modelos.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        ai: {
          systemsUsed: ['internal_analytics_or_classification'],
          useCases: ['internal_analytics', 'operational_automation'],
          userFacingAi: false,
          generatedContentLabeling: false,
          trainingDataUse: 'no_training',
          dataSources: ['service_logs'],
          personalDataInTraining: false,
          modelImprovementUses: [],
          optOutAvailable: false,
          optOutMethod: '',
          retentionPeriod: 'Los registros vinculados a funciones de IA se conservan sólo por el tiempo necesario para operación, soporte y seguridad, sin reutilización para entrenamiento de modelos.',
          thirdPartyProviders: ['cloud_infrastructure'],
          automatedDecisionMaking: false,
          humanReviewAvailable: true,
          appealChannel: '',
          sensitiveDataRestrictions: 'Los flujos internos de IA no deben usarse con datos sensibles salvo autorización específica, base legal y controles reforzados.',
          securityControls: 'Se aplican minimización, acceso restringido y medidas razonables de seguridad sobre logs, inputs internos y outputs generados.'
        }
      }
    },
    {
      value: 'user_facing_human_review',
      label: 'Asistente visible con revisión humana',
      description: 'IA visible para usuarios, con soporte, generación y posibilidad de escalamiento humano.',
      summary: [
        'Activa experiencia visible, etiquetado y revisión humana.',
        'Sirve para productos con asistentes, drafting o ayuda contextual de cara al usuario.',
        'Deja un canal claro para soporte o revisión cuando la IA influye resultados.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        ai: {
          systemsUsed: ['chatbot_or_assistant', 'content_generation'],
          useCases: ['customer_support', 'drafting_or_generation'],
          userFacingAi: true,
          generatedContentLabeling: true,
          trainingDataUse: 'evaluation_only',
          dataSources: ['customer_inputs', 'feedback_signals'],
          personalDataInTraining: false,
          modelImprovementUses: ['quality_evaluation'],
          optOutAvailable: true,
          optOutMethod: 'Soporte, configuración de cuenta o canal contractual para limitar ciertos usos de evaluación o mejora.',
          retentionPeriod: 'Prompts y outputs se conservan sólo por el tiempo razonablemente necesario para soporte, seguridad, troubleshooting y evaluación controlada del servicio.',
          thirdPartyProviders: ['third_party_model_api', 'cloud_infrastructure'],
          automatedDecisionMaking: false,
          humanReviewAvailable: true,
          appealChannel: 'Email de soporte o privacidad para pedir revisión humana cuando corresponda.',
          sensitiveDataRestrictions: 'Se desalienta la carga de datos sensibles salvo necesidad clara, base legal y controles reforzados.',
          securityControls: 'Aplicamos minimización, controles de acceso, logging razonable y medidas de seguridad sobre prompts, outputs y señales asociadas a la experiencia de IA.'
        }
      }
    },
    {
      value: 'moderation_and_safety',
      label: 'Moderación y seguridad',
      description: 'IA usada para clasificación, moderación, fraude o seguridad, con revisión humana y canal de apelación cuando el caso lo requiere.',
      summary: [
        'Asume sistemas de clasificación o moderación con foco en seguridad.',
        'Activa revisión humana y canal de apelación por decisiones relevantes.',
        'Útil para abuso, fraude, moderación de contenido o riesgo operativo.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        ai: {
          systemsUsed: ['classification_or_moderation'],
          useCases: ['moderation_or_safety', 'internal_operations'],
          userFacingAi: false,
          generatedContentLabeling: false,
          trainingDataUse: 'evaluation_only',
          dataSources: ['customer_inputs', 'service_logs', 'feedback_signals'],
          personalDataInTraining: false,
          modelImprovementUses: ['quality_evaluation', 'safety_testing', 'abuse_monitoring'],
          optOutAvailable: false,
          optOutMethod: '',
          retentionPeriod: 'Los registros vinculados a moderación, fraude o seguridad se conservan sólo por el tiempo razonablemente necesario para investigación, soporte, seguridad y mejora controlada del servicio.',
          thirdPartyProviders: ['third_party_model_api', 'cloud_infrastructure', 'monitoring_or_safety_tooling'],
          automatedDecisionMaking: true,
          humanReviewAvailable: true,
          appealChannel: 'Email de soporte, privacidad o seguridad para solicitar revisión humana cuando una decisión automatizada afecte de forma relevante al usuario.',
          sensitiveDataRestrictions: 'Los flujos de moderación o seguridad deben minimizar datos sensibles y aplicar controles reforzados cuando el contexto requiera revisar contenido potencialmente sensible.',
          securityControls: 'Aplicamos minimización, controles de acceso, registros operativos y medidas razonables de seguridad sobre señales, eventos y resultados vinculados a moderación o seguridad.'
        }
      }
    },
    {
      value: 'marketing_content_generation',
      label: 'Generación de contenido marketing',
      description: 'IA usada para redactar campañas, copies, emails o contenido promocional, con proveedores externos y mejora acotada del producto.',
      summary: [
        'Asume generación de contenido con proveedores de modelos externos.',
        'Activa etiquetado y evaluación de calidad del output.',
        'Útil para campañas, emails, copies, captions o material promocional.'
      ],
      patch: {
        business: { type: 'saas' },
        settings: { language: 'es' },
        ai: {
          systemsUsed: ['content_generation'],
          useCases: ['drafting_or_generation'],
          userFacingAi: true,
          generatedContentLabeling: true,
          trainingDataUse: 'service_improvement',
          dataSources: ['customer_inputs', 'feedback_signals'],
          personalDataInTraining: false,
          modelImprovementUses: ['quality_evaluation', 'product_analytics'],
          optOutAvailable: true,
          optOutMethod: 'Configuración de cuenta, soporte o canal contractual para limitar determinados usos de evaluación o mejora del contenido generado.',
          retentionPeriod: 'Prompts, briefs y outputs vinculados a generación de contenido se conservan sólo por el tiempo razonablemente necesario para soporte, calidad, troubleshooting y mejora acotada del servicio.',
          thirdPartyProviders: ['third_party_model_api', 'cloud_infrastructure'],
          automatedDecisionMaking: false,
          humanReviewAvailable: true,
          appealChannel: '',
          sensitiveDataRestrictions: 'Se desaconseja cargar datos sensibles, secretos comerciales o información personal innecesaria en prompts o assets destinados a generación de contenido.',
          securityControls: 'Aplicamos minimización, controles de acceso y medidas razonables de seguridad sobre prompts, outputs, briefs y señales vinculadas a la generación de contenido.'
        }
      }
    }
  ]
};

function buildDocuments() {
  return {
  privacy: {
    label: 'Política de privacidad',
    description: 'Política de privacidad con regiones, datos, terceros, bases legales y advertencias Argentina-first.',
    basePath: 'privacy',
    generator: () => new globalThis.LegalGenerators.PrivacyPolicyGenerator(),
    sections: [
      {
        title: 'Negocio',
        description: 'Identidad principal del negocio o la app.',
        fields: commonBusinessFields()
      },
      {
        title: 'Contacto',
        description: 'Canales de privacidad y contacto que se muestran en el documento.',
        fields: commonContactFields()
      },
      {
        title: 'Operación y alcance de privacidad',
        description: 'Jurisdicción, regiones, audiencia, categorías de datos, bases legales y señales de cumplimiento.',
        fields: [
          selectField('operations.primaryJurisdiction', 'Jurisdicción principal', JURISDICTIONS, 'ar'),
          checkboxField('operations.sellRegions', 'Regiones operativas', REGIONS, ['ar']),
          booleanField('operations.childrenAudience', 'Audiencia infantil', 'Marcá esto sólo si el servicio está dirigido a menores o si trata datos de niños de forma intencional.', false),
          checkboxField('dataPractices.collectedData', 'Datos recolectados', DATA_OPTIONS, ['personal', 'usage', 'cookies']),
          checkboxField('dataPractices.thirdParties', 'Terceros', THIRD_PARTIES, ['analytics']),
          checkboxField('dataPractices.legalBases', 'Bases legales', LEGAL_BASES, ['contract']),
          checkboxField('compliance.requestedFrameworks', 'Foco de cumplimiento', COMPLIANCE, [])
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'privacy',
        business: values.business,
        contact: values.contact,
        operations: values.operations,
        dataPractices: values.dataPractices,
        compliance: values.compliance,
        settings: values.settings
      };
    }
  },
  terms: {
    label: 'Términos y condiciones',
    description: 'Términos del servicio con consumo, e-commerce, cuentas, pagos y disputas.',
    basePath: 'terms',
    generator: () => new globalThis.LegalGenerators.TermsGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y sitio.', fields: commonBusinessFields('ecommerce') },
      { title: 'Contacto', description: 'Canales comerciales y legales de contacto.', fields: commonContactFields() },
      {
        title: 'Operación',
        description: 'Jurisdicción y regiones de venta.',
        fields: [
          selectField('operations.primaryJurisdiction', 'Jurisdicción principal', JURISDICTIONS, 'ar'),
          checkboxField('operations.sellRegions', 'Regiones operativas', REGIONS, ['ar'])
        ]
      },
      {
        title: 'Servicio y comercio',
        description: 'Términos comerciales principales y modelo de cuentas.',
        fields: [
          selectField('terms.offeringType', 'Tipo de oferta', OFFERINGS, 'physical_goods'),
          booleanField('terms.hasAccounts', 'Cuentas de usuario', 'Los usuarios pueden crear cuentas o perfiles.', false),
          booleanField('terms.requiresRegistration', 'Registro obligatorio', 'Se requiere registro para el uso principal o para comprar.', false),
          booleanField('terms.allowsUserContent', 'Contenido generado por usuarios', 'Los usuarios pueden subir reseñas, comentarios o contenido similar.', false),
          booleanField('terms.pricesIncludeTaxes', 'Precios con impuestos incluidos', 'Típico para comercio orientado a consumidores en ARS/Argentina.', true),
          textField('terms.currency', 'Moneda principal', 'ARS'),
          textField('terms.paymentProvider', 'Proveedor de pago', 'Mercado Pago'),
          booleanField('terms.refundsOffered', 'Ofrecés devoluciones / reembolsos / cambios', 'Activá esto si ofrecés algún flujo de devolución o reembolso.', true),
          textField('terms.refundWindow', 'Plazo de devolución', '10 días'),
          textareaField('terms.refundConditions', 'Condiciones de devolución', 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.'),
          selectField('terms.returnShippingResponsibility', 'Responsable del envío de devolución', RETURN_SHIPPING, 'case_by_case'),
          booleanField('terms.warrantyOffered', 'Ofrecés garantía', 'Activá esto si aplican garantías sobre bienes físicos o servicios.', true),
          textareaField('terms.warrantyDetails', 'Detalle de la garantía', 'La garantía legal y cualquier remedio aplicable se interpretarán de forma compatible con la normativa de defensa del consumidor aplicable.')
        ]
      },
      {
        title: 'Reglas y legal',
        description: 'Restricciones, propiedad intelectual, suspensión, avisos, disputas y disclaimers adicionales.',
        fields: [
          checkboxField('terms.prohibitedActivities', 'Conductas prohibidas', PROHIBITED_ACTIVITIES, ['No usar el sitio para actividades ilegales.']),
          textField('terms.ipOwner', 'Titular de la propiedad intelectual', 'Mi proyecto'),
          booleanField('terms.ugcLicenseGranted', 'Licencia sobre contenido de usuarios', 'Si los usuarios envían reseñas o contenido, activá esto si querés una licencia de exhibición.', false),
          booleanField('terms.limitIndirectDamages', 'Limitar daños indirectos', 'Cláusula estándar de limitación de daños indirectos.', true),
          booleanField('terms.shippingDelayDisclaimer', 'Disclaimer por demoras de envío', 'Útil para bienes físicos y correos.', true),
          textareaField('terms.customDisclaimer', 'Disclaimer adicional', ''),
          booleanField('terms.maySuspendAccounts', 'Podés suspender cuentas o pedidos', 'Reservá derechos de suspensión o restricción por uso indebido.', true),
          textareaField('terms.terminationGrounds', 'Causales de terminación', 'Podemos suspender cuentas, pedidos o acceso por fraude, abuso, incumplimiento o riesgos operativos o legales.'),
          selectField('terms.changeNotification', 'Método de aviso de cambios', CHANGE_NOTIFICATION, 'both'),
          textField('terms.disputesForum', 'Foro o jurisdicción de disputas', 'Tribunales competentes de la Ciudad Autónoma de Buenos Aires'),
          selectField('terms.adrMethod', 'Resolución alternativa de disputas', ADR_OPTIONS, 'none')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'terms',
        business: values.business,
        contact: values.contact,
        operations: values.operations,
        terms: values.terms,
        settings: values.settings
      };
    }
  },
  cookies: {
    label: 'Política de cookies',
    description: 'Categorías de cookies, consentimiento, terceros, controles del navegador y alineación con privacidad.',
    basePath: 'cookies',
    generator: () => new globalThis.LegalGenerators.CookiesPolicyGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y sitio.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales de contacto y gestión para cookies.', fields: commonContactFields() },
      {
        title: 'Configuración de cookies',
        description: 'Categorías, terceros, consentimiento, retención y controles.',
        fields: [
          selectField('operations.primaryJurisdiction', 'Jurisdicción principal', JURISDICTIONS, 'ar'),
          checkboxField('operations.sellRegions', 'Regiones operativas', REGIONS, ['ar']),
          checkboxField('cookies.categories', 'Categorías de cookies', COOKIE_CATEGORIES, ['necessary', 'analytics']),
          checkboxField('cookies.thirdParties', 'Terceros relacionados con cookies', COOKIE_THIRD_PARTIES, ['analytics']),
          selectField('cookies.consentMode', 'Modo de consentimiento', COOKIE_CONSENT, 'banner'),
          textField('cookies.managementUrl', 'URL de gestión de cookies', ''),
          textareaField('cookies.browserControls', 'Controles del navegador o dispositivo', 'El usuario puede bloquear o eliminar cookies desde la configuración del navegador y revisar sus preferencias cuando el banner o el centro de preferencias esté disponible.'),
          textareaField('cookies.retentionPolicy', 'Nota de retención de cookies', 'Algunas cookies son de sesión y otras pueden persistir por más tiempo según la finalidad, la configuración técnica y las políticas del proveedor correspondiente.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'cookies',
        business: values.business,
        contact: values.contact,
        operations: values.operations,
        cookies: values.cookies,
        settings: values.settings
      };
    }
  },
  refund: {
    label: 'Política de devoluciones y reembolsos',
    description: 'Plazos de devolución, reembolsos, cambios, envíos, fallas y expectativas del consumidor.',
    basePath: 'refunds',
    generator: () => new globalThis.LegalGenerators.ReturnRefundPolicyGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y contexto de venta.', fields: commonBusinessFields('ecommerce') },
      { title: 'Contacto', description: 'Canales para solicitudes de devolución.', fields: commonContactFields() },
      {
        title: 'Reglas de devolución y reembolso',
        description: 'Plazos, condiciones, fallas, ventas digitales y excepciones.',
        fields: [
          selectField('refund.offeringType', 'Tipo de oferta', OFFERINGS, 'physical_goods'),
          booleanField('refund.acceptsReturns', 'Aceptás devoluciones o reembolsos', 'Activá esto para ventas a distancia o flujos operativos de devolución.', true),
          textField('refund.refundWindow', 'Plazo de reembolso', '10 días'),
          textField('refund.exchangeWindow', 'Plazo de cambio', '10 días'),
          textareaField('refund.returnConditions', 'Condiciones de devolución', 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.'),
          textField('refund.refundMethod', 'Método de reembolso', 'el mismo medio de pago original'),
          textField('refund.refundProcessingTime', 'Tiempo de procesamiento del reembolso', '10 días hábiles'),
          selectField('refund.returnShippingResponsibility', 'Responsable del envío de devolución', RETURN_SHIPPING, 'case_by_case'),
          textField('refund.returnRequestChannel', 'Canal para pedir la devolución', ''),
          textareaField('refund.nonReturnableItems', 'Productos no retornables (uno por línea)', 'Productos personalizados o hechos a medida\nProductos usados, dañados por mal uso o incompletos'),
          booleanField('refund.digitalGoodsFinal', 'Venta digital definitiva', 'Útil para descargas, licencias o accesos ya activados.', false),
          textareaField('refund.damagedItemsProcess', 'Proceso por producto dañado o incorrecto', 'Si el producto llega dañado, incorrecto o con fallas, pedimos que nos contactes con fotos y datos del pedido para revisar el caso.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'refund',
        business: values.business,
        contact: values.contact,
        refund: {
          ...values.refund,
          nonReturnableItems: normalizeLines(values.refund.nonReturnableItems)
        },
        settings: values.settings
      };
    }
  },
  disclaimer: {
    label: 'Disclaimer',
    description: 'Disclaimers modulares para enlaces, errores, salud, fitness, riesgos y reseñas.',
    basePath: 'disclaimer',
    generator: () => new globalThis.LegalGenerators.DisclaimerGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y sitio.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales de contacto y soporte.', fields: commonContactFields() },
      {
        title: 'Módulos de disclaimer',
        description: 'Elegí uno o más tipos de disclaimer y ajustá el lenguaje opcional.',
        fields: [
          checkboxField('disclaimer.categories', 'Tipos de disclaimer', DISCLAIMER_TYPES, ['errors_omissions', 'external_links', 'own_risk']),
          textareaField('disclaimer.professionalAdviceChannel', 'Nota sobre asesoramiento profesional', ''),
          textareaField('disclaimer.externalLinksPolicy', 'Política de enlaces externos', 'El servicio puede enlazar recursos o documentación de terceros. No controlamos ni garantizamos el contenido, disponibilidad o políticas de esos sitios externos.'),
          textareaField('disclaimer.affiliateDisclosure', 'Divulgación de afiliados o compensaciones', ''),
          textareaField('disclaimer.reviewMethodology', 'Metodología de reseñas', ''),
          textareaField('disclaimer.customRiskStatement', 'Nota de uso bajo propio riesgo', 'El uso de la aplicación, sus flujos, automatizaciones y materiales se realiza bajo exclusiva responsabilidad del usuario.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'disclaimer',
        business: values.business,
        contact: values.contact,
        disclaimer: values.disclaimer,
        settings: values.settings
      };
    }
  },
  security: {
    label: 'Política de seguridad',
    description: 'Disclosure responsable, safe harbor, alcance técnico, tiempos de respuesta y prácticas mínimas de seguridad.',
    basePath: 'security',
    generator: () => new globalThis.LegalGenerators.SecurityPolicyGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y activo principal.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales para recibir reportes de seguridad.', fields: commonContactFields() },
      {
        title: 'Disclosure y seguridad',
        description: 'Canales de reporte, alcance, reglas de testing, tiempos de respuesta y bounty opcional.',
        fields: [
          selectField('security.reportChannel', 'Canal de reporte', SECURITY_REPORT_CHANNELS, 'both'),
          textField('security.reportEmail', 'Email de seguridad', ''),
          textField('security.reportUrl', 'URL de reporte o formulario', ''),
          checkboxField('security.scope', 'Alcance', SECURITY_SCOPE, ['web_application', 'api']),
          booleanField('security.safeHarborOffered', 'Incluir safe harbor o buena fe', 'Aclara que la investigación responsable y dentro del alcance será tratada como autorizada.', true),
          booleanField('security.automatedTestingAllowed', 'Permitir pruebas automatizadas de bajo volumen', 'Marcá esto sólo si aceptás escaneos o requests automatizados que no degraden el servicio.', false),
          booleanField('security.denialOfServiceTestingAllowed', 'Permitir pruebas coordinadas de carga o DoS', 'No lo actives salvo que realmente quieras admitirlo con coordinación previa.', false),
          booleanField('security.socialEngineeringAllowed', 'Permitir ingeniería social coordinada', 'No lo actives salvo que aceptes phishing o pruebas similares aprobadas de antemano.', false),
          checkboxField('security.reportRequirements', 'Qué debe incluir el reporte', SECURITY_REPORT_REQUIREMENTS, ['Descripción clara del hallazgo y del impacto esperado', 'Pasos de reproducción o prueba de concepto razonable', 'Activos, URLs, endpoints o cuentas involucradas', 'Información de contacto para seguimiento']),
          textField('security.acknowledgementTime', 'Tiempo para acusar recibo', '3 días hábiles'),
          textField('security.statusUpdateTime', 'Tiempo para compartir actualizaciones', '10 días hábiles'),
          selectField('security.disclosurePreference', 'Preferencia de disclosure', SECURITY_DISCLOSURE, 'coordinated'),
          booleanField('security.bugBountyOffered', 'Ofrecés bug bounty o recompensas', 'Activá esto si existe recompensa, bounty o reconocimiento para algunos reportes.', false),
          textareaField('security.bugBountyNotes', 'Nota sobre bounty o reconocimiento', ''),
          textareaField('security.remediationGuidance', 'Nota sobre remediación o coordinación', 'Priorizamos los reportes según severidad, impacto y complejidad, y podemos pedir tiempo razonable para investigar y mitigar antes de cualquier disclosure público.'),
          textareaField('security.securityPracticesSummary', 'Resumen opcional de prácticas de seguridad', 'Aplicamos controles de acceso, registros operativos, revisión de dependencias y medidas razonables de hardening sobre infraestructura y aplicaciones expuestas.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'security',
        business: values.business,
        contact: values.contact,
        security: values.security,
        settings: values.settings
      };
    }
  },
  eula: {
    label: 'EULA / Licencia de uso',
    description: 'Licencia de usuario final para software, apps, SDKs o extensiones, con grant, restricciones, updates, soporte y responsabilidad.',
    basePath: 'eula',
    generator: () => new globalThis.LegalGenerators.EulaGenerator(),
    sections: [
      { title: 'Licenciante', description: 'Identidad del negocio o titular que licencia el software.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales de contacto legales o comerciales del licenciante.', fields: commonContactFields() },
      {
        title: 'Producto y licencia',
        description: 'Producto licenciado, tipo de software, grant principal y alcance de uso.',
        fields: [
          textField('eula.productName', 'Nombre del software o app', '', '', true),
          selectField('eula.softwareType', 'Tipo de software', EULA_SOFTWARE_TYPES, 'mobile_app'),
          textareaField('eula.licenseGrant', 'Redacción de la licencia', 'Se concede una licencia limitada, revocable, no exclusiva y no transferible para usar el software conforme a este acuerdo y al plan o suscripción contratada.'),
          selectField('eula.licenseScope', 'Alcance de la licencia', EULA_LICENSE_SCOPES, 'per_account'),
          booleanField('eula.allowsCommercialUse', 'Permitir uso comercial o empresarial', 'Activá esto si el software puede usarse en contextos comerciales dentro del plan o contrato aplicable.', true),
          booleanField('eula.transferable', 'La licencia puede transferirse', 'No lo actives salvo que realmente aceptes cesión o transferencia del derecho de uso.', false),
          textField('eula.installationLimit', 'Límite de instalación, cuenta o asientos', 'Una cuenta activa, un dispositivo por usuario o la cantidad de asientos contratada, según el plan aplicable.')
        ]
      },
      {
        title: 'Restricciones, soporte y terceros',
        description: 'Restricciones sobre ingeniería inversa, redistribución, actualizaciones, soporte y componentes externos.',
        fields: [
          booleanField('eula.reverseEngineeringRestricted', 'Restringir ingeniería inversa', 'Marcá esto si querés prohibir descompilación o derivación de código fuente salvo cuando la ley obligatoria disponga lo contrario.', true),
          booleanField('eula.modificationRestricted', 'Restringir modificaciones u obras derivadas', 'Marcá esto si querés limitar adaptaciones, forks o cambios al software salvo autorización expresa.', true),
          booleanField('eula.redistributionRestricted', 'Restringir redistribución o reempaquetado', 'Marcá esto si el usuario no puede revender, redistribuir o republicar el software.', true),
          booleanField('eula.updatesProvided', 'Se proveen updates o nuevas versiones', 'Desactivá esto sólo si querés dejar claro que no prometés releases futuros ni parches.', true),
          selectField('eula.supportLevel', 'Nivel de soporte', EULA_SUPPORT_LEVELS, 'commercial_support'),
          booleanField('eula.thirdPartyComponents', 'Hay componentes de terceros u open source', 'Activá esto si el producto incorpora librerías, SDKs o módulos sujetos a licencias separadas.', true),
          textareaField('eula.openSourceNotice', 'Nota sobre terceros u open source', 'El software puede incluir componentes de terceros u open source sujetos a sus propias licencias, avisos y condiciones aplicables.')
        ]
      },
      {
        title: 'Garantías, terminación y ley aplicable',
        description: 'As-is, responsabilidad, causales de terminación y ley o foro principal.',
        fields: [
          textareaField('eula.warrantyDisclaimer', 'Descargo de garantías', 'Salvo garantía comercial expresa, el software se entrega "tal cual" y según disponibilidad, en la máxima medida permitida por la ley aplicable.'),
          textareaField('eula.liabilityLimit', 'Limitación de responsabilidad', 'En la máxima medida permitida por la ley, no respondemos por daños indirectos, pérdida de datos, lucro cesante o interrupciones derivadas del uso del software, salvo dolo o prohibición legal aplicable.'),
          textareaField('eula.terminationTriggers', 'Supuestos de terminación o revocación', 'La licencia puede terminarse por incumplimiento material, uso no autorizado, falta de pago o violación de restricciones técnicas o legales del producto.'),
          textField('eula.governingLaw', 'Ley aplicable o foro principal', 'Según la jurisdicción indicada por el licenciante o el contrato principal aplicable al producto.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'eula',
        business: values.business,
        contact: values.contact,
        eula: values.eula,
        settings: values.settings
      };
    }
  },
  dpa: {
    label: 'DPA / Acuerdo de tratamiento de datos',
    description: 'Documento controller-processor para SaaS B2B con instrucciones, seguridad, subprocessors, transferencias y cierre del servicio.',
    basePath: 'dpa',
    generator: () => new globalThis.LegalGenerators.DataProcessingAgreementGenerator(),
    sections: [
      { title: 'Proveedor', description: 'Identidad del proveedor SaaS o processor.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales contractuales o de privacidad vinculados al DPA.', fields: commonContactFields() },
      {
        title: 'Partes y alcance',
        description: 'Contraparte, servicio, duración y categorías de datos/titulares.',
        fields: [
          textField('dpa.counterpartyName', 'Nombre de la contraparte', '', '', true),
          selectField('dpa.counterpartyRole', 'Rol de la contraparte', DPA_COUNTERPARTY_ROLES, 'controller'),
          checkboxField('dpa.regulatoryScope', 'Alcance regulatorio o regiones del cliente', DPA_REGULATORY_SCOPE, ['eu']),
          textareaField('dpa.servicesDescription', 'Descripción del servicio', 'Prestación SaaS B2B con gestión de cuentas, soporte operativo y procesamiento limitado a la prestación del servicio.'),
          textField('dpa.duration', 'Duración del tratamiento', 'Durante la vigencia del servicio y por el tiempo necesario para cierre, soporte y retenciones legales aplicables.'),
          textareaField('dpa.processingPurpose', 'Naturaleza y finalidad del tratamiento', 'Procesar datos personales por cuenta del cliente para prestar, asegurar, soportar y administrar el servicio contratado.'),
          checkboxField('dpa.personalDataCategories', 'Categorías de datos personales', DPA_DATA_CATEGORIES, ['Datos de identificación y contacto', 'Datos de cuenta o credenciales de acceso', 'Datos de uso, eventos y registros técnicos']),
          checkboxField('dpa.dataSubjectCategories', 'Categorías de titulares', DPA_SUBJECT_CATEGORIES, ['Usuarios finales del cliente', 'Empleados o contratistas del cliente'])
        ]
      },
      {
        title: 'Instrucciones y seguridad',
        description: 'Canales de instrucciones, confidencialidad, medidas de seguridad e incidentes.',
        fields: [
          textField('dpa.instructionsChannel', 'Canal para instrucciones documentadas', 'Email contractual, ticket formal o instrucciones emitidas por administradores autorizados del cliente.'),
          textareaField('dpa.confidentialityMeasures', 'Medidas de confidencialidad', 'Acceso restringido por necesidad de conocer, compromisos de confidencialidad y controles internos sobre personal autorizado.'),
          textareaField('dpa.securityMeasures', 'Medidas técnicas y organizativas', 'Controles de acceso, registros operativos, cifrado en tránsito, revisión de dependencias y medidas razonables de hardening.'),
          textField('dpa.breachNotificationTime', 'Plazo para notificar incidentes o brechas', 'Sin demoras indebidas y dentro de un plazo razonable desde la confirmación del incidente.')
        ]
      },
      {
        title: 'Subprocessors, transferencias y cierre',
        description: 'Uso de subencargados, transferencias internacionales, auditoría y eliminación o devolución de datos.',
        fields: [
          booleanField('dpa.subprocessorsUsed', 'Usás subprocessors o subencargados', 'Hosting, cloud, soporte o proveedores operativos que traten datos por tu cuenta.', true),
          selectField('dpa.subprocessorAuthorization', 'Modelo de autorización de subprocessors', DPA_SUBPROCESSOR_AUTHORIZATION, 'general_authorization'),
          textField('dpa.subprocessorObjectionWindow', 'Preaviso o ventana de objeción', 'Aviso razonable previo para cambios materiales de subprocessors, sujeto al contrato principal.'),
          textareaField('dpa.subprocessorMethodology', 'Criterio sobre subprocessors', 'Se seleccionan proveedores con garantías razonables y se les imponen obligaciones contractuales de protección de datos acordes al servicio.'),
          booleanField('dpa.internationalTransfers', 'Hay transferencias internacionales', 'Marcá esto si hay acceso, soporte, hosting o subprocessors fuera de la jurisdicción principal del cliente.', false),
          textareaField('dpa.transferMechanism', 'Mecanismo de transferencias', 'Cuando corresponde, usamos cláusulas contractuales, salvaguardas equivalentes o bases legales compatibles con la jurisdicción aplicable.'),
          textareaField('dpa.transferSupplementarySafeguards', 'Salvaguardas complementarias de transferencias', 'Podemos apoyarnos en regionalización, minimización, cifrado, segregación de accesos y evaluación razonable de vendors según el flujo aplicable.'),
          booleanField('dpa.euSccRequired', 'Puede requerirse SCC o cláusulas equivalentes', 'Útil para clientes UE/UK o evaluaciones de transferencias más formales.', false),
          textareaField('dpa.assistanceCommitments', 'Compromisos de asistencia', 'Brindamos asistencia razonable para solicitudes de titulares, evaluaciones de impacto y consultas regulatorias en la medida en que el servicio y la información disponible lo permitan.'),
          textareaField('dpa.deletionReturnPeriod', 'Plazo de devolución o eliminación', 'Al finalizar el servicio, devolvemos o eliminamos los datos personales dentro de un plazo razonable, salvo retención legal o backups de seguridad con ciclo controlado.'),
          textareaField('dpa.backupRetentionHandling', 'Tratamiento de backups al cierre', 'Las copias de seguridad residuales siguen su ciclo de retención y purga controlada, con acceso restringido y sin reutilización activa para operaciones ordinarias.'),
          selectField('dpa.auditMechanism', 'Mecanismo habitual de auditoría', DPA_AUDIT_MECHANISMS, 'questionnaire_and_certifications'),
          textField('dpa.auditNoticePeriod', 'Preaviso para auditoría', 'Preaviso razonable y coordinación previa, salvo urgencia contractual o legal.'),
          textareaField('dpa.auditRights', 'Enfoque de auditoría o información', 'Podemos proporcionar información razonable, respuestas documentadas, certificaciones o evidencia equivalente, sujeto a confidencialidad y límites operativos razonables.'),
          textField('dpa.governingLaw', 'Ley aplicable o referencia contractual', 'Según el acuerdo principal entre las partes y la jurisdicción aplicable al servicio.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'dpa',
        business: values.business,
        contact: values.contact,
        dpa: values.dpa,
        settings: values.settings
      };
    }
  },
  ai: {
    label: 'Política de IA y datos de entrenamiento',
    description: 'Transparencia sobre uso de IA, datasets, entrenamiento, proveedores, retención y revisión humana.',
    basePath: 'ai',
    generator: () => new globalThis.LegalGenerators.AiPolicyGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio o servicio que usa IA.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales de contacto para consultas o revisiones vinculadas a IA.', fields: commonContactFields() },
      {
        title: 'Sistemas y usos de IA',
        description: 'Qué sistemas de IA usás y para qué funciones del servicio.',
        fields: [
          checkboxField('ai.systemsUsed', 'Sistemas o funciones de IA', AI_SYSTEMS_USED, ['chatbot_or_assistant', 'content_generation']),
          checkboxField('ai.useCases', 'Casos de uso', AI_USE_CASES, ['customer_support', 'drafting_or_generation']),
          booleanField('ai.userFacingAi', 'La IA es visible para usuarios o clientes', 'Marcá esto si hay asistentes, recomendaciones, generación o scoring visible en la experiencia del usuario.', true),
          booleanField('ai.generatedContentLabeling', 'Indicás contenido generado o asistido por IA', 'Marcá esto si el servicio etiqueta o señala contenido generado o materialmente asistido por IA.', false)
        ]
      },
      {
        title: 'Entrenamiento y mejora',
        description: 'Si se usan datos para entrenamiento, fine-tuning, evaluación o mejora del producto.',
        fields: [
          selectField('ai.trainingDataUse', 'Uso de datos para entrenamiento o mejora', AI_TRAINING_DATA_USE, '', true),
          checkboxField('ai.dataSources', 'Fuentes de datos relacionadas', AI_DATA_SOURCES, ['customer_inputs', 'service_logs']),
          booleanField('ai.personalDataInTraining', 'Pueden intervenir datos personales en estos flujos', 'Marcá esto sólo si prompts, outputs, logs o datasets vinculados a IA pueden incluir datos personales.', false),
          checkboxField('ai.modelImprovementUses', 'Actividades específicas sobre datos de IA', AI_MODEL_IMPROVEMENT_USES, []),
          booleanField('ai.optOutAvailable', 'Existe opt-out o control para entrenamiento/mejora', 'Marcá esto si el usuario o cliente puede limitar ciertos usos para training, fine-tuning o product improvement.', false),
          textareaField('ai.optOutMethod', 'Método de opt-out o control', '')
        ]
      },
      {
        title: 'Proveedores, retención y salvaguardas',
        description: 'Model providers, retención, revisión humana y restricciones sobre datos sensibles.',
        fields: [
          textareaField('ai.retentionPeriod', 'Retención de prompts, outputs o datasets', 'Los datos vinculados a IA se retienen sólo por el tiempo razonablemente necesario para prestación, seguridad, soporte, evaluación o mejora, según el flujo aplicable.'),
          checkboxField('ai.thirdPartyProviders', 'Proveedores externos o model providers', AI_THIRD_PARTY_PROVIDERS, ['third_party_model_api', 'cloud_infrastructure']),
          booleanField('ai.automatedDecisionMaking', 'La IA puede influir decisiones automatizadas o scoring relevante', 'Marcá esto si la IA puede afectar ranking, moderación, acceso, fraude, priorización o decisiones con impacto relevante.', false),
          booleanField('ai.humanReviewAvailable', 'Existe revisión humana o escalamiento', 'Marcá esto si el usuario o el equipo pueden escalar casos y obtener revisión humana.', true),
          textField('ai.appealChannel', 'Canal para revisión o soporte', ''),
          textareaField('ai.sensitiveDataRestrictions', 'Restricciones sobre datos sensibles o de alto riesgo', 'No pedimos ni recomendamos cargar datos sensibles salvo que exista base legal, controles reforzados y necesidad operativa claramente justificada.'),
          textareaField('ai.securityControls', 'Controles de seguridad y minimización', 'Aplicamos minimización, controles de acceso, registros operativos y medidas razonables de seguridad sobre prompts, outputs y datos vinculados a IA.'),
          textareaField('ai.transparencyNotes', 'Nota adicional de transparencia', '')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'ai',
        business: values.business,
        contact: values.contact,
        ai: values.ai,
        settings: values.settings
      };
    }
  },
  deletion: {
    label: 'Instrucciones de eliminación de datos',
    description: 'Canal de eliminación, alcance, excepciones de retención y guía para cuentas conectadas con Meta.',
    basePath: 'data-deletion',
    generator: () => new globalThis.LegalGenerators.DataDeletionGenerator(),
    sections: [
      { title: 'Negocio', description: 'Identidad del negocio y sitio.', fields: commonBusinessFields('saas') },
      { title: 'Contacto', description: 'Canales de contacto para eliminación.', fields: commonContactFields() },
      {
        title: 'Flujo de eliminación',
        description: 'Canales de solicitud, datos requeridos, alcance de eliminación y tiempos de respuesta.',
        fields: [
          selectField('deletion.requestChannel', 'Canal de solicitud', DELETION_CHANNELS, 'both'),
          textField('deletion.requestEmail', 'Email para eliminación', ''),
          textField('deletion.requestUrl', 'URL de la página de eliminación', ''),
          checkboxField('deletion.identityRequirements', 'Requisitos de identidad', DELETION_IDENTITY, ['Email de la cuenta o del usuario solicitante']),
          checkboxField('deletion.deletionScope', 'Alcance de la eliminación', DELETION_SCOPE, ['Datos de perfil o cuenta asociados al usuario']),
          checkboxField('deletion.retentionExceptions', 'Excepciones de retención', DELETION_RETENTION, ['Registros necesarios para cumplir obligaciones legales o regulatorias']),
          textField('deletion.responseTime', 'Tiempo de respuesta', '10 días hábiles'),
          textField('deletion.completionTime', 'Tiempo de finalización', '30 días'),
          booleanField('deletion.hasMetaConnection', 'Conexión con Meta/Facebook', 'Activá esto si la app se conecta con cuentas de Meta o Facebook.', true),
          textareaField('deletion.metaDisconnectInstructions', 'Instrucciones para desconectar Meta', 'El usuario puede revocar permisos desde Meta y además pedir eliminación por email.')
        ]
      },
      outputFields()
    ],
    buildInput(values) {
      return {
        documentType: 'deletion',
        business: values.business,
        contact: values.contact,
        deletion: values.deletion,
        settings: values.settings
      };
    }
  }
  };
}

const appState = {
  documentType: 'privacy',
  previewFormat: 'html',
  lastGenerated: null,
  lastInput: null,
  isDirtySinceGenerate: false,
  formSeed: null,
  advisorRecommendation: null,
  publishedSnippets: null,
  suiteItems: [],
  suitePublishedUrls: [],
  guidedMode: false,
  tourOpen: false,
  tourStep: 0
};

const formEl = document.getElementById('generator-form');
const previewFrameEl = document.getElementById('preview-html');
const previewCodeEl = document.getElementById('preview-code');
const validationEl = document.getElementById('validation-box');
const statusEl = document.getElementById('document-status');
const summaryEl = document.getElementById('summary-box');
const documentSelectEl = document.getElementById('document-type');
const documentDescriptionEl = document.getElementById('document-description');
const firstRunBarEl = document.getElementById('first-run-bar');
const guidedModeToggleEl = document.getElementById('guided-mode-toggle');
const tourLaunchEl = document.getElementById('tour-launch');
const guidedPanelEl = document.getElementById('guided-panel');
const tourOverlayEl = document.getElementById('tour-overlay');
const loadConfigButtonEl = document.getElementById('load-config-button');
const loadConfigInputEl = document.getElementById('load-config-input');
const presetPanelEl = document.getElementById('preset-panel');
const advisorPanelEl = document.getElementById('advisor-panel');
const preparedPathEl = document.getElementById('prepared-path');
const copyHtmlSnippetEl = document.getElementById('copy-html-snippet');
const copyMarkdownSnippetEl = document.getElementById('copy-markdown-snippet');
const snippetPreviewEl = document.getElementById('snippet-preview');
const addToSuiteEl = document.getElementById('add-to-suite');
const publishSuiteEl = document.getElementById('publish-suite');
const clearSuiteEl = document.getElementById('clear-suite');
const suiteListEl = document.getElementById('suite-list');
const generateButtonEl = document.getElementById('generate-button');
const downloadHtmlEl = document.getElementById('download-html');
const downloadDocxEl = document.getElementById('download-docx');
const downloadMarkdownEl = document.getElementById('download-markdown');
const downloadTextEl = document.getElementById('download-text');
const downloadJsonEl = document.getElementById('download-json');
const connectGitHubEl = document.getElementById('connect-github');
const logoutGitHubEl = document.getElementById('logout-github');
const publishGitHubPagesEl = document.getElementById('publish-github-pages');
const githubRepoSelectEl = document.getElementById('github-repo-select');
const githubSessionStatusEl = document.getElementById('github-session-status');

let validationRequestId = 0;
let validationTimer = null;
const generatorCache = new Map();
const backendConfig = globalThis.__LEGAL_HUB_CONFIG__ || {};
const GH_SESSION_STORAGE_KEY = 'ppg_github_session';
const githubState = {
  backendEnabled: Boolean(backendConfig.backendBaseUrl),
  session: null,
  sessionToken: readStoredGitHubSessionToken(),
  repos: []
};

generateButtonEl.addEventListener('click', generateDocument);
downloadHtmlEl.addEventListener('click', () => downloadOutput('html'));
downloadDocxEl.addEventListener('click', () => downloadOutput('docx'));
downloadMarkdownEl.addEventListener('click', () => downloadOutput('markdown'));
downloadTextEl.addEventListener('click', () => downloadOutput('text'));
downloadJsonEl.addEventListener('click', downloadJson);
connectGitHubEl.addEventListener('click', connectGitHub);
logoutGitHubEl.addEventListener('click', logoutGitHub);
publishGitHubPagesEl.addEventListener('click', publishToGitHubPages);
copyHtmlSnippetEl.addEventListener('click', () => copySnippet('html'));
copyMarkdownSnippetEl.addEventListener('click', () => copySnippet('markdown'));
addToSuiteEl.addEventListener('click', addCurrentDocumentToSuite);
publishSuiteEl.addEventListener('click', publishLegalSuite);
clearSuiteEl.addEventListener('click', clearSuite);
githubRepoSelectEl.addEventListener('change', updatePublishControls);
loadConfigButtonEl.addEventListener('click', () => loadConfigInputEl.click());
loadConfigInputEl.addEventListener('change', loadExistingConfig);
guidedModeToggleEl.addEventListener('click', toggleGuidedMode);
tourLaunchEl.addEventListener('click', toggleTour);

for (const button of document.querySelectorAll('.format-button')) {
  button.addEventListener('click', () => {
    appState.previewFormat = button.dataset.format;
    for (const item of document.querySelectorAll('.format-button')) item.classList.remove('is-active');
    button.classList.add('is-active');
    refreshPreview();
  });
}

function init() {
  bootstrapOAuthSessionFromUrl();
  renderDocumentCards();
  renderDocumentSelect();
  renderPresetPanel();
  renderJurisdictionAdvisor();
  renderFirstRunState();
  renderForm();
  setPreviewPlaceholder('Generá un documento para ver la salida acá.');
  setExportState(false);
  setStatus('');
  renderSnippetState();
  renderSuiteState();
  renderTour();
  initGitHubPublish();
}

function renderDocumentCards() {
  const cards = document.getElementById('document-cards');
  cards.innerHTML = Object.entries(DOCUMENTS).map(([key, config]) => `
    <article class="doc-card">
      <span class="doc-tag">${key}</span>
      <h3>${config.label}</h3>
      <p>${config.description}</p>
      <button type="button" class="button button-secondary" data-open-doc="${key}">Usar este documento</button>
    </article>
  `).join('');

  cards.querySelectorAll('[data-open-doc]').forEach((button) => {
    button.addEventListener('click', () => {
      appState.documentType = button.dataset.openDoc;
      appState.formSeed = null;
      documentSelectEl.value = appState.documentType;
      renderPresetPanel();
      renderForm();
      document.getElementById('generator').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function renderDocumentSelect() {
  documentSelectEl.innerHTML = Object.entries(DOCUMENTS)
    .map(([key, config]) => `<option value="${key}">${config.label}</option>`)
    .join('');
  documentSelectEl.value = appState.documentType;
  documentSelectEl.addEventListener('change', () => {
    appState.documentType = documentSelectEl.value;
    appState.formSeed = null;
    renderPresetPanel();
    renderForm();
  });
}

function renderPresetPanel() {
  const presets = DOCUMENT_PRESETS[appState.documentType] || [];
  if (presets.length === 0) {
    presetPanelEl.className = 'preset-panel is-empty';
    presetPanelEl.innerHTML = '<p class="muted-copy">Este documento todavía no tiene presets específicos. Acá conviene completar el formulario manualmente y revisar los campos sensibles del documento antes de generar o publicar.</p>';
    return;
  }

  presetPanelEl.className = 'preset-panel';
  presetPanelEl.innerHTML = `
    <div class="field">
      <label for="document-preset">Escenario sugerido</label>
      <select id="document-preset">
        <option value="">Elegí un preset</option>
        ${presets.map((preset) => `<option value="${preset.value}">${preset.label}</option>`).join('')}
      </select>
      <span class="field-hint">Los presets precargan campos típicos del documento actual, pero después podés editar todo.</span>
    </div>
    <div class="preset-actions">
      <button type="button" class="button button-secondary button-disabled" id="apply-document-preset" disabled>Aplicar preset</button>
    </div>
    <div class="preset-summary" id="preset-summary"></div>
  `;

  const selectEl = presetPanelEl.querySelector('#document-preset');
  const applyButtonEl = presetPanelEl.querySelector('#apply-document-preset');
  const summaryEl = presetPanelEl.querySelector('#preset-summary');

  selectEl.addEventListener('change', () => {
    const preset = presets.find((item) => item.value === selectEl.value);
    if (!preset) {
      applyButtonEl.disabled = true;
      applyButtonEl.classList.add('button-disabled');
      summaryEl.className = 'preset-summary';
      summaryEl.innerHTML = '';
      return;
    }

    applyButtonEl.disabled = false;
    applyButtonEl.classList.remove('button-disabled');
    summaryEl.className = 'preset-summary is-visible';
    summaryEl.innerHTML = `
      <strong>${preset.label}</strong>
      <p class="muted-copy">${escapeHtml(preset.description)}</p>
      <ul>${preset.summary.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    `;
  });

  applyButtonEl.addEventListener('click', () => applyDocumentPreset(selectEl.value));
}


function renderFirstRunState() {
  firstRunBarEl.classList.toggle('is-guided', appState.guidedMode);
  guidedModeToggleEl.textContent = appState.guidedMode ? 'Ocultar modo guiado' : 'Activar modo guiado';
  guidedModeToggleEl.classList.toggle('button-primary', appState.guidedMode);
  guidedModeToggleEl.classList.toggle('button-secondary', !appState.guidedMode);
  tourLaunchEl.textContent = appState.tourOpen ? 'Cerrar tour' : 'Ver tour rápido';
}

function toggleGuidedMode() {
  appState.guidedMode = !appState.guidedMode;
  renderFirstRunState();
  renderGuidedPanel();
}

function toggleTour() {
  appState.tourOpen = !appState.tourOpen;
  appState.tourStep = 0;
  renderFirstRunState();
  renderTour();
}

function closeTour() {
  appState.tourOpen = false;
  appState.tourStep = 0;
  renderFirstRunState();
  renderTour();
}

function changeTourStep(direction) {
  const nextStep = appState.tourStep + direction;
  if (nextStep < 0) return;
  if (nextStep >= TOUR_STEPS.length) {
    closeTour();
    return;
  }
  appState.tourStep = nextStep;
  renderTour();
}

function renderTour() {
  clearTourHighlights();
  if (!appState.tourOpen) {
    tourOverlayEl.className = 'tour-overlay';
    tourOverlayEl.innerHTML = '';
    return;
  }

  const step = TOUR_STEPS[appState.tourStep];
  const target = step ? document.querySelector(step.selector) : null;
  if (target) {
    target.classList.add('tour-highlight');
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  tourOverlayEl.className = 'tour-overlay is-visible';
  tourOverlayEl.innerHTML = `
    <div class="tour-card">
      <div class="tour-card-top">
        <span class="panel-pill">Tour rápido</span>
        <span class="tour-progress">Paso ${appState.tourStep + 1} de ${TOUR_STEPS.length}</span>
      </div>
      <h3>${step.title}</h3>
      <p>${step.body}</p>
      <div class="tour-actions">
        <button type="button" class="button button-secondary ${appState.tourStep === 0 ? 'button-disabled' : ''}" id="tour-prev" ${appState.tourStep === 0 ? 'disabled' : ''}>Anterior</button>
        <button type="button" class="button button-secondary" id="tour-close">Cerrar</button>
        <button type="button" class="button button-primary" id="tour-next">${appState.tourStep === TOUR_STEPS.length - 1 ? 'Terminar' : 'Siguiente'}</button>
      </div>
    </div>
  `;

  tourOverlayEl.querySelector('#tour-prev')?.addEventListener('click', () => changeTourStep(-1));
  tourOverlayEl.querySelector('#tour-next')?.addEventListener('click', () => changeTourStep(1));
  tourOverlayEl.querySelector('#tour-close')?.addEventListener('click', closeTour);
}

function clearTourHighlights() {
  document.querySelectorAll('.tour-highlight').forEach((element) => element.classList.remove('tour-highlight'));
}

function renderGuidedPanel() {
  if (!appState.guidedMode) {
    guidedPanelEl.className = 'rail-card guided-panel is-hidden';
    guidedPanelEl.innerHTML = '';
    return;
  }

  const values = gatherFormValues();
  const flow = buildGuidedFlow(appState.documentType, values);
  if (!flow) {
    guidedPanelEl.className = 'rail-card guided-panel';
    guidedPanelEl.innerHTML = `
      <div class="guided-head">
        <div>
          <p class="eyebrow">Modo guiado</p>
          <h3>${DOCUMENTS[appState.documentType].label}</h3>
        </div>
        <button type="button" class="button button-secondary" id="guided-dismiss">Ocultar</button>
      </div>
      <p class="muted-copy">Esta primera versión del modo guiado acompaña mejor a <strong>Privacidad</strong>, <strong>Términos</strong> y <strong>Cookies</strong>. En este documento conviene seguir el formulario normal y usar el tour rápido si querés ubicarte mejor.</p>
    `;
    guidedPanelEl.querySelector('#guided-dismiss')?.addEventListener('click', toggleGuidedMode);
    return;
  }

  const completedSteps = flow.steps.filter((step) => step.done).length;
  const currentStep = flow.steps.find((step) => !step.done) || flow.steps[flow.steps.length - 1];

  guidedPanelEl.className = 'rail-card guided-panel';
  guidedPanelEl.innerHTML = `
    <div class="guided-head">
      <div>
        <p class="eyebrow">Modo guiado</p>
        <h3>${flow.title}</h3>
      </div>
      <button type="button" class="button button-secondary" id="guided-dismiss">Ocultar</button>
    </div>
    <p class="muted-copy">${flow.intro}</p>
    <div class="guided-progress">
      <strong>${completedSteps}/${flow.steps.length}</strong>
      <span>pasos ya encaminados</span>
    </div>
    <div class="guided-current-step">
      <strong>Siguiente foco</strong>
      <p>${currentStep.focus}</p>
    </div>
    <div class="guided-steps">
      ${flow.steps.map((step, index) => `
        <article class="guided-step ${step.done ? 'is-done' : step === currentStep ? 'is-current' : ''}">
          <div class="guided-step-top">
            <span class="guided-step-number">${index + 1}</span>
            <div>
              <strong>${step.title}</strong>
              <p>${step.description}</p>
            </div>
          </div>
          <ul>
            ${step.items.map((item) => `<li class="${item.done ? 'is-done' : ''}">${item.done ? 'Listo:' : 'Falta:'} ${escapeHtml(item.label)}</li>`).join('')}
          </ul>
        </article>
      `).join('')}
    </div>
  `;

  guidedPanelEl.querySelector('#guided-dismiss')?.addEventListener('click', toggleGuidedMode);
}

function buildGuidedFlow(documentType, values) {
  if (documentType === 'privacy') {
    const basics = [
      guidedItem('Nombre del proyecto o negocio', isFilled(values.business?.name)),
      guidedItem('URL del sitio o app', isFilled(values.business?.websiteUrl)),
      guidedItem('Email de contacto', isFilled(values.contact?.email)),
      guidedItem('Jurisdicción principal', isFilled(values.operations?.primaryJurisdiction))
    ];
    const reviews = [
      guidedItem('Regiones donde esperás usuarios o clientes', hasItems(values.operations?.sellRegions)),
      guidedItem('Terceros o proveedores que tocan datos', hasItems(values.dataPractices?.thirdParties)),
      guidedItem('Bases legales del tratamiento', hasItems(values.dataPractices?.legalBases))
    ];
    return {
      title: 'Privacidad para primera generación',
      intro: 'Si tu sitio o app recopila datos personales, esta guía te lleva al borrador mínimo sin perder de vista lo sensible antes de publicar.',
      steps: [
        {
          title: 'Confirmá que este documento es el correcto',
          description: 'Privacidad es el punto de partida normal si recolectás datos personales, de uso, cookies o contacto.',
          focus: 'Quedate en Política de privacidad si tu producto reúne datos de usuarios o visitantes.',
          done: appState.documentType === 'privacy',
          items: [guidedItem('Documento actual: Política de privacidad', appState.documentType === 'privacy')]
        },
        {
          title: 'Completá lo mínimo para el primer borrador',
          description: 'Con estos cuatro datos ya podés generar una base útil y legible.',
          focus: 'Terminá nombre, URL, contacto y jurisdicción para destrabar la generación.',
          done: basics.every((item) => item.done),
          items: basics
        },
        {
          title: 'Revisá lo sensible antes de publicar',
          description: 'Estos campos cambian bastante el alcance legal del texto.',
          focus: 'Antes de publicar, verificá proveedores, regiones y bases legales reales.',
          done: reviews.every((item) => item.done),
          items: reviews
        },
        {
          title: 'Generá y exportá',
          description: 'Cuando el borrador ya está al día, podés descargarlo o publicarlo.',
          focus: appState.lastGenerated && !appState.isDirtySinceGenerate ? 'La versión actual ya está lista para descargar o publicar.' : 'Usá Generar documento cuando termines los puntos mínimos.',
          done: Boolean(appState.lastGenerated && !appState.isDirtySinceGenerate),
          items: [
            guidedItem('Documento generado y actualizado', Boolean(appState.lastGenerated && !appState.isDirtySinceGenerate)),
            guidedItem('Descargar archivos o conectar GitHub para publicar', Boolean(appState.lastGenerated))
          ]
        }
      ]
    };
  }

  if (documentType === 'terms') {
    const basics = [
      guidedItem('Nombre del proyecto o negocio', isFilled(values.business?.name)),
      guidedItem('URL del sitio o app', isFilled(values.business?.websiteUrl)),
      guidedItem('Tipo de oferta o servicio', isFilled(values.terms?.offeringType)),
      guidedItem('Foro o jurisdicción para disputas', isFilled(values.terms?.disputesForum))
    ];
    return {
      title: 'Términos para empezar rápido',
      intro: 'Esta guía corta te ayuda a sacar una base usable para cuentas, pagos, acceso y reglas del servicio.',
      steps: [
        {
          title: 'Confirmá que necesitás términos',
          description: 'Suelen aplicar si vendés, prestás un servicio o tenés cuentas y reglas de uso.',
          focus: 'Usá Términos si querés ordenar relación comercial, cuentas, pagos o restricciones.',
          done: appState.documentType === 'terms',
          items: [guidedItem('Documento actual: Términos y condiciones', appState.documentType === 'terms')]
        },
        {
          title: 'Completá la base contractual mínima',
          description: 'Con estos datos ya se entiende qué ofrecés y bajo qué reglas principales.',
          focus: 'Definí qué ofrecés, a qué URL aplica y dónde se resuelven disputas.',
          done: basics.every((item) => item.done),
          items: basics
        },
        {
          title: 'Generá y revisá el borrador',
          description: 'Después podés afinar reembolsos, garantías, suspensión y pagos.',
          focus: appState.lastGenerated && !appState.isDirtySinceGenerate ? 'La versión actual ya está lista para revisar o exportar.' : 'Generá el documento cuando completes la base mínima.',
          done: Boolean(appState.lastGenerated && !appState.isDirtySinceGenerate),
          items: [guidedItem('Documento generado y actualizado', Boolean(appState.lastGenerated && !appState.isDirtySinceGenerate))]
        }
      ]
    };
  }

  if (documentType === 'cookies') {
    const basics = [
      guidedItem('URL del sitio o app', isFilled(values.business?.websiteUrl)),
      guidedItem('Categorías de cookies', hasItems(values.cookies?.categories)),
      guidedItem('Terceros relacionados', hasItems(values.cookies?.thirdParties)),
      guidedItem('Modo de consentimiento', isFilled(values.cookies?.consentMode))
    ];
    return {
      title: 'Cookies sin perderte en detalles',
      intro: 'Si usás analítica, embeds, ads o tecnologías similares, esta guía te deja una base clara para transparencia y control.',
      steps: [
        {
          title: 'Confirmá que necesitás política de cookies',
          description: 'Suele ser útil si tu sitio usa analítica, marketing, embeds o terceros que escriben cookies.',
          focus: 'Usá Cookies si querés explicar categorías, terceros y consentimiento.',
          done: appState.documentType === 'cookies',
          items: [guidedItem('Documento actual: Política de cookies', appState.documentType === 'cookies')]
        },
        {
          title: 'Definí el marco mínimo',
          description: 'Estas cuatro decisiones ya ordenan la base del documento.',
          focus: 'Marcá categorías, terceros y cómo manejás consentimiento o preferencias.',
          done: basics.every((item) => item.done),
          items: basics
        },
        {
          title: 'Generá y ajustá',
          description: 'Después podés refinar retención o URL de preferencias si aplica.',
          focus: appState.lastGenerated && !appState.isDirtySinceGenerate ? 'La política actual ya está lista para descargar o publicar.' : 'Generá el documento cuando completes lo mínimo.',
          done: Boolean(appState.lastGenerated && !appState.isDirtySinceGenerate),
          items: [guidedItem('Documento generado y actualizado', Boolean(appState.lastGenerated && !appState.isDirtySinceGenerate))]
        }
      ]
    };
  }

  return null;
}

function guidedItem(label, done) {
  return { label, done };
}

function isFilled(value) {
  return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
}

function hasItems(value) {
  return Array.isArray(value) ? value.length > 0 : isFilled(value);
}

const TOUR_STEPS = [
  {
    selector: '#doc-selector-card',
    title: 'Tipo de documento',
    body: 'Acá elegís qué clase de documento querés generar. Si venís por primera vez, privacidad suele ser el punto de partida más común.'
  },
  {
    selector: '#preset-card',
    title: 'Presets por escenario',
    body: 'Estos presets te dejan una base razonable según tu caso. No te bloquean nada: después podés editar todos los campos.'
  },
  {
    selector: '#generator-form',
    title: 'Formulario',
    body: 'Acá completás datos del negocio, del servicio y del documento. El modo guiado te marca qué terminar primero.'
  },
  {
    selector: '#download-actions',
    title: 'Generar y descargar',
    body: 'Primero generás el documento. Después podés descargarlo en varios formatos o sumarlo a una suite legal.'
  },
  {
    selector: '#github-publish-card',
    title: 'Publicar en GitHub Pages',
    body: 'Si querés una URL pública, conectá GitHub, elegí un repo y publicá bajo rutas seguras como legal/... sin tocar tu home.'
  }
];

function renderJurisdictionAdvisor() {
  advisorPanelEl.innerHTML = `
    <div class="advisor-grid">
      <div class="field">
        <label for="advisor-home-jurisdiction">Dónde está establecido el negocio</label>
        <select id="advisor-home-jurisdiction">
          ${JURISDICTIONS.map((option) => `<option value="${option.value}" ${option.value === 'ar' ? 'selected' : ''}>${option.label}</option>`).join('')}
        </select>
      </div>
      <div class="field">
        <label for="advisor-business-type">Qué tipo de producto o negocio tenés</label>
        <select id="advisor-business-type">
          ${BUSINESS_TYPES.map((option) => `<option value="${option.value}" ${option.value === 'saas' ? 'selected' : ''}>${option.label}</option>`).join('')}
        </select>
      </div>
      <div class="field full">
        <label>En qué regiones esperás usuarios o clientes</label>
        <div class="advisor-targets">
          ${REGIONS.map((option) => `
            <label class="checkbox-item">
              <input type="checkbox" name="advisor.targetRegions" value="${option.value}" ${option.value === 'ar' ? 'checked' : ''}>
              <span><strong>${option.label}</strong><small>${option.description || ''}</small></span>
            </label>
          `).join('')}
        </div>
      </div>
      <label class="checkbox-item">
        <input type="checkbox" id="advisor-california">
        <span><strong>¿Tenés usuarios o clientes en California?</strong><small>Esto ayuda a sugerir foco CCPA/CalOPPA en vez de asumirlo para todo Estados Unidos.</small></span>
      </label>
      <label class="checkbox-item">
        <input type="checkbox" id="advisor-children">
        <span><strong>¿El servicio apunta a menores o trata datos de chicos?</strong><small>Esto ayuda a sugerir enfoque tipo COPPA y lenguaje infantil reforzado.</small></span>
      </label>
    </div>
    <div class="advisor-actions">
      <button type="button" class="button button-secondary" id="advisor-run">Sugerir configuración</button>
      <button type="button" class="button button-primary button-disabled" id="advisor-apply" disabled>Aplicar sugerencia</button>
    </div>
    <div class="advisor-summary" id="advisor-summary"></div>
  `;

  advisorPanelEl.querySelector('#advisor-run').addEventListener('click', runJurisdictionAdvisor);
  advisorPanelEl.querySelector('#advisor-apply').addEventListener('click', applyJurisdictionRecommendation);
}

function renderForm() {
  const config = DOCUMENTS[appState.documentType];
  documentDescriptionEl.textContent = config.description;
  const defaults = createDefaults(appState.documentType, appState.formSeed);
  appState.lastGenerated = null;
  appState.lastInput = null;
  appState.isDirtySinceGenerate = false;
  appState.publishedSnippets = null;
  validationRequestId += 1;
  clearTimeout(validationTimer);

  formEl.innerHTML = config.sections.map((section, index) => `
    <section class="form-section">
      <p class="eyebrow">Sección ${index + 1}</p>
      <h3>${section.title}</h3>
      <p>${section.description}</p>
      <div class="field-grid">
        ${section.fields.map((field) => renderField(field, defaults)).join('')}
      </div>
    </section>
  `).join('');

  formEl.oninput = () => {
    preparedPathEl.textContent = buildPreparedPath();
    markDirtySinceGenerate();
    renderGuidedPanel();
    scheduleLiveValidation();
  };

  preparedPathEl.textContent = buildPreparedPath();
  validationEl.className = 'validation-box';
  validationEl.innerHTML = '';
  renderSummary();
  setPreviewPlaceholder('Generá un documento para ver la salida acá.');
  setExportState(false);
  setStatus('');
  renderAdvisorRecommendation();
  renderSnippetState();
  renderSuiteState();
  renderGuidedPanel();
  renderTour();
}

function applyDocumentPreset(presetValue) {
  const presets = DOCUMENT_PRESETS[appState.documentType] || [];
  const preset = presets.find((item) => item.value === presetValue);
  if (!preset) return;

  const currentValues = gatherFormValues();
  appState.formSeed = deepMerge(currentValues, preset.patch);
  renderForm();
  scheduleLiveValidation();
  setStatus(`Preset aplicado sobre ${DOCUMENTS[appState.documentType].label}: ${preset.label}. Revisá los campos y ajustá lo que no refleje tu operación real.`, 'success');
}

function renderField(field, defaults) {
  const value = getByPath(defaults, field.name) ?? field.value;
  if (field.type === 'textarea') {
    return `<div class="field full"><label>${renderFieldLabel(field)}</label><textarea name="${field.name}" placeholder="${field.placeholder || ''}">${escapeHtml(String(value ?? ''))}</textarea>${hint(field)}</div>`;
  }
  if (field.type === 'select') {
    return `<div class="field"><label>${renderFieldLabel(field)}</label><select name="${field.name}">${field.options.map((option) => `<option value="${option.value}" ${option.value === value ? 'selected' : ''}>${option.label}</option>`).join('')}</select>${hint(field)}</div>`;
  }
  if (field.type === 'checkbox-group') {
    const selected = Array.isArray(value) ? value : [];
    return `<div class="field full"><label>${renderFieldLabel(field)}</label><div class="checkbox-group">${field.options.map((option, index) => `
      <label class="checkbox-item">
        <input type="checkbox" name="${field.name}" value="${option.value}" ${selected.includes(option.value) ? 'checked' : ''}>
        <span><strong>${option.label}</strong><small>${option.description}</small></span>
      </label>
    `).join('')}</div>${hint(field)}</div>`;
  }
  if (field.type === 'boolean') {
    return `<div class="field full"><label>${renderFieldLabel(field)}</label><label class="checkbox-item">
      <input type="checkbox" name="${field.name}" ${value ? 'checked' : ''}>
      <span><strong>${value ? 'Activado' : 'Desactivado por default'}</strong><small>${field.description || ''}</small></span>
    </label></div>`;
  }
  return `<div class="field ${field.full ? 'full' : ''}"><label>${renderFieldLabel(field)}</label><input name="${field.name}" value="${escapeHtml(String(value ?? ''))}" placeholder="${field.placeholder || ''}">${hint(field)}</div>`;
}

function hint(field) {
  return field.hint ? `<span class="field-hint">${field.hint}</span>` : '';
}

function renderFieldLabel(field) {
  return `${field.label}${field.required ? '<span class="required-mark">*</span>' : ''}`;
}

function createDefaults(type, seed = null) {
  const common = {
    business: {
      name: 'Mi proyecto',
      type: type === 'privacy' ? 'saas' : 'ecommerce',
      websiteUrl: '',
      country: 'Argentina',
      address: ''
    },
    contact: {
      email: '',
      phone: '',
      pageUrl: ''
    },
    settings: { language: 'es' }
  };

  if (type === 'privacy') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'], childrenAudience: false },
      dataPractices: {
        collectedData: ['personal', 'usage', 'cookies'],
        thirdParties: ['analytics', 'cloud'],
        legalBases: ['contract', 'legitimate_interest']
      },
      compliance: { requestedFrameworks: [] }
    }, seed);
  }

  if (type === 'terms') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'ecommerce' },
      operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
      terms: {}
    }, seed);
  }

  if (type === 'cookies') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
      cookies: {}
    }, seed);
  }

  if (type === 'refund') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'ecommerce' },
      refund: {}
    }, seed);
  }

  if (type === 'disclaimer') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      disclaimer: {}
    }, seed);
  }

  if (type === 'security') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      security: {}
    }, seed);
  }

  if (type === 'eula') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      eula: {
        softwareType: 'mobile_app',
        licenseScope: 'per_account',
        reverseEngineeringRestricted: true,
        modificationRestricted: true,
        redistributionRestricted: true,
        updatesProvided: true,
        supportLevel: 'commercial_support',
        thirdPartyComponents: true
      }
    }, seed);
  }

  if (type === 'dpa') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      dpa: {
        regulatoryScope: ['eu']
      }
    }, seed);
  }

  if (type === 'ai') {
    return mergeSeed({
      ...common,
      business: { ...common.business, type: 'saas' },
      ai: {
        trainingDataUse: ''
      }
    }, seed);
  }

  return mergeSeed({
    ...common,
    business: { ...common.business, type: 'saas' },
    deletion: {}
  }, seed);
}

function mergeSeed(base, seed) {
  if (!seed || typeof seed !== 'object') return base;
  return deepMerge(base, seed);
}

function deepMerge(base, source) {
  if (Array.isArray(base) || Array.isArray(source)) {
    return Array.isArray(source) ? [...source] : Array.isArray(base) ? [...base] : source;
  }
  if (!base || typeof base !== 'object') return source;
  const output = { ...base };
  for (const [key, value] of Object.entries(source || {})) {
    if (value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object' && !Array.isArray(output[key])) {
      output[key] = deepMerge(output[key], value);
    } else {
      output[key] = Array.isArray(value) ? [...value] : value;
    }
  }
  return output;
}

async function loadExistingConfig(event) {
  const [file] = event.target.files || [];
  event.target.value = '';
  if (!file) return;

  try {
    const contents = await file.text();
    const parsed = JSON.parse(contents);
    const documentType = resolveInputDocumentType(parsed);
    if (!documentType || !DOCUMENTS[documentType]) {
      throw new Error('No pude detectar un tipo de documento soportado dentro del JSON.');
    }

    appState.documentType = documentType;
    appState.formSeed = normalizeLoadedSeed(documentType, parsed);
    documentSelectEl.value = documentType;
    renderPresetPanel();
    renderForm();
    scheduleLiveValidation();
    setStatus(`Configuración cargada para ${DOCUMENTS[documentType].label}. Revisá los campos y regenerá cuando quieras.`, 'success');
  } catch (error) {
    setStatus(`No pude cargar la configuración: ${error.message}`, 'error');
  }
}

function runJurisdictionAdvisor() {
  appState.advisorRecommendation = computeJurisdictionRecommendation(gatherAdvisorValues());
  renderAdvisorRecommendation();
}

function gatherAdvisorValues() {
  return {
    homeJurisdiction: advisorPanelEl.querySelector('#advisor-home-jurisdiction')?.value || 'ar',
    businessType: advisorPanelEl.querySelector('#advisor-business-type')?.value || 'saas',
    targetRegions: Array.from(advisorPanelEl.querySelectorAll('input[name="advisor.targetRegions"]:checked')).map((input) => input.value),
    californiaResidents: Boolean(advisorPanelEl.querySelector('#advisor-california')?.checked),
    childrenAudience: Boolean(advisorPanelEl.querySelector('#advisor-children')?.checked)
  };
}

function computeJurisdictionRecommendation(values) {
  const targetRegions = values.targetRegions.length > 0 ? values.targetRegions : [values.homeJurisdiction].filter(Boolean);
  const requestedFrameworks = [];
  const notes = [];

  if (values.californiaResidents) {
    requestedFrameworks.push('ccpa', 'caloppa');
    notes.push('Se recomienda reforzar derechos de privacidad para California.');
  } else if (targetRegions.includes('us')) {
    notes.push('Operar en Estados Unidos no activa CCPA automáticamente; si tenés usuarios en California, conviene revisar ese foco.');
  }

  if (values.childrenAudience) {
    requestedFrameworks.push('coppa');
    notes.push('Se recomienda lenguaje reforzado para privacidad infantil y revisión específica del flujo de datos de menores.');
  }

  if (values.homeJurisdiction === 'ca' || targetRegions.includes('ca')) {
    requestedFrameworks.push('pipeda');
    notes.push('Se recomienda reforzar lenguaje orientado a Canadá/PIPEDA.');
  }

  if (targetRegions.includes('eu') || targetRegions.includes('uk') || values.homeJurisdiction === 'eu' || values.homeJurisdiction === 'uk') {
    notes.push('Conviene revisar bases legales, derechos del usuario y transferencias con foco GDPR/UK GDPR.');
  }

  if (values.homeJurisdiction === 'ar' || targetRegions.includes('ar')) {
    notes.push('Se recomiendan defaults en español y lenguaje alineado a Argentina para privacidad, consumo y e-commerce.');
  }

  return {
    ...values,
    targetRegions,
    requestedFrameworks: [...new Set(requestedFrameworks)],
    language: values.homeJurisdiction === 'ar' || targetRegions.includes('ar') ? 'es' : 'en',
    countryLabel: jurisdictionLabel(values.homeJurisdiction),
    notes
  };
}

function renderAdvisorRecommendation() {
  const summaryEl = advisorPanelEl.querySelector('#advisor-summary');
  const applyButtonEl = advisorPanelEl.querySelector('#advisor-apply');
  if (!summaryEl || !applyButtonEl) return;

  if (!appState.advisorRecommendation) {
    summaryEl.classList.remove('is-visible');
    summaryEl.innerHTML = '';
    applyButtonEl.disabled = true;
    applyButtonEl.classList.add('button-disabled');
    return;
  }

  const recommendation = appState.advisorRecommendation;
  const bullets = [
    `Jurisdicción principal sugerida: ${jurisdictionLabel(recommendation.homeJurisdiction)}`,
    `Regiones operativas sugeridas: ${recommendation.targetRegions.map(jurisdictionLabel).join(', ') || 'Sin definir'}`,
    `Tipo de negocio sugerido: ${BUSINESS_TYPES.find((option) => option.value === recommendation.businessType)?.label || recommendation.businessType}`,
    `Idioma sugerido: ${recommendation.language === 'es' ? 'Español' : 'English'}`,
    recommendation.requestedFrameworks.length > 0
      ? `Marcos sugeridos: ${recommendation.requestedFrameworks.join(', ')}`
      : 'No hace falta activar marcos extra automáticamente con estas respuestas.'
  ];

  summaryEl.classList.add('is-visible');
  summaryEl.innerHTML = `
    <strong>Sugerencia actual</strong>
    <ul>${bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    ${recommendation.notes.length > 0 ? `<ul>${recommendation.notes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}
  `;
  applyButtonEl.disabled = false;
  applyButtonEl.classList.remove('button-disabled');
}

function applyJurisdictionRecommendation() {
  if (!appState.advisorRecommendation) return;

  const currentValues = gatherFormValues();
  const patch = buildRecommendationPatch(appState.documentType, appState.advisorRecommendation);
  appState.formSeed = deepMerge(currentValues, patch);
  renderForm();
  scheduleLiveValidation();
  setStatus(`Sugerencia aplicada sobre ${DOCUMENTS[appState.documentType].label}. Revisá los campos y ajustá lo que no refleje tu operación real.`, 'success');
}

function buildRecommendationPatch(documentType, recommendation) {
  const patch = {
    business: {
      type: recommendation.businessType,
      country: recommendation.countryLabel
    },
    settings: {
      language: recommendation.language
    }
  };

  if (['privacy', 'terms', 'cookies'].includes(documentType)) {
    patch.operations = {
      primaryJurisdiction: recommendation.homeJurisdiction,
      sellRegions: recommendation.targetRegions
    };
  }

  if (documentType === 'privacy') {
    patch.operations = {
      ...(patch.operations || {}),
      childrenAudience: recommendation.childrenAudience
    };
    patch.compliance = {
      requestedFrameworks: recommendation.requestedFrameworks
    };
  }

  return patch;
}

function jurisdictionLabel(value) {
  return JURISDICTIONS.find((option) => option.value === value)?.label || value;
}

function resolveInputDocumentType(input) {
  if (input && typeof input.documentType === 'string' && DOCUMENTS[input.documentType]) {
    return input.documentType;
  }
  if (input?.terms) return 'terms';
  if (input?.cookies) return 'cookies';
  if (input?.refund) return 'refund';
  if (input?.disclaimer) return 'disclaimer';
  if (input?.security) return 'security';
  if (input?.dpa) return 'dpa';
  if (input?.ai) return 'ai';
  if (input?.deletion) return 'deletion';
  return 'privacy';
}

function normalizeLoadedSeed(documentType, input) {
  const seed = { ...input };
  delete seed.documentType;
  if (documentType === 'refund' && Array.isArray(seed.refund?.nonReturnableItems)) {
    seed.refund = {
      ...seed.refund,
      nonReturnableItems: seed.refund.nonReturnableItems.join('\n')
    };
  }
  return seed;
}

async function generateDocument() {
  const values = gatherFormValues();
  const config = DOCUMENTS[appState.documentType];
  const generator = getGenerator(appState.documentType);
  const input = config.buildInput(values);
  appState.lastInput = input;
  preparedPathEl.textContent = buildPreparedPath();

  try {
    const validation = await generator.validate(input);
    renderValidation(validation);
    if (!validation.ok) {
      setPreviewPlaceholder('Resolvé los campos obligatorios antes de generar el documento.');
      appState.lastGenerated = null;
      setExportState(false);
      return;
    }
    const result = await generator.generate(input);
    appState.lastGenerated = result;
    appState.isDirtySinceGenerate = false;
    setExportState(true);
    setStatus('Documento generado correctamente. Si cambiás el formulario, vas a tener que regenerarlo para actualizar vista previa y descargas.', 'success');
    renderGuidedPanel();
    updatePublishControls();
    refreshPreview();
  } catch (error) {
    validationEl.className = 'validation-box is-visible';
    validationEl.innerHTML = `<div class="errors"><strong>Error de generación</strong><ul><li>${escapeHtml(error.message)}</li></ul></div>`;
    setPreviewPlaceholder('La generación falló.');
    appState.lastGenerated = null;
    setExportState(false);
    renderGuidedPanel();
    updatePublishControls();
  }
}

function renderValidation(validation) {
  const errors = validation.errors || [];
  const warnings = validation.warnings || [];
  if (errors.length === 0 && warnings.length === 0) {
    validationEl.className = 'validation-box';
    validationEl.innerHTML = '';
    return;
  }

  const highPriorityWarnings = warnings.filter((item) => isHighPriorityWarning(item));
  const contextualWarnings = warnings.filter((item) => !isHighPriorityWarning(item));

  validationEl.className = 'validation-box is-visible';
  validationEl.innerHTML = `
    ${errors.length ? `
      <div class="validation-group validation-errors">
        <strong>Ajustes obligatorios (${errors.length})</strong>
        <p class="validation-copy">Corregí estos puntos antes de generar o publicar una versión confiable.</p>
        <ul>${errors.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
    ` : ''}
    ${highPriorityWarnings.length ? `
      <div class="validation-group validation-warnings">
        <strong>Revisión prioritaria (${highPriorityWarnings.length})</strong>
        <p class="validation-copy">No bloquea la generación, pero conviene revisarlo porque puede cambiar el alcance legal o contractual del documento.</p>
        <ul>${highPriorityWarnings.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
    ` : ''}
    ${contextualWarnings.length ? `
      <div class="validation-group validation-notes">
        <strong>Notas de contexto (${contextualWarnings.length})</strong>
        <p class="validation-copy">Son aclaraciones útiles para pulir el texto final según tu operación real.</p>
        <ul>${contextualWarnings.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </div>
    ` : ''}
  `;
  if (errors.length === 0 && warnings.length === 0 && !appState.isDirtySinceGenerate) {
    setStatus('');
  }
}

function refreshPreview() {
  if (!appState.lastGenerated) return;
  if (appState.previewFormat === 'html') {
    previewFrameEl.srcdoc = appState.lastGenerated.html || '';
    previewFrameEl.classList.add('is-visible');
    previewCodeEl.classList.remove('is-visible');
    previewCodeEl.textContent = '';
    return;
  }

  previewFrameEl.classList.remove('is-visible');
  previewFrameEl.srcdoc = '';
  previewCodeEl.classList.add('is-visible');
  previewCodeEl.textContent = appState.lastGenerated[appState.previewFormat] || '';
}

function gatherFormValues() {
  const formData = new FormData(formEl);
  const values = {};
  const config = DOCUMENTS[appState.documentType];

  for (const section of config.sections) {
    for (const field of section.fields) {
      if (field.type === 'checkbox-group') {
        const all = formData.getAll(field.name);
        setByPath(values, field.name, all);
      } else if (field.type === 'boolean') {
        setByPath(values, field.name, formData.get(field.name) === 'on');
      } else {
        setByPath(values, field.name, formData.get(field.name) ?? '');
      }
    }
  }
  return values;
}

async function downloadOutput(format) {
  if (!appState.lastGenerated || !appState.lastInput) return;
  if (format === 'docx') {
    try {
      const blob = await buildDocxBlob();
      triggerBlobDownload(`${slugify(appState.lastInput.business?.name || 'legal-document')}-${DOCUMENTS[appState.documentType].basePath}.docx`, blob);
      setStatus('DOCX generado correctamente.', 'success');
    } catch (error) {
      setStatus(`No pude generar el DOCX: ${error.message}`, 'error');
    }
    return;
  }

  const ext = format === 'markdown' ? 'md' : format === 'text' ? 'txt' : 'html';
  const filename = `${slugify(appState.lastInput.business?.name || 'legal-document')}-${DOCUMENTS[appState.documentType].basePath}.${ext}`;
  triggerDownload(filename, appState.lastGenerated[format], format === 'html' ? 'text/html' : 'text/plain');
}

function downloadJson() {
  if (!appState.lastInput) return;
  const filename = `${slugify(appState.lastInput.business?.name || 'legal-document')}-${DOCUMENTS[appState.documentType].basePath}-input.json`;
  triggerDownload(filename, `${JSON.stringify(appState.lastInput, null, 2)}\n`, 'application/json');
}

function triggerDownload(filename, contents, type) {
  const blob = new Blob([contents], { type });
  triggerBlobDownload(filename, blob);
}

function triggerBlobDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function buildDocxBlob() {
  const docxApi = globalThis.LegalDocx;
  if (!docxApi) {
    throw new Error('La librería DOCX no está disponible en esta build.');
  }

  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docxApi;
  const title = `${DOCUMENTS[appState.documentType].label} - ${appState.lastInput.business?.name || 'Legal document'}`;
  const lines = String(appState.lastGenerated.markdown || '').split('\n');
  const children = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }

    if (trimmed.startsWith('# ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { after: 240 },
        children: [new TextRun(trimmed.replace(/^#\s+/, ''))]
      }));
      continue;
    }

    if (trimmed.startsWith('## ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        children: [new TextRun(trimmed.replace(/^##\s+/, ''))]
      }));
      continue;
    }

    if (trimmed.startsWith('### ')) {
      children.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 180, after: 120 },
        children: [new TextRun(trimmed.replace(/^###\s+/, ''))]
      }));
      continue;
    }

    if (trimmed.startsWith('- ')) {
      children.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { after: 80 },
        children: [new TextRun(trimmed.replace(/^- /, ''))]
      }));
      continue;
    }

    children.push(new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun(trimmed)]
    }));
  }

  const doc = new Document({
    creator: 'Legal Generator Hub',
    title,
    description: title,
    sections: [
      {
        properties: {},
        children
      }
    ]
  });

  return Packer.toBlob(doc);
}

function buildPreparedPath() {
  const businessName = document.querySelector('[name="business.name"]')?.value || 'your-project';
  return `https://YOUR-USER.github.io/YOUR-REPO/${buildRepoDocumentPath(appState.documentType, `${slugify(businessName)}-hash.html`)}`;
}

function buildRepoDocumentPath(documentType, filename) {
  return `legal/${DOCUMENTS[documentType].basePath}/${filename}`;
}

function setPreviewPlaceholder(message) {
  previewFrameEl.classList.remove('is-visible');
  previewFrameEl.srcdoc = '';
  previewCodeEl.classList.add('is-visible');
  previewCodeEl.textContent = message;
}

function setStatus(message, tone = 'info') {
  if (!message) {
    statusEl.className = 'status-banner';
    statusEl.textContent = '';
    return;
  }

  statusEl.className = `status-banner is-visible tone-${tone}`;
  statusEl.textContent = message;
}

function renderSnippetState() {
  const snippets = appState.publishedSnippets;
  if (!snippets) {
    snippetPreviewEl.textContent = 'Publicá un documento para generar snippets listos para copiar.';
    setSnippetButtons(false);
    return;
  }

  snippetPreviewEl.textContent = `HTML:
${snippets.html}

Markdown:
${snippets.markdown}`;
  setSnippetButtons(true);
}

function renderSuiteState() {
  if (appState.suiteItems.length === 0) {
    suiteListEl.innerHTML = '<p class="muted-copy">Todavía no agregaste documentos a la suite.</p>';
    setSuiteButtons(false, false);
    return;
  }

  const publishedUrlMap = new Map(appState.suitePublishedUrls.map((item) => [item.path, item.publicUrl]));

  suiteListEl.innerHTML = appState.suiteItems.map((item) => `
    <div class="suite-item">
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${escapeHtml(item.path)}</small>
        <small>Proyecto: ${escapeHtml(item.businessName)}</small>
        ${publishedUrlMap.has(item.path) ? `
          <small class="suite-url-label">URL publicada</small>
          <a class="suite-url" href="${escapeHtml(publishedUrlMap.get(item.path))}" target="_blank" rel="noopener">${escapeHtml(publishedUrlMap.get(item.path))}</a>
        ` : ''}
      </div>
      <div class="suite-item-actions">
        ${publishedUrlMap.has(item.path) ? `<button type="button" class="button button-secondary" data-copy-suite-url="${item.path}">Copiar URL</button>` : ''}
        ${publishedUrlMap.has(item.path) ? `<button type="button" class="button button-secondary" data-copy-suite-snippet="${item.path}">Copiar HTML</button>` : ''}
        ${publishedUrlMap.has(item.path) ? `<button type="button" class="button button-secondary" data-copy-suite-markdown="${item.path}">Copiar Markdown</button>` : ''}
        <button type="button" class="button button-secondary" data-remove-suite="${item.documentType}">Quitar</button>
      </div>
    </div>
  `).join('');

  suiteListEl.querySelectorAll('[data-remove-suite]').forEach((button) => {
    button.addEventListener('click', () => removeSuiteItem(button.dataset.removeSuite));
  });
  suiteListEl.querySelectorAll('[data-copy-suite-url]').forEach((button) => {
    button.addEventListener('click', () => copySuiteUrl(button.dataset.copySuiteUrl));
  });
  suiteListEl.querySelectorAll('[data-copy-suite-snippet]').forEach((button) => {
    button.addEventListener('click', () => copySuiteSnippet(button.dataset.copySuiteSnippet));
  });
  suiteListEl.querySelectorAll('[data-copy-suite-markdown]').forEach((button) => {
    button.addEventListener('click', () => copySuiteMarkdown(button.dataset.copySuiteMarkdown));
  });

  setSuiteButtons(true, githubState.backendEnabled && Boolean(githubState.session) && Boolean(githubRepoSelectEl.value));
}

function setSuiteButtons(hasItems, canPublishSuite) {
  clearSuiteEl.disabled = !hasItems;
  clearSuiteEl.classList.toggle('button-disabled', !hasItems);

  publishSuiteEl.disabled = !hasItems || !canPublishSuite;
  publishSuiteEl.classList.toggle('button-disabled', !hasItems || !canPublishSuite);
  publishSuiteEl.classList.toggle('button-primary', hasItems && canPublishSuite);
}

function setSnippetButtons(enabled) {
  for (const button of [copyHtmlSnippetEl, copyMarkdownSnippetEl]) {
    button.disabled = !enabled;
    button.classList.toggle('button-disabled', !enabled);
  }
}

function buildPublishedSnippets(url, label) {
  return {
    html: `<a href="${url}" target="_blank" rel="noopener">${label}</a>`,
    markdown: `[${label}](${url})`
  };
}

async function copySnippet(type) {
  if (!appState.publishedSnippets) return;
  const value = type === 'html' ? appState.publishedSnippets.html : appState.publishedSnippets.markdown;
  try {
    await navigator.clipboard.writeText(value);
    setStatus(`Snippet ${type === 'html' ? 'HTML' : 'Markdown'} copiado al portapapeles.`, 'success');
  } catch {
    setStatus('No pude copiar el snippet automáticamente. Podés copiarlo manualmente desde la caja de snippets.', 'warning');
  }
}

function setExportState(enabled) {
  for (const button of [downloadHtmlEl, downloadDocxEl, downloadMarkdownEl, downloadTextEl, downloadJsonEl]) {
    button.disabled = !enabled;
    button.classList.toggle('button-disabled', !enabled);
  }
  addToSuiteEl.disabled = !enabled;
  addToSuiteEl.classList.toggle('button-disabled', !enabled);
  updatePublishControls();
}

function renderSummary() {
  const values = gatherFormValues();
  const items = [
    ['Documento', DOCUMENTS[appState.documentType].label],
    ['Proyecto', values.business?.name || 'Sin definir'],
    ['Tipo', values.business?.type || 'Sin definir'],
    ['País', values.business?.country || 'Sin definir'],
    ['Idioma', values.settings?.language === 'en' ? 'English' : 'Español'],
    ['Sitio', values.business?.websiteUrl || 'Sin URL'],
    ['Contacto', values.contact?.email || values.contact?.pageUrl || 'Sin contacto']
  ];
  const documentSpecificItems = buildDocumentSpecificSummary(appState.documentType, values);

  const valuesHtml = items.map(([label, value]) => `
    <div class="summary-item">
      <strong>${escapeHtml(label)}</strong>
      <span>${escapeHtml(String(value))}</span>
    </div>
  `).join('');

  const documentSpecificHtml = documentSpecificItems.length ? `
    <div class="summary-copy">Este resumen destaca las decisiones más sensibles del documento actual antes de generar o publicar.</div>
    <div class="summary-grid summary-grid-extended">
      ${documentSpecificItems.map(([label, value]) => `
        <div class="summary-item">
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(String(value))}</span>
        </div>
      `).join('')}
    </div>
  ` : '';

  summaryEl.className = 'summary-box is-visible';
  summaryEl.innerHTML = `
    <h4>Resumen actual</h4>
    <div class="summary-grid">${valuesHtml}</div>
    ${documentSpecificHtml}
  `;
}

function isHighPriorityWarning(message) {
  const text = String(message || '').toLowerCase();
  return [
    'contradic',
    'training',
    'entrenamiento',
    'fine-tuning',
    'transfer',
    'scc',
    'subprocessor',
    'joint controller',
    'revisión humana',
    'review humana',
    'opt-out',
    'datos personales',
    'backups',
    'auditor'
  ].some((token) => text.includes(token));
}

function findOptionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value;
}

function findOptionLabels(options, values) {
  if (!Array.isArray(values) || values.length === 0) return [];
  return values.map((value) => findOptionLabel(options, value)).filter(Boolean);
}

function formatBooleanLabel(value, truthy = 'Sí', falsy = 'No') {
  return value ? truthy : falsy;
}

function joinSummaryValues(values) {
  return values.length ? values.join(', ') : 'Sin definir';
}

function buildDocumentSpecificSummary(documentType, values) {
  if (documentType === 'ai') {
    return [
      ['Uso de datos IA', findOptionLabel(AI_TRAINING_DATA_USE, values.ai?.trainingDataUse || '') || 'Sin definir'],
      ['Actividades sobre datos', joinSummaryValues(findOptionLabels(AI_MODEL_IMPROVEMENT_USES, values.ai?.modelImprovementUses))],
      ['Proveedores externos', joinSummaryValues(findOptionLabels(AI_THIRD_PARTY_PROVIDERS, values.ai?.thirdPartyProviders))],
      ['IA visible al usuario', formatBooleanLabel(values.ai?.userFacingAi)],
      ['Revisión humana', formatBooleanLabel(values.ai?.humanReviewAvailable)]
    ];
  }

  if (documentType === 'dpa') {
    return [
      ['Rol de la contraparte', findOptionLabel(DPA_COUNTERPARTY_ROLES, values.dpa?.counterpartyRole || '') || 'Sin definir'],
      ['Scope regulatorio', joinSummaryValues(findOptionLabels(DPA_REGULATORY_SCOPE, values.dpa?.regulatoryScope))],
      ['Subprocessors', formatBooleanLabel(values.dpa?.subprocessorsUsed)],
      ['Transferencias internacionales', formatBooleanLabel(values.dpa?.internationalTransfers)],
      ['Mecánica de auditoría', findOptionLabel(DPA_AUDIT_MECHANISMS, values.dpa?.auditMechanism || '') || 'Sin definir']
    ];
  }

  if (documentType === 'eula') {
    return [
      ['Producto licenciado', values.eula?.productName || 'Sin definir'],
      ['Tipo de software', findOptionLabel(EULA_SOFTWARE_TYPES, values.eula?.softwareType || '') || 'Sin definir'],
      ['Alcance de licencia', findOptionLabel(EULA_LICENSE_SCOPES, values.eula?.licenseScope || '') || 'Sin definir'],
      ['Uso comercial', formatBooleanLabel(values.eula?.allowsCommercialUse)],
      ['Soporte', findOptionLabel(EULA_SUPPORT_LEVELS, values.eula?.supportLevel || '') || 'Sin definir']
    ];
  }

  return [];
}

async function initGitHubPublish() {
  if (!githubState.backendEnabled) {
    githubSessionStatusEl.textContent = 'Backend no configurado todavía. Definí __LEGAL_HUB_CONFIG__.backendBaseUrl para habilitar GitHub.';
    connectGitHubEl.disabled = true;
    logoutGitHubEl.disabled = true;
    githubRepoSelectEl.disabled = true;
    publishGitHubPagesEl.disabled = true;
    publishGitHubPagesEl.classList.add('button-disabled');
    return;
  }

  connectGitHubEl.disabled = false;
  await refreshGitHubSession();
}

function backendUrl(path) {
  const base = String(backendConfig.backendBaseUrl || '').replace(/\/$/, '');
  return `${base}${path}`;
}

function readStoredGitHubSessionToken() {
  try {
    return localStorage.getItem(GH_SESSION_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function writeStoredGitHubSessionToken(value) {
  githubState.sessionToken = value || '';
  try {
    if (value) {
      localStorage.setItem(GH_SESSION_STORAGE_KEY, value);
    } else {
      localStorage.removeItem(GH_SESSION_STORAGE_KEY);
    }
  } catch {
    // ignore storage issues in restricted browsers
  }
}

function bootstrapOAuthSessionFromUrl() {
  const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
  if (!hash) return;

  const params = new URLSearchParams(hash);
  const sessionToken = params.get('gh_session');
  if (!sessionToken) return;

  writeStoredGitHubSessionToken(sessionToken);
  const cleanUrl = `${window.location.pathname}${window.location.search}`;
  history.replaceState(null, '', cleanUrl);
}

function backendFetch(path, init = {}) {
  const headers = new Headers(init.headers || {});
  if (githubState.sessionToken) {
    headers.set('authorization', `Bearer ${githubState.sessionToken}`);
  }
  return fetch(backendUrl(path), {
    ...init,
    credentials: 'include',
    headers
  });
}

async function refreshGitHubSession() {
  try {
    const response = await backendFetch('/api/github/session');
    const payload = await response.json();
    githubState.session = payload.authenticated ? payload.user : null;
    if (!payload.authenticated && githubState.sessionToken) {
      writeStoredGitHubSessionToken('');
    }
    renderGitHubSession();
    if (githubState.session) {
      await loadGitHubRepos();
    } else {
      githubState.repos = [];
      renderRepoOptions();
    }
  } catch {
    githubState.session = null;
    githubState.repos = [];
    githubSessionStatusEl.textContent = 'No se pudo conectar con el backend de GitHub.';
    renderRepoOptions();
  }
  updatePublishControls();
}

function renderGitHubSession() {
  if (!githubState.backendEnabled) return;
  if (githubState.session) {
    githubSessionStatusEl.textContent = `Conectado como ${githubState.session.login}.`;
    connectGitHubEl.disabled = true;
    logoutGitHubEl.disabled = false;
  } else {
    githubSessionStatusEl.textContent = 'Todavía no conectaste una cuenta de GitHub.';
    connectGitHubEl.disabled = false;
    logoutGitHubEl.disabled = true;
  }
  connectGitHubEl.classList.toggle('button-primary', !githubState.session);
  connectGitHubEl.classList.toggle('button-secondary', !!githubState.session);
  connectGitHubEl.classList.toggle('button-disabled', !!githubState.session);
  logoutGitHubEl.classList.toggle('button-primary', !!githubState.session);
  logoutGitHubEl.classList.toggle('button-secondary', !githubState.session);
  logoutGitHubEl.classList.toggle('button-disabled', !githubState.session);
}

async function loadGitHubRepos() {
  try {
    const response = await backendFetch('/api/github/repos');
    const payload = await response.json();
    githubState.repos = Array.isArray(payload.repos) ? payload.repos : [];
    renderRepoOptions();
  } catch {
    githubState.repos = [];
    githubRepoSelectEl.innerHTML = '<option value="">No se pudieron cargar repositorios</option>';
  }
}

function renderRepoOptions() {
  githubRepoSelectEl.innerHTML = '<option value="">Elegí un repositorio</option>';
  for (const repo of githubState.repos) {
    const option = document.createElement('option');
    option.value = repo.full_name;
    option.textContent = `${repo.full_name}${repoLabel(repo)}`;
    option.dataset.defaultBranch = repo.default_branch || 'main';
    githubRepoSelectEl.appendChild(option);
  }
  githubRepoSelectEl.disabled = !githubState.session || githubState.repos.length === 0;
}

function repoLabel(repo) {
  if (repo.pages_accessible) {
    return ' · Pages accesible';
  }
  if (repo.pages_active) {
    return ' · Pages activo';
  }
  return '';
}

function updatePublishControls() {
  const canPublish = githubState.backendEnabled
    && Boolean(githubState.session)
    && Boolean(githubRepoSelectEl.value)
    && Boolean(appState.lastGenerated)
    && !appState.isDirtySinceGenerate;

  publishGitHubPagesEl.disabled = !canPublish;
  publishGitHubPagesEl.classList.toggle('button-disabled', !canPublish);
  publishGitHubPagesEl.classList.toggle('button-primary', canPublish);
  setSuiteButtons(appState.suiteItems.length > 0, githubState.backendEnabled && Boolean(githubState.session) && Boolean(githubRepoSelectEl.value));
}

function connectGitHub() {
  if (!githubState.backendEnabled) return;
  const returnTo = encodeURIComponent(window.location.href);
  window.location.href = `${backendUrl('/api/github/start')}?return_to=${returnTo}`;
}

async function logoutGitHub() {
  if (!githubState.backendEnabled) return;
  await backendFetch('/api/github/logout', {
    method: 'POST'
  });
  writeStoredGitHubSessionToken('');
  githubState.session = null;
  githubState.repos = [];
  renderGitHubSession();
  renderRepoOptions();
  updatePublishControls();
}

async function publishToGitHubPages() {
  if (!githubState.backendEnabled || !appState.lastGenerated || !githubRepoSelectEl.value) {
    return;
  }

  publishGitHubPagesEl.disabled = true;
  publishGitHubPagesEl.textContent = 'Publicando...';

  try {
    const repo = githubState.repos.find((item) => item.full_name === githubRepoSelectEl.value);
    const html = appState.lastGenerated.html;
    const slug = slugify(appState.lastInput?.business?.name || 'legal-document');
    const hash = await shortHash(html);
    const path = buildRepoDocumentPath(appState.documentType, `${slug}-${hash}.html`);
    const response = await backendFetch('/api/github/publish', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        repo: githubRepoSelectEl.value,
        branch: repo?.default_branch || 'main',
        path,
        content: html,
        commitMessage: `Publish ${DOCUMENTS[appState.documentType].label}: ${slug}-${hash}.html`
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'No se pudo publicar el documento.');
    }
    preparedPathEl.textContent = payload.public_url || preparedPathEl.textContent;
    appState.publishedSnippets = buildPublishedSnippets(payload.public_url, DOCUMENTS[appState.documentType].label);
    renderSnippetState();
    setStatus(`Documento publicado. URL final: ${payload.public_url}`, 'success');
  } catch (error) {
    setStatus(`Error al publicar en GitHub Pages: ${error.message}`, 'error');
  } finally {
    publishGitHubPagesEl.textContent = 'Publicar en mi GitHub Pages';
    updatePublishControls();
  }
}

function addCurrentDocumentToSuite() {
  if (!appState.lastGenerated || !appState.lastInput || appState.isDirtySinceGenerate) return;

  const html = appState.lastGenerated.html;
  const businessName = appState.lastInput.business?.name || 'legal-document';
  const filenameBase = slugify(businessName);
  const documentType = appState.documentType;
  const label = DOCUMENTS[documentType].label;

  shortHash(html).then((hash) => {
    const filename = `${filenameBase}-${hash}.html`;
    const path = buildRepoDocumentPath(documentType, filename);
    const nextItem = {
      documentType,
      label,
      businessName,
      html,
      path
    };
    appState.suiteItems = [
      ...appState.suiteItems.filter((item) => item.documentType !== documentType),
      nextItem
    ].sort((left, right) => left.label.localeCompare(right.label, 'es'));
    appState.suitePublishedUrls = [];
    renderSuiteState();
    setStatus(`${label} agregado a la suite legal. Podés sumar más documentos o publicarlos juntos.`, 'success');
  }).catch(() => {
    setStatus('No pude preparar este documento para la suite legal.', 'error');
  });
}

function removeSuiteItem(documentType) {
  appState.suiteItems = appState.suiteItems.filter((item) => item.documentType !== documentType);
  appState.suitePublishedUrls = [];
  renderSuiteState();
  setStatus(appState.suiteItems.length > 0 ? 'Documento quitado de la suite legal.' : 'La suite legal quedó vacía.', 'info');
}

function clearSuite() {
  appState.suiteItems = [];
  appState.suitePublishedUrls = [];
  renderSuiteState();
  setStatus('La suite legal quedó vacía.', 'info');
}

async function publishLegalSuite() {
  if (!githubState.backendEnabled || !githubState.session || !githubRepoSelectEl.value || appState.suiteItems.length === 0) {
    return;
  }

  publishSuiteEl.disabled = true;
  publishSuiteEl.textContent = 'Publicando suite...';

  try {
    const repo = githubState.repos.find((item) => item.full_name === githubRepoSelectEl.value);
    const businessName = appState.suiteItems[0]?.businessName || appState.lastInput?.business?.name || 'legal-suite';
    const response = await backendFetch('/api/github/publish', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        repo: githubRepoSelectEl.value,
        branch: repo?.default_branch || 'main',
        files: appState.suiteItems.map((item) => ({
          path: item.path,
          content: item.html
        })),
        commitMessage: `Publish legal suite for ${businessName}`
      })
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || 'No se pudo publicar la suite legal.');
    }

    const publishedUrls = Array.isArray(payload.public_urls) ? payload.public_urls : [];
    appState.suitePublishedUrls = publishedUrls.map((item) => ({
      path: item.path,
      publicUrl: item.public_url
    }));
    const firstUrl = publishedUrls[0]?.public_url || '';
    if (firstUrl) {
      preparedPathEl.textContent = firstUrl;
      appState.publishedSnippets = buildPublishedSnippets(firstUrl, appState.suiteItems[0]?.label || 'Documento legal');
      renderSnippetState();
    }
    renderSuiteState();
    setStatus(`Suite legal publicada en un solo commit. Documentos: ${appState.suiteItems.map((item) => item.label).join(', ')}.`, 'success');
  } catch (error) {
    setStatus(`Error al publicar la suite legal: ${error.message}`, 'error');
  } finally {
    publishSuiteEl.textContent = 'Publicar suite legal';
    updatePublishControls();
  }
}

function scheduleLiveValidation() {
  clearTimeout(validationTimer);
  const currentRequestId = ++validationRequestId;
  validationTimer = setTimeout(async () => {
    const config = DOCUMENTS[appState.documentType];
    const generator = getGenerator(appState.documentType);
    const values = gatherFormValues();
    const input = config.buildInput(values);

    try {
      const validation = await generator.validate(input);
      if (currentRequestId !== validationRequestId) return;
      renderSummary();
      renderValidation(validation);
    } catch {
      if (currentRequestId !== validationRequestId) return;
      validationEl.className = 'validation-box is-visible';
      validationEl.innerHTML = '<div class="errors"><strong>Error de validación</strong><ul><li>No se pudo validar el formulario en tiempo real.</li></ul></div>';
    }
  }, 250);
}

function getGenerator(documentType) {
  if (!generatorCache.has(documentType)) {
    generatorCache.set(documentType, DOCUMENTS[documentType].generator());
  }
  return generatorCache.get(documentType);
}

function markDirtySinceGenerate() {
  if (!appState.lastGenerated || appState.isDirtySinceGenerate) {
    return;
  }

  appState.isDirtySinceGenerate = true;
  appState.lastGenerated = null;
  appState.publishedSnippets = null;
  setExportState(false);
  setPreviewPlaceholder('El formulario cambió desde la última generación. Volvé a generar el documento para actualizar la vista previa y las descargas.');
  renderSnippetState();
  setStatus('La versión generada quedó desactualizada. Volvé a generar el documento para que la vista previa y las descargas reflejen los cambios.', 'warning');
}

async function copySuiteUrl(path) {
  const match = appState.suitePublishedUrls.find((item) => item.path === path);
  if (!match) return;
  try {
    await navigator.clipboard.writeText(match.publicUrl);
    setStatus('URL publicada copiada al portapapeles.', 'success');
  } catch {
    setStatus('No pude copiar la URL automáticamente.', 'warning');
  }
}

async function copySuiteSnippet(path) {
  const match = appState.suitePublishedUrls.find((item) => item.path === path);
  const suiteItem = appState.suiteItems.find((item) => item.path === path);
  if (!match || !suiteItem) return;
  try {
    await navigator.clipboard.writeText(buildPublishedSnippets(match.publicUrl, suiteItem.label).html);
    setStatus(`Snippet HTML copiado para ${suiteItem.label}.`, 'success');
  } catch {
    setStatus('No pude copiar el snippet automáticamente.', 'warning');
  }
}

async function copySuiteMarkdown(path) {
  const match = appState.suitePublishedUrls.find((item) => item.path === path);
  const suiteItem = appState.suiteItems.find((item) => item.path === path);
  if (!match || !suiteItem) return;
  try {
    await navigator.clipboard.writeText(buildPublishedSnippets(match.publicUrl, suiteItem.label).markdown);
    setStatus(`Snippet Markdown copiado para ${suiteItem.label}.`, 'success');
  } catch {
    setStatus('No pude copiar el snippet automáticamente.', 'warning');
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function slugify(value) {
  return String(value || 'legal-document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'legal-document';
}

async function shortHash(value) {
  const bytes = new TextEncoder().encode(String(value));
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  const hash = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return hash.slice(0, 16);
}

function setByPath(target, path, value) {
  const parts = path.split('.');
  let current = target;
  while (parts.length > 1) {
    const part = parts.shift();
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  current[parts[0]] = value;
}

function getByPath(target, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], target);
}

function normalizeLines(value) {
  return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
}

function textField(name, label, value = '', hint = '', required = false) { return { type: 'text', name, label, value, hint, required }; }
function textareaField(name, label, value = '', hint = '', required = false) { return { type: 'textarea', name, label, value, hint, required }; }
function selectField(name, label, options, value, required = false) { return { type: 'select', name, label, options, value, required }; }
function checkboxField(name, label, options, value = [], required = false) { return { type: 'checkbox-group', name, label, options, value, required }; }
function booleanField(name, label, description, value = false, required = false) { return { type: 'boolean', name, label, description, value, required }; }

function outputFields() {
  return {
    title: 'Salida',
    description: 'Idioma, exportación y preparación para GitHub Pages.',
    fields: [
      selectField('settings.language', 'Idioma de salida', [{ value: 'es', label: 'Español' }, { value: 'en', label: 'English' }], 'es')
    ]
  };
}

function commonBusinessFields(defaultType = 'saas') {
  return [
    textField('business.name', 'Nombre del negocio o proyecto', 'Mi proyecto', '', true),
    selectField('business.type', 'Tipo de negocio', BUSINESS_TYPES, defaultType),
    textField('business.websiteUrl', 'URL del sitio o app', '', '', true),
    textField('business.country', 'País', 'Argentina'),
    textareaField('business.address', 'Dirección postal', '')
  ];
}

function commonContactFields() {
  return [
    textField('contact.email', 'Email de contacto', ''),
    textField('contact.phone', 'Teléfono', ''),
    textField('contact.pageUrl', 'Página de privacidad o contacto', '')
  ];
}

const BUSINESS_TYPES = [
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'blog', label: 'Blog / Contenido' },
  { value: 'saas', label: 'SaaS / App web' },
  { value: 'mobile', label: 'App móvil' },
  { value: 'nonprofit', label: 'ONG / nonprofit' }
];

const JURISDICTIONS = [
  { value: 'ar', label: 'Argentina' },
  { value: 'us', label: 'United States' },
  { value: 'eu', label: 'European Union' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'global', label: 'Global / custom' }
];
const REGIONS = JURISDICTIONS
  .filter((item) => item.value !== 'global')
  .concat([{ value: 'global', label: 'Global / custom' }])
  .map((item) => ({ ...item, description: `Aplica a ${item.label}` }));
const DATA_OPTIONS = [
  { value: 'personal', label: 'Personales', description: 'Nombres, emails, direcciones e identificadores de cuenta.' },
  { value: 'financial', label: 'Financieros', description: 'Pagos, facturación y datos de transacciones comerciales.' },
  { value: 'tax', label: 'Fiscales / facturación', description: 'CUIT, registros fiscales y datos contables.' },
  { value: 'identity', label: 'Identidad', description: 'Verificación o identidad comercial.' },
  { value: 'usage', label: 'Uso', description: 'Logs, analítica, eventos de interacción e IP.' },
  { value: 'cookies', label: 'Cookies', description: 'Cookies y tecnologías similares.' },
  { value: 'location', label: 'Ubicación', description: 'Ubicación aproximada o precisa.' },
  { value: 'profiling', label: 'Perfilado', description: 'Segmentación, scoring y decisiones automatizadas.' }
];
const THIRD_PARTIES = [
  { value: 'analytics', label: 'Analítica', description: 'Proveedores de analítica o medición.' },
  { value: 'advertising', label: 'Publicidad', description: 'Plataformas de anuncios, atribución o remarketing.' },
  { value: 'payment', label: 'Procesadores de pago', description: 'Pasarelas o procesadores de pago generales.' },
  { value: 'paypal_only', label: 'Sólo PayPal', description: 'Pagos manejados únicamente por PayPal.' },
  { value: 'shipping', label: 'Envíos / logística', description: 'Correos, couriers o fulfillment.' },
  { value: 'cloud', label: 'Cloud / hosting', description: 'Infraestructura cloud y hosting.' },
  { value: 'social', label: 'Integraciones sociales', description: 'Embeds, login social o APIs sociales.' },
  { value: 'email', label: 'Email / marketing', description: 'Email transaccional o automatización de marketing.' }
];
const LEGAL_BASES = [
  { value: 'contract', label: 'Contrato', description: 'Necesaria para prestar el servicio o completar una compra.' },
  { value: 'consent', label: 'Consentimiento', description: 'Consentimiento explícito del usuario.' },
  { value: 'legal_obligation', label: 'Obligación legal', description: 'Deberes fiscales, contables, regulatorios o legales.' },
  { value: 'legitimate_interest', label: 'Interés legítimo', description: 'Seguridad, prevención de fraude u operaciones limitadas.' }
];
const COMPLIANCE = [
  { value: 'ccpa', label: 'CCPA / CPRA', description: 'California privacy language.' },
  { value: 'coppa', label: 'COPPA', description: 'Children privacy compliance.' },
  { value: 'caloppa', label: 'CalOPPA', description: 'California online privacy baseline.' },
  { value: 'pipeda', label: 'PIPEDA', description: 'Canada privacy language.' }
];
const OFFERINGS = [
  { value: 'physical_goods', label: 'Productos físicos' },
  { value: 'digital_products', label: 'Productos digitales' },
  { value: 'services', label: 'Servicios' },
  { value: 'subscriptions', label: 'Suscripciones' }
];
const RETURN_SHIPPING = [
  { value: 'customer', label: 'Cliente' },
  { value: 'merchant', label: 'Comercio' },
  { value: 'case_by_case', label: 'Caso por caso' }
];
const CHANGE_NOTIFICATION = [
  { value: 'site_notice', label: 'Aviso en el sitio' },
  { value: 'email', label: 'Email' },
  { value: 'both', label: 'Ambos' }
];
const ADR_OPTIONS = [
  { value: 'none', label: 'Ninguna' },
  { value: 'mediation', label: 'Mediación' },
  { value: 'arbitration', label: 'Arbitraje' }
];
const PROHIBITED_ACTIVITIES = [
  { value: 'No usar el sitio para actividades ilegales.', label: 'Illegal use', description: 'No unlawful or fraudulent use.' },
  { value: 'No interferir con la seguridad, estabilidad o funcionamiento técnico del sitio.', label: 'Technical interference', description: 'No attacks, scraping abuse, or technical misuse.' },
  { value: 'No copiar, revender o explotar el contenido o productos fuera de lo permitido.', label: 'Resale / exploitation', description: 'No unauthorized resale or copying.' },
  { value: 'No enviar spam, contenido abusivo o información falsa.', label: 'Spam / abuse', description: 'No spam, abusive content, or false information.' }
];
const COOKIE_CATEGORIES = [
  { value: 'necessary', label: 'Necessary', description: 'Core technical operation and security.' },
  { value: 'preferences', label: 'Preferences', description: 'Preferences and user settings.' },
  { value: 'analytics', label: 'Analytics', description: 'Measurement and analytics.' },
  { value: 'advertising', label: 'Advertising', description: 'Remarketing and advertising.' }
];
const COOKIE_THIRD_PARTIES = [
  { value: 'analytics', label: 'Analytics', description: 'Analytics providers.' },
  { value: 'advertising', label: 'Advertising', description: 'Ad platforms or remarketing tools.' },
  { value: 'social', label: 'Social', description: 'Embeds or social login.' },
  { value: 'cloud', label: 'Infrastructure', description: 'Hosting/CDN/script delivery.' },
  { value: 'email', label: 'Email / marketing', description: 'Campaign and marketing tools.' }
];
const COOKIE_CONSENT = [
  { value: 'banner', label: 'Banner / preferences center' },
  { value: 'implied', label: 'Implied by continued use' },
  { value: 'essential_only', label: 'Essential only' }
];
const SECURITY_REPORT_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'form', label: 'Formulario / página' },
  { value: 'both', label: 'Email y página' }
];
const SECURITY_SCOPE = [
  { value: 'web_application', label: 'Aplicación web', description: 'Frontend, panel y páginas públicas.' },
  { value: 'api', label: 'API / endpoints', description: 'APIs, webhooks o endpoints para desarrolladores.' },
  { value: 'mobile_app', label: 'App móvil', description: 'Aplicaciones iOS, Android o wrappers móviles.' },
  { value: 'infrastructure', label: 'Infraestructura', description: 'Hosting, redes, storage y componentes de soporte.' },
  { value: 'integrations', label: 'Integraciones', description: 'Servicios conectados y terceros integrados.' },
  { value: 'content', label: 'Contenido / assets', description: 'Documentación, archivos estáticos o contenido sensible para seguridad.' }
];
const SECURITY_DISCLOSURE = [
  { value: 'coordinated', label: 'Disclosure coordinado' },
  { value: 'researcher_choice', label: 'Caso por caso' },
  { value: 'silent_fix', label: 'Corregir antes de divulgar' }
];
const SECURITY_REPORT_REQUIREMENTS = [
  { value: 'Descripción clara del hallazgo y del impacto esperado', label: 'Descripción e impacto', description: 'Qué pasa y por qué importa.' },
  { value: 'Pasos de reproducción o prueba de concepto razonable', label: 'Reproducción o PoC', description: 'Cómo reproducir el hallazgo sin exagerar riesgo.' },
  { value: 'Activos, URLs, endpoints o cuentas involucradas', label: 'Activos afectados', description: 'Qué activos o superficies están involucrados.' },
  { value: 'Información de contacto para seguimiento', label: 'Contacto de seguimiento', description: 'Cómo continuar la coordinación del caso.' }
];
const EULA_SOFTWARE_TYPES = [
  { value: 'desktop', label: 'Software de escritorio', description: 'Aplicación instalable para desktop, workstation o entorno local.' },
  { value: 'mobile_app', label: 'App móvil', description: 'Aplicación iOS, Android o wrapper móvil equivalente.' },
  { value: 'web_app', label: 'Web app / SaaS', description: 'Interfaz web, cuenta alojada o software accesible online.' },
  { value: 'sdk_api', label: 'SDK / API / tooling', description: 'SDK, librería, API o herramientas para desarrolladores.' },
  { value: 'plugin_extension', label: 'Plugin / extensión', description: 'Extensión, add-on o módulo que complementa otra plataforma.' }
];
const EULA_LICENSE_SCOPES = [
  { value: 'personal_internal', label: 'Uso personal o interno', description: 'Uso personal, individual o interno dentro de una organización.' },
  { value: 'commercial_b2b', label: 'Uso comercial B2B', description: 'Uso empresarial o comercial conforme al plan contratado.' },
  { value: 'single_device', label: 'Un dispositivo o instalación', description: 'La licencia queda atada a un dispositivo o instalación específica.' },
  { value: 'per_account', label: 'Por cuenta o usuario', description: 'La licencia depende de la cuenta o usuario habilitado.' },
  { value: 'per_seat', label: 'Por asiento o cantidad contratada', description: 'La licencia depende de asientos, seats o cantidad contratada.' }
];
const EULA_SUPPORT_LEVELS = [
  { value: 'none', label: 'Sin soporte comprometido', description: 'No hay obligación de soporte más allá de la disponibilidad general.' },
  { value: 'best_effort', label: 'Best effort', description: 'Se intenta asistir y mantener el producto sin SLA fuerte.' },
  { value: 'commercial_support', label: 'Soporte comercial', description: 'Existe soporte sujeto a plan, suscripción o contrato.' },
  { value: 'contract_defined', label: 'Definido por contrato', description: 'El nivel de soporte se remite a un contrato u order form separado.' }
];
const DPA_COUNTERPARTY_ROLES = [
  { value: 'controller', label: 'Controller / cliente' },
  { value: 'processor', label: 'Processor / proveedor tercero' },
  { value: 'joint_controller', label: 'Joint controller' }
];
const DPA_REGULATORY_SCOPE = [
  { value: 'eu', label: 'UE / GDPR', description: 'Clientes, usuarios o tratamiento con foco GDPR / EEE.' },
  { value: 'uk', label: 'UK / UK GDPR', description: 'Clientes o tratamiento con foco UK GDPR.' },
  { value: 'us', label: 'Estados Unidos', description: 'Relación contractual o tratamiento con foco EE.UU.' },
  { value: 'ar', label: 'Argentina', description: 'Relación contractual o tratamiento con foco Argentina.' },
  { value: 'global', label: 'Global / custom', description: 'Cobertura contractual más general o multinacional.' }
];
const DPA_DATA_CATEGORIES = [
  { value: 'Datos de identificación y contacto', label: 'Identificación y contacto', description: 'Nombres, emails, cargos o identificadores comerciales.' },
  { value: 'Datos de cuenta o credenciales de acceso', label: 'Cuenta y acceso', description: 'Usuarios, cuentas, roles, credenciales o tokens ligados al servicio.' },
  { value: 'Datos de uso, eventos y registros técnicos', label: 'Uso y logs', description: 'Eventos, métricas, logs, IP y registros técnicos del uso del servicio.' },
  { value: 'Datos comerciales o de soporte del cliente', label: 'Datos comerciales o soporte', description: 'Tickets, mensajes, estados de servicio o información operativa del cliente.' },
  { value: 'Datos importados o cargados por el cliente', label: 'Datos cargados por el cliente', description: 'Contenido, archivos o registros que el cliente sube al servicio.' }
];
const DPA_SUBJECT_CATEGORIES = [
  { value: 'Usuarios finales del cliente', label: 'Usuarios finales', description: 'Personas usuarias del producto o servicio del cliente.' },
  { value: 'Empleados o contratistas del cliente', label: 'Equipo del cliente', description: 'Staff, operadores, administradores o contratistas del cliente.' },
  { value: 'Prospectos o contactos comerciales del cliente', label: 'Prospectos o leads', description: 'Leads, contactos de ventas o relaciones comerciales del cliente.' },
  { value: 'Clientes o usuarios autenticados del cliente', label: 'Clientes autenticados', description: 'Cuentas o usuarios registrados del cliente.' }
];
const DPA_SUBPROCESSOR_AUTHORIZATION = [
  { value: 'general_authorization', label: 'Autorización general con aviso', description: 'Se permiten subprocessors con aviso razonable y eventual derecho de objeción.' },
  { value: 'specific_approval', label: 'Aprobación específica', description: 'Cada nuevo subprocessor requiere aprobación o consentimiento puntual.' },
  { value: 'contract_defined', label: 'Lo define el contrato principal', description: 'El modelo exacto se remite al MSA, DPA principal o anexo comercial.' }
];
const DPA_AUDIT_MECHANISMS = [
  { value: 'questionnaire_and_certifications', label: 'Cuestionarios y certificaciones', description: 'Vendor review basado en respuestas, certificaciones y evidencia documental.' },
  { value: 'remote_review', label: 'Revisión remota', description: 'Intercambio coordinado de evidencia o revisión documental remota.' },
  { value: 'onsite_limited', label: 'Onsite limitado', description: 'Auditoría onsite excepcional, acotada y sujeta a resguardos de confidencialidad.' },
  { value: 'contract_defined', label: 'Definido por contrato', description: 'La mecánica exacta se remite al contrato principal o apéndice negociado.' }
];
const AI_SYSTEMS_USED = [
  { value: 'chatbot_or_assistant', label: 'Chatbot o asistente', description: 'Asistentes conversacionales, soporte guiado o helpdesk asistido por IA.' },
  { value: 'content_generation', label: 'Generación de contenido', description: 'Texto, resúmenes, emails, imágenes u otros outputs generativos.' },
  { value: 'ranking_or_recommendation', label: 'Ranking o recomendaciones', description: 'Priorización, matching o recomendaciones personalizadas.' },
  { value: 'classification_or_moderation', label: 'Clasificación o moderación', description: 'Etiquetado, moderación, fraude o triage automatizado.' },
  { value: 'analytics_or_forecasting', label: 'Analítica o predicción', description: 'Predicción, scoring, forecasting o análisis de comportamiento.' }
];
const AI_USE_CASES = [
  { value: 'customer_support', label: 'Soporte al cliente', description: 'Respuestas, ayuda contextual o soporte operativo.' },
  { value: 'drafting_or_generation', label: 'Redacción o generación', description: 'Borradores, resúmenes, respuestas o contenido generado.' },
  { value: 'search_and_retrieval', label: 'Búsqueda y retrieval', description: 'Búsqueda semántica, knowledge base o recuperación contextual.' },
  { value: 'moderation_or_safety', label: 'Moderación o seguridad', description: 'Abuso, fraude, detección de riesgo o seguridad.' },
  { value: 'internal_operations', label: 'Operación interna', description: 'Backoffice, soporte interno, QA o flujos internos.' }
];
const AI_TRAINING_DATA_USE = [
  { value: '', label: 'Elegí una opción' },
  { value: 'no_training', label: 'No se usa para entrenamiento' },
  { value: 'evaluation_only', label: 'Sólo evaluación o safety review' },
  { value: 'service_improvement', label: 'Mejora del producto o del modelo acotado' },
  { value: 'model_training', label: 'Entrenamiento o fine-tuning más amplio' }
];
const AI_DATA_SOURCES = [
  { value: 'customer_inputs', label: 'Inputs del cliente o usuario', description: 'Prompts, formularios, archivos o contenido provisto por el usuario.' },
  { value: 'service_logs', label: 'Logs y telemetría del servicio', description: 'Eventos, métricas, logs u observabilidad técnica.' },
  { value: 'feedback_signals', label: 'Feedback explícito', description: 'Thumbs up/down, calificaciones, correcciones o reportes.' },
  { value: 'public_or_licensed_data', label: 'Datos públicos o licenciados', description: 'Datasets públicos, licenciados o de terceros.' },
  { value: 'synthetic_or_test_data', label: 'Datos sintéticos o de prueba', description: 'Datos sintéticos, test fixtures o datasets de evaluación.' }
];
const AI_MODEL_IMPROVEMENT_USES = [
  { value: 'quality_evaluation', label: 'Evaluación de calidad', description: 'Benchmarking, QA o revisión de performance.' },
  { value: 'safety_testing', label: 'Pruebas de seguridad', description: 'Abuso, red teaming o seguridad del sistema.' },
  { value: 'fine_tuning', label: 'Fine-tuning', description: 'Ajuste o calibración de modelos o prompts.' },
  { value: 'model_training', label: 'Entrenamiento amplio', description: 'Entrenamiento o ajuste más amplio del modelo con datasets o señales relevantes.' },
  { value: 'abuse_monitoring', label: 'Abuso o monitoreo', description: 'Detección de abuso, fraude o monitoreo de riesgo operativo.' },
  { value: 'product_analytics', label: 'Analítica del producto', description: 'Mejoras operativas, UX o producto.' }
];
const AI_THIRD_PARTY_PROVIDERS = [
  { value: 'third_party_model_api', label: 'API de modelos de terceros', description: 'LLMs, visión, embeddings u otros modelos externos.' },
  { value: 'cloud_infrastructure', label: 'Infraestructura cloud', description: 'Hosting, storage, colas o componentes de soporte.' },
  { value: 'annotation_or_review_vendor', label: 'Vendor de anotación o revisión', description: 'Etiquetado, QA, revisión humana o proveedores de evaluación.' },
  { value: 'monitoring_or_safety_tooling', label: 'Monitoreo o safety tooling', description: 'Observabilidad, filtros, seguridad o herramientas de control.' }
];
const DISCLAIMER_TYPES = [
  { value: 'medical', label: 'Medical information', description: 'Health or medical content.' },
  { value: 'fitness', label: 'Fitness information', description: 'Fitness, exercise, wellness.' },
  { value: 'errors_omissions', label: 'Errors and omissions', description: 'Content may contain mistakes or omissions.' },
  { value: 'external_links', label: 'External links', description: 'Third-party links disclaimer.' },
  { value: 'views_expressed', label: 'Views expressed', description: 'Opinions do not necessarily reflect official positions.' },
  { value: 'own_risk', label: 'Use at your own risk', description: 'Use of materials is at the user’s own risk.' },
  { value: 'product_reviews', label: 'Product reviews', description: 'Review methodology and commercial disclosure.' }
];
const DELETION_CHANNELS = [
  { value: 'email', label: 'Email' },
  { value: 'form', label: 'Form / page' },
  { value: 'both', label: 'Email and page' }
];
const DELETION_IDENTITY = [
  { value: 'Email de la cuenta o del usuario solicitante', label: 'Account email', description: 'Match the user to the stored account.' },
  { value: 'Nombre del perfil o identificador de usuario', label: 'Profile or user ID', description: 'Profile, handle, or internal user identifier.' },
  { value: 'ID de cuenta publicitaria o recurso vinculado', label: 'Ad account or asset ID', description: 'Useful for Meta-connected assets.' },
  { value: 'Breve descripción del pedido de eliminación', label: 'Request summary', description: 'What the user wants removed.' }
];
const DELETION_SCOPE = [
  { value: 'Datos de perfil o cuenta asociados al usuario', label: 'Profile / account data', description: 'User profile and account records.' },
  { value: 'Tokens o credenciales de acceso almacenadas por la aplicación', label: 'Access tokens / credentials', description: 'Stored tokens or persistent access data.' },
  { value: 'Registros operativos vinculados al uso de la aplicación', label: 'Operational records', description: 'Operational usage records linked to the user.' },
  { value: 'Configuraciones o preferencias guardadas', label: 'Preferences', description: 'Saved preferences and settings.' }
];
const DELETION_RETENTION = [
  { value: 'Registros necesarios para cumplir obligaciones legales o regulatorias', label: 'Legal obligations', description: 'Records retained by law.' },
  { value: 'Registros mínimos para seguridad, prevención de fraude o auditoría', label: 'Security / fraud', description: 'Minimal security or anti-fraud records.' },
  { value: 'Información necesaria para resolver disputas o hacer cumplir acuerdos', label: 'Disputes / contracts', description: 'Records needed for disputes or agreements.' }
];

DOCUMENTS = buildDocuments();

init();
