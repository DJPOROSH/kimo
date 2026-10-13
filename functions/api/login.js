export function onRequest({ env }) {
  const state = crypto.randomUUID();
  const u = new URL('https://discord.com/oauth2/authorize');
  u.search = new URLSearchParams({ client_id: env.DISCORD_CLIENT_ID, redirect_uri: env.SITE_URL + '/api/callback', response_type: 'code', scope: 'identify guilds', state }).toString();
  return new Response(null, { status: 302, headers: { location: u.toString(), 'set-cookie': `st=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600` } });
}
