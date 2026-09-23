# Plugins

En Urd-plugin er en mappe her med et manifest (`plugin.json`) og en ES-modul
(`index.js`) som eksporterer `register(Urd)`. Plugins bruker de samme
define-API-ene som kjernen (blokker, seksjonspresets, bakgrunner, animasjoner,
maler) og er underlagt samme migreringskontrakt: en plugin-oppdatering kan
aldri knuse eksisterende innhold.

Aktive plugins listes i [`plugins.json`](plugins.json) (statiske hoster kan
ikke liste mapper, derfor en indeksfil). Admin håndterer listen for deg:
Plugins-panelet viser mappene her automatisk (via publiseringslaget, eller
sist kjente liste), og av/på-valget publiseres som en vanlig endring.

## Utvikle en plugin lokalt

1. Start en lokal server fra `template/` (f.eks. `python3 -m http.server`)
   og åpne `http://localhost:8000/admin/`.
2. Legg mappen din her (`plugins/<din-id>/` med `plugin.json` + `index.js`).
3. Aktiver den i Plugins-panelet (skriv mappenavnet hvis panelet ikke kan
   liste mapper lokalt). Forhåndsvisningen laster pluginen fra UTKASTET,
   så du ser blokkene dine live uten å publisere.
4. Manifestfeil, motorversjonskrav og provides-avvik logges i nettleser-
   konsollen og vises i panelet.

Manifestkrav: `requiresEngine` (semver-intervall mot motorversjonen i
urd.json), `provides` (hva pluginen definerer), og valgfritt `csp`
(eksterne opprinnelser pluginen trenger; se ADR-0006 - `_headers` endres
aldri automatisk, admin viser eieren hva som må legges inn). `entry` og
`provides` er valgfrie for rene språkpakker, som ikke har kode (se under).

**Dele pluginen:** legg den i et eget offentlig GitHub-repo og sett
GitHub-topicen `urd-plugin`, så den kan finnes med topic-søk (maler delt
som repo bruker `urd-template`). Brukere installerer ved å kopiere mappen inn
i `plugins/` og aktivere den i Plugins-panelet.

## Flerspråk (ADR-0012)

Sett `"locales": true` i manifestet og legg `locales/{nb,nn,en-GB,se,tr}.js`
i pluginmappen, samme form som motorens locale-filer:

```js
// plugins/<id>/locales/nb.js
export default { lang: 'nb', strings: { '<id>.nokkel': 'Tekst', '<id>.edit.nokkel': 'Panel-tekst' } };
```

- **Nøklene prefikses med plugin-id-en** (`calendar.*`); editor-/config-
  panel-nøkler ligger under `<id>.edit.*`. Én strings-flate per fil.
- **nb er basen**: lasteren legger nb i bunn og valgt språk oppå, så en
  manglende nøkkel faller til bokmål. Paritetstesten (`node --test
  tests/i18n.test.mjs`) finner `locales/`-mappen automatisk og krever
  komplette nøkkelsett i kjernespråkene nb/en-GB/tr, ingen tomme verdier,
  ingen tankestrek og samme `{var}`-tokens; nn/se kan ha etterslep (fylles
  i oversettelsesrunder), men aldri ukjente nøkler.
- **Oppslag**: `import { t, ta } from '/assets/urd/i18n.js'` - `t()` for
  besøkende-tekster (site-språket), `ta()` for editor-chromen (admin-
  språket). `/assets/urd/` er det STABILE plugin-API-et (ADR-0013):
  motoren selv bor i en versjonert mappe (`/assets/engine/<versjon>/`)
  som byttes ved hver Urd-utgivelse - hardkod aldri den versjonerte
  stien i en plugin. Kall dem KUN i render-/fabrikkfunksjoner, aldri på modulnivå
  (modulen kan evalueres før ordboka er lastet); tabeller på modulnivå
  holder nøkkelNAVN, og blokk-/preset-defs bruker de additive feltene
  `labelKey`/`hintKey` (behold `label`/`hint` som fallback).
- **Seed-regelen**: tekst som SKRIVES INN i brukerdata (felt-defaults,
  preset-innhold) oversettes ÉN gang ved innsetting med admin-språket -
  `ta()` inne i `defaults()`/`create()`-kroppen, aldri ved rendering av
  eksisterende data.
