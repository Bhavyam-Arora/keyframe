/* Slim atmosphere — mesh gradient + top key light + L/R light leaks.
   NO star/dot layer: the only dots on the site are the camera's remains
   (drawn by hero-dissolve.js). */
window.KF_ATMO = (function () {
  "use strict";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cv, ctx, W, H, dpr, t0 = performance.now(), raf = 0;
  function v(n, fb) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || fb; }
  function rgb(n, fb) { const m = v(n, fb).match(/#([0-9a-f]{6})/i); return m ? [parseInt(m[1].slice(0,2),16),parseInt(m[1].slice(2,4),16),parseInt(m[1].slice(4,6),16)] : fb; }
  function resize() { dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W*dpr; cv.height = H*dpr; cv.style.width = W+"px"; cv.style.height = H+"px"; ctx.setTransform(dpr,0,0,dpr,0,0); }
  function draw() {
    raf = requestAnimationFrame(draw);
    if (document.hidden) return;
    const t = performance.now() - t0;
    const royal = rgb("--royal", [109,59,224]), imperial = rgb("--imperial", [63,43,176]),
          violet = rgb("--abyss-violet", [26,17,69]), orchid = rgb("--orchid", [155,107,255]),
          leak = (v("--leak-warm","217,192,137").split(",").map(Number));
    ctx.clearRect(0,0,W,H);
    const slow = reduce ? 0 : t;
    // mesh gradient base
    const blobs = [
      { x:W*(0.26+0.05*Math.sin(slow*0.000113)), y:H*(0.30+0.05*Math.cos(slow*0.000151)), c:royal, a:0.085, r:0.72 },
      { x:W*(0.78+0.05*Math.cos(slow*0.000097)), y:H*(0.42+0.06*Math.sin(slow*0.000131)), c:imperial, a:0.075, r:0.80 },
      { x:W*(0.54+0.06*Math.sin(slow*0.000079+1.2)), y:H*(0.82+0.05*Math.cos(slow*0.000109+0.6)), c:violet, a:0.10, r:0.86 }
    ];
    blobs.forEach(b => { const g = ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,Math.max(W,H)*b.r);
      g.addColorStop(0,`rgba(${b.c[0]},${b.c[1]},${b.c[2]},${b.a})`); g.addColorStop(0.5,`rgba(${b.c[0]},${b.c[1]},${b.c[2]},${b.a*0.32})`); g.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H); });
    // top key light
    const ki = 0.32 * (reduce?1:(0.88+0.12*Math.sin(t*0.0004)));
    const kg = ctx.createRadialGradient(W*0.5,-H*0.14,0,W*0.5,-H*0.14,H*1.25);
    kg.addColorStop(0,`rgba(${royal[0]},${royal[1]},${royal[2]},${ki})`); kg.addColorStop(0.3,`rgba(${royal[0]},${royal[1]},${royal[2]},${ki*0.5})`); kg.addColorStop(0.62,`rgba(${royal[0]},${royal[1]},${royal[2]},${ki*0.16})`); kg.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle = kg; ctx.fillRect(0,0,W,H);
    // L/R leaks (additive, breathing)
    const b1 = reduce?0.85:(0.7+0.3*(0.5+0.5*Math.sin(t*0.0006))), b2 = reduce?0.85:(0.7+0.3*(0.5+0.5*Math.sin(t*0.0006+2.1)));
    ctx.globalCompositeOperation = "lighter";
    let L = ctx.createRadialGradient(-W*0.04,H*0.40,0,-W*0.04,H*0.40,W*0.5);
    L.addColorStop(0,`rgba(${orchid[0]},${orchid[1]},${orchid[2]},${0.30*b1})`); L.addColorStop(0.32,`rgba(${royal[0]},${royal[1]},${royal[2]},${0.12*b1})`); L.addColorStop(0.7,`rgba(${royal[0]},${royal[1]},${royal[2]},${0.03*b1})`); L.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle = L; ctx.fillRect(0,0,W,H);
    let R = ctx.createRadialGradient(W*1.04,H*0.60,0,W*1.04,H*0.60,W*0.5);
    R.addColorStop(0,`rgba(${leak[0]},${leak[1]},${leak[2]},${0.20*b2})`); R.addColorStop(0.34,`rgba(${leak[0]},${leak[1]},${leak[2]},${0.07*b2})`); R.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle = R; ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation = "source-over";
  }
  function init(id) { cv = document.getElementById(id); ctx = cv.getContext("2d"); resize(); addEventListener("resize", resize); draw(); }
  return { init };
})();
