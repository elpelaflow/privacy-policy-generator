#!/usr/bin/env node

const fs = require('node:fs/promises');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');
const PrivacyPolicyGenerator = require('./js/generator');
const TermsGenerator = require('./js/terms-generator');
const DataDeletionGenerator = require('./js/deletion-generator');
const CookiesPolicyGenerator = require('./js/cookies-generator');
const ReturnRefundPolicyGenerator = require('./js/refund-generator');
const DisclaimerGenerator = require('./js/disclaimer-generator');
const SecurityPolicyGenerator = require('./js/security-generator');
const DataProcessingAgreementGenerator = require('./js/dpa-generator');
const AiPolicyGenerator = require('./js/ai-policy-generator');
const EulaGenerator = require('./js/eula-generator');
const { publishPolicy } = require('./js/publishing');

const DOCUMENT_OPTIONS = [
  { value: 'privacy', label: 'Política de privacidad', description: 'Genera una política de privacidad con foco en datos, terceros, cookies y derechos.' },
  { value: 'terms', label: 'Términos y condiciones', description: 'Genera condiciones de servicio o términos comerciales del sitio /terms.' },
  { value: 'deletion', label: 'Eliminación de datos', description: 'Genera una página pública con instrucciones para solicitar eliminación de datos.' },
  { value: 'cookies', label: 'Política de cookies', description: 'Genera una política específica de cookies, consentimiento y tecnologías similares.' },
  { value: 'refund', label: 'Devoluciones y reembolsos', description: 'Genera una política de devoluciones, cambios y reembolsos para compartir como URL pública.' },
  { value: 'disclaimer', label: 'Disclaimer / descargo', description: 'Genera descargos de responsabilidad modulares para contenido, enlaces, reseñas, salud, fitness y uso del sitio.' },
  { value: 'security', label: 'Política de seguridad', description: 'Genera una política de seguridad y divulgación responsable para recibir reportes de vulnerabilidades.' },
  { value: 'dpa', label: 'DPA / acuerdo de tratamiento de datos', description: 'Genera un Data Processing Agreement para SaaS B2B con roles, subprocessors, seguridad y transferencias.' },
  { value: 'ai', label: 'Política de IA y datos de entrenamiento', description: 'Genera una política de transparencia sobre uso de IA, entrenamiento, proveedores, retención y revisión humana.' },
  { value: 'eula', label: 'EULA / licencia de uso', description: 'Genera un End User License Agreement para software, apps, SDKs o extensiones con grant, restricciones, soporte y responsabilidad.' }
];

const BUSINESS_TYPE_OPTIONS = [
  { value: 'ecommerce', label: 'E-commerce', description: 'Tienda online que vende productos o servicios y procesa pedidos.' },
  { value: 'blog', label: 'Blog / Contenido', description: 'Sitio editorial, newsletter o publicación de contenido.' },
  { value: 'saas', label: 'SaaS / Web App', description: 'Software online con cuentas, panel, suscripciones o uso autenticado.' },
  { value: 'mobile', label: 'App móvil', description: 'Aplicación para iOS, Android o experiencia centrada en mobile.' },
  { value: 'nonprofit', label: 'Nonprofit / ONG', description: 'Organización sin fines de lucro, campañas o donaciones.' }
];

const JURISDICTION_OPTIONS = [
  { value: 'us', label: 'Estados Unidos', description: 'Base principal en Estados Unidos o foco fuerte en normas estatales como California.' },
  { value: 'eu', label: 'Unión Europea', description: 'Base principal en la UE o aplicación directa de GDPR.' },
  { value: 'uk', label: 'Reino Unido', description: 'Base principal en UK o aplicación directa de UK GDPR.' },
  { value: 'ca', label: 'Canadá', description: 'Base principal en Canadá o necesidad de lenguaje tipo PIPEDA.' },
  { value: 'au', label: 'Australia', description: 'Base principal en Australia o necesidad de lenguaje APP.' },
  { value: 'ar', label: 'Argentina', description: 'Base principal en Argentina o necesidad de cobertura orientada a Ley 25.326 y AAIP.' },
  { value: 'global', label: 'Otro / Global', description: 'Tu caso no encaja del todo en las opciones anteriores y querés una base genérica con revisión manual.' }
];

const REGION_OPTIONS = [
  { value: 'us', label: 'Estados Unidos', description: 'Tenés usuarios, clientes o ventas relevantes en EE.UU.' },
  { value: 'eu', label: 'Unión Europea', description: 'Tenés usuarios, clientes o ventas relevantes en la UE.' },
  { value: 'uk', label: 'Reino Unido', description: 'Tenés usuarios, clientes o ventas relevantes en UK.' },
  { value: 'ca', label: 'Canadá', description: 'Tenés usuarios, clientes o ventas relevantes en Canadá.' },
  { value: 'au', label: 'Australia', description: 'Tenés usuarios, clientes o ventas relevantes en Australia.' },
  { value: 'ar', label: 'Argentina', description: 'Tenés usuarios, clientes o ventas relevantes en Argentina.' },
  { value: 'global', label: 'Otro / Global', description: 'Operás en otros lugares o preferís una cobertura genérica manual.' }
];

const DATA_OPTIONS = [
  { value: 'personal', label: 'Datos personales', description: 'Nombre, email, usuario, dirección u otros datos identificatorios.' },
  { value: 'financial', label: 'Datos financieros', description: 'Información de pago, facturación o datos ligados a transacciones.' },
  { value: 'tax', label: 'Datos fiscales', description: 'CUIT, CUIL, condición impositiva, facturación y datos requeridos por obligaciones fiscales.' },
  { value: 'identity', label: 'Datos de identidad', description: 'Documento, verificación de identidad o datos comerciales para prevenir fraude o validar operaciones.' },
  { value: 'usage', label: 'Datos de uso', description: 'Métricas, logs, IP, navegación, eventos y diagnósticos.' },
  { value: 'cookies', label: 'Cookies', description: 'Cookies o tecnologías similares para sesión, preferencias o analítica.' },
  { value: 'location', label: 'Ubicación', description: 'Ubicación aproximada o precisa del usuario o dispositivo.' },
  { value: 'profiling', label: 'Perfilado o segmentación', description: 'Datos usados para personalización, scoring, segmentación comercial o decisiones automatizadas.' }
];

const THIRD_PARTY_OPTIONS = [
  { value: 'analytics', label: 'Analítica', description: 'Google Analytics, Plausible, PostHog u otra herramienta de medición.' },
  { value: 'advertising', label: 'Publicidad', description: 'Redes de anuncios, remarketing o campañas pagas.' },
  { value: 'payment', label: 'Múltiples procesadores de pago', description: 'Usás más de un proveedor de pago o una integración general de pagos.' },
  { value: 'paypal_only', label: 'Sólo PayPal', description: 'Todo el flujo de pago pasa por PayPal y no almacenás tarjetas localmente.' },
  { value: 'shipping', label: 'Logística y envíos', description: 'Correo, courier, fulfillment o terceros que reciben dirección y datos del pedido.' },
  { value: 'cloud', label: 'Infraestructura cloud', description: 'Hosting, bases de datos, backups o storage en terceros.' },
  { value: 'social', label: 'Integraciones sociales', description: 'Embeds, widgets, login social o contenido desde redes sociales.' },
  { value: 'email', label: 'Email / marketing', description: 'Newsletter, email transaccional, automatizaciones o CRM de email.' }
];

const LEGAL_BASE_OPTIONS = [
  { value: 'contract', label: 'Ejecución de contrato', description: 'Procesás datos porque es necesario para prestar el servicio, vender o entregar un pedido.' },
  { value: 'consent', label: 'Consentimiento', description: 'Procesás datos porque el usuario aceptó de forma explícita, por ejemplo marketing o cookies no esenciales.' },
  { value: 'legal_obligation', label: 'Obligación legal', description: 'Procesás o retenés datos por normas fiscales, contables, regulatorias o de seguridad.' },
  { value: 'legitimate_interest', label: 'Interés legítimo', description: 'Procesás ciertos datos para operar, prevenir fraude o mejorar el servicio, sujeto a evaluación y equilibrio.' }
];

const COMPLIANCE_OPTIONS = [
  { value: 'ccpa', label: 'CCPA / CPRA', description: 'Querés lenguaje específico para privacidad en California.' },
  { value: 'coppa', label: 'COPPA', description: 'Puede haber menores o necesitás revisar privacidad infantil.' },
  { value: 'caloppa', label: 'CalOPPA', description: 'Querés reforzar cobertura general para California.' },
  { value: 'pipeda', label: 'PIPEDA', description: 'Querés reforzar cobertura para Canadá.' }
];

const OUTPUT_FORMAT_OPTIONS = [
  { value: 'markdown', label: 'Markdown', description: 'Ideal para editar, versionar y revisar rápido en texto.' },
  { value: 'html', label: 'HTML', description: 'Ideal para publicar o integrar en una web.' },
  { value: 'text', label: 'Texto plano', description: 'Ideal para revisar en terminal o pegar en otro sistema.' }
];

const OUTPUT_LANGUAGE_OPTIONS = [
  { value: 'es', label: 'Español', description: 'Genera la política en español.' },
  { value: 'en', label: 'English', description: 'Generates the policy in English.' }
];

const TERMS_OFFERING_OPTIONS = [
  { value: 'physical_goods', label: 'Productos físicos', description: 'Vendés bienes tangibles que requieren preparación, despacho o entrega física.' },
  { value: 'digital_products', label: 'Productos digitales', description: 'Vendés archivos, licencias, cursos, descargas o contenido digital.' },
  { value: 'services', label: 'Servicios', description: 'Prestás servicios profesionales, implementación, soporte o trabajo bajo pedido.' },
  { value: 'subscriptions', label: 'Suscripciones', description: 'Cobrás planes recurrentes, membresías o acceso periódico.' }
];

const TERMS_CHANGE_OPTIONS = [
  { value: 'site_notice', label: 'Aviso en el sitio', description: 'Los cambios se publican en el sitio o aplicación.' },
  { value: 'email', label: 'Email', description: 'Los cambios relevantes se comunican por correo electrónico.' },
  { value: 'both', label: 'Ambos', description: 'Combinás aviso visible en el sitio y email cuando el cambio es relevante.' }
];

const TERMS_ADR_OPTIONS = [
  { value: 'none', label: 'Ninguno', description: 'No querés fijar un método alternativo específico.' },
  { value: 'mediation', label: 'Mediación', description: 'Las partes intentan una mediación antes de judicializar, cuando corresponda.' },
  { value: 'arbitration', label: 'Arbitraje', description: 'Prevés arbitraje si el marco legal y el servicio lo admiten.' }
];

const TERMS_RETURN_SHIPPING_OPTIONS = [
  { value: 'customer', label: 'Cliente', description: 'El costo de devolución corre normalmente por cuenta del cliente.' },
  { value: 'merchant', label: 'Negocio', description: 'El negocio asume el costo de la devolución cuando aplica.' },
  { value: 'case_by_case', label: 'Caso por caso', description: 'La devolución depende del motivo, estado del producto o ley aplicable.' }
];

const TERMS_STANDARD_RESTRICTIONS = [
  { value: 'No usar el sitio para actividades ilegales.', label: 'Actividad ilegal', description: 'Impide uso del sitio para fines ilícitos o fraudulentos.' },
  { value: 'No interferir con la seguridad, estabilidad o funcionamiento técnico del sitio.', label: 'Interferencia técnica', description: 'Prohíbe ataques, scraping abusivo o manipulación técnica.' },
  { value: 'No copiar, revender o explotar el contenido o productos fuera de lo permitido.', label: 'Reventa o explotación', description: 'Restringe copia, reventa o explotación no autorizada.' },
  { value: 'No enviar spam, contenido abusivo o información falsa.', label: 'Spam o abuso', description: 'Prohíbe spam, hostigamiento o datos falsos.' }
];

const DELETION_CHANNEL_OPTIONS = [
  { value: 'email', label: 'Sólo email', description: 'Los pedidos de eliminación se presentan por correo electrónico.' },
  { value: 'form', label: 'Sólo formulario o página', description: 'Los pedidos se presentan desde una URL o página específica.' },
  { value: 'both', label: 'Email y página', description: 'Ofrecés ambos canales para pedir eliminación.' }
];

const DELETION_IDENTITY_OPTIONS = [
  { value: 'Email de la cuenta o del usuario solicitante', label: 'Email de la cuenta', description: 'Permite ubicar el registro asociado al usuario.' },
  { value: 'Nombre del perfil o identificador de usuario', label: 'ID o perfil', description: 'Sirve para ubicar la cuenta o perfil afectado.' },
  { value: 'ID de cuenta publicitaria o recurso vinculado', label: 'ID publicitario', description: 'Útil si la app trabaja con activos o cuentas de Meta Ads.' },
  { value: 'Breve descripción del pedido de eliminación', label: 'Descripción del pedido', description: 'Ayuda a identificar qué acceso o dato se quiere eliminar.' }
];

const DELETION_SCOPE_OPTIONS = [
  { value: 'Datos de perfil o cuenta asociados al usuario', label: 'Perfil o cuenta', description: 'Cuenta, perfil o identificación interna del usuario.' },
  { value: 'Tokens o credenciales de acceso almacenadas por la aplicación', label: 'Tokens o credenciales', description: 'Permisos, tokens y accesos persistidos por la app.' },
  { value: 'Registros operativos vinculados al uso de la aplicación', label: 'Registros operativos', description: 'Datos de uso o actividad vinculados al usuario.' },
  { value: 'Configuraciones o preferencias guardadas', label: 'Preferencias', description: 'Preferencias, configuraciones o estados de uso guardados.' }
];

const DELETION_RETENTION_OPTIONS = [
  { value: 'Registros necesarios para cumplir obligaciones legales o regulatorias', label: 'Obligaciones legales', description: 'Datos que deban conservarse por ley.' },
  { value: 'Registros mínimos para seguridad, prevención de fraude o auditoría', label: 'Seguridad y fraude', description: 'Datos mínimos retenidos por seguridad o auditoría.' },
  { value: 'Información necesaria para resolver disputas o hacer cumplir acuerdos', label: 'Disputas o contratos', description: 'Datos que deban conservarse para resolver conflictos.' }
];

const COOKIE_CATEGORY_OPTIONS = [
  { value: 'necessary', label: 'Necesarias', description: 'Cookies indispensables para sesión, seguridad, carga básica o funciones centrales del servicio.' },
  { value: 'preferences', label: 'Preferencias / funcionales', description: 'Recuerdan idioma, ajustes, preferencias o personalizaciones no esenciales.' },
  { value: 'analytics', label: 'Analítica / medición', description: 'Miden uso, rendimiento, eventos o comportamiento de navegación.' },
  { value: 'advertising', label: 'Publicidad / remarketing', description: 'Soportan segmentación publicitaria, atribución o remarketing.' }
];

const COOKIE_PROVIDER_OPTIONS = [
  { value: 'analytics', label: 'Analítica', description: 'Google Analytics, Plausible, PostHog u otros proveedores de medición.' },
  { value: 'advertising', label: 'Publicidad', description: 'Meta Ads, Google Ads u otras plataformas de publicidad o remarketing.' },
  { value: 'social', label: 'Social / embeds', description: 'Login social, contenido embebido o widgets desde redes sociales.' },
  { value: 'cloud', label: 'Infraestructura / delivery', description: 'CDN, scripts o infraestructura que pueda intervenir en la entrega de contenido y tags.' },
  { value: 'email', label: 'Email / marketing', description: 'Automatizaciones o herramientas que integren tracking de campañas o formularios.' }
];

const COOKIE_CONSENT_OPTIONS = [
  { value: 'banner', label: 'Banner o centro de preferencias', description: 'El usuario puede aceptar, rechazar o configurar cookies no esenciales.' },
  { value: 'implied', label: 'Aviso con uso continuado', description: 'Mostrás un aviso y tratás el uso continuado como aceptación cuando la ley lo permita.' },
  { value: 'essential_only', label: 'Sólo esenciales', description: 'Declarás que el servicio debería operar sólo con cookies necesarias salvo futura activación de otras categorías.' }
];

const REFUND_OFFERING_OPTIONS = [
  { value: 'physical_goods', label: 'Productos físicos', description: 'Productos tangibles con despacho, entrega física o retiro.' },
  { value: 'digital_products', label: 'Productos digitales', description: 'Descargas, licencias, cursos o bienes digitales.' },
  { value: 'services', label: 'Servicios', description: 'Prestación profesional, implementación, soporte o trabajo bajo pedido.' },
  { value: 'subscriptions', label: 'Suscripciones', description: 'Membresías, planes recurrentes o acceso periódico.' }
];

const REFUND_RETURN_SHIPPING_OPTIONS = [
  { value: 'customer', label: 'Cliente', description: 'El cliente normalmente asume el costo de la devolución.' },
  { value: 'merchant', label: 'Negocio', description: 'El negocio normalmente asume el costo cuando aprueba la devolución.' },
  { value: 'case_by_case', label: 'Caso por caso', description: 'Depende del motivo, el estado del producto y la ley aplicable.' }
];

const SECURITY_REPORT_CHANNEL_OPTIONS = [
  { value: 'email', label: 'Sólo email', description: 'Los reportes llegan únicamente por correo electrónico.' },
  { value: 'form', label: 'Sólo formulario o página', description: 'Los reportes llegan desde una URL o página pública.' },
  { value: 'both', label: 'Email y página', description: 'Ofrecés ambos canales para recibir reportes.' }
];

const SECURITY_SCOPE_OPTIONS = [
  { value: 'web_application', label: 'Aplicación web', description: 'Frontend, panel, flujos web y páginas públicas.' },
  { value: 'api', label: 'API / endpoints', description: 'APIs, webhooks o endpoints para desarrolladores.' },
  { value: 'mobile_app', label: 'App móvil', description: 'Aplicaciones iOS, Android o wrappers móviles.' },
  { value: 'infrastructure', label: 'Infraestructura', description: 'Hosting, redes, storage y componentes de soporte.' },
  { value: 'integrations', label: 'Integraciones con terceros', description: 'Servicios conectados, apps externas y flujos de integración.' },
  { value: 'content', label: 'Contenido / assets', description: 'Documentación, archivos estáticos o contenido sensible para seguridad.' }
];

const SECURITY_DISCLOSURE_OPTIONS = [
  { value: 'coordinated', label: 'Coordinated disclosure', description: 'Pedís evitar disclosure público hasta revisar y mitigar razonablemente.' },
  { value: 'researcher_choice', label: 'Acuerdo caso por caso', description: 'La divulgación pública se conversa según el caso y la severidad.' },
  { value: 'silent_fix', label: 'Fix antes de disclosure', description: 'Preferís corregir primero y no siempre publicar advisories individuales.' }
];

const SECURITY_REPORT_REQUIREMENT_OPTIONS = [
  { value: 'Descripción clara del hallazgo y del impacto esperado', label: 'Descripción e impacto', description: 'Qué pasa y por qué importa.' },
  { value: 'Pasos de reproducción o prueba de concepto razonable', label: 'Reproducción o PoC', description: 'Cómo reproducir el hallazgo sin exagerar riesgo.' },
  { value: 'Activos, URLs, endpoints o cuentas involucradas', label: 'Activos afectados', description: 'Qué activos o superficies están involucrados.' },
  { value: 'Información de contacto para seguimiento', label: 'Contacto de seguimiento', description: 'Cómo continuar la coordinación del caso.' }
];

const EULA_SOFTWARE_TYPE_OPTIONS = [
  { value: 'desktop', label: 'Software de escritorio', description: 'Aplicación instalable para desktop, workstation o entorno local.' },
  { value: 'mobile_app', label: 'App móvil', description: 'Aplicación iOS, Android o wrapper móvil equivalente.' },
  { value: 'web_app', label: 'Web app / SaaS', description: 'Interfaz web, cuenta alojada o software accesible online.' },
  { value: 'sdk_api', label: 'SDK / API / tooling', description: 'SDK, librería, API o herramientas para desarrolladores.' },
  { value: 'plugin_extension', label: 'Plugin / extensión', description: 'Extensión, add-on o módulo que complementa otra plataforma.' }
];

const EULA_LICENSE_SCOPE_OPTIONS = [
  { value: 'personal_internal', label: 'Uso personal o interno', description: 'Uso personal, individual o interno dentro de una organización.' },
  { value: 'commercial_b2b', label: 'Uso comercial B2B', description: 'Uso empresarial o comercial conforme al plan contratado.' },
  { value: 'single_device', label: 'Un dispositivo o instalación', description: 'La licencia queda atada a un dispositivo o instalación específica.' },
  { value: 'per_account', label: 'Por cuenta o usuario', description: 'La licencia depende de la cuenta o usuario habilitado.' },
  { value: 'per_seat', label: 'Por asiento o cantidad contratada', description: 'La licencia depende de asientos, seats o cantidad contratada.' }
];

