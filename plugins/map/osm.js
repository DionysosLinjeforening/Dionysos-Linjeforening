/**
 * Pure OSM logic for the map plugin (no DOM): reading a position the owner
 * pastes in (coordinates or an OpenStreetMap link), building the embed URL
 * and the larger-map link. Everything here is unit-tested in node.
 *
 * Privacy: the map is embedded as a plain OSM iframe (no tracking, no
 * third-party tiles), so the owner only has to open frame-src for openstreetmap.org.
 */

const clampLat = (n) => Math.max(-85, Math.min(85, n));
const clampLon = (n) => Math.max(-180, Math.min(180, n));
const clampZoom = (n) => Math.max(1, Math.min(19, Math.round(n)));

/**
 * Reads the position the owner types in:
 *   - "59.913, 10.739" (latitude, longitude)
 *   - an OSM link: .../#map=15/59.913/10.739  or  ...?mlat=59.913&mlon=10.739
 * @param {string} input
 * @returns {{ lat: number, lon: number, zoom: number|null }|null}
 */
export function parseLocation(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  // The zoom comes from #map=zoom/lat/lon when the link carries it.
  const mapHash = /#map=(\d+)\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/.exec(raw);
  const zoom = mapHash ? clampZoom(+mapHash[1]) : null;

  // The point: the marker (mlat/mlon) is preferred, otherwise the #map centre.
  const mlat = /[?&]mlat=(-?\d+(?:\.\d+)?)/.exec(raw);
  const mlon = /[?&]mlon=(-?\d+(?:\.\d+)?)/.exec(raw);
  if (mlat && mlon) {
    return { lat: clampLat(+mlat[1]), lon: clampLon(+mlon[1]), zoom };
  }
  if (mapHash) {
    return { lat: clampLat(+mapHash[2]), lon: clampLon(+mapHash[3]), zoom };
  }
  // Bare coordinates, "lat, lon" (separated by comma or space)
  const pair = /^(-?\d+(?:\.\d+)?)\s*[,\s]\s*(-?\d+(?:\.\d+)?)$/.exec(raw);
  if (pair) {
    return { lat: clampLat(+pair[1]), lon: clampLon(+pair[2]), zoom: null };
  }
  return null;
}

/** A rough degree span around the centre, derived from the zoom (for the iframe bbox). */
function span(zoom) {
  // Doubles for every zoom level down; the value is chosen so a typical city level (15) covers a couple of blocks.
  return 360 / 2 ** clampZoom(zoom);
}

/**
 * Embed URL for OpenStreetMap's official iframe (export/embed.html).
 * Builds a bbox around the centre and puts a marker at the point.
 * @param {{ lat: number, lon: number, zoom?: number }} loc
 * @returns {string}
 */
export function buildEmbedUrl({ lat, lon, zoom = 15 }) {
  const la = clampLat(lat);
  const lo = clampLon(lon);
  const d = span(zoom);
  // Latitude compresses towards the poles; adjust the bbox height by cos(lat).
  const latPad = d * Math.max(0.2, Math.cos((la * Math.PI) / 180));
  const bbox = [clampLon(lo - d), clampLat(la - latPad), clampLon(lo + d), clampLat(la + latPad)];
  const params = new URLSearchParams({
    bbox: bbox.map((n) => n.toFixed(5)).join(','),
    layer: 'mapnik',
    marker: `${la.toFixed(5)},${lo.toFixed(5)}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

/** The "view larger map" link to openstreetmap.org for the point. */
export function buildLargerMapUrl({ lat, lon, zoom = 15 }) {
  const la = clampLat(lat).toFixed(5);
  const lo = clampLon(lon).toFixed(5);
  return `https://www.openstreetmap.org/?mlat=${la}&mlon=${lo}#map=${clampZoom(zoom)}/${la}/${lo}`;
}

/** The host the map plugin needs in frame-src (for the CSP instruction). */
export const OSM_HOST = 'https://www.openstreetmap.org';
