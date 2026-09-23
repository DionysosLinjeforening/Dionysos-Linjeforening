/**
 * The icon library: drawn SVG icons (social media, communication, symbols,
 * arrows) that the icon block can show instead of a glyph.
 * The icons are hand-drawn paths on a 24x24 grid, colored with currentColor
 * and scale crisply at every size (unlike emoji, which have fixed colors and
 * vary between platforms).
 *
 * The ids are data contract (stored in props.icon) and are therefore English;
 * the labels are looked up via labelKey (icon.*) with an English fallback
 * (ADR-0021). An unknown id must never topple anything: iconSvg returns null,
 * and the icon block falls back to the glyph.
 */

/** Icons are stroked by default; a few brand marks are filled shapes. */
const STROKE = 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"';
const FILL = 'fill="currentColor" stroke="none"';

/** @type {Record<string, {label: string, body: string, fill?: boolean}>} */
export const ICON_LIBRARY = {
  facebook: { label: 'Facebook', labelKey: 'icon.facebook', body: '<path d="M15.5 4H13a3.5 3.5 0 0 0-3.5 3.5V10H7v3.2h2.5V20h3.2v-6.8h2.5l.55-3.2h-3.05V7.8c0-.5.4-.8.9-.8h1.9z"/>' },
  instagram: { label: 'Instagram', labelKey: 'icon.instagram', body: '<rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="16.9" cy="7.1" r="1.1" fill="currentColor" stroke="none"/>' },
  x: { label: 'X (Twitter)', labelKey: 'icon.x', body: '<path d="M5 4h3.8l4 5.4L17.4 4h2.4l-5.9 6.9L20.5 20h-3.8l-4.3-5.8L7.4 20H5l6.3-7.4z"/>', fill: true },
  linkedin: { label: 'LinkedIn', labelKey: 'icon.linkedin', body: '<circle cx="4.8" cy="4.8" r="1.7"/><path d="M3.3 9.2h3v11h-3z"/><path d="M9.7 20.2v-11h3v1.6a3.9 3.9 0 0 1 3.3-1.8c2.6 0 4.4 1.8 4.4 4.9v6.3h-3.1v-5.7c0-1.6-.7-2.6-2-2.6-1.4 0-2.5 1-2.5 2.7v5.6z"/>' },
  youtube: { label: 'YouTube', labelKey: 'icon.youtube', body: '<rect x="2.8" y="5.7" width="18.4" height="12.6" rx="3.6"/><path d="M10.2 9.3l5 2.7-5 2.7z" fill="currentColor" stroke="none"/>' },
  tiktok: { label: 'TikTok', labelKey: 'icon.tiktok', body: '<path d="M13.8 5v9.3a3.9 3.9 0 1 1-3.9-3.9"/><path d="M13.8 5c.5 2.9 2.6 4.8 5.6 5v3.1c-2.1-.1-4-.8-5.6-2"/>' },
  whatsapp: { label: 'WhatsApp', labelKey: 'icon.whatsapp', body: '<path d="M12 3.5a8.5 8.5 0 0 0-7.3 12.8L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5z"/><path d="M9.2 8.4l1 2-.8 1a7.3 7.3 0 0 0 3.2 3.2l1-.8 2 1c-.3 1.3-1.2 1.9-2.4 1.7-2.9-.5-5.2-2.8-5.7-5.7-.2-1.2.4-2.1 1.7-2.4z"/>' },
  snapchat: { label: 'Snapchat', labelKey: 'icon.snapchat', body: '<path d="M12 3.2c-2.9 0-4.9 2.1-4.9 5v2.1c-.8.3-1.7.3-2.5.1.3 1 1.1 1.8 2.2 2-.4 1.4-1.5 2.5-3 2.8 1 1.2 2.6 1.9 4.3 1.8.9 1.2 2.3 1.9 3.9 1.9s3-.7 3.9-1.9c1.7.1 3.3-.6 4.3-1.8-1.5-.3-2.6-1.4-3-2.8 1.1-.2 1.9-1 2.2-2-.8.2-1.7.2-2.5-.1V8.2c0-2.9-2-5-4.9-5z"/>' },
  pinterest: { label: 'Pinterest', labelKey: 'icon.pinterest', body: '<path d="M9.2 20.5c.4-1.6 1.4-5.6 1.9-7.6"/><path d="M10.4 14.2c.4.9 1.4 1.5 2.6 1.5 2.6 0 4.4-2.2 4.4-5a5.4 5.4 0 1 0-10.4 2.1"/>' },
  spotify: { label: 'Spotify', labelKey: 'icon.spotify', body: '<circle cx="12" cy="12" r="8.8"/><path d="M7.6 9.6c3-.9 6.6-.6 9.1.9"/><path d="M8 12.5c2.5-.7 5.4-.4 7.5.8"/><path d="M8.5 15.2c2-.5 4.2-.3 5.9.7"/>' },
  discord: { label: 'Discord', labelKey: 'icon.discord', body: '<path d="M8 3.9c-1.6.3-3.1.9-4.5 1.7-1.5 3.2-2.1 6.6-1.7 10a12.7 12.7 0 0 0 5 2.6l1-1.9a11 11 0 0 0 8.4 0l1 1.9a12.7 12.7 0 0 0 5-2.6c.4-3.4-.2-6.8-1.7-10A14 14 0 0 0 16 3.9l-.6 1.4a15 15 0 0 0-6.8 0z"/><circle cx="9.3" cy="11.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="14.7" cy="11.5" r="1.2" fill="currentColor" stroke="none"/>' },
  github: { label: 'GitHub', labelKey: 'icon.github', body: '<path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.9c.5.1.6-.2.6-.4v-1.7c-2.6.6-3.1-1.1-3.1-1.1-.4-1.1-1-1.4-1-1.4-.9-.6 0-.6 0-.6.9.1 1.4 1 1.4 1 .8 1.4 2.2 1 2.7.8.1-.6.3-1 .6-1.3-2-.2-4.2-1-4.2-4.5 0-1 .4-1.8 1-2.5-.1-.2-.4-1.2.1-2.4 0 0 .8-.3 2.5.9a8.8 8.8 0 0 1 4.6 0c1.7-1.2 2.5-.9 2.5-.9.5 1.2.2 2.2.1 2.4.6.7 1 1.5 1 2.5 0 3.5-2.2 4.3-4.2 4.5.3.3.6.9.6 1.8v2.6c0 .2.1.5.6.4A9.2 9.2 0 0 0 12 2.8z"/>', fill: true },

  mail: { label: 'Email', labelKey: 'icon.mail', body: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>' },
  phone: { label: 'Phone', labelKey: 'icon.phone', body: '<path d="M21.2 16.9v2.6a1.8 1.8 0 0 1-2 1.8 18 18 0 0 1-7.8-2.8 17.7 17.7 0 0 1-5.4-5.4A18 18 0 0 1 3.2 5.2a1.8 1.8 0 0 1 1.8-2h2.6a1.8 1.8 0 0 1 1.8 1.5c.1.9.3 1.7.6 2.5a1.8 1.8 0 0 1-.4 1.9l-1.1 1.1a14.4 14.4 0 0 0 5.4 5.4l1.1-1.1a1.8 1.8 0 0 1 1.9-.4c.8.3 1.6.5 2.5.6a1.8 1.8 0 0 1 1.5 1.8z"/>' },
  smartphone: { label: 'Mobile', labelKey: 'icon.smartphone', body: '<rect x="7" y="2.8" width="10" height="18.4" rx="2.5"/><line x1="10.8" y1="18.2" x2="13.2" y2="18.2"/>' },
  chat: { label: 'Speech bubble', labelKey: 'icon.chat', body: '<path d="M20.8 12a8.5 8.5 0 0 1-12.4 7.5L4 20.6l1.1-4.2A8.5 8.5 0 1 1 20.8 12z"/>' },
  send: { label: 'Send', labelKey: 'icon.send', body: '<path d="M21 3.5L10.4 14.1"/><path d="M21 3.5l-6.8 17-3.8-6.4L4 10.3z"/>' },
  globe: { label: 'Website', labelKey: 'icon.globe', body: '<circle cx="12" cy="12" r="8.8"/><path d="M3.2 12h17.6"/><path d="M12 3.2c2.4 2.4 3.6 5.4 3.6 8.8s-1.2 6.4-3.6 8.8c-2.4-2.4-3.6-5.4-3.6-8.8S9.6 5.6 12 3.2z"/>' },
  rss: { label: 'RSS feed', labelKey: 'icon.rss', body: '<path d="M4.5 11a8.5 8.5 0 0 1 8.5 8.5"/><path d="M4.5 5.5a14 14 0 0 1 14 14"/><circle cx="5.5" cy="18.5" r="1.3" fill="currentColor" stroke="none"/>' },

  'map-pin': { label: 'Map pin', labelKey: 'icon.map-pin', body: '<path d="M12 21.5s7-6.2 7-11.3A7 7 0 1 0 5 10.2c0 5.1 7 11.3 7 11.3z"/><circle cx="12" cy="10" r="2.6"/>' },
  map: { label: 'Map', labelKey: 'icon.map', body: '<path d="M9 4L3.5 6v14L9 18l6 2 5.5-2V4L15 6z"/><path d="M9 4v14"/><path d="M15 6v14"/>' },
  home: { label: 'Home', labelKey: 'icon.home', body: '<path d="M4 10.5l8-7 8 7V20a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20z"/><path d="M9.5 21.5V14h5v7.5"/>' },
  clock: { label: 'Clock', labelKey: 'icon.clock', body: '<circle cx="12" cy="12" r="8.8"/><path d="M12 7v5l3.2 2"/>' },
  calendar: { label: 'Calendar', labelKey: 'icon.calendar', body: '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17"/><path d="M8 2.8V7"/><path d="M16 2.8V7"/>' },

  heart: { label: 'Heart', labelKey: 'icon.heart', body: '<path d="M12 20.5S3.5 15.4 3.5 9.5A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8.5 2.5c0 5.9-8.5 11-8.5 11z"/>' },
  star: { label: 'Star', labelKey: 'icon.star', body: '<path d="M12 3.5l2.7 5.4 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.8l6-.9z"/>' },
  check: { label: 'Check', labelKey: 'icon.check', body: '<path d="M4.5 12.8L9.5 18 19.5 6.5"/>' },
  cross: { label: 'Cross', labelKey: 'icon.cross', body: '<path d="M6 6l12 12"/><path d="M18 6L6 18"/>' },
  plus: { label: 'Plus', labelKey: 'icon.plus', body: '<path d="M12 5v14"/><path d="M5 12h14"/>' },
  info: { label: 'Info', labelKey: 'icon.info', body: '<circle cx="12" cy="12" r="8.8"/><path d="M12 11v5.5"/><line x1="12" y1="7.8" x2="12" y2="7.8"/>' },
  question: { label: 'Question', labelKey: 'icon.question', body: '<circle cx="12" cy="12" r="8.8"/><path d="M9.4 9.2A2.7 2.7 0 0 1 12 7.4c1.5 0 2.7 1 2.7 2.4 0 1.8-2.7 2-2.7 4"/><line x1="12" y1="16.8" x2="12" y2="16.8"/>' },
  warning: { label: 'Warning', labelKey: 'icon.warning', body: '<path d="M12 4L2.8 19.5h18.4z"/><path d="M12 10v4"/><line x1="12" y1="16.8" x2="12" y2="16.8"/>' },
  zap: { label: 'Lightning', labelKey: 'icon.zap', body: '<path d="M13 2.8L4.5 13.5H11l-1 7.7 8.5-10.7H12z"/>' },
  sun: { label: 'Sun', labelKey: 'icon.sun', body: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/>' },
  moon: { label: 'Moon', labelKey: 'icon.moon', body: '<path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11z"/>' },
  leaf: { label: 'Leaf', labelKey: 'icon.leaf', body: '<path d="M5 19C5 9 11 4.5 20 4.5c0 9-4.5 15-13 14.5z"/><path d="M5 19c2-5.5 5.5-9 10-11"/>' },
  music: { label: 'Music', labelKey: 'icon.music', body: '<circle cx="7" cy="17.5" r="2.8"/><circle cx="17" cy="15.5" r="2.8"/><path d="M9.8 17.5V6.5l10-2v11"/>' },
  camera: { label: 'Camera', labelKey: 'icon.camera', body: '<path d="M3.5 8.5A1.5 1.5 0 0 1 5 7h2.5l1.7-2.3h5.6L16.5 7H19a1.5 1.5 0 0 1 1.5 1.5V18a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z"/><circle cx="12" cy="13" r="3.4"/>' },
  image: { label: 'Image', labelKey: 'icon.image', body: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="8.8" cy="9.3" r="1.6"/><path d="M20.5 15.5l-4.7-4.7-9.3 8.7"/>' },
  document: { label: 'Document', labelKey: 'icon.document', body: '<path d="M13.5 3H6.8A1.8 1.8 0 0 0 5 4.8v14.4A1.8 1.8 0 0 0 6.8 21h10.4a1.8 1.8 0 0 0 1.8-1.8V8.5z"/><path d="M13.5 3v5.5H19"/><path d="M8.5 13h7M8.5 16.5h7"/>' },
  'shopping-bag': { label: 'Shopping bag', labelKey: 'icon.shopping-bag', body: '<path d="M5.5 8h13l-1 12a1.8 1.8 0 0 1-1.8 1.5H8.3A1.8 1.8 0 0 1 6.5 20z"/><path d="M8.8 10.5V7a3.2 3.2 0 0 1 6.4 0v3.5"/>' },
  cart: { label: 'Cart', labelKey: 'icon.cart', body: '<circle cx="9.3" cy="19.3" r="1.5"/><circle cx="17.3" cy="19.3" r="1.5"/><path d="M3 4.5h2.4l2.3 10.6a1.8 1.8 0 0 0 1.8 1.4h7.6a1.8 1.8 0 0 0 1.8-1.4L20.8 8H6.1"/>' },
  gift: { label: 'Gift', labelKey: 'icon.gift', body: '<rect x="3.5" y="8" width="17" height="4"/><path d="M5 12v8.5h14V12"/><path d="M12 8v12.5"/><path d="M12 8s-4.5.3-5.5-1.8C5.8 4.7 7.8 3.3 9.3 4.4 10.8 5.5 12 8 12 8z"/><path d="M12 8s4.5.3 5.5-1.8c.7-1.5-1.3-2.9-2.8-1.8C13.2 5.5 12 8 12 8z"/>' },
  wrench: { label: 'Wrench', labelKey: 'icon.wrench', body: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z"/>' },
  lock: { label: 'Lock', labelKey: 'icon.lock', body: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>' },
  search: { label: 'Search', labelKey: 'icon.search', body: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="M15.8 15.8L21 21"/>' },
  user: { label: 'Person', labelKey: 'icon.user', body: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>' },
  users: { label: 'People', labelKey: 'icon.users', body: '<circle cx="9" cy="8.5" r="3.5"/><path d="M2.8 20a6.2 6.2 0 0 1 12.4 0"/><path d="M16 5.4a3.5 3.5 0 0 1 0 6.2"/><path d="M17.8 14.6a6.2 6.2 0 0 1 3.4 5.4"/>' },
  'thumbs-up': { label: 'Thumbs up', labelKey: 'icon.thumbs-up', body: '<path d="M3.5 10.5H7v10H3.5z"/><path d="M7 19.5V11l4.2-5.6a1.7 1.7 0 0 1 3 1.4l-.9 3.7h4.8a2 2 0 0 1 2 2.4l-1.2 5.5a2 2 0 0 1-2 1.6H8.6"/>' },

  'arrow-right': { label: 'Arrow right', labelKey: 'icon.arrow-right', body: '<path d="M4 12h16"/><path d="M13.5 5.5L20 12l-6.5 6.5"/>' },
  'arrow-left': { label: 'Arrow left', labelKey: 'icon.arrow-left', body: '<path d="M20 12H4"/><path d="M10.5 5.5L4 12l6.5 6.5"/>' },
  'arrow-up': { label: 'Arrow up', labelKey: 'icon.arrow-up', body: '<path d="M12 20V4"/><path d="M5.5 10.5L12 4l6.5 6.5"/>' },
  'arrow-down': { label: 'Arrow down', labelKey: 'icon.arrow-down', body: '<path d="M12 4v16"/><path d="M5.5 13.5L12 20l6.5-6.5"/>' },
  'external-link': { label: 'External link', labelKey: 'icon.external-link', body: '<path d="M9.5 5H5.8A1.8 1.8 0 0 0 4 6.8v11.4A1.8 1.8 0 0 0 5.8 20h11.4a1.8 1.8 0 0 0 1.8-1.8v-3.7"/><path d="M13.5 4H20v6.5"/><path d="M20 4l-9 9"/>' },
  download: { label: 'Download', labelKey: 'icon.download', body: '<path d="M12 3.5v11"/><path d="M6.5 9l5.5 5.5L17.5 9"/><path d="M4 20.5h16"/>' },
  share: { label: 'Share', labelKey: 'icon.share', body: '<circle cx="6" cy="12" r="2.6"/><circle cx="17.5" cy="5.5" r="2.6"/><circle cx="17.5" cy="18.5" r="2.6"/><path d="M8.4 10.8l6.8-4M8.4 13.2l6.8 4"/>' },
};

/** @type {Array<[string, string[]]>} Category names plus icon ids, in display order. */
/* The category names are KEYS (looked up with ta() by the consumer; the module
   sits in the visitor closure and can never call ta() at module level). The
   ICON_LIBRARY labels are brand names used in visitor aria-labels and are never
   translated. */
export const ICON_CATEGORIES = [
  ['iconCat.social', ['facebook', 'instagram', 'x', 'linkedin', 'youtube', 'tiktok', 'whatsapp', 'snapchat', 'pinterest', 'spotify', 'discord', 'github']],
  ['iconCat.communication', ['mail', 'phone', 'smartphone', 'chat', 'send', 'globe', 'rss']],
  ['iconCat.placeTime', ['map-pin', 'map', 'home', 'clock', 'calendar']],
  ['iconCat.symbols', ['heart', 'star', 'check', 'cross', 'plus', 'info', 'question', 'warning', 'zap', 'sun', 'moon', 'leaf', 'music', 'camera', 'image', 'document', 'shopping-bag', 'cart', 'gift', 'wrench', 'lock', 'search', 'user', 'users', 'thumbs-up']],
  ['iconCat.arrows', ['arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'external-link', 'download', 'share']],
];

/**
 * Builds the complete SVG string for an icon, or null for an unknown id.
 * The size is set by the parent (width/height 100 %); the color is inherited
 * via currentColor.
 * @param {string} id
 * @returns {string|null}
 */
export function iconSvg(id) {
  const icon = typeof id === 'string' ? ICON_LIBRARY[id] : null;
  if (!icon) return null;
  const paint = icon.fill ? FILL : STROKE;
  return `<svg viewBox="0 0 24 24" width="100%" height="100%" ${paint} aria-hidden="true" focusable="false">${icon.body}</svg>`;
}
