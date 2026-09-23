/**
 * Startup for the visitor page. A separate file (not inline in index.html)
 * so Content-Security-Policy can require script-src 'self' with no exceptions.
 */
import { boot } from './urd.js';

boot({
  root: document.getElementById('urd-root'),
  nav: document.getElementById('urd-nav'),
});