const EULA_SUPPORT_LEVEL_OPTIONS = [
  { value: 'none', label: 'Sin soporte comprometido', description: 'No hay obligación de soporte más allá de la disponibilidad general.' },
  { value: 'best_effort', label: 'Best effort', description: 'Se intenta asistir y mantener el producto sin SLA fuerte.' },
  { value: 'commercial_support', label: 'Soporte comercial', description: 'Existe soporte sujeto a plan, suscripción o contrato.' },
  { value: 'contract_defined', label: 'Definido por contrato', description: 'El nivel de soporte se remite a un contrato u order form separado.' }
];

const DPA_COUNTERPARTY_ROLE_OPTIONS = [
  { value: 'controller', label: 'Controller / cliente', description: 'La contraparte define fines y medios del tratamiento y contrata el servicio.' },
  { value: 'processor', label: 'Processor / tercero', description: 'La contraparte también actúa como processor en una cadena de subprocesamiento.' },
  { value: 'joint_controller', label: 'Joint controller', description: 'Las partes podrían compartir ciertas decisiones de tratamiento, sujeto a revisión legal específica.' }
];

const DPA_REGULATORY_SCOPE_OPTIONS = [
  { value: 'eu', label: 'UE / GDPR', description: 'Clientes, usuarios o tratamiento con foco GDPR / EEE.' },
  { value: 'uk', label: 'UK / UK GDPR', description: 'Clientes o tratamiento con foco UK GDPR.' },
  { value: 'us', label: 'Estados Unidos', description: 'Relación contractual o tratamiento con foco EE.UU.' },
  { value: 'ar', label: 'Argentina', description: 'Relación contractual o tratamiento con foco Argentina.' },
  { value: 'global', label: 'Global / custom', description: 'Cobertura contractual más general o multinacional.' }
];

const DPA_DATA_CATEGORY_OPTIONS = [
  { value: 'Datos de identificación y contacto', label: 'Identificación y contacto', description: 'Nombre, email, cargo, organización o identificadores comerciales.' },
  { value: 'Datos de cuenta o credenciales de acceso', label: 'Cuenta y acceso', description: 'Usuarios, cuentas, roles, credenciales o tokens del servicio.' },
  { value: 'Datos de uso, eventos y registros técnicos', label: 'Uso y logs', description: 'Eventos, métricas, logs, IP y registros técnicos del uso del servicio.' },
  { value: 'Datos comerciales o de soporte del cliente', label: 'Comercial o soporte', description: 'Tickets, conversaciones, estados operativos o soporte del cliente.' },
  { value: 'Datos importados o cargados por el cliente', label: 'Datos cargados por el cliente', description: 'Contenido, archivos o registros que el cliente sube al servicio.' }
];

const DPA_DATA_SUBJECT_OPTIONS = [
  { value: 'Usuarios finales del cliente', label: 'Usuarios finales', description: 'Usuarios del producto o servicio del cliente.' },
  { value: 'Empleados o contratistas del cliente', label: 'Equipo del cliente', description: 'Administradores, empleados o contratistas del cliente.' },
  { value: 'Prospectos o contactos comerciales del cliente', label: 'Prospectos o leads', description: 'Leads, prospectos o contactos comerciales del cliente.' },
  { value: 'Clientes o usuarios autenticados del cliente', label: 'Clientes autenticados', description: 'Cuentas o usuarios registrados del cliente.' }
];
const DPA_SUBPROCESSOR_AUTHORIZATION_OPTIONS = [
  { value: 'general_authorization', label: 'Autorización general con aviso', description: 'Se permiten subprocessors con aviso razonable y eventual objeción del cliente.' },
  { value: 'specific_approval', label: 'Aprobación específica', description: 'Cada nuevo subprocessor requiere aprobación o consentimiento puntual.' },
  { value: 'contract_defined', label: 'Definido por contrato principal', description: 'La mecánica exacta se remite al MSA, DPA principal o anexo comercial.' }
];
const DPA_AUDIT_MECHANISM_OPTIONS = [
  { value: 'questionnaire_and_certifications', label: 'Cuestionarios y certificaciones', description: 'Vendor review basado en respuestas, certificaciones y evidencia documental.' },
  { value: 'remote_review', label: 'Revisión remota', description: 'Intercambio coordinado de evidencia o revisión documental remota.' },
  { value: 'onsite_limited', label: 'Onsite limitado', description: 'Auditoría onsite excepcional y acotada.' },
  { value: 'contract_defined', label: 'Definido por contrato', description: 'La mecánica exacta se remite al contrato principal o anexo negociado.' }
];

const AI_SYSTEM_OPTIONS = [
  { value: 'chatbot_or_assistant', label: 'Chatbot o asistente', description: 'Asistentes conversacionales o soporte guiado.' },
  { value: 'content_generation', label: 'Generación de contenido', description: 'Texto, imágenes, resúmenes u otros outputs generativos.' },
  { value: 'ranking_or_recommendation', label: 'Ranking o recomendaciones', description: 'Priorización, matching o recomendaciones.' },
  { value: 'classification_or_moderation', label: 'Clasificación o moderación', description: 'Moderación, fraude, triage o etiquetado.' },
  { value: 'analytics_or_forecasting', label: 'Analítica o predicción', description: 'Predicción, scoring o forecasting.' }
];

const AI_USE_CASE_OPTIONS = [
  { value: 'customer_support', label: 'Soporte al cliente', description: 'Respuestas, ayuda contextual o soporte operativo.' },
  { value: 'drafting_or_generation', label: 'Redacción o generación', description: 'Borradores, respuestas o contenido generado.' },
  { value: 'search_and_retrieval', label: 'Búsqueda y retrieval', description: 'Búsqueda semántica o knowledge base.' },
  { value: 'moderation_or_safety', label: 'Moderación o seguridad', description: 'Abuso, fraude o seguridad del sistema.' },
  { value: 'internal_operations', label: 'Operación interna', description: 'Backoffice, QA o flujos internos.' }
];

const AI_TRAINING_DATA_USE_OPTIONS = [
  { value: 'no_training', label: 'No se usa para entrenamiento', description: 'No se usa para entrenamiento o fine-tuning general.' },
  { value: 'evaluation_only', label: 'Sólo evaluación o safety review', description: 'Uso acotado para evaluación o seguridad.' },
  { value: 'service_improvement', label: 'Mejora del producto', description: 'Mejora del producto o del comportamiento acotado del sistema.' },
  { value: 'model_training', label: 'Entrenamiento o fine-tuning', description: 'Uso más amplio para entrenamiento o ajuste de modelos.' }
];

const AI_DATA_SOURCE_OPTIONS = [
  { value: 'customer_inputs', label: 'Inputs del cliente o usuario', description: 'Prompts, formularios, archivos o contenido provisto por el usuario.' },
  { value: 'service_logs', label: 'Logs y telemetría', description: 'Eventos, métricas y observabilidad técnica.' },
  { value: 'feedback_signals', label: 'Feedback explícito', description: 'Calificaciones, correcciones o thumbs up/down.' },
  { value: 'public_or_licensed_data', label: 'Datos públicos o licenciados', description: 'Datasets públicos, licenciados o de terceros.' },
  { value: 'synthetic_or_test_data', label: 'Datos sintéticos o de prueba', description: 'Datos sintéticos o fixtures de evaluación.' }
];

const AI_MODEL_IMPROVEMENT_OPTIONS = [
  { value: 'quality_evaluation', label: 'Evaluación de calidad', description: 'Benchmarking, QA o performance review.' },
  { value: 'safety_testing', label: 'Pruebas de seguridad', description: 'Red teaming, abuso o safety review.' },
  { value: 'fine_tuning', label: 'Fine-tuning', description: 'Ajuste o calibración del modelo.' },
  { value: 'model_training', label: 'Entrenamiento amplio', description: 'Entrenamiento o ajuste más amplio del modelo.' },
  { value: 'abuse_monitoring', label: 'Abuso o monitoreo', description: 'Detección de abuso, fraude o monitoreo operativo.' },
  { value: 'product_analytics', label: 'Analítica del producto', description: 'Mejoras de producto, UX u operación.' }
];

const AI_PROVIDER_OPTIONS = [
  { value: 'third_party_model_api', label: 'API de modelos de terceros', description: 'LLMs, visión, embeddings u otros modelos externos.' },
  { value: 'cloud_infrastructure', label: 'Infraestructura cloud', description: 'Hosting, storage o cómputo de soporte.' },
  { value: 'annotation_or_review_vendor', label: 'Vendor de anotación o revisión', description: 'Etiquetado, QA o revisión humana.' },
  { value: 'monitoring_or_safety_tooling', label: 'Monitoreo o safety tooling', description: 'Observabilidad, filtros o herramientas de control.' }
];

const DISCLAIMER_OPTIONS = [
  { value: 'medical', label: 'Información médica', description: 'Para sitios o apps que publican salud, medicina, síntomas o bienestar clínico.' },
  { value: 'fitness', label: 'Información de fitness', description: 'Para ejercicios, rutinas, entrenamiento, nutrición o wellness físico.' },
  { value: 'errors_omissions', label: 'Errores y omisiones', description: 'Aclara que puede haber errores, datos desactualizados u omisiones.' },
  { value: 'external_links', label: 'Enlaces externos', description: 'Aclara que no controlás ni garantizás sitios de terceros enlazados.' },
  { value: 'views_expressed', label: 'Opiniones expresadas', description: 'Aclara que opiniones o comentarios no representan necesariamente posiciones oficiales.' },
  { value: 'own_risk', label: 'Uso bajo propio riesgo', description: 'Avisa que el uso del sitio, herramientas o materiales corre por cuenta del usuario.' },
  { value: 'product_reviews', label: 'Reseñas de productos', description: 'Aclara cómo se interpretan reseñas, ratings y posible sesgo comercial o afiliación.' }
];

const BACK = Symbol('back');
const DEFAULT_PUBLIC_BASE_URL = 'https://example.com/privacy';
const DEFAULT_PUBLISH_DIR = './public/privacy';
const ANSI_ENABLED = Boolean(stdout.isTTY && process.env.NO_COLOR !== '1');

function color(code, value) {
  return ANSI_ENABLED ? `\u001b[${code}m${value}\u001b[0m` : value;
}

function bold(value) {
  return color('1', value);
}

function dim(value) {
  return color('2', value);
}

function cyan(value) {
  return color('36', value);
}

function yellow(value) {
  return color('33', value);
}

function green(value) {
  return color('32', value);
}

function red(value) {
  return color('31', value);
}

function magenta(value) {
  return color('35', value);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const options = {};

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (!token.startsWith('--')) {
      continue;
    }

    const key = token.slice(2);
    const value = rest[index + 1] && !rest[index + 1].startsWith('--')
      ? rest[++index]
      : 'true';

    options[key] = value;
  }

  return { command, options };
}

async function readInput(options) {
  if (!options.input) {
    throw new Error('Missing required --input <file.json>');
  }

  const filePath = path.resolve(process.cwd(), options.input);
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function readJsonFile(filePath) {
  const resolved = path.resolve(process.cwd(), filePath);
  const raw = await fs.readFile(resolved, 'utf8');
  return JSON.parse(raw);
}

async function listReusablePrivacyInputs() {
  const candidateDirs = [
    process.cwd(),
    '/tmp/privacy-policy-generator'
  ];

  const candidateNames = new Set([
    'wizard-input.json'
  ]);

  const results = [];

  for (const dir of candidateDirs) {
    let entries = [];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.json')) {
        continue;
      }

      const likelyPrivacyInput = entry.name === 'wizard-input.json'
        || entry.name.endsWith('-privacy-policy-input.json')
        || entry.name.includes('privacy');

      if (!likelyPrivacyInput) {
        continue;
      }

      const resolvedPath = path.join(dir, entry.name);
      if (candidateNames.has(resolvedPath)) {
        continue;
      }

      try {
        const raw = await fs.readFile(resolvedPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed?.business && parsed?.contact && parsed?.operations && parsed?.dataPractices && !parsed?.terms) {
          results.push({
            path: resolvedPath,
            label: path.relative(process.cwd(), resolvedPath) || resolvedPath,
            description: `${parsed.business?.name || 'Negocio sin nombre'}${parsed.business?.websiteUrl ? ` · ${parsed.business.websiteUrl}` : ''}`
          });
          candidateNames.add(resolvedPath);
        }
      } catch {
        continue;
      }
    }
  }

  results.sort((a, b) => {
    if (a.path.endsWith('wizard-input.json')) return -1;
    if (b.path.endsWith('wizard-input.json')) return 1;
    return a.path.localeCompare(b.path);
  });

  return results;
}

function isBackCommand(value) {
  return ['<', 'volver', 'back'].includes(String(value || '').trim().toLowerCase());
}

function backHint(allowBack) {
  return allowBack ? dim(' | < = volver') : '';
}

async function promptText(rl, label, { required = false, allowEmpty = true, defaultValue = '', allowBack = true } = {}) {
  while (true) {
    const suffix = defaultValue ? ` [default: ${defaultValue}]` : '';
    const answer = (await rl.question(`${label}${suffix}${backHint(allowBack)}: `)).trim();
    if (allowBack && isBackCommand(answer)) {
      return BACK;
    }
    const value = answer || defaultValue;

    if (!required || value || allowEmpty) {
      return value;
    }

    stdout.write(`${red('Este campo es obligatorio.')}\n`);
  }
}

async function promptSingleChoice(rl, title, options, { allowOther = true, allowBack = true } = {}) {
  stdout.write(`\n${bold(cyan(title))}\n`);
  options.forEach((option, index) => {
    stdout.write(`  ${yellow(String(index + 1))}. ${bold(option.label)}\n`);
    stdout.write(`     ${dim(option.description)}\n`);
  });

  const otherIndex = options.length + 1;
  if (allowOther) {
    stdout.write(`  ${yellow(String(otherIndex))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Escribís una variante manual y el sistema la deja anotada para revisión.')}\n`);
  }

  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}${backHint(allowBack)}: `)).trim();
    if (allowBack && isBackCommand(answer)) {
      return BACK;
    }
    const choice = Number.parseInt(answer, 10);

    if (choice >= 1 && choice <= options.length) {
      return { value: options[choice - 1].value, manualNote: '' };
    }

    if (allowOther && choice === otherIndex) {
      const manualNote = await promptText(rl, 'Describí la opción manual', { required: true, allowEmpty: false, allowBack: true });
      if (manualNote === BACK) {
        continue;
      }
      return { value: 'other', manualNote };
    }

    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function promptMultiChoice(rl, title, options, { allowOther = true, allowNone = true, allowBack = true } = {}) {
  stdout.write(`\n${bold(cyan(title))}\n`);
  options.forEach((option, index) => {
    stdout.write(`  ${yellow(String(index + 1))}. ${bold(option.label)}\n`);
    stdout.write(`     ${dim(option.description)}\n`);
  });

  const otherIndex = options.length + 1;
  if (allowOther) {
    stdout.write(`  ${yellow(String(otherIndex))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Agregás una nota manual para algo que no está en la lista.')}\n`);
  }

  if (allowNone) {
    stdout.write(`  ${dim('Enter vacío = ninguna opción')}\n`);
  }

  while (true) {
    const answer = (await rl.question(`${green('Elegí uno o varios números separados por coma')}${backHint(allowBack)}: `)).trim();
    if (allowBack && isBackCommand(answer)) {
      return BACK;
    }
    if (!answer && allowNone) {
      return { values: [], manualNotes: [] };
    }

    const parts = answer
      .split(',')
      .map((item) => Number.parseInt(item.trim(), 10))
      .filter((item) => Number.isInteger(item));

    if (parts.length === 0) {
      stdout.write(`${red('No se entendió la selección. Probá de nuevo.')}\n`);
      continue;
    }

    const unique = [...new Set(parts)];
    const invalid = unique.some((item) => item < 1 || item > otherIndex || (!allowOther && item > options.length));
    if (invalid) {
      stdout.write(`${red('Hay una opción inválida. Probá de nuevo.')}\n`);
      continue;
    }

    const values = unique
      .filter((item) => item >= 1 && item <= options.length)
      .map((item) => options[item - 1].value);

    const manualNotes = [];
    if (allowOther && unique.includes(otherIndex)) {
      const manualNote = await promptText(rl, 'Describí la opción manual', { required: true, allowEmpty: false, allowBack: true });
      if (manualNote === BACK) {
        continue;
      }
      manualNotes.push(manualNote);
    }

    return { values, manualNotes };
  }
}

async function promptYesNo(rl, title, description, defaultValue = false, allowBack = true) {
  stdout.write(`\n${bold(cyan(title))}\n`);
  stdout.write(`  ${dim(description)}\n`);

  while (true) {
    const defaultText = defaultValue ? 'S/n' : 's/N';
    const raw = (await rl.question(`${green(`Respuesta [${defaultText}]`)}${backHint(allowBack)}: `)).trim();
    if (allowBack && isBackCommand(raw)) {
      return BACK;
    }
    const answer = raw.toLowerCase();

    if (!answer) {
      return defaultValue;
    }

    if (['s', 'si', 'sí', 'y', 'yes'].includes(answer)) {
      return true;
    }

    if (['n', 'no'].includes(answer)) {
      return false;
    }

    stdout.write(`${red('Respondé sí o no.')}\n`);
  }
}

async function runQuestions(questions) {
  let index = 0;
  while (index < questions.length) {
    const result = await questions[index]();
    if (result === BACK) {
      if (index === 0) {
        stdout.write('Ya estás en la primera pregunta de este bloque.\n');
        stdout.write(`${dim('No podés retroceder más dentro de este bloque.')}\n`);
        continue;
      }
      index -= 1;
      continue;
    }
    index += 1;
  }
}

async function publishGeneratedPolicy(input, result, options = {}) {
  if (!options.baseUrl && !options.publishDir) {
    return null;
  }

  return publishPolicy({
    businessName: input.business?.name || 'privacy-policy',
    htmlContent: result.html,
    outputDir: options.publishDir || DEFAULT_PUBLISH_DIR,
    baseUrl: options.baseUrl || DEFAULT_PUBLIC_BASE_URL
  });
}

function defaultBaseUrlForDocument(documentType) {
  if (documentType === 'terms') {
    return 'https://example.com/terms';
  }
  if (documentType === 'deletion') {
    return 'https://example.com/data-deletion';
  }
  if (documentType === 'cookies') {
    return 'https://example.com/cookies';
  }
  if (documentType === 'refund') {
    return 'https://example.com/refunds';
  }
  if (documentType === 'disclaimer') {
    return 'https://example.com/disclaimer';
  }
  if (documentType === 'security') {
    return 'https://example.com/security';
  }
  if (documentType === 'dpa') {
    return 'https://example.com/dpa';
  }
  if (documentType === 'ai') {
    return 'https://example.com/ai';
  }
  if (documentType === 'eula') {
    return 'https://example.com/eula';
  }
  return DEFAULT_PUBLIC_BASE_URL;
}

function defaultPublishDirForDocument(documentType) {
  if (documentType === 'terms') {
    return './public/terms';
  }
  if (documentType === 'deletion') {
    return './public/data-deletion';
  }
  if (documentType === 'cookies') {
    return './public/cookies';
  }
  if (documentType === 'refund') {
    return './public/refunds';
  }
  if (documentType === 'disclaimer') {
    return './public/disclaimer';
  }
  if (documentType === 'security') {
    return './public/security';
  }
  if (documentType === 'dpa') {
    return './public/dpa';
  }
  if (documentType === 'ai') {
    return './public/ai';
  }
  if (documentType === 'eula') {
    return './public/eula';
  }
  return DEFAULT_PUBLISH_DIR;
}

function resolveDocumentType(options, input) {
  if (['terms', 'privacy', 'deletion', 'cookies', 'refund', 'disclaimer', 'security', 'dpa', 'ai', 'eula'].includes(options.document)) {
    return options.document;
  }
  if (['terms', 'privacy', 'deletion', 'cookies', 'refund', 'disclaimer', 'security', 'dpa', 'ai', 'eula'].includes(input?.documentType)) {
    return input.documentType;
  }
  if (input?.terms) {
    return 'terms';
  }
  if (input?.deletion) {
    return 'deletion';
  }
  if (input?.cookies) {
    return 'cookies';
  }
  if (input?.refund) {
    return 'refund';
  }
  if (input?.disclaimer) {
    return 'disclaimer';
  }
  if (input?.security) {
    return 'security';
  }
  if (input?.dpa) {
    return 'dpa';
  }
  if (input?.ai) {
    return 'ai';
  }
  if (input?.eula) {
    return 'eula';
  }
  return 'privacy';
}

