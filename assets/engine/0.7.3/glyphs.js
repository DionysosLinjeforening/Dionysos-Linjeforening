/**
 * Shared glyph data: the categories of the glyph/emoji picker and the logic
 * for the recents list. Used both by the admin panel's GlyphPicker and by
 * the glyph menu of the text editor bar (preview-edit.js), so the two always
 * show the same selection and share the recents history (same localStorage
 * key, same origin).
 */

export const GLYPH_RECENT_KEY = 'urd-recent-glyphs';

export const GLYPH_RECENT_MAX = 16;

/** The recents list of the drawn icons (icon ids from icons.js), kept apart from the glyphs. */
export const ICON_RECENT_KEY = 'urd-recent-icons';

/** @type {Array<[string, string]>} Category-name KEY (looked up with ta() by the
 *  consumer; the module sits in the visitor closure and can never call ta() at
 *  module level) + space-separated glyphs. */
export const GLYPH_CATEGORIES = [
  ['glyphCat.symbols', '★ ☆ ✦ ✧ ✩ ✪ ✫ ✭ ✮ ✯ ✵ ✳ ✴ ❖ ❋ ✿ ❀ ❁ ✾ ❃ ☘ ◆ ◇ ● ○ ◎ ■ □ ▣ ▲ △ ▼ ▽ ⬡ ⬢ ♦ ♠ ♣ ♥ ♡ ✓ ✔ ✕ ✖ ✗ ✘ ✚ ✜ ☀ ☾ ♪ ♫ ♬ ☮ ☯ ⚜ ⚓ ⚡ ☂ ✂ ✏ ✒ ✉ ☎ ⌛ ⏳ ♻ ⚠ ☑ ⚙ § © ® ™ ° ± × ÷ ∞ ≈ ≠ ≤ ≥ € £ ¥ • ‣ ⁂'],
  ['glyphCat.arrows', '→ ← ↑ ↓ ↔ ↕ ↗ ↘ ↙ ↖ ⇒ ⇐ ⇑ ⇓ ⇔ ➜ ➤ ➔ ↩ ↪ ⤴ ⤵ ↺ ↻ ⟲ ⟳ « » ‹ ›'],
  ['glyphCat.smileys', '😀 😃 😄 😁 😆 😅 😂 🙂 😉 😊 😇 🥰 😍 🤩 😘 😋 😜 🤪 😎 🥳 😏 😌 😴 🤔 🤗 🤭 🙃 😢 😭 😤 😡 🤯 😱 🥺 😬 🤓 🫠 🫡 🫶'],
  ['glyphCat.people', '👍 👎 👏 🙌 🤝 👋 ✌ 🤘 🤞 💪 🙏 👀 🧠 👶 🧒 🧑 🧓 👥 👤 🗣 🏃 🚶 🧍 💃 🕺 🧑‍🤝‍🧑'],
  ['glyphCat.nature', '🌞 🌝 🌙 ⭐ 🌟 ✨ ☁ 🌈 🔥 💧 🌊 ❄ ⛄ 🌸 🌼 🌻 🌹 🌷 🌱 🌲 🌳 🍀 🍁 🍂 🐝 🦋 🐶 🐱 🐦 🦉 🐟 🐢 🌍 🏔 🏕'],
  ['glyphCat.food', '☕ 🍵 🥤 🍺 🍷 🥂 🍰 🎂 🧁 🍪 🍩 🍕 🌮 🍔 🍟 🥗 🍎 🍊 🍋 🍇 🍓 🫐 🥕 🌽 🍞 🥐 🧀 🍿 🍦 🍫'],
  ['glyphCat.activity', '⚽ 🏀 🏐 🎾 🏓 🏸 ⛷ 🏂 🚴 🏊 🎮 🎲 ♟ 🎯 🎳 🎣 🥾 ⛺ 🎪 🎭 🎨 🎬 🎤 🎧 🎸 🎹 🥁 🎻 📚 ✈ 🚗 🚲 ⛵ 🚀 🏋 🧘'],
  ['glyphCat.objects', '💡 🔔 📣 📢 📌 📍 📅 ⏰ 🔑 🔒 🔓 🛠 🔧 🔨 🧰 📦 📫 📧 📱 💻 🖥 🖨 📷 📸 🎥 📺 🔍 🔎 📎 📏 📐 📝 📄 📋 📁 💾 🧾 💰 💳 🪙 🎁 🎈 🎉 🎊 🏆 🥇 🥈 🥉 🏅 🚩 🏁 🔗 🧭 🗺 🧲 🧪 🔬 🔭 💊 🩺 🛡 🕯 🪧 🖼'],
  ['glyphCat.hearts', '❤ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💗 💓 💕 💖 💘 💝 💞 💟'],
];

/**
 * Puts a chosen glyph at the front of the recents list: no duplicates, capped.
 * Pure function (the list logic is tested without localStorage).
 * @param {string[]} recent
 * @param {string} glyph
 * @returns {string[]}
 */
export function pushRecentGlyph(recent, glyph) {
  const list = Array.isArray(recent) ? recent : [];
  return [glyph, ...list.filter((g) => g !== glyph)].slice(0, GLYPH_RECENT_MAX);
}

const readList = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveList = (key, recent, value) => {
  const next = pushRecentGlyph(recent, value);
  try {
    localStorage.setItem(key, JSON.stringify(next));
  } catch { /* full or unavailable storage must never break editing */ }
  return next;
};

/** Reads the recents list from localStorage; broken content gives an empty list. */
export function readRecentGlyphs() {
  return readList(GLYPH_RECENT_KEY);
}

/** Stores a chosen glyph in the recents list and returns the new list. */
export function saveRecentGlyph(glyph) {
  return saveList(GLYPH_RECENT_KEY, readRecentGlyphs(), glyph);
}

/** Reads the recent icon ids; unavailable storage gives an empty list. */
export function readRecentIcons() {
  return readList(ICON_RECENT_KEY);
}

/** Stores a chosen icon id at the front of the icon recents and returns the new list. */
export function saveRecentIcon(id) {
  return saveList(ICON_RECENT_KEY, readRecentIcons(), id);
}
