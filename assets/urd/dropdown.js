/**
 * Stable plugin API path (see ADR-0013): re-exports the theme-driven dropdown
 * (ADR-0009) from the versioned engine. Never hardcode the versioned path in
 * a plugin.
 */
export * from '../engine/0.7.3/dropdown.js';
