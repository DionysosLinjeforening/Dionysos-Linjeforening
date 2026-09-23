/**
 * Shared glyph data: the categories of the glyph/emoji picker and the logic
 * for the recents list. Used both by the admin panel's GlyphPicker and by
 * the glyph menu of the text editor bar (preview-edit.js), so the two always
 * show the same selection and share the recents history (same localStorage
 * key, same origin).
 */

export const GLYPH_RECENT_KEY = 'urd-recent-glyphs';

export const GLYPH_RECENT_MAX = 16;

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

/** Reads the recents list from localStorage; broken content gives an empty list. */
export function readRecentGlyphs() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GLYPH_RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Stores a chosen glyph in the recents list and returns the new list. */
export function saveRecentGlyph(glyph) {
  const next = pushRecentGlyph(readRecentGlyphs(), glyph);
  try {
    localStorage.setItem(GLYPH_RECENT_KEY, JSON.stringify(next));
  } catch { /* full or unavailable storage must never break editing */ }
  return next;
}
