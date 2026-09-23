/**
 * The template model: pure helpers for user templates in content/maler/.
 *
 * The contract (docs/SCHEMA.md, Templates): the template file stores the source
 * ids untouched; EVERY insertion deep-clones and assigns new ids BEFORE
 * posting, so the same template can be inserted several times without
 * collision. Block groups are stored with frames as they stand; normalisation
 * (anchor plus clamp inside the section) happens here on insertion, never on
 * save. No DOM - node-testable.
 */
import { slugify } from './imageTools.js';
import { groupDelta } from './selection.js';
import { liftMobileFrame, liftContractTokens } from './migrate.js';

/** Current version of the template file format (content/maler/*.json). */
export const TEMPLATE_SCHEMA_VERSION = 1;

/** Valid template kinds; the payload key in the file equals the kind. */
export const TEMPLATE_KINDS = ['section', 'blocks', 'page'];

/** Template id from the display name (the same id regime as collections); an
 *  empty string means an invalid name and must be rejected by the caller. */
export function templateId(name) {
  return slugify(String(name ?? ''), '');
}

const r2 = (v) => Math.round(v * 100) / 100;

/** Template payloads are inserted outside the page lift, so a template saved
 *  before the row grid (ADR-0019) can carry frames.mobile in the old
 *  full-frame form. Lifted per block on insertion. */
function liftBlockMobile(block) {
  if (block.frames?.mobile) {
    block.frames.mobile = liftMobileFrame(block.frames.mobile, block.frames.desktop);
  }
}

/**
 * Prepares a section template for insertion: deep clone with a new section id
 * and new block ids. Geometry and props are left alone.
 * @param {object} section The section from the template file (not mutated)
 * @param {(prefix: string) => string} makeId The id factory (sections/presets.js)
 */
export function cloneSectionForInsert(section, makeId) {
  const out = structuredClone(section);
  out.id = makeId('sec');
  for (const block of out.blocks ?? []) {
    block.id = makeId('blk');
    liftBlockMobile(block);
  }
  // Templates saved before v3 carry the old Norwegian contract tokens
  // (ADR-0021); renamed here since payloads bypass the page lift.
  liftContractTokens(out);
  return out;
}

/**
 * Prepares a page template for insertion: deep clone where meta points at the
 * NEW page (id is the page slug, validated by the caller against reserved
 * names and existing pages - never a makeId string), and every section and
 * block gets new ids. Geometry, props and schemaVersion are left alone.
 * @param {object} page The page file from the template (not mutated)
 * @param {(prefix: string) => string} makeId The id factory (sections/presets.js)
 * @param {{id: string, title: string}} meta The new page's slug and title
 */
export function clonePageForInsert(page, makeId, { id, title }) {
  const out = structuredClone(page);
  out.meta = { ...out.meta, id, title };
  for (const section of out.sections ?? []) {
    section.id = makeId('sec');
    for (const block of section.blocks ?? []) block.id = makeId('blk');
  }
  return out;
}

/**
 * Prepares a block group template for insertion: deep clone with new ids, the
 * whole group moved so the top left corner lands on the anchor (clamped
 * inside the section by groupDelta), and minBottom for section growth
 * (urd-add-blocks). Without an anchor the stored positions are kept (clamp
 * only). The internal layout is always preserved; frames.mobile comes along,
 * lifted to the row grid form if the template was saved in the old one.
 * @param {Array<object>} blocks The blocks from the template file (not mutated)
 * @param {(prefix: string) => string} makeId The id factory
 * @param {{anchor?: {x: number, y: number}|null}} [opts] Anchor in section coordinates (x in %, y in px)
 * @returns {{blocks: Array<object>, minBottom: number}}
 */
export function cloneBlocksForInsert(blocks, makeId, { anchor = null } = {}) {
  const out = structuredClone(blocks);
  for (const block of out) {
    block.id = makeId('blk');
    liftBlockMobile(block);
  }
  liftContractTokens(out);
  const frames = out.map((b) => b.frames.desktop);
  const minX = Math.min(...frames.map((f) => f.x));
  const minY = Math.min(...frames.map((f) => f.y));
  const { dx, dy } = anchor
    ? groupDelta(frames, anchor.x - minX, anchor.y - minY)
    : groupDelta(frames, 0, 0);
  for (const f of frames) {
    f.x = r2(f.x + dx);
    f.y = Math.round(f.y + dy);
  }
  const minBottom = Math.max(...frames.map((f) => f.y + f.h));
  return { blocks: out, minBottom };
}
