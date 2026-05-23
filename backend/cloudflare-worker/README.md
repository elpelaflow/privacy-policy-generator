# Cloudflare Worker Backend

Backend for `GitHub Publish v1`.

Expone:

- `GET /api/health`
- `GET /api/github/start`
- `GET /api/github/callback`
- `GET /api/github/session`
- `POST /api/github/logout`
- `GET /api/github/repos`
- `POST /api/github/publish`

## Variables requeridas

- `PUBLIC_APP_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `SESSION_SECRET`

## Qué hace hoy

- inicia el flujo OAuth con GitHub
- recibe el callback OAuth
- devuelve la sesión autenticada a la web estática
- lista repositorios del usuario autenticado
- detecta si el repo tiene `Pages activo`
- intenta verificar si la URL base del repo es `Pages accesible`
- publica documentos HTML generados por la web en el repo del usuario
- devuelve una URL pública esperada de GitHub Pages

The web app publishes legal documents into dedicated repo paths such as:

```text
legal/privacy/<slug>-<hash>.html
legal/terms/<slug>-<hash>.html
legal/cookies/<slug>-<hash>.html
```

This is intentionally separated from the site root so the user's existing homepage and app structure are not overwritten.

## Flujo esperado

1. Configurar una GitHub OAuth App
2. Usar como callback:
   `https://TU-WORKER/api/github/callback`
3. Configurar `PUBLIC_APP_URL` con la URL pública de la app web
4. Cargar `GITHUB_CLIENT_SECRET` y `SESSION_SECRET` como secrets del worker
5. Desplegar el worker
6. En la web, definir:

```html
<script>
  globalThis.__LEGAL_HUB_CONFIG__ = {
    backendBaseUrl: "https://tu-worker.tu-dominio.workers.dev"
  };
</script>
```

## Notas

- The worker does not automatically enable GitHub Pages on a repository.
- A repo can accept document publishes even if Pages is not yet active.
- Public URLs only work immediately when the selected repo already has GitHub Pages configured and accessible.

## Desarrollo

```bash
cd backend/cloudflare-worker
npm install
npm run dev
```
