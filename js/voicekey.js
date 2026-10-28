/* ==========================================================
   Nevelrijk — sleutel voor ingesproken zinnen
   Wordt gedeeld door de game (browser) en tools/stemmen.mjs (Node),
   zodat een zin altijd naar hetzelfde audiobestand wijst.
   ========================================================== */
(function (root) {
  'use strict';
  // Precies zo schoonmaken als wat er hardop gezegd wordt.
  function clean(text) {
    return String(text || '')
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/[*_~]/g, '')
      .replace(/…/g, '...')
      .replace(/—/g, ', ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  // FNV-1a, 32 bit, als hex: kort en stabiel.
  function hash(s) {
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return ('0000000' + h.toString(16)).slice(-8);
  }
  function key(speaker, text) { return speaker + '-' + hash(speaker + '|' + clean(text)); }
  const VoiceKey = { clean, hash, key };
  if (typeof module !== 'undefined' && module.exports) module.exports = VoiceKey;
  else root.VoiceKey = VoiceKey;
})(typeof window !== 'undefined' ? window : globalThis);