function inferJurisdiction(country) {
  const normalized = String(country || '').trim().toLowerCase();
  if (['united states', 'usa', 'us', 'estados unidos'].includes(normalized)) {
    return 'us';
  }
  if (['germany', 'france', 'spain', 'italy', 'netherlands', 'european union', 'eu', 'unión europea'].includes(normalized)) {
    return 'eu';
  }
  if (['united kingdom', 'uk', 'reino unido', 'england', 'scotland', 'wales'].includes(normalized)) {
    return 'uk';
  }
  if (['canada', 'canadá'].includes(normalized)) {
    return 'ca';
  }
  if (['australia'].includes(normalized)) {
    return 'au';
  }
  if (['argentina', 'ar', 'república argentina', 'republica argentina'].includes(normalized)) {
    return 'ar';
  }
  return 'global';
}

function isArgentinaCountry(country) {
  return inferJurisdiction(country) === 'ar';
}

function defaultContactEmail(websiteUrl) {
  try {
    if (!websiteUrl) {
      return '';
    }
    const hostname = new URL(websiteUrl).hostname.replace(/^www\./, '');
    return `privacy@${hostname}`;
  } catch {
    return '';
  }
}

function defaultContactPage(websiteUrl) {
  try {
    if (!websiteUrl) {
      return '';
    }
    const url = new URL(websiteUrl);
    url.pathname = '/privacy';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return '';
  }
}

function slugify(value) {
  return String(value || 'privacy-policy')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'privacy-policy';
}

function optionLabel(options, value) {
  return options.find((option) => option.value === value)?.label || value;
}

function optionLabels(options, values) {
  return values.length > 0
    ? values.map((value) => optionLabel(options, value)).join(', ')
    : '(ninguno)';
}

function addUnique(list, value) {
  if (!value || list.includes(value)) {
    return list;
  }
  list.push(value);
  return list;
}

function removeValue(list, value) {
  return list.filter((item) => item !== value);
}

function documentOutputSuffix(documentType) {
  if (documentType === 'terms') return 'terms';
  if (documentType === 'deletion') return 'data-deletion';
  if (documentType === 'cookies') return 'cookies-policy';
  if (documentType === 'refund') return 'return-refund-policy';
  if (documentType === 'disclaimer') return 'disclaimer';
  if (documentType === 'security') return 'security-policy';
  if (documentType === 'dpa') return 'data-processing-agreement';
  if (documentType === 'ai') return 'ai-policy';
  if (documentType === 'eula') return 'eula';
  return 'privacy-policy';
}

function mergeTermsStateFromPrivacyInput(state, input) {
  state.business.name = input.business?.name || state.business.name;
  state.business.type = input.business?.type || state.business.type;
  state.business.websiteUrl = input.business?.websiteUrl || state.business.websiteUrl;
  state.business.country = input.business?.country || state.business.country;
  state.business.address = input.business?.address || state.business.address;

  state.contact.email = input.contact?.email || state.contact.email;
  state.contact.phone = input.contact?.phone || state.contact.phone;
  state.contact.pageUrl = input.contact?.pageUrl || state.contact.pageUrl;

  state.operations.primaryJurisdiction = input.operations?.primaryJurisdiction || state.operations.primaryJurisdiction;
  state.operations.sellRegions = Array.isArray(input.operations?.sellRegions) && input.operations.sellRegions.length > 0
    ? input.operations.sellRegions
    : state.operations.sellRegions;

  if (state.business.type === 'ecommerce') {
    if (input.dataPractices?.thirdParties?.includes('payment')) {
      state.terms.paymentProvider = state.terms.paymentProvider || 'Pasarela general o múltiples procesadores';
    }
    if (input.dataPractices?.thirdParties?.includes('paypal_only')) {
      state.terms.paymentProvider = state.terms.paymentProvider || 'PayPal';
    }
    if (input.dataPractices?.thirdParties?.includes('shipping')) {
      state.terms.shippingDelayDisclaimer = true;
    }
    if (input.dataPractices?.collectedData?.includes('financial')) {
      state.terms.pricesIncludeTaxes = state.terms.pricesIncludeTaxes ?? true;
    }
  }

  if ((input.business?.country || '').toLowerCase().includes('argentina') || input.operations?.primaryJurisdiction === 'ar') {
    state.output.language = 'es';
    state.operations.primaryJurisdiction = state.operations.primaryJurisdiction || 'ar';
    state.operations.sellRegions = state.operations.sellRegions.length > 0 ? state.operations.sellRegions : ['ar'];
    state.terms.currency = state.terms.currency || 'ARS';
  }
}

function mergeDeletionStateFromPrivacyInput(state, input) {
  state.business.name = input.business?.name || state.business.name;
  state.business.type = input.business?.type || state.business.type;
  state.business.websiteUrl = input.business?.websiteUrl || state.business.websiteUrl;
  state.business.country = input.business?.country || state.business.country;
  state.business.address = input.business?.address || state.business.address;

  state.contact.email = input.contact?.email || state.contact.email;
  state.contact.phone = input.contact?.phone || state.contact.phone;
  state.contact.pageUrl = input.contact?.pageUrl || state.contact.pageUrl;

  state.operations.primaryJurisdiction = input.operations?.primaryJurisdiction || state.operations.primaryJurisdiction;
  state.operations.sellRegions = Array.isArray(input.operations?.sellRegions) && input.operations.sellRegions.length > 0
    ? input.operations.sellRegions
    : state.operations.sellRegions;

  state.deletion.requestEmail = state.contact.email || state.deletion.requestEmail;
  state.deletion.requestUrl = state.contact.pageUrl || state.deletion.requestUrl;
  state.deletion.hasMetaConnection = state.deletion.hasMetaConnection
    || input.customizations?.manualDisclosures?.some((note) => /meta/i.test(note))
    || input.dataPractices?.thirdParties?.includes('advertising');

  if ((input.business?.country || '').toLowerCase().includes('argentina') || input.operations?.primaryJurisdiction === 'ar') {
    state.output.language = 'es';
    state.operations.primaryJurisdiction = state.operations.primaryJurisdiction || 'ar';
    state.operations.sellRegions = state.operations.sellRegions.length > 0 ? state.operations.sellRegions : ['ar'];
  }
}

function mergeCookiesStateFromPrivacyInput(state, input) {
  state.business.name = input.business?.name || state.business.name;
  state.business.type = input.business?.type || state.business.type;
  state.business.websiteUrl = input.business?.websiteUrl || state.business.websiteUrl;
  state.business.country = input.business?.country || state.business.country;
  state.business.address = input.business?.address || state.business.address;

  state.contact.email = input.contact?.email || state.contact.email;
  state.contact.phone = input.contact?.phone || state.contact.phone;
  state.contact.pageUrl = input.contact?.pageUrl || state.contact.pageUrl;

  state.operations.primaryJurisdiction = input.operations?.primaryJurisdiction || state.operations.primaryJurisdiction;
  state.operations.sellRegions = Array.isArray(input.operations?.sellRegions) && input.operations.sellRegions.length > 0
    ? input.operations.sellRegions
    : state.operations.sellRegions;

  if (input.dataPractices?.collectedData?.includes('cookies')) {
    state.cookies.categories = addUnique(state.cookies.categories, 'necessary');
  }
  if (input.dataPractices?.thirdParties?.includes('analytics')) {
    state.cookies.categories = addUnique(state.cookies.categories, 'analytics');
    state.cookies.thirdParties = addUnique(state.cookies.thirdParties, 'analytics');
  }
  if (input.dataPractices?.thirdParties?.includes('advertising')) {
    state.cookies.categories = addUnique(state.cookies.categories, 'advertising');
    state.cookies.thirdParties = addUnique(state.cookies.thirdParties, 'advertising');
    state.cookies.consentMode = 'banner';
  }
  if (input.dataPractices?.thirdParties?.includes('social')) {
    state.cookies.thirdParties = addUnique(state.cookies.thirdParties, 'social');
  }
  if (input.dataPractices?.thirdParties?.includes('cloud')) {
    state.cookies.thirdParties = addUnique(state.cookies.thirdParties, 'cloud');
  }
  if (input.dataPractices?.thirdParties?.includes('email')) {
    state.cookies.thirdParties = addUnique(state.cookies.thirdParties, 'email');
  }
  if (input.customizations?.manualDisclosures?.some((note) => /cookie|cookies|pixel|remarketing/i.test(note))) {
    state.cookies.categories = addUnique(state.cookies.categories, 'preferences');
  }

  state.cookies.managementUrl = state.contact.pageUrl || state.cookies.managementUrl;
  if ((input.business?.country || '').toLowerCase().includes('argentina') || input.operations?.primaryJurisdiction === 'ar') {
    state.output.language = 'es';
    state.operations.primaryJurisdiction = state.operations.primaryJurisdiction || 'ar';
    state.operations.sellRegions = state.operations.sellRegions.length > 0 ? state.operations.sellRegions : ['ar'];
  }
}

function buildInputFromState(state) {
  return {
    documentType: 'privacy',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    operations: {
      primaryJurisdiction: state.operations.primaryJurisdiction,
      sellRegions: state.operations.sellRegions,
      childrenAudience: state.operations.childrenAudience
    },
    dataPractices: {
      collectedData: state.dataPractices.collectedData,
      thirdParties: state.dataPractices.thirdParties,
      legalBases: state.dataPractices.legalBases
    },
    compliance: {
      requestedFrameworks: state.compliance.requestedFrameworks
    },
    settings: {
      language: state.output.language
    },
    customizations: {
      manualDisclosures: state.manualDisclosures
    }
  };
}

function buildDeletionInputFromState(state) {
  return {
    documentType: 'deletion',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    deletion: {
      ...state.deletion
    },
    settings: {
      language: state.output.language
    }
  };
}

function buildCookiesInputFromState(state) {
  return {
    documentType: 'cookies',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    operations: {
      primaryJurisdiction: state.operations.primaryJurisdiction,
      sellRegions: state.operations.sellRegions
    },
    cookies: {
      ...state.cookies
    },
    settings: {
      language: state.output.language
    }
  };
}

function buildRefundInputFromState(state) {
  return {
    documentType: 'refund',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    refund: {
      ...state.refund
    },
    settings: {
      language: state.output.language
    }
  };
}

function buildDisclaimerInputFromState(state) {
  return {
    documentType: 'disclaimer',
    business: {
      name: state.business.name,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    disclaimer: {
      ...state.disclaimer
    },
    settings: {
      language: state.output.language
    }
  };
}

function buildSecurityInputFromState(state) {
  return {
    documentType: 'security',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    security: {
      ...state.security
    },
    settings: {
      language: state.output.language
    }
  };
}

function buildDpaInputFromState(state) {
  return {
    documentType: 'dpa',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    dpa: {
      ...state.dpa
    },
    settings: {
      language: state.output.language
    }
  };
}

function buildAiInputFromState(state) {
  return {
    documentType: 'ai',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    ai: {
      ...state.ai
    },
    settings: {
      language: state.output.language
    }
  };
}

function buildEulaInputFromState(state) {
  return {
    documentType: 'eula',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    eula: {
      ...state.eula
    },
    settings: {
      language: state.output.language
    }
  };
}

function removeManualNotesByPrefix(state, prefixes) {
  state.manualDisclosures = state.manualDisclosures.filter(
    (entry) => !prefixes.some((prefix) => entry.startsWith(prefix))
  );
}

async function collectBusinessSection(rl, state) {
  removeManualNotesByPrefix(state, ['Tipo de negocio indicado manualmente:']);
  await runQuestions([
    async () => {
      const value = await promptText(rl, '\nNombre del negocio o proyecto', {
        required: true,
        allowEmpty: false,
        defaultValue: state.business.name
      });
      if (value === BACK) return BACK;
      state.business.name = value;
    },
    async () => {
      const value = await promptText(rl, 'URL del sitio o app', {
        allowEmpty: true,
        defaultValue: state.business.websiteUrl
      });
      if (value === BACK) return BACK;
      state.business.websiteUrl = value;
    },
    async () => {
      const businessTypeChoice = await promptSingleChoice(rl, 'Tipo de negocio', BUSINESS_TYPE_OPTIONS);
      if (businessTypeChoice === BACK) return BACK;
      state.business.type = businessTypeChoice.value;
      if (businessTypeChoice.value === 'other') {
        state.manualDisclosures.push(`Tipo de negocio indicado manualmente: ${businessTypeChoice.manualNote}`);
        const baseTypeChoice = await promptSingleChoice(rl, 'Elegí la categoría base más parecida para estructurar la política', BUSINESS_TYPE_OPTIONS, { allowOther: false });
        if (baseTypeChoice === BACK) {
          removeManualNotesByPrefix(state, ['Tipo de negocio indicado manualmente:']);
          return BACK;
        }
        state.business.type = baseTypeChoice.value;
      }
    },
    async () => {
      const value = await promptText(rl, 'País principal del negocio', {
        required: true,
        allowEmpty: false,
        defaultValue: state.business.country || 'United States'
      });
      if (value === BACK) return BACK;
      state.business.country = value;
    },
    async () => {
      const value = await promptText(rl, 'Dirección física o postal del negocio', {
        allowEmpty: true,
        defaultValue: state.business.address
      });
      if (value === BACK) return BACK;
      state.business.address = value;
    }
  ]);
}

async function collectContactSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptText(rl, '\nEmail de privacidad o contacto', {
        allowEmpty: true,
        defaultValue: state.contact.email || defaultContactEmail(state.business.websiteUrl)
      });
      if (value === BACK) return BACK;
      state.contact.email = value;
    },
    async () => {
      const value = await promptText(rl, 'Teléfono de contacto', {
        allowEmpty: true,
        defaultValue: state.contact.phone
      });
      if (value === BACK) return BACK;
      state.contact.phone = value;
    },
    async () => {
      const value = await promptText(rl, 'URL de página de contacto o privacidad', {
        allowEmpty: true,
        defaultValue: state.contact.pageUrl || defaultContactPage(state.business.websiteUrl)
      });
      if (value === BACK) return BACK;
      state.contact.pageUrl = value;
    }
  ]);
}

async function collectOperationsSection(rl, state) {
  removeManualNotesByPrefix(state, ['Jurisdicción personalizada indicada manualmente:', 'Región operativa manual:']);
  await runQuestions([
    async () => {
      const inferredJurisdiction = inferJurisdiction(state.business.country);
      stdout.write(`\nSugerencia de jurisdicción según país: ${optionLabel(JURISDICTION_OPTIONS, inferredJurisdiction)}\n`);
      const jurisdictionChoice = await promptSingleChoice(rl, 'Jurisdicción principal', JURISDICTION_OPTIONS);
      if (jurisdictionChoice === BACK) return BACK;
      state.operations.primaryJurisdiction = jurisdictionChoice.value === 'other' ? 'global' : jurisdictionChoice.value;
      if (jurisdictionChoice.value === 'other') {
        state.manualDisclosures.push(`Jurisdicción personalizada indicada manualmente: ${jurisdictionChoice.manualNote}`);
      }
    },
    async () => {
      const regionsChoice = await promptMultiChoice(rl, 'Regiones donde vendés u operás', REGION_OPTIONS);
      if (regionsChoice === BACK) return BACK;
      state.operations.sellRegions = regionsChoice.values.length > 0
        ? regionsChoice.values
        : [state.operations.primaryJurisdiction].filter((value) => value && value !== 'global');
      if (state.operations.sellRegions.length === 0 && isArgentinaCountry(state.business.country)) {
        state.operations.sellRegions = ['ar'];
      }
      state.manualDisclosures.push(...regionsChoice.manualNotes.map((note) => `Región operativa manual: ${note}`));
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Audiencia infantil',
        'Marcá sí si el servicio está dirigido a menores o si sabés que trata datos de niños.',
        state.operations.childrenAudience
      );
      if (value === BACK) return BACK;
      state.operations.childrenAudience = value;
    }
  ]);
}

async function collectDataSection(rl, state) {
  removeManualNotesByPrefix(state, ['Dato recolectado no listado:', 'Tercero o proveedor no listado:', 'Base legal manual:', 'Marco de cumplimiento manual:']);
  await runQuestions([
    async () => {
      const dataChoice = await promptMultiChoice(rl, 'Qué datos recolectás', DATA_OPTIONS);
      if (dataChoice === BACK) return BACK;
      state.dataPractices.collectedData = dataChoice.values;
      state.manualDisclosures.push(...dataChoice.manualNotes.map((note) => `Dato recolectado no listado: ${note}`));
    },
    async () => {
      const thirdPartiesChoice = await promptMultiChoice(rl, 'Qué terceros o proveedores intervienen', THIRD_PARTY_OPTIONS);
      if (thirdPartiesChoice === BACK) return BACK;
      state.dataPractices.thirdParties = thirdPartiesChoice.values;
      state.manualDisclosures.push(...thirdPartiesChoice.manualNotes.map((note) => `Tercero o proveedor no listado: ${note}`));
    },
    async () => {
      const legalBasesChoice = await promptMultiChoice(rl, 'Qué bases legales usás para tratar los datos', LEGAL_BASE_OPTIONS, { allowNone: false });
      if (legalBasesChoice === BACK) return BACK;
      state.dataPractices.legalBases = legalBasesChoice.values;
      state.manualDisclosures.push(...legalBasesChoice.manualNotes.map((note) => `Base legal manual: ${note}`));
    },
    async () => {
      const complianceChoice = await promptMultiChoice(rl, 'Qué marcos de cumplimiento querés reforzar', COMPLIANCE_OPTIONS);
      if (complianceChoice === BACK) return BACK;
      state.compliance.requestedFrameworks = complianceChoice.values;
      state.manualDisclosures.push(...complianceChoice.manualNotes.map((note) => `Marco de cumplimiento manual: ${note}`));
    },
    async () => {
      if (state.business.type !== 'ecommerce') return;
      const usesPayments = await promptYesNo(
        rl,
        'Pagos y checkout',
        'Para e-commerce, indicá si terceros procesan pagos o checkout.',
        state.dataPractices.thirdParties.includes('payment') || state.dataPractices.thirdParties.includes('paypal_only')
      );
      if (usesPayments === BACK) return BACK;
      if (!usesPayments) {
        state.dataPractices.thirdParties = removeValue(removeValue(state.dataPractices.thirdParties, 'payment'), 'paypal_only');
        return;
      }

      const paymentChoice = await promptSingleChoice(rl, 'Cómo procesás los pagos', [
        { value: 'payment', label: 'Pasarela general o múltiples procesadores', description: 'Mercado Pago, Stripe, gateways mixtos o más de un proveedor de pago.' },
        { value: 'paypal_only', label: 'Sólo PayPal', description: 'Todo el pago pasa por PayPal y no usás otra pasarela principal.' }
      ], { allowOther: false });
      if (paymentChoice === BACK) return BACK;

      state.dataPractices.thirdParties = removeValue(removeValue(state.dataPractices.thirdParties, 'payment'), 'paypal_only');
      state.dataPractices.thirdParties = addUnique(state.dataPractices.thirdParties, paymentChoice.value);
      state.dataPractices.collectedData = addUnique(state.dataPractices.collectedData, 'financial');
    },
    async () => {
      if (state.business.type !== 'ecommerce') return;
      const usesShipping = await promptYesNo(
        rl,
        'Logística y envíos',
        'Indicá si compartís nombre, dirección o teléfono con correo, courier o fulfillment.',
        state.dataPractices.thirdParties.includes('shipping')
      );
      if (usesShipping === BACK) return BACK;
      state.dataPractices.thirdParties = usesShipping
        ? addUnique(state.dataPractices.thirdParties, 'shipping')
        : removeValue(state.dataPractices.thirdParties, 'shipping');
    },
    async () => {
      if (state.business.type !== 'ecommerce') return;
      const usesTaxData = await promptYesNo(
        rl,
        'Facturación y datos fiscales',
        'Indicá si emitís factura o retenés datos fiscales, contables o de facturación.',
        state.dataPractices.collectedData.includes('tax')
      );
      if (usesTaxData === BACK) return BACK;
      state.dataPractices.collectedData = usesTaxData
        ? addUnique(state.dataPractices.collectedData, 'tax')
        : removeValue(state.dataPractices.collectedData, 'tax');
    },
    async () => {
      if (state.business.type !== 'ecommerce') return;
      const usesIdentityData = await promptYesNo(
        rl,
        'Verificación e identidad comercial',
        'Indicá si pedís documento, CUIT/CUIL u otra verificación para fraude, retiros o validación comercial.',
        state.dataPractices.collectedData.includes('identity')
      );
      if (usesIdentityData === BACK) return BACK;
      state.dataPractices.collectedData = usesIdentityData
        ? addUnique(state.dataPractices.collectedData, 'identity')
        : removeValue(state.dataPractices.collectedData, 'identity');
    },
    async () => {
      const usesProfiling = await promptYesNo(
        rl,
        'Perfilado o decisiones automatizadas',
        'Marcá sí si usás scoring, segmentación, personalización relevante o decisiones automáticas sobre usuarios.',
        state.dataPractices.collectedData.includes('profiling')
      );
      if (usesProfiling === BACK) return BACK;
      state.dataPractices.collectedData = usesProfiling
        ? addUnique(state.dataPractices.collectedData, 'profiling')
        : removeValue(state.dataPractices.collectedData, 'profiling');
    }
  ]);
}

