"use strict";

(() => {
 const exhibit=document.getElementById("lab-exhibit");
 const viewport=document.getElementById("lab-viewport");
 const canvas=document.getElementById("lab-canvas");
 const status=document.getElementById("lab-scene-status");
 const reset=document.getElementById("lab-reset");
 const tooltip=document.getElementById("lab-tooltip");
 const reduced=matchMedia("(prefers-reduced-motion: reduce)");
 const fine=matchMedia("(hover: hover) and (pointer: fine)");
 let destroy=null;
 let alive=true;

 function fallback() {
   exhibit.classList.remove("scene-ready");
   reset.hidden=true;tooltip.hidden=true;
   viewport.tabIndex=-1;
   status.textContent="静态预览 · 选择下方入口继续";
 }
 function stop() {
   destroy?.();destroy=null;fallback();
 }
 window.addEventListener("pagehide",()=>{alive=false;stop()});
 window.addEventListener("pageshow",event=>{if(event.persisted)location.reload()});
 reduced.addEventListener("change",()=>{if(reduced.matches)stop();else if(!destroy){alive=true;boot()}});

 async function boot(){
   if(reduced.matches || navigator.connection?.saveData){fallback();return;}
   status.textContent="正在布置实验台…";
   let renderer;
   try{
    const [T,{buildLab},{RoomEnvironment}]=await Promise.all([
     import("./vendor/three/three.module.min.js"),
     import("./lab-model.js?v=studio6"),
     import("./vendor/three/RoomEnvironment.js")
    ]);
    if(!alive || reduced.matches)return;
    renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:"low-power"});
    renderer.setPixelRatio(Math.min(devicePixelRatio,fine.matches?1.6:1.25));
    renderer.setClearColor(0xe7ecdc,0);
    renderer.outputColorSpace=T.SRGBColorSpace;
    renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.98;
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
    const scene=new T.Scene();
    const environment=new RoomEnvironment();
    const pmrem=new T.PMREMGenerator(renderer);
    const envMap=pmrem.fromScene(environment,.06);
    scene.environment=envMap.texture;scene.environmentIntensity=.7;
    environment.dispose();pmrem.dispose();
    const camera=new T.OrthographicCamera(-4,4,3.3,-3.3,.1,60);
    camera.position.set(7.7,7.1,10);camera.lookAt(0,1.20,0);
    scene.add(new T.HemisphereLight(0xf9f9e6,0x69795c,2.0));
    const key=new T.DirectionalLight(0xfff5df,3.4);key.position.set(-3.5,7,5);
    key.castShadow=true;key.shadow.mapSize.set(1536,1536);
    Object.assign(key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:22});
    key.shadow.bias=-.0003;key.shadow.normalBias=.015;key.shadow.radius=4;scene.add(key);
    const fill=new T.DirectionalLight(0xb8d8ac,1.4);fill.position.set(4,3,-3);scene.add(fill);
    const {root,targets,materials}=buildLab();scene.add(root);
    const shadow=new T.Mesh(new T.PlaneGeometry(25,25),new T.ShadowMaterial({opacity:.17}));
    shadow.name="Ground contact shadow";shadow.rotation.x=-Math.PI/2;shadow.position.y=-.087;shadow.receiveShadow=true;scene.add(shadow);

    let disposed=false,frame=0,visible=true,active=null;
    let yaw=-.12,pitch=0,targetYaw=yaw,targetPitch=0,hoverYaw=0,hoverPitch=0;
    let down=null,lastX=0,lastY=0,dragged=false,visibleGeometry=[];
    const raycaster=new T.Raycaster(),pointer=new T.Vector2();
    const initialYaw=-.12;
    root.rotation.y=yaw;
    let renderCount=0;
    function draw(){
      frame=0;if(disposed || !visible || document.hidden)return;
      yaw+=(targetYaw+hoverYaw-yaw)*.16;pitch+=(targetPitch+hoverPitch-pitch)*.16;
      root.rotation.set(pitch,yaw,0);renderer.render(scene,camera);renderCount++;viewport.dataset.frames=renderCount;
      viewport.dataset.yaw=yaw.toFixed(4);
      if(renderCount===1){
        viewport.dataset.triangles=renderer.info.render.triangles;
        viewport.dataset.calls=renderer.info.render.calls;
        viewport.dataset.parts=root.userData.metrics.parts;
      }
      const moving=Math.abs(targetYaw+hoverYaw-yaw)+Math.abs(targetPitch+hoverPitch-pitch)>.0002;viewport.dataset.pose=moving?"moving":"settled";if(moving)schedule();
    }
    function schedule(){if(!frame && !disposed && visible && !document.hidden)frame=requestAnimationFrame(draw);}
    function resize(){
      const {width,height}=viewport.getBoundingClientRect();
      if(width===0 || height===0)return;
      const aspect=width/height;
      const half=Math.max(3.60,5.3/aspect);
      camera.left=-half*aspect;camera.right=half*aspect;camera.top=half;camera.bottom=-half;camera.updateProjectionMatrix();
      renderer.setSize(width,height,false);schedule();
    }
    function hit(event){
      const r=canvas.getBoundingClientRect();
      pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);
      raycaster.setFromCamera(pointer,camera);
      const intersection=raycaster.intersectObjects(targets,true)[0];
      if(!intersection)return null;
      let node=intersection.object;
      while(node && !node.userData.href)node=node.parent;
      return node || null;
    }
    function accent(next){
      if(active===next)return;
      if(active)active.userData.light.intensity=0;
      active=next;
      if(active)active.userData.light.intensity=.5;
      tooltip.hidden=!active;
      if(active)tooltip.textContent=active.userData.label+" · 点击进入";
      schedule();
    }
    function move(event){
      if(disposed)return;
      if(down && event.pointerId===down.id){
       const dx=event.clientX-lastX,dy=event.clientY-lastY;
       lastX=event.clientX;lastY=event.clientY;
       const travel=Math.hypot(event.clientX-down.x,event.clientY-down.y);
       if(travel>6){
        if(event.pointerType==="touch" && !dragged && Math.abs(event.clientY-down.y)>Math.abs(event.clientX-down.x)*1.15){down=null;return;}
        dragged=true;viewport.classList.add("is-dragging");
        if(!viewport.hasPointerCapture(event.pointerId))viewport.setPointerCapture(event.pointerId);
        targetYaw=Math.max(-1.6,Math.min(1.6,targetYaw+dx*.006));
        targetPitch=Math.max(-.13,Math.min(.18,targetPitch+dy*.003));
        hoverYaw=hoverPitch=0;accent(null);schedule();
       }
       return;
      }
      if(!fine.matches || event.pointerType!=="mouse")return;
      const rect=viewport.getBoundingClientRect();
      hoverYaw=((event.clientX-rect.left)/rect.width-.5)*.15;
      hoverPitch=((event.clientY-rect.top)/rect.height-.5)*.045;
      const item=hit(event);accent(item);
      canvas.style.cursor=item?"pointer":"grab";
      tooltip.style.left=Math.max(12,Math.min(event.clientX-rect.left+12,rect.width-160))+"px";
      tooltip.style.top=Math.max(12,Math.min(event.clientY-rect.top+15,rect.height-44))+"px";
      schedule();
    }
    function pointerDown(event){
      if(event.button!==0)return;
      down={id:event.pointerId,x:event.clientX,y:event.clientY};lastX=event.clientX;lastY=event.clientY;dragged=false;
    }
    function pointerUp(event){
      if(!down || event.pointerId!==down.id)return;
      const shouldNavigate=!dragged && Math.hypot(event.clientX-down.x,event.clientY-down.y)<6;
      if(viewport.hasPointerCapture(event.pointerId))viewport.releasePointerCapture(event.pointerId);
      down=null;viewport.classList.remove("is-dragging");
      if(shouldNavigate){const item=hit(event);if(item)location.assign(item.userData.href);}
      dragged=false;schedule();
    }
    function leave(){
      hoverYaw=hoverPitch=0;
      if(!down)accent(null);schedule();
    }
    function cancel(){down=null;dragged=false;viewport.classList.remove("is-dragging");leave();}
    function restore(){targetYaw=initialYaw;targetPitch=hoverYaw=hoverPitch=0;accent(null);schedule();}
    function keydown(event){
      if(!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","r","R","Home"].includes(event.key))return;
      event.preventDefault();
      if(event.key==="r" || event.key==="R" || event.key==="Home"){restore();return;}
      if(event.key==="ArrowLeft")targetYaw-=.15;if(event.key==="ArrowRight")targetYaw+=.15;
      if(event.key==="ArrowUp")targetPitch-=.04;if(event.key==="ArrowDown")targetPitch+=.04;
      targetYaw=Math.max(-1.6,Math.min(1.6,targetYaw));targetPitch=Math.max(-.13,Math.min(.18,targetPitch));
      hoverYaw=hoverPitch=0;accent(null);schedule();
    }
    function contextLost(event){event.preventDefault();stop();}
    const handlers=[["pointermove",move],["pointerdown",pointerDown],["pointerup",pointerUp],["pointerleave",leave],["pointercancel",cancel],["keydown",keydown]];
    for(const [name,handler]of handlers)viewport.addEventListener(name,handler,{passive:name!=="keydown"});
    reset.addEventListener("click",restore);
    canvas.addEventListener("webglcontextlost",contextLost,false);
    const sizeObserver=new ResizeObserver(resize);sizeObserver.observe(viewport);
    const viewObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)schedule();else if(frame){cancelAnimationFrame(frame);frame=0;}},{threshold:.01});viewObserver.observe(viewport);
    const visibility=()=>{if(!document.hidden)schedule();else if(frame){cancelAnimationFrame(frame);frame=0;}};
    document.addEventListener("visibilitychange",visibility);
    destroy=()=>{
      if(disposed)return;disposed=true;
      if(frame)cancelAnimationFrame(frame);
      sizeObserver.disconnect();viewObserver.disconnect();document.removeEventListener("visibilitychange",visibility);
      reset.removeEventListener("click",restore);canvas.removeEventListener("webglcontextlost",contextLost);
      for(const [name,handler]of handlers)viewport.removeEventListener(name,handler);
      const geometries=new Set(),mats=new Set(),textures=new Set();
      scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);const m=object.material;if(m)(Array.isArray(m)?m:[m]).forEach(v=>mats.add(v));});
      for(const m of mats){for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}
      geometries.forEach(g=>g.dispose());textures.forEach(t=>t.dispose());envMap.dispose();renderer.dispose();
    };
    resize();renderer.render(scene,camera);
    exhibit.classList.add("scene-ready");
    viewport.dataset.renderer="webgl";viewport.tabIndex=0;
    reset.hidden=false;
    status.textContent=fine.matches?"拖动旋转 · 点击设备探索":"左右轻拖旋转 · 点击设备探索";
    schedule();
   }catch(error){renderer?.dispose();fallback();}
 }
 boot();
})();


// Pointer light and gentle physical response on the home navigation.
(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');
const main=document.querySelector('.portal-home');if(!main)return;
main.addEventListener('pointermove',e=>{if(media.matches||e.pointerType!=='mouse')return;const r=main.getBoundingClientRect();main.style.setProperty('--glow-x',(e.clientX-r.left)+'px');main.style.setProperty('--glow-y',(e.clientY-r.top)+'px')},{passive:true});
for(const card of document.querySelectorAll('.explore-card')){
card.addEventListener('pointermove',e=>{if(media.matches||e.pointerType!=='mouse')return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--px',(x*100)+'%');card.style.setProperty('--py',(y*100)+'%');card.style.transform=`perspective(900px) rotateX(${(0.5-y)*5}deg) rotateY(${(x-.5)*5}deg) translateY(-3px)`},{passive:true});
card.addEventListener('pointerleave',()=>{card.style.transform=''});
}media.addEventListener('change',()=>{for(const c of document.querySelectorAll('.explore-card'))c.style.transform=''});
})();
