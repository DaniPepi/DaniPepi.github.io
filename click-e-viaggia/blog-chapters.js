'use strict';
(() => {
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 document.querySelectorAll('.chapter-deck').forEach(deck=>{
  const track=deck.querySelector('.chapter-covers'),cards=[...track.querySelectorAll('.chapter-cover')],n=cards.length;
  if(n<2)return;
  let position=0,target=null,frame=0,last=0,visible=false,drag=null,suppress=0,focused=false;
  const step=()=>Math.min(440,Math.max(280,track.clientWidth*.44))*.67;
  function paint(){cards.forEach((card,i)=>{let d=((i-position+n/2)%n+n)%n-n/2;card.style.setProperty('--card-offset',(d*step())+'px');card.style.setProperty('--card-scale',Math.max(.73,1-Math.abs(d)*.105));card.style.setProperty('--card-turn',(d*-5)+'deg');card.style.zIndex=String(100-Math.round(Math.abs(d)*10));const shown=Math.abs(d)<2.65;card.style.visibility=shown?'visible':'hidden';card.setAttribute('aria-hidden',String(!shown));card.tabIndex=shown?0:-1;});}
  function tick(time){const delta=last?Math.min(time-last,50):0;last=time;if(visible&&!document.hidden&&!drag&&!focused){if(target!==null){position+=(target-position)*Math.min(1,delta*.009);if(Math.abs(target-position)<.005){position=target;target=null;}}else if(!reduced.matches)position+=delta*.000115;paint();}frame=requestAnimationFrame(tick);}
  deck.classList.add('deck-ready');paint();frame=requestAnimationFrame(tick);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;last=0;},{threshold:.1}).observe(deck);
  function advance(direction){target=Math.round(position)+direction;focused=false;}
  deck.querySelector('[data-chapter-prev]').addEventListener('click',()=>advance(-1));deck.querySelector('[data-chapter-next]').addEventListener('click',()=>advance(1));
  track.addEventListener('pointerdown',event=>{if(event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:position,moved:false};target=null;});
  track.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;if(!drag.moved&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){drag=null;return;}if(Math.abs(dx)>8){drag.moved=true;if(!track.hasPointerCapture(event.pointerId))track.setPointerCapture(event.pointerId);position=drag.start-dx/step();paint();}});
  function release(event){if(!drag||event.pointerId!==drag.id)return;if(drag.moved){suppress=performance.now()+400;target=Math.round(position);}if(track.hasPointerCapture(event.pointerId))track.releasePointerCapture(event.pointerId);drag=null;}
  track.addEventListener('pointerup',release);track.addEventListener('pointercancel',release);track.addEventListener('click',event=>{if(performance.now()<suppress){event.preventDefault();event.stopImmediatePropagation();}},true);track.addEventListener('dragstart',event=>event.preventDefault());
  track.addEventListener('focusin',()=>{focused=true;});track.addEventListener('focusout',()=>{focused=false;last=0;});
  deck.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();advance(event.key==='ArrowRight'?1:-1);}});
  window.addEventListener('resize',paint);reduced.addEventListener('change',()=>{target=Math.round(position);});
 });
})();