async function collectOutputSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptYesNo(
        rl,
        'Generar URL pública hasheada',
        'Si respondés sí, se crea un HTML con nombre hasheado en un directorio local publicable y se imprime una URL final esperada. Esa URL sólo funciona si ya tenés hosting o un servidor que sirva públicamente ese directorio.',
        state.output.publishHashedUrl
      );
      if (value === BACK) return BACK;
      state.output.publishHashedUrl = value;
      if (value) {
        state.output.format = 'html';
      } else {
        state.output.baseUrl = '';
        state.output.publishDir = '';
      }
    },
    async () => {
      if (!state.output.publishHashedUrl) return;
      const value = await promptText(rl, 'Base URL pública', {
        required: true,
        allowEmpty: false,
        defaultValue: state.output.baseUrl || defaultBaseUrlForDocument(state.documentType || 'privacy')
      });
      if (value === BACK) return BACK;
      state.output.baseUrl = value;
    },
    async () => {
      if (!state.output.publishHashedUrl) return;
      const value = await promptText(rl, 'Directorio local publicable', {
        required: true,
        allowEmpty: false,
        defaultValue: state.output.publishDir || defaultPublishDirForDocument(state.documentType || 'privacy')
      });
      if (value === BACK) return BACK;
      state.output.publishDir = value;
    },
    async () => {
      const value = await promptSingleChoice(rl, 'Idioma de salida', OUTPUT_LANGUAGE_OPTIONS, { allowOther: false });
      if (value === BACK) return BACK;
      state.output.language = value.value;
    },
    async () => {
      const value = await promptSingleChoice(rl, 'Formato de salida', OUTPUT_FORMAT_OPTIONS, { allowOther: false });
      if (value === BACK) return BACK;
      state.output.format = state.output.publishHashedUrl ? 'html' : value.value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Guardar a archivo',
        'Si respondés sí, además de generar el texto te voy a pedir una ruta de salida.',
        state.output.format !== 'text'
      );
      if (value === BACK) return BACK;
      state.output.writeToFile = value;
      if (!value) state.output.outputPath = '';
    },
    async () => {
      if (!state.output.writeToFile) return;
      const suffix = documentOutputSuffix(state.documentType);
      const baseName = `${slugify(state.business.name)}-${suffix}`;
      const value = await promptText(rl, 'Ruta de salida', {
        required: true,
        allowEmpty: false,
        defaultValue: state.output.outputPath || (
          state.output.format === 'html'
            ? `${baseName}.html`
            : state.output.format === 'markdown'
              ? `${baseName}.md`
              : `${baseName}.txt`
        )
      });
      if (value === BACK) return BACK;
      state.output.outputPath = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Guardar también el input JSON',
        'Sirve para regenerar o editar la política después sin repetir el cuestionario.',
        true
      );
      if (value === BACK) return BACK;
      state.output.saveInput = value;
      if (!value) state.output.inputPath = '';
    },
    async () => {
      if (!state.output.saveInput) return;
      const suffix = documentOutputSuffix(state.documentType);
      const baseName = `${slugify(state.business.name)}-${suffix}`;
      const value = await promptText(rl, 'Ruta para guardar el JSON', {
        required: true,
        allowEmpty: false,
        defaultValue: state.output.inputPath || `${baseName}-input.json`
      });
      if (value === BACK) return BACK;
      state.output.inputPath = value;
    }
  ]);
}

function printSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Tipo: ${optionLabel(BUSINESS_TYPE_OPTIONS, state.business.type || '(sin definir)')}\n`);
  stdout.write(`- País: ${state.business.country || '(sin definir)'}\n`);
  stdout.write(`- Jurisdicción principal: ${optionLabel(JURISDICTION_OPTIONS, state.operations.primaryJurisdiction || '(sin definir)')}\n`);
  stdout.write(`- Regiones operativas: ${optionLabels(REGION_OPTIONS, state.operations.sellRegions)}\n`);
  stdout.write(`- Datos recolectados: ${optionLabels(DATA_OPTIONS, state.dataPractices.collectedData)}\n`);
  stdout.write(`- Terceros: ${optionLabels(THIRD_PARTY_OPTIONS, state.dataPractices.thirdParties)}\n`);
  stdout.write(`- Bases legales: ${optionLabels(LEGAL_BASE_OPTIONS, state.dataPractices.legalBases)}\n`);
  stdout.write(`- Compliance: ${optionLabels(COMPLIANCE_OPTIONS, state.compliance.requestedFrameworks)}\n`);
  stdout.write(`- Contacto: ${state.contact.email || state.contact.pageUrl || state.contact.phone || state.business.address || '(faltante)'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) {
    stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  }
  stdout.write(`- Guardar política a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (state.manualDisclosures.length > 0) {
    stdout.write(`- Notas manuales: ${state.manualDisclosures.length}\n`);
  }
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

function buildTermsInputFromState(state) {
  return {
    documentType: 'terms',
    business: {
      name: state.business.name,
      type: state.business.type,
      websiteUrl: state.business.websiteUrl,
      country: state.business.country,
      address: state.business.address
    },
    contact: {
      email: state.contact.email,
      phone: state.contact.phone,
      pageUrl: state.contact.pageUrl
    },
    operations: {
      primaryJurisdiction: state.operations.primaryJurisdiction,
      sellRegions: state.operations.sellRegions
    },
    terms: { ...state.terms },
    settings: {
      language: state.output.language
    },
    customizations: {
      manualDisclosures: state.manualDisclosures
    }
  };
}

async function promptDocumentChoice(rl) {
  const choice = await promptSingleChoice(rl, 'Qué querés generar', DOCUMENT_OPTIONS, { allowOther: false, allowBack: false });
  return choice.value;
}

async function maybePreloadTermsFromPrivacy(rl, state) {
  const reuse = await promptYesNo(
    rl,
    'Reutilizar datos desde privacidad',
    'Marcá sí si ya generaste una política de privacidad y querés precargar negocio, contacto, jurisdicción y algunas señales operativas.',
    false,
    false
  );

  if (!reuse) {
    return;
  }

  const candidates = await listReusablePrivacyInputs();

  if (candidates.length > 0) {
    stdout.write(`\n${bold(cyan('JSON de privacidad detectados'))}\n`);
    candidates.forEach((candidate, index) => {
      stdout.write(`  ${yellow(String(index + 1))}. ${bold(candidate.label)}\n`);
      stdout.write(`     ${dim(candidate.description)}\n`);
    });
    stdout.write(`  ${yellow(String(candidates.length + 1))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Escribís manualmente la ruta de otro JSON de privacidad.')}\n`);

    while (true) {
      const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
      const choice = Number.parseInt(answer, 10);

      if (Number.isInteger(choice) && choice >= 1 && choice <= candidates.length) {
        const selected = candidates[choice - 1];
        const imported = await readJsonFile(selected.path);
        mergeTermsStateFromPrivacyInput(state, imported);
        state.output.importPath = selected.path;
        stdout.write(`${green(`Importé datos compartidos desde ${selected.label}`)}\n`);
        return;
      }

      if (choice === candidates.length + 1) {
        break;
      }

      stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
    }
  }

  while (true) {
    const inputPath = await promptText(rl, 'Ruta del JSON de privacidad a reutilizar', {
      required: true,
      allowEmpty: false,
      defaultValue: state.output.importPath || 'wizard-input.json'
    });
    if (inputPath === BACK) {
      continue;
    }

    try {
      const imported = await readJsonFile(inputPath);
      mergeTermsStateFromPrivacyInput(state, imported);
      state.output.importPath = inputPath;
      stdout.write(`${green(`Importé datos compartidos desde ${inputPath}`)}\n`);
      return;
    } catch (error) {
      stdout.write(`${red(`No pude leer ese JSON: ${error.message}`)}\n`);
    }
  }
}

async function maybePreloadDeletionFromPrivacy(rl, state) {
  const reuse = await promptYesNo(
    rl,
    'Reutilizar datos desde privacidad',
    'Marcá sí si ya generaste una política de privacidad y querés precargar negocio, contacto y señales operativas.',
    false,
    false
  );

  if (!reuse) {
    return;
  }

  const candidates = await listReusablePrivacyInputs();
  if (candidates.length > 0) {
    stdout.write(`\n${bold(cyan('JSON de privacidad detectados'))}\n`);
    candidates.forEach((candidate, index) => {
      stdout.write(`  ${yellow(String(index + 1))}. ${bold(candidate.label)}\n`);
      stdout.write(`     ${dim(candidate.description)}\n`);
    });
    stdout.write(`  ${yellow(String(candidates.length + 1))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Escribís manualmente la ruta de otro JSON de privacidad.')}\n`);

    while (true) {
      const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
      const choice = Number.parseInt(answer, 10);

      if (Number.isInteger(choice) && choice >= 1 && choice <= candidates.length) {
        const selected = candidates[choice - 1];
        const imported = await readJsonFile(selected.path);
        mergeDeletionStateFromPrivacyInput(state, imported);
        state.output.importPath = selected.path;
        stdout.write(`${green(`Importé datos compartidos desde ${selected.label}`)}\n`);
        return;
      }

      if (choice === candidates.length + 1) {
        break;
      }

      stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
    }
  }

  while (true) {
    const inputPath = await promptText(rl, 'Ruta del JSON de privacidad a reutilizar', {
      required: true,
      allowEmpty: false,
      defaultValue: state.output.importPath || 'wizard-input.json'
    });
    if (inputPath === BACK) {
      continue;
    }

    try {
      const imported = await readJsonFile(inputPath);
      mergeDeletionStateFromPrivacyInput(state, imported);
      state.output.importPath = inputPath;
      stdout.write(`${green(`Importé datos compartidos desde ${inputPath}`)}\n`);
      return;
    } catch (error) {
      stdout.write(`${red(`No pude leer ese JSON: ${error.message}`)}\n`);
    }
  }
}

async function maybePreloadCookiesFromPrivacy(rl, state) {
  const reuse = await promptYesNo(
    rl,
    'Reutilizar datos desde privacidad',
    'Marcá sí si ya generaste una política de privacidad y querés precargar negocio, contacto y señales de cookies/terceros.',
    false,
    false
  );

  if (!reuse) {
    return;
  }

  const candidates = await listReusablePrivacyInputs();
  if (candidates.length > 0) {
    stdout.write(`\n${bold(cyan('JSON de privacidad detectados'))}\n`);
    candidates.forEach((candidate, index) => {
      stdout.write(`  ${yellow(String(index + 1))}. ${bold(candidate.label)}\n`);
      stdout.write(`     ${dim(candidate.description)}\n`);
    });
    stdout.write(`  ${yellow(String(candidates.length + 1))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Escribís manualmente la ruta de otro JSON de privacidad.')}\n`);

    while (true) {
      const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
      const choice = Number.parseInt(answer, 10);

      if (Number.isInteger(choice) && choice >= 1 && choice <= candidates.length) {
        const selected = candidates[choice - 1];
        const imported = await readJsonFile(selected.path);
        mergeCookiesStateFromPrivacyInput(state, imported);
        state.output.importPath = selected.path;
        stdout.write(`${green(`Importé datos compartidos desde ${selected.label}`)}\n`);
        return;
      }

      if (choice === candidates.length + 1) {
        break;
      }

      stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
    }
  }

  while (true) {
    const inputPath = await promptText(rl, 'Ruta del JSON de privacidad a reutilizar', {
      required: true,
      allowEmpty: false,
      defaultValue: state.output.importPath || 'wizard-input.json'
    });
    if (inputPath === BACK) {
      continue;
    }

    try {
      const imported = await readJsonFile(inputPath);
      mergeCookiesStateFromPrivacyInput(state, imported);
      state.output.importPath = inputPath;
      stdout.write(`${green(`Importé datos compartidos desde ${inputPath}`)}\n`);
      return;
    } catch (error) {
      stdout.write(`${red(`No pude leer ese JSON: ${error.message}`)}\n`);
    }
  }
}

async function maybePreloadRefundFromPrivacy(rl, state) {
  const reuse = await promptYesNo(
    rl,
    'Reutilizar datos desde privacidad',
    'Marcá sí si ya generaste una política de privacidad y querés precargar negocio, contacto y contexto general.',
    false,
    false
  );

  if (!reuse) {
    return;
  }

  const candidates = await listReusablePrivacyInputs();
  if (candidates.length > 0) {
    stdout.write(`\n${bold(cyan('JSON de privacidad detectados'))}\n`);
    candidates.forEach((candidate, index) => {
      stdout.write(`  ${yellow(String(index + 1))}. ${bold(candidate.label)}\n`);
      stdout.write(`     ${dim(candidate.description)}\n`);
    });
    stdout.write(`  ${yellow(String(candidates.length + 1))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Escribís manualmente la ruta de otro JSON de privacidad.')}\n`);

    while (true) {
      const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
      const choice = Number.parseInt(answer, 10);

      if (Number.isInteger(choice) && choice >= 1 && choice <= candidates.length) {
        const selected = candidates[choice - 1];
        const imported = await readJsonFile(selected.path);
        state.business.name = imported.business?.name || state.business.name;
        state.business.type = imported.business?.type || state.business.type;
        state.business.websiteUrl = imported.business?.websiteUrl || state.business.websiteUrl;
        state.business.country = imported.business?.country || state.business.country;
        state.business.address = imported.business?.address || state.business.address;
        state.contact.email = imported.contact?.email || state.contact.email;
        state.contact.phone = imported.contact?.phone || state.contact.phone;
        state.contact.pageUrl = imported.contact?.pageUrl || state.contact.pageUrl;
        if (imported.business?.type === 'ecommerce') {
          state.refund.offeringType = 'physical_goods';
        }
        state.output.importPath = selected.path;
        stdout.write(`${green(`Importé datos compartidos desde ${selected.label}`)}\n`);
        return;
      }

      if (choice === candidates.length + 1) {
        break;
      }

      stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
    }
  }

  while (true) {
    const inputPath = await promptText(rl, 'Ruta del JSON de privacidad a reutilizar', {
      required: true,
      allowEmpty: false,
      defaultValue: state.output.importPath || 'wizard-input.json'
    });
    if (inputPath === BACK) {
      continue;
    }

    try {
      const imported = await readJsonFile(inputPath);
      state.business.name = imported.business?.name || state.business.name;
      state.business.type = imported.business?.type || state.business.type;
      state.business.websiteUrl = imported.business?.websiteUrl || state.business.websiteUrl;
      state.business.country = imported.business?.country || state.business.country;
      state.business.address = imported.business?.address || state.business.address;
      state.contact.email = imported.contact?.email || state.contact.email;
      state.contact.phone = imported.contact?.phone || state.contact.phone;
      state.contact.pageUrl = imported.contact?.pageUrl || state.contact.pageUrl;
      if (imported.business?.type === 'ecommerce') {
        state.refund.offeringType = 'physical_goods';
      }
      state.output.importPath = inputPath;
      stdout.write(`${green(`Importé datos compartidos desde ${inputPath}`)}\n`);
      return;
    } catch (error) {
      stdout.write(`${red(`No pude leer ese JSON: ${error.message}`)}\n`);
    }
  }
}

async function maybePreloadDisclaimerFromPrivacy(rl, state) {
  const reuse = await promptYesNo(
    rl,
    'Reutilizar datos desde privacidad',
    'Marcá sí si ya generaste una política de privacidad y querés precargar negocio y contacto.',
    false,
    false
  );
  if (!reuse) return;

  const candidates = await listReusablePrivacyInputs();
  if (candidates.length > 0) {
    stdout.write(`\n${bold(cyan('JSON de privacidad detectados'))}\n`);
    candidates.forEach((candidate, index) => {
      stdout.write(`  ${yellow(String(index + 1))}. ${bold(candidate.label)}\n`);
      stdout.write(`     ${dim(candidate.description)}\n`);
    });
    stdout.write(`  ${yellow(String(candidates.length + 1))}. ${bold('Otro')}\n`);
    stdout.write(`     ${dim('Escribís manualmente la ruta de otro JSON de privacidad.')}\n`);

    while (true) {
      const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
      const choice = Number.parseInt(answer, 10);
      if (Number.isInteger(choice) && choice >= 1 && choice <= candidates.length) {
        const imported = await readJsonFile(candidates[choice - 1].path);
        state.business.name = imported.business?.name || state.business.name;
        state.business.websiteUrl = imported.business?.websiteUrl || state.business.websiteUrl;
        state.business.country = imported.business?.country || state.business.country;
        state.business.address = imported.business?.address || state.business.address;
        state.contact.email = imported.contact?.email || state.contact.email;
        state.contact.phone = imported.contact?.phone || state.contact.phone;
        state.contact.pageUrl = imported.contact?.pageUrl || state.contact.pageUrl;
        state.output.importPath = candidates[choice - 1].path;
        stdout.write(`${green(`Importé datos compartidos desde ${candidates[choice - 1].label}`)}\n`);
        return;
      }
      if (choice === candidates.length + 1) break;
      stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
    }
  }

  while (true) {
    const inputPath = await promptText(rl, 'Ruta del JSON de privacidad a reutilizar', {
      required: true,
      allowEmpty: false,
      defaultValue: state.output.importPath || 'wizard-input.json'
    });
    if (inputPath === BACK) continue;
    try {
      const imported = await readJsonFile(inputPath);
      state.business.name = imported.business?.name || state.business.name;
      state.business.websiteUrl = imported.business?.websiteUrl || state.business.websiteUrl;
      state.business.country = imported.business?.country || state.business.country;
      state.business.address = imported.business?.address || state.business.address;
      state.contact.email = imported.contact?.email || state.contact.email;
      state.contact.phone = imported.contact?.phone || state.contact.phone;
      state.contact.pageUrl = imported.contact?.pageUrl || state.contact.pageUrl;
      state.output.importPath = inputPath;
      stdout.write(`${green(`Importé datos compartidos desde ${inputPath}`)}\n`);
      return;
    } catch (error) {
      stdout.write(`${red(`No pude leer ese JSON: ${error.message}`)}\n`);
    }
  }
}

async function collectTermsServiceSection(rl, state) {
  removeManualNotesByPrefix(state, ['Tipo de oferta manual:', 'Restricción adicional:', 'Disclaimer manual:']);
  await runQuestions([
    async () => {
      const offeringChoice = await promptSingleChoice(rl, 'Qué vendés u ofrecés', TERMS_OFFERING_OPTIONS);
      if (offeringChoice === BACK) return BACK;
      state.terms.offeringType = offeringChoice.value;
      if (offeringChoice.value === 'other') {
        state.manualDisclosures.push(`Tipo de oferta manual: ${offeringChoice.manualNote}`);
        const baseChoice = await promptSingleChoice(rl, 'Elegí la categoría base más parecida para estructurar los términos', TERMS_OFFERING_OPTIONS, { allowOther: false });
        if (baseChoice === BACK) return BACK;
        state.terms.offeringType = baseChoice.value;
      }
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Cuentas de usuario',
        'Marcá sí si el sitio permite crear cuentas o perfiles de usuario.',
        state.terms.hasAccounts
      );
      if (value === BACK) return BACK;
      state.terms.hasAccounts = value;
      if (!value) {
        state.terms.requiresRegistration = false;
      }
    },
    async () => {
      if (!state.terms.hasAccounts) return;
      const value = await promptYesNo(
        rl,
        'Registro obligatorio',
        'Marcá sí si la compra o el uso principal requiere registrarse.',
        state.terms.requiresRegistration
      );
      if (value === BACK) return BACK;
      state.terms.requiresRegistration = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Contenido de usuarios',
        'Marcá sí si los usuarios pueden subir reseñas, comentarios, fotos u otro contenido.',
        state.terms.allowsUserContent
      );
      if (value === BACK) return BACK;
      state.terms.allowsUserContent = value;
    }
  ]);
}

