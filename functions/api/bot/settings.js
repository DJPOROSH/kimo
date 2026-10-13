import { json } from '../../lib/util.js';
// Only your bot calls this, with the x-api-key header.
export async function onRequestGet({ env, request }) {
  if (request.headers.get('x-api-key') !== env.BOT_API_KEY) return json({ error: 'no' }, 401);
  const id = new URL(request.url).searchParams.get('guild');
  return json(await env.SETTINGS.get('g:' + id, 'json') || {});
}