- `"names": {"nb": "Kalender", "en-GB": "Calendar", …}` i manifestet gir
  Plugins-panelet og «Fra pluginen …»-tekstene et visningsnavn per
  admin-språk (`name` er fallback).

## Språkpakker: en plugin som KUN er et språk

Trenger du et språk Urd ikke har innebygd, lages det som en plugin uten
kode. `lang-sv` er referansen (svensk for besøkende-siden):

```json
// plugins/lang-sv/plugin.json - ingen entry, ingen provides
{
  "id": "lang-sv",
  "name": "Svensk språkpakke",
  "version": "1.0.0",
  "requiresEngine": ">=0.6.8 <1.0.0",
  "languages": [{ "code": "sv", "name": "Svenska", "site": true, "admin": false }]
}
```

```
plugins/lang-sv/locales/site/sv.js     besøkende-tekstene (t())
plugins/lang-sv/locales/admin/sv.js    admin-chromen (ta())
```

- **Filene har samme form og nøkler som motorens egne** locale-filer:
  kopier motorens `locales/site/nb.js` (28 nøkler) eller
  `.../admin/nb.js` (984 nøkler) og oversett verdiene. Nøklene endres
  aldri.
- **`site` og `admin` er uavhengige.** En pakke kan dekke besøkende-siden,
  admin-chromen eller begge; feltene sier hva du faktisk leverer, og bare
  det som er lovet blir etterspurt.
- **Bokmålsbasen ligger under**, så en delvis pakke virker: nøkler du ikke
  har oversatt vises på bokmål i stedet for å forsvinne. Paritetstesten
  krever derfor ikke fullt sett for pakker, men slår ned på nøkler som
  ikke finnes i basen (skrivefeil som aldri ville vist seg).
- **Innebygde språk kan ikke overstyres** (`nb`, `nn`, `en-GB`, `se`,
  `tr`): en plugin skal ikke kunne kapre bokmål. Vil du forbedre et av
  dem, rediger motorens egen locale-fil (se [CONTRIBUTING.md](../../CONTRIBUTING.md)).
- **Språket blir tilgjengelig når pakken er aktivert** i Plugins-panelet.
  Besøkende-språket (Nettsted-panelet) følger utkastet med én gang;
  admin-språkvelgeren tilbyr pakken etter publisering, siden admin leser
  den publiserte plugin-lista ved oppstart.
- **Datoer, flertall og relativ tid trenger ingen oversettelse**: de går
  via `Intl` med språkkoden din, så lenge nettleseren har CLDR-data for
  den.

**Hjelpechip-regelen (ADR-0008)**: har blokken din spesialfunksjoner
(egne paneler, konvensjoner i innholdet, automatikk), SKAL den ha en
«?»-chip som forklarer dem. Bruk den felles hjelperen, kun i preview:

```js
if (ctx.preview) {
  import('/assets/urd/hint.js').then(({ attachHint }) => {
    attachHint(host, { title: 'Blokken min', lines: ['Funksjon 1 …', 'Funksjon 2 …'] });
  });
}
```

Plugin-blokker og -seksjonsmaler vises automatisk i egne «Plugins»-
seksjoner i «+ Ny blokk», «+ Ny seksjon» og Blokker-panelet. En blokk-def
kan i tillegg ha `variants: [{ label, props }, …]`: da blir den en
foldemeny i blokkmenyene (kalenderen bruker det til visningene sine).

Blokker der innholdet selv bestemmer høyden (autovekst via `urd-grow`,
som kalender/skjema/kart) skal sette `autoGrow: true` på blokk-defen:
da får blokken naturlig høyde i mobilvisningens autostabling i stedet
for den faste desktophøyden, så høyere mobilinnhold aldri klippes.

**Innstillinger i Egenskaper (felt-kontrakten)**: har blokken din enkle
innstillinger (tekst, tall, av/på, valg, sted), deklarer dem som `fields`
på blokk-defen i stedet for å bygge et eget config-panel - admin rendrer
dem rett i Egenskaper-panelet når blokken er markert:

