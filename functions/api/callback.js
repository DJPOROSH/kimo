import { cookie } from '../lib/util.js';
export async function onRequest({ env, request }) {
  const u = new URL(request.url), code = u.searchParams.get('code');
  if (!code || u.searchParams.get('state') !== cookie(request, 'st')) return new Response('Login failed', { status: 400 });
  const t = await fetch('https://discord.com/api/v10/oauth2/token', {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env.DISCORD_CLIENT_ID, client_secret: env.DISCORD_CLIENT_SECRET, grant_type: 'authorization_code', code, redirect_uri: env.SITE_URL + '/api/callback' })
  }).then(r => r.json());
  if (!t.access_token) return new Response('Login failed', { status: 400 });
  const me = await fetch('https://discord.com/api/v10/users/@me', { headers: { authorization: 'Bearer ' + t.access_token } }).then(r => r.json());
  const id = crypto.randomUUID() + crypto.randomUUID();
  await env.SETTINGS.put('s:' + id, JSON.stringify({ token: t.access_token, user: me.username, uid: me.id }), { expirationTtl: 604800 });
  return new Response(null, { status: 302, headers: { location: '/dashboard.html', 'set-cookie': `sid=${id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800` } });
}
