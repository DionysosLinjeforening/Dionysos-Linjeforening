/**
 * Map plugin texts, Norwegian (nb). This is the BASE: it is always loaded
 * first, and the selected language is layered on top. Loaded at runtime by
 * the plugin loader (ADR-0012); the parity test (tests/i18n.test.mjs) keeps
 * the language files in sync.
 * Visitor keys live under map.*, editor chrome under map.edit.*.
 */
export default {
  lang: 'nb',
  strings: {
    'map.larger': 'Vis større kart',
    'map.mapTitle': 'Kart',
    'map.openOsm': 'Åpne kartet på OpenStreetMap',
    'map.edit.blockLabel': 'Kart',
    'map.edit.cspBlocked': 'Kartet er blokkert av nettstedets CSP.',
    'map.edit.cspFix': 'Legg denne verten i frame-src i _headers, så vises kartet:',
    'map.edit.empty': 'Velg blokken og legg inn en adresse, koordinater eller en OSM-lenke i Egenskaper.',
    'map.edit.height': 'Høyde (piksler)',
    'map.edit.hint1': 'Velg blokken og skriv en adresse (f.eks. «Storgata 1, Oslo»), koordinater («59.913, 10.739») eller lim inn en OSM-lenke i Egenskaper',
    'map.edit.hint2': 'Adressesøket slår opp stedet via OpenStreetMap når du klikker «Søk» (virker på den publiserte siden; koordinater og lenker virker også lokalt)',
    'map.edit.hint3': 'Still zoom (1 er verden, 19 er gatenivå) og høyden på kartet',
    'map.edit.hint4': 'Kartet er OpenStreetMaps egen innbygging: ingen sporing, ingen informasjonskapsler',
    'map.edit.hint5': 'Urds standard _headers tillater kartet. På andre hoster må «frame-src https://www.openstreetmap.org» ligge i _headers (blokken sier fra om det er blokkert)',
    'map.edit.hintTitle': 'Kartblokken',
    'map.edit.location': 'Sted',
    'map.edit.locationPh': 'Adresse, koordinater eller OSM-lenke',
    'map.edit.presetHint': 'Kart med adressen deres (personvennlig OpenStreetMap)',
    'map.edit.presetLabel': 'Finn oss',
    'map.edit.seedTitle': '<h2>Finn oss</h2>',
    'map.edit.zoom': 'Zoom (1 til 19)',
  },
};
