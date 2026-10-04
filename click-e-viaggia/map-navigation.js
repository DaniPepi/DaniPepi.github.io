export function enableMapNavigation(map, camera, selectCountry) {
  const $ = id => document.getElementById(id);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let view = {x:0,y:0,w:1200}, frame = 0, animation = null;
  let moved = false, drag = null, pinch = null;
  const pointers = new Map();
  function constrain(next) {
    const w = Math.max(150,Math.min(1200,next.w)), h = w*620/1200;
    return {w,x:Math.max(0,Math.min(1200-w,next.x)),y:Math.max(0,Math.min(620-h,next.y))};
  }
  function draw() {
    const scale = 1200/view.w;
    camera.setAttribute('transform',`matrix(${scale} 0 0 ${scale} ${-view.x*scale} ${-view.y*scale})`);
    $('zoom-level').textContent = `${Math.round(scale*100)}%`;
  }
  function render(time) {
    frame = 0;
    if (animation) {
      const t = Math.min(1,(time-animation.start)/220), eased = 1-Math.pow(1-t,3);
      view = constrain({x:animation.from.x+(animation.to.x-animation.from.x)*eased,y:animation.from.y+(animation.to.y-animation.from.y)*eased,w:animation.from.w+(animation.to.w-animation.from.w)*eased});
      if (t === 1) animation = null;
    }
    draw();
    if (animation) schedule(); else if (!pointers.size) map.classList.remove('is-navigating');
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(render); }
  function setView(next, animate = false) {
    const target = constrain(next);
    if (animate && !reducedMotion.matches) {
      animation = {from:{...view},to:target,start:performance.now()}; map.classList.add('is-navigating');
    } else { animation = null; view = target; }
    schedule();
  }
  function point(x,y) { return new DOMPoint(x,y).matrixTransform(map.getScreenCTM().inverse()); }
  function zoom(factor, anchor = {x:600,y:310}, animate = true) {
    const width = Math.max(150,Math.min(1200,(animation?.to.w || view.w)*factor));
    const world = {x:view.x+anchor.x*view.w/1200,y:view.y+anchor.y*view.w/1200};
    setView({w:width,x:world.x-anchor.x*width/1200,y:world.y-anchor.y*width/1200},animate);
  }
  $('zoom-in').onclick = () => zoom(.7);
  $('zoom-out').onclick = () => zoom(1/.7);
  $('zoom-reset').onclick = () => setView({x:0,y:0,w:1200},true);
  map.addEventListener('wheel',event => {
    if (!event.ctrlKey && !document.fullscreenElement) return;
    event.preventDefault();
    zoom(Math.exp(Math.max(-120,Math.min(120,event.deltaY))*.003),point(event.clientX,event.clientY),false);
  },{passive:false});
  function startDrag(pointer) { drag = {...point(pointer.x,pointer.y),clientX:pointer.x,clientY:pointer.y,view:{...view}}; }
  function startPinch() {
    moved = true;
    const [a,b] = [...pointers.values()], center = point((a.x+b.x)/2,(a.y+b.y)/2);
    pinch = {distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),width:view.w,world:{x:view.x+center.x*view.w/1200,y:view.y+center.y*view.w/1200}};
  }
  map.addEventListener('pointerdown',event => {
    if (event.button !== 0) return;
    animation = null;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    map.setPointerCapture(event.pointerId);
    if (pointers.size === 1) { moved = false; startDrag(pointers.get(event.pointerId)); }
    if (pointers.size === 2) startPinch();
  });
  map.addEventListener('pointermove',event => {
    if (!pointers.has(event.pointerId)) return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if (pointers.size > 1 && pinch) {
      const [a,b] = [...pointers.values()], center = point((a.x+b.x)/2,(a.y+b.y)/2);
      const width = Math.max(150,Math.min(1200,pinch.width*pinch.distance/Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))));
      setView({w:width,x:pinch.world.x-center.x*width/1200,y:pinch.world.y-center.y*width/1200});
      map.classList.add('is-navigating'); return;
    }
    if (!drag) return;
    const current = point(event.clientX,event.clientY), dx = current.x-drag.x, dy = current.y-drag.y;
    if (Math.hypot(event.clientX-drag.clientX,event.clientY-drag.clientY)>6) moved = true;
    if (moved) { setView({w:view.w,x:drag.view.x-dx*drag.view.w/1200,y:drag.view.y-dy*drag.view.w/1200}); map.classList.add('is-navigating'); }
  });
  function endPointer(event, cancelled = false) {
    if (!pointers.has(event.pointerId)) return;
    pointers.delete(event.pointerId);
    if (map.hasPointerCapture(event.pointerId)) map.releasePointerCapture(event.pointerId);
    if (pointers.size >= 2) { startPinch(); return; }
    if (pointers.size) { pinch = null; startDrag([...pointers.values()][0]); return; }
    drag = pinch = null; map.classList.remove('is-navigating');
    if (!moved && !cancelled) {
      const target = document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-code]');
      if (target && map.contains(target)) selectCountry(target.dataset.code);
    }
  }
  map.addEventListener('pointerup',event => endPointer(event));
  map.addEventListener('pointercancel',event => endPointer(event,true));
  map.addEventListener('lostpointercapture',event => { if (pointers.has(event.pointerId)) endPointer(event,true); });
  map.addEventListener('keydown',event => {
    if (event.target !== map) return;
    const offsets={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    if (offsets[event.key]) { event.preventDefault();setView({w:view.w,x:view.x+offsets[event.key][0]*view.w*.1,y:view.y+offsets[event.key][1]*view.w*.1},true); }
    if (['+','=','-'].includes(event.key)) { event.preventDefault(); zoom(event.key==='-'?1/.7:.7); }
  });
  const stage = $('atlas-stage'), fullscreen = $('map-fullscreen');
  if (!stage.requestFullscreen) fullscreen.hidden = true;
  fullscreen.onclick = async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await stage.requestFullscreen(); }
    catch { $('map-help').textContent = 'Schermo intero non disponibile in questo browser. Puoi usare i controlli di zoom.'; }
  };
  document.addEventListener('fullscreenchange',()=>{
    fullscreen.textContent = document.fullscreenElement ? 'Esci da schermo intero' : 'Schermo intero';
    fullscreen.setAttribute('aria-pressed',String(Boolean(document.fullscreenElement)));
  });
  reducedMotion.addEventListener('change',()=>{if(animation){view=animation.to;animation=null;schedule();}});
  draw();
}

