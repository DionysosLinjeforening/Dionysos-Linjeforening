/**
 * Stable plugin API path (see ADR-0013): /assets/urd/ is the contract plugins
 * import against, and is never touched by engine versioning. The engine
 * itself lives in the versioned (and immutably cached) folder
 * /assets/engine/<version>/; this shell re-exports from there and is updated
 * at each phase release. Never hardcode the versioned path in a plugin.
 */
export * from '../engine/0.7.3/i18n.js';
