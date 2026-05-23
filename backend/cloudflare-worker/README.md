# Cloudflare Worker Backend

Backend mínimo para la fase `GitHub Publish v1`.

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

## Flujo esperado

1. Configurar una GitHub OAuth App
2. Usar como callback:
   `https://TU-WORKER/api/github/callback`
3. Configurar `PUBLIC_APP_URL` con la URL pública de GitHub Pages
4. Desplegar el worker
5. En la web, definir:

```html
<script>
  globalThis.__LEGAL_HUB_CONFIG__ = {
    backendBaseUrl: "https://tu-worker.tu-dominio.workers.dev"
  };
</script>
```

## Desarrollo

```bash
cd backend/cloudflare-worker
npm install
npm run dev
```
