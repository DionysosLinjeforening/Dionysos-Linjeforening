/**
 * Map plugin texts, Norwegian Nynorsk (nn). Layered on top of the nb base
 * (nb.js); the parity test keeps the key sets in sync.
 */
export default {
  lang: 'nn',
  strings: {
    'map.larger': 'Vis større kart',
    'map.mapTitle': 'Kart',
    'map.openOsm': 'Opne kartet på OpenStreetMap',
    'map.edit.blockLabel': 'Kart',
    'map.edit.cspBlocked': 'Kartet er blokkert av CSP-en til nettstaden.',
    'map.edit.cspFix': 'Legg denne verten i frame-src i _headers, så blir kartet vist:',
    'map.edit.empty': 'Vel blokka og opne «Innstillingar …» i Eigenskapar for å leggje inn ei adresse, koordinatar eller ei OSM-lenkje.',
    'map.edit.height': 'Høgd (pikslar)',
    'map.edit.hint1': 'Vel blokka og opne «Innstillingar …» i Eigenskapar, og skriv ei adresse (t.d. «Storgata 1, Oslo»), koordinatar («59.913, 10.739») eller lim inn ei OSM-lenkje',
    'map.edit.hint2': 'Adressesøket slår opp staden via OpenStreetMap når du klikkar «Bruk» (verkar på den publiserte sida; koordinatar og lenkjer verkar også lokalt)',
    'map.edit.hint3': 'Still zoom (1 er verda, 19 er gatenivå) og høgda på kartet',
    'map.edit.hint4': 'Kartet er OpenStreetMaps eiga innbygging: inga sporing, ingen informasjonskapslar',
    'map.edit.hint5': 'Urds standard _headers tillèt kartet. På andre hostar må «frame-src https://www.openstreetmap.org» liggje i _headers (blokka seier frå om det er blokkert)',
    'map.edit.hintTitle': 'Kartblokka',
    'map.edit.location': 'Stad',
    'map.edit.locationPh': 'Adresse, koordinatar eller OSM-lenkje',
    'map.edit.presetHint': 'Kart med adressa dykkar (personvennleg OpenStreetMap)',
    'map.edit.presetLabel': 'Finn oss',
    'map.edit.seedTitle': '<h2>Finn oss</h2>',
    'map.edit.zoom': 'Zoom (1 til 19)',
  },
};
