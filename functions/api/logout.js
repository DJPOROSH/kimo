import { cookie } from '../lib/util.js';
export async function onRequest({ env, request }) {
  const id = cookie(request, 'sid');
  if (id) await env.SETTINGS.delete('s:' + id);
  return new Response(null, { status: 302, headers: { location: '/dashboard.html', 'set-cookie': 'sid=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0' } });
}
