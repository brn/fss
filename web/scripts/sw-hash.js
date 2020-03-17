/**
 * @fileoverview
 * @author Taketoshi Aono
 */

try {
  if (window.__SOURCE_TREE_HASH__) {
    localStorage.setItem('sw-precache-hash-value', window.__SOURCE_TREE_HASH__);
  }
} catch (e) {}
