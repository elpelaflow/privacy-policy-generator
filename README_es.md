<h1 align="center">Privacy Policy Generator</h1>

<p align="center">
  <img src="./web/assets/brand/readme-banner.svg" alt="Banner de Policy Generator Hub">
</p>

<p align="center">
  <a href="./README.md">English</a> | Español
</p>

[![App pública](https://img.shields.io/badge/App%20p%C3%BAblica-GitHub%20Pages-24292f?logo=github)](https://elpelaflow.github.io/privacy-policy-generator/)
![Documentos](https://img.shields.io/badge/Documentos-9-blue)
![Descargas](https://img.shields.io/badge/Descargas-HTML%20%7C%20DOCX%20%7C%20MD%20%7C%20TXT%20%7C%20JSON-6f42c1)
![Tests](https://img.shields.io/badge/Tests-50%20passing-2ea44f)
[![Donar](https://img.shields.io/badge/Donar-PayPal-0070ba?logo=paypal)](https://www.paypal.com/donate?hosted_button_id=YA9R8YKCDMM84)

Generá documentos legales para apps, SaaS, ecommerce y sitios web desde una CLI o desde una app en el navegador, y luego descargalos o publicalos en GitHub Pages.

Usá la [app web pública](https://elpelaflow.github.io/privacy-policy-generator/) si querés probarla de inmediato sin hacer fork ni desplegar nada.

## Resumen

- `⚖️` genera documentos de privacidad, términos, cookies, reembolsos, seguridad, EULA, DPA, IA y eliminación de datos
- `🌐` usa la app pública en navegador o ejecutá la CLI localmente
- `🧩` aplica presets específicos por documento para escenarios comunes
- `📦` exporta `html`, `md`, `txt`, `docx` y `json` de entrada
- `🚀` publica documentos en tu propio repo de GitHub Pages bajo rutas seguras `legal/...`

## Para quién es

- `🏢` operadores de SaaS y apps que necesitan páginas legales públicas rápidamente
- `🛍️` dueños de ecommerce o sitios de contenido que quieren documentos legales editables
- `🧑‍💻` desarrolladores que quieren una CLI local más un flujo en navegador
- `🗂️` equipos que quieren mantener los inputs de documentos legales versionados como JSON

## Alcance

Este repo soporta dos modos de uso:

- generadores orientados a terminal para documentos de privacidad, términos, cookies, devoluciones/reembolsos, disclaimers, política de seguridad, EULA, DPA, política de IA e instrucciones de eliminación de datos
- una app web estática client-side que corre completamente en el navegador y puede desplegarse en GitHub Pages

## Funcionalidades principales

- reglas estructuradas en lugar de parsing de condiciones basado en strings
- formato de entrada JSON canónico
- wizard interactivo con selección de documento, opciones guiadas y notas manuales tipo "Other"
- app estática en navegador con UI moderna, validación en vivo, vista previa, descargas y publicación en GitHub
- presets específicos por documento para privacidad, términos, cookies, reembolsos, EULA, seguridad, eliminación, DPA e IA
- `disclaimer` se mantiene intencionalmente manual-first porque su valor suele ser más editorial/contextual que estructural
- generación de EULA para software/apps con licencia, restricciones, updates, soporte y cláusulas de responsabilidad
- selector de idioma de la página y del documento en español o inglés
- generación opcional de URL pública con hash para HTML publicado en hosting que ya tengas
- flujo de publicación con GitHub OAuth para repositorios del usuario en GitHub Pages
- rutas seguras bajo `legal/<document-type>/...` para evitar tocar la raíz del sitio del usuario
- políticas propias del proyecto generadas en `docs/legal/` desde fuentes JSON en `data/project-policies/`
- el HTML legal generado puede incluir metadata interna `JSON-LD` para describir la página y la organización responsable
- el HTML legal generado usa una estructura semántica más fuerte con landmarks y fechas legibles por máquinas
- errores de validación y advertencias de borrador
- salida explicable con `decisionLog`
- generación en HTML, Markdown y texto plano
- tests automatizados de regresión

## Elegí tu workflow

### 1. 🌐 App web pública

Usá la app hospedada en navegador para:

- elegir un documento
- completar el formulario guiado
- aplicar presets
- descargar el resultado
- opcionalmente publicarlo en tu propio repo de GitHub Pages

### 2. 🧑‍💻 CLI local

Usá la CLI si querés:

- generación desde terminal
- validación local
- scripting o workflows repetibles
- publicación en hosting que ya controlás

### 3. 🏗️ Tu propia copia hosteada

Hacé fork del repo y desplegá tu propia app estática + backend Worker si querés:

- tu propio branding
- tu propia OAuth app
- tu propio backend
- control total de la instancia pública

## 🌐 App web estática

El repo incluye una app estática basada en navegador bajo `web/` y una salida lista para GitHub Pages bajo `docs/`.

Lo que la app estática puede hacer hoy:

- elegir cualquier documento legal soportado
- completar un formulario guiado en el navegador
- generar el documento final client-side
- previsualizar salida HTML, Markdown o texto
- descargar `html`, `md`, `txt`, `docx` y `json` de entrada
- importar JSON generado previamente para seguir editando sin empezar de cero
- aplicar presets específicos para `privacy`, `terms`, `cookies`, `refund`, `eula`, `security`, `deletion`, `dpa` y `ai`, incluyendo flujos de IA para moderación/seguridad y marketing/contenido
- mantener `disclaimer` manual-first a propósito, porque sus decisiones sensibles suelen ser editoriales y específicas del contexto
- autenticarse con GitHub mediante un backend Cloudflare Worker
- listar repositorios del usuario autenticado
- detectar si un repo tiene `Pages activo` o `Pages accesible`
- publicar HTML generado en un repo seleccionado bajo una ruta segura como `legal/privacy/...`
- construir una suite legal temporal en el navegador y publicar varios documentos en un solo commit
- devolver la URL final esperada de GitHub Pages

Lo que todavía no hace:

- editar automáticamente la home o footer existente del usuario para insertar links legales
- activar automáticamente GitHub Pages en repos donde Pages no esté configurado
- publicar raíces arbitrarias de documentos fuera del flujo guiado actual

## 🧠 Nota sobre datos estructurados

El HTML legal generado puede incluir metadata embebida `JSON-LD` usando tipos de Schema.org como `WebPage` y `Organization`.

Aclaración importante:

- esta metadata es interna y no se ve como contenido normal de la página
- busca mejorar la descripción semántica legible por máquinas de la página y de la entidad responsable
- no garantiza por sí sola rich results especiales de Google ni reconocimiento legal oficial
- tratala como una mejora de datos estructurados, no como una solución mágica de compliance o SEO

## ♿ Nota sobre accesibilidad

Los documentos HTML generados usan ahora una estructura base más accesible en todos los tipos de documentos soportados, incluyendo:

- idioma explícito del documento
- landmark principal de contenido
- jerarquía de títulos más clara
- fechas legibles por máquinas con `<time datetime="...">`
- tipografía y contraste por defecto más legibles

Aclaración importante:

- esto es una mejora orientada a accesibilidad, no una certificación WCAG formal
- mejora los documentos generados para lectores de pantalla y parsing semántico
- las obligaciones legales o contractuales de accesibilidad pueden requerir auditoría independiente según jurisdicción o contexto del producto

## 🚀 Publicación en GitHub v1

El repo incluye un backend Cloudflare Worker bajo:

```text
backend/cloudflare-worker/
```

Este Cloudflare Worker maneja:

- inicio/callback de GitHub OAuth
- resolución de sesión para la app en navegador
- listado de repos del usuario autenticado
- chequeos de estado de GitHub Pages
- publicación de archivos HTML generados en una ruta seleccionada del repo
- devolución de la URL pública final esperada de GitHub Pages

No está activo por defecto. Para habilitarlo necesitás:

1. una GitHub OAuth App
2. un Cloudflare Worker desplegado con secrets
3. una URL pública del Worker
4. `backendBaseUrl` configurada en la app web estática

### Archivos de configuración del frontend

La app estática lee la configuración del backend desde archivos dedicados, en vez de hardcodear la URL del Worker en `web/index.html`.

- `web/config.example.js`
  ejemplo por defecto incluido en el repo
- `web/config.js`
  override local opcional para tu propia instancia
- `docs/config.js`
  configuración usada por el build publicado en GitHub Pages

Comportamiento del build:

- si existe `web/config.js`, `npm run build:web` lo copia a `docs/config.js`
- si no, pero ya existe `docs/config.js`, el build preserva esa configuración
- si no, el build usa `web/config.example.js`

Esto mantiene el árbol fuente genérico y permite que la instancia pública siga conectada a su backend real.

Archivos del Worker:

- [backend/cloudflare-worker/src/index.js](backend/cloudflare-worker/src/index.js)
- [backend/cloudflare-worker/wrangler.toml.example](backend/cloudflare-worker/wrangler.toml.example)
- [backend/cloudflare-worker/README.md](backend/cloudflare-worker/README.md)

Build de la web estática:

```bash
npm install
npm run build:web
```

Esto escribe el sitio estático desplegable en:

```text
docs/
```

Esa carpeta está lista para servirse con GitHub Pages.

## 📄 Flujo de publicación en GitHub Pages

Una vez configuradas la app estática y el backend, el flujo en navegador es:

1. abrir la app web
2. elegir un tipo de documento
3. completar el formulario y generar el HTML
4. hacer click en `Conectar GitHub`
5. autorizar la GitHub OAuth App
6. elegir un repositorio desde el dropdown
7. publicar el documento generado en una ruta segura del repo, por ejemplo:

```text
legal/privacy/my-app-abc123.html
legal/terms/my-app-abc123.html
legal/cookies/my-app-abc123.html
legal/dpa/my-app-abc123.html
```

Si el repositorio seleccionado ya tiene GitHub Pages habilitado y accesible, la URL final debería poder usarse inmediatamente.

Importante:

- el flujo de publicación no sobrescribe `index.html`
- no modifica la home ni la navegación del sitio del usuario
- sólo agrega archivos legales independientes bajo `legal/...`
- luego el usuario puede enlazar manualmente esas URLs desde su sitio si quiere

## Cómo usar este proyecto

### Opción A: usar la app pública

Si sólo querés generar documentos legales, no necesitás hacer fork de este repo.

Flujo típico:

1. abrir la [app web pública](https://elpelaflow.github.io/privacy-policy-generator/)
2. elegir un tipo de documento
3. completar el formulario
4. generar el documento en el navegador
5. descargar la salida
6. opcionalmente conectar GitHub y publicar en tu propio repositorio

Este es el camino recomendado para usuarios normales. No necesitan entender detalles internos del backend mientras la instancia pública ya esté configurada y funcionando.

### Opción B: correr tu propia copia

Si querés una instancia independiente, tu propio branding o tu propio backend y setup OAuth, entonces deberías hacer fork del repo y desplegar tu propia versión.

Eso implica:

- tu propio repo de GitHub y sitio de GitHub Pages
- tu propio backend Cloudflare Worker
- tu propia GitHub OAuth App
- tus propios secrets del Worker
- tu propio `backendBaseUrl`

Orden recomendado de setup:

1. hacer fork de este repositorio
2. clonar tu fork localmente
3. instalar dependencias:

```bash
npm install
```

4. construir la app web estática:

```bash
npm run build:web
```

5. publicar la carpeta generada `docs/` con GitHub Pages en tu fork
6. crear una GitHub OAuth App
7. configurar la callback URL como:

```text
https://YOUR-WORKER/api/github/callback
```

8. desplegar el Cloudflare Worker desde:

```text
backend/cloudflare-worker/
```

9. configurar estos valores en el Worker:

- `PUBLIC_APP_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SESSION_SECRET`

10. definir la URL del Worker en la app web mediante:

```js
globalThis.__LEGAL_HUB_CONFIG__ = {
  backendBaseUrl: "https://your-worker.workers.dev"
};
```

11. guardar eso en `web/config.js`
12. reconstruir y republicar el sitio estático
13. probar el flujo completo en navegador:

- conectar GitHub
- listar repos
- generar un documento
- publicar en un repo

Si salteás el setup del Worker u OAuth, tu fork igual funciona como:

- generador CLI
- generador en navegador con descargas

pero no como app completa de publicación en GitHub.

## Documentos soportados

- `privacy`: generador de política de privacidad
- `terms`: generador de términos y condiciones / condiciones de servicio
- `deletion`: generador de URL con instrucciones de eliminación de datos
- `cookies`: generador de política de cookies
- `refund`: generador de política de devoluciones y reembolsos
- `disclaimer`: generador modular de disclaimers
- `security`: generador de política de seguridad y divulgación responsable
- `dpa`: generador de data processing agreement para SaaS B2B / relaciones controller-processor
- `ai`: generador de política de uso de IA y datos de entrenamiento

## Inputs soportados

- tipos de negocio: `ecommerce`, `blog`, `saas`, `mobile`, `nonprofit`
- jurisdicciones: `us`, `eu`, `uk`, `ca`, `au`, `ar`, `global`
- categorías de datos: `personal`, `financial`, `tax`, `identity`, `usage`, `cookies`, `location`, `profiling`
- categorías de terceros: `analytics`, `advertising`, `payment`, `paypal_only`, `shipping`, `cloud`, `social`, `email`
- bases legales: `contract`, `consent`, `legal_obligation`, `legitimate_interest`
- toggles de cumplimiento: `ccpa`, `coppa`, `caloppa`, `pipeda`
- idiomas de página y salida: `es`, `en`

## Integración con hosting existente

Sí, el repo puede integrarse con hosting que ya tengas.

El generador puede crear una política de privacidad HTML estática y opcionalmente publicarla en un directorio usando un nombre de archivo con hash, por ejemplo:

```text
acme-cloud-7f3c1b2a9d4e6f10.html
```

Si proporcionás:

- una URL base pública como `https://example.com/privacy`
- un directorio local de publicación como `./public/privacy`

la CLI escribe el archivo HTML allí y devuelve una URL final como:

```text
https://example.com/privacy/acme-cloud-7f3c1b2a9d4e6f10.html
```

Esa URL es válida siempre que tu propio servidor o host estático ya sirva públicamente ese directorio.

Importante:

- el repo no crea tu infraestructura de hosting desde cero
- el repo no provisiona automáticamente un VPS, servidor web o host estático
- puede integrarse con hosting que ya tengas

Ejemplos típicos:

- un sitio existente que sirve `./public/privacy`
- un host estático que sirve un directorio `/privacy`
- un reverse proxy donde una URL pública ya apunta a una ruta del filesystem

## Instalación

```bash
git clone https://github.com/elpelaflow/privacy-policy-generator
cd privacy-policy-generator
npm install
```

El uso en runtime sólo necesita Node.js, pero `npm install` es necesario si querés construir la app web estática para GitHub Pages.

Para instalar el comando para el usuario actual sin root:

```bash
mkdir -p "$HOME/.local/bin" "$HOME/.local/lib"
env npm_config_prefix="$HOME/.local" npm link
```

Si `~/.local/bin` todavía no está en `PATH`, agregalo en tu profile de shell.

## Comandos

Wizard interactivo:

```bash
privacy-policy
```

o explícitamente:

```bash
privacy-policy wizard
```

Validar input:

```bash
privacy-policy validate --input ./examples/saas-eu.json
```

Validar términos:

```bash
privacy-policy validate --document terms --input ./examples/terms-ar-ecommerce.json
```

Validar instrucciones de eliminación:

```bash
privacy-policy validate --document deletion --input ./examples/deletion-ar-meta.json
```

Validar política de cookies:

```bash
privacy-policy validate --document cookies --input ./examples/cookies-ar-meta.json
```

Validar política de devoluciones/reembolsos:

```bash
privacy-policy validate --document refund --input ./examples/refund-ar-ecommerce.json
```

Validar disclaimer:

```bash
privacy-policy validate --document disclaimer --input ./examples/disclaimer-meta-content.json
```

Validar política de seguridad:

```bash
privacy-policy validate --document security --input ./examples/security-disclosure.json
```

Validar DPA:

```bash
privacy-policy validate --document dpa --input ./examples/dpa-saas-b2b.json
```

Validar política de IA:

```bash
privacy-policy validate --document ai --input ./examples/ai-policy-saas.json
```

Explicar qué secciones fueron incluidas:

```bash
privacy-policy explain --input ./examples/saas-eu.json
```

Generar términos en Markdown:

```bash
privacy-policy generate --document terms --input ./examples/terms-ar-ecommerce.json --format markdown
```

Generar instrucciones de eliminación en Markdown:

```bash
privacy-policy generate --document deletion --input ./examples/deletion-ar-meta.json --format markdown
```

Generar política de cookies en Markdown:

```bash
privacy-policy generate --document cookies --input ./examples/cookies-ar-meta.json --format markdown
```

Generar política de devoluciones/reembolsos en Markdown:

```bash
privacy-policy generate --document refund --input ./examples/refund-ar-ecommerce.json --format markdown
```

Generar disclaimer en Markdown:

```bash
privacy-policy generate --document disclaimer --input ./examples/disclaimer-meta-content.json --format markdown
```

Generar política de seguridad en Markdown:

```bash
privacy-policy generate --document security --input ./examples/security-disclosure.json --format markdown
```

Generar DPA en Markdown:

```bash
privacy-policy generate --document dpa --input ./examples/dpa-saas-b2b.json --format markdown
```

Generar política de IA en Markdown:

```bash
privacy-policy generate --document ai --input ./examples/ai-policy-saas.json --format markdown
```

Publicar directamente y devolver la URL pública final:

```bash
privacy-policy publish \
  --input ./examples/saas-eu.json \
  --base-url https://example.com/privacy \
  --publish-dir ./public/privacy
```

Importante: este flujo de publicación por CLI escribe un archivo local y asume que tu hosting o servidor existente ya sirve públicamente ese directorio. Si no tenés hosting para esa ruta, el resultado práctico es sólo un archivo local más una URL esperada.

Si omitís `--publish-dir`, la CLI usa directorios locales genéricos como:

```text
./public/privacy
./public/terms
./public/data-deletion
./public/cookies
./public/refunds
./public/disclaimer
./public/security
./public/dpa
./public/ai
```

Generar Markdown:

```bash
privacy-policy generate --input ./examples/saas-eu.json --format markdown
```

Generar HTML a un archivo:

```bash
privacy-policy generate --input ./examples/saas-eu.json --format html --output ./privacy-policy.html
```

Generar y publicar una URL con hash usando hosting existente:

```bash
privacy-policy generate \
  --input ./examples/saas-eu.json \
  --base-url https://example.com/privacy \
  --publish-dir ./public/privacy
```

Generar y publicar términos:

```bash
privacy-policy publish \
  --document terms \
  --input ./examples/terms-ar-ecommerce.json \
  --base-url https://example.com/terms \
  --publish-dir ./public/terms
```

Generar y publicar instrucciones de eliminación de datos:

```bash
privacy-policy publish \
  --document deletion \
  --input ./examples/deletion-ar-meta.json \
  --base-url https://example.com/data-deletion \
  --publish-dir ./public/data-deletion
```

Generar y publicar política de cookies:

```bash
privacy-policy publish \
  --document cookies \
  --input ./examples/cookies-ar-meta.json \
  --base-url https://example.com/cookies \
  --publish-dir ./public/cookies
```

Generar y publicar política de devoluciones/reembolsos:

```bash
privacy-policy publish \
  --document refund \
  --input ./examples/refund-ar-ecommerce.json \
  --base-url https://example.com/refunds \
  --publish-dir ./public/refunds
```

Generar y publicar disclaimer:

```bash
privacy-policy publish \
  --document disclaimer \
  --input ./examples/disclaimer-meta-content.json \
  --base-url https://example.com/disclaimer \
  --publish-dir ./public/disclaimer
```

Generar y publicar política de seguridad:

```bash
privacy-policy publish \
  --document security \
  --input ./examples/security-disclosure.json \
  --base-url https://example.com/security \
  --publish-dir ./public/security
```

Generar y publicar DPA:

```bash
privacy-policy publish \
  --document dpa \
  --input ./examples/dpa-saas-b2b.json \
  --base-url https://example.com/dpa \
  --publish-dir ./public/dpa
```

Generar y publicar política de IA:

```bash
privacy-policy publish \
  --document ai \
  --input ./examples/ai-policy-saas.json \
  --base-url https://example.com/ai \
  --publish-dir ./public/ai
```

## Formato de entrada

```json
{
  "business": {
    "name": "Acme Cloud",
    "type": "saas",
    "websiteUrl": "https://acme.example",
    "country": "Germany",
    "address": "42 Example Street, Berlin"
  },
  "contact": {
    "email": "privacy@acme.example",
    "phone": "+49 30 000000",
    "pageUrl": "https://acme.example/privacy-contact"
  },
  "operations": {
    "primaryJurisdiction": "eu",
    "sellRegions": ["eu", "uk"],
    "childrenAudience": false
  },
  "dataPractices": {
    "collectedData": ["personal", "usage", "cookies"],
    "thirdParties": ["analytics", "cloud", "email"],
    "legalBases": ["contract", "legitimate_interest"]
  },
  "compliance": {
    "requestedFrameworks": []
  }
}
```

Todavía podés usar archivos JSON directamente, pero el workflow de terminal recomendado ahora es:

1. ejecutar `privacy-policy`
2. elegir si querés `privacy`, `terms`, `cookies`, `refund`, `disclaimer`, `security`, `dpa`, `ai` o `deletion`
3. responder las preguntas del wizard
4. elegir idioma de salida y formato de salida
5. opcionalmente guardar tanto el documento generado como el JSON de entrada

Durante el wizard, escribí `<` para volver una pregunta dentro del bloque actual.

Para `ecommerce`, el wizard abre preguntas extra sobre pagos, envíos, datos fiscales, verificaciones de identidad y profiling.

Si esos ítems relevantes se omiten, el generador igual produce un borrador, pero ahora muestra advertencias fuertes de revisión en lugar de pasar silenciosamente.

Para `cookies`, el wizard pregunta específicamente sobre:

- categorías de cookies
- proveedores terceros de cookies
- modo de consentimiento o estrategia de banner
- URL de gestión o página de configuración de cookies
- controles del navegador/dispositivo
- duración de cookies o notas de retención

Para `refund`, el wizard pregunta específicamente sobre:

- qué tipo de oferta cubre la política
- plazos de devolución y cambio
- condiciones de devolución
- canal para solicitar devoluciones o reembolsos
- quién paga el envío de devolución
- método y tiempo de procesamiento del reembolso
- categorías excluidas o no retornables
- tratamiento de productos dañados o incorrectos

Para `disclaimer`, el wizard pregunta específicamente sobre:

- qué tipos de disclaimer aplican
- lenguaje de asesoramiento profesional para contenido de salud o fitness
- lenguaje sobre enlaces externos
- metodología de reseñas o divulgación de afiliados
- redacción de uso bajo propio riesgo

Para `security`, el wizard pregunta específicamente sobre:

- canales de reporte de seguridad
- alcance de disclosure y activos cubiertos
- lenguaje de safe harbor y buena fe
- qué testing está permitido o prohibido
- tiempos de acuse de recibo y actualización de estado
- disclosure coordinado y notas sobre bug bounty
- resumen opcional de prácticas de seguridad

Para `dpa`, el wizard pregunta específicamente sobre:

- identidad y rol de la contraparte
- descripción del servicio SaaS y duración del tratamiento
- finalidad del tratamiento
- categorías de datos personales y titulares de datos
- canales de instrucciones, confidencialidad y medidas de seguridad
- subprocessors, modelo de autorización, ventana de aviso/objeción y metodología de vendors
- mecanismos de transferencia y salvaguardas complementarias
- tiempos de incidentes y compromisos de asistencia
- manejo de eliminación o devolución, incluyendo comportamiento de backups
- derechos de auditoría, mecanismo de auditoría y expectativas de preaviso

Para `ai`, el wizard pregunta específicamente sobre:

- qué sistemas o funciones de IA están en alcance
- qué casos de uso atienden
- si los datos se usan para evaluación, mejora o entrenamiento
- qué actividades específicas de uso de datos de IA ocurren, como evaluación de calidad, safety testing, fine-tuning, entrenamiento más amplio, monitoreo de abuso o analítica de producto
- qué fuentes de datos y proveedores terceros intervienen
- retención y controles de opt-out
- si aplican decisiones automatizadas o revisión humana
- restricciones sobre datos sensibles y controles de seguridad

Para `terms`, el wizard abre secciones separadas para:

- descripción del servicio
- cuentas y contenido de usuarios
- precios, pagos, reembolsos y garantía
- conducta prohibida y propiedad intelectual
- disclaimers, terminación y resolución de disputas

Para `deletion`, el wizard abre secciones separadas para:

- canales de solicitud
- detalles de verificación de identidad
- alcance de eliminación
- excepciones de retención
- tiempos de respuesta y finalización
- guía de revocación para Meta/Facebook

## Testing

Ejecutá:

```bash
npm test
```

La cobertura actual de tests verifica:

- aparece contenido GDPR para inputs de la UE
- la retención específica de ecommerce se limita a ecommerce
- aparecen derechos de California en escenarios de EE.UU.
- aparecen derechos y advertencias de Argentina en escenarios de Argentina
- las opciones `social` y `email` afectan la salida generada
- la selección COPPA afecta contenido de privacidad infantil
- las advertencias de privacidad para e-commerce ahora marcan gaps de pagos, envíos y cobertura fiscal sin bloquear la generación
- la generación de términos cubre secciones de pago, reembolso y disputas
- la generación de reembolsos cubre plazos de devolución, excepciones y tiempos de reembolso
- la generación de disclaimer cubre advertencias modulares para enlaces, reseñas, riesgos y contenido informativo
- la generación de seguridad cubre canales de reporte, safe harbor, tiempos de disclosure y resúmenes opcionales de prácticas de seguridad
- la generación de DPA cubre roles controller-processor, subprocessors, modelo de autorización, mecanismos de transferencia, salvaguardas complementarias, tiempos de incidentes, mecánicas de auditoría y lenguaje de eliminación/devolución al cierre del servicio
- la generación de política de IA cubre casos de uso de IA, disclosures de entrenamiento/mejora, actividades específicas de uso de datos de IA, proveedores, retención, caminos de revisión y salvaguardas de alto nivel
- la generación de eliminación cubre canales de solicitud, alcance de eliminación y guía para cuentas conectadas con Meta
- la validación reporta campos obligatorios faltantes

## Estructura del repositorio

```text
cli.js
web/
docs/
backend/cloudflare-worker/
data/policy-sections.json
examples/saas-eu.json
examples/terms-ar-ecommerce.json
examples/deletion-ar-meta.json
examples/cookies-ar-meta.json
examples/refund-ar-ecommerce.json
examples/disclaimer-meta-content.json
examples/security-disclosure.json
examples/dpa-saas-b2b.json
examples/ai-policy-saas.json
js/generator.js
js/terms-generator.js
js/deletion-generator.js
js/cookies-generator.js
js/refund-generator.js
js/disclaimer-generator.js
js/security-generator.js
js/dpa-generator.js
js/ai-policy-generator.js
tests/generator.test.js
package.json
```

## Límites

Esta herramienta genera borradores de documentos legales, no asesoramiento legal.

- no garantiza cumplimiento normativo
- no reemplaza revisión legal
- depende de inputs operativos precisos
