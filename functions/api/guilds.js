import { json, session, guilds } from '../lib/util.js';
export async function onRequestGet({ env, request }) {
  const s = await session(env, request);
  if (!s) return json({ error: 'login' }, 401);
  return json({ user: s.user, guilds: await guilds(env, s) });
}
