/**
 * Stable plugin API path (see ADR-0013): re-exports the help chip from the
 * versioned engine. Never hardcode the versioned path in a plugin.
 */
export * from '../engine/0.7.2/hint.js';
