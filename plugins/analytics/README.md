# Analyse (referanseplugin)

Personvennlig besøksmåling via [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/): ingen cookies, ingen fingerprinting, gratis, og ingen samtykkebanner nødvendig. Kjernen i Urd er sporingsfri; denne pluginen er et valgfritt tillegg eieren selv slår på.

## Oppsett

1. Opprett et nettsted under **Web Analytics** i Cloudflare-dashbordet og kopier token-verdien fra målesnutten (`"token": "..."`).
2. Lim verdien inn i `config.token` i `plugins/analytics/plugin.json` (rediger fila i repoet; publisering skriver aldri plugin-filer).
3. Legg CSP-vertene i `_headers` (Plugins-panelet i admin viser de nøyaktige linjene når pluginen er aktiv):
   - `script-src`: `https://static.cloudflareinsights.com`
   - `connect-src`: `https://cloudflareinsights.com`
4. Aktiver pluginen i Plugins-panelet og publiser.

Uten token gjør pluginen ingenting, og i editorens forhåndsvisning måles aldri noe.

## Bytte leverandør

Mønsteret er det samme for andre personvennlige leverandører (f.eks. Plausible): bytt script-adressen og attributtene i `index.js`, og deklarer de nye vertene i manifestets `csp`-felt. Verten legges alltid manuelt i `_headers` (ADR-0006).