async function collectTermsCommerceSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptText(rl, 'Moneda principal del sitio', {
        required: false,
        allowEmpty: true,
        defaultValue: state.terms.currency || 'ARS'
      });
      if (value === BACK) return BACK;
      state.terms.currency = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Precios con impuestos incluidos',
        'Marcá sí si los precios se muestran con IVA u otros impuestos incluidos.',
        state.terms.pricesIncludeTaxes
      );
      if (value === BACK) return BACK;
      state.terms.pricesIncludeTaxes = value;
    },
    async () => {
      const value = await promptText(rl, 'Proveedor o pasarela de pago', {
        allowEmpty: true,
        defaultValue: state.terms.paymentProvider
      });
      if (value === BACK) return BACK;
      state.terms.paymentProvider = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Ofrecés reembolsos, cambios o devoluciones',
        'Marcá sí si el negocio contempla devoluciones, cambios o reembolsos.',
        state.terms.refundsOffered
      );
      if (value === BACK) return BACK;
      state.terms.refundsOffered = value;
      if (!value) {
        state.terms.refundWindow = '';
        state.terms.refundConditions = '';
        state.terms.returnShippingResponsibility = '';
      }
    },
    async () => {
      if (!state.terms.refundsOffered) return;
      const value = await promptText(rl, 'Plazo general para pedir devolución o cambio', {
        allowEmpty: true,
        defaultValue: state.terms.refundWindow || '10 días'
      });
      if (value === BACK) return BACK;
      state.terms.refundWindow = value;
    },
    async () => {
      if (!state.terms.refundsOffered) return;
      const value = await promptText(rl, 'Condiciones de devolución o reembolso', {
        allowEmpty: true,
        defaultValue: state.terms.refundConditions
      });
      if (value === BACK) return BACK;
      state.terms.refundConditions = value;
    },
    async () => {
      if (!state.terms.refundsOffered) return;
      const choice = await promptSingleChoice(rl, 'Quién asume el envío de devolución', TERMS_RETURN_SHIPPING_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.terms.returnShippingResponsibility = choice.value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Ofrecés garantía',
        'Marcá sí si vendés productos o servicios con garantía específica.',
        state.terms.warrantyOffered
      );
      if (value === BACK) return BACK;
      state.terms.warrantyOffered = value;
      if (!value) {
        state.terms.warrantyDetails = '';
      }
    },
    async () => {
      if (!state.terms.warrantyOffered) return;
      const value = await promptText(rl, 'Detalle breve de la garantía', {
        allowEmpty: true,
        defaultValue: state.terms.warrantyDetails
      });
      if (value === BACK) return BACK;
      state.terms.warrantyDetails = value;
    }
  ]);
}

async function collectTermsRulesSection(rl, state) {
  await runQuestions([
    async () => {
      const restrictions = await promptMultiChoice(rl, 'Qué conductas querés prohibir de forma expresa', TERMS_STANDARD_RESTRICTIONS);
      if (restrictions === BACK) return BACK;
      state.terms.prohibitedActivities = restrictions.values;
      state.manualDisclosures.push(...restrictions.manualNotes.map((note) => `Restricción adicional: ${note}`));
    },
    async () => {
      const value = await promptText(rl, 'Dueño del contenido, marca o material del sitio', {
        allowEmpty: true,
        defaultValue: state.terms.ipOwner || state.business.name
      });
      if (value === BACK) return BACK;
      state.terms.ipOwner = value;
    },
    async () => {
      if (!state.terms.allowsUserContent) return;
      const value = await promptYesNo(
        rl,
        'Licencia sobre reseñas o contenido de usuarios',
        'Marcá sí si el usuario te autoriza a mostrar sus reseñas o contenido en el sitio o redes.',
        state.terms.ugcLicenseGranted
      );
      if (value === BACK) return BACK;
      state.terms.ugcLicenseGranted = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Limitar daños indirectos',
        'Marcá sí si querés una cláusula estándar de limitación de responsabilidad por daños indirectos.',
        state.terms.limitIndirectDamages
      );
      if (value === BACK) return BACK;
      state.terms.limitIndirectDamages = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Aclarar demoras de transporte',
        'Marcá sí si querés aclarar que no controlás totalmente las demoras del courier una vez despachado el pedido.',
        state.terms.shippingDelayDisclaimer
      );
      if (value === BACK) return BACK;
      state.terms.shippingDelayDisclaimer = value;
    },
    async () => {
      const value = await promptText(rl, 'Disclaimer o aclaración adicional', {
        allowEmpty: true,
        defaultValue: state.terms.customDisclaimer
      });
      if (value === BACK) return BACK;
      state.terms.customDisclaimer = value;
    }
  ]);
}

async function collectTermsLegalSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptYesNo(
        rl,
        'Podés suspender cuentas o pedidos',
        'Marcá sí si querés reservarte la facultad de suspender cuentas, pedidos o acceso por incumplimiento.',
        state.terms.maySuspendAccounts
      );
      if (value === BACK) return BACK;
      state.terms.maySuspendAccounts = value;
    },
    async () => {
      const value = await promptText(rl, 'Motivos típicos de suspensión o terminación', {
        allowEmpty: true,
        defaultValue: state.terms.terminationGrounds
      });
      if (value === BACK) return BACK;
      state.terms.terminationGrounds = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Cómo notificás cambios en los términos', TERMS_CHANGE_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.terms.changeNotification = choice.value;
    },
    async () => {
      const argentinaForumDefault = isArgentinaCountry(state.business.country)
        ? 'Tribunales competentes de la Ciudad Autónoma de Buenos Aires'
        : '';
      const value = await promptText(rl, 'Jurisdicción o foro para reclamos', {
        required: true,
        allowEmpty: false,
        defaultValue: state.terms.disputesForum || argentinaForumDefault || (state.business.country ? `Tribunales competentes de ${state.business.country}` : '')
      });
      if (value === BACK) return BACK;
      state.terms.disputesForum = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Método alternativo de resolución de disputas', TERMS_ADR_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.terms.adrMethod = choice.value;
    }
  ]);
}

function printTermsSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Documento: Términos y condiciones\n`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}\n`);
  stdout.write(`- Tipo de negocio: ${optionLabel(BUSINESS_TYPE_OPTIONS, state.business.type || '(sin definir)')}\n`);
  stdout.write(`- Qué ofrece: ${optionLabel(TERMS_OFFERING_OPTIONS, state.terms.offeringType || '(sin definir)')}\n`);
  stdout.write(`- País: ${state.business.country || '(sin definir)'}\n`);
  stdout.write(`- Jurisdicción principal: ${optionLabel(JURISDICTION_OPTIONS, state.operations.primaryJurisdiction || '(sin definir)')}\n`);
  stdout.write(`- Proveedor de pago: ${state.terms.paymentProvider || '(sin definir)'}\n`);
  stdout.write(`- Moneda: ${state.terms.currency || '(sin definir)'}\n`);
  stdout.write(`- Reembolsos / cambios: ${state.terms.refundsOffered ? 'sí' : 'no'}\n`);
  stdout.write(`- Garantía: ${state.terms.warrantyOffered ? 'sí' : 'no'}\n`);
  stdout.write(`- Foro de disputas: ${state.terms.disputesForum || '(sin definir)'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) {
    stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  }
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (state.manualDisclosures.length > 0) {
    stdout.write(`- Notas manuales: ${state.manualDisclosures.length}\n`);
  }
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

async function collectDeletionSection(rl, state) {
  await runQuestions([
    async () => {
      const choice = await promptSingleChoice(rl, 'Cómo se solicita la eliminación de datos', DELETION_CHANNEL_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.deletion.requestChannel = choice.value;
    },
    async () => {
      if (!['email', 'both'].includes(state.deletion.requestChannel)) return;
      const value = await promptText(rl, 'Email para pedidos de eliminación', {
        allowEmpty: true,
        defaultValue: state.deletion.requestEmail || state.contact.email
      });
      if (value === BACK) return BACK;
      state.deletion.requestEmail = value;
    },
    async () => {
      if (!['form', 'both'].includes(state.deletion.requestChannel)) return;
      const value = await promptText(rl, 'URL de página o formulario de eliminación', {
        allowEmpty: true,
        defaultValue: state.deletion.requestUrl || state.contact.pageUrl || state.business.websiteUrl
      });
      if (value === BACK) return BACK;
      state.deletion.requestUrl = value;
    },
    async () => {
      const choice = await promptMultiChoice(rl, 'Qué datos debe incluir el usuario en la solicitud', DELETION_IDENTITY_OPTIONS, { allowNone: false });
      if (choice === BACK) return BACK;
      state.deletion.identityRequirements = choice.values;
    },
    async () => {
      const choice = await promptMultiChoice(rl, 'Qué datos o recursos se eliminarán normalmente', DELETION_SCOPE_OPTIONS, { allowNone: false });
      if (choice === BACK) return BACK;
      state.deletion.deletionScope = choice.values;
    },
    async () => {
      const choice = await promptMultiChoice(rl, 'Qué datos podrían conservarse por excepción', DELETION_RETENTION_OPTIONS);
      if (choice === BACK) return BACK;
      state.deletion.retentionExceptions = choice.values;
    },
    async () => {
      const value = await promptText(rl, 'Tiempo estimado para responder', {
        allowEmpty: true,
        defaultValue: state.deletion.responseTime || '10 días hábiles'
      });
      if (value === BACK) return BACK;
      state.deletion.responseTime = value;
    },
    async () => {
      const value = await promptText(rl, 'Tiempo estimado para completar la eliminación', {
        allowEmpty: true,
        defaultValue: state.deletion.completionTime || '30 días'
      });
      if (value === BACK) return BACK;
      state.deletion.completionTime = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Conexión con Meta o Facebook',
        'Marcá sí si la app usa login con Meta/Facebook o se conecta a APIs de Meta.',
        state.deletion.hasMetaConnection
      );
      if (value === BACK) return BACK;
      state.deletion.hasMetaConnection = value;
    },
    async () => {
      if (!state.deletion.hasMetaConnection) return;
      const value = await promptText(rl, 'Instrucción adicional para revocar permisos o desvincular Meta', {
        allowEmpty: true,
        defaultValue: state.deletion.metaDisconnectInstructions
      });
      if (value === BACK) return BACK;
      state.deletion.metaDisconnectInstructions = value;
    }
  ]);
}

function printDeletionSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Documento: Eliminación de datos\n`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}\n`);
  stdout.write(`- Canal de solicitud: ${optionLabel(DELETION_CHANNEL_OPTIONS, state.deletion.requestChannel || '(sin definir)')}\n`);
  stdout.write(`- Email de eliminación: ${state.deletion.requestEmail || '(sin definir)'}\n`);
  stdout.write(`- URL de eliminación: ${state.deletion.requestUrl || '(sin definir)'}\n`);
  stdout.write(`- Datos requeridos: ${state.deletion.identityRequirements.length || 0}\n`);
  stdout.write(`- Alcance de eliminación: ${state.deletion.deletionScope.length || 0}\n`);
  stdout.write(`- Meta/Facebook: ${state.deletion.hasMetaConnection ? 'sí' : 'no'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) {
    stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  }
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

async function collectCookiesSection(rl, state) {
  await runQuestions([
    async () => {
      const choice = await promptMultiChoice(rl, 'Qué categorías de cookies o tecnologías similares usás', COOKIE_CATEGORY_OPTIONS, { allowNone: false, allowOther: false });
      if (choice === BACK) return BACK;
      state.cookies.categories = choice.values;
    },
    async () => {
      const choice = await promptMultiChoice(rl, 'Qué terceros pueden colocar o leer cookies', COOKIE_PROVIDER_OPTIONS, { allowOther: true });
      if (choice === BACK) return BACK;
      state.cookies.thirdParties = choice.values;
      state.cookies.notes = choice.manualNotes;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Cómo gestionás el consentimiento de cookies', COOKIE_CONSENT_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.cookies.consentMode = choice.value;
    },
    async () => {
      const value = await promptText(rl, 'URL o página para gestionar cookies', {
        allowEmpty: true,
        defaultValue: state.cookies.managementUrl || state.contact.pageUrl || state.business.websiteUrl
      });
      if (value === BACK) return BACK;
      state.cookies.managementUrl = value;
    },
    async () => {
      const value = await promptText(rl, 'Cómo puede el usuario deshabilitar cookies desde navegador o dispositivo', {
        allowEmpty: true,
        defaultValue: state.cookies.browserControls || 'Puede usar la configuración del navegador para bloquear o eliminar cookies.'
      });
      if (value === BACK) return BACK;
      state.cookies.browserControls = value;
    },
    async () => {
      const value = await promptText(rl, 'Nota sobre duración o retención de cookies', {
        allowEmpty: true,
        defaultValue: state.cookies.retentionPolicy || 'Algunas cookies son de sesión y otras persisten por más tiempo según su finalidad y proveedor.'
      });
      if (value === BACK) return BACK;
      state.cookies.retentionPolicy = value;
    }
  ]);
}

function printCookiesSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Documento: Política de cookies\n`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}\n`);
  stdout.write(`- Categorías: ${state.cookies.categories.length > 0 ? state.cookies.categories.map((value) => optionLabel(COOKIE_CATEGORY_OPTIONS, value)).join(', ') : '(sin definir)'}\n`);
  stdout.write(`- Terceros: ${state.cookies.thirdParties.length > 0 ? state.cookies.thirdParties.map((value) => optionLabel(COOKIE_PROVIDER_OPTIONS, value)).join(', ') : '(sin definir)'}\n`);
  stdout.write(`- Consentimiento: ${optionLabel(COOKIE_CONSENT_OPTIONS, state.cookies.consentMode || '(sin definir)')}\n`);
  stdout.write(`- Página de gestión: ${state.cookies.managementUrl || '(sin definir)'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) {
    stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  }
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

async function promptCookiesReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar política de cookies')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar jurisdicción y operación')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar cookies y consentimiento')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('7')}. ${bold('Cancelar')}\n`);

  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 7) {
      return choice;
    }
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runCookiesWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'cookies',
    business: { name: '', type: 'saas', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
    cookies: {
      categories: ['necessary'],
      thirdParties: [],
      consentMode: 'banner',
      managementUrl: '',
      browserControls: 'Puede usar la configuración del navegador para bloquear o eliminar cookies.',
      retentionPolicy: 'Algunas cookies son de sesión y otras persisten por más tiempo según su finalidad y proveedor.',
      notes: []
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('cookies'), publishDir: defaultPublishDirForDocument('cookies'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de política de cookies'))}\n`);
    stdout.write(`${dim('Te voy a ayudar a generar una política de cookies clara y publicable.')}\n`);
    await maybePreloadCookiesFromPrivacy(rl, state);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectOperationsSection(rl, state);
    await collectCookiesSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildCookiesInputFromState(state);
      const validation = await generator.validate(input);

      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }

      printCookiesSummary(state, validation);
      const action = await promptCookiesReviewAction(rl);

      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectOperationsSection(rl, state); continue; }
      if (action === 5) { await collectCookiesSection(rl, state); continue; }
      if (action === 6) { await collectOutputSection(rl, state); continue; }
      if (action === 7) { stdout.write(`${yellow('Wizard cancelado.')}\n`); return; }

      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-cookies-policy-input.json`), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-cookies-policy-input.json`}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('cookies'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('cookies')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé la política de cookies en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

async function collectRefundSection(rl, state) {
  await runQuestions([
    async () => {
      const choice = await promptSingleChoice(rl, 'Qué tipo de compra cubre esta política', REFUND_OFFERING_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.refund.offeringType = choice.value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Aceptás devoluciones o reembolsos',
        'Marcá sí si normalmente aceptás devoluciones, cambios o reembolsos bajo ciertas condiciones.',
        state.refund.acceptsReturns
      );
      if (value === BACK) return BACK;
      state.refund.acceptsReturns = value;
    },
    async () => {
      if (!state.refund.acceptsReturns) return;
      const value = await promptText(rl, 'Plazo general para pedir devolución o reembolso', {
        allowEmpty: true,
        defaultValue: state.refund.refundWindow || '10 días'
      });
      if (value === BACK) return BACK;
      state.refund.refundWindow = value;
    },
    async () => {
      if (!state.refund.acceptsReturns) return;
      const value = await promptText(rl, 'Plazo general para cambios', {
        allowEmpty: true,
        defaultValue: state.refund.exchangeWindow
      });
      if (value === BACK) return BACK;
      state.refund.exchangeWindow = value;
    },
    async () => {
      const value = await promptText(rl, 'Condiciones para aceptar la devolución o el reembolso', {
        allowEmpty: true,
        defaultValue: state.refund.returnConditions || 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.'
      });
      if (value === BACK) return BACK;
      state.refund.returnConditions = value;
    },
    async () => {
      const value = await promptText(rl, 'Canal para iniciar la solicitud', {
        allowEmpty: true,
        defaultValue: state.refund.returnRequestChannel || state.contact.email || state.contact.pageUrl
      });
      if (value === BACK) return BACK;
      state.refund.returnRequestChannel = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Quién asume el envío de devolución', REFUND_RETURN_SHIPPING_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.refund.returnShippingResponsibility = choice.value;
    },
    async () => {
      const value = await promptText(rl, 'Método habitual del reembolso', {
        allowEmpty: true,
        defaultValue: state.refund.refundMethod || 'el mismo medio de pago original'
      });
      if (value === BACK) return BACK;
      state.refund.refundMethod = value;
    },
    async () => {
      const value = await promptText(rl, 'Tiempo estimado para procesar el reembolso', {
        allowEmpty: true,
        defaultValue: state.refund.refundProcessingTime || '10 días hábiles'
      });
      if (value === BACK) return BACK;
      state.refund.refundProcessingTime = value;
    },
    async () => {
      if (state.refund.offeringType !== 'digital_products') return;
      const value = await promptYesNo(
        rl,
        'Ventas digitales finales',
        'Marcá sí si descargas, licencias o productos digitales suelen ser finales y no reembolsables tras el acceso o la activación.',
        state.refund.digitalGoodsFinal
      );
      if (value === BACK) return BACK;
      state.refund.digitalGoodsFinal = value;
    },
    async () => {
      const choice = await promptMultiChoice(rl, 'Qué categorías suelen quedar excluidas o sujetas a reglas especiales', [
        { value: 'Productos personalizados o hechos a medida', label: 'Personalizados', description: 'Productos hechos a medida o personalizados.' },
        { value: 'Productos perecederos o sensibles', label: 'Perecederos', description: 'Productos perecederos o sensibles.' },
        { value: 'Licencias o descargas digitales activadas', label: 'Digitales activados', description: 'Licencias o productos digitales ya activados o descargados.' },
        { value: 'Productos usados, dañados por mal uso o incompletos', label: 'Usados o incompletos', description: 'Productos usados, dañados por mal uso o incompletos.' }
      ]);
      if (choice === BACK) return BACK;
      state.refund.nonReturnableItems = choice.values.concat(choice.manualNotes);
    },
    async () => {
      const value = await promptText(rl, 'Cómo se gestionan productos dañados, incorrectos o con fallas', {
        allowEmpty: true,
        defaultValue: state.refund.damagedItemsProcess || 'Si el producto llega dañado, incorrecto o con fallas, pedimos que nos contactes con fotos y datos del pedido para revisar el caso.'
      });
      if (value === BACK) return BACK;
      state.refund.damagedItemsProcess = value;
    }
  ]);
}

function printRefundSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Documento: Devoluciones y reembolsos\n`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}\n`);
  stdout.write(`- Tipo de oferta: ${optionLabel(REFUND_OFFERING_OPTIONS, state.refund.offeringType || '(sin definir)')}\n`);
  stdout.write(`- Acepta devoluciones: ${state.refund.acceptsReturns ? 'sí' : 'no'}\n`);
  stdout.write(`- Plazo de reembolso: ${state.refund.refundWindow || '(sin definir)'}\n`);
  stdout.write(`- Canal de solicitud: ${state.refund.returnRequestChannel || '(sin definir)'}\n`);
  stdout.write(`- Método de reembolso: ${state.refund.refundMethod || '(sin definir)'}\n`);
  stdout.write(`- Tiempo de procesamiento: ${state.refund.refundProcessingTime || '(sin definir)'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

async function promptRefundReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar política de devoluciones')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar devoluciones y reembolsos')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Cancelar')}\n`);
  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 6) return choice;
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runRefundWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'refund',
    business: { name: '', type: 'ecommerce', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
    refund: {
      offeringType: 'physical_goods',
      acceptsReturns: true,
      refundWindow: '10 días',
      exchangeWindow: '',
      returnConditions: 'El producto debe devolverse sin uso, con accesorios y empaque razonablemente conservado.',
      refundMethod: 'el mismo medio de pago original',
      refundProcessingTime: '10 días hábiles',
      returnShippingResponsibility: 'case_by_case',
      returnRequestChannel: '',
      nonReturnableItems: [],
      digitalGoodsFinal: false,
      damagedItemsProcess: 'Si el producto llega dañado, incorrecto o con fallas, pedimos que nos contactes con fotos y datos del pedido para revisar el caso.',
      notes: []
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('refund'), publishDir: defaultPublishDirForDocument('refund'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de devoluciones y reembolsos'))}\n`);
    stdout.write(`${dim('Te voy a ayudar a generar una política operativa de devoluciones y reembolsos.')}\n`);
    await maybePreloadRefundFromPrivacy(rl, state);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectRefundSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildRefundInputFromState(state);
      const validation = await generator.validate(input);
      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }
      printRefundSummary(state, validation);
      const action = await promptRefundReviewAction(rl);
      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectRefundSection(rl, state); continue; }
      if (action === 5) { await collectOutputSection(rl, state); continue; }
      if (action === 6) { stdout.write(`${yellow('Wizard cancelado.')}\n`); return; }
      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-return-refund-policy-input.json`), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-return-refund-policy-input.json`}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('refund'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('refund')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé la política de devoluciones en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

async function collectDisclaimerSection(rl, state) {
  await runQuestions([
    async () => {
      const choice = await promptMultiChoice(rl, 'Qué tipos de disclaimer querés incluir', DISCLAIMER_OPTIONS, { allowNone: false, allowOther: false });
      if (choice === BACK) return BACK;
      state.disclaimer.categories = choice.values;
    },
    async () => {
      if (!state.disclaimer.categories.some((value) => ['medical', 'fitness'].includes(value))) return;
      const value = await promptText(rl, 'Aclaración adicional sobre asesoramiento profesional', {
        allowEmpty: true,
        defaultValue: state.disclaimer.professionalAdviceChannel || 'Este contenido no reemplaza evaluación, diagnóstico ni asesoramiento profesional individual.'
      });
      if (value === BACK) return BACK;
      state.disclaimer.professionalAdviceChannel = value;
    },
    async () => {
      if (!state.disclaimer.categories.includes('external_links')) return;
      const value = await promptText(rl, 'Política breve sobre enlaces externos', {
        allowEmpty: true,
        defaultValue: state.disclaimer.externalLinksPolicy
      });
      if (value === BACK) return BACK;
      state.disclaimer.externalLinksPolicy = value;
    },
    async () => {
      if (!state.disclaimer.categories.includes('product_reviews')) return;
      const value = await promptText(rl, 'Cómo se hacen las reseñas o evaluaciones', {
        allowEmpty: true,
        defaultValue: state.disclaimer.reviewMethodology
      });
      if (value === BACK) return BACK;
      state.disclaimer.reviewMethodology = value;
    },
    async () => {
      if (!state.disclaimer.categories.includes('product_reviews')) return;
      const value = await promptText(rl, 'Disclosure comercial, afiliado o compensación', {
        allowEmpty: true,
        defaultValue: state.disclaimer.affiliateDisclosure
      });
      if (value === BACK) return BACK;
      state.disclaimer.affiliateDisclosure = value;
    },
    async () => {
      if (!state.disclaimer.categories.includes('own_risk')) return;
      const value = await promptText(rl, 'Frase personalizada de uso bajo propio riesgo', {
        allowEmpty: true,
        defaultValue: state.disclaimer.customRiskStatement
      });
      if (value === BACK) return BACK;
      state.disclaimer.customRiskStatement = value;
    }
  ]);
}

function printDisclaimerSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Documento: Disclaimer / descargo\n`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}\n`);
  stdout.write(`- Tipos: ${state.disclaimer.categories.length > 0 ? state.disclaimer.categories.map((value) => optionLabel(DISCLAIMER_OPTIONS, value)).join(', ') : '(sin definir)'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

async function promptDisclaimerReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar disclaimer')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar disclaimers')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Cancelar')}\n`);
  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 6) return choice;
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runDisclaimerWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'disclaimer',
    business: { name: '', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    disclaimer: {
      categories: ['errors_omissions', 'external_links', 'own_risk'],
      audienceDescription: '',
      professionalAdviceChannel: '',
      externalLinksPolicy: '',
      affiliateDisclosure: '',
      reviewMethodology: '',
      customRiskStatement: '',
      notes: []
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('disclaimer'), publishDir: defaultPublishDirForDocument('disclaimer'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de disclaimer'))}\n`);
    stdout.write(`${dim('Te voy a ayudar a generar uno o varios descargos de responsabilidad en una sola página.')}\n`);
    await maybePreloadDisclaimerFromPrivacy(rl, state);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectDisclaimerSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildDisclaimerInputFromState(state);
      const validation = await generator.validate(input);
      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }
      printDisclaimerSummary(state, validation);
      const action = await promptDisclaimerReviewAction(rl);
      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectDisclaimerSection(rl, state); continue; }
      if (action === 5) { await collectOutputSection(rl, state); continue; }
      if (action === 6) { stdout.write(`${yellow('Wizard cancelado.')}\n`); return; }
      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-disclaimer-input.json`), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-disclaimer-input.json`}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('disclaimer'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('disclaimer')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé el disclaimer en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}


