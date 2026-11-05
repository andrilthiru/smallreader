/* Toy Blocks e-book engine. Data comes from story.js (window.BOOK). No network, no external libraries. */
(function () {
  'use strict';
  var B = window.BOOK, S = window.SCORM;
  var $ = function (id) { return document.getElementById(id); };
  var NP = B.pages.length + 1;              // story pages + closing page

  /* ---------- icons ---------- */
  var st = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
  var IC = {
    listen: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.2"><path d="M4 14v-2a8 8 0 0116 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></svg>',
    book: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.2"><path d="M12 6c-2-1.5-5-2-8-1.5V19c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V4.5C17 4 14 4.5 12 6z"/><path d="M12 6v14.5"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3z"/></svg>',
    x: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="3"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    left: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="3"><path d="M15 5l-7 7 7 7"/></svg>',
    right: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="3"><path d="M9 5l7 7-7 7"/></svg>',
    replay: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.6"><path d="M4 12a8 8 0 108-8H8"/><path d="M10 1L7 4l3 3"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 001.5.9l12-7.5a1 1 0 000-1.8l-12-7.5A1 1 0 007 4.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
    puzzle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h4a2 2 0 114 0h4v4a2 2 0 110 4v4H4v-4a2 2 0 100-4z"/></svg>',
    tick: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="3"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    ok: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.6"><circle cx="12" cy="12" r="10" stroke-width="2.2"/><path d="M7.5 12.5l3 3 6-6.5"/></svg>',
    no: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.6"><circle cx="12" cy="12" r="10" stroke-width="2.2"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7"/></svg>',
    grid: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.2"><rect x="3" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5"/></svg>',
    proj: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.2"><rect x="2.5" y="4" width="19" height="12.5" rx="1.5"/><path d="M12 16.5V20M8 20h8"/></svg>',
    exitproj: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.4"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg>',
    game: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.2"><path d="M7 7h10a5 5 0 014.9 6l-.8 3.6a2.5 2.5 0 01-4.3 1.1L14.5 15h-5l-2.3 2.7a2.5 2.5 0 01-4.3-1.1L2.1 13A5 5 0 017 7z"/><path d="M7.5 10v3M6 11.5h3"/><circle cx="16" cy="10.5" r=".6" fill="currentColor"/><circle cx="17.8" cy="12.5" r=".6" fill="currentColor"/></svg>',
    box: '<svg viewBox="0 0 24 24" ' + st + ' stroke-width="2.2"><path d="M3 8l9-4 9 4v9l-9 4-9-4z"/><path d="M3 8l9 4 9-4M12 12v9"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path fill="#ffc928" stroke="#c99a00" stroke-width="1.2" d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5-4.9-4.5 6.6-.8z"/></svg>'
  };
  function icons(root) { [].forEach.call((root || document).querySelectorAll('[data-i]'), function (e) { e.outerHTML = IC[e.getAttribute('data-i')]; }); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- saved state (SCORM suspend_data, else memory) ---------- */
  var save = { p: 0, m: 'listen', h: 0, wb: [], hp: 0, pj: 0 };
  try { var sd = S.get('cmi.suspend_data'); if (sd) { var o = JSON.parse(sd); for (var k in o) save[k] = o[k]; } } catch (e) {}
  function persist() {
    S.set('cmi.suspend_data', JSON.stringify(save));
    S.set('cmi.core.lesson_location', String(save.p));
  }

  /* ---------- screens ---------- */
  function show(id) { ['start', 'reader', 'act'].forEach(function (s) { $(s).classList.toggle('on', s === id); }); }

  /* ---------- sounds ---------- */
  var voice = new Audio(), fx = new Audio(), fx2 = new Audio(), sayA = new Audio();
  function sfx(src) { try { fx.pause(); fx.src = src; fx.currentTime = 0; var p = fx.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }

  function effect(src) { try { fx2.pause(); fx2.src = src; fx2.currentTime = 0; var p = fx2.play(); if (p && p.catch) p.catch(function () {}); } catch (e) {} }

  /* next-button nudge: shown when a page is done; on the closing page it also says where next leads */
  var nudgeTimer = 0;
  function nudge(on, tip) {
    clearTimeout(nudgeTimer);
    $('next').classList.toggle('nudge', !!on);
    $('nextTip').classList.toggle('on', !!(on && tip));
  }

  /* ================= READER ================= */
  var cur = 0, mode = save.m, words = [], clipIx = 0, playing = false, raf = 0, turnTimer = 0, hintTimer = 0, finished = false;

  function setMode(m) {
    mode = m; save.m = m; persist();
    $('mListen').classList.toggle('on', m === 'listen');
    $('mRead').classList.toggle('on', m === 'read');
    $('mListen').setAttribute('aria-pressed', m === 'listen'); $('mRead').setAttribute('aria-pressed', m === 'read');
    clearTimeout(turnTimer);
    if ($('reader').classList.contains('on') && !isClosing()) { renderPage(cur); return; }   // read and listen use different layouts
    if (m === 'listen' && !playing && !finished && $('reader').classList.contains('on')) startNarration();
    if (m === 'listen' && finished) scheduleTurn();
  }

  function renderPage(i) {
    stopNarration(); hideHint(); clearTimeout(turnTimer);
    cur = i; save.p = i; persist(); finished = false;
    var art = $('art'), tin = $('txtIn');
    art.innerHTML = ''; tin.innerHTML = ''; words = []; lastMark = null; media = voice; closingVid = null;
    $('reader').classList.toggle('closing', i >= B.pages.length);
    nudge(false); fired = {}; preDone = false; try { fx2.pause(); sayA.pause(); } catch (e) {}
    $('pn').textContent = (i + 1) + '/' + NP;
    $('barFill').style.width = ((i + 1) / NP * 100) + '%';
    $('prev').disabled = false;
    if (i < B.pages.length) {
      var pg = B.pages[i];
      var img = el('img'); img.src = pg.img; img.alt = ''; art.appendChild(img);
      (pg.hot || []).forEach(function (h) {
        var b = el('button', 'hs'); b.setAttribute('aria-label', h.label);
        b.style.left = h.box[0] + '%'; b.style.top = h.box[1] + '%'; b.style.width = h.box[2] + '%'; b.style.height = h.box[3] + '%';
        b.onclick = function (e) { tapPicture(h, b, e); };
        art.appendChild(b);
      });
      if (pg.hot && pg.hot.length && !save.hp) setTimeout(function () {
        if (cur !== i) return;
        [].forEach.call(art.querySelectorAll('.hs'), function (b) { b.classList.add('glow'); });
        toast('படத்தில் உள்ளவற்றைத் தொட்டுப் பார்!');
      }, 1200);
      var bubbles = mode === 'read' && pg.bub && pg.bub.length === pg.paras.length;
      $('reader').classList.toggle('bubbles', bubbles);
      pg.paras.forEach(function (para, pi) {
        var p = el('p'), box = null, bi = -1, sp = pg.speech && pg.speech[pi], first = words.length;
        para.forEach(function (w, k) {
          var host = p;
          if (w[3] >= 0) {
            if (bi !== w[3] || !box) { if (k) p.appendChild(document.createTextNode(' ')); box = el('span', 'vw'); box.setAttribute('role', 'button'); box.setAttribute('tabindex', '0'); box.dataset.v = w[3]; p.appendChild(box); bi = w[3]; }
            else box.appendChild(document.createTextNode(' '));
            host = box;
          } else { box = null; bi = -1; if (k) p.appendChild(document.createTextNode(' ')); }
          var s = el('span', 'wd'), txt = w[0];
          if (sp && !bubbles) { if (k === 0) txt = '\u201c' + txt; if (k === para.length - 1) txt += '\u201d'; }   // speech marks in the panel only
          s.textContent = txt; host.appendChild(s);
          words.push({ el: s, c: w[1], t: w[2] });
        });
        if (!bubbles) { tin.appendChild(p); return; }
        var b = pg.bub[pi], bub = el('div', 'bub ' + (b.tail ? 's t-' + b.tail : 'n'));
        bub.style.left = b.box[0] + '%'; bub.style.top = b.box[1] + '%'; bub.style.width = b.box[2] + '%';
        bub.dataset.a = first; bub.dataset.z = words.length - 1;
        bub.setAttribute('role', 'button'); bub.setAttribute('tabindex', '0'); bub.setAttribute('aria-label', 'கேள்: ' + p.textContent);
        bub.appendChild(p); art.appendChild(bub);
        var over = bub.offsetTop + bub.offsetHeight - (art.clientHeight - 12);   // keep inside the picture
        if (over > 0) bub.style.top = Math.max(4, bub.offsetTop - over) + 'px';
      });
      showCtrl(true);
      applySize();
      setPlayBtn();
      if (pg.videos.length && !save.h) hintTimer = setTimeout(showHint, 700);
      if (mode === 'listen') turnTimer = setTimeout(startNarration, 450);
      else if (pg.pre) turnTimer = setTimeout(function () { effect(pg.pre[0]); preDone = true; }, 700);   // the bell sets the scene even before reading
    } else {
      $('reader').classList.remove('bubbles');
      /* closing page: the lines sit on the board inside the video and are read out karaoke-style */
      var c = B.closing;
      var v = el('video'); v.src = c.video; v.setAttribute('playsinline', ''); v.preload = 'auto'; art.appendChild(v);
      var board = el('div', 'board'), bin = el('div', 'in'); board.appendChild(bin); art.appendChild(board);
      c.paras.forEach(function (para, n) {
        var p = el(n ? 'li' : 'h3');
        para.forEach(function (w, k) { if (k) p.appendChild(document.createTextNode(' ')); var s = el('span', 'wd'); s.textContent = w[0]; p.appendChild(s); words.push({ el: s, c: 0, t: w[2] }); });
        if (n === 0) bin.appendChild(p); else { var ul = bin.querySelector('ul') || bin.appendChild(el('ul')); ul.appendChild(p); }
      });
      var big = el('button', 'blk g big', IC.play); big.id = 'bigPlay'; big.setAttribute('aria-label', 'காணொளியைப் பார்'); art.appendChild(big);
      big.onclick = togglePlay; v.onclick = togglePlay;
      v.addEventListener('ended', onEnded);
      closingVid = v;
      fitBoard(board, bin);
      showCtrl(true); setPlayBtn();
      if (mode === 'listen') turnTimer = setTimeout(startNarration, 600);
      else nudgeTimer = setTimeout(function () { if (!playing) nudge(true, true); }, 8000);
    }
  }

  /* the board inside the closing video: largest size that fits its white area */
  function fitBoard(board, bin) {
    var H = board.clientHeight, W = board.clientWidth, lo = 1.8, hi = 4.2;
    for (var n = 0; n < 10; n++) { var mid = (lo + hi) / 2; bin.style.fontSize = mid + 'rem'; if (bin.scrollHeight <= H && bin.scrollWidth <= W + 1) lo = mid; else hi = mid; }
    bin.style.fontSize = lo + 'rem';
  }
  function showCtrl(on) { $('play').classList.toggle('gone', !on); $('replay').classList.toggle('gone', !on); }

  /* One text size for the whole book: the largest size at which the longest page still fits the panel.
     Worked out once (and again if a font finishes loading), so every page reads at the same size. */
  var SIZE = 0;
  function pageHTML(i) {
    return B.pages[i].paras.map(function (p) { return '<p>' + p.map(function (w) { return '<span class="wd">' + esc(w[0]) + '</span>'; }).join(' ') + '</p>'; }).join('');
  }
  function measure() {
    var box = $('txt'), tin = $('txtIn'), keepFs = tin.style.fontSize, keep = document.createDocumentFragment();
    while (tin.firstChild) keep.appendChild(tin.firstChild);   // keep the live word elements (karaoke holds them)
    var cs = getComputedStyle(box), H = box.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var W = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var best = 5;
    for (var i = 0; i < B.pages.length; i++) {
      tin.innerHTML = pageHTML(i);
      var lo = 2.6, hi = best;
      tin.style.fontSize = hi + 'rem';
      if (tin.scrollHeight <= H && tin.scrollWidth <= W + 1) continue;
      for (var n = 0; n < 10; n++) {
        var mid = (lo + hi) / 2; tin.style.fontSize = mid + 'rem';
        if (tin.scrollHeight <= H && tin.scrollWidth <= W + 1) lo = mid; else hi = mid;
      }
      best = lo;
    }
    tin.innerHTML = ''; tin.appendChild(keep); tin.style.fontSize = keepFs;
    SIZE = Math.floor(best * 20) / 20;
  }
  function applySize() { if (!SIZE) measure(); $('txtIn').style.fontSize = SIZE + 'rem'; }

  /* ---- narration + karaoke ---- */
  /* media = what is narrating this page: the voice clip, or on the closing page the video itself */
  var media = voice, closingVid = null;
  function isClosing() { return cur >= B.pages.length; }
  function clips() { return isClosing() ? [{ end: B.closing.end }] : B.pages[cur].clips; }
  function setPlayBtn() {
    $('play').innerHTML = playing ? IC.pause + 'நிறுத்து' : IC.play + 'கேள்';
    var big = $('bigPlay'); if (big) { big.style.display = playing ? 'none' : ''; big.innerHTML = finished ? IC.replay : IC.play; }
  }
  var fired = {};
  /* startNarration(a, z): read words a..z only (one bubble); no arguments = the whole page */
  var rangeA = 0, rangeZ = null, preTimer = 0, preDone = false;
  function startNarration(a, z) {
    finished = false; nudge(false);
    rangeA = a || 0; rangeZ = z == null ? null : z;
    lastMark = null; mark(-1);
    var w0 = words[rangeA], pre = !isClosing() && !rangeA && !preDone && B.pages[cur].pre;
    if (pre) {   // e.g. the school bell rings first, then the narration
      effect(pre[0]); preDone = true; playing = true; setPlayBtn();
      preTimer = setTimeout(function () { if (playing) playClip(0, 0); }, pre[1] * 1000);
      return;
    }
    playClip(w0 && rangeA ? w0.c : 0, w0 && rangeA ? Math.max(0, w0.t - 0.08) : 0);
  }
  function rangeEnd() {
    var zw = words[rangeZ], nx = words[rangeZ + 1];
    return { c: zw.c, t: nx && nx.c === zw.c ? nx.t : clips()[zw.c].end + 0.15 };
  }
  function finishRange() {
    playing = false; cancelAnimationFrame(raf); try { media.pause(); } catch (e) {}
    mark(rangeZ + 1); setPlayBtn();
    var a = rangeA; rangeZ = null;
    setTimeout(function () { if (!playing) { rangeA = a; lastMark = null; mark(-1); rangeA = 0; } }, 900);
  }
  function playClip(k, from) {
    clipIx = k;
    if (isClosing()) media = closingVid; else { media = voice; voice.src = B.pages[cur].clips[k].src; }
    media.currentTime = from || 0;
    var p = media.play(); playing = true; setPlayBtn();
    if (p && p.catch) p.catch(function () { playing = false; setPlayBtn(); });
    loop();
  }
  function stopNarration() { clearTimeout(preTimer); try { fx2.pause(); } catch (e) {} playing = false; cancelAnimationFrame(raf); try { voice.pause(); if (closingVid) closingVid.pause(); } catch (e) {} setPlayBtn(); }
  function togglePlay() {
    clearTimeout(turnTimer);
    if (playing) { stopNarration(); return; }
    if (finished || rangeZ != null || media.ended || (media === voice && (!voice.src || isClosing()))) { startNarration(); return; }
    var p = media.play(); playing = true; setPlayBtn(); if (p && p.catch) p.catch(function () {}); loop();
  }
  voice.addEventListener('ended', onEnded);
  function onEnded() {
    if (!playing) return;
    if (rangeZ != null && clipIx >= words[rangeZ].c) { finishRange(); return; }
    if (clipIx + 1 < clips().length) { setTimeout(function () { if (playing) playClip(clipIx + 1); }, 250); return; }
    playing = false; cancelAnimationFrame(raf); mark(words.length); setPlayBtn(); finished = true;
    nudge(true, isClosing());
    setTimeout(function () { if (finished && !playing) mark(-1); }, 900);
    if (mode === 'listen') scheduleTurn();
  }
  function scheduleTurn() {
    clearTimeout(turnTimer);
    turnTimer = setTimeout(function () { if (mode === 'listen' && !playing && !$('pop').classList.contains('on') && cur < B.pages.length) go(cur + 1); }, 1600);
  }
  function loop() {
    cancelAnimationFrame(raf);
    var step = function () {
      if (!playing) return;
      if (rangeZ != null) { var re = rangeEnd(); if (clipIx > re.c || (clipIx === re.c && media.currentTime >= re.t)) { finishRange(); return; } }
      var t = media.currentTime + 0.04, idx = -1;
      for (var i = 0; i < words.length; i++) {
        var w = words[i];
        if (w.c < clipIx || (w.c === clipIx && w.t <= t)) idx = i; else break;
      }
      var endT = clips()[clipIx].end;
      if (endT && media.currentTime > endT && idx >= 0 && words[idx].c === clipIx && (idx + 1 >= words.length || words[idx + 1].c !== clipIx)) idx = idx + 0.5; // spoken, trailing silence
      mark(idx);
      if (!isClosing()) B.pages[cur].sfx.forEach(function (f) { if (idx >= f[0] && f[0] >= rangeA && !fired[f[0]]) { fired[f[0]] = 1; effect(f[1]); } });
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  var lastMark = null;
  function mark(idx) {
    if (idx === lastMark) return; lastMark = idx;
    for (var i = 0; i < words.length; i++) {
      var c = words[i].el.classList;
      c.toggle('past', i < idx && i >= rangeA); c.toggle('cur', i === idx);
    }
  }

  /* ---- one-time hint beside the first video word ---- */
  function showHint() {
    var w = document.querySelector('#reader .vw'); if (!w) return;
    var stage = $('stage').getBoundingClientRect(), k = stage.width / 1280, r = w.getClientRects()[0];
    var h = $('hint'), rem = 8, up = $('reader').classList.contains('bubbles');
    h.classList.toggle('up', up);
    if (up) {   // bubbles: hint sits under the word, arrow pointing up
      var bb = w.closest('.bub'), br = bb ? bb.getBoundingClientRect() : r;
      var cx = (r.left - stage.left + r.width / 2) / k, bottom = (br.bottom - stage.top) / k;   // under the bubble, so no text is covered
      h.style.left = Math.max(20, Math.min(1010, cx - 125)) / rem + 'rem'; h.style.top = (bottom + 18) / rem + 'rem';
    } else {
      var top = (r.top - stage.top) / k + (r.height / k) / 2 - 34, right = Math.min((r.left - stage.left) / k - 16, 782);  // stay over the picture, pointing at the word's line
      h.style.left = (right - 250) / rem + 'rem'; h.style.top = top / rem + 'rem';
    }
    h.classList.add('on');
    hintTimer = setTimeout(hideHint, 7000);
  }
  function hideHint() { clearTimeout(hintTimer); $('hint').classList.remove('on'); }

  /* ---- video pop-up ---- */
  var resumeAfter = false;
  function openVideo(v) {
    hideHint(); save.h = 1; collect(v); persist(); clearTimeout(turnTimer);
    resumeAfter = playing; if (playing) { playing = false; cancelAnimationFrame(raf); media.pause(); setPlayBtn(); }
    var vid = $('vid'), pop = $('pop');
    pop.classList.remove('ended');
    $('cap').innerHTML = '<b>' + esc(v.word) + '</b>' + (v.meaning ? '<i>=</i><span>' + esc(v.meaning) + '</span>' : '');
    vid.src = v.src; vid.currentTime = 0;
    pop.classList.add('on');
    var p = vid.play(); if (p && p.catch) p.catch(function () { pop.classList.add('ended'); });
    $('popX').focus();
  }
  function closeVideo() {
    var vid = $('vid'); vid.pause(); vid.removeAttribute('src'); vid.load();
    $('pop').classList.remove('on');
    if (resumeAfter) { resumeAfter = false; var p = media.play(); playing = true; setPlayBtn(); if (p && p.catch) p.catch(function () {}); loop(); }
    else if (finished && mode === 'listen') scheduleTurn();
  }
  $('vid').addEventListener('timeupdate', function () { var v = $('vid'); if (v.duration) $('vbar').style.width = (v.currentTime / v.duration * 100) + '%'; });
  $('vid').addEventListener('ended', function () { $('pop').classList.add('ended'); });
  $('vbox').addEventListener('click', function () {
    var v = $('vid');
    if ($('pop').classList.contains('ended')) { $('pop').classList.remove('ended'); v.currentTime = 0; v.play(); }
    else if (v.paused) v.play(); else v.pause();
  });
  $('popX').onclick = closeVideo; $('popVeil').onclick = closeVideo;

  $('txtIn').addEventListener('click', function (e) {
    var w = e.target.closest('.vw');
    if (w) { openVideo(B.pages[cur].videos[+w.dataset.v]); return; }
    var s = e.target.closest('.wd'); if (!s || isClosing()) return;
    for (var i = 0; i < words.length; i++) if (words[i].el === s) { hearWord(i); return; }
  });

  $('art').addEventListener('click', function (e) {
    var v = e.target.closest('.vw'); if (v) { openVideo(B.pages[cur].videos[+v.dataset.v]); return; }
    var b = e.target.closest('.bub'); if (!b) return;
    clearTimeout(turnTimer); try { sayA.pause(); } catch (er) {}
    if (playing) stopNarration();
    startNarration(+b.dataset.a, +b.dataset.z);
  });
  $('art').addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('bub')) { e.preventDefault(); e.target.click(); }
  });

  /* ---- tap a word / tap the picture: play that slice of the narration ---- */
  var sayRaf = 0, sayEl = null;
  function say(src, a, b, elx) {
    if (playing) stopNarration();
    clearTimeout(turnTimer); cancelAnimationFrame(sayRaf);
    if (sayEl) sayEl.classList.remove('said');
    sayEl = elx || null; if (sayEl) sayEl.classList.add('said');
    var go = function () {
      sayA.currentTime = a; var p = sayA.play(); if (p && p.catch) p.catch(function () {});
      var step = function () { if (sayA.currentTime >= b || sayA.ended) { sayA.pause(); if (sayEl) sayEl.classList.remove('said'); return; } sayRaf = requestAnimationFrame(step); };
      sayRaf = requestAnimationFrame(step);
    };
    if (sayA.getAttribute('src') !== src) { sayA.src = src; sayA.addEventListener('loadedmetadata', function f() { sayA.removeEventListener('loadedmetadata', f); go(); }); sayA.load(); }
    else go();
  }
  function hearWord(i) {
    var w = words[i], pg = B.pages[cur], nx = words[i + 1];
    var end = nx && nx.c === w.c ? nx.t : pg.clips[w.c].end;
    end = Math.min(end, w.t + 0.35 + 0.075 * w.el.textContent.length);   // don't run on into the pause after a sentence
    say(pg.clips[w.c].src, Math.max(0, w.t - 0.05), end + 0.02, w.el);
  }
  function tapPicture(h, btn, e) {
    save.hp = 1; persist();
    [].forEach.call(document.querySelectorAll('.hs.glow'), function (b) { b.classList.remove('glow'); });
    var art = $('art'), old = art.querySelector('.hlabel'); if (old) old.remove();
    var r = art.getBoundingClientRect(), k = r.width / art.offsetWidth;
    var lab = el('div', 'hlabel', IC.listen + '<span>' + esc(h.label) + '</span>');
    lab.style.left = ((e.clientX - r.left) / k) + 'px'; lab.style.top = ((e.clientY - r.top) / k) + 'px';
    art.appendChild(lab);
    clearTimeout(tapPicture.t); tapPicture.t = setTimeout(function () { lab.remove(); }, 2200);
    say(h.say[0], h.say[1], h.say[2]);
  }
  $('txtIn').addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('vw')) { e.preventDefault(); openVideo(B.pages[cur].videos[+e.target.dataset.v]); }
  });

  /* ---- word bank: every video word the child opens is kept here ---- */
  var ALLV = [];
  B.pages.forEach(function (pg, pi) { pg.videos.forEach(function (v, vi) { v.key = pi + '.' + vi; v.page = pi + 1; ALLV.push(v); }); });
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.classList.remove('on'); void t.offsetWidth; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(function () { t.classList.remove('on'); }, 2200); }
  function badge(bump) {
    [].forEach.call(document.querySelectorAll('[data-wb]'), function (b) {
      b.querySelector('.cnt').textContent = save.wb.length || '';
      if (bump) { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }
    });
  }
  function collect(v) {
    if (save.wb.indexOf(v.key) >= 0) return;
    save.wb.push(v.key); persist(); badge(true); effect(B.collectSound);
    toast('“' + v.word + '” சொற்பொருளில் சேர்ந்தது!');
  }
  function openBank() {
    resumeAfter = false; if (playing) stopNarration(); clearTimeout(turnTimer);
    var g = $('wbGrid'); g.innerHTML = '';
    ALLV.forEach(function (v) {
      var got = save.wb.indexOf(v.key) >= 0, c;
      if (got) {
        c = el('button', 'wcard', '<img src="' + v.thumb + '" alt=""><span class="wt"><b>' + esc(v.word) + '</b>' + (v.meaning ? '<span>' + esc(v.meaning) + '</span>' : '') + '</span><span class="pl">' + IC.play + '</span>');
        c.setAttribute('aria-label', v.word + ' காணொளி');
        c.onclick = function () { closeBank(); openVideo(v); };
      } else {
        c = el('div', 'wcard locked', '<span class="q">?</span><span class="wt"><span>பக்கம் ' + v.page + '-இல் கோடிட்ட சொல்லைத் தொட்டுப் பார்!</span></span>');
      }
      g.appendChild(c);
    });
    $('wbCount').textContent = save.wb.length + ' / ' + ALLV.length;
    $('wbank').classList.add('on'); $('wbX').focus();
  }
  function closeBank() { $('wbank').classList.remove('on'); }
  [].forEach.call(document.querySelectorAll('[data-wb]'), function (b) { b.onclick = openBank; });
  $('wbX').onclick = closeBank; $('wbVeil').onclick = closeBank;

  /* ---- story cards: every page as a card, tap to jump ---- */
  function openPages() {
    if (playing) stopNarration(); clearTimeout(turnTimer);
    var g = $('pgGrid'); g.innerHTML = '';
    for (var i = 0; i < NP; i++) (function (i) {
      var src = i < B.pages.length ? B.pages[i].img : B.closingThumb;
      var c = el('button', 'pcard' + (i === cur && $('reader').classList.contains('on') ? ' here' : ''), '<img src="' + src + '" alt=""><b>' + (i + 1) + '</b>');
      c.setAttribute('aria-label', 'பக்கம் ' + (i + 1));
      c.onclick = function () { closePages(); show('reader'); go(i); };
      g.appendChild(c);
    })(i);
    $('pages').classList.add('on'); $('pgX').focus();
    var here = g.querySelector('.here'); if (here) here.scrollIntoView({ block: 'nearest' });
  }
  function closePages() { $('pages').classList.remove('on'); }
  [].forEach.call(document.querySelectorAll('[data-pages]'), function (b) { b.onclick = openPages; });
  [].forEach.call(document.querySelectorAll('[data-games]'), function (b) { b.onclick = function () { startActivities(); }; });   // jump to the activities
  $('pgX').onclick = closePages; $('pgVeil').onclick = closePages;

  /* ---- projector: bigger picture and text for the class screen ---- */
  function setProj(on) {
    save.pj = on ? 1 : 0; persist();
    $('stage').classList.toggle('proj', !!on);
    SIZE = 0;
    if ($('reader').classList.contains('on')) { applySize(); if (isClosing()) { var bd = $('art').querySelector('.board'); if (bd) fitBoard(bd, bd.firstChild); } }
  }
  /* projector also takes the whole screen (browser full screen). If full screen isn't allowed
     (e.g. the LMS frame blocks it) the projector layout still works inside the window. */
  var de = document.documentElement;
  function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function enterFs() { try { var r = (de.requestFullscreen || de.webkitRequestFullscreen).call(de); if (r && r.catch) r.catch(function () {}); } catch (e) {} }
  function exitFs() { try { if (fsEl()) { var r = (document.exitFullscreen || document.webkitExitFullscreen).call(document); if (r && r.catch) r.catch(function () {}); } } catch (e) {} }
  [].forEach.call(document.querySelectorAll('[data-proj]'), function (b) {
    b.onclick = function () { if (save.pj) { setProj(false); exitFs(); } else { setProj(true); enterFs(); } };
  });
  ['fullscreenchange', 'webkitfullscreenchange'].forEach(function (ev) {
    document.addEventListener(ev, function () { if (!fsEl() && save.pj) setProj(false); });   // Esc leaves full screen -> leave projector too
  });

  /* ---- navigation ---- */
  function go(i) {
    if (i < 0) { home(); return; }
    if (i >= NP) { startActivities(); return; }
    var r = $('reader'); r.classList.add('turning');
    stopNarration(); clearTimeout(turnTimer); clearTimeout(go.t);
    cur = i;  // so fast double taps move two pages
    go.t = setTimeout(function () { renderPage(i); r.classList.remove('turning'); }, 180);
  }
  $('prev').onclick = function () { if (cur > 0) go(cur - 1); else home(); };
  $('next').onclick = function () { go(cur + 1); };
  $('play').onclick = togglePlay;
  $('replay').onclick = function () { clearTimeout(turnTimer); stopNarration(); startNarration(); };
  $('mListen').onclick = function () { setMode('listen'); };
  $('mRead').onclick = function () { setMode('read'); };
  document.addEventListener('keydown', function (e) {
    if ($('pop').classList.contains('on')) { if (e.key === 'Escape') closeVideo(); return; }
    if ($('wbank').classList.contains('on')) { if (e.key === 'Escape') closeBank(); return; }
    if ($('pages').classList.contains('on')) { if (e.key === 'Escape') closePages(); return; }
    if (e.key === 'Escape' && save.pj) { setProj(false); exitFs(); return; }
    if (!$('reader').classList.contains('on')) return;
    if (e.key === 'ArrowRight') go(cur + 1);
    else if (e.key === 'ArrowLeft' && cur > 0) go(cur - 1);
  });

  /* ================= START ================= */
  function home() {
    stopNarration(); clearTimeout(turnTimer); hideHint(); try { fx.pause(); } catch (e) {}
    var r = save.p > 0 && save.p < NP;
    $('resume').classList.toggle('on', r);
    if (r) $('resumeTxt').textContent = 'பக்கம் ' + (save.p + 1) + ' இலிருந்து தொடரும்.';
    show('start');
  }
  function begin(m) { mode = m; setMode(m); show('reader'); renderPage(save.p > 0 && save.p < NP ? save.p : 0); }
  $('goListen').onclick = function () { begin('listen'); };
  $('goRead').onclick = function () { begin('read'); };
  $('fromStart').onclick = function () { save.p = 0; persist(); $('resume').classList.remove('on'); };

  [].forEach.call(document.querySelectorAll('[data-home]'), function (b) { b.onclick = home; });
  [].forEach.call(document.querySelectorAll('[data-close]'), function (b) {
    b.onclick = function () {
      stopNarration(); try { fx.pause(); } catch (e) {} persist();
      $('bye').classList.add('on');
      try { if (!S.live() && window.top === window) window.close(); } catch (e) {}
    };
  });
  $('byeBack').onclick = function () { $('bye').classList.remove('on'); };

  /* ================= ACTIVITIES ================= */
  var A = B.act, picks = [], qi = 0, reviewing = false;
  function card(id) { ['aIntro', 'aMatch', 'aQuiz', 'aResult'].forEach(function (c) { $(c).classList.toggle('on', c === id); }); }
  function startActivities() {
    stopNarration(); hideHint(); save.story = 1; persist();
    show('act'); card('aIntro'); sfx(A.introAudio);
  }
  $('toMatch').onclick = function () { try { fx.pause(); } catch (e) {} startMatch(); };

  /* ---- matching: drag, or tap a meaning then tap a slot ---- */
  var placed, sel = null, tries = 0, MAXTRY = 2, shown = false;
  var MSG = 'பொருளை இழுத்து வை, அல்லது தொட்டுப் பிறகு இடத்தைத் தொடு.';
  function mMsg(t, warn) { var m = $('mMsg'); m.textContent = t; m.classList.toggle('warn', !!warn); }
  function startMatch() {
    card('aMatch'); placed = A.match.map(function () { return null; }); sel = null; tries = 0; shown = false; mMsg(MSG);
    var g = $('mGrid'); g.innerHTML = '';
    A.match.forEach(function (m, i) {
      g.appendChild(el('div', 'word', esc(m[0])));
      var s = el('div', 'slot', 'பொருளை இங்கே வை'); s.dataset.i = i; g.appendChild(s);
      s.onclick = function () { if (sel != null) place(sel, i); else if (placed[i] != null && !s.classList.contains('ok')) unplace(i); };
    });
    var order = A.match.map(function (_, i) { return i; });
    do { order.sort(function () { return Math.random() - 0.5; }); } while (order.every(function (v, i) { return v === i; }));
    var tr = $('tray'); tr.innerHTML = '';
    order.forEach(function (i) { tr.appendChild(chip(i)); });
    // drop slots: just a little wider than the longest meaning chip
    var rem = parseFloat(getComputedStyle(document.documentElement).fontSize), mw = 0;
    [].forEach.call(tr.children, function (c) { mw = Math.max(mw, c.offsetWidth); });
    g.style.gridTemplateColumns = '37.5rem ' + ((mw / rem) + 4.5) + 'rem';
    mUpdate();
  }
  /* after the last try: show the right meaning in every slot still open */
  function reveal() {
    A.match.forEach(function (m, i) {
      var s = slotEl(i); placed[i] = null; if (s.classList.contains('ok') || s.classList.contains('shown')) return;
      s.className = 'slot shown'; s.innerHTML = esc(m[1]) + '<small>சரியான விடை</small>';
    });
    $('tray').innerHTML = ''; sel = null; mUpdate();
  }
  function chip(i) {
    var c = el('button', 'chip2', esc(A.match[i][1])); c.dataset.m = i; drag(c); return c;
  }
  function slotEl(i) { return $('mGrid').querySelector('.slot[data-i="' + i + '"]'); }
  function place(m, i) {
    var s = slotEl(i); if (s.classList.contains('ok')) return;
    if (placed[i] != null) unplace(i);
    var old = placed.indexOf(m); if (old >= 0) unplace(old);
    var c = $('tray').querySelector('[data-m="' + m + '"]'); if (c) c.remove();
    placed[i] = m; s.innerHTML = ''; var cc = chip(m); s.appendChild(cc);
    sel = null; mUpdate();
  }
  function unplace(i) {
    var m = placed[i]; if (m == null) return; placed[i] = null;
    var s = slotEl(i); s.innerHTML = 'பொருளை இங்கே வை';
    $('tray').appendChild(chip(m)); mUpdate();
  }
  function mUpdate() {
    var ok = $('mGrid').querySelectorAll('.slot.ok').length, n = A.match.length;
    $('mCount').textContent = ok + ' / ' + n + ' சரி';
    $('mTries').textContent = 'முயற்சி ' + Math.min(tries + 1, MAXTRY) + ' / ' + MAXTRY;
    $('mTries').style.visibility = (ok === n || shown) ? 'hidden' : '';
    [].forEach.call(document.querySelectorAll('#aMatch .chip2'), function (c) { c.classList.toggle('sel', sel != null && +c.dataset.m === sel); });
    [].forEach.call($('mGrid').querySelectorAll('.slot'), function (s) { s.classList.toggle('tap', sel != null && !s.classList.contains('ok')); });
    var btn = $('mCheck');
    if (ok === n || shown) { btn.className = 'blk o'; btn.innerHTML = 'அடுத்தது' + IC.right; btn.disabled = false; }
    else { btn.className = 'blk g'; btn.textContent = 'சரிபார்'; btn.disabled = placed.some(function (m, i) { return m == null && !slotEl(i).classList.contains('ok'); }); }
  }
  $('mCheck').onclick = function () {
    var n = A.match.length;
    if (shown || $('mGrid').querySelectorAll('.slot.ok').length === n) { startQuiz(); return; }
    var good = 0, bad = 0; tries++;
    placed.forEach(function (m, i) {
      var s = slotEl(i); if (m == null || s.classList.contains('ok')) return;
      if (m === i) { s.className = 'slot ok'; s.innerHTML = esc(A.match[i][1]) + IC.tick; good++; }
      else { bad++; s.classList.remove('bad'); void s.offsetWidth; s.classList.add('bad'); (function (ii) { setTimeout(function () { unplace(ii); slotEl(ii).classList.remove('bad'); if (shown) reveal(); }, 450); })(i); }
    });
    if (good) sfx(A.matchSound);
    if (!bad) mMsg('அருமை! எல்லாம் சரி.');
    else if (tries >= MAXTRY) { shown = true; mMsg('சரியான விடைகளைப் பார்த்துக்கொள்.'); }
    else mMsg('சில விடைகள் தவறு. இன்னும் ஒரு முயற்சி!', true);
    setTimeout(mUpdate, 470); mUpdate();
  };
  function drag(c) {
    var sx, sy, moved, ghost, from;
    c.addEventListener('pointerdown', function (e) {
      if (c.closest('.slot.ok')) return;
      sx = e.clientX; sy = e.clientY; moved = false; from = c.parentNode;
      try { c.setPointerCapture(e.pointerId); } catch (er) {}
    });
    c.addEventListener('pointermove', function (e) {
      if (sx == null) return;
      if (!moved && Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) > 8) {
        moved = true; var r = c.getBoundingClientRect();
        ghost = c.cloneNode(true); ghost.classList.add('lifted'); ghost.classList.remove('sel');
        ghost.style.left = r.left + 'px'; ghost.style.top = r.top + 'px'; ghost.style.width = r.width + 'px'; ghost.style.height = r.height + 'px';
        ghost.style.fontSize = getComputedStyle(c).fontSize; ghost.style.padding = getComputedStyle(c).padding; ghost.style.borderRadius = getComputedStyle(c).borderRadius;
        ghost.dx = sx - r.left; ghost.dy = sy - r.top; document.body.appendChild(ghost); c.classList.add('gap');
      }
      if (moved) {
        ghost.style.left = (e.clientX - ghost.dx) + 'px'; ghost.style.top = (e.clientY - ghost.dy) + 'px';
        var t = document.elementFromPoint(e.clientX, e.clientY), s = t && t.closest('.slot');
        [].forEach.call($('mGrid').querySelectorAll('.slot'), function (x) { x.classList.toggle('hot', x === s && !x.classList.contains('ok')); });
      }
    });
    var end = function (e) {
      if (sx == null) return; sx = null;
      var m = +c.dataset.m;
      if (!moved) { // tap
        var inSlot = c.closest('.slot');
        if (inSlot) { unplace(+inSlot.dataset.i); }
        else { sel = sel === m ? null : m; mUpdate(); }
        return;
      }
      ghost.remove(); c.classList.remove('gap');
      [].forEach.call($('mGrid').querySelectorAll('.slot'), function (x) { x.classList.remove('hot'); });
      var t = e.type === 'pointerup' ? document.elementFromPoint(e.clientX, e.clientY) : null, s = t && t.closest('.slot');
      if (s && !s.classList.contains('ok')) place(m, +s.dataset.i);
      else if (from && from.classList && from.classList.contains('slot') && !(t && t.closest('.slot'))) unplace(+from.dataset.i);
    };
    c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
  }

  /* ---- quiz ---- */
  var KEYS = ['அ', 'ஆ', 'இ', 'ஈ'];
  function startQuiz() { picks = []; qi = 0; reviewing = false; card('aQuiz'); renderQ(); }
  function renderQ() {
    var q = A.quiz[qi], done = picks[qi] != null;
    $('qIns').textContent = qi === 0 && !reviewing ? A.quizIns : '';
    $('qIns').style.display = qi === 0 && !reviewing ? '' : 'none';
    $('qHead').textContent = reviewing ? 'மதிப்பாய்வு' : 'தெரிவுவினா';
    $('qCount').textContent = 'கேள்வி ' + (qi + 1) + ' / ' + A.quiz.length;
    $('qText').textContent = q.q;
    var o = $('opts'); o.innerHTML = ''; o.className = 'opts' + (done ? ' done' : '');
    q.opts.forEach(function (t, k) {
      var b = el('button', 'opt', '<span class="k">' + KEYS[k] + '</span><span>' + esc(t) + '</span>');
      if (done) { if (k === q.ans) b.classList.add('right'); else if (k === picks[qi]) b.classList.add('wrong'); b.disabled = true; }
      b.onclick = function () { if (picks[qi] != null) return; picks[qi] = k; renderQ(); };
      o.appendChild(b);
    });
    var fb = $('fb');
    if (done) {
      var r = picks[qi] === q.ans;
      fb.className = 'fb ' + (r ? 'ok' : 'no'); fb.innerHTML = (r ? IC.ok + 'சரியான விடை!' : IC.no + 'தவறான விடை!');
    } else { fb.className = 'fb'; fb.innerHTML = ''; }
    $('qNext').style.visibility = done ? '' : 'hidden';
    $('qNext').innerHTML = (qi + 1 < A.quiz.length ? 'அடுத்தது' : 'முடிவு') + IC.right;
  }
  $('qNext').onclick = function () { if (qi + 1 < A.quiz.length) { qi++; renderQ(); } else results(); };

  function results() {
    var n = A.quiz.length, right = picks.filter(function (p, i) { return p === A.quiz[i].ans; }).length, all = right === n;
    card('aResult');
    var s = $('stars'); s.innerHTML = '';
    for (var i = 0; i < n; i++) { var x = el('span', '', IC.star); x = x.firstChild; if (i >= right) x.setAttribute('class', 'off'); s.appendChild(x); }
    $('rTitle').textContent = all ? A.pass[0] : A.fail[0];
    $('rText').textContent = (all ? A.pass[1] : A.fail[1]) + ' (' + right + ' / ' + n + ')';
    if (!reviewing) {
      S.set('cmi.core.score.min', 0); S.set('cmi.core.score.max', 100);
      S.set('cmi.core.score.raw', Math.round(right / n * 100));
      S.set('cmi.core.lesson_status', 'completed');
      save.done = 1; persist();
      if (all) sfx(A.resultSound);
    }
    reviewing = false;
  }
  $('rRetry').onclick = startQuiz;
  $('rReview').onclick = function () { reviewing = true; qi = 0; card('aQuiz'); renderQ(); };
  $('rDone').onclick = function () { save.p = 0; persist(); home(); };

  /* ================= boot ================= */
  icons(); badge(false); save.pj = 0;
  [].forEach.call(document.querySelectorAll('[data-title]'), function (e) { e.textContent = B.title; });
  $('title').textContent = B.title; $('lvl').textContent = B.level; $('dur').textContent = B.duration; $('cover').src = B.cover;
  $('introTxt').textContent = A.intro; $('matchTitle').textContent = A.matchTitle;
  setMode(mode === 'read' ? 'read' : 'listen');
  var refit = function () { SIZE = 0; if ($('reader').classList.contains('on')) applySize(); };
  if (document.fonts) {
    if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', refit);
    try { document.fonts.load('500 31px "Baloo Thambi 2"', 'அ').then(refit); document.fonts.load('800 31px "Baloo Thambi 2"', 'அ'); } catch (e) {}
  }
  home();

  /* ?p=N jumps straight to a page, ?a=match|quiz|result to an activity (for checking only) */
  var q = new URLSearchParams(location.search);
  if (q.get('p')) { mode = 'read'; setMode('read'); show('reader'); renderPage(Math.min(NP, Math.max(1, +q.get('p'))) - 1); }
  if (q.get('a')) { show('act'); if (q.get('a') === 'match') startMatch(); else if (q.get('a') === 'quiz') startQuiz(); else if (q.get('a') === 'result') { picks = A.quiz.map(function (x) { return x.ans; }); results(); } else card('aIntro'); }
})();
