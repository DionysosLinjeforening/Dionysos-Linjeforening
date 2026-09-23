/**
 * Pure planning for the updater (ADR-0014): tree listings in, change set out.
 * No network and no side effects, so the logic can be unit-tested exhaustively
 * in tests/update-plan.test.mjs.
 *
 * The checksum model: git blob SHAs are compared between the user's tree, the
 * template repo's tree at the BASELINE (the tag v<engine> for the version the
 * user has) and the template repo's tree at the TARGET VERSION. Equal SHA means
 * identical content, so "hand-edited" can be decided without downloading a
 * single file.
 */
import { isUserPath, isPageIndexCopy } from './guard.js';

/** The highest three-part version tag (vX.Y.Z) in a list of tag names, or null. */
export function highestVersionTag(names) {
  let best = null;
  let bestParts = null;
  for (const name of names ?? []) {
    const m = /^v(\d+)\.(\d+)\.(\d+)$/.exec(name);
    if (!m) continue;
    const parts = [Number(m[1]), Number(m[2]), Number(m[3])];
    const cmp = bestParts
      ? parts[0] - bestParts[0] || parts[1] - bestParts[1] || parts[2] - bestParts[2]
      : 1;
    if (cmp > 0) {
      best = name;
      bestParts = parts;
    }
  }
  return best;
}

/**
 * The engine atom group (ADR-0014): files that MUST be swapped together, or the
 * site is orphaned. The HTML shells point at the versioned engine folder, the
 * admin bundle bundles engine modules, the shells in assets/urd/ point into the
 * version, base.css is referenced with a content stamp from the shells, and
 * urd.json.engine IS the folder-name invariant. The slug copies belong here too
 * (the copy refresh duty, ADR-0013): a withheld copy would point at a deleted
 * engine folder. Only functions/** and loose root files (e.g.
 * speculation-rules.json) can be withheld per file.
 */
export function isAtomPath(path) {
  return path === 'index.html'
    || path === 'urd.json'
    || path.startsWith('admin/')
    || path.startsWith('assets/')
    || isPageIndexCopy(path);
}

/**
 * Computes the change set for an update.
 *
 * @param {Record<string, string>} baselineTree The template's tree at v<engine>: path → blob SHA
 * @param {Record<string, string>} targetTree The template's tree at the target version: path → blob SHA
 * @param {Record<string, string>} userTree The user's tree (rootDir stripped): path → blob SHA
 * @returns {{changes: Array<{path: string, action: 'write'|'delete', atom: boolean, conflict: 'edited'|'created'|'editedDelete'|null}>, upToDate: boolean}}
 *
 * The rules per path in the template's trees (user-owned paths and `_headers`
 * are outside them, cf. ADR-0006: it is shown as a diff instruction and never
 * written):
 *  - changed upstream + untouched locally    → write
 *  - changed upstream + hand-edited locally  → write with conflict: 'edited'
 *  - unchanged upstream                      → never touched (local changes survive silently)
 *  - new upstream + missing locally          → write
 *  - new upstream + present locally          → write with conflict: 'created'
 *  - removed upstream + untouched locally    → delete
 *  - removed upstream + hand-edited locally  → delete with conflict: 'editedDelete'
 *  - removed upstream + already gone locally → nothing
 *  - missing locally but unchanged upstream  → write (restored)
 */
export function planUpdate(baselineTree, targetTree, userTree) {
  const changes = [];
  const paths = new Set([...Object.keys(baselineTree), ...Object.keys(targetTree)]);
  for (const path of [...paths].sort()) {
    if (isUserPath(path) || path === '_headers') continue;
    const base = baselineTree[path];
    const target = targetTree[path];
    const user = userTree[path];
    const atom = isAtomPath(path);

    if (target !== undefined) {
      if (user === target) continue; // already at the target content
      if (base === undefined) {
        // New file upstream; a local file at the same path is the user's own.
        changes.push({ path, action: 'write', atom, conflict: user !== undefined ? 'created' : null });
      } else if (base === target) {
        // Unchanged upstream: never touched, except when it is missing locally
        // (deleted by accident); then it is restored.
        if (user === undefined) changes.push({ path, action: 'write', atom, conflict: null });
      } else {
        changes.push({
          path,
          action: 'write',
          atom,
          conflict: user !== undefined && user !== base ? 'edited' : null,
        });
      }
    } else if (user !== undefined) {
      // Removed upstream (e.g. the previous engine folder on a version swap).
      changes.push({ path, action: 'delete', atom, conflict: user !== base ? 'editedDelete' : null });
    }
  }
  return { changes, upToDate: changes.length === 0 };
}

/** Splits tree entries into groups for chained base_tree calls (one commit
 *  either way). The limit is entries per call, well under GitHub's payload cap. */
export function chunkEntries(entries, size = 300) {
  const chunks = [];
  for (let i = 0; i < entries.length; i += size) chunks.push(entries.slice(i, i + size));
  return chunks;
}
