# Devmux on Cloudflare Pages

## Files
- public/index.html: public home page (this is what Google indexes)
- public/dashboard.html: dashboard (Discord login, per-server settings)
- public/robots.txt, sitemap.xml, _headers, favicon.svg: SEO and security
- functions/api/*: Discord login, server list, settings save (runs on Cloudflare, secrets stay private)
- functions/api/bot/settings.js: your bot reads saved settings here
- wrangler.toml: project config (KV binding)

## Setup
1. Replace YOURDOMAIN.com in index.html, robots.txt and sitemap.xml. Replace YOUR_CLIENT_ID in index.html (the Add to Discord link).
2. Cloudflare dashboard > Storage & Databases > KV > create a namespace named SETTINGS. Paste its id into wrangler.toml.
3. Deploy (Functions need Git or Wrangler, not plain drag and drop):
   - Push this folder to GitHub, then Workers & Pages > Create > Pages > Connect to Git. Build command: none. Output directory: public.
   - Or run: npx wrangler pages deploy public
4. Pages project > Settings > Bindings: add KV binding named SETTINGS pointing to your namespace.
5. Pages project > Settings > Variables and Secrets (add as secrets):
   - DISCORD_CLIENT_ID
   - DISCORD_CLIENT_SECRET
   - DISCORD_BOT_TOKEN
   - BOT_API_KEY (make up a long random string)
   - SITE_URL (for example https://YOURDOMAIN.com, no trailing slash)
6. Discord Developer Portal > your app > OAuth2 > Redirects: add https://YOURDOMAIN.com/api/callback
7. Pages project > Custom domains > Set up a domain. Follow the DNS steps. HTTPS is automatic.
8. Google Search Console: verify the domain, then submit https://YOURDOMAIN.com/sitemap.xml

## Bot side (Node.js)
Read saved settings before running a command:

    const r = await fetch(`${process.env.SITE_URL}/api/bot/settings?guild=${interaction.guildId}`, {
      headers: { 'x-api-key': process.env.BOT_API_KEY }
    });
    const cfg = await r.json();                       // { cm: [...], welcome: {...}, leave: {...} }
    const c = (cfg.cm || []).find(x => x.n === '/' + interaction.commandName + (sub ? ' ' + sub : ''));
    if (c && !c.e) return interaction.reply({ content: 'This command is turned off.', ephemeral: true });
    // c.p = who can use it, c.cd = cooldown seconds, c.eph = private reply, c.r = custom reply

Cache the result for about 60 seconds per server so you do not call the API on every command.
Welcome and leave: on guildMemberAdd / guildMemberRemove, load cfg.welcome / cfg.leave and send cfg.msg
to the channel cfg.ch if cfg.on is 1. Replace {user}, {server} and {count}.