async function collectSecuritySection(rl, state) {
  await runQuestions([
    async () => {
      const choice = await promptSingleChoice(rl, 'Cómo querés recibir reportes de seguridad', SECURITY_REPORT_CHANNEL_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.security.reportChannel = choice.value;
    },
    async () => {
      if (!['email', 'both'].includes(state.security.reportChannel)) return;
      const hostname = String(state.business.websiteUrl || '').replace(/^https?:\/\//, '').replace(/\/.*/, '');
      const value = await promptText(rl, 'Email para reportes de seguridad', {
        allowEmpty: true,
        defaultValue: state.security.reportEmail || state.contact.email || (hostname ? `security@${hostname}` : '')
      });
      if (value === BACK) return BACK;
      state.security.reportEmail = value;
    },
    async () => {
      if (!['form', 'both'].includes(state.security.reportChannel)) return;
      const value = await promptText(rl, 'URL pública para reportar vulnerabilidades', {
        allowEmpty: true,
        defaultValue: state.security.reportUrl || state.contact.pageUrl || state.business.websiteUrl
      });
      if (value === BACK) return BACK;
      state.security.reportUrl = value;
    },
    async () => {
      const choice = await promptMultiChoice(rl, 'Qué superficies querés cubrir en la política', SECURITY_SCOPE_OPTIONS, { allowNone: false, allowOther: false });
      if (choice === BACK) return BACK;
      state.security.scope = choice.values;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Incluir safe harbor o buena fe',
        'Marcá sí si querés aclarar que la investigación responsable y de buena fe será tratada como autorizada dentro del alcance de la política.',
        state.security.safeHarborOffered
      );
      if (value === BACK) return BACK;
      state.security.safeHarborOffered = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Permitir pruebas automatizadas de bajo volumen',
        'Marcá sí sólo si aceptás scans o requests automatizados que no degraden el servicio.',
        state.security.automatedTestingAllowed
      );
      if (value === BACK) return BACK;
      state.security.automatedTestingAllowed = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Permitir DoS o load testing coordinado',
        'Marcá sí únicamente si querés contemplar pruebas de carga o denegación de servicio con aprobación previa.',
        state.security.denialOfServiceTestingAllowed
      );
      if (value === BACK) return BACK;
      state.security.denialOfServiceTestingAllowed = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Permitir ingeniería social coordinada',
        'Marcá sí únicamente si querés contemplar phishing o ingeniería social con aprobación previa.',
        state.security.socialEngineeringAllowed
      );
      if (value === BACK) return BACK;
      state.security.socialEngineeringAllowed = value;
    },
    async () => {
      const value = await promptMultiChoice(rl, 'Qué debería incluir un reporte válido', SECURITY_REPORT_REQUIREMENT_OPTIONS, { allowNone: false, allowOther: true });
      if (value === BACK) return BACK;
      state.security.reportRequirements = value.values.concat(value.manualNotes);
    },
    async () => {
      const value = await promptText(rl, 'Tiempo estimado para acusar recibo', {
        allowEmpty: true,
        defaultValue: state.security.acknowledgementTime || '3 días hábiles'
      });
      if (value === BACK) return BACK;
      state.security.acknowledgementTime = value;
    },
    async () => {
      const value = await promptText(rl, 'Tiempo estimado para compartir actualizaciones', {
        allowEmpty: true,
        defaultValue: state.security.statusUpdateTime || '10 días hábiles'
      });
      if (value === BACK) return BACK;
      state.security.statusUpdateTime = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Cómo preferís manejar el disclosure público', SECURITY_DISCLOSURE_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.security.disclosurePreference = choice.value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Ofrecés bug bounty o recompensas',
        'Marcá sí si existe un proceso de recompensa, reconocimiento o bounty para algunos reportes.',
        state.security.bugBountyOffered
      );
      if (value === BACK) return BACK;
      state.security.bugBountyOffered = value;
    },
    async () => {
      if (!state.security.bugBountyOffered) return;
      const value = await promptText(rl, 'Condiciones o nota breve sobre bounty/reconocimiento', {
        allowEmpty: true,
        defaultValue: state.security.bugBountyNotes
      });
      if (value === BACK) return BACK;
      state.security.bugBountyNotes = value;
    },
    async () => {
      const value = await promptText(rl, 'Nota breve sobre remediación o coordinación', {
        allowEmpty: true,
        defaultValue: state.security.remediationGuidance || 'Priorizamos los reportes según severidad, impacto y complejidad, y podemos pedir tiempo razonable para investigar y mitigar antes de cualquier disclosure público.'
      });
      if (value === BACK) return BACK;
      state.security.remediationGuidance = value;
    },
    async () => {
      const value = await promptText(rl, 'Resumen opcional de prácticas de seguridad', {
        allowEmpty: true,
        defaultValue: state.security.securityPracticesSummary || 'Aplicamos controles de acceso, registros operativos, revisión de dependencias y medidas razonables de hardening sobre infraestructura y aplicaciones expuestas.'
      });
      if (value === BACK) return BACK;
      state.security.securityPracticesSummary = value;
    }
  ]);
}

function printSecuritySummary(state, validation) {
  stdout.write(`
${bold(magenta('Resumen antes de generar'))}
`);
  stdout.write(`- Documento: Política de seguridad
`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}
`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}
`);
  stdout.write(`- Canal de reporte: ${optionLabel(SECURITY_REPORT_CHANNEL_OPTIONS, state.security.reportChannel || '(sin definir)')}
`);
  stdout.write(`- Email de seguridad: ${state.security.reportEmail || '(sin definir)'}
`);
  stdout.write(`- URL de reporte: ${state.security.reportUrl || '(sin definir)'}
`);
  stdout.write(`- Alcance cubierto: ${state.security.scope.length > 0 ? state.security.scope.map((value) => optionLabel(SECURITY_SCOPE_OPTIONS, value)).join(', ') : '(sin definir)'}
`);
  stdout.write(`- Safe harbor: ${state.security.safeHarborOffered ? 'sí' : 'no'}
`);
  stdout.write(`- Acuse de recibo: ${state.security.acknowledgementTime || '(sin definir)'}
`);
  stdout.write(`- Actualizaciones: ${state.security.statusUpdateTime || '(sin definir)'}
`);
  stdout.write(`- Disclosure: ${optionLabel(SECURITY_DISCLOSURE_OPTIONS, state.security.disclosurePreference || '(sin definir)')}
`);
  stdout.write(`- Bug bounty: ${state.security.bugBountyOffered ? 'sí' : 'no'}
`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}
`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}
`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}
`);
  if (state.output.publishHashedUrl) stdout.write(`- Directorio publicable: ${state.output.publishDir}
`);
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}
`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}
`);
  if (validation.warnings.length > 0) {
    stdout.write(`
${bold(yellow('Advertencias de revisión:'))}
`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}
`));
  }
}

async function promptSecurityReviewAction(rl) {
  stdout.write(`
${bold(cyan('Qué querés hacer ahora'))}
`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar política de seguridad')}
`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}
`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}
`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar política de seguridad')}
`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar formato y guardado')}
`);
  stdout.write(`  ${yellow('6')}. ${bold('Cancelar')}
`);
  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 6) return choice;
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}
`);
  }
}

async function runSecurityWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'security',
    business: { name: '', type: 'saas', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    security: {
      reportChannel: 'both',
      reportEmail: '',
      reportUrl: '',
      scope: ['web_application', 'api'],
      safeHarborOffered: true,
      automatedTestingAllowed: false,
      denialOfServiceTestingAllowed: false,
      socialEngineeringAllowed: false,
      acknowledgementTime: '3 días hábiles',
      statusUpdateTime: '10 días hábiles',
      disclosurePreference: 'coordinated',
      bugBountyOffered: false,
      bugBountyNotes: '',
      reportRequirements: [
        'Descripción clara del hallazgo y del impacto esperado',
        'Pasos de reproducción o prueba de concepto razonable',
        'Activos, URLs, endpoints o cuentas involucradas',
        'Información de contacto para seguimiento'
      ],
      remediationGuidance: 'Priorizamos los reportes según severidad, impacto y complejidad, y podemos pedir tiempo razonable para investigar y mitigar antes de cualquier disclosure público.',
      securityPracticesSummary: 'Aplicamos controles de acceso, registros operativos, revisión de dependencias y medidas razonables de hardening sobre infraestructura y aplicaciones expuestas.',
      notes: []
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('security'), publishDir: defaultPublishDirForDocument('security'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de política de seguridad'))}
`);
    stdout.write(`${dim('Te voy a ayudar a generar una política pública para divulgación responsable y reportes de vulnerabilidades.')}
`);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectSecuritySection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildSecurityInputFromState(state);
      const validation = await generator.validate(input);
      if (!validation.ok) {
        stdout.write(`
${bold(red('Todavía faltan datos obligatorios:'))}
`);
        validation.errors.forEach((error) => stdout.write(`- ${error}
`));
      }
      printSecuritySummary(state, validation);
      const action = await promptSecurityReviewAction(rl);
      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectSecuritySection(rl, state); continue; }
      if (action === 5) { await collectOutputSection(rl, state); continue; }
      if (action === 6) { stdout.write(`${yellow('Wizard cancelado.')}
`); return; }
      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}
`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-security-policy-input.json`), `${JSON.stringify(input, null, 2)}
`, 'utf8');
        stdout.write(`
${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-security-policy-input.json`}`)}
`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('security'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('security')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé la política de seguridad en ${state.output.outputPath}`)}
`);
      } else {
        stdout.write(`
${output}
`);
      }

      if (published) {
        stdout.write(`
${bold(green('URL pública generada:'))} ${published.publicUrl}
`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}
`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}
`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`
${bold(yellow('Advertencias de revisión:'))}
`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}
`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

async function collectDpaSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptText(rl, 'Nombre de la contraparte del DPA', {
        allowEmpty: true,
        defaultValue: state.dpa.counterpartyName || ''
      });
      if (value === BACK) return BACK;
      state.dpa.counterpartyName = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Rol principal de la contraparte', DPA_COUNTERPARTY_ROLE_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.dpa.counterpartyRole = choice.value;
    },
    async () => {
      const value = await promptMultiChoice(rl, 'Qué alcance regulatorio o regiones del cliente querés reflejar', DPA_REGULATORY_SCOPE_OPTIONS, { allowNone: false, allowOther: false });
      if (value === BACK) return BACK;
      state.dpa.regulatoryScope = value.values;
    },
    async () => {
      const value = await promptText(rl, 'Descripción del servicio SaaS o del alcance del procesamiento', {
        allowEmpty: true,
        defaultValue: state.dpa.servicesDescription || 'Prestación SaaS B2B con gestión de cuentas, soporte operativo y procesamiento limitado a la prestación del servicio.'
      });
      if (value === BACK) return BACK;
      state.dpa.servicesDescription = value;
    },
    async () => {
      const value = await promptText(rl, 'Duración del tratamiento', {
        allowEmpty: true,
        defaultValue: state.dpa.duration || 'Durante la vigencia del servicio y por el tiempo necesario para cierre, soporte y retenciones legales aplicables.'
      });
      if (value === BACK) return BACK;
      state.dpa.duration = value;
    },
    async () => {
      const value = await promptText(rl, 'Naturaleza y finalidad del tratamiento', {
        allowEmpty: true,
        defaultValue: state.dpa.processingPurpose || 'Procesar datos personales por cuenta del cliente para prestar, asegurar, soportar y administrar el servicio contratado.'
      });
      if (value === BACK) return BACK;
      state.dpa.processingPurpose = value;
    },
    async () => {
      const value = await promptMultiChoice(rl, 'Qué categorías de datos personales abarca el DPA', DPA_DATA_CATEGORY_OPTIONS, { allowNone: false, allowOther: true });
      if (value === BACK) return BACK;
      state.dpa.personalDataCategories = value.values.concat(value.manualNotes);
    },
    async () => {
      const value = await promptMultiChoice(rl, 'Qué categorías de titulares están involucradas', DPA_DATA_SUBJECT_OPTIONS, { allowNone: false, allowOther: true });
      if (value === BACK) return BACK;
      state.dpa.dataSubjectCategories = value.values.concat(value.manualNotes);
    },
    async () => {
      const value = await promptText(rl, 'Canal para instrucciones documentadas', {
        allowEmpty: true,
        defaultValue: state.dpa.instructionsChannel || 'Email contractual, ticket formal o instrucciones emitidas por administradores autorizados del cliente.'
      });
      if (value === BACK) return BACK;
      state.dpa.instructionsChannel = value;
    },
    async () => {
      const value = await promptText(rl, 'Medidas de confidencialidad', {
        allowEmpty: true,
        defaultValue: state.dpa.confidentialityMeasures || 'Acceso restringido por necesidad de conocer, compromisos de confidencialidad y controles internos sobre personal autorizado.'
      });
      if (value === BACK) return BACK;
      state.dpa.confidentialityMeasures = value;
    },
    async () => {
      const value = await promptText(rl, 'Medidas técnicas y organizativas de seguridad', {
        allowEmpty: true,
        defaultValue: state.dpa.securityMeasures || 'Controles de acceso, registros operativos, cifrado en tránsito, revisión de dependencias y medidas razonables de hardening.'
      });
      if (value === BACK) return BACK;
      state.dpa.securityMeasures = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Usás subprocessors o subencargados',
        'Marcá sí si el servicio depende de hosting, cloud, soporte u otros proveedores que procesen datos por tu cuenta.',
        state.dpa.subprocessorsUsed
      );
      if (value === BACK) return BACK;
      state.dpa.subprocessorsUsed = value;
    },
    async () => {
      if (!state.dpa.subprocessorsUsed) return;
      const choice = await promptSingleChoice(rl, 'Cómo se autorizan los subprocessors', DPA_SUBPROCESSOR_AUTHORIZATION_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.dpa.subprocessorAuthorization = choice.value;
    },
    async () => {
      if (!state.dpa.subprocessorsUsed) return;
      const value = await promptText(rl, 'Preaviso o ventana de objeción para subprocessors', {
        allowEmpty: true,
        defaultValue: state.dpa.subprocessorObjectionWindow || 'Aviso razonable previo para cambios materiales de subprocessors, sujeto al contrato principal.'
      });
      if (value === BACK) return BACK;
      state.dpa.subprocessorObjectionWindow = value;
    },
    async () => {
      if (!state.dpa.subprocessorsUsed) return;
      const value = await promptText(rl, 'Criterio o metodología sobre subprocessors', {
        allowEmpty: true,
        defaultValue: state.dpa.subprocessorMethodology || 'Se seleccionan proveedores con garantías razonables y se les imponen obligaciones contractuales de protección de datos acordes al servicio.'
      });
      if (value === BACK) return BACK;
      state.dpa.subprocessorMethodology = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Hay transferencias internacionales',
        'Marcá sí si hay hosting, soporte, acceso remoto o subprocessors fuera de la jurisdicción principal del cliente.',
        state.dpa.internationalTransfers
      );
      if (value === BACK) return BACK;
      state.dpa.internationalTransfers = value;
    },
    async () => {
      if (!state.dpa.internationalTransfers && !state.dpa.euSccRequired) return;
      const value = await promptText(rl, 'Mecanismo de transferencias internacionales', {
        allowEmpty: true,
        defaultValue: state.dpa.transferMechanism || 'Cuando corresponde, usamos cláusulas contractuales, salvaguardas equivalentes o bases legales compatibles con la jurisdicción aplicable.'
      });
      if (value === BACK) return BACK;
      state.dpa.transferMechanism = value;
    },
    async () => {
      if (!state.dpa.internationalTransfers && !state.dpa.euSccRequired) return;
      const value = await promptText(rl, 'Salvaguardas complementarias de transferencias', {
        allowEmpty: true,
        defaultValue: state.dpa.transferSupplementarySafeguards || 'Podemos apoyarnos en regionalización, minimización, cifrado, segregación de accesos y evaluación razonable de vendors según el flujo aplicable.'
      });
      if (value === BACK) return BACK;
      state.dpa.transferSupplementarySafeguards = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Puede requerirse SCC o salvaguardas equivalentes',
        'Marcá sí si esperás clientes UE/UK o análisis formales de transferencias.',
        state.dpa.euSccRequired
      );
      if (value === BACK) return BACK;
      state.dpa.euSccRequired = value;
    },
    async () => {
      const value = await promptText(rl, 'Plazo para notificar incidentes o brechas', {
        allowEmpty: true,
        defaultValue: state.dpa.breachNotificationTime || 'Sin demoras indebidas y dentro de un plazo razonable desde la confirmación del incidente.'
      });
      if (value === BACK) return BACK;
      state.dpa.breachNotificationTime = value;
    },
    async () => {
      const value = await promptText(rl, 'Compromisos de asistencia al cliente/controller', {
        allowEmpty: true,
        defaultValue: state.dpa.assistanceCommitments || 'Brindamos asistencia razonable para solicitudes de titulares, evaluaciones de impacto y consultas regulatorias en la medida en que el servicio y la información disponible lo permitan.'
      });
      if (value === BACK) return BACK;
      state.dpa.assistanceCommitments = value;
    },
    async () => {
      const value = await promptText(rl, 'Plazo de devolución o eliminación de datos al cierre', {
        allowEmpty: true,
        defaultValue: state.dpa.deletionReturnPeriod || 'Al finalizar el servicio, devolvemos o eliminamos los datos personales dentro de un plazo razonable, salvo retención legal o backups de seguridad con ciclo controlado.'
      });
      if (value === BACK) return BACK;
      state.dpa.deletionReturnPeriod = value;
    },
    async () => {
      const value = await promptText(rl, 'Tratamiento de backups o copias residuales', {
        allowEmpty: true,
        defaultValue: state.dpa.backupRetentionHandling || 'Las copias de seguridad residuales siguen su ciclo de retención y purga controlada, con acceso restringido y sin reutilización activa para operaciones ordinarias.'
      });
      if (value === BACK) return BACK;
      state.dpa.backupRetentionHandling = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Mecanismo habitual de auditoría', DPA_AUDIT_MECHANISM_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.dpa.auditMechanism = choice.value;
    },
    async () => {
      const value = await promptText(rl, 'Preaviso para auditoría', {
        allowEmpty: true,
        defaultValue: state.dpa.auditNoticePeriod || 'Preaviso razonable y coordinación previa, salvo urgencia contractual o legal.'
      });
      if (value === BACK) return BACK;
      state.dpa.auditNoticePeriod = value;
    },
    async () => {
      const value = await promptText(rl, 'Enfoque de auditoría o información', {
        allowEmpty: true,
        defaultValue: state.dpa.auditRights || 'Podemos proporcionar información razonable, respuestas documentadas, certificaciones o evidencia equivalente, sujeto a confidencialidad y límites operativos razonables.'
      });
      if (value === BACK) return BACK;
      state.dpa.auditRights = value;
    },
    async () => {
      const value = await promptText(rl, 'Ley aplicable o referencia contractual', {
        allowEmpty: true,
        defaultValue: state.dpa.governingLaw || 'Según el acuerdo principal entre las partes y la jurisdicción aplicable al servicio.'
      });
      if (value === BACK) return BACK;
      state.dpa.governingLaw = value;
    }
  ]);
}

function printDpaSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Documento: DPA / acuerdo de tratamiento de datos\n`);
  stdout.write(`- Proveedor: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}\n`);
  stdout.write(`- Contraparte: ${state.dpa.counterpartyName || '(sin definir)'}\n`);
  stdout.write(`- Rol de contraparte: ${optionLabel(DPA_COUNTERPARTY_ROLE_OPTIONS, state.dpa.counterpartyRole || '(sin definir)')}\n`);
  stdout.write(`- Alcance regulatorio cliente: ${state.dpa.regulatoryScope.length > 0 ? state.dpa.regulatoryScope.map((value) => optionLabel(DPA_REGULATORY_SCOPE_OPTIONS, value)).join(', ') : '(sin definir)'}\n`);
  stdout.write(`- Servicio: ${state.dpa.servicesDescription || '(sin definir)'}\n`);
  stdout.write(`- Categorías de datos: ${state.dpa.personalDataCategories.length > 0 ? state.dpa.personalDataCategories.join(', ') : '(sin definir)'}\n`);
  stdout.write(`- Categorías de titulares: ${state.dpa.dataSubjectCategories.length > 0 ? state.dpa.dataSubjectCategories.join(', ') : '(sin definir)'}\n`);
  stdout.write(`- Subprocessors: ${state.dpa.subprocessorsUsed ? 'sí' : 'no'}\n`);
  stdout.write(`- Autorización de subprocessors: ${optionLabel(DPA_SUBPROCESSOR_AUTHORIZATION_OPTIONS, state.dpa.subprocessorAuthorization || '(sin definir)')}\n`);
  stdout.write(`- Transferencias internacionales: ${state.dpa.internationalTransfers ? 'sí' : 'no'}\n`);
  stdout.write(`- SCC o equivalentes: ${state.dpa.euSccRequired ? 'sí' : 'no'}\n`);
  stdout.write(`- Auditoría: ${optionLabel(DPA_AUDIT_MECHANISM_OPTIONS, state.dpa.auditMechanism || '(sin definir)')}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

async function promptDpaReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar DPA')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar DPA')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Cancelar')}\n`);
  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 6) return choice;
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runDpaWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'dpa',
    business: { name: '', type: 'saas', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    dpa: {
      counterpartyName: '',
      counterpartyRole: 'controller',
      regulatoryScope: ['eu'],
      servicesDescription: 'Prestación SaaS B2B con gestión de cuentas, soporte operativo y procesamiento limitado a la prestación del servicio.',
      duration: 'Durante la vigencia del servicio y por el tiempo necesario para cierre, soporte y retenciones legales aplicables.',
      processingPurpose: 'Procesar datos personales por cuenta del cliente para prestar, asegurar, soportar y administrar el servicio contratado.',
      personalDataCategories: [
        'Datos de identificación y contacto',
        'Datos de cuenta o credenciales de acceso',
        'Datos de uso, eventos y registros técnicos'
      ],
      dataSubjectCategories: [
        'Usuarios finales del cliente',
        'Empleados o contratistas del cliente'
      ],
      instructionsChannel: 'Email contractual, ticket formal o instrucciones emitidas por administradores autorizados del cliente.',
      confidentialityMeasures: 'Acceso restringido por necesidad de conocer, compromisos de confidencialidad y controles internos sobre personal autorizado.',
      securityMeasures: 'Controles de acceso, registros operativos, cifrado en tránsito, revisión de dependencias y medidas razonables de hardening.',
      subprocessorsUsed: true,
      subprocessorAuthorization: 'general_authorization',
      subprocessorObjectionWindow: 'Aviso razonable previo para cambios materiales de subprocessors, sujeto al contrato principal.',
      subprocessorMethodology: 'Se seleccionan proveedores con garantías razonables y se les imponen obligaciones contractuales de protección de datos acordes al servicio.',
      internationalTransfers: false,
      transferMechanism: 'Cuando corresponde, usamos cláusulas contractuales, salvaguardas equivalentes o bases legales compatibles con la jurisdicción aplicable.',
      transferSupplementarySafeguards: 'Podemos apoyarnos en regionalización, minimización, cifrado, segregación de accesos y evaluación razonable de vendors según el flujo aplicable.',
      breachNotificationTime: 'Sin demoras indebidas y dentro de un plazo razonable desde la confirmación del incidente.',
      assistanceCommitments: 'Brindamos asistencia razonable para solicitudes de titulares, evaluaciones de impacto y consultas regulatorias en la medida en que el servicio y la información disponible lo permitan.',
      deletionReturnPeriod: 'Al finalizar el servicio, devolvemos o eliminamos los datos personales dentro de un plazo razonable, salvo retención legal o backups de seguridad con ciclo controlado.',
      backupRetentionHandling: 'Las copias de seguridad residuales siguen su ciclo de retención y purga controlada, con acceso restringido y sin reutilización activa para operaciones ordinarias.',
      auditMechanism: 'questionnaire_and_certifications',
      auditNoticePeriod: 'Preaviso razonable y coordinación previa, salvo urgencia contractual o legal.',
      auditRights: 'Podemos proporcionar información razonable, respuestas documentadas, certificaciones o evidencia equivalente, sujeto a confidencialidad y límites operativos razonables.',
      governingLaw: 'Según el acuerdo principal entre las partes y la jurisdicción aplicable al servicio.',
      euSccRequired: false,
      notes: []
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('dpa'), publishDir: defaultPublishDirForDocument('dpa'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de DPA'))}\n`);
    stdout.write(`${dim('Te voy a ayudar a generar un Data Processing Agreement orientado a SaaS B2B y relaciones controller-processor.')}\n`);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectDpaSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildDpaInputFromState(state);
      const validation = await generator.validate(input);
      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }
      printDpaSummary(state, validation);
      const action = await promptDpaReviewAction(rl);
      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectDpaSection(rl, state); continue; }
      if (action === 5) { await collectOutputSection(rl, state); continue; }
      if (action === 6) { stdout.write(`${yellow('Wizard cancelado.')}\n`); return; }
      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-dpa-input.json`), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-dpa-input.json`}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('dpa'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('dpa')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé el DPA en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

async function collectAiSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptMultiChoice(rl, 'Qué sistemas o funciones de IA usa el servicio', AI_SYSTEM_OPTIONS, { allowNone: false, allowOther: true });
      if (value === BACK) return BACK;
      state.ai.systemsUsed = value.values.concat(value.manualNotes);
    },
    async () => {
      const value = await promptMultiChoice(rl, 'Para qué se usa la IA en el servicio', AI_USE_CASE_OPTIONS, { allowNone: false, allowOther: true });
      if (value === BACK) return BACK;
      state.ai.useCases = value.values.concat(value.manualNotes);
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'La IA es visible para usuarios o clientes',
        'Marcá sí si el usuario interactúa con asistentes, recomendaciones, generación, scoring o funciones claramente asistidas por IA.',
        state.ai.userFacingAi
      );
      if (value === BACK) return BACK;
      state.ai.userFacingAi = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Indicás contenido generado o asistido por IA',
        'Marcá sí si el servicio etiqueta o señala contenido generado o materialmente asistido por IA.',
        state.ai.generatedContentLabeling
      );
      if (value === BACK) return BACK;
      state.ai.generatedContentLabeling = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Cómo se usan los datos para entrenamiento o mejora de modelos', AI_TRAINING_DATA_USE_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.ai.trainingDataUse = choice.value;
    },
    async () => {
      const value = await promptMultiChoice(rl, 'Qué fuentes de datos están relacionadas con el uso o mejora de IA', AI_DATA_SOURCE_OPTIONS, { allowNone: false, allowOther: true });
      if (value === BACK) return BACK;
      state.ai.dataSources = value.values.concat(value.manualNotes);
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Pueden intervenir datos personales en estos flujos',
        'Marcá sí sólo si prompts, outputs, logs o datasets vinculados a IA pueden incluir datos personales.',
        state.ai.personalDataInTraining
      );
      if (value === BACK) return BACK;
      state.ai.personalDataInTraining = value;
    },
    async () => {
      const value = await promptMultiChoice(rl, 'Qué actividades concretas hacés sobre datos de IA', AI_MODEL_IMPROVEMENT_OPTIONS, { allowNone: true, allowOther: true });
      if (value === BACK) return BACK;
      state.ai.modelImprovementUses = value.values.concat(value.manualNotes);
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Existe opt-out o control para entrenamiento/mejora',
        'Marcá sí si el usuario o cliente puede limitar ciertos usos vinculados a training, fine-tuning o mejora del producto.',
        state.ai.optOutAvailable
      );
      if (value === BACK) return BACK;
      state.ai.optOutAvailable = value;
    },
    async () => {
      if (!state.ai.optOutAvailable) return;
      const value = await promptText(rl, 'Método de opt-out o control', {
        allowEmpty: true,
        defaultValue: state.ai.optOutMethod || 'Configuración de cuenta, solicitud por soporte o canal contractual específico.'
      });
      if (value === BACK) return BACK;
      state.ai.optOutMethod = value;
    },
    async () => {
      const value = await promptText(rl, 'Retención de prompts, outputs o datasets relacionados', {
        allowEmpty: true,
        defaultValue: state.ai.retentionPeriod || 'Los datos vinculados a IA se retienen sólo por el tiempo razonablemente necesario para prestación, seguridad, soporte, evaluación o mejora, según el flujo aplicable.'
      });
      if (value === BACK) return BACK;
      state.ai.retentionPeriod = value;
    },
    async () => {
      const value = await promptMultiChoice(rl, 'Qué proveedores externos o model providers intervienen', AI_PROVIDER_OPTIONS, { allowNone: false, allowOther: true });
      if (value === BACK) return BACK;
      state.ai.thirdPartyProviders = value.values.concat(value.manualNotes);
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'La IA puede influir decisiones automatizadas o scoring relevante',
        'Marcá sí si la IA puede afectar ranking, moderación, acceso, fraude, priorización o decisiones con impacto relevante.',
        state.ai.automatedDecisionMaking
      );
      if (value === BACK) return BACK;
      state.ai.automatedDecisionMaking = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Existe revisión humana o escalamiento',
        'Marcá sí si el usuario o el equipo pueden escalar casos y obtener revisión humana.',
        state.ai.humanReviewAvailable
      );
      if (value === BACK) return BACK;
      state.ai.humanReviewAvailable = value;
    },
    async () => {
      const value = await promptText(rl, 'Canal para revisión o soporte', {
        allowEmpty: true,
        defaultValue: state.ai.appealChannel || state.contact.email || ''
      });
      if (value === BACK) return BACK;
      state.ai.appealChannel = value;
    },
    async () => {
      const value = await promptText(rl, 'Restricciones sobre datos sensibles o de alto riesgo', {
        allowEmpty: true,
        defaultValue: state.ai.sensitiveDataRestrictions || 'No pedimos ni recomendamos cargar datos sensibles salvo que exista base legal, controles reforzados y necesidad operativa claramente justificada.'
      });
      if (value === BACK) return BACK;
      state.ai.sensitiveDataRestrictions = value;
    },
    async () => {
      const value = await promptText(rl, 'Controles de seguridad y minimización', {
        allowEmpty: true,
        defaultValue: state.ai.securityControls || 'Aplicamos minimización, controles de acceso, registros operativos y medidas razonables de seguridad sobre prompts, outputs y datos vinculados a IA.'
      });
      if (value === BACK) return BACK;
      state.ai.securityControls = value;
    },
    async () => {
      const value = await promptText(rl, 'Nota adicional de transparencia (opcional)', {
        allowEmpty: true,
        defaultValue: state.ai.transparencyNotes || ''
      });
      if (value === BACK) return BACK;
      state.ai.transparencyNotes = value;
    }
  ]);
}

function printAiSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Documento: Política de IA y datos de entrenamiento\n`);
  stdout.write(`- Negocio: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}\n`);
  stdout.write(`- Sistemas de IA: ${state.ai.systemsUsed.length > 0 ? state.ai.systemsUsed.join(', ') : '(sin definir)'}\n`);
  stdout.write(`- Casos de uso: ${state.ai.useCases.length > 0 ? state.ai.useCases.join(', ') : '(sin definir)'}\n`);
  stdout.write(`- Uso para entrenamiento/mejora: ${optionLabel(AI_TRAINING_DATA_USE_OPTIONS, state.ai.trainingDataUse || '(sin definir)')}\n`);
  stdout.write(`- Proveedores externos: ${state.ai.thirdPartyProviders.length > 0 ? state.ai.thirdPartyProviders.join(', ') : '(sin definir)'}\n`);
  stdout.write(`- Decisiones automatizadas: ${state.ai.automatedDecisionMaking ? 'sí' : 'no'}\n`);
  stdout.write(`- Revisión humana: ${state.ai.humanReviewAvailable ? 'sí' : 'no'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

async function promptAiReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar política de IA')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar política de IA')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Cancelar')}\n`);
  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 6) return choice;
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runAiWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'ai',
    business: { name: '', type: 'saas', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    ai: {
      systemsUsed: ['chatbot_or_assistant', 'content_generation'],
      useCases: ['customer_support', 'drafting_or_generation'],
      userFacingAi: true,
      generatedContentLabeling: false,
      trainingDataUse: '',
      dataSources: ['customer_inputs', 'service_logs'],
      personalDataInTraining: false,
      modelImprovementUses: [],
      optOutAvailable: false,
      optOutMethod: '',
      retentionPeriod: 'Los datos vinculados a IA se retienen sólo por el tiempo razonablemente necesario para prestación, seguridad, soporte, evaluación o mejora, según el flujo aplicable.',
      thirdPartyProviders: ['third_party_model_api', 'cloud_infrastructure'],
      automatedDecisionMaking: false,
      humanReviewAvailable: true,
      appealChannel: '',
      sensitiveDataRestrictions: 'No pedimos ni recomendamos cargar datos sensibles salvo que exista base legal, controles reforzados y necesidad operativa claramente justificada.',
      securityControls: 'Aplicamos minimización, controles de acceso, registros operativos y medidas razonables de seguridad sobre prompts, outputs y datos vinculados a IA.',
      transparencyNotes: '',
      notes: []
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('ai'), publishDir: defaultPublishDirForDocument('ai'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de política de IA'))}\n`);
    stdout.write(`${dim('Te voy a ayudar a generar una política de transparencia sobre uso de IA, entrenamiento, proveedores, retención y revisión humana.')}\n`);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectAiSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildAiInputFromState(state);
      const validation = await generator.validate(input);
      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }
      printAiSummary(state, validation);
      const action = await promptAiReviewAction(rl);
      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectAiSection(rl, state); continue; }
      if (action === 5) { await collectOutputSection(rl, state); continue; }
      if (action === 6) { stdout.write(`${yellow('Wizard cancelado.')}\n`); return; }
      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-ai-policy-input.json`), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-ai-policy-input.json`}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('ai'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('ai')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé la política de IA en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

async function promptDeletionReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar instrucciones de eliminación')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar instrucciones de eliminación')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Cancelar')}\n`);

  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 6) {
      return choice;
    }
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function collectEulaSection(rl, state) {
  await runQuestions([
    async () => {
      const value = await promptText(rl, 'Nombre del software o app', {
        required: true,
        allowEmpty: false,
        defaultValue: state.eula.productName || ''
      });
      if (value === BACK) return BACK;
      state.eula.productName = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Qué tipo de software cubre este EULA', EULA_SOFTWARE_TYPE_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.eula.softwareType = choice.value;
    },
    async () => {
      const value = await promptText(rl, 'Cómo querés redactar la licencia principal', {
        allowEmpty: true,
        defaultValue: state.eula.licenseGrant || 'Se concede una licencia limitada, revocable, no exclusiva y no transferible para usar el software conforme a este acuerdo y al plan o suscripción contratada.'
      });
      if (value === BACK) return BACK;
      state.eula.licenseGrant = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Qué alcance principal tiene la licencia', EULA_LICENSE_SCOPE_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.eula.licenseScope = choice.value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'Permitir uso comercial o empresarial',
        'Marcá sí si el software puede usarse comercialmente dentro del plan o contrato aplicable.',
        state.eula.allowsCommercialUse
      );
      if (value === BACK) return BACK;
      state.eula.allowsCommercialUse = value;
    },
    async () => {
      const value = await promptYesNo(
        rl,
        'La licencia puede transferirse',
        'No lo actives salvo que realmente aceptes cesión o transferencia del derecho de uso.',
        state.eula.transferable
      );
      if (value === BACK) return BACK;
      state.eula.transferable = value;
    },
    async () => {
      const value = await promptText(rl, 'Límite de instalación, cuenta o asientos', {
        allowEmpty: true,
        defaultValue: state.eula.installationLimit || 'Una cuenta activa, un dispositivo por usuario o la cantidad de asientos contratada, según el plan aplicable.'
      });
      if (value === BACK) return BACK;
      state.eula.installationLimit = value;
    },
    async () => {
      const value = await promptYesNo(rl, 'Restringir ingeniería inversa', 'Marcá sí si querés prohibir descompilación o derivación de código fuente salvo obligación legal contraria.', state.eula.reverseEngineeringRestricted);
      if (value === BACK) return BACK;
      state.eula.reverseEngineeringRestricted = value;
    },
    async () => {
      const value = await promptYesNo(rl, 'Restringir modificaciones u obras derivadas', 'Marcá sí si querés limitar cambios, forks o adaptaciones salvo autorización expresa.', state.eula.modificationRestricted);
      if (value === BACK) return BACK;
      state.eula.modificationRestricted = value;
    },
    async () => {
      const value = await promptYesNo(rl, 'Restringir redistribución o reempaquetado', 'Marcá sí si el usuario no puede revender, redistribuir o republicar el software.', state.eula.redistributionRestricted);
      if (value === BACK) return BACK;
      state.eula.redistributionRestricted = value;
    },
    async () => {
      const value = await promptYesNo(rl, 'Se proveen updates o nuevas versiones', 'Desactivá esto sólo si querés dejar claro que no prometés releases futuros ni parches.', state.eula.updatesProvided);
      if (value === BACK) return BACK;
      state.eula.updatesProvided = value;
    },
    async () => {
      const choice = await promptSingleChoice(rl, 'Qué nivel de soporte aplica', EULA_SUPPORT_LEVEL_OPTIONS, { allowOther: false });
      if (choice === BACK) return BACK;
      state.eula.supportLevel = choice.value;
    },
    async () => {
      const value = await promptYesNo(rl, 'Hay componentes de terceros u open source', 'Activá esto si el producto incorpora librerías, SDKs o módulos con licencias separadas.', state.eula.thirdPartyComponents);
      if (value === BACK) return BACK;
      state.eula.thirdPartyComponents = value;
    },
    async () => {
      const value = await promptText(rl, 'Nota sobre terceros u open source', {
        allowEmpty: true,
        defaultValue: state.eula.openSourceNotice || 'El software puede incluir componentes de terceros u open source sujetos a sus propias licencias, avisos y condiciones aplicables.'
      });
      if (value === BACK) return BACK;
      state.eula.openSourceNotice = value;
    },
    async () => {
      const value = await promptText(rl, 'Descargo de garantías', {
        allowEmpty: true,
        defaultValue: state.eula.warrantyDisclaimer || 'Salvo garantía comercial expresa, el software se entrega "tal cual" y según disponibilidad, en la máxima medida permitida por la ley aplicable.'
      });
      if (value === BACK) return BACK;
      state.eula.warrantyDisclaimer = value;
    },
    async () => {
      const value = await promptText(rl, 'Limitación de responsabilidad', {
        allowEmpty: true,
        defaultValue: state.eula.liabilityLimit || 'En la máxima medida permitida por la ley, no respondemos por daños indirectos, pérdida de datos, lucro cesante o interrupciones derivadas del uso del software, salvo dolo o prohibición legal aplicable.'
      });
      if (value === BACK) return BACK;
      state.eula.liabilityLimit = value;
    },
    async () => {
      const value = await promptText(rl, 'Supuestos de terminación o revocación', {
        allowEmpty: true,
        defaultValue: state.eula.terminationTriggers || 'La licencia puede terminarse por incumplimiento material, uso no autorizado, falta de pago o violación de restricciones técnicas o legales del producto.'
      });
      if (value === BACK) return BACK;
      state.eula.terminationTriggers = value;
    },
    async () => {
      const value = await promptText(rl, 'Ley aplicable o foro principal', {
        allowEmpty: true,
        defaultValue: state.eula.governingLaw || 'Según la jurisdicción indicada por el licenciante o el contrato principal aplicable al producto.'
      });
      if (value === BACK) return BACK;
      state.eula.governingLaw = value;
    }
  ]);
}

