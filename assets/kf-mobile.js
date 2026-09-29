/* Phone and touch layer for The Sunday Shoot.
   1. Under 860px wide, the before/after reel becomes a full-screen scroll scene:
      the frame turns 90 degrees to fill a portrait phone, then each pair wipes
      from prompted to directed as you scroll. Landscape phones get the same
      scene without the turn.
   2. On touch screens (and narrow screens) the hover orb gallery becomes a
      swipeable 3D film strip. Tapping the centre frame opens the lightbox. */
(function () {
  'use strict';

  var PAIRS = [
    ['assets/pairs/p3-before.webp', 'assets/pairs/p3-after.webp'],
    ['assets/pairs/p4-before.webp', 'assets/pairs/p4-after.webp'],
    ['assets/pairs/p5-before.webp', 'assets/pairs/p5-after.webp'],
    ['assets/pairs/p1-before.jpg', 'assets/pairs/p1-after.jpg'],
    ['assets/pairs/p2-before.jpg', 'assets/pairs/p2-after.jpg']
  ];

  var root = document.documentElement;
  var narrow = window.matchMedia('(max-width: 859px)');
  var touch = window.matchMedia('(hover: none), (pointer: coarse)');
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function modes() {
    root.classList.toggle('kfx-m', narrow.matches);
    root.classList.toggle('kfx-t', narrow.matches || touch.matches);
  }
  modes();
  [narrow, touch].forEach(function (m) {
    if (m.addEventListener) m.addEventListener('change', modes); else if (m.addListener) m.addListener(modes);
  });

  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ease = function (t) { return t * t * (3 - 2 * t); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html) e.innerHTML = html; return e; }

  /* ---------------- before / after scene ---------------- */

  var ba = null;

  function buildBA() {
    var prev = document.querySelector('button[aria-label="Previous frame"]');
    if (!prev) return false;
    var reel = prev.parentElement && prev.parentElement.parentElement;
    var section = reel && reel.closest('section');
    if (!section) return false;
    reel.classList.add('kfx-ba-hide');

    var wrap = el('div', 'kfx-ba');
    wrap.setAttribute('aria-label', 'Before and after frames');
    var stage = el('div', 'kfx-ba-stage');
    var frame = el('div', 'kfx-ba-frame');
    var pairs = PAIRS.map(function (p, i) {
      var box = el('div', 'kfx-ba-pair');
      var b = new Image(); b.alt = 'Prompted frame ' + (i + 1); b.decoding = 'async'; b.src = p[0];
      var a = new Image(); a.alt = 'Directed frame ' + (i + 1); a.decoding = 'async'; a.src = p[1];
      // a missing file shows the other half instead of a broken-image box
      b.onerror = function () { b.style.visibility = 'hidden'; }; a.onerror = function () { a.style.visibility = 'hidden'; };
      box.appendChild(b); box.appendChild(a);
      frame.appendChild(box);
      return { box: box, before: b, after: a };
    });
    var line = el('div', 'kfx-ba-line');
    var knob = el('div', 'kfx-ba-knob', '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>');
    line.appendChild(knob);
    frame.appendChild(line);

    var ui = el('div', 'kfx-ba-ui');
    var dir = el('div', 'kfx-ba-tag kfx-ba-dir', '<i></i>Directed');
    var pro = el('div', 'kfx-ba-tag kfx-ba-pro', '<i></i>Prompted');
    var count = el('div', 'kfx-ba-count', '01 / 0' + PAIRS.length);
    var dots = el('div', 'kfx-ba-dots', PAIRS.map(function () { return '<b></b>'; }).join(''));
    var hint = el('div', 'kfx-ba-hint', '<svg width="16" height="22" viewBox="0 0 16 22" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="1" y="1" width="14" height="20" rx="3"/><path d="M6 17.5h4"/></svg>Scroll to direct');
    [dir, pro, count, dots, hint].forEach(function (n) { ui.appendChild(n); });

    stage.appendChild(frame); stage.appendChild(ui); wrap.appendChild(stage);
    section.appendChild(wrap);

    ba = { wrap: wrap, stage: stage, frame: frame, pairs: pairs, line: line, dir: dir, pro: pro, count: count, dots: dots.children, hint: hint, sig: '' };
    sizeBA();
    return true;
  }

  // scroll budget, in screen heights
  var INTRO = 0.7, PER = 1.15, OUTRO = 0.6;

  function sizeBA() {
    if (!ba) return;
    ba.wrap.style.height = ((INTRO + PER * PAIRS.length + OUTRO) * 100 + 100) + 'vh';
  }

  function drawBA() {
    if (!ba || !root.classList.contains('kfx-m')) return;
    var vw = ba.stage.clientWidth || window.innerWidth, vh = ba.stage.clientHeight || window.innerHeight;
    var r = ba.wrap.getBoundingClientRect();
    var span = r.height - vh;
    if (r.bottom < -50 || r.top > vh + 50 || span <= 0) return;
    var s = clamp(-r.top / span, 0, 1);
    var T = INTRO + PER * PAIRS.length + OUTRO, t = s * T;
    var portrait = vh > vw;
    root.classList.toggle('kfx-land', !portrait);
    var turn = portrait && !calm.matches;

    // how far the frame has opened up to full screen
    var open = t < INTRO ? ease(t / INTRO) : t > T - OUTRO ? ease((T - t) / OUTRO) : 1;
    var cw = Math.min(vw - 32, 760), ch = cw * 9 / 16;
    var fw = turn ? vh : vw, fh = turn ? vw : vh;
    var w = lerp(cw, fw, open), h = lerp(ch, fh, open), ang = turn ? 90 * open : 0;
    var rad = lerp(18, 0, open);

    // which pair, and how far its wipe has run
    var k = clamp(Math.floor((t - INTRO) / PER), 0, PAIRS.length - 1);
    var u = clamp((t - INTRO - k * PER) / PER, 0, 1);
    var wipe = t < INTRO ? 0 : t > T - OUTRO ? 1 : ease(clamp((u - 0.1) / 0.7, 0, 1));
    var fade = k < PAIRS.length - 1 ? ease(clamp((u - 0.88) / 0.12, 0, 1)) : 0;

    var sig = [w | 0, h | 0, ang.toFixed(2), k, wipe.toFixed(3), fade.toFixed(3)].join('|');
    if (sig === ba.sig) return;
    ba.sig = sig;

    var f = ba.frame.style;
    f.width = w.toFixed(1) + 'px'; f.height = h.toFixed(1) + 'px';
    f.borderRadius = rad.toFixed(1) + 'px';
    f.transform = 'translate(-50%,-50%) rotate(' + ang.toFixed(2) + 'deg)';

    for (var i = 0; i < ba.pairs.length; i++) {
      var p = ba.pairs[i];
      var op = i === k ? 1 : (i === k + 1 ? fade : 0);
      p.box.style.opacity = op;
      p.box.style.zIndex = i === k + 1 ? 2 : 1;
      if (i === k) p.after.style.clipPath = 'inset(0 ' + ((1 - wipe) * 100).toFixed(2) + '% 0 0)';
      else if (i === k + 1) p.after.style.clipPath = 'inset(0 100% 0 0)';
    }
    ba.line.style.left = (wipe * 100).toFixed(2) + '%';
    var showLine = t >= INTRO * 0.9 && t <= T - OUTRO * 0.4 && wipe > 0.004 && wipe < 0.996;
    ba.line.style.opacity = showLine ? 1 : 0;

    var full = open > 0.98;
    ba.dir.classList.toggle('kfx-dim', wipe < 0.5);
    ba.pro.classList.toggle('kfx-dim', wipe >= 0.5);
    ba.dir.style.opacity = full ? '' : 0; ba.pro.style.opacity = full ? '' : 0;
    ba.count.style.opacity = full ? 1 : 0;
    ba.dots.length && Array.prototype.forEach.call(ba.dots, function (d, i) { d.classList.toggle('on', i === k); });
    ba.dots[0] && (ba.dots[0].parentElement.style.opacity = full ? 1 : 0);
    ba.hint.style.opacity = open < 0.2 ? 1 - open * 5 : 0;
    var n = String(k + 1).padStart(2, '0') + ' / ' + String(PAIRS.length).padStart(2, '0');
    if (ba.count.textContent !== n) ba.count.textContent = n;
  }

  /* ---------------- touch gallery ---------------- */

  var fl = null;

  function buildFlow() {
    var orb = document.querySelector('[data-orb-stage]');
    if (!orb) return false;
    var tiles = Array.prototype.slice.call(orb.querySelectorAll('[data-orb]'));
    var srcs = tiles.map(function (t) { var i = t.querySelector('img'); return i && i.getAttribute('src'); });
    if (!tiles.length || srcs.some(function (s) { return !s; })) return false;
    var section = orb.closest('section');
    orb.classList.add('kfx-orb-hide');

    var wrap = el('div', 'kfx-flow');
    var track = el('div', 'kfx-flow-track');
    track.appendChild(el('div', 'kfx-flow-pad'));
    var cards = srcs.map(function (src, i) {
      var c = el('button', 'kfx-card');
      c.type = 'button';
      c.setAttribute('aria-label', 'Open frame ' + (i + 1));
      var img = new Image(); img.alt = tiles[i].getAttribute('title') || ''; img.loading = i < 6 ? 'eager' : 'lazy'; img.decoding = 'async'; img.src = src;
      c.appendChild(img);
      c.addEventListener('click', function () {
        if (fl && fl.cur === i) tiles[i].click();
        else centre(i, true);
      });
      track.appendChild(c);
      return c;
    });
    track.appendChild(el('div', 'kfx-flow-pad'));
    var meta = el('div', 'kfx-flow-meta', '<span class="kfx-flow-n">01 / ' + String(cards.length).padStart(2, '0') + '</span><span class="kfx-flow-bar"><i></i></span><span>swipe · tap to open</span>');
    wrap.appendChild(track); wrap.appendChild(meta);
    section.appendChild(wrap);

    fl = { wrap: wrap, track: track, cards: cards, n: meta.querySelector('.kfx-flow-n'), bar: meta.querySelector('.kfx-flow-bar i'), cur: 0, pads: track.querySelectorAll('.kfx-flow-pad') };
    track.addEventListener('scroll', function () { fl.dirty = true; }, { passive: true });
    layout();
    return true;
  }

  function centre(i, smooth) {
    var c = fl.cards[i]; if (!c) return;
    var left = c.offsetLeft + c.offsetWidth / 2 - fl.track.clientWidth / 2;
    fl.track.scrollTo({ left: left, behavior: smooth ? 'smooth' : 'auto' });
  }

  function layout() {
    if (!fl) return;
    var tw = fl.track.clientWidth || window.innerWidth, vh = window.innerHeight;
    // uniform tall cards, cropped to fill; the lightbox shows each frame uncropped.
    // neighbours always peek in from both sides so the tilt reads.
    var w = Math.min(tw * (tw < 600 ? 0.68 : 0.36), 460), h = Math.min(w * 1.38, vh * 0.62);
    fl.cards.forEach(function (c) { c.style.width = w.toFixed(1) + 'px'; c.style.height = h.toFixed(1) + 'px'; });
    var first = fl.cards[0], last = fl.cards[fl.cards.length - 1];
    fl.pads[0].style.width = Math.max(0, (tw - first.offsetWidth) / 2 - 14) + 'px';
    fl.pads[1].style.width = Math.max(0, (tw - last.offsetWidth) / 2 - 14) + 'px';
    fl.dirty = true;
  }

  function drawFlow() {
    if (!fl || !fl.dirty || !root.classList.contains('kfx-t')) return;
    fl.dirty = false;
    var tr = fl.track.getBoundingClientRect(), mid = tr.left + tr.width / 2;
    var best = 0, bestD = 1e9;
    fl.cards.forEach(function (c, i) {
      var r = c.getBoundingClientRect();
      var cx = r.left + r.width / 2, d = (cx - mid) / (tr.width * 0.55);
      var ad = Math.abs(d);
      if (ad < bestD) { bestD = ad; best = i; }
      if (ad > 2.2) { c.style.transform = 'none'; c.style.opacity = 0.3; return; }
      var rot = clamp(-d * 42, -55, 55);
      var z = -Math.min(1.4, ad) * 140;
      var sc = 1 - Math.min(1, ad) * 0.12;
      c.style.transform = 'translateZ(' + z.toFixed(1) + 'px) rotateY(' + rot.toFixed(2) + 'deg) scale(' + sc.toFixed(3) + ')';
      c.style.opacity = (1 - Math.min(1, ad) * 0.45).toFixed(3);
      c.style.filter = ad > 0.08 ? 'brightness(' + (1 - Math.min(1, ad) * 0.35).toFixed(2) + ')' : 'none';
      c.style.zIndex = 100 - Math.round(ad * 20);
      c.style.setProperty('--shine', (Math.max(0, 1 - ad * 3)).toFixed(2));
    });
    fl.cur = best;
    var n = String(best + 1).padStart(2, '0') + ' / ' + String(fl.cards.length).padStart(2, '0');
    if (fl.n.textContent !== n) fl.n.textContent = n;
    fl.bar.style.width = ((best + 1) / fl.cards.length * 100).toFixed(1) + '%';
  }

  /* ---------------- boot ---------------- */

  function loop() {
    try { drawBA(); drawFlow(); } catch (e) {}
    requestAnimationFrame(loop);
  }

  // the page renders more than once while it boots, so rebuild anything that got swapped out
  setInterval(function () {
    var prev = document.querySelector('button[aria-label="Previous frame"]');
    if (ba && (!ba.wrap.isConnected || (prev && !prev.parentElement.parentElement.classList.contains('kfx-ba-hide')))) {
      if (ba.wrap.parentNode) ba.wrap.parentNode.removeChild(ba.wrap);
      ba = null; try { buildBA(); } catch (e) {}
    }
    if (fl && (!fl.wrap.isConnected || !document.querySelector('[data-orb-stage].kfx-orb-hide'))) {
      if (fl.wrap.parentNode) fl.wrap.parentNode.removeChild(fl.wrap);
      fl = null; try { buildFlow(); } catch (e) {}
    }
  }, 400);

  var tries = 0;
  (function boot() {
    var okA = ba, okB = fl;
    try { okA = okA || buildBA(); } catch (e) { if (window.console) console.error('[kfx] before/after', e); }
    try { okB = okB || buildFlow(); } catch (e) { if (window.console) console.error('[kfx] gallery', e); }
    if ((!okA || !okB) && ++tries < 150) setTimeout(boot, 200);
  })();
  requestAnimationFrame(loop);

  window.addEventListener('resize', function () { if (ba) ba.sig = ''; layout(); }, { passive: true });
})();
