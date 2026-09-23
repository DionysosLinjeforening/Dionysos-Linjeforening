/**
 * Stable runtime path (see ADR-0013): i18n.js and plugins.js (which is
 * bundled into admin) load the language pack module dynamically through this,
 * so the same absolute path works from both the engine and the editor bundle
 * regardless of engine version.
 */
export * from '../engine/0.7.3/language-packs.js';
