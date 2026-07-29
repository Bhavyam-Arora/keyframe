/* ============================================================
   WAITLIST — ambient node field.
   A calm, permanent cousin of the main site's hero-dissolve
   "settled" state: no image to reconstruct here, just a sparse,
   low-opacity constellation of dots that roam gently in place,
   edge-to-edge across the full viewport, with faint threads
   linking nearby ones. No borders, no start, no end — it just
   drifts, forever, behind the page.
   ============================================================ */
window.KF_NODES = (function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4;

  let cv, ctx, W = 0, H = 0, dpr = 1, raf = 0;
  let pts = [], links = [];

  function readColor(name, fb) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    const hex = v.match(/#([0-9a-f]{6})/i);
    if (hex) return [parseInt(hex[1].slice(0,2),16), parseInt(hex[1].slice(2,4),16), parseInt(hex[1].slice(4,6),16)];
    const p = v.split(",").map(s => parseFloat(s));
    return (p.length === 3 && p.every(n => !isNaN(n))) ? p : fb;
  }

  /* stratified placement so coverage stays even edge-to-edge — never
     clumped, never empty in a corner. */
  function build() {
    const count = lowPower ? 32 : 52;
    pts = [];
    const cols = Math.max(1, Math.round(Math.sqrt(count * W / H)));
    const rows = Math.max(1, Math.ceil(count / cols));
    const cw = W / cols, ch = H / rows;
    let i = 0;
    for (let r = 0; r < rows && i < count; r++) {
      for (let c = 0; c < cols && i < count; c++) {
        const x = cw * (c + 0.22 + Math.random() * 0.56);
        const y = ch * (r + 0.22 + Math.random() * 0.56);
        pts.push({
          hx: x, hy: y, x, y,
          r: 0.7 + Math.random() * 1.0,
          base: 0.20 + Math.random() * 0.26,
          px: Math.random() * 6.28, py: Math.random() * 6.28,
          ps: 0.05 + Math.random() * 0.14,
          amp: 10 + Math.random() * 24,
          tw: Math.random() * 6.28, tws: 0.22 + Math.random() * 0.36
        });
        i++;
      }
    }
    // sparse, stable network — each point reaches for its 1-2 nearest
    // neighbours only, so the field reads as scattered nodes, not a mesh.
    links = [];
    const maxD = Math.min(W, H) * 0.17;
    for (let a = 0; a < pts.length; a++) {
      let best = -1, bestD = Infinity, second = -1, secondD = Infinity;
      for (let b = 0; b < pts.length; b++) {
        if (a === b) continue;
        const dx = pts[a].hx - pts[b].hx, dy = pts[a].hy - pts[b].hy;
        const d = dx * dx + dy * dy;
        if (d < bestD) { second = best; secondD = bestD; best = b; bestD = d; }
        else if (d < secondD) { second = b; secondD = d; }
      }
      if (best >= 0 && bestD < maxD * maxD) links.push([a, best]);
      if (second >= 0 && secondD < maxD * maxD && Math.random() < 0.45) links.push([a, second]);
    }
    const seen = new Set();
    links = links.filter(([a, b]) => {
      const k = a < b ? a + "-" + b : b + "-" + a;
      if (seen.has(k)) return false;
      seen.add(k); return true;
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.width = W + "px"; cv.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function draw(tms) {
    raf = requestAnimationFrame(draw);
    if (document.hidden) return;
    const t = tms * 0.001;
    ctx.clearRect(0, 0, W, H);

    const star = readColor("--star", [175, 150, 255]);
    const royal = readColor("--royal", [109, 59, 224]);

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      if (reduce) continue;
      p.x = p.hx + Math.sin(t * p.ps + p.px) * p.amp;
      p.y = p.hy + Math.cos(t * p.ps * 0.85 + p.py) * p.amp * 0.7;
    }

    ctx.globalCompositeOperation = "lighter";
    ctx.lineWidth = 1;
    const maxD = Math.min(W, H) * 0.2;
    for (let k = 0; k < links.length; k++) {
      const A = pts[links[k][0]], B = pts[links[k][1]];
      const dx = A.x - B.x, dy = A.y - B.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const fade = Math.max(0, 1 - d / maxD);
      if (fade <= 0) continue;
      ctx.strokeStyle = `rgba(${royal[0]},${royal[1]},${royal[2]},${fade * 0.09})`;
      ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
    }

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const tw = reduce ? 1 : (0.75 + 0.25 * Math.sin(t * p.tws + p.tw));
      ctx.fillStyle = `rgba(${star[0]},${star[1]},${star[2]},${p.base * tw})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = "source-over";
  }

  function init(id) {
    cv = document.getElementById(id);
    if (!cv) return;
    ctx = cv.getContext("2d");
    resize();
    window.addEventListener("resize", () => { clearTimeout(init._r); init._r = setTimeout(resize, 160); });
    raf = requestAnimationFrame(draw);
  }

  return { init };
})();
