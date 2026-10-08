/* Local decorative canvas. Pointer values stay in memory; no network requests. */
(() => {
  'use strict';
  const canvas = document.querySelector('#carbon-curtain');
  const hero = canvas?.closest('.hero');
  if (!canvas || !hero) return;
  const context = canvas.getContext('2d', {alpha: false});
  if (!context) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let width = 1, height = 1, scale = 1, frame = 0, lastDraw = 0, phase = 0;
  let inView = true, modalOpen = false, drawCount = 0;
  const pointer = {x: .5, y: .5, strength: 0, targetX: .5, targetY: .5, targetStrength: 0};
  const texture = document.createElement('canvas');
  texture.width = texture.height = 12;
  const weave = texture.getContext('2d');
  let pattern = null;
  if (weave) {
    weave.strokeStyle = 'rgba(213,224,233,.17)'; weave.lineWidth = 1;
    weave.beginPath(); weave.moveTo(-3, 3); weave.lineTo(3, -3); weave.moveTo(0, 12); weave.lineTo(12, 0); weave.moveTo(9, 15); weave.lineTo(15, 9); weave.stroke();
    weave.strokeStyle = 'rgba(0,0,0,.48)'; weave.lineWidth = 2;
    weave.beginPath(); weave.moveTo(0, 0); weave.lineTo(12, 12); weave.moveTo(-6, 6); weave.lineTo(6, 18); weave.moveTo(6, -6); weave.lineTo(18, 6); weave.stroke();
    pattern = context.createPattern(texture, 'repeat');
  }
  function position(x, y, time) {
    const anchor = Math.sin(y * Math.PI * .94);
    const drift = Math.sin(x * 11 + y * 3.2 + time * .17) * width * .0075;
    const dx = x - pointer.x, dy = y - pointer.y;
    const reach = Math.exp(-(dx * dx / .055 + dy * dy / .3));
    const push = (dx * width * .19 + Math.sin(y * 5.5 + time * .2) * width * .012) * reach * pointer.strength;
    return x * width + (drift + push) * anchor;
  }
  function draw() {
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.fillStyle = '#0a0c0f'; context.fillRect(0, 0, width, height);
    const count = Math.max(10, Math.min(22, Math.round(width / 86)));
    const gap = 1 / count, steps = 22;
    for (let i = -1; i <= count; i++) {
      const left = i * gap, right = left + gap;
      const start = position(left, .5, phase), end = position(right, .5, phase);
      const material = context.createLinearGradient(start, 0, Math.max(start + 1, end), 0);
      material.addColorStop(0, '#07090c');
      material.addColorStop(.12, '#101318');
      material.addColorStop(.36, '#292f36');
      material.addColorStop(.49, '#464f58');
      material.addColorStop(.57, '#353e47');
      material.addColorStop(.72, '#171c22');
      material.addColorStop(.94, '#080a0d');
      material.addColorStop(1, '#07090c');
      context.beginPath();
      context.moveTo(position(left, 0, phase), 0);
      for (let j = 1; j <= steps; j++) context.lineTo(position(left, j / steps, phase), height * j / steps);
      for (let j = steps; j >= 0; j--) context.lineTo(position(right, j / steps, phase) + 1, height * j / steps);
      context.closePath(); context.fillStyle = material; context.fill();
      context.beginPath();
      for (let j = 0; j <= steps; j++) {
        const x = position(left + gap * .49, j / steps, phase), y = height * j / steps;
        if (j === 0) context.moveTo(x, y); else context.lineTo(x, y);
      }
      context.strokeStyle = 'rgba(212,225,235,.065)'; context.lineWidth = .65; context.stroke();
    }
    if (pattern) { context.fillStyle = pattern; context.globalAlpha = .42; context.fillRect(0, 0, width, height); context.globalAlpha = 1; }
    canvas.dataset.frame = String(++drawCount);
    canvas.parentElement.classList.add('is-ready');
  }
  function canAnimate() { return !reduced.matches && inView && !document.hidden && !modalOpen; }
  function setState() {
    canvas.dataset.motion = reduced.matches ? 'static' : !canAnimate() ? 'paused' : pointer.targetStrength ? 'interactive' : pointer.strength > .015 ? 'settling' : 'ambient';
  }
  function tick(now) {
    frame = 0;
    if (!canAnimate()) { setState(); return; }
    if (now - lastDraw >= 1000 / 30) {
      const delta = Math.min(64, lastDraw ? now - lastDraw : 34);
      lastDraw = now; phase += delta / 1000;
      const ease = 1 - Math.exp(-delta / 150);
      pointer.x += (pointer.targetX - pointer.x) * ease;
      pointer.y += (pointer.targetY - pointer.y) * ease;
      pointer.strength += (pointer.targetStrength - pointer.strength) * ease;
      setState(); draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function synchronize() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; lastDraw = 0;
    if (reduced.matches) { pointer.strength = pointer.targetStrength = 0; phase = 0; draw(); }
    setState();
    if (canAnimate()) frame = requestAnimationFrame(tick);
  }
  function resize() {
    const bounds = hero.getBoundingClientRect();
    width = Math.max(1, Math.round(bounds.width)); height = Math.max(1, Math.round(bounds.height));
    scale = Math.min(devicePixelRatio || 1, 2, 2400 / width, Math.sqrt(2800000 / (width * height)));
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    draw(); synchronize();
  }
  hero.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !finePointer.matches || reduced.matches) return;
    const bounds = hero.getBoundingClientRect();
    pointer.targetX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    pointer.targetY = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    pointer.targetStrength = 1;
  }, {passive: true});
  hero.addEventListener('pointerleave', () => { pointer.targetStrength = 0; }, {passive: true});
  hero.addEventListener('pointercancel', () => { pointer.targetStrength = 0; }, {passive: true});
  reduced.addEventListener('change', synchronize);
  document.addEventListener('visibilitychange', synchronize);
  const visibility = new IntersectionObserver(entries => { inView = entries[0].isIntersecting; synchronize(); }, {threshold: 0});
  visibility.observe(hero);
  const modals = new MutationObserver(() => {
    const next = Boolean(document.querySelector('dialog:modal'));
    if (next !== modalOpen) { modalOpen = next; synchronize(); }
  });
  modals.observe(document.body, {subtree: true, attributes: true, attributeFilter: ['open']});
  const size = new ResizeObserver(resize); size.observe(hero);
  resize();
  window.addEventListener('pagehide', () => { if (frame) cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener('pageshow', synchronize);
})();