function printEulaSummary(state, validation) {
  stdout.write(`\n${bold(magenta('Resumen antes de generar'))}\n`);
  stdout.write(`- Documento: EULA / licencia de uso\n`);
  stdout.write(`- Licenciante: ${state.business.name || '(sin definir)'}\n`);
  stdout.write(`- Sitio: ${state.business.websiteUrl || '(sin definir)'}\n`);
  stdout.write(`- Producto: ${state.eula.productName || '(sin definir)'}\n`);
  stdout.write(`- Tipo de software: ${optionLabel(EULA_SOFTWARE_TYPE_OPTIONS, state.eula.softwareType || '(sin definir)')}\n`);
  stdout.write(`- Alcance de licencia: ${optionLabel(EULA_LICENSE_SCOPE_OPTIONS, state.eula.licenseScope || '(sin definir)')}\n`);
  stdout.write(`- Uso comercial: ${state.eula.allowsCommercialUse ? 'sí' : 'no'}\n`);
  stdout.write(`- Transferible: ${state.eula.transferable ? 'sí' : 'no'}\n`);
  stdout.write(`- Updates: ${state.eula.updatesProvided ? 'sí' : 'no'}\n`);
  stdout.write(`- Soporte: ${optionLabel(EULA_SUPPORT_LEVEL_OPTIONS, state.eula.supportLevel || '(sin definir)')}\n`);
  stdout.write(`- Componentes de terceros: ${state.eula.thirdPartyComponents ? 'sí' : 'no'}\n`);
  stdout.write(`- Idioma de salida: ${optionLabel(OUTPUT_LANGUAGE_OPTIONS, state.output.language || 'es')}\n`);
  stdout.write(`- Formato: ${optionLabel(OUTPUT_FORMAT_OPTIONS, state.output.format || 'markdown')}\n`);
  stdout.write(`- URL pública hasheada: ${state.output.publishHashedUrl ? state.output.baseUrl : 'no'}\n`);
  if (state.output.publishHashedUrl) stdout.write(`- Directorio publicable: ${state.output.publishDir}\n`);
  stdout.write(`- Guardar a archivo: ${state.output.writeToFile ? state.output.outputPath : 'no'}\n`);
  stdout.write(`- Guardar input JSON: ${state.output.saveInput ? state.output.inputPath : 'no'}\n`);
  if (validation.warnings.length > 0) {
    stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
    validation.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
  }
}

async function promptEulaReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar EULA')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar EULA')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Cancelar')}\n`);
  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 6) return choice;
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runEulaWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'eula',
    business: { name: '', type: 'saas', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    eula: {
      productName: '',
      softwareType: 'mobile_app',
      licenseGrant: 'Se concede una licencia limitada, revocable, no exclusiva y no transferible para usar el software conforme a este acuerdo y al plan o suscripción contratada.',
      licenseScope: 'per_account',
      allowsCommercialUse: true,
      transferable: false,
      installationLimit: 'Una cuenta activa, un dispositivo por usuario o la cantidad de asientos contratada, según el plan aplicable.',
      reverseEngineeringRestricted: true,
      modificationRestricted: true,
      redistributionRestricted: true,
      updatesProvided: true,
      supportLevel: 'commercial_support',
      thirdPartyComponents: true,
      openSourceNotice: 'El software puede incluir componentes de terceros u open source sujetos a sus propias licencias, avisos y condiciones aplicables.',
      warrantyDisclaimer: 'Salvo garantía comercial expresa, el software se entrega "tal cual" y según disponibilidad, en la máxima medida permitida por la ley aplicable.',
      liabilityLimit: 'En la máxima medida permitida por la ley, no respondemos por daños indirectos, pérdida de datos, lucro cesante o interrupciones derivadas del uso del software, salvo dolo o prohibición legal aplicable.',
      terminationTriggers: 'La licencia puede terminarse por incumplimiento material, uso no autorizado, falta de pago o violación de restricciones técnicas o legales del producto.',
      governingLaw: 'Según la jurisdicción indicada por el licenciante o el contrato principal aplicable al producto.',
      notes: []
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('eula'), publishDir: defaultPublishDirForDocument('eula'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de EULA'))}\n`);
    stdout.write(`${dim('Te voy a ayudar a generar un contrato de licencia de usuario final para software, apps, SDKs o extensiones.')}\n`);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectEulaSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildEulaInputFromState(state);
      const validation = await generator.validate(input);
      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }
      printEulaSummary(state, validation);
      const action = await promptEulaReviewAction(rl);
      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectEulaSection(rl, state); continue; }
      if (action === 5) { await collectOutputSection(rl, state); continue; }
      if (action === 6) { stdout.write(`${yellow('Wizard cancelado.')}\n`); return; }
      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-eula-input.json`), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-eula-input.json`}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('eula'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('eula')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé el EULA en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

async function runDeletionWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'deletion',
    business: { name: '', type: 'saas', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
    deletion: {
      requestChannel: 'email',
      requestEmail: '',
      requestUrl: '',
      identityRequirements: [],
      deletionScope: [],
      retentionExceptions: [],
      responseTime: '10 días hábiles',
      completionTime: '30 días',
      hasMetaConnection: false,
      metaDisconnectInstructions: '',
      notes: []
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('deletion'), publishDir: defaultPublishDirForDocument('deletion'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de eliminación de datos'))}\n`);
    stdout.write(`${dim('Te voy a ayudar a generar una página pública con instrucciones de eliminación de datos.')}\n`);
    await maybePreloadDeletionFromPrivacy(rl, state);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectDeletionSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildDeletionInputFromState(state);
      const validation = await generator.validate(input);

      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }

      printDeletionSummary(state, validation);
      const action = await promptDeletionReviewAction(rl);

      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectDeletionSection(rl, state); continue; }
      if (action === 5) { await collectOutputSection(rl, state); continue; }
      if (action === 6) { stdout.write(`${yellow('Wizard cancelado.')}\n`); return; }

      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-deletion-input.json`), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-deletion-input.json`}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('deletion'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('deletion')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé las instrucciones en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

async function promptTermsReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar términos')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar servicio')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar compras y precios')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Editar reglas, propiedad y disclaimers')}\n`);
  stdout.write(`  ${yellow('7')}. ${bold('Editar disputas y cambios')}\n`);
  stdout.write(`  ${yellow('8')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('9')}. ${bold('Cancelar')}\n`);

  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 9) {
      return choice;
    }
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runTermsWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'terms',
    business: { name: '', type: 'ecommerce', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'] },
    terms: {
      offeringType: 'physical_goods',
      hasAccounts: false,
      requiresRegistration: false,
      allowsUserContent: false,
      pricesIncludeTaxes: true,
      currency: 'ARS',
      paymentProvider: '',
      refundsOffered: true,
      refundWindow: '10 días',
      refundConditions: '',
      returnShippingResponsibility: 'case_by_case',
      warrantyOffered: false,
      warrantyDetails: '',
      prohibitedActivities: [],
      customRestriction: '',
      ipOwner: '',
      ugcLicenseGranted: false,
      limitIndirectDamages: true,
      shippingDelayDisclaimer: false,
      customDisclaimer: '',
      maySuspendAccounts: true,
      terminationGrounds: '',
      changeNotification: 'site_notice',
      disputesForum: '',
      adrMethod: 'none'
    },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: defaultBaseUrlForDocument('terms'), publishDir: defaultPublishDirForDocument('terms'), writeToFile: false, outputPath: '', saveInput: true, inputPath: '', importPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de términos y condiciones'))}\n`);
    stdout.write(`${dim('Te voy a hacer preguntas cortas y voy a generar un borrador contractual al final.')}\n`);
    await maybePreloadTermsFromPrivacy(rl, state);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectOperationsSection(rl, state);
    await collectTermsServiceSection(rl, state);
    await collectTermsCommerceSection(rl, state);
    await collectTermsRulesSection(rl, state);
    await collectTermsLegalSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildTermsInputFromState(state);
      const validation = await generator.validate(input);

      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }

      printTermsSummary(state, validation);
      const action = await promptTermsReviewAction(rl);

      if (action === 2) { await collectBusinessSection(rl, state); continue; }
      if (action === 3) { await collectContactSection(rl, state); continue; }
      if (action === 4) { await collectTermsServiceSection(rl, state); continue; }
      if (action === 5) { await collectTermsCommerceSection(rl, state); continue; }
      if (action === 6) { await collectTermsRulesSection(rl, state); continue; }
      if (action === 7) { await collectTermsLegalSection(rl, state); continue; }
      if (action === 8) { await collectOutputSection(rl, state); continue; }
      if (action === 9) { stdout.write(`${yellow('Wizard cancelado.')}\n`); return; }

      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath || `${slugify(state.business.name)}-terms-input.json`), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath || `${slugify(state.business.name)}-terms-input.json`}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir || defaultPublishDirForDocument('terms'),
          baseUrl: state.output.baseUrl || defaultBaseUrlForDocument('terms')
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé los términos en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

async function promptReviewAction(rl) {
  stdout.write(`\n${bold(cyan('Qué querés hacer ahora'))}\n`);
  stdout.write(`  ${yellow('1')}. ${bold('Generar política')}\n`);
  stdout.write(`  ${yellow('2')}. ${bold('Editar negocio')}\n`);
  stdout.write(`  ${yellow('3')}. ${bold('Editar contacto')}\n`);
  stdout.write(`  ${yellow('4')}. ${bold('Editar jurisdicción y operación')}\n`);
  stdout.write(`  ${yellow('5')}. ${bold('Editar datos, terceros, bases legales y compliance')}\n`);
  stdout.write(`  ${yellow('6')}. ${bold('Editar formato y guardado')}\n`);
  stdout.write(`  ${yellow('7')}. ${bold('Cancelar')}\n`);

  while (true) {
    const answer = (await rl.question(`${green('Elegí un número')}: `)).trim();
    const choice = Number.parseInt(answer, 10);
    if (choice >= 1 && choice <= 7) {
      return choice;
    }
    stdout.write(`${red('Opción inválida. Probá de nuevo.')}\n`);
  }
}

async function runWizard(generator) {
  const rl = readline.createInterface({ input: stdin, output: stdout });
  const state = {
    documentType: 'privacy',
    business: { name: '', type: '', websiteUrl: '', country: 'Argentina', address: '' },
    contact: { email: '', phone: '', pageUrl: '' },
    operations: { primaryJurisdiction: 'ar', sellRegions: ['ar'], childrenAudience: false },
    dataPractices: { collectedData: [], thirdParties: [], legalBases: [] },
    compliance: { requestedFrameworks: [] },
    output: { language: 'es', format: 'markdown', publishHashedUrl: false, baseUrl: '', publishDir: '', writeToFile: false, outputPath: '', saveInput: true, inputPath: '' },
    manualDisclosures: []
  };

  try {
    stdout.write(`${bold(cyan('Asistente interactivo de privacy-policy'))}\n`);
    stdout.write(`${dim('Te voy a hacer preguntas cortas y voy a generar el borrador al final.')}\n`);
    await collectBusinessSection(rl, state);
    await collectContactSection(rl, state);
    await collectOperationsSection(rl, state);
    await collectDataSection(rl, state);
    await collectOutputSection(rl, state);

    while (true) {
      const input = buildInputFromState(state);
      const validation = await generator.validate(input);

      if (!validation.ok) {
        stdout.write(`\n${bold(red('Todavía faltan datos obligatorios:'))}\n`);
        validation.errors.forEach((error) => stdout.write(`- ${error}\n`));
      }

      printSummary(state, validation);
      const action = await promptReviewAction(rl);

      if (action === 2) {
        await collectBusinessSection(rl, state);
        continue;
      }
      if (action === 3) {
        await collectContactSection(rl, state);
        continue;
      }
      if (action === 4) {
        await collectOperationsSection(rl, state);
        continue;
      }
      if (action === 5) {
        await collectDataSection(rl, state);
        continue;
      }
      if (action === 6) {
        await collectOutputSection(rl, state);
        continue;
      }
      if (action === 7) {
        stdout.write(`${yellow('Wizard cancelado.')}\n`);
        return;
      }

      if (!validation.ok) {
        stdout.write(`${red('No puedo generar hasta que corrijas los datos faltantes.')}\n`);
        continue;
      }

      if (state.output.saveInput) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.inputPath), `${JSON.stringify(input, null, 2)}\n`, 'utf8');
        stdout.write(`\n${green(`Guardé el input en ${state.output.inputPath}`)}\n`);
      }

      const result = await generator.generate(input);
      const output = result[state.output.format];
      let published = null;

      if (state.output.publishHashedUrl) {
        published = await publishGeneratedPolicy(input, result, {
          publishDir: state.output.publishDir,
          baseUrl: state.output.baseUrl
        });
      }

      if (state.output.writeToFile) {
        await fs.writeFile(path.resolve(process.cwd(), state.output.outputPath), output, 'utf8');
        stdout.write(`${green(`Guardé la política en ${state.output.outputPath}`)}\n`);
      } else {
        stdout.write(`\n${output}\n`);
      }

      if (published) {
        stdout.write(`\n${bold(green('URL pública generada:'))} ${published.publicUrl}\n`);
        stdout.write(`${green('Archivo HTML publicado:')} ${published.filePath}\n`);
        stdout.write(`${green('Manifest:')} ${published.manifestPath}\n`);
      }

      if (result.warnings.length > 0) {
        stdout.write(`\n${bold(yellow('Advertencias de revisión:'))}\n`);
        result.warnings.forEach((warning) => stdout.write(`- ${warning}\n`));
      }
      return;
    }
  } finally {
    rl.close();
  }
}

function usage() {
  return [
    'Usage:',
    '  privacy-policy wizard',
    '  privacy-policy generate --document privacy|terms|deletion|cookies|refund|disclaimer|security|dpa|ai|eula --input <file.json> [--format html|markdown|text] [--output file]',
    '  privacy-policy publish --document privacy|terms|deletion|cookies|refund|disclaimer|security|dpa|ai|eula --input <file.json> --base-url <url> [--publish-dir <dir>]',
    '  privacy-policy validate --document privacy|terms|deletion|cookies|refund|disclaimer|security|dpa|ai|eula --input <file.json>',
    '  privacy-policy explain --document privacy|terms|deletion|cookies|refund|disclaimer|security|dpa|ai|eula --input <file.json>',
    '',
    'If you run `privacy-policy` with no command, the interactive wizard starts automatically.'
  ].join('\n');
}

async function main() {
  const { command, options } = parseArgs(process.argv.slice(2));
  const privacyGenerator = new PrivacyPolicyGenerator();
  const termsGenerator = new TermsGenerator();
  const deletionGenerator = new DataDeletionGenerator();
  const cookiesGenerator = new CookiesPolicyGenerator();
  const refundGenerator = new ReturnRefundPolicyGenerator();
  const disclaimerGenerator = new DisclaimerGenerator();
  const securityGenerator = new SecurityPolicyGenerator();
  const dpaGenerator = new DataProcessingAgreementGenerator();
  const aiGenerator = new AiPolicyGenerator();
  const eulaGenerator = new EulaGenerator();

  if (!command || command === 'wizard') {
    const rl = readline.createInterface({ input: stdin, output: stdout });
    try {
      stdout.write(`${bold(cyan('Asistente interactivo de privacy-policy'))}\n`);
      stdout.write(`${dim('Elegí primero qué documento querés generar.')}\n`);
      const documentType = await promptDocumentChoice(rl);
      if (documentType === 'terms') {
        await runTermsWizard(termsGenerator);
      } else if (documentType === 'deletion') {
        await runDeletionWizard(deletionGenerator);
      } else if (documentType === 'cookies') {
        await runCookiesWizard(cookiesGenerator);
      } else if (documentType === 'refund') {
        await runRefundWizard(refundGenerator);
      } else if (documentType === 'disclaimer') {
        await runDisclaimerWizard(disclaimerGenerator);
      } else if (documentType === 'security') {
        await runSecurityWizard(securityGenerator);
      } else if (documentType === 'dpa') {
        await runDpaWizard(dpaGenerator);
      } else if (documentType === 'ai') {
        await runAiWizard(aiGenerator);
      } else if (documentType === 'eula') {
        await runEulaWizard(eulaGenerator);
      } else {
        await runWizard(privacyGenerator);
      }
    } finally {
      rl.close();
    }
    return;
  }

  if (!['generate', 'publish', 'validate', 'explain'].includes(command)) {
    throw new Error(usage());
  }

  const input = await readInput(options);
  const documentType = resolveDocumentType(options, input);
  const generator = documentType === 'terms'
      ? termsGenerator
    : documentType === 'deletion'
      ? deletionGenerator
      : documentType === 'cookies'
        ? cookiesGenerator
        : documentType === 'refund'
          ? refundGenerator
          : documentType === 'disclaimer'
            ? disclaimerGenerator
            : documentType === 'security'
              ? securityGenerator
              : documentType === 'dpa'
                ? dpaGenerator
                : documentType === 'ai'
                  ? aiGenerator
                  : documentType === 'eula'
                    ? eulaGenerator
        : privacyGenerator;

  if (command === 'validate') {
    const validation = await generator.validate(input);
    process.stdout.write(`${JSON.stringify(validation, null, 2)}\n`);
    process.exitCode = validation.ok ? 0 : 1;
    return;
  }

  if (command === 'explain') {
    const explanation = await generator.explain(input);
    process.stdout.write(`${JSON.stringify(explanation, null, 2)}\n`);
    return;
  }

  if (command === 'publish') {
    if (!options['base-url']) {
      throw new Error('publish requires --base-url <public-url>');
    }

    const result = await generator.generate(input);
    const published = await publishGeneratedPolicy(input, result, {
      publishDir: options['publish-dir'] || defaultPublishDirForDocument(documentType),
      baseUrl: options['base-url']
    });

    process.stdout.write(`${published.publicUrl}\n`);
    process.stdout.write(`Published file: ${published.filePath}\n`);
    process.stdout.write(`Manifest: ${published.manifestPath}\n`);
    process.stdout.write('Note: this command writes a local file and assumes your existing hosting or server already serves that directory publicly. Without that hosting, the result is only a local file plus an expected URL.\n');
    return;
  }

  const format = options.format || 'markdown';
  const result = await generator.generate(input);
  const output = result[format];

  if (!output) {
    throw new Error(`Unsupported format: ${format}`);
  }

  if (options.output) {
    await fs.writeFile(path.resolve(process.cwd(), options.output), output, 'utf8');
    process.stdout.write(`Wrote ${format} output to ${options.output}\n`);
  }

  if (!options.output) {
    process.stdout.write(`${output}\n`);
  }

  if (options['base-url'] || options['publish-dir']) {
    const published = await publishGeneratedPolicy(input, result, {
      publishDir: options['publish-dir'] || defaultPublishDirForDocument(documentType),
      baseUrl: options['base-url'] || defaultBaseUrlForDocument(documentType)
    });
    process.stdout.write(`Published URL: ${published.publicUrl}\n`);
    process.stdout.write(`Published file: ${published.filePath}\n`);
    process.stdout.write('Note: this publish step assumes your existing hosting or server already serves that directory publicly. Without that hosting, the result is only a local file plus an expected URL.\n');
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
