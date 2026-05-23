const corsHeaders = (origin) => ({
  'access-control-allow-origin': origin,
  'access-control-allow-credentials': 'true',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type, authorization'
});

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = publicAppOrigin(env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    try {
      if (url.pathname === '/api/health') {
        return json({ ok: true }, origin);
      }

      if (url.pathname === '/api/github/start') {
        return startOAuth(request, env);
      }

      if (url.pathname === '/api/github/callback') {
        return finishOAuth(request, env);
      }

      if (url.pathname === '/api/github/session') {
        return getSession(request, env, origin);
      }

      if (url.pathname === '/api/github/logout' && request.method === 'POST') {
        return logout(env, origin);
      }

      if (url.pathname === '/api/github/repos') {
        return listRepos(request, env, origin);
      }

      if (url.pathname === '/api/github/publish' && request.method === 'POST') {
        return publishDocument(request, env, origin);
      }

      return json({ error: 'Not found' }, origin, 404);
    } catch (error) {
      return json({ error: error.message || 'Unexpected error' }, origin, 500);
    }
  }
};

async function startOAuth(request, env) {
  const state = crypto.randomUUID();
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  url.searchParams.set('redirect_uri', `${workerBaseUrl(request)}/api/github/callback`);
  url.searchParams.set('scope', 'repo');
  url.searchParams.set('state', state);

  const returnTo = new URL(request.url).searchParams.get('return_to') || env.PUBLIC_APP_URL;
  const stateCookie = serializeCookie(env.STATE_COOKIE_NAME || 'ppg_state', JSON.stringify({ state, returnTo }), {
    path: '/',
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    partitioned: true,
    maxAge: 600
  });

  return new Response(null, {
    status: 302,
    headers: {
      location: url.toString(),
      'set-cookie': stateCookie
    }
  });
}