```js
Urd.blocks.define('map', {
  // …
  fields: [
    { key: 'location', type: 'place', labelKey: 'map.edit.location', placeholderKey: 'map.edit.locationPh' },
    { key: 'zoom', type: 'number', labelKey: 'map.edit.zoom', min: 1, max: 19 },
  ],
});
```

Typene er `text`, `number` (`min`/`max`/`step`), `toggle`, `select`
(`options: [{ value, labelKey }]`) og `place` (stedssøk: teksten skrives
til `key`, koordinater til props `lat`/`lon`; se kart-referansen).
Etikettnøklene løses av motoren før de sendes til admin, så bruk
`labelKey` fra pluginens egen ordbok. Uten `fields` viser Egenskaper en
«Innstillinger …»-knapp som åpner pluginens eget config-panel i
forhåndsvisningen (kalenderen og skjemaet viser det mønsteret - riktig
for innstillinger som er mer enn en flat felt-liste, som kildelister).
Kontrakten er beskrevet i [docs/SCHEMA.md](../../docs/SCHEMA.md#plugins).

**Temastyrt UI-regelen (ADR-0009)**: aldri native `<select>` i
redigerings-UI - popupen følger OS-temaet og blir uleselig. Bruk
`createDropdown` fra `/assets/urd/dropdown.js`, eller segmentknapper
for små valgsett.

Se [`calendar/`](calendar/) for referansen: den viser hele formen (manifest
med provides, blokk med versjon og migrering, seksjonspreset, egen CSS via én
style-tag, redigering i preview via urd-edit, og ren logikk i egen modul med
kontraktstester i tests/calendar.test.mjs). Kontrakten er beskrevet i
[docs/SCHEMA.md](../../docs/SCHEMA.md#plugins).

## Kalender-pluginen (referansen)

Kalenderblokken henter arrangementer fra abonnerbare iCal-feeder (Google
Calendar, Nextcloud, Outlook m.fl.) med fire visninger: liste, kort,
månedskalender og «neste arrangement». Kilder settes i forhåndsvisningen
(«⚙ Kilder» på blokken): lim inn en iCal-URL, webcal://-adresse eller en
Google-kalender-id (f.eks. `foreningen@gmail.com`).

Konvensjoner: titler på formen «Kategori: Tittel» gir kategori-chips med
filter, og en påmeldingslenke i beskrivelsen (en linje med «Påmelding:»)
blir en «Meld deg på»-knapp. «Abonner»-knappen gir webcal-lenke, og for
Google-kilder også «Legg til i Google».

Henting går via sidens egen feed-proxy (`/api/ics`), så pluginen trenger
ingen CSP-unntak. Proxyen godtar `calendar.google.com` og verter eieren
lister i miljøvariabelen `ICS_HOSTS` (kommaseparert) i hostingoppsettet.
Lokalt uten functions vises eksempeldata i forhåndsvisningen.

## Skjema-pluginen (referanse: e-post og CSP-degradering)

Skjemablokken er et kontaktskjema. Standard sendemåte er `mailto`: ved
innsending åpnes besøkendes e-postklient med en ferdig e-post (ingen
oppsett, ingen CSP). Valgfritt kan skjemaet sende til et eksternt
endepunkt (eierens Apps Script eller Pages Function) via `fetch` med
JSON, som krever at eieren åpner `connect-src` for endepunktets vert i
`_headers`. Feltene er redigerbare (navn, type, påkrevd), e-postfelt
valideres, og et skjult honeypot-felt stopper bots. Kontaktskjema-preset
følger med. Viser mønsteret: ekte skjemarendering, besøkende-input som
aldri blir HTML, og rolig degradering når endepunktet er blokkert.

## Kart-pluginen (referanse: CSP-opt-in for embed)

Kartblokken bygger inn OpenStreetMaps egen iframe (personvennlig: ingen
sporing, ingen tredjeparts-tiles). Eieren limer inn koordinater eller en
OSM-lenke. Fordi en iframe mot `openstreetmap.org` krever et
`frame-src`-unntak, DEKLARERER manifestet behovet i `csp`-feltet
(ADR-0006): Plugins-panelet viser eieren den nøyaktige `_headers`-linjen,
og blir kartet blokkert forklarer blokken selv hvilken linje som mangler.
Finn oss-preset følger med.
