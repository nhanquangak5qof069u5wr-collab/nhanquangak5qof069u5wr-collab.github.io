"use strict";
(() => {
  // Redraw only after interaction or resize; there is no idle animation loop.
  const layer = document.createElement("div");
  layer.className = "site-atmosphere"; layer.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas"); layer.append(canvas); document.body.prepend(layer);
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  let width=0,height=0,frame=0,point=null;
  function draw(){
    frame=0;ctx.clearRect(0,0,width,height);
    const nodes=Array.from({length:Math.min(46,Math.floor(width/24))},(_,i)=>({x:((i*257+83)%997)/997*width,y:((i*181+41)%719)/719*height}));
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i],near=point&&Math.hypot(a.x-point.x,a.y-point.y)<240;
      for(let j=i+1;j<nodes.length;j++){
        const b=nodes[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d>170)continue;
        ctx.strokeStyle=near?"rgba(38,121,112,.26)":"rgba(72,111,95,.075)";ctx.lineWidth=near?1.3:.7;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      }
      ctx.fillStyle=near?"rgba(39,123,115,.68)":"rgba(78,115,91,.23)";ctx.fillRect(a.x-2,a.y-2,near?5:3,near?5:3);
    }
    if(point){const g=ctx.createRadialGradient(point.x,point.y,0,point.x,point.y,210);g.addColorStop(0,"rgba(85,163,151,.13)");g.addColorStop(1,"rgba(85,163,151,0)");ctx.fillStyle=g;ctx.fillRect(0,0,width,height);}
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  function resize(){width=innerWidth;height=innerHeight;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);schedule();}
  document.addEventListener("pointermove",event=>{if(!fine.matches||reduced.matches||event.pointerType!=="mouse")return;point={x:event.clientX,y:event.clientY};schedule();},{passive:true});
  document.documentElement.addEventListener("pointerleave",()=>{point=null;schedule();});
  window.addEventListener("resize",resize,{passive:true});
  reduced.addEventListener("change",()=>{point=null;schedule();});
  window.addEventListener("blur",()=>{point=null;schedule();});resize();
})();
