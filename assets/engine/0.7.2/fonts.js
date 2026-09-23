/**
 * Shared typography constants: the font choices shown both by the admin
 * panels and by the typography row of the text editor bar. System-safe
 * stacks only (Urd never loads external fonts, see _headers/CSP).
 */

/** @type {Array<[string, string]>} Display-name KEY (looked up with ta() by
 *  the consumer; the module sits in the visitor closure and can never call
 *  ta() at module level) + CSS font stack. Comparison and storage always use
 *  the stack (element 1), never the key. */
export const FONT_STACKS = [
  ['font.system', 'system-ui, sans-serif'],
  ['font.arial', 'Arial, Helvetica, sans-serif'],
  ['font.verdana', 'Verdana, Geneva, sans-serif'],
  ['font.trebuchet', "'Trebuchet MS', sans-serif"],
  ['font.georgia', "Georgia, 'Times New Roman', serif"],
  ['font.palatino', "'Palatino Linotype', Palatino, serif"],
  ['font.courier', "'Courier New', monospace"],
];
