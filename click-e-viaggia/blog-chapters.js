'use strict';
(() => {
 const motion=matchMedia('(prefers-reduced-motion: reduce)'),pointer=matchMedia('(hover: hover) and (pointer: fine)');
 document.querySelectorAll('.chapter-cover').forEach(card=>{let frame=0,point=null;const reset=()=>{cancelAnimationFrame(frame);frame=0;point=null;card.style.removeProperty('--chapter-x');card.style.removeProperty('--chapter-y');};
 card.addEventListener('pointermove',event=>{if(motion.matches||!pointer.matches||event.pointerType!=='mouse')return;point={x:event.clientX,y:event.clientY};if(frame)return;frame=requestAnimationFrame(()=>{frame=0;const b=card.getBoundingClientRect();const x=Math.max(-1,Math.min(1,(point.x-b.left)/b.width*2-1)),y=Math.max(-1,Math.min(1,(point.y-b.top)/b.height*2-1));card.style.setProperty('--chapter-x',(-y*2)+'deg');card.style.setProperty('--chapter-y',(x*3)+'deg');});},{passive:true});card.addEventListener('pointerleave',reset);card.addEventListener('pointercancel',reset);motion.addEventListener('change',reset);});
})();
