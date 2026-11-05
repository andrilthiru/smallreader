/* Minimal SCORM 1.2 bridge. Works silently when no LMS is present (plain HTML5 / SLS iframe). */
(function () {
  'use strict';
  var api = null, live = false, timer = null;
  function find(win) {
    var hops = 0;
    try {
      while (win && hops < 12) {
        if (win.API) return win.API;
        if (win.parent && win.parent !== win) { win = win.parent; hops++; } else break;
      }
    } catch (e) { /* cross-origin parent: no LMS */ }
    return null;
  }
  try { api = find(window) || (window.opener ? find(window.opener) : null); } catch (e) { api = null; }
  if (api) {
    try { live = String(api.LMSInitialize('')) === 'true'; } catch (e) { live = false; }
    if (live) {
      try {
        var st = api.LMSGetValue('cmi.core.lesson_status');
        if (st === 'not attempted' || st === '') api.LMSSetValue('cmi.core.lesson_status', 'incomplete');
      } catch (e) {}
    }
  }
  function commitSoon() {
    if (!live) return;
    clearTimeout(timer);
    timer = setTimeout(function () { try { api.LMSCommit(''); } catch (e) {} }, 800);
  }
  window.SCORM = {
    live: function () { return live; },
    get: function (k) { if (!live) return ''; try { return api.LMSGetValue(k) || ''; } catch (e) { return ''; } },
    set: function (k, v) { if (!live) return; try { api.LMSSetValue(k, String(v)); commitSoon(); } catch (e) {} },
    finish: function () { if (!live) return; try { api.LMSCommit(''); api.LMSFinish(''); } catch (e) {} live = false; }
  };
  window.addEventListener('pagehide', function () { window.SCORM.finish(); });
})();
