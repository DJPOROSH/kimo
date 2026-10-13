export const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { 'content-type': 'application/json' } });
export const cookie = (r, n) => (r.headers.get('cookie') || '').split('; ').find(c => c.startsWith(n + '='))?.split('=')[1];

export async function session(env, request) {
  const id = cookie(request, 'sid');
  if (!id) return null;
  const s = await env.SETTINGS.get('s:' + id, 'json');
  return s ? { id, ...s } : null;
}

// All servers of the logged-in user. p = permission label, null if the user cannot manage the server.
export async function guilds(env, s) {
  const api = 'https://discord.com/api/v10/users/@me/guilds';
  const [ug, bg] = await Promise.all([
    fetch(api + '?with_counts=true', { headers: { authorization: 'Bearer ' + s.token } }).then(r => r.json()),
    fetch(api + '?limit=200', { headers: { authorization: 'Bot ' + env.DISCORD_BOT_TOKEN } }).then(r => r.json())
  ]);
  const bot = new Set(Array.isArray(bg) ? bg.map(g => g.id) : []);
  return (Array.isArray(ug) ? ug : []).map(g => {
    const perms = BigInt(g.permissions);
    const p = g.owner ? 'Owner' : (perms & 0x8n) ? 'Administrator' : (perms & 0x20n) ? 'Manage Server' : null;
    return { id: g.id, n: g.name, m: (g.approximate_member_count || 0).toLocaleString('en'), p, bot: bot.has(g.id) ? 1 : 0 };
  });
}