async function finishOAuth(request, env) {
  const url = new URL(request.url);
  const cookies = parseCookies(request.headers.get('cookie') || '');
  const statePayload = cookies[env.STATE_COOKIE_NAME || 'ppg_state'];
  if (!statePayload) {
    throw new Error('Missing OAuth state cookie.');
  }

  const stored = JSON.parse(statePayload);
  const state = url.searchParams.get('state');
  const code = url.searchParams.get('code');
  if (!state || state !== stored.state || !code) {
    throw new Error('Invalid OAuth callback state.');
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${workerBaseUrl(request)}/api/github/callback`
    })
  });

  const tokenPayload = await tokenResponse.json();
  if (!tokenPayload.access_token) {
    throw new Error('GitHub token exchange failed.');
  }

  const user = await githubApi('/user', tokenPayload.access_token);
  const sessionValue = await sealSession({
    accessToken: tokenPayload.access_token,
    login: user.login
  }, env.SESSION_SECRET);

  const sessionCookie = serializeCookie(env.COOKIE_NAME || 'ppg_session', sessionValue, {
    path: '/',
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    partitioned: true,
    maxAge: 60 * 60 * 8
  });

  const clearStateCookie = serializeCookie(env.STATE_COOKIE_NAME || 'ppg_state', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    partitioned: true,
    maxAge: 0
  });

  const returnUrl = new URL(stored.returnTo || env.PUBLIC_APP_URL);
  returnUrl.hash = buildSessionHash(sessionValue, user.login);

  const headers = new Headers({
    location: returnUrl.toString()
  });
  headers.append('set-cookie', sessionCookie);
  headers.append('set-cookie', clearStateCookie);
  return new Response(null, { status: 302, headers });
}

async function getSession(request, env, origin) {
  const session = await readSession(request, env);
  if (!session) {
    return json({ authenticated: false }, origin);
  }

  return json({
    authenticated: true,
    user: {
      login: session.login
    }
  }, origin);
}

async function logout(env, origin) {
  const expired = serializeCookie(env.COOKIE_NAME || 'ppg_session', '', {
    path: '/',
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    partitioned: true,
    maxAge: 0
  });

  const headers = new Headers({
    ...corsHeaders(origin),
    'content-type': 'application/json'
  });
  headers.append('set-cookie', expired);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
}

async function listRepos(request, env, origin) {
  const session = await requireSession(request, env);
  const repos = await githubApi('/user/repos?per_page=100&sort=updated', session.accessToken);
  const pagesStatuses = await Promise.all(repos.map(async (repo) => {
    try {
      const pages = await githubApi(`/repos/${repo.full_name}/pages`, session.accessToken);
      const publicBaseUrl = buildRepoPagesBaseUrl(repo.owner?.login, repo.name, pages.html_url || repo.homepage);
      const accessible = publicBaseUrl ? await isPublicUrlAccessible(publicBaseUrl) : false;
      return {
        name: repo.full_name,
        active: true,
        accessible,
        publicBaseUrl
      };
    } catch {
      return {
        name: repo.full_name,
        active: false,
        accessible: false,
        publicBaseUrl: buildRepoPagesBaseUrl(repo.owner?.login, repo.name, repo.homepage)
      };
    }
  }));
  const pagesMap = new Map(pagesStatuses.map((item) => [item.name, item]));

  return json({
    repos: repos.map((repo) => ({
      full_name: repo.full_name,
      default_branch: repo.default_branch,
      owner: repo.owner?.login,
      name: repo.name,
      pages_active: pagesMap.get(repo.full_name)?.active || false,
      pages_accessible: pagesMap.get(repo.full_name)?.accessible || false,
      pages_url: pagesMap.get(repo.full_name)?.publicBaseUrl || buildRepoPagesBaseUrl(repo.owner?.login, repo.name, repo.homepage)
    }))
  }, origin);
}

async function publishDocument(request, env, origin) {
  const session = await requireSession(request, env);
  const payload = await request.json();
  if (!payload.repo || !payload.path || !payload.content) {
    throw new Error('repo, path and content are required.');
  }

  const repoInfo = await githubApi(`/repos/${payload.repo}`, session.accessToken);
  let existingSha = null;
  try {
    const existing = await githubApi(`/repos/${payload.repo}/contents/${payload.path}?ref=${payload.branch || repoInfo.default_branch}`, session.accessToken);
    existingSha = existing.sha;
  } catch {
    existingSha = null;
  }

  await githubApi(`/repos/${payload.repo}/contents/${payload.path}`, session.accessToken, {
    method: 'PUT',
    body: JSON.stringify({
      message: payload.commitMessage || `Publish ${payload.path}`,
      content: encodeBase64Utf8(payload.content),
      branch: payload.branch || repoInfo.default_branch,
      sha: existingSha || undefined
    })
  });

  const pagesActive = await hasPages(payload.repo, session.accessToken);
  const publicUrl = buildPublicUrl(repoInfo.owner.login, repoInfo.name, payload.path, repoInfo.homepage);

  return json({
    ok: true,
    pages_active: pagesActive,
    public_url: publicUrl
  }, origin);
}

async function hasPages(repo, token) {
  try {
    await githubApi(`/repos/${repo}/pages`, token);
    return true;
  } catch {
    return false;
  }
}

function buildPublicUrl(owner, repo, path, homepage) {
  const baseUrl = buildRepoPagesBaseUrl(owner, repo, homepage);
  if (baseUrl) {
    const base = baseUrl.replace(/\/$/, '');
    return `${base}/${path}`.replace(/([^:]\/)\/+/g, '$1');
  }
  return `https://${owner}.github.io/${repo}/${path}`;
}

function buildRepoPagesBaseUrl(owner, repo, homepage) {
  if (homepage) {
    return homepage.replace(/\/$/, '');
  }
  if (!owner || !repo) return '';
  return `https://${owner}.github.io/${repo}`;
}

async function isPublicUrlAccessible(url) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow'
    });
    if (response.ok) return true;
  } catch {
    // fall through to GET fallback
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow'
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function requireSession(request, env) {
  const session = await readSession(request, env);
  if (!session?.accessToken) {
    throw new Error('Not authenticated with GitHub.');
  }
  return session;
}

async function readSession(request, env) {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    return unsealSession(authHeader.slice('Bearer '.length), env.SESSION_SECRET);
  }

  const cookies = parseCookies(request.headers.get('cookie') || '');
  const raw = cookies[env.COOKIE_NAME || 'ppg_session'];
  if (!raw) return null;
  return unsealSession(raw, env.SESSION_SECRET);
}

function buildSessionHash(sessionValue, login) {
  const params = new URLSearchParams({
    gh_session: sessionValue,
    gh_login: login || ''
  });
  return params.toString();
}

async function githubApi(path, token, init = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'privacy-policy-generator-worker',
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub API error (${response.status}): ${text}`);
  }

  return response.json();
}

function workerBaseUrl(request) {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

function publicAppOrigin(env) {
  try {
    return new URL(env.PUBLIC_APP_URL).origin;
  } catch {
    return env.PUBLIC_APP_URL || '*';
  }
}

function json(payload, origin, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...corsHeaders(origin),
      'content-type': 'application/json'
    }
  });
}

function parseCookies(cookieHeader) {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf('=');
        if (index === -1) return [part, ''];
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

function serializeCookie(name, value, options = {}) {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.secure) parts.push('Secure');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.partitioned) parts.push('Partitioned');
  return parts.join('; ');
}

async function sealSession(payload, secret) {
  const key = await importAesKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return `${base64url(iv)}.${base64url(new Uint8Array(cipher))}`;
}

async function unsealSession(value, secret) {
  const [ivPart, cipherPart] = value.split('.');
  if (!ivPart || !cipherPart) throw new Error('Invalid session cookie.');
  const key = await importAesKey(secret);
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64urlToBytes(ivPart) },
    key,
    base64urlToBytes(cipherPart)
  );
  return JSON.parse(new TextDecoder().decode(plain));
}

async function importAesKey(secret) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

function base64url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64urlToBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(String(value));
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
