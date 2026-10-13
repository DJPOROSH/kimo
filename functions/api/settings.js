import { json, session, guilds } from '../lib/util.js';
const PERMS = ['Everyone', 'Manage Server', 'Administrator', 'Bot owner'];
const str = (v, n) => String(v || '').slice(0, n);
const msg = o => ({ on: o && o.on ? 1 : 0, ch: str(o && o.ch, 60), msg: str(o && o.msg, 1000) });

// The user must be logged in, must manage the server, and the bot must be in it.
async function guard(env, request, id) {
  if (!/^\d+$/.test(id || '')) return json({ error: 'bad request' }, 400);
  const s = await session(env, request);
  if (!s) return json({ error: 'login' }, 401);
  const g = (await guilds(env, s)).find(x => x.id === id && x.p && x.bot);
  return g ? null : json({ error: 'forbidden' }, 403);
}

export async function onRequestGet({ env, request }) {
  const id = new URL(request.url).searchParams.get('guild');
  const e = await guard(env, request, id);
  return e || json(await env.SETTINGS.get('g:' + id, 'json') || {});
}

export async function onRequestPost({ env, request }) {
  const id = new URL(request.url).searchParams.get('guild');
  const e = await guard(env, request, id);
  if (e) return e;
  const b = await request.json().catch(() => ({}));
  const out = {
    cm: (Array.isArray(b.cm) ? b.cm : []).slice(0, 40).map(c => ({ n: str(c.n, 40), e: c.e ? 1 : 0, p: PERMS.includes(c.p) ? c.p : 'Manage Server', cd: Math.min(60, Math.max(0, +c.cd || 0)), eph: c.eph ? 1 : 0, r: str(c.r, 1500) })),
    welcome: msg(b.welcome), leave: msg(b.leave)
  };
  await env.SETTINGS.put('g:' + id, JSON.stringify(out));
  return json({ ok: 1 });
}
